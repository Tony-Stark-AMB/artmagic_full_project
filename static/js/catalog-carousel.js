import {Swiper, Pagination, Navigation} from "./import.js";

export const {catalogCarousel} = {
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

export const initCarousel = (className, config) => (new Swiper(className, config));


