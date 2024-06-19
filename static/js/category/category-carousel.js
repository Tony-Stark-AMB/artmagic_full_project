import { Swiper, Navigation, Pagination } from "../import.js";

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

new Swiper(".category-banner", categoryBanner);
new Swiper(".category-brands", brandsBanner);
new Swiper(".products-category__carousel", productsCarousel); 