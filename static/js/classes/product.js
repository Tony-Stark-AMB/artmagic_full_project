class Product {
    constructor(id, name, price, image, model, quantity) {
      this.name = name;
      this.price = price;
      this.quantity = quantity ? quantity : quantity === 0 ? quantity : 1;
      this.image = image !== "" ? image : `/static/product-placeholder.png`;
      this.id = id; // Assigning a unique ID to each object
      this.model = model
    }
  
    static currentId = 1; // Static variable to keep track of the IDs
  
    static nextId() {
        return Product.currentId++;
    }

    addOne(){
        this.quantity += 1;
        return this;
    };

    removeOne(){
        this.quantity -= 1;
        return this;
    }

    setQuantity(value){
        this.quantity = value;
        return this;
    }
}




