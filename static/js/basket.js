import { Product } from "./classes/product.js";
import { rerenderImage, isFloat  } from "./common/index.js";
import { HOST, PROTOCOL, PORT } from "./common/constants.js";

const initProducts = () => {

    const products = {
        arr: []
    }

    return {
        getProducts: () => products ?? [],
        getStorageProducts: function() {
            const products = JSON.parse(localStorage.getItem("products"))
            console.log(this.mapObjectsInProducts(products))
            return  this.mapObjectsInProducts(products) ?? [];
        },
        setProducts: (obj) => (products.arr = obj),
        setStorageProducts: (products) => {
            return localStorage.setItem("products",  JSON.stringify(products))
        },
        deleteProduct: (id) => products.arr = products.arr.filter((product) => product.id !== id),
        _addProduct: function ({id, name, price, quantity, image, manufacturer}) {
            const existProduct = this._existProduct(id);
            if(existProduct)
                existProduct.addOne();
            else
                products.arr = [...products.arr, new Product(id, name, price, image, manufacturer, quantity)];  
        },
        mapObjectsInProducts: (products) => {
            return products.arr = products.arr.map(({id, name, price, quantity, imageSrc, manufacturerId}) => 
                new Product(id, name, price, imageSrc, manufacturerId, quantity))
        },
        fetchNewProduct: async function (id){
            const response = fetch(`${PROTOCOL}://${HOST}:${PORT}/add-to-cart/?id=${id}`, {
                method: "GET",
                mode: "cors"
            }).then((data) => data.json())

            const product = await response;

            this._addProduct(product);
            
        },
        _existProduct: (id) => (products.arr.find((product) => product.id === id) ?? null),
        productsTotalCount: () => products.arr.reduce((acc, cur) => acc + cur.quantity, 0),
        currentProductTotalPrice: (id, priceOutputFn, amountAfterQuote) => {
            const curentProduct = products.arr.find((product) => product.id === id);
            return priceOutputFn(curentProduct.quantity * curentProduct.price, amountAfterQuote)
        },
        allProductsTotalPrice: function (priceOutputFn, amountAfterQuote)  {
            return this._priceOutputFn(
                products.arr.reduce((acc, cur) => 
                    acc + +this.currentProductTotalPrice(cur.id, priceOutputFn, amountAfterQuote), 0),
                amountAfterQuote);
        },
        _priceOutputFn: (number, amountAfterQuote) => number.toFixed(amountAfterQuote),
        setProductQuantity: function (id, value){
            const curentProduct = this._existProduct(id);
            return curentProduct.setQuantity(value);
        }
    }
}

