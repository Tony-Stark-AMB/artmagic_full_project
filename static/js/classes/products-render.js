class ProductRenderer {
    constructor(containerId, pageName) {
        this.container = document.getElementById(containerId);
        this.pageName = pageName;
    }

    renderProductItem({ name, id, imageSrc, price }) {
        const productHTML = `
            <div class="products-${this.pageName}__item product-item" id="${id}">
                <div class="products-${this.pageName}__item__img__wrap">
                    <img class="products-${this.pageName}__item__img" src="/media/${imageSrc}" />
                </div>
                <p class="products-${this.pageName}__item__title">${name}</p>
                <span class="products-${this.pageName}__item__price">${price}</span>
                <button class="btn btn-primary products-${this.pageName}__item__btn" data-item="product_btn">Купити</button>
            </div>
        `;
        this.container.insertAdjacentHTML('beforeend', productHTML);
    }

    renderProducts(products, productsAmount, productsPerPage, page) {
        const totalPages = Math.ceil((productsAmount < 10 ? 10 : productsAmount) / productsPerPage);

        for (let index = 0; index < totalPages; index++) {
            const swiperSlide = `
                <div class="swiper-slide">
                    <div class="products-${this.pageName}__list" data-page="${index + 1}"></div>
                </div>
            `;
            this.container.insertAdjacentHTML('beforeend', swiperSlide);
        }

        const productsCatalogList = document.querySelectorAll(`.products-${this.pageName}__list`)[page - 1];
        products.forEach((product) => this.renderProductItem(product, productsCatalogList));
    }

    mapProducts(arr) {
        return arr.map(({ name, image, id, price, manufacturer }) =>
            new Product(id, name, price, image, manufacturer)
        );
    }

    async initFetchProducts(page = 1) {
        try {
            const { products, productsAmount, productsPerPage } = await this.fetchProducts(page);
            const mappedProducts = this.mapProducts(products);
            this.renderProducts(mappedProducts, productsAmount, productsPerPage, page);

            const catalogCarouselInit = initCarousel(`.products-${this.pageName}__carousel`, catalogCarousel);
            catalogCarouselInit.on('slideChange', () => {
                const currentPage = catalogCarouselInit.activeIndex + 1;
                this.changePageFetchProducts(currentPage);
            });
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    async fetchProducts(page) {
        const pageUrlParts = window.location.href.split("/").filter((part) => part !== "");
        const slug = pageUrlParts[pageUrlParts.length - 1];
        const url = `http://localhost:8000/product/${slug}/add-filters?page=${page}`;

        const response = await fetch(url, { method: "GET", mode: "cors" });
        return await response.json();
    }

    async changePageFetchProducts(page) {
        const productsCatalogList = document.querySelectorAll(`.products-${this.pageName}__list`)[page - 1];
        if (productsCatalogList.hasChildNodes()) return;

        try {
            const { products } = await this.fetchProducts(page);
            const mappedProducts = this.mapProducts(products);
            mappedProducts.forEach((product) => this.renderProductItem(product, productsCatalogList));

            const images = document.querySelectorAll(`.products-${this.pageName}__item__img`);
            rerenderImage(images);
        } catch (error) {
            console.error("Error changing page:", error);
        }
    }
}