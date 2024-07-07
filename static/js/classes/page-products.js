import { Swiper } from "../import.js";

export class PageProducts {
    constructor(pageName, containerId, swiperContainer, basket) {
        this.pageName = pageName;
        this.basket = basket;
        this.swiperContainer = swiperContainer;
        this.swiperWrapper = document.getElementById(containerId);
        this.productsLists = document.querySelectorAll(`.products-${this.pageName}__list`);
        this.filters = {};
        this.basket.setPageName(pageName);
        this.swiperPagination = {
            productsPerPage: 12,
            currentPageGroup: 0,
            buttonsPerGroup: 10,
            totalPageGroups: 0,
            previousPageIndex: 0
        }
        this.swiper = this.initSwiper();
        this.setupSwiperEvents();
    }

    async initializePage() {
        // const { products, productsAmount, productsPerPage } = await this.fetchProducts(1);
        // this.productsLists = this.renderProductsLists(productsAmount, productsPerPage);
        
        // const mappedProducts = this.mapProducts(products);
        // this.renderProductItemsOnList(mappedProducts, 1);

        // this.renderGroup10Buttons();
        // this.renderPaginationBullets();
        // this.setActivePaginationBullet(this.swiper.activeIndex);
        await this.applyFilters();
        
        this.basket.setPageName(this.pageName);
        this.basket.initialize();
    }

    initSwiper(config) {
        return new Swiper(this.swiperContainer, config);
    }

    setupSwiperEvents() {
        this.swiper.on("slideChange", async () => {
            const currentIndex = this.swiper.activeIndex;
            const currentPage = currentIndex + 1;
            const currentPageGroup = Math.floor(currentIndex / this.swiperPagination.buttonsPerGroup);

            if (currentPageGroup !== this.swiperPagination.currentPageGroup) {
                this.swiperPagination.currentPageGroup = currentPageGroup;
                this.renderPaginationBullets();
            }

            await this.pageChange(currentPage);
            this.setActivePaginationBullet(currentIndex);
            this.swiperPagination.previousPageIndex = currentIndex;
        });
    }

