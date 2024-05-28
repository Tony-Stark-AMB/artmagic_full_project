export class Product {
    constructor(id, name, price, imageSrc, manufacturer, quantity) {
      this.name = name;
      this.price = price;
      this.quantity = quantity ? quantity : 1;
      this.imageSrc = imageSrc
      this.id = id; // Assigning a unique ID to each object
      this.manufacturerId = manufacturer
    }
  
    static currentId = 1; // Static variable to keep track of the IDs
  
    static nextId() {
        return Product.currentId++;
    }

    addOne(){this.quantity++};

    minusOne(){
        if(this.quantity > 1){
            this.quantity--;
        }
        return;
    }

    setQuantity(value){
        if(value < 1){
            return 
        }
        this.quantity = value;
    }
}




