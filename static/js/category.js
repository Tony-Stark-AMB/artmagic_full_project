import { createProducts, Product } from "./classes/product.js";

const productsContainers = document.querySelectorAll(".products-category__list");
productsContainers.forEach((item, i) => item.setAttribute("id", `productsContainer_${i + 1}`));
console.log(productsContainers)

const productsPagesArr = [
    [],
    [],
    [],
];

for(let i = 1; i < 4; i++){
    const productsContainer = document.getElementById(`productsContainer_${i}`)
    for(let j = 0; j < 15; j++){
        productsPagesArr[i - 1][j] = new Product(`product ${i - 1 + j}`, 500 * i + j * 100, `./assets/products/product-${i}.png`)
    }
    createProducts("category", productsPagesArr[i - 1], productsContainer);
}

console.log(productsPagesArr)

