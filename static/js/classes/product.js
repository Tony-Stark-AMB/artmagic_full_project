export class Product {
    constructor(id, name, price, imageSrc, manufacturer) {
      this.name = name;
      this.price = price;
      this.quantity = 1;
      this.imageSrc = imageSrc
      this.id = id; // Assigning a unique ID to each object
      this.manufacturerId = manufacturer
    }
  
    static currentId = 1; // Static variable to keep track of the IDs
  
    static nextId() {
        return Product.currentId++;
    }

    static allTotalCost(products){
        const {arr} = products;
        return arr.reduce((acc, curr) => +acc + (curr.quantity * curr.price) , 0)
    }

    static deleteProduct(products, id){
        return arr.filter((product) => product.id != id); //доработать
    }

    static allProductsQuantity(products){ 
        return arr.reduce((acc, cur) => acc + cur.quantity, 0); //доработать
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




