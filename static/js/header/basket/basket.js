import { Basket } from "../../classes/basket.js";
import { ProductManager } from "../../classes/product-manager.js"; 

export const productManager = new ProductManager();
export const basket = new Basket(productManager);



