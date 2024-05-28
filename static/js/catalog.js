import { initBasket } from "./basket.js";
import { initImagesRation, rerenderImage } from "./common/index.js";
import { CATALOG, HOST, PORT, PROTOCOL } from "./common/constants.js";
import { Product } from "./classes/product.js";
import { catalogCarousel, initCarousel } from "./catalog-carousel.js";

initImagesRation(CATALOG);

const renderProductItem = ({name, id, imageSrc, price}, container) => {
    //<div class="products-catalog__item"></div>
    const productsCatalogItem = document.createElement("div");
    productsCatalogItem.classList.add("products-catalog__item");
    productsCatalogItem.addEventListener("click", () => {
        location.href = `${PROTOCOL}://${HOST}:${PORT}/detail/${id}`
    })
    // <div class="products-catalog__item__img__wrap"></div>
    const productsCatalogItemImgWrap = document.createElement("div");
    productsCatalogItemImgWrap.classList.add("products-catalog__item__img__wrap");
    productsCatalogItem.appendChild(productsCatalogItemImgWrap);
    // <div class="products-catalog__item__img"></div>
    const productsCatalogItemImg = document.createElement("img");
    productsCatalogItemImg.classList.add("products-catalog__item__img");
    productsCatalogItemImg.setAttribute("src", `/media/${imageSrc}`);
    productsCatalogItemImgWrap.appendChild(productsCatalogItemImg);
    // <div class="products-catalog__item__title"></div>
    const productsCatalogItemTitle = document.createElement("p");
    productsCatalogItemTitle.classList.add("products-catalog__item__title");
    productsCatalogItemTitle.textContent = name;
    productsCatalogItem.appendChild(productsCatalogItemTitle);
    const productsCatalogItemPrice = document.createElement("span");
    productsCatalogItemPrice.classList.add("products-catalog__item__price");
    productsCatalogItemPrice.textContent = price;
    productsCatalogItem.appendChild(productsCatalogItemPrice);
    const btn = document.createElement("button");
    btn.classList.add("btn", "btn-primary");
    btn.setAttribute("id", id);
    btn.textContent = "Купити";
    productsCatalogItem.appendChild(btn);

    container.appendChild(productsCatalogItem);
    
}

const productsRendering = (products, productsAmount, productsPerPage, page) => {
    for(let index = 0; index < Math.ceil((productsAmount < 10 ? 10 : productsAmount) / productsPerPage); index++){
        const swiperSlide = document.createElement("div");
        swiperSlide.classList.add("swiper-slide");
        //<div class="products-catalog__list"></div>
        const productsCatalogList = document.createElement("div");
        productsCatalogList.setAttribute("data-page", index + 1);
        productsCatalogList.classList.add("products-catalog__list");
        swiperSlide.appendChild(productsCatalogList);
        productsContainer.appendChild(swiperSlide);
    }

    const productsCatalogList = document.querySelectorAll(`.products-${CATALOG}__list`)[page - 1];
    products.forEach((product) => renderProductItem(product, productsCatalogList));

}





const productsContainer = document.getElementById("productsCatalogContainer");

const mapedProducts = (arr) => 
    arr.map(({name, image, id, price, manufacturer}) => 
        new Product(id, name, price, image, manufacturer));


const initFetchProducts = (page = 1) => {
    fetchProducts(page)
    .then(({products, productsAmount, productsPerPage}) => {
        const changedProducts = mapedProducts(products)
        productsRendering(changedProducts, productsAmount, productsPerPage, page);
        initBasket(CATALOG);
        const catalogCarouselInit = initCarousel(".main-catalog__carousel", catalogCarousel);
        catalogCarouselInit.on('slideChange', () => {
            const currentPage = catalogCarouselInit.activeIndex + 1;
            changePageFetchProducts(currentPage);
        })
    });
}

const fetchProducts = (page) => {
    const pageUrl = window.location.href.split("/").filter((part) => part != "");
    const slug = pageUrl[pageUrl.length - 1]
    // .replace("%D1%96r", "ir");

    // Example usage:

    const url = `http://localhost:8000/add-filters/${slug}?page=${page}`;

    return fetch(url, {
        method: "GET",
        mode: "cors"
    }).then((data)=> data.json())
} 



initFetchProducts();

const changePageFetchProducts = (page) => {
    const productsCatalogList = document.querySelectorAll(`.products-${CATALOG}__list`)[page - 1];
    if(productsCatalogList.hasChildNodes())
        return;

    fetchProducts(page)
    .then(({products}) => {
        const changedProducts = mapedProducts(products);
        changedProducts.forEach((product) => 
            renderProductItem(product, productsCatalogList));

        const images = document.querySelectorAll(`.products-${CATALOG}__item__img`);
        rerenderImage(images);
    })
}

