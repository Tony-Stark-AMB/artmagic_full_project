class Basket {
    constructor(productManager) {
        this.productManager = productManager;
        this.btns = document.querySelectorAll(`button[data-item="product_btn"]`);
        this.productsContainer = document.getElementById("basket-products");
        this.badge = document.querySelector(".header-basket__icon__badge");
        this.badgeContent = document.querySelector(".header-basket__icon__badge__number");
        this.allProductCostElement = document.querySelector(".modal-footer__text");
        this.loadProductsFromLocalStorage();
        this.initialize();
    }

    initialize() {
        this.btns.forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const id = +e.target.closest(`div.product-item`).getAttribute("id");
                await this.productManager.fetchNewProduct(id);
                this.renderBasket();
            });
        });
        this.renderBasket();
    }

    renderBasket() {
        // Очистка контейнера перед новым рендером
        this.productsContainer.innerHTML = '';

        const products = this.productManager.getProducts().arr;
        if (products.length === 0) {
            this.productsContainer.innerHTML = '<p>Корзина пуста</p>';
        } else {
            products.forEach((product) => {
                const productHTML = this.renderProduct(product);
                this.productsContainer.appendChild(productHTML);
            });
        }

        // Обновление бейджа корзины
        this.badgeContent.textContent = this.productManager.productsTotalCount();

        // Обновление общей стоимости товаров
        this.allProductCostElement.textContent = `${this.productManager.allProductsTotalPrice(this.productManager.priceOutputFn, 2)} грн`;

        // Сохранение продуктов в localStorage
        this.saveProductsToLocalStorage();
    }

    renderProduct(product) {
        const productDiv = document.createElement("div");
        productDiv.classList.add("cart__product");
        productDiv.setAttribute("id", `cart__product__${product.id}`);
        productDiv.innerHTML = `
            <div class="cart__product__overlook">
                <div class="overlook__img__container">
                    <div class="overlook__img__wrap">
                        <img class="overlook__img" src="/media/${product.imageSrc}" alt="${product.name}" />
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

        // Сохраняем ссылку на input в переменной
        // const quantityInput = productDiv.querySelector(`#btn_count_${+product.id}`);
        // console.log(quantityInput);

        productDiv.querySelector(`[data-action="increase"]`).addEventListener("click", () => {
            product.addOne();
            if (product.quantity < 0) {
                product.quantity = 0;
            }
            this.renderBasket();
        });

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
        productDiv.querySelector(`[data-action="quantity"]`).addEventListener("input", (e) => {
            let value = parseInt(e.target.value, 10);
            if (isNaN(value) || value < 0) {
                value = 0; // Устанавливаем значение 0, если введено некорректное значение
            }
            e.target.value = value;
            this.productManager.setProductQuantity(product.id, value);
            this.renderBasket();
        });



        return productDiv;
    }

    saveProductsToLocalStorage() {
        const products = this.productManager.getProducts().arr.map(product => ({
            id: product.id,
            name: product.name,
            imageSrc: product.imageSrc,
            price: product.price,
            quantity: product.quantity
        }));
        console.log(products)
        localStorage.setItem('products', JSON.stringify({arr: products}));
    }

    loadProductsFromLocalStorage() {
        const savedProducts = localStorage.getItem('products');
        if (savedProducts) {
            const products = JSON.parse(savedProducts);
            products.arr.forEach(product => this.productManager.addProduct(new Product(product)));
        }
    }
}