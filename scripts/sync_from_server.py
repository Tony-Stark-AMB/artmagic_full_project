#!/usr/bin/env python3
"""Скопировать базу ArtMagic и изображения товаров.

База на сервере — SQLite (db.sqlite3). Картинки товаров, категорий
и производителей лежат в media/ и в БД записаны относительными путями
вроде catalog/B_994.jpg.

Два способа:

1. Полная копия с сервера по SSH (база + вся папка media):

     python3 scripts/sync_from_server.py \\
         --ssh user@server \\
         --remote-dir /var/www/artmagic

   Нужен доступ по ключу SSH и rsync на обеих сторонах.
   Текущий db.sqlite3 перед заменой сохраняется как db.sqlite3.bak.<время>.

2. Докачать картинки с публичного сайта по путям из локальной базы
   (база из git уже содержит товары; media в репозиторий не входит):

     python3 scripts/sync_from_server.py --from-site

   По умолчанию сайт https://artmagic.com.ua
   Уже скачанные файлы пропускаются, запуск можно повторять.
"""

from __future__ import annotations

import argparse
import shutil
import sqlite3
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "db.sqlite3"
MEDIA_ROOT = ROOT / "media"
DEFAULT_SITE = "https://artmagic.com.ua"

IMAGE_QUERIES = (
    "SELECT image FROM products_products WHERE image IS NOT NULL AND image != ''",
    "SELECT image FROM products_productimage WHERE image IS NOT NULL AND image != ''",
    "SELECT image FROM products_category WHERE image IS NOT NULL AND image != ''",
    "SELECT image FROM products_manufacturer WHERE image IS NOT NULL AND image != ''",
)

IMAGE_MAGIC = (
    b"\xff\xd8\xff",  # jpeg
    b"\x89PNG",  # png
    b"GIF8",  # gif
    b"RIFF",  # webp
    b"BM",  # bmp
)


def log(message: str) -> None:
    print(message, flush=True)


def backup_database() -> None:
    if not DB_PATH.exists():
        return
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    target = ROOT / f"db.sqlite3.bak.{stamp}"
    shutil.copy2(DB_PATH, target)
    log(f"Локальная база сохранена: {target.name}")


def rsync(source: str, destination: Path) -> None:
    if shutil.which("rsync") is None:
        sys.exit("Не найден rsync. Установите его и повторите запуск.")
    destination.parent.mkdir(parents=True, exist_ok=True)
    command = [
        "rsync",
        "-az",
        "--info=stats2,progress2",
        source,
        str(destination),
    ]
    log(" ".join(command))
    result = subprocess.run(command)
    if result.returncode != 0:
        sys.exit(f"rsync завершился с кодом {result.returncode}")


def pull_over_ssh(ssh: str, remote_dir: str) -> None:
    remote_dir = remote_dir.rstrip("/")
    backup_database()
    log("Копирую db.sqlite3...")
    rsync(f"{ssh}:{remote_dir}/db.sqlite3", DB_PATH)
    log("Копирую media/...")
    MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
    rsync(f"{ssh}:{remote_dir}/media/", MEDIA_ROOT)
    log("Копия с сервера получена.")


def connect() -> sqlite3.Connection:
    if not DB_PATH.exists():
        sys.exit(f"Нет базы {DB_PATH}. Сначала скопируйте её через --ssh.")
    return sqlite3.connect(DB_PATH)


def collect_image_paths(connection: sqlite3.Connection) -> list[str]:
    found: set[str] = set()
    for query in IMAGE_QUERIES:
        for (raw,) in connection.execute(query):
            path = normalize_media_path(raw)
            if path:
                found.add(path)
    return sorted(found)


def normalize_media_path(raw: str) -> str | None:
    value = (raw or "").strip().replace("\\", "/")
    if not value or value.upper() == "NULL":
        return None
    if value.startswith(("http://", "https://")):
        marker = "/media/"
        index = value.find(marker)
        if index == -1:
            return None
        value = value[index + len(marker) :]
    value = value.lstrip("/")
    parts = [part for part in value.split("/") if part not in ("", ".")]
    if not parts or any(part == ".." for part in parts):
        return None
    return "/".join(parts)


def is_image(data: bytes) -> bool:
    return any(data.startswith(magic) for magic in IMAGE_MAGIC)


