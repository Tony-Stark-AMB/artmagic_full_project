import { Swiper, Navigation, Pagination } from "../import.js";
import { PageProducts } from "../classes/page-products.js";
import { basket } from "../header/basket/basket.js";

const pageName = "category";

class CategoryProducts extends PageProducts{
  constructor(pageName, containerId, swiper, basket){
    super(pageName, containerId, swiper, basket)
    this.itemsPerGroup = 10;
    this.numberOfPageGroup = 0; // Initialize to the first group (0-9)
  }

  customPagination = {
    el: ".swiper-pagination",
    clickable: true,
    renderBullet: (index, className) => {
      const startPage = this.numberOfPageGroup * this.itemsPerGroup;
      const endPage = startPage + this.itemsPerGroup;

      if (index >= startPage && index <= endPage) {
        return `<span class="${className}">${index + 1}</span>`;
      } 
      return '';
    },
  };
  
  async fetchProducts(page) {
    const pageUrl = window.location.href.split("/").filter(part => part !== "");
    const slug = pageUrl[pageUrl.length - 1];
    const url = `http://localhost:8000/add-category/${slug}?page=${page}&productsPerPage=${this.defaultProductsAmount}`;

    const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        }
    });
    return await response.json();
  }
  // для изменения дефолтного колва продуктов на страницу
  async initialize() {
    this.defaultProductsAmount = 12;
    const { products, productsAmount, productsPerPage } = await this.fetchProducts(1);
    this.renderProductsLists(productsAmount, productsPerPage);
    this.productsLists = document.querySelectorAll(`.products-${this.pageName}__list`);
    
    const mappedProducts = this.mapProducts(products);
    this.renderProductsItems(mappedProducts, 1);  // Добавляем рендер продуктов для первой страницы

    this.swiper.on('slideChange', () => {
        const currentPage = this.swiper.activeIndex + 1;
        this.changePageFetchProducts(currentPage);
    });
    console.log(this.swiper.setConfig)
    this.swiper.setConfig({
      slidesPerView: 1,
      slidesPerGroup: 1,
      pagination: this.customPagination
    })

    await this.basket.initialize();
  }
}

const {categoryBanner, brandsBanner, productsCarousel} = {
 
    categoryBanner: {
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      speed: 2000,
      loop: true,
    },

    brandsBanner: {
      autoplay: {
        delay: 4000,
      },
      direction: "vertical",
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      speed: 2000,
      loop: true,
    },

    productsCarousel: {
      slidesPerView: 1,
      slidesPerGroup: 1,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '">' + (index + 1) + "</span>";
        },
      },
    },

    modules: [Navigation, Pagination]
}

new Swiper(`.${pageName}-banner`, categoryBanner);
new Swiper(`.${pageName}-brands`, brandsBanner);
const categoryProductsSwiper = new Swiper(`.products-${pageName}__carousel`, productsCarousel); 
new CategoryProducts(pageName, "productsCategoryContainer", categoryProductsSwiper, basket);
