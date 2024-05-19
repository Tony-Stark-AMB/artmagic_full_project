import { Product } from "./classes/product.js";
import { HOST, PROTOCOL, PORT, rerenderImage, isFloat  } from "./common/index.js";

export const products = {
    arr: []
}
    
const productsContainer = document.getElementById("basket-products");

export const renderProducts = (productsArr) => {
    productsArr.forEach( ({id, price, quantity, imageSrc, name}) => {
        // <div class="cart__product"></div>
        const cartProduct = document.createElement("div");
        cartProduct.classList.add("cart__product");
        cartProduct.setAttribute("id", `cart__product__${id}`);
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
        overlookImg.setAttribute("src", `/media/${ imageSrc}`);
        overlookImgWrap.appendChild(overlookImg);
        // <p class="overlook__name"></p>
        const overlookName = document.createElement("div");
        overlookName.classList.add("overlook__name");
        overlookName.textContent = name;
        cartProductOverlook.appendChild(overlookName);
        // <div class="cart__product__btns"></div>
        const cartProductBtns = document.createElement("div");
        cartProductBtns.classList.add("cart__product__btns");
        cartProduct.appendChild(cartProductBtns);
        // <button class="btns__btn">-</button>
        const buttonMinus = document.createElement("button");
        buttonMinus.classList.add("btns__btn");
        buttonMinus.addEventListener("click", () => changeProductQuantity("-", id))
        buttonMinus.textContent = "-";
        cartProductBtns.appendChild(buttonMinus);
        // <input class="btns__count"/>
        const buttonCount = document.createElement("input");
        buttonCount.classList.add("btns__count");
        buttonCount.setAttribute("type", "text");
        buttonCount.setAttribute("id", `btn_count_${id}`)
        buttonCount.setAttribute("value", `${quantity}`);
        buttonCount.addEventListener("input", () => changeProductQuantity("count", id))
        cartProductBtns.appendChild(buttonCount);
        // <button class="btns__btn">+</button>
        const buttonPlus = document.createElement("button");
        buttonPlus.classList.add("btns__btn");
        buttonPlus.addEventListener("click", () => changeProductQuantity("+", id));
        buttonPlus.textContent = "+";
        cartProductBtns.appendChild(buttonPlus);
        // <div class="cart__product__price"></div>
        const cartProductPrice = document.createElement("div");
        cartProductPrice.classList.add("cart__product__price");
        cartProductPrice.setAttribute("id", `product_price_${id}`);
        cartProductPrice.textContent = priceCorrectOutput(price, quantity);
        cartProduct.appendChild(cartProductPrice);
        // <button class="cart__product__garbage__wrap"></button>
        const cartProductGarbageWrap = document.createElement("button");
        cartProductGarbageWrap.classList.add("cart__product__garbage__wrap");
        cartProductGarbageWrap.addEventListener("click", () => deleteProduct(id));
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
        const images = document.querySelectorAll('.overlook__img');
        rerenderImage(images);
    });
}

renderProducts(products.arr);

const changeProductQuantity = (type, id) => {
    // console.log(productsArr, "productsArr", products, "products");
    const changedProduct = products.arr.find((product) => product.id === id);
    const btnInput = document.getElementById(`btn_count_${id}`);
    const totalPrice = document.getElementById(`product_price_${id}`);
    
    switch(type){
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
            return;
    }
    changeProductQuantityData(btnInput, totalPrice, changedProduct);
    getAllTotal(products.arr);
}

const changeProductQuantityData = (btnInput, totalPrice, changedProduct) => {
    badgeCounter(Product.allProductsQuantity(products.arr));
    btnInput.value = +changedProduct.quantity;
    totalPrice.textContent =  priceCorrectOutput(changedProduct.price, +changedProduct.quantity); 
}

const priceCorrectOutput = (price, ...quantity) => {
    if(quantity){
        quantity[0] = 1;
    }
    return isFloat(price) 
    ?   `${(quantity[0] * price).toFixed(2)} грн`
    :   `${quantity[0] * price}.00 грн`;
}

