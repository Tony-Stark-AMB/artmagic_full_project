import { Product } from "./classes/product.js";
import { HOST, PROTOCOL, PORT } from "./common/index.js";


export const products = {
    arr: []
}
    
const productsContainer = document.getElementById("basket-products");


export const createProducts = (products) => {
    products.forEach( (product) => {
        // <div class="cart__product"></div>
        const cartProduct = document.createElement("div");
        cartProduct.classList.add("cart__product");
        cartProduct.setAttribute("id", `cart__product__${product.id}`);
        // <div class="cart__product__overlook"></div>
        const cartProductOverlook = document.createElement("div");
        cartProductOverlook.classList.add("cart__product__overlook");
        cartProduct.appendChild(cartProductOverlook);
        // <div class="overlook__img__container">
        const overlookImgContainer = document.createElement("div");
        overlookImgContainer.classList.add("overlook__img__container");
        cartProductOverlook.appendChild(overlookImgContainer);
        // <div class="overlook__img__wrap"></div>
        const overlookImgWrap = document.createElement("div");
        overlookImgWrap.classList.add("overlook__img__wrap");
        overlookImgContainer.appendChild(overlookImgWrap);
        // <img class="overlook__img"/>
        const overlookImg = document.createElement("img");
        overlookImg.classList.add("overlook__img");
        overlookImg.setAttribute("src", `/media/${product.imageSrc}`);
        overlookImgWrap.appendChild(overlookImg);
        // <p class="overlook__name"></p>
        const overlookName = document.createElement("div");
        overlookName.classList.add("overlook__name");
        overlookName.textContent = product.name;
        cartProductOverlook.appendChild(overlookName);
        // <div class="cart__product__btns"></div>
        const cartProductBtns = document.createElement("div");
        cartProductBtns.classList.add("cart__product__btns");
        cartProduct.appendChild(cartProductBtns);
        // <button class="btns__btn">-</button>
        const buttonMinus = document.createElement("button");
        buttonMinus.classList.add("btns__btn");
        buttonMinus.setAttribute("data-value", "-");
        buttonMinus.addEventListener("click", (e) => changeProductQuantity(e, product.id))
        buttonMinus.textContent = "-";
        cartProductBtns.appendChild(buttonMinus);
        // <input class="btns__count"/>
        const buttonCount = document.createElement("input");
        buttonCount.classList.add("btns__count");
        buttonCount.setAttribute("type", "text");
        buttonCount.setAttribute("id", `btn_count_${product.id}`)
        buttonCount.setAttribute("value", `${product.quantity}`);
        buttonCount.setAttribute("data-value", "count")
        buttonCount.addEventListener("input", (e) => changeProductQuantity(e, product.id))
        cartProductBtns.appendChild(buttonCount);
        // <button class="btns__btn">+</button>
        const buttonPlus = document.createElement("button");
        buttonPlus.classList.add("btns__btn");
        buttonPlus.setAttribute("data-value", "+");
        buttonPlus.addEventListener("click", (e) => changeProductQuantity(e, product.id));
        buttonPlus.textContent = "+";
        cartProductBtns.appendChild(buttonPlus);
        // <div class="cart__product__price"></div>
        const cartProductPrice = document.createElement("div");
        cartProductPrice.classList.add("cart__product__price");
        cartProductPrice.setAttribute("id", `product_price_${product.id}`);
        cartProductPrice.textContent = `${product.quantity * product.price}.00 грн`;
        cartProduct.appendChild(cartProductPrice);
        // <button class="cart__product__garbage__wrap"></button>
        const cartProductGarbageWrap = document.createElement("button");
        cartProductGarbageWrap.classList.add("cart__product__garbage__wrap");
        cartProductGarbageWrap.addEventListener("click", (e) => deleteProduct(product.id));
        cartProduct.appendChild(cartProductGarbageWrap);
        // <svg class="cart__product__garbage">
        const cartProductGarbageIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        cartProductGarbageIcon.classList.add("cart__product__garbage");
        cartProductGarbageIcon.setAttribute("viewBox", "0 0 448 512");
        cartProductGarbageIcon.setAttribute("fill", "currentColor");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320
        32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32
        128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0
        8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16
        16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2
        16-16V208c0-8.8-7.2-16-16-16z`);
        cartProductGarbageIcon.appendChild(path);
        cartProductGarbageWrap.appendChild(cartProductGarbageIcon);
       
        // Додаванння продуктів до контейнеру
        productsContainer.append(cartProduct);       
    });
    // <button class="btn btn-primary basket__modal__btn"></button>
    // const btnBackToShopping = document.createElement("button");
    // btnBackToShopping.classList.add("btn", "btn-primary", "basket__modal__btn");
    // btnBackToShopping.setAttribute("onclick", "window.location.href = 'catalog.html'");
    // btnBackToShopping.textContent = "Повернутись до покупок";
    // productsContainer.append(btnBackToShopping);
}

createProducts(products.arr);

function changeProductQuantity(e, id){
    const changedProduct = products.arr.find((product) => product.id === id);
    const btnInput = document.getElementById(`btn_count_${id}`);
    const totalPrice = document.getElementById(`product_price_${id}`);
    
    switch(e.target.dataset.value){
        case "+":{
            changedProduct.addOne();
            break;
        }
        case "-": {
            changedProduct.minusOne();
            break;
        }
        case "count": {
            changedProduct.setQuantity(+btnInput.value);
            break;
        }
        default: 
            return
    }
    changeProductQuantityData(btnInput, totalPrice, changedProduct);

    getAllTotal(products.arr);
}

const changeProductQuantityData = (btnInput, totalPrice, changedProduct) => {
    btnInput.value = +changedProduct.quantity;
    totalPrice.textContent = `${changedProduct.quantity * changedProduct.price}.00 грн`; 
}

const getAllTotal = (productsArr) => {
    const target = document.querySelector(".modal-footer__text");
    target.textContent = Product.allTotalCost(productsArr) == 0 
    ? `0.00 грн` 
    : `${Product.allTotalCost(productsArr)}.00 грн`;
}

getAllTotal(products.arr);

const deleteProduct = (id) => {
    console.log(id)
    products.arr = Product.deleteProduct(products.arr, id);
    document.getElementById(`cart__product__${id}`).remove();
    if(products.arr.length <= 3){
        productsContainer.style.overflowY = "hidden";
    }
    productsContainer.style.overflowY = "auto";
    // text for empty basket
    const text = document.createElement("p")
    text.textContent = "Ваш кошик пустий";
    text.classList.add("basket__modal__cart__text");
    if(products.arr.length == 0){
        productsContainer.appendChild(text);
    } 
    

    getAllTotal(products.arr);
}

const addToCart = async (id) => {
    return fetch(`${PROTOCOL}://${HOST}:${PORT}/add-to-cart/?id=${id}`, {
        method: "GET",
        mode: "cors"
    }).then((data) => data.json())
}


const cardsContainer = document.querySelector("div.products-index__list");

cardsContainer.addEventListener("click", async (e) => {
    const el = e.target;
    if(el.hasAttribute("id")){
        const {id, name, price, image} = await addToCart(el.getAttribute("id"));
        if(id){
            products.arr = [new Product(id, name, +price, image), ...products.arr];
            console.log(products.arr);
            productsContainer.replaceChildren();
            createProducts(products.arr);
            getAllTotal(products.arr);
        }
    }
    return;
})
