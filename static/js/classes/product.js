class Product {
    constructor(id, name, price, imageSrc, manufacturer, quantity) {
      this.name = name;
      this.price = price;
      this.quantity = quantity ? quantity : quantity === 0 ? quantity : 1;
      this.imageSrc = imageSrc
      this.id = id; // Assigning a unique ID to each object
      this.manufacturerId = manufacturer ? manufacturer : null;
    }
  
    static currentId = 1; // Static variable to keep track of the IDs
  
    static nextId() {
        return Product.currentId++;
    }

    addOne(){
        this.quantity += 1;
        return this;
    };

    minusOne(){
        this.quantity -= 1;
        return this;
    }

    setQuantity(value){
        this.quantity = value;
        return this;
    }
}




