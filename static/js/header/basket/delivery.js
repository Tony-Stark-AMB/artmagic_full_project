const notification = document.getElementById('notification');
const formContainer = document.querySelector('.order-choose__form');

let selectedDelivery = null;
let selectedPayment = null;

const updateNotification = () => {
    switch(true){
        case !selectedDelivery && !selectedPayment:
            notification.textContent = 'Будь ласка, оберіть спосіб доставки й оплати.';
            break;
        case !selectedDelivery:
            notification.textContent = 'Будь ласка, оберіть спосіб доставки.';
            break;
        case !selectedPayment:
            notification.textContent = 'Будь ласка, оберіть спосіб оплати.';
            break;
        default: 
            notification.textContent = '';
            break;
    }
};

updateNotification();

const iconsDelivery = document.querySelectorAll('[data-delivery]');

const orderInputWrap = (fieldName) => document.querySelector(`[data-field="${fieldName}"]`).parentElement;
const orderInputWraps = document.querySelectorAll(`[data-field]`)
console.log(orderInputWraps);

const show = (el) => {
    if(el.classList.contains("d-none")){
        el.classList.remove("d-none");
        el.classList.add("d-block");
    }
}

const hide = (el) => {
    if(el.classList.contains("d-block")){
        el.classList.remove("d-block");
        el.classList.add("d-none");
    }
}

const removeDeliveryActiveClass = () => iconsDelivery.forEach((icon) => {
    const typeOfIcon = icon.dataset.delivery;
    const addressOrderInputWrap = orderInputWrap("address");
    console.log(addressOrderInputWrap)
    switch(typeOfIcon){
        case "artmagic_department":
            icon.setAttribute("src", "/static/assets/basket-icons/artmagic.png")
            break;
        case "new_post_department":
            icon.classList.remove('c11');
            icon.classList.add('c8');
            break;
        case "new_post_packing":
            icon.classList.remove('c11');
            icon.classList.add('c8');
            break;
        case "new_post_address":
            icon.classList.remove('c11');
            icon.classList.add('c8')
            break;
        case "ukr_post":
            icon.classList.remove('c20');
            icon.classList.add('c8');
            break;
    }
});


// Добавляем обработчик клика для каждого SVG
iconsDelivery.forEach((icon) => {
    icon.addEventListener('click', (e) => {
        removeDeliveryActiveClass();  // Удаляем класс active у всех SVG
        const typeOfIcon = e.currentTarget.dataset.delivery;
        selectedDelivery = typeOfIcon;
        const curIcon = e.currentTarget;
        const addressOrderInputWrap = orderInputWrap("address");
        console.log(addressOrderInputWrap)
        switch(typeOfIcon){
            case "artmagic_department":
                icon.setAttribute("src", "/static/assets/logo/artmagic.png");
                break;
            case "new_post_department":
                curIcon.classList.remove('c8');
                curIcon.classList.add('c11');
                break;
            case "new_post_packing":
                curIcon.classList.remove('c8');
                curIcon.classList.add('c11');
                break;
            case "new_post_address":
                curIcon.classList.remove('c8');
                curIcon.classList.add('c11')
                break;
            case "ukr_post":
                curIcon.classList.remove('c8');
                curIcon.classList.add('c20');
                break;
        }
        updateNotification();
    });
});

const iconsPayment = document.querySelectorAll('[data-payment]');

const removePaymentActiveClass = () => iconsPayment.forEach((icon) => {
    const typeOfIcon = icon.dataset.payment;
    switch(typeOfIcon){
        case "liqpay":
            const pathesLiqpay = icon.children[0].children;
                pathesLiqpay[0].classList.remove("c14");
                for(let i = 1; i <= 2; i++){
                    pathesLiqpay[i].classList.remove("c23");
                    pathesLiqpay[i].classList.add("c6");
                }
            break;
        case "payment_card":
            icon.classList.remove("c20");
            icon.classList.add("c8");
            break;
        case "payment_real":
            const pathesPayment = icon.children;
            pathesPayment[0].classList.remove("c12");
            pathesPayment[0].classList.add("c8");
            pathesPayment[1].classList.remove("c20");
            pathesPayment[1].classList.add("c8");
            break;
    }
});

iconsPayment.forEach((icon) => {
    icon.addEventListener('click', (e) => {
        removePaymentActiveClass();  // Удаляем класс active у всех SVG
        const typeOfIcon = e.currentTarget.dataset.payment;
        const curIcon = e.currentTarget;
        selectedPayment = typeOfIcon;
        switch(typeOfIcon){
            case "liqpay":
                const pathesLiqpay = curIcon.children[0].children;
                pathesLiqpay[0].classList.add("c14");
                for(let i = 1; i <= 2; i++){
                    pathesLiqpay[i].classList.remove("c6");
                    pathesLiqpay[i].classList.add("c23");
                }
                break;
            case "payment_card":
                curIcon.classList.remove("c8");
                curIcon.classList.add("c20");
                break;
            case "payment_real":
                const pathesPayment = curIcon.children;
                pathesPayment[0].classList.remove("c8");
                pathesPayment[0].classList.add("c12");
                pathesPayment[1].classList.remove("c8");
                pathesPayment[1].classList.add("c20");
                break;
        }
        updateNotification();
    });
});

