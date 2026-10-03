// for images ratio
initImagesRation(INDEX);

document.querySelectorAll("[data-home-focus='search']").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.querySelector(".header-search__input");
    if (!input) return;
    input.focus();
    input.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

function pickMenuColumns(count, maxCols) {
  const upper = Math.min(maxCols, count);
  const lower = Math.min(2, upper);
  let best = upper;
  let bestScore = Infinity;

  for (let columns = lower; columns <= upper; columns += 1) {
    const remainder = count % columns;
    const leftoverPenalty = remainder === 0 ? 0 : remainder === 1 ? 40 : 8;
    const score = leftoverPenalty + Math.abs(columns - 5);
    if (score < bestScore) {
      bestScore = score;
      best = columns;
    }
  }

  return best;
}

function layoutHomeTiles() {
  const grid = document.querySelector(".home-explore__grid");
  if (!grid) return;

  const count = grid.children.length;
  if (!count) return;

  const width = grid.clientWidth;
  const narrow = width < 720;
  const minCell = narrow ? 140 : 160;
  const gap = 14;
  const maxCols = Math.max(1, Math.min(count, Math.floor((width + gap) / (minCell + gap))));
  const columns = narrow ? Math.min(2, count) : pickMenuColumns(count, maxCols);

  grid.style.setProperty("--tile-cols", String(columns));
}

layoutHomeTiles();
window.addEventListener("resize", layoutHomeTiles);

function layoutHomeNote() {
  const text = document.querySelector(".home-note__text");
  if (!text || text.querySelector(".home-note__aside")) return;

  const aside = document.createElement("aside");
  aside.className = "home-note__aside";
  const story = document.createElement("div");
  story.className = "home-note__story";
  const rest = document.createElement("div");
  rest.className = "home-note__rest";

  let passedList = false;
  [...text.childNodes].forEach((node) => {
    const isListPart = node.nodeType === 1 && node.matches("h2, ol, ul");
    if (isListPart) {
      aside.appendChild(node);
      passedList = true;
      return;
    }
    (passedList ? rest : story).appendChild(node);
  });

  if (!aside.childElementCount) return;

  const closing = rest.querySelector("p:last-of-type");
  if (closing) closing.classList.add("home-note__close");

  text.append(story, aside, rest);
  if (closing) text.append(closing);
}

layoutHomeNote();



