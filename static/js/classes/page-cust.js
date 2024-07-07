

// export class PageProducts {
//     constructor(pageName, containerId, swiper, basket) {
//         this.pageName = pageName;
//         this.basket = basket;
//         this.productsContainer = document.getElementById(containerId);
//         this.productsLists = document.querySelectorAll(`.products-${this.pageName}__list`);;
//         this.defaultProductsAmount = 10;
//         this.swiper = swiper;
//         this.filters = {};
//         this.basket.setPageName(pageName);
//     }

//     renderProductItem({ name, id, image, price }, container) {
//         const productHTML = `
//             <div class="products-${this.pageName}__item product-item" id="${id}">
//                 <div class="products-${this.pageName}__item__img__wrap">
//                     <img class="products-${this.pageName}__item__img" src="/media/${image}" />
//                 </div>
//                 <p class="products-${this.pageName}__item__title">${name}</p>
//                 <span class="products-${this.pageName}__item__price">${price}</span>
//                 <button class="btn btn-primary products-${this.pageName}__item__btn" data-item="product_btn">Купити</button>
//             </div>
//         `;
//         container.insertAdjacentHTML('beforeend', productHTML);
//     }

//     renderProductsLists(productsAmount, productsPerPage) {
        
//         const totalPages = Math.ceil(
//             (productsAmount < this.defaultProductsAmount ? 
//                 this.defaultProductsAmount 
//                 : productsAmount) / productsPerPage
//         );

//         for (let index = 0; index < totalPages; index++) {
//             const swiperSlideHTML = `
//                 <div class="swiper-slide products-${this.pageName}__list" data-page="${index + 1}"></div>
//             `;

//             this.productsContainer.insertAdjacentHTML('beforeend', swiperSlideHTML);
//         }
//     }

//     renderProductsItems(products, page) {
//         const productsList = this.productsLists[page - 1];
//         if (page !== 1 && productsList.hasChildNodes()) return;
        
//         products.forEach(product => this.renderProductItem(product, productsList));

//         const images = document.querySelectorAll(`.products-${this.pageName}__item__img`);
//         rerenderImage(images);
//     }

//     updateFilterString = () => {
//         const filterString = Object.keys(this.filters)
//             .map(category => `${category}=${this.filters[category].join(';')}`)
//             .join('&');
//         console.log(filterString);
//     }
    
//     handleCheckboxChange = (event) =>{
//         const target = event.target;
//         if (target.type === 'checkbox') {
//             const parent = target.closest('[data-parent]');
//             if (parent) {
//                 const category = parent.getAttribute('data-parent');
//                 const filter = target.id;
//                 if (!this.filters[category]) {
//                     this.filters[category] = [];
//                 }

//                 // Update filters based on checkbox state
//                 if (target.checked) {
//                     if (!this.filters[category].includes(filter)) {
//                         this.filters[category].push(filter);
//                     }
//                 } else {
//                     this.filters[category] = this.filters[category].filter(f => f !== filter);
//                     if (this.filters[category].length === 0) {
//                         delete this.filters[category];
//                     }
//                 }

//                 this.updateFilterString();
//             }
//         }
//     }

//     setResponsiveProductsAmount() {
//         const width = window.innerWidth;
//         switch(true){
//             case width >= 1600:
//                 this.defaultProductsAmount = 12;
//                 break;
//             case width >= 1400:
//                 this.defaultProductsAmount = 12;
//                 break;
//             case width >= 1260:
//                 this.defaultProductsAmount = 9;
//                 break;
//             case width >= 992:
//                 this.defaultProductsAmount = 8;
//                 break;
//             case width >= 768:
//                 this.defaultProductsAmount = 9;
//                 break;
//             case width >= 576:
//                 this.defaultProductsAmount = 6;
//                 break;
//             case width >= 400:
//                 this.defaultProductsAmount = 4;
//                 break;
//             default: 
//                 this.defaultProductsAmount = 12;
//                 break;
//         }
//       }

//     mapProducts(arr) {
//         return arr.map(({ name, image, id, price, manufacturer }) =>
//             new Product(id, name, price, image, manufacturer)
//         );
//     }

//     async fetchProducts(page) {
//         const pageUrl = window.location.href.split("/").filter(part => part !== "");
//         const slug = pageUrl[pageUrl.length - 1];

//         const url = `http://localhost:8000/product/${slug}/add-filters?page=${page}&productsPerPage=${this.defaultProductsAmount}`;

//         const response = await fetch(url, {
//             method: "GET",
//             mode: "cors",
//             headers: {
//                 "Content-Type": "application/json"
//             }
//         });
//         return await response.json();
//     }

    
//     // Add event listener to the document for change events
    

//     async initialize() {
//         const { products, productsAmount, productsPerPage } = await this.fetchProducts(1);
//         this.renderProductsLists(productsAmount, productsPerPage);
//         this.productsLists = document.querySelectorAll(`.products-${this.pageName}__list`);
        
//         const mappedProducts = this.mapProducts(products);
//         this.renderProductsItems(mappedProducts, 1);  // Добавляем рендер продуктов для первой страницы

//         this.swiper.on('slideChange', () => {
//             const currentPage = this.swiper.activeIndex + 1;
//             this.changePageFetchProducts(currentPage);
//         });
//         await this.basket.initialize();
//     }

//     async changePageFetchProducts(page = 1) {
//         if (!this.productsLists) {
//             const { productsAmount, productsPerPage } = await this.fetchProducts(1);
//             this.renderProductsLists(productsAmount, productsPerPage);
//             this.productsLists = document.querySelectorAll(`.products-${this.pageName}__list`);
//         }

//         const productsList = this.productsLists[page - 1];
//         if (productsList.hasChildNodes()) return; 

//         const { products, productsAmount, productsPerPage } = await this.fetchProducts(page);
//         const mappedProducts = this.mapProducts(products);
//         this.renderProductsItems(mappedProducts, page);

//         this.basket.initProductsBuyBtns(page);
//         return {productsAmount, productsPerPage}
//     }

//     clearItemsOnPage(page) {
//         const productList = this.productsLists[page - 1];
//         if (productList.hasChildNodes()) productList.innerHTML = ""; 
//         return;
//     }
// }
