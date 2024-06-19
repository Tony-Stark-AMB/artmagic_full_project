let textWrapper = document.querySelector('.logo__text .letters');
textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

anime.timeline({loop: true})
  .add({
    targets: '.logo__text .line',
    scaleX: [0,1],
    opacity: [0.5,1],
    easing: "easeInOutExpo",
    duration: 1500
  }).add({
    targets: '.logo__text .letter',
    opacity: [0,1],
    translateX: [40,0],
    translateZ: 0,
    scaleX: [0.3, 1],
    easing: "easeOutExpo",
    duration: 1800,
    offset: '-=600',
    delay: (el, i) => 150 + 25 * i
  }).add({
    targets: '.logo__text',
    opacity: 0,
    duration: 3000,
    easing: "easeOutExpo",
    delay: 3000
  });


//header-burger
const burgerMenuBtnOpen = document.querySelector('.nav__burger');
const burgerMenuBtnClose = document.querySelector('.mobile-menu__icon-close');
const burgerMenuEl = document.querySelector('.mobile-menu');
const burgerMenuList = document.querySelector('.mobile-menu__list');



// const showBurgerMenu = () => {
//   burgerMenuEl.classList.add("show");
//   burgerMenuList.classList.add("show");
//   burgerMenuBtnClose.classList.add("show");
// }

// const closeBurgerMenu = () => {
//   burgerMenuEl.classList.remove("show");
//   burgerMenuList.classList.remove("show");
//   setTimeout( () => burgerMenuBtnClose.classList.remove("show"), 650);
// }

//catalog header
const [productsBtn, promotionBtn] = document.querySelectorAll('.catalog-header-btn');
const catalogInfo = document.querySelector('.catalog-info');
const catalogProducts = document.querySelector('.catalog-products');

const toggleCatalogHeader = (e) => {
  if(e.target === productsBtn && !productsBtn.classList.contains("active")){
    productsBtn.classList.add("active");
    promotionBtn.classList.remove("active");
    catalogProducts.classList.add("active");
    catalogInfo.classList.remove("active");
  }
  if(e.target === promotionBtn && !promotionBtn.classList.contains("active")){
    promotionBtn.classList.add("active");
    productsBtn.classList.remove("active");
    catalogInfo.classList.add("active");
    catalogProducts.classList.remove("active");
  }
}

// for sidemenu
const openNav = () => {
  document.getElementById("mySidenav").style.width = "400px";
  const fullContent = document.querySelector('.full-content');
  fullContent.style.marginLeft = "400px";
  fullContent.style.opacity = "0.8";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
const closeNav = () => {
  document.getElementById("mySidenav").style.width = "0";
  const fullContent = document.querySelector('.full-content');
  fullContent.style.marginLeft = "0";
  fullContent.style.opacity = "1";
  document.getElementById("mySidenav").style.opacity = "1";
}

import { Swiper, Navigation } from "./import.js";

new Swiper(".login__registration", {
  direction: "vertical",
  navigation: {
    nextEl: ".swiper-btn-next",
    prevEl: ".swiper-btn-prev",
  },
  speed: 1000,
  allowTouchMove: false,
  noSwiping: false,
  modules: [Navigation]
});

new Swiper(".basket__modal__swiper", {
  navigation: {
    nextEl: ".swiper-btn-next",
    prevEl: ".swiper-btn-prev",
  },
  speed: 1000,
  allowTouchMove: false,
  noSwiping: false,
  modules: [Navigation]
});