const initBasket = (page) => {

    const btns = document.querySelectorAll(`.products-${page}__item__btn`);
    const productsContainer = document.getElementById("basket-products");
    
    // Ініціалізація кнопок
    (() => {
        btns.forEach((btn) => btn.addEventListener("click", async (e) =>  {
            const item = e.target.closest(`div.products-${page}__item`);
            if(item){
                await products.fetchNewProduct(item.getAttribute("id"));
                badgeAnimation();
                commonRerenderingLogic();
            }
        }))
    })();
    
    const renderProductsView = (productsArr) => {
        productsArr.arr.forEach( ({id, quantity, imageSrc, name}) => {
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
            buttonMinus.addEventListener("click", (e) => changeProductQuantityView("-", id))
            buttonMinus.textContent = "-";
            cartProductBtns.appendChild(buttonMinus);
            // <input class="btns__count"/>
            const buttonCount = document.createElement("input");
            buttonCount.classList.add("btns__count");
            buttonCount.setAttribute("type", "text");
            buttonCount.setAttribute("id", `btn_count_${id}`)
            buttonCount.setAttribute("value", `${quantity}`);
            buttonCount.addEventListener("input", (e) => changeProductQuantityView("count", id))
            cartProductBtns.appendChild(buttonCount);
            // <button class="btns__btn">+</button>
            const buttonPlus = document.createElement("button");
            buttonPlus.classList.add("btns__btn");
            buttonPlus.addEventListener("click", (e) => changeProductQuantityView("+", id));
            buttonPlus.textContent = "+";
            cartProductBtns.appendChild(buttonPlus);
            // <div class="cart__product__price"></div>
            const cartProductPrice = document.createElement("div");
            cartProductPrice.classList.add("cart__product__price");
            // cartProductPrice.setAttribute("id", `product_price_${id}`);
            cartProductPrice.textContent = `${products.currentProductTotalPrice(id, products._priceOutputFn, 2)} грн`
            // cartProductPrice.textContent = "0";
            cartProduct.appendChild(cartProductPrice);
            // <button class="cart__product__garbage__wrap"></button>
            const cartProductGarbageWrap = document.createElement("button");
            cartProductGarbageWrap.classList.add("cart__product__garbage__wrap");
            cartProductGarbageWrap.addEventListener("click", (e) => deleteProductHandler(e));
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
    };

    const clearProductsView = () => 
        productsContainer.replaceChildren();
 
    const badge = document.querySelector(".header-basket__icon__badge");
    const badgeContent = document.querySelector(".header-basket__icon__badge__number");

    const badgeAnimation = () => {
        badge.classList.add("add__product__animation");
        setTimeout(() => badge.classList.remove("add__product__animation"), 200)
    }

    const badgeCounter = (amount) => {badgeContent.textContent = amount};

    const allProductCostElement = document.querySelector(".modal-footer__text");

    const setAllProductsCostView = () => 
        {allProductCostElement.textContent = `${products.allProductsTotalPrice(products._priceOutputFn, 2)} грн`};

    const deleteProductHandler = (e) => {
        const splitedId = e.target.closest("div.cart__product").getAttribute("id").split("__");
        const id = splitedId[splitedId.length - 1];
        products.deleteProduct(+id);
        commonRerenderingLogic();
    }

    const commonRerenderingLogic = () => {
        badgeCounter(products.productsTotalCount());
        clearProductsView();
        renderProductsView(products.getProducts());
        setAllProductsCostView();
    }

    const changeProductQuantityView = (eventType, id) => {
        
        const {curProduct, curProductInput, curProductPriceOutput} = getCurProductItemsForRerendering(id);
        const curProductInputValue = +curProductInput.value;
        if (!/^-?\d*$/.test(curProductInputValue) || isNaN(curProductInputValue)) {
            curProductInput.value = 0;
            return;
        } 
        switch(eventType){
            case "+":
                curProduct.addOne();
                rerenderingWhileCountUpdate(curProduct, curProductInput, curProductPriceOutput);
                break;
            case "-":{
                    if(curProductInputValue <= 0)
                      return;
                    curProduct.minusOne()
                }
                rerenderingWhileCountUpdate(curProduct, curProductInput, curProductPriceOutput);
                break;
            case "count":
                curProduct.setQuantity(curProductInputValue);
                rerenderingWhileCountUpdate(curProduct, curProductInput, curProductPriceOutput);
                break;
            default: 
                return;
        } 
    };

    const rerenderingWhileCountUpdate = (curProduct, curProductInput, curProductPriceOutput) => {
        curProductInput.value = curProduct.quantity;
        setAllProductsCostView();
        curProductPriceOutput.textContent = `${products.currentProductTotalPrice(curProduct.id, products._priceOutputFn, 2)} грн`;
        badgeCounter(products.productsTotalCount());
    }

    const getCurProductItemsForRerendering = (id) => {
        return {
            curProduct: products._existProduct(id),
            curProductInput: document.querySelector(`#btn_count_${id}`),
            curProductPriceOutput: document.querySelector(`#cart__product__${id}`).querySelector(".cart__product__price")
        }
    }

    products.setProducts(products.getStorageProducts()); 
    commonRerenderingLogic();
    
    window.addEventListener("beforeunload", () => {
        products.setStorageProducts(products.getProducts());
    })

  
}

const products = initProducts();

export const basket = (page) => initBasket(page);




