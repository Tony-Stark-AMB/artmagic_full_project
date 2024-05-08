import {Swiper, Navigation, Pagination} from "./import.js";

export const {mainBanner, productsCarousel} = {
 
  mainBanner: {
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    speed: 2000,
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      dynamicBullets: true,
    },
  },
  productsCarousel: {
    slidesPerView: 5,
    slidesPerGroup: 5,
    speed: 2000,
    pagination: {
      clickable: true,
      el: ".swiper-pagination",
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + (index + 1) + "</span>";
      },
    },
  },
  modules: [Navigation, Pagination]
}

new Swiper(".main-index__banner", mainBanner);
new Swiper(".products-index__list__wrap", productsCarousel);



