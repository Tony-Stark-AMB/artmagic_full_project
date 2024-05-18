import {Swiper, Navigation, Pagination} from "./import.js";

// function debounce(func, delay) {
//   let timerId;
  
//   return function(...args) {
//     clearTimeout(timerId);
//     timerId = setTimeout(() => {
//       func.apply(this, args);
//     }, delay);
//   };
// }

// // Your resize event handler function
// function handleResize() {
//   // Your code here
//   console.log("here");
//   productsCarousel.breakpoints = breakpointsProductsCarousel();
//   new Swiper(".products-index__list__wrap", productsCarousel);
// }

// // Debounce the handleResize function with a delay of 300ms
// const debouncedResizeHandler = debounce(handleResize, 300)

// const breakpointsProductsCarousel = () => {
//   return {
//     1800: {
//       slidesPerView: 5,
//       slidesPerGroup: 5,
//     },
//     1400: {
//       slidesPerView: 4,
//       slidesPerGroup: 4,
//     },
//     1200: {
//       slidesPerView: 3,
//       slidesPerGroup: 3,
//     },
//   }
// }

// window.addEventListener("resize", debouncedResizeHandler);

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
    slidesPerView: 1,
    slidesPerGroup: 1,
    spaceBetween: 10,
    speed: 2000,
    pagination: {
      clickable: true,
      el: ".swiper-pagination",
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + (index + 1) + "</span>";
      },
    },
    breakpoints: {
      
      

    },
  },
  modules: [Navigation, Pagination]
}

new Swiper(".main-index__banner", mainBanner);
new Swiper(".products-index__list__wrap", productsCarousel);



