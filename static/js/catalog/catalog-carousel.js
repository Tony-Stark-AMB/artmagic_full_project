// import { Swiper, Pagination, Navigation } from "../import.js";
import { PageProducts } from "../classes/page-products.js";
// import { PageProducts } from "../classes/page-products.js";
import { basket } from "../header/basket/basket.js";

const pageName = "catalog";

export const pageProductsCatalog = new PageProducts(pageName, "productsCatalogContainer",  `.main-${pageName}__carousel`, basket).initializePage();