    renderProductItem({ name, id, image, price }, container) {
        const productHTML = `
            <div class="products-${this.pageName}__item product-item" id="${id}">
                <div class="products-${this.pageName}__item__img__wrap">
                    <img class="products-${this.pageName}__item__img" src="/media/${image}" />
                </div>
                <p class="products-${this.pageName}__item__title">${name}</p>
                <span class="products-${this.pageName}__item__price">${price}</span>
                <button class="btn btn-primary products-${this.pageName}__item__btn" data-item="product_btn">Купити</button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', productHTML);
    }

    renderProductsLists(productsAmount, productsPerPage) {
        const totalPages = Math.ceil(productsAmount / productsPerPage);

        for (let index = 0; index < totalPages; index++) {
            const swiperSlideHTML = `
                <div class="swiper-slide products-${this.pageName}__list" data-page="${index + 1}"></div>
            `;
            this.swiperWrapper.insertAdjacentHTML('beforeend', swiperSlideHTML);
        }

        return document.querySelectorAll(`.products-${this.pageName}__list`);
    }

    renderProductItemsOnList(products, page) {
        const productsList = this.productsLists[page - 1];

        if (page !== 1 && productsList.hasChildNodes()) return;
        
        products.forEach(product => this.renderProductItem(product, productsList));

        const images = document.querySelectorAll(`.products-${this.pageName}__item__img`);
        rerenderImage(images);
    }

    renderPaginationBullets() {
        const pagination = document.querySelector("div.pagination");
        pagination.innerHTML = "";

        const startPage = this.swiperPagination.currentPageGroup * this.swiperPagination.buttonsPerGroup + 1;
        const endPage = Math.min(startPage + this.swiperPagination.buttonsPerGroup - 1, this.productsLists.length);
        console.log("startPage = ", startPage,"endPage = ", endPage, "productsLists.lengrth = ", this.productsLists.length);
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement("button");
            pageButton.classList.add("btn-pagination");
            pageButton.textContent = i;
            pagination.appendChild(pageButton);
        }

        document.querySelectorAll(".btn-pagination").forEach((btn, i) => {
            btn.addEventListener("click", async () => {
                const newIndex = this.swiperPagination.currentPageGroup * this.swiperPagination.buttonsPerGroup + i;
                this.swiper.slideTo(newIndex);
            });
        });

        const prevGroupBtn = document.querySelector(`.btn-prev-${this.pageName}-10`) ?? null;
        const nextGroupBtn = document.querySelector(`.btn-next-${this.pageName}-10`) ?? null;

        if(prevGroupBtn && nextGroupBtn){
            prevGroupBtn.disabled = this.swiperPagination.currentPageGroup === 0;
            nextGroupBtn.disabled = endPage === this.productsLists.length;
        }

    }

    setActivePaginationBullet(index) {
        const paginationBtns = document.querySelectorAll(".btn-pagination");
        paginationBtns.forEach((btn) => btn.classList.remove("active"));
        
        const relativeIndex = index % this.swiperPagination.buttonsPerGroup;
        paginationBtns[relativeIndex].classList.add("active");
    }

    renderGroup10Buttons() {
        const swiperContainer = document.querySelector(this.swiperContainer);

        const prevGroupBtn = document.createElement("button");
        prevGroupBtn.classList.add(`btn-prev-${this.pageName}-10`, "btn", "btn-primary");
        prevGroupBtn.textContent = "10 prev";
        prevGroupBtn.addEventListener("click", async () => {
            this.swiperPagination.currentPageGroup -= 1;
            this.renderPaginationBullets();
            this.swiper.slideTo(this.swiper.activeIndex - 10);
        });

        swiperContainer.prepend(prevGroupBtn);

        const nextGroupBtn = document.createElement("button");
        nextGroupBtn.classList.add(`btn-next-${this.pageName}-10`, "btn", "btn-primary");
        nextGroupBtn.textContent = "10 next";
        nextGroupBtn.addEventListener("click", async () => {
            this.swiperPagination.currentPageGroup += 1;
            this.renderPaginationBullets();
            this.swiper.slideTo(this.swiper.activeIndex + 10);
        });

        swiperContainer.append(nextGroupBtn);
    }

    mapProducts(arr) {
        return arr.map(({ name, image, id, price, manufacturer }) =>
            new Product(id, name, price, image, manufacturer)
        );
    }

    async fetchProducts(page) {
        const pageUrl = window.location.href.split("/").filter(part => part !== "");
        const slug = pageUrl[pageUrl.length - 1];
        const filtrartionProductsQuery = this.updateFilterString();
        console.log(filtrartionProductsQuery);
        const { productsPerPage } = this.swiperPagination;

        const url = `http://localhost:8000/product/${slug}/add-filters?page=${page}&productsPerPage=${productsPerPage}&${filtrartionProductsQuery ? filtrartionProductsQuery : ""}`;

        const response = await fetch(url, {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            }
        });
        return await response.json();
    }

    async pageChange(page) {
        // if (this.productsLists[page - 1].hasChildNodes()) return;

        // const { products } = await this.fetchProducts(page);
        // const mappedProducts = this.mapProducts(products);
        // this.renderProductItemsOnList(mappedProducts, page);

        // if (page != 1)
        //     this.basket.initProductsBuyBtns(page);
        if (this.productsLists[page - 1].hasChildNodes()) return;

        const { products, productsAmount, productsPerPage } = await this.fetchProducts(page);

        // Если данные о продуктах изменились, обновляем листы продуктов
        if (productsAmount !== this.productsLists.length * this.swiperPagination.productsPerPage) {
            // this.productsLists = this.renderProductsLists(productsAmount, productsPerPage);
            this.renderPaginationBullets();
        }

        const mappedProducts = this.mapProducts(products);
        this.renderProductItemsOnList(mappedProducts, page);

        if (page != 1) {
            this.basket.initProductsBuyBtns(page);
        }
    }

    updateFilterString() {
        const filterString = Object.keys(this.filters)
            .map(category => `${category}=${this.filters[category].join('|')}`)
            .join('&');
        return filterString;
    }

    handleCheckboxChange = (event) => {
        // console.log("checkbox")
        const target = event.target;
        if (target.type === 'checkbox') {
            const parent = target.closest('[data-parent]');
            if (parent) {
                const category = parent.getAttribute('data-parent');
                const filter = target.dataset.child;
                if (!this.filters[category]) {
                    this.filters[category] = [];
                }
    
                if (target.checked) {
                    if (!this.filters[category].includes(filter)) {
                        this.filters[category].push(filter);
                    }
                } else {
                    this.filters[category] = this.filters[category].filter(f => f !== filter);
                    if (this.filters[category].length === 0) {
                        delete this.filters[category];
                    }
                }
                this.applyFilters(); // Применяем фильтры при изменении
                this.swiper.activeIndex = 0;
            }
        }
    }

    setProductsPerPage() {
        const screenWidth = window.innerWidth;
        switch (true) {
            case screenWidth >= 1600:
                this.productsPerPage = 12;
                break;
            case screenWidth >= 1400:
                this.productsPerPage = 12;
                break;
            case screenWidth >= 1260:
                this.productsPerPage = 9;
                break;
            case screenWidth >= 992:
                this.productsPerPage = 8;
                break;
            case screenWidth >= 768:
                this.productsPerPage = 9;
                break;
            case screenWidth >= 576:
                this.productsPerPage = 6;
                break;
            case screenWidth >= 400:
                this.productsPerPage = 4;
                break;
            default:
                this.productsPerPage = 12;
                break;
        }
    }

    async resizeLogic() {
        this.setProductsPerPage();
        this.swiperWrapper.replaceChildren();
        const { products, productsAmount, productsPerPage } = await this.fetchProducts(1);
        this.renderProductsLists(productsAmount, productsPerPage);
    }

    applyFilters = async () => {
        // Добваление слушателя, для формирования строки
        document.querySelectorAll("[data-parent]").forEach(
            (parent) => parent.addEventListener("change", this.handleCheckboxChange));
        // Сброс текущих продуктов и пагинации
        this.swiperWrapper.innerHTML = "";
        this.swiperPagination.currentPageGroup = 0;
    
        // Получаем данные с новыми фильтрами
        const { products, productsAmount, productsPerPage } = await this.fetchProducts(1);
    
        // Обновляем листы продуктов и пагинацию
        this.productsLists = this.renderProductsLists(productsAmount, productsPerPage);
        const mappedProducts = this.mapProducts(products);
        this.renderProductItemsOnList(mappedProducts, 1);
        this.renderGroup10Buttons();
        this.renderPaginationBullets();
        this.setActivePaginationBullet(this.swiper.activeIndex);
    }
}