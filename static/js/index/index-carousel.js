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

    const productsIndexList = document.querySelectorAll(`.products-${this.pageName}__list`)[page - 1];
    products.forEach(product => this.renderProductItem(product, productsIndexList));
  }

  async fetchProducts(page) {
    const url = `http://localhost:8000/get-new-arrivals/?page=${page}&productsPerPage=${this.defaultProductsAmount}`;

    const response = await fetch(url, {
        method: "GET",
        mode: "cors"
    });
    return await response.json();
  }

  setResponsiveProductsAmount() {
    const width = window.innerWidth;
    switch(true){
      case width >= 1400:
        this.defaultProductsAmount = 10;
        break;
      case width >= 1260:
        this.defaultProductsAmount = 10;
        break;
      case width >= 992:
        this.defaultProductsAmount = 10;
        break;
      case width >= 768:
        this.defaultProductsAmount = 8;
        break;
      case width >= 576:
        this.defaultProductsAmount = 6;
        break;
      case width >= 400:
        this.defaultProductsAmount = 4;
        break;
    }
  }
  
}

let numberOfPageGroup = 0; // Initialize the group index
const itemsPerGroup = 10; // Number of items per group
let totalPageGroups = 0; // Initialize the total number of page groups

function updatePagination(totalSlides) {
  const itemsPerGroup = indexProducts.defaultProductsAmount;
  totalPageGroups = Math.ceil(totalSlides / itemsPerGroup);
}

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
const indexProducts = new IndexProducts(pageName, "productsIndexContainer", indexProductsSwiper, basket);


let resizeTimeout;

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(async () => await resizeLogic(), 300);
});

async function resizeLogic (){
  indexProducts.setResponsiveProductsAmount();
  indexProducts.productsContainer.replaceChildren();
  const { products, productsAmount, productsPerPage } = await indexProducts.fetchProducts(1);
  indexProducts.renderProductsLists(productsAmount, productsPerPage);
  indexProducts.productsLists = document.querySelectorAll(`.products-${indexProducts.pageName}__list`);
  
  const mappedProducts = indexProducts.mapProducts(products);
  indexProducts.renderProductsItems(mappedProducts, 1);  // Add render products for the first page

  indexProducts.swiper.on('slideChange', async () => {
    const currentPage = indexProducts.swiper.activeIndex + 1;
    await indexProducts.changePageFetchProducts(currentPage);
    console.log("swiper change")
  });

  await indexProducts.basket.initialize();
  indexProducts.swiper.slideTo(0);

  updatePagination(indexProductsSwiper.slides.length);


}

document.addEventListener('DOMContentLoaded', async () => await resizeLogic());