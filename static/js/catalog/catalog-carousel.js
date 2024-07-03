import { Swiper, Pagination, Navigation } from "../import.js";
import { PageProducts } from "../classes/page-products.js";
import { basket } from "../header/basket/basket.js";

const pageName = "catalog";

const swiperContainer = document.querySelector(`.main-${pageName}__carousel`);

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

function updatePageGroup(newGroupIndex) {
  numberOfPageGroup = newGroupIndex;
  catalogProductsSwiper.pagination.render();
  catalogProductsSwiper.pagination.update();
  toggleGroupButtonsVisibility(createBtnPrev10, createBtnNext10);
}

function updatePagination(totalSlides) {
  const itemsPerGroup = catalogProducts.defaultProductsAmount;
  totalPageGroups = Math.ceil(totalSlides / itemsPerGroup);
}
  
const createBtns = () => {
  const createBtnPrev10 = document.createElement("button");
  createBtnPrev10.classList.add("btn", "btn-primary", "btn-prev-catalog-10");
  createBtnPrev10.textContent = "10 prev";
  
  createBtnPrev10.addEventListener("click", async () => {
    updatePageGroup(numberOfPageGroup - 1);
    const currentPage = catalogProducts.swiper.activeIndex -= 12;
    catalogProducts.swiper.slideTo(currentPage + 2);
  });

  const createBtnNext10 = document.createElement("button");
  createBtnNext10.classList.add("btn", "btn-primary", "btn-next-catalog-10");
  createBtnNext10.textContent = "10 next";

  createBtnNext10.addEventListener("click", async () => {
    updatePageGroup(numberOfPageGroup + 1);
    const currentPage = catalogProducts.swiper.activeIndex += 11;
    catalogProducts.swiper.slideTo(currentPage - 1);
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
  

const {catalogCarouselConfig} = {
    catalogCarouselConfig: {
        pagination: customPagination
    },
    modules: [Pagination, Navigation]
}   

const catalogProductsSwiper = new Swiper( `.main-${pageName}__carousel`, catalogCarouselConfig)
const catalogProducts = new PageProducts(pageName, "productsCatalogContainer", catalogProductsSwiper, basket);

toggleGroupButtonsVisibility(createBtnPrev10, createBtnNext10);

let resizeTimeout;

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(async () => await resizeLogic(), 300);
});

async function resizeLogic (){
  catalogProducts.setResponsiveProductsAmount();
  catalogProducts.productsContainer.replaceChildren();
  const { products, productsAmount, productsPerPage } = await catalogProducts.fetchProducts(1);
  catalogProducts.renderProductsLists(productsAmount, productsPerPage);
  catalogProducts.productsLists = document.querySelectorAll(`.products-${catalogProducts.pageName}__list`);
  
  const mappedProducts = catalogProducts.mapProducts(products);
  catalogProducts.renderProductsItems(mappedProducts, 1);  // Add render products for the first page

  catalogProducts.swiper.on('slideChange', async () => {
    const currentPage = catalogProducts.swiper.activeIndex + 1;
    await catalogProducts.changePageFetchProducts(currentPage);
  });
  
  await catalogProducts.basket.initialize();
  catalogProducts.swiper.slideTo(0);
  
  updatePagination(catalogProductsSwiper.slides.length);
}

document.addEventListener('DOMContentLoaded', async () => await resizeLogic());