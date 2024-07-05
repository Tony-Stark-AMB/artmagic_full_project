import { Swiper, Pagination, Navigation } from "../import.js";

export class PageProducts {
    constructor(pageName, containerId, basket) {
        this.pageName = pageName;
        this.basket = basket;
        this.swiperContainer = document.getElementById(containerId);
        this.productsLists = document.querySelectorAll(`.products-${this.pageName}__list`);
        this.filters = {};
        this.basket.setPageName(pageName);
        this.swiperPagination = {
            productsPerPage: 10,
            numberOfPageGroup: 0,
            pagItemsPerGroup: 10,
            totalPageGroups: 10,
        }
        const [createBtnPrev10, createBtnNext10] = this.createPaginationGroupBtns();
        this.swiper = this.initSwiper();
        (async () => {
            console.log(this.swiper);

            // await this.basket.initialize(); // after page rendered
        })()

    }

    async initialize(){

        // document.addEventListener("resize", await this.resizeLogic());
    }

    initSwiper = () => new Swiper(this.getSwiperConfig());

    getSwiperConfig(){
        const { pagItemsPerGroup, numberOfPageGroup } = this.swiperPagination;
        return {
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
                renderBullet: (index, className) => {
                  const startPage = numberOfPageGroup * pagItemsPerGroup;
                  const endPage = startPage + pagItemsPerGroup - 1;
                  const totalSlides = this.swiper.slides.length;
              
                  this.swiperPagination.totalPageGroups = Math.ceil(totalSlides / pagItemsPerGroup); // Calculate total page groups
              
                  if (index >= startPage && index <= endPage) {
                    return `
                    <div class="d-grid btn-pag ${className}">
                      <span>${index + 1}</span>
                    </div>`;
                  } 
                  return `
                  <div class="d-none btn-pag ${className}">
                    <span >${index + 1}</span>
                  </div>`;
                }
            },
            modules: [Pagination, Navigation]
        }
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
        
        const totalPages = Math.ceil(
            (productsAmount < this.productsPerPage ? 
                this.productsPerPage 
                : productsAmount) / productsPerPage
        );

        for (let index = 0; index < totalPages; index++) {
            const swiperSlideHTML = `
                <div class="swiper-slide products-${this.pageName}__list" data-page="${index + 1}"></div>
            `;

            this.swiperContainer.insertAdjacentHTML('beforeend', swiperSlideHTML);
        }
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

        const url = `http://localhost:8000/product/${slug}/add-filters?page=${page}&productsPerPage=${this.productsPerPage}&${filtrartionProductsQuery}`;

        const response = await fetch(url, {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            }
        });
        return await response.json();
    }

    pageChange(page = 1){
        
    }

    updateFilterString = () => {
        const filterString = Object.keys(this.filters)
            .map(category => `${category}=${this.filters[category].join(';')}`)
            .join('&');
        console.log(filterString);
        return filterString;
    }
    
    handleCheckboxChange = (event) =>{
        const target = event.target;
        if (target.type === 'checkbox') {
            const parent = target.closest('[data-parent]');
            if (parent) {
                const category = parent.getAttribute('data-parent');
                const filter = target.id;
                if (!this.filters[category]) {
                    this.filters[category] = [];
                }

                // Update filters based on checkbox state
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

                this.updateFilterString();
            }
        }
    }

    createPaginationGroupBtns = () => {
        const createBtnPrev10 = document.createElement("button");
        createBtnPrev10.classList.add("btn", "btn-primary", "btn-prev-catalog-10");
        createBtnPrev10.textContent = "10 prev";
        
        createBtnPrev10.addEventListener("click", async () => {
            this.updatePageGroup(this.numberOfPageGroup - 1);
            const currentPage = this.swiper.activeIndex -= 12;
            this.swiper.slideTo(currentPage + 2);
        });

        const createBtnNext10 = document.createElement("button");
        createBtnNext10.classList.add("btn", "btn-primary", "btn-next-catalog-10");
        createBtnNext10.textContent = "10 next";

        createBtnNext10.addEventListener("click", async () => {
            this.updatePageGroup(this.numberOfPageGroup + 1);
            const currentPage = this.swiper.activeIndex += 11;
            this.swiper.slideTo(currentPage - 1);
        });
        
        this.swiperContainer.prepend(createBtnPrev10);
        this.swiperContainer.append(createBtnNext10);
        return [createBtnPrev10, createBtnNext10]
    }

    toggleGroupButtonsVisibility() {
        this.createBtnPrev10.style.display = numberOfPageGroup === 0 ? 'none' : 'block';
        this.createBtnNext10.style.display = numberOfPageGroup === totalPageGroups - 1 ? 'none' : 'block';
    }

    setProductsPerPage(){
        const screenWidth = window.innerWidth;
        switch(true){
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

    async resizeLogic(){
        
    }

    // for pagination
    updatePageGroup(newGroupIndex) {
        this.numberOfPageGroup = newGroupIndex;
        this.swiper.pagination.render();
        this.swiper.pagination.update();
        this.toggleGroupButtonsVisibility();
    }
      
    updatePagination() {
        const itemsPerGroup = this.productsPerPage;
        this.totalPageGroups = Math.ceil(this.swiper.slides.length / itemsPerGroup);
    }

    renderLoader(container) {
        const loaderHTML = `
            <div class="loader"></div>
        `
        container.insertAdjacentHTML('beforeend', loaderHTML);
    }

    clearPage(page) {
        const curPage = this.productsLists[page - 1];
        if(curPage.hasChildNodes() || curPage.firstChild === "div.loader")
            this.curPage.innerHTML = "";
    }
}
