import {Swiper, Pagination, Navigation} from "./import.js";

const {catalogCarousel} = {
    catalogCarousel: {
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
            renderBullet: (index, className) => {
                return '<span class="' + className + '">' + (index + 1) + "</span>";
            },
        },
    },
    modules: [Pagination, Navigation]
}   

new Swiper(".main-catalog__carousel", catalogCarousel);
