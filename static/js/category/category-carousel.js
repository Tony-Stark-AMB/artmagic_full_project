import { Swiper, Navigation, Pagination } from "../import.js";
import { PageProducts } from "../classes/page-products.js";
import { basket } from "../header/basket/basket.js";

const pageName = "category";

class CategoryProducts extends PageProducts {
  constructor(pageName, containerId, swiper, basket) {
    super(pageName, containerId, swiper, basket);
  }

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

  async initialize() {
    this.defaultProductsAmount = 12;
    const { products, productsAmount, productsPerPage } = await this.fetchProducts(1);
    this.renderProductsLists(productsAmount, productsPerPage);
    this.productsLists = document.querySelectorAll(`.products-${this.pageName}__list`);
    
    const mappedProducts = this.mapProducts(products);
    this.renderProductsItems(mappedProducts, 1);  // Add render products for the first page

    this.swiper.on('slideChange', async () => {
      const currentPage = this.swiper.activeIndex + 1;
      await this.changePageFetchProducts(currentPage);
    });
    await this.basket.initialize();
  }

  go10Next(){

  }
}

const swiperContainer = document.querySelector('.products-category__carousel');

let numberOfPageGroup = 0; // Initialize the group index
const itemsPerGroup = 10; // Number of items per group

const customPagination = {
  el: ".swiper-pagination",
  clickable: true,
  renderBullet: function (index, className) {
    const startPage = numberOfPageGroup * itemsPerGroup;
    const endPage = startPage + itemsPerGroup - 1;
    const totalSlides = this.slides.length;


    if (index >= startPage && index <= endPage) {
      return `<span class="${className} d-block">${index + 1}</span>`;
    } 
      
    return `<span class="${className} d-none">${index + 1}</span>`;



  }
};

async function updatePageGroup(newGroupIndex) {
  numberOfPageGroup = newGroupIndex
  categoryProductsSwiper.pagination.render();
  categoryProductsSwiper.pagination.update();
}

const createBtnPrev10 = document.createElement("button");
createBtnPrev10.classList.add("btn", "btn-primary", "btn-prev-10");
createBtnPrev10.textContent = "10 prev";

const createBtnNext10 = document.createElement("button");
createBtnNext10.classList.add("btn", "btn-primary", "btn-next-10");
createBtnNext10.textContent = "10 next";

createBtnPrev10.addEventListener("click", async () => {
  await updatePageGroup(numberOfPageGroup - 1);
  console.log("prev 10")
  const currentPage = categoryProducts.swiper.activeIndex -= 12;
  categoryProducts.swiper.slideTo(currentPage + 2)
  await categoryProducts.changePageFetchProducts(currentPage);
});
createBtnNext10.addEventListener("click", async () => {
    await updatePageGroup(numberOfPageGroup + 1);
    console.log("next 10")
    const currentPage = categoryProducts.swiper.activeIndex += 11;
    categoryProducts.swiper.slideTo(currentPage - 1)
    await categoryProducts.changePageFetchProducts(currentPage);
});

swiperContainer.prepend(createBtnPrev10);
swiperContainer.append(createBtnNext10);

const categoryBanner = {
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
};

const brandsBanner = {
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
};

const productsCarousel = {
  slidesPerView: 1,
  slidesPerGroup: 1,
  pagination: customPagination,
  modules: [Navigation, Pagination],
};

// Initialize Swiper instances
new Swiper(`.${pageName}-banner`, categoryBanner);
new Swiper(`.${pageName}-brands`, brandsBanner);
const categoryProductsSwiper = new Swiper(`.products-${pageName}__carousel`, productsCarousel);
const categoryProducts = new CategoryProducts(pageName, "productsCategoryContainer", categoryProductsSwiper, basket);