def download_one(site: str, relative: str, timeout: float) -> str:
    destination = MEDIA_ROOT / relative
    if destination.exists() and destination.stat().st_size > 32:
        return "skip"

    url = site.rstrip("/") + "/media/" + urllib.parse.quote(relative)
    request = urllib.request.Request(url, headers={"User-Agent": "artmagic-sync/1.0"})
    last_error = "пустой ответ"
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                data = response.read()
            if not is_image(data):
                last_error = f"это не картинка ({len(data)} байт)"
                break
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(data)
            return "ok"
        except (urllib.error.URLError, TimeoutError, OSError) as error:
            last_error = str(error)
            time.sleep(0.4 * (attempt + 1))
    return f"fail: {relative} — {last_error}"


def download_from_site(site: str, workers: int, timeout: float) -> None:
    connection = connect()
    try:
        paths = collect_image_paths(connection)
        products = connection.execute("SELECT COUNT(*) FROM products_products").fetchone()[0]
    finally:
        connection.close()

    log(f"Товаров в базе: {products}")
    log(f"Уникальных файлов изображений: {len(paths)}")
    if not paths:
        return

    MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
    ok = skipped = failed = 0
    failures: list[str] = []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(download_one, site, path, timeout) for path in paths]
        for index, future in enumerate(as_completed(futures), start=1):
            result = future.result()
            if result == "ok":
                ok += 1
            elif result == "skip":
                skipped += 1
            else:
                failed += 1
                if len(failures) < 30:
                    failures.append(result)
            if index % 200 == 0 or index == len(paths):
                log(f"{index}/{len(paths)}  скачано {ok}, уже было {skipped}, ошибок {failed}")

    log(f"Готово. Скачано: {ok}, пропущено: {skipped}, ошибок: {failed}")
    for line in failures:
        log(line)
    if failed:
        log("Повторите запуск: уже скачанные файлы будут пропущены.")


def print_summary() -> None:
    connection = connect()
    try:
        products = connection.execute("SELECT COUNT(*) FROM products_products").fetchone()[0]
        with_image = connection.execute(
            "SELECT COUNT(*) FROM products_products WHERE image IS NOT NULL AND image != '' AND upper(image) != 'NULL'"
        ).fetchone()[0]
        paths = collect_image_paths(connection)
    finally:
        connection.close()
    present = sum(1 for path in paths if (MEDIA_ROOT / path).is_file())
    log(f"Товаров: {products}, с картинкой в карточке: {with_image}")
    log(f"Файлов по базе: {len(paths)}, есть локально: {present}, нет: {len(paths) - present}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Копия БД ArtMagic и изображений товаров.")
    parser.add_argument("--ssh", help="user@host для rsync по SSH")
    parser.add_argument("--remote-dir", help="Каталог проекта на сервере, где лежат db.sqlite3 и media/")
    parser.add_argument(
        "--from-site",
        action="store_true",
        help="Скачать недостающие картинки с публичного сайта по путям из локальной базы",
    )
    parser.add_argument("--site", default=DEFAULT_SITE, help=f"Адрес сайта (по умолчанию {DEFAULT_SITE})")
    parser.add_argument("--workers", type=int, default=8, help="Сколько картинок качать параллельно")
    parser.add_argument("--timeout", type=float, default=30, help="Таймаут одного запроса, секунды")
    parser.add_argument("--summary", action="store_true", help="Только показать, сколько товаров и файлов уже на месте")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.summary and not args.ssh and not args.from_site:
        print_summary()
        return
    if bool(args.ssh) != bool(args.remote_dir):
        sys.exit("Для копии по SSH укажите оба параметра: --ssh и --remote-dir.")
    if not args.ssh and not args.from_site and not args.summary:
        sys.exit(
            "Укажите способ копирования.\n"
            "  База и media с сервера:  --ssh user@host --remote-dir /путь/к/проекту\n"
            "  Картинки с сайта:        --from-site\n"
            "  Сводка по локальной базе: --summary"
        )
    if args.ssh:
        pull_over_ssh(args.ssh, args.remote_dir)
    if args.from_site or (args.ssh and args.from_site):
        download_from_site(args.site, max(1, args.workers), args.timeout)
    print_summary()


if __name__ == "__main__":
    main()
