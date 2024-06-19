const burgerMenuBtnOpen = document.querySelector('.header-nav__burger');
const burgerMenuBtnClose = document.querySelector('.mobile-menu__icon-close');
const burgerMenuEl = document.querySelector('.mobile-menu');
const burgerMenuList = document.querySelector('.mobile-menu__list');



const showBurgerMenu = () => {
  burgerMenuEl.classList.add("show");
  burgerMenuList.classList.add("show");
  burgerMenuBtnClose.classList.add("show");
  burgerMenuEl.style.zIndex = "1010";
  document.body.classList.add("no-scroll");
}
  
  const closeBurgerMenu = () => {
    burgerMenuEl.classList.remove("show");
    burgerMenuList.classList.remove("show");
    document.body.classList.remove("no-scroll");
  setTimeout( () => {
    burgerMenuBtnClose.classList.remove("show");
    burgerMenuEl.style.zIndex = "-1";
  }, 1000);
}

