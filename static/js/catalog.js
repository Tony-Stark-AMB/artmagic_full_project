import { initBasket } from "./basket.js";
import { rerenderImage } from "./common/index.js";

const images = document.querySelectorAll(".products-catalog__item__img")

document.addEventListener('DOMContentLoaded', () => rerenderImage(images));

initBasket("catalog");
