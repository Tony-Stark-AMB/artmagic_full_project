class Product {
    constructor(id, name, price, image, model, quantity, preorder, storageQuantity) {
      this.name = name;
      this.price = price;
      this.quantity = (storageQuantity === 0) ? 0 : (quantity ? quantity : quantity === 0 ? 0 : 1); 
      this.image = image !== "" ? image : `/static/product-placeholder.png`;
      this.id = id; // Assigning a unique ID to each object
      this.model = model;
      this.preorder = preorder ?? 0;
      this.storageQuantity = storageQuantity;
      this.isQuantityDisabled = quantity > storageQuantity;
    }
  
    static currentId = 1; // Static variable to keep track of the IDs
  
    static nextId() {
        return Product.currentId++;
    }

    addOne() {
        if (this.quantity < this.storageQuantity) {
            // Если quantity меньше storageQuantity, увеличиваем его
            this.quantity += 1;
        } else {
            // Иначе увеличиваем preorder
            this.preorder += 1;
        }
        return this;
    }

    removeOne() {
        if (this.preorder > 0) {
            // Если есть предзаказ, уменьшаем его
            this.preorder -= 1;
        } else if (this.quantity > 0) {
            // Иначе уменьшаем количество, если оно больше нуля
            this.quantity -= 1;
        }
        return this;
    }

    setQuantity(value) {
        if (value <= this.storageQuantity) {
            // Если значение не превышает storageQuantity, устанавливаем его в quantity
            this.quantity = value;
            this.preorder = 0; // Сбрасываем предзаказ
        } else {
            // Если значение больше, чем storageQuantity, распределяем между quantity и preorder
            this.quantity = this.storageQuantity;
            this.preorder = value - this.storageQuantity;
        }
        return this;
    }
}