const modalFooterGetAllTotal = document.querySelector(".modal-footer__text");

const getAllTotal = () => {
    modalFooterGetAllTotal.textContent = Product.allTotalCost(products.arr) == 0 
    ? priceCorrectOutput(Product.allTotalCost(products.arr))
    : priceCorrectOutput(Product.allTotalCost(products.arr));
}

getAllTotal(products.arr);

const deleteProduct = (id) => {
    products.arr = Product.deleteProduct(products.arr, id)
    document.getElementById(`cart__product__${id}`).remove();
    if(products.length == 0){
        emptyBasket("Ваш кошик порожній");
    }
    getAllTotal(products.arr);
    badgeCounter(Product.allProductsQuantity(products.arr));
  
}

const emptyBasket = (emptyBasketText) => {
    const text = document.createElement("p")
    text.textContent = emptyBasketText;
    text.classList.add("basket__modal__cart__text");
    if(products.arr.length == 0){
        productsContainer.appendChild(text);
    } 
}

emptyBasket("Ваш кошик порожній");  

const addToCart = async (id) => {
    return fetch(`${PROTOCOL}://${HOST}:${PORT}/add-to-cart/?id=${id}`, {
        method: "GET",
        mode: "cors"
    }).then((data) => data.json());
}

export const initBasket = (page) => {
   const cardsContainers = document.querySelectorAll(`div.products-${page}__list`);

   Array.from(cardsContainers).forEach(arr => arr.addEventListener("click", (e) => addToCartLogic(e)));
}

export const addToCartLogic = async (e) => {
    const el = e.target;
    if(el.hasAttribute("id")){
        const {id, name, price, image} = await addToCart(el.getAttribute("id"));
        const newProduct = new Product(id, name, +price, image);
        if(id && (products.arr.findIndex((product) => product.id === newProduct.id)) == -1){
            products.arr = [newProduct, ...products.arr];
            productsContainer.replaceChildren();
            renderProducts(products.arr);
        } else {
            const changedProduct = products.arr.find((product) => product.id === newProduct.id);
            const btnInput = document.getElementById(`btn_count_${id}`);
            const totalPrice = document.getElementById(`product_price_${id}`);
            changedProduct.addOne();
            changeProductQuantityData(btnInput, totalPrice, changedProduct);
            getAllTotal(products.arr);
        }
        getAllTotal(products.arr);
        // badgeCounter(products.arr.length);
        badgeCounter(Product.allProductsQuantity(products.arr));
        badgeAnimation();
    }
    return;
    
}

const badge = document.querySelector(".header-basket__icon__badge");
const badgeContent = document.querySelector(".header-basket__icon__badge__number");

const badgeAnimation = () => {
    badge.classList.add("add__product__animation");
    setTimeout(() => badge.classList.remove("add__product__animation"), 200)
}

const badgeCounter = (amount) => {
    badgeContent.textContent = amount;
}


//for form 

const cardInput = document.querySelector(".card-input");
const walletInput = document.querySelector(".wallet-input");

const cardSvg = document.querySelector('.card-img');
const walletSvg = document.querySelector('.wallet-img');

const cardNumberInput = document.getElementById("card-input")

cardSvg.style.color = '#3e77aa'; // Change color for card SVG
walletSvg.style.color = '#7d7d7d'; // Reset color for wallet SVG

function handleInputChange() {
    if (cardInput.checked) {
        cardNumberInput.style.display = "block";
        cardSvg.style.color = '#3e77aa'; // Change color for card SVG
        walletSvg.style.color = '#7d7d7d'; // Reset color for wallet SVG
    } else if (walletInput.checked) {
        cardNumberInput.style.display = "none";
        walletSvg.style.color = '#3e77aa'; // Change color for wallet SVG
        cardSvg.style.color = '7d7d7d'; // Reset color for card SVG
    }
}

cardInput.addEventListener('change', handleInputChange);
walletInput.addEventListener('change', handleInputChange);