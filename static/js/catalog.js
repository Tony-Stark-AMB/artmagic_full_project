import { initBasket } from "./basket.js";
import { initImagesRation } from "./common/index.js";
import { CATALOG } from "./common/constants.js";
import { Product } from "./classes/product.js";

initImagesRation(CATALOG);

const productsRendering = (products) => {

    products.forEach((prod, _, arr) => {
        //<div class="swiper-slide"></div>
        const swiperSlide = document.createElement("div");
        swiperSlide.classList.add("swiper-slide");
        //<div class="products-catalog__list"></div>
        const productsCatalogList = document.createElement("div");
        productsCatalogList.classList.add("products-catalog__list");
        swiperSlide.appendChild(productsCatalogList);
        
        arr.forEach(({name, id, imageSrc, price}) => {
            //<div class="products-catalog__item"></div>
            const productsCatalogItem = document.createElement("div");
            productsCatalogItem.classList.add("products-catalog__item");
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

            productsCatalogList.appendChild(productsCatalogItem);
        })
        
        productsContainer.appendChild(swiperSlide);
    });

    
}

const pageUrl = window.location.href.split("/").filter((part) => part != "");
const slug = pageUrl[pageUrl.length - 1]
// .replace("%D1%96r", "ir");
console.log(slug)
// Example usage:

const url = `http://localhost:8000/add-filters/${slug}`;

fetch(url, {
    method: "GET",
    mode: "cors"
})
.then((data)=> data.json())
.then((data) => {
    const {products} = data;
    const mapedProducts = products.map(({name, image, id, price, manufacturer}) => 
        new Product(id, name, price, image, manufacturer));
    productsRendering(mapedProducts);
    initBasket(CATALOG);
});

const productsContainer = document.getElementById("productsCatalogContainer");



