export class Basket {
    constructor(productManager) {
        this.productManager = productManager;
        this.productsContainer = document.getElementById("basket-products");
        this.badge = document.querySelector(".header-basket__icon__badge");
        this.badgeContent = document.querySelector(".header-basket__icon__badge__number");
        this.allProductCostElement = document.querySelector(".modal-footer__text");
        this.images = document.querySelectorAll(".overlook__img");
        this.pageName = "index";
        window.onbeforeunload = () => {
            this.productManager.setStorageProducts(this.productManager.getProducts());
        };
        window.addEventListener("pageshow", () => {
            this.productManager.loadProductsFromStorage();
            this.renderBasket()
        })
    }

    initialize() {
        this.initProductsBuyBtns();
        this.renderBasket();
    }

    initProductsBuyBtns(page = 1){
        const productList = document.querySelectorAll(`.products-${this.pageName}__list`)[page - 1];
        const btns = productList.querySelectorAll(`button[data-item="product_btn"]`);
        btns.forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const id = +e.target.closest(`div.product-item`).getAttribute("id");
                const product = await this.productManager.fetchNewProduct(id);
                await this.productManager.addProduct(product);
                this.renderBasket();
                this.animateBadge();
            });
        });
        this.addEventToDetailePage(productList);
    }

    addEventToDetailePage(productList){
        const products = productList.querySelectorAll(`div.product-item`);
        products.forEach(productElement => {
            productElement.addEventListener("click", (e) => {
                if(e.target.tagName === "BUTTON")
                    return 
                const currentEl = e.currentTarget;
                const currentElId = +currentEl.getAttribute("id");
                window.location.assign(`${PROTOCOL}://${HOST}:${PORT}/product/detaile-product/${currentElId}/`);
            })
        });
    }

    setPageName(pageName){
        this.pageName = pageName;
    }

    renderBasket() {
        // Очистка контейнера перед новым рендером
        this.productsContainer.innerHTML = '';

        window.addEventListener("DOMContentLoaded", () => {
            this.productManager.setProducts(this.productManager.getStorageProducts());
        })

        const products = this.productManager.getProducts();
        
        if (products.length === 0) 
            this.productsContainer.innerHTML = '<p>Кошик порожній</p>';
        else {
            products.forEach((product) => {
                const productHTML = this.renderProduct(product);
                this.productsContainer.appendChild(productHTML);
            });
        }

        // Обновление бейджа корзины

        this.badgeContent.textContent = this.productManager.productsTotalCount();

        // Обновление общей стоимости товаров
        this.allProductCostElement.textContent = `${this.productManager.allProductsTotalPrice(this.productManager.priceOutputFn, 2)} грн`;
        this.images = document.querySelectorAll(".overlook__img");
        rerenderImage(this.images);


    }

    renderProduct(product) {
        console.log(product, "inRenderProduct")

        const productDiv = document.createElement("div");
        productDiv.classList.add("cart__product");
        productDiv.setAttribute("id", `cart__product__${product.id}`);
        productDiv.innerHTML = `
            <div class="cart__product__overlook">
                <div class="overlook__img__container">
                    <div class="overlook__img__wrap">
                        <img class="overlook__img" src="${product.image}" alt="${product.name}" />
                    </div>
                </div>
                <div class="overlook__name__wrap">
                    <p class="overlook__name">${product.name}</p>
                    <p class="overlook__name">ціна: <b>${product.price}</b> грн</p>
                </div>
                <div class="cart__product__btns">
                    <button class="btns__btn" data-id="${product.id}" data-action="decrease">-</button>
                    <input class="btns__count" data-action="quantity" type="text" id="btn_count_${product.id}" value="${product.quantity}" />
                    <button class="btns__btn" data-id="${product.id}" data-action="increase">+</button>
                </div>
                <div class="cart__product__price">${this.productManager.priceOutputFn(product.price * product.quantity, 2)} грн</div>
                <button class="cart__product__garbage__wrap"  data-id="${product.id}" data-action="remove">
                    <svg class="cart__product__garbage" viewBox="0 0 448 512" fill="currentColor">
                        <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320
                            32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32
                            128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0
                            8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16
                            16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2
                            16-16V208c0-8.8-7.2-16-16-16z">
                        </path>
                    </svg>
                </button>
            </div>
        `;
    
        // Обработчик увеличения
        productDiv.querySelector(`[data-action="increase"]`).addEventListener("click", async () => {
            product.addOne();
            this.renderBasket(); // Обновляем корзину только если проверка прошла успешно        
        });
    
        // Обработчик уменьшения
        productDiv.querySelector(`[data-action="decrease"]`).addEventListener("click", () => {
            product.removeOne();
            if (product.quantity < 0) {
                product.quantity = 0;
            }
            this.renderBasket();
        });

        productDiv.querySelector(`[data-action="remove"]`).addEventListener("click", () => {
            this.productManager.deleteProduct(product.id);
            this.renderBasket();
        });
    
        // Обработчик ввода количества
        productDiv.querySelector(`[data-action="quantity"]`).addEventListener("input", async (e) => {
            let value = parseInt(e.target.value, 10);
            if (isNaN(value) || value < 0) {
                value = 0; // Устанавливаем значение 0, если введено некорректное значение
            } 
            this.productManager.setProductQuantity(product.id, value);
            this.updateProductQuantityAndPrice(product.id, productDiv.querySelector(`[data-action="quantity"]`), productDiv.querySelector(".cart__product__price"));
        });
    
        return productDiv;
    }
    

    

    updateProductQuantityAndPrice(productId, quantityInput, totalPriceElement) {
        const product = this.productManager.existProduct(productId);
        if (product) {
            quantityInput.value = product.quantity;
            totalPriceElement.textContent = `${this.productManager.priceOutputFn(product.price * product.quantity, 2)} грн`;
            this.updateTotalPrice();
        }
    }

    updateTotalPrice() {
        this.allProductCostElement.textContent = `${this.productManager.allProductsTotalPrice(this.productManager.priceOutputFn, 2)} грн`;
    }

    animateBadge() {
        this.badge.classList.add("animated");
        this.badge.addEventListener("animationend", () => {
            this.badge.classList.remove("animated");
        }, { once: true });
    }
    




    
}