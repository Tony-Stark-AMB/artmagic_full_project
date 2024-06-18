const burgerMenuBtnOpen = document.querySelector('.header-nav__burger');
const burgerMenuBtnClose = document.querySelector('.mobile-menu__icon-close');
const burgerMenuEl = document.querySelector('.mobile-menu');
const burgerMenuList = document.querySelector('.mobile-menu__list');



const showBurgerMenu = () => {
  burgerMenuEl.classList.add("show");
  burgerMenuList.classList.add("show");
  burgerMenuBtnClose.classList.add("show");
}