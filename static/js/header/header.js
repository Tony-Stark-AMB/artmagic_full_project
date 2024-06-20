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

import { Swiper, Navigation } from "../import.js";

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

const images = document.querySelectorAll(".overlook__img");
rerenderImage(images);

