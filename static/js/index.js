import { rerenderImage } from "./common/index.js";

const images = document.querySelectorAll(".products-index__item__img")

document.addEventListener('DOMContentLoaded', () => rerenderImage(images));

