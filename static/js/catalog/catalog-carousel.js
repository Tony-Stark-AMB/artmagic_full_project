import { Swiper, Pagination, Navigation } from "../import.js";
import { PageProducts } from "../classes/page-products.js";
import { basket } from "../header/basket/basket.js";

const pageName = "catalog";

const {catalogCarouselConfig} = {
    catalogCarouselConfig: {
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
            renderBullet: (index, className) => {
                return `<div class="d-grid btn-pag ${className}">
                            <span>${index + 1}</span>
                        </div>`;
            },
        },
    },
    modules: [Pagination, Navigation]
}   


const catalogProductsSwiper = new Swiper( `.main-${pageName}__carousel`, catalogCarouselConfig)
new PageProducts(pageName, "productsCatalogContainer", catalogProductsSwiper, basket);

