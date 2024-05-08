export class Product {
    constructor(name, price, imageSrc) {
      this.name = name;
      this.price = price;
      this.quantity = 1;
      this.imageSrc = imageSrc
      this.id = Product.nextId(); // Assigning a unique ID to each object
    }
  
    static currentId = 1; // Static variable to keep track of the IDs
  
    static nextId() {
        return Product.currentId++;
    }

    static allTotalCost(productsArr){
        return productsArr.reduce((acc, curr) => +acc + (curr.quantity * curr.price) , [])
    }

    static deleteProduct(productsArr, id){
        return productsArr.filter((product) => product.id != id);
    }

    addOne(){this.quantity++};

    minusOne(){
        if(this.quantity > 1){
            this.quantity--;
        }
        return;
    }
}

// страница, id  контейнера, и отрисовка относительно обьекта (Product)
export const createProducts = (page, productsArr, productsContainer) => {
    
    productsArr.forEach( (product) => {
        // <div class="products-index__item"></div>
        const productItem = document.createElement("div");
        productItem.classList.add(`products-${page}__item`, "swiper-slide");
        // <div class="products-index__item__img__wrap"></div>
        const productItemImgWrap = document.createElement("div");
        productItemImgWrap.classList.add(`products-${page}__item__img__wrap`);
        productItem.appendChild(productItemImgWrap);
        // <img class="products-index__item__img" />
        const productItemImg = document.createElement("img");
        productItemImg.classList.add(`products-${page}__item__img`);
        productItemImg.setAttribute("src", product.imageSrc);
        productItemImgWrap.appendChild(productItemImg);
        // <p class="products-index__item__title"></p>
        const productTitle = document.createElement("p");
        productTitle.classList.add(`products-${page}__item__title`)
        productTitle.textContent = product.name;
        productItem.appendChild(productTitle);
        // <span class="products-index__item__price"></span>
        const productPrice = document.createElement("span");
        productPrice.classList.add(`products-${page}__item__price`)
        productPrice.textContent = `${product.price} грн`;
        productItem.appendChild(productPrice);
        productsContainer.appendChild(productItem);
    });  
};


