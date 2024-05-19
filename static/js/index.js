import { rerenderImage } from "./common/index.js";
import {initBasket} from "./basket.js"
// for images ratio
const images = document.querySelectorAll(".products-index__item__img")

document.addEventListener('DOMContentLoaded', () => rerenderImage(images));
// for products working
initBasket("index");

