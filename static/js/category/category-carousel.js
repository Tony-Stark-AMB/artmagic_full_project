import { Swiper, Navigation, Pagination } from "../import.js";
import { PageProducts } from "../classes/page-products.js";
import { basket } from "../header/basket/basket.js";

const pageName = "category";

class CategoryProducts extends PageProducts {
  constructor(pageName, containerId, swiper, basket) {
    super(pageName, containerId, swiper, basket);
  }

  async fetchProducts(page) {
    // console.log("fetchProducts defaultProductsAmount", this.defaultProductsAmount)
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
    this.defaultProductsAmount = 12; // кол-во продуктов на странице
    const { products, productsAmount, productsPerPage } = await this.fetchProducts(1);
    this.renderProductsLists(productsAmount, productsPerPage);
    this.productsLists = document.querySelectorAll(`.products-${this.pageName}__list`);
    
    const mappedProducts = this.mapProducts(products);
    this.renderProductsItems(mappedProducts, 1);  // Add render products for the first page

    this.swiper.on('slideChange', async () => {
      const currentPage = this.swiper.activeIndex + 1;
      await this.changePageFetchProducts(currentPage);
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

const swiperContainer = document.querySelector(`.products-${pageName}__carousel`);

let numberOfPageGroup = 0; // Initialize the group index
const itemsPerGroup = 10; // Number of items per group
let totalPageGroups = 0; // Initialize the total number of page groups

const customPagination = {
  el: ".swiper-pagination",
  clickable: true,
  renderBullet: function (index, className) {
    const startPage = numberOfPageGroup * itemsPerGroup;
    const endPage = startPage + itemsPerGroup - 1;
    const totalSlides = this.slides.length;

    totalPageGroups = Math.ceil(totalSlides / itemsPerGroup); // Calculate total page groups

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
};

async function updatePageGroup(newGroupIndex) {
  numberOfPageGroup = newGroupIndex;
  categoryProductsSwiper.pagination.render();
  categoryProductsSwiper.pagination.update();
  toggleGroupButtonsVisibility(createBtnPrev10, createBtnNext10);
}



const createBtns = () => {
  const createBtnPrev10 = document.createElement("button");
  createBtnPrev10.classList.add("btn", "btn-primary", "btn-prev-10");
  createBtnPrev10.textContent = "10 prev";
  
  createBtnPrev10.addEventListener("click", async () => {
    await updatePageGroup(numberOfPageGroup - 1);
    const currentPage = categoryProducts.swiper.activeIndex -= 12;
    categoryProducts.swiper.slideTo(currentPage + 2);
    await categoryProducts.changePageFetchProducts(currentPage);
  });

  const createBtnNext10 = document.createElement("button");
  createBtnNext10.classList.add("btn", "btn-primary", "btn-next-10");
  createBtnNext10.textContent = "10 next";

  createBtnNext10.addEventListener("click", async () => {
    await updatePageGroup(numberOfPageGroup + 1);
    const currentPage = categoryProducts.swiper.activeIndex += 11;
    categoryProducts.swiper.slideTo(currentPage - 1);
    await categoryProducts.changePageFetchProducts(currentPage);
  });

  swiperContainer.prepend(createBtnPrev10);
  swiperContainer.append(createBtnNext10);
  
  return {createBtnPrev10, createBtnNext10};
}

const {createBtnPrev10, createBtnNext10} = createBtns();

function toggleGroupButtonsVisibility(btnPrev10, btnNext10) {
  btnPrev10.style.display = numberOfPageGroup === 0 ? 'none' : 'block';
  btnNext10.style.display = numberOfPageGroup === totalPageGroups - 1 ? 'none' : 'block';
}





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

// Initial check to set visibility of buttons
toggleGroupButtonsVisibility(createBtnPrev10, createBtnNext10);

// function debounce(func, wait) {
//   let timeout;
//   return function(...args) {
//     const context = this;
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func.apply(context, args), wait);
//   };
// }

// function handleResize() {
//   const currentBreakpoint = window.innerWidth;
  
//   switch(true){
//     case currentBreakpoint >= 992 && currentBreakpoint <= 1200:{
//       categoryProducts.defaultProductsAmount = 4;
//       const currentPage = categoryProducts.swiper.activeIndex + 1;
//       categoryProducts.clearItemsOnPage(currentPage);
//       categoryProducts.changePageFetchProducts(currentPage);
//       break;
//     }
//     case currentBreakpoint >= 1200 && currentBreakpoint <= 1600:{
//       const currentPage = categoryProducts.swiper.activeIndex + 1;
//       categoryProducts.defaultProductsAmount = 9;
//       categoryProducts.clearItemsOnPage(currentPage);
//       categoryProducts.changePageFetchProducts(currentPage);
//       break;
//     }
   
//   }
// }

// // Apply debounce to the resize handler
// const debouncedHandleResize = debounce(handleResize, 300);

// // Add the debounced resize event listener
// window.addEventListener('resize', debouncedHandleResize);

// // Initial check to set the correct breakpoint on page load
// handleResize();

