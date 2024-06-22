import {Swiper} from "../import.js";

export class PageProducts {
    constructor(pageName, containerId, carouselConfig, basket) {
        this.pageName = pageName;
        this.basket = basket;
        this.productsContainer = document.getElementById(containerId);
        this.carouselConfig = carouselConfig;
        this.initFetchProducts();
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

    productsRendering(products, productsAmount, productsPerPage, page) {
        const totalPages = Math.ceil((productsAmount < 10 ? 10 : productsAmount) / productsPerPage);

        for (let index = 0; index < totalPages; index++) {
            const swiperSlideHTML = `
                <div class="swiper-slide">
                    <div class="products-${this.pageName}__list" data-page="${index + 1}"></div>
                </div>
            `;
            this.productsContainer.insertAdjacentHTML('beforeend', swiperSlideHTML);
        }

        const productsCatalogList = document.querySelectorAll(`.products-${this.pageName}__list`)[page - 1];
        products.forEach(product => this.renderProductItem(product, productsCatalogList));
    }

    mapProducts(arr) {
        return arr.map(({ name, image, id, price, manufacturer }) =>
            new Product(id, name, price, image, manufacturer)
        );
    }

    async fetchProducts(page) {
        const pageUrl = window.location.href.split("/").filter(part => part !== "");
        const slug = pageUrl[pageUrl.length - 1];

        const url = `http://localhost:8000/add-filters/${slug}?page=${page}`;

        const response = await fetch(url, {
            method: "GET",
            mode: "cors"
        });
        return await response.json();
    }

    async initFetchProducts(page = 1) {
        const { products, productsAmount, productsPerPage } = await this.fetchProducts(page);
        const mappedProducts = this.mapProducts(products);
        this.productsRendering(mappedProducts, productsAmount, productsPerPage, page);

        const catalogCarouselInit = this.initCarousel(`.main-${this.pageName}__carousel`, this.carouselConfig);
        catalogCarouselInit.on('slideChange', () => {
            const currentPage = catalogCarouselInit.activeIndex + 1;
            this.changePageFetchProducts(currentPage);
        });
        await this.basket.initialize();
    }

    async changePageFetchProducts(page) {
        const productsCatalogList = document.querySelectorAll(`.products-${this.pageName}__list`)[page - 1];
        if (productsCatalogList.hasChildNodes()) return;

        const { products } = await this.fetchProducts(page);
        const mappedProducts = this.mapProducts(products);
        mappedProducts.forEach(product => this.renderProductItem(product, productsCatalogList));

        const images = document.querySelectorAll(`.products-${this.pageName}__item__img`);
        rerenderImage(images);
        await this.basket.initialize();
    }

    initCarousel(SwiperElClassName, config) {
        return new Swiper(SwiperElClassName, config);
    } 
}

