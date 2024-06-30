import {Swiper, Navigation, Pagination} from "../import.js";
import { PageProducts } from "../classes/page-products.js";
import { basket } from "../header/basket/basket.js";

const pageName = "index";

class IndexProducts extends PageProducts{
  constructor(pageName, containerId, swiper, basket){
    super(pageName, containerId, swiper, basket)
    this.basket.setPageName(pageName)
  }

  renderProductItem({ name, id, image, price }, container) {
    const productHTML = `
        <div class="products-${this.pageName}__item product-item" id="${id}">
            <div class="products-${this.pageName}__item__img__wrap">
                <img class="products-${this.pageName}__item__img" src="/media/${image}" />
            </div>
            <div class="products-index__item__content">
                <p class="products-${this.pageName}__item__title">${name}</p>
                <span class="products-${this.pageName}__item__price">${price}</span>
                <button class="btn btn-primary products-${this.pageName}__item__btn" data-item="product_btn">Купити</button>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', productHTML);
  }

  productsRendering(products, productsAmount, productsPerPage, page) {
    const totalPages = Math.ceil(
      (productsAmount < this.defaultProductsAmount 
        ? this.defaultProductsAmount 
        : productsAmount) / productsPerPage);

    for (let index = 0; index < totalPages; index++) {
        const swiperSlideHTML = `
            <div class="swiper-slide products-${this.pageName}__list" data-page="${index + 1}"></div>
        `;
        this.productsContainer.insertAdjacentHTML('beforeend', swiperSlideHTML);
    }
    console.log("productsRerendering", page)

    const productsIndexList = document.querySelectorAll(`.products-${this.pageName}__list`)[page - 1];
    products.forEach(product => this.renderProductItem(product, productsIndexList));
  }

  async fetchProducts(page) {
    this.defaultProductsAmount = 10;
    const url = `http://localhost:8000/get-new-arrivals/?page=${page}&productsPerPage=${this.defaultProductsAmount}`;

    const response = await fetch(url, {
        method: "GET",
        mode: "cors"
    });
    return await response.json();
  }
  
}
// function debounce(func, delay) {
//   let timerId;
  
//   return function(...args) {
//     clearTimeout(timerId);
//     timerId = setTimeout(() => {
//       func.apply(this, args);
//     }, delay);
//   };
// }

// // Your resize event handler function
// function handleResize() {
//   // Your code here
//   console.log("here");
//   productsCarousel.breakpoints = breakpointsProductsCarousel();
//   new Swiper(".products-index__list__wrap", productsCarousel);
// }

// // Debounce the handleResize function with a delay of 300ms
// const debouncedResizeHandler = debounce(handleResize, 300)

// const breakpointsProductsCarousel = () => {
//   return {
//     1800: {
//       slidesPerView: 5,
//       slidesPerGroup: 5,
//     },
//     1400: {
//       slidesPerView: 4,
//       slidesPerGroup: 4,
//     },
//     1200: {
//       slidesPerView: 3,
//       slidesPerGroup: 3,
//     },
//   }
// }

// window.addEventListener("resize", debouncedResizeHandler);

const {mainBanner, productsCarousel} = {
 
  mainBanner: {
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    speed: 2000,
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      dynamicBullets: true,
    },
  },
  productsCarousel: {
    slidesPerView: 1,
    slidesPerGroup: 1,
    spaceBetween: 10,
    speed: 2000,
    pagination: {
      clickable: true,
      el: ".swiper-pagination",
      renderBullet: function (index, className) {
        return `<div class="d-grid btn-pag ${className}">
                <span>${index + 1}</span>
              </div>`;
      },
    },
    breakpoints: {
      
      

    },
  },
  modules: [Navigation, Pagination]
}

new Swiper(`.main-${pageName}__banner`, mainBanner);
const indexProductsSwiper = new Swiper(`.products-${pageName}__list__wrap`, productsCarousel);
new IndexProducts(pageName, "productsIndexContainer", indexProductsSwiper, basket);


