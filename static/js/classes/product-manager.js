export class ProductManager {
    constructor() {
        this.products = [];
        this.loadProductsFromStorage();
    }

    getProducts() {
        return this.products ?? [];
    }

    getStorageProducts() {
        const products = JSON.parse(localStorage.getItem("products"));
        return this.mapObjectsInProducts(products) ?? [];
    }

    setProducts(products) {
        this.products = products;
    }

    setStorageProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    deleteProduct(id) {
        this.products = this.products.filter((product) => product.id !== id);
        this.setStorageProducts(this.products)
    }

    clearProducts() {
        this.products = [];
    }

    clearStorageProducts() {
        localStorage.setItem('products', JSON.stringify([]));
    }

    async addProduct({ id, name, price, image, model }) {
        
        const existProduct = this.existProduct(id);
        if (existProduct){
            existProduct.addOne();
        } else {
            this.products = [...this.products, new Product(id, name, price, image, model)];
        }
        await this.checkInProductQuantity(id)
        this.setStorageProducts(this.products)
    }

    mapObjectsInProducts(products) {
        if (!products) return [];
        return products.map(({ id, name, price, quantity, image, model }) =>
            new Product(id, name, price, image, model, quantity)
        );
    }

    mapObjectInProduct({id, name, price, image, model, quantity}) {
        if (!id) return null;
        return new Product(id, name, price, image, model, quantity);
    }

    async fetchNewProduct(id) {
        const response = await fetch(`${PROTOCOL}://${HOST}:${PORT}/add-to-cart/?id=${id}`, {
            method: "GET",
            mode: "cors"
        });
        const product = await response.json();
        return product;
    }

    existProduct(id) {
        return this.products.find((product) => product.id === id) ?? null;
    }

    productsTotalCount() {
        return this.products.reduce((acc, cur) => acc + cur.quantity, 0);
    }

    currentProductTotalPrice(id, priceOutputFn, amountAfterQuote) {
        const curProduct = this.products.find((product) => product.id === id);
        return priceOutputFn(curProduct.quantity * curProduct.price, amountAfterQuote);
    }

    allProductsTotalPrice(priceOutputFn, amountAfterQuote) {
        return priceOutputFn(
            this.products.reduce((acc, cur) => acc + +this.currentProductTotalPrice(cur.id, priceOutputFn, amountAfterQuote), 0),
            amountAfterQuote
        );
    }

    priceOutputFn(number, amountAfterQuote) {
        return number.toFixed(amountAfterQuote);
    }

    setProductQuantity(id, value) {
        const curProduct = this.existProduct(id);
        curProduct.setQuantity(value);
    }

    loadProductsFromStorage() {
        this.setProducts(this.getStorageProducts());
    }

    
    filterProductsByQuantity(products) {
        return products.filter(product => product.quantity > 0);
    }

    getProductsInfo() {
        return this.products.map(({id, name, price, quantity}, i) => 
            `${i + 1}) Продукт 
             Назва: ${name}
             Ціна: ${price} грн
             Кільіксть: ${quantity}
             Ціна загальна: ${this.currentProductTotalPrice(id, this.priceOutputFn, 2)} грн`
        ).join('\n');
    }

    async checkInProductQuantity(id, ) {
        const { quantity, name } = this.products.find((product) => id === product.id);
        const { storage_quantity } = await this.fetchStorageQuantity(id);
    
        console.log(storage_quantity, quantity, "before")

        const condition = storage_quantity >= quantity;


        if(condition)
            return;
        Alert("err", `Товару ${name} у кількості ${quantity}шт. недостатньо на складі.`, 5000);
        this.setProductQuantity(id, quantity - 1);
        this.setStorageProducts(this.products);
        console.log(storage_quantity, this.products.find((product) => id === product.id).quantity, "after");
    }

    async fetchStorageQuantity(id){
        return fetch(`${PROTOCOL}://${HOST}:${PORT}/add-to-cart-checkin-quantity/?id=${id}`, {
            method: "GET",
            mode: "cors"
        }).then((data) => data.json());
    }

    // async checkInProductQuantityInBasket(id, type, inputQuantity){
    //     const { quantity, name } = this.products.find((product) => id === product.id);
    //     const { storage_quantity } = await this.fetchStorageQuantity(id);
    //     // console.log(inputQuantity);
    //     // console.log("quantity", quantity, "storage_quantity", storage_quantity)
    //     const condition = storage_quantity > quantity;

    //     if(condition)
    //         return true;
        
    //     switch(type){
    //         case "+":
    //             console.log("+ condition")
    //             Alert("err", `Товару ${name} у кількості ${quantity}шт. недостатньо на складі.`, 5000);
    //             this.setProductQuantity(id, quantity);
    //             this.setStorageProducts(this.products);
    //             // console.log(storage_quantity, this.products.find((product) => id === product.id).quantity, "after");
    //             return false;
    //         case "input":
    //             console.log("input condition")
    //     }
    // }
}
