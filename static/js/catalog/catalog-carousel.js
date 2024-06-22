import { Pagination, Navigation } from "../import.js";
import { PageProducts } from "../classes/page-products.js";
import { basket } from "../header/basket/basket.js";

const {catalogCarouselConfig} = {
    catalogCarouselConfig: {
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
            renderBullet: (index, className) => {
                return `<span class="${className}">${index + 1}</span>`;
            },
        },
    },
    modules: [Pagination, Navigation]
}   



new PageProducts("catalog", "productsCatalogContainer", catalogCarouselConfig, basket);

// catalogProdutsCarousel.initFetchProducts().then(() => basket.initialize());


// const renderProductItem = ({name, id, imageSrc, price}, container) => {
//     //<div class="products-catalog__item"></div>
//     const productsCatalogItem = document.createElement("div");
//     productsCatalogItem.classList.add("products-catalog__item", "product-item");
//     productsCatalogItem.setAttribute("id", id);
//     // <div class="products-catalog__item__img__wrap"></div>
//     const productsCatalogItemImgWrap = document.createElement("div");
//     productsCatalogItemImgWrap.classList.add("products-catalog__item__img__wrap");
//     productsCatalogItem.appendChild(productsCatalogItemImgWrap);
//     // <div class="products-catalog__item__img"></div>
//     const productsCatalogItemImg = document.createElement("img");
//     productsCatalogItemImg.classList.add("products-catalog__item__img");
//     productsCatalogItemImg.setAttribute("src", `/media/${imageSrc}`);
//     productsCatalogItemImgWrap.appendChild(productsCatalogItemImg);
//     // <div class="products-catalog__item__title"></div>
//     const productsCatalogItemTitle = document.createElement("p");
//     productsCatalogItemTitle.classList.add("products-catalog__item__title");
//     productsCatalogItemTitle.textContent = name;
//     productsCatalogItem.appendChild(productsCatalogItemTitle);
//     const productsCatalogItemPrice = document.createElement("span");
//     productsCatalogItemPrice.classList.add("products-catalog__item__price");
//     productsCatalogItemPrice.textContent = price;
//     productsCatalogItem.appendChild(productsCatalogItemPrice);
//     const btn = document.createElement("button");
//     btn.classList.add("btn", "btn-primary", `products-catalog__item__btn`);
//     btn.setAttribute("data-item", "product_btn");
//     btn.textContent = "Купити";
//     productsCatalogItem.appendChild(btn);

//     container.appendChild(productsCatalogItem);
    
// }

// const productsRendering = (products, productsAmount, productsPerPage, page) => {
//     for(let index = 0; index < Math.ceil((productsAmount < 10 ? 10 : productsAmount) / productsPerPage); index++){
//         const swiperSlide = document.createElement("div");
//         swiperSlide.classList.add("swiper-slide");
//         //<div class="products-catalog__list"></div>
//         const productsCatalogList = document.createElement("div");
//         productsCatalogList.setAttribute("data-page", index + 1);
//         productsCatalogList.classList.add("products-catalog__list");
//         swiperSlide.appendChild(productsCatalogList);
//         productsContainer.appendChild(swiperSlide);
//     }

//     const productsCatalogList = document.querySelectorAll(`.products-${CATALOG}__list`)[page - 1];
//     products.forEach((product) => renderProductItem(product, productsCatalogList));

// }





// const productsContainer = document.getElementById("productsCatalogContainer");

// const mapedProducts = (arr) => 
//     arr.map(({name, image, id, price, manufacturer}) => 
//         new Product(id, name, price, image, manufacturer));


// const initFetchProducts = async (page = 1) => {
//     await fetchProducts(page)
//     .then(({products, productsAmount, productsPerPage}) => {
//         const changedProducts = mapedProducts(products)
//         productsRendering(changedProducts, productsAmount, productsPerPage, page);
//         const catalogCarouselInit = initCarousel(".main-catalog__carousel", catalogCarouselConfig);
//         catalogCarouselInit.on('slideChange', () => {
//             const currentPage = catalogCarouselInit.activeIndex + 1;
//             changePageFetchProducts(currentPage);
//         })
//     });
// }

// const fetchProducts = async (page) => {
//     const pageUrl = window.location.href.split("/").filter((part) => part != "");
//     const slug = pageUrl[pageUrl.length - 1]
//     // .replace("%D1%96r", "ir");

//     // Example usage:

//     const url = `http://localhost:8000/add-filters/${slug}?page=${page}`;

//     const data = await fetch(url, {
//         method: "GET",
//         mode: "cors"
//     });
//     return await data.json();
// } 



// await initFetchProducts().then(() => basket);

// const changePageFetchProducts = (page) => {
//     const productsCatalogList = document.querySelectorAll(`.products-${CATALOG}__list`)[page - 1];
//     if(productsCatalogList.hasChildNodes())
//         return;

//     fetchProducts(page)
//     .then(({products}) => {
//         const changedProducts = mapedProducts(products);
//         changedProducts.forEach((product) => 
//             renderProductItem(product, productsCatalogList));

//         const images = document.querySelectorAll(`.products-${CATALOG}__item__img`);
//         rerenderImage(images);
//     })
// }

