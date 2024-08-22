import { formOrder } from "./order.js";

document.addEventListener("DOMContentLoaded", () => {
    const notification = document.getElementById('notification');
    const formContainer = document.querySelector('.order-choose__form');
    const btnSubmitOrder = document.querySelector(`[data-submit="btn_Order"]`)

    let selectedDelivery = null;
    let selectedPayment = null;

    const updateNotification = () => {
        switch (true) {
            case !selectedDelivery && !selectedPayment:
                notification.textContent = 'Будь ласка, оберіть спосіб доставки й оплати.';
                disableSubmitButton();
                break;
            case !selectedDelivery:
                notification.textContent = 'Будь ласка, оберіть спосіб доставки.';
                disableSubmitButton();
                break;
            case !selectedPayment:
                notification.textContent = 'Будь ласка, оберіть спосіб оплати.';
                disableSubmitButton();
                break;
            default:
                notification.textContent = '';
                enableSubmitButton();
                break;
        }
    };
    
    const disableSubmitButton = () => {
        btnSubmitOrder.setAttribute('disabled', 'disabled');
    };
    
    const enableSubmitButton = () => {
        btnSubmitOrder.removeAttribute('disabled');
    };
    updateNotification();

    const iconsDelivery = document.querySelectorAll('[data-delivery]');

    const orderInputWrap = (fieldName) => document.querySelector(`[data-field="${fieldName}"]`).parentElement;
    const orderInputWraps = document.querySelectorAll('.order__input__wrap');
    orderInputWraps.forEach((inputWrap) => inputWrap.classList.add('d-block'));

    const show = (el) => {
        el.classList.remove('d-none');
        el.classList.add('d-block');
    }

    const hide = (el) => {
        el.classList.remove('d-block');
        el.classList.add('d-none');
    }

    const removeDeliveryActiveClass = () => {
        iconsDelivery.forEach((icon) => {
            const typeOfIcon = icon.dataset.delivery;
            switch (typeOfIcon) {
                case "artmagic_department":
                    icon.setAttribute("src", "/static/assets/basket-icons/artmagic.png");
                    break;
                case "new_post_department":
                case "new_post_packing":
                case "new_post_address":
                    icon.classList.remove('c11');
                    icon.classList.add('c8');
                    break;
                case "ukr_post":
                    icon.classList.remove('c20');
                    icon.classList.add('c8');
                    break;
            }
        });
    }

    iconsDelivery.forEach((icon) => {
        icon.addEventListener('click', (e) => {
            const typeOfIcon = e.currentTarget.dataset.delivery;
            const curIcon = e.currentTarget;

            if (selectedDelivery === typeOfIcon) {
                selectedDelivery = null;
                formOrder.setSelectedDelivery(null);
                removeDeliveryActiveClass();
            } else {
                removeDeliveryActiveClass();
                selectedDelivery = typeOfIcon;
                formOrder.setSelectedDelivery(typeOfIcon);

                switch (typeOfIcon) {
                    case "artmagic_department":
                        icon.setAttribute("src", "/static/assets/logo/artmagic.png");
                        break;
                    case "new_post_department":
                    case "new_post_packing":
                    case "new_post_address":
                        curIcon.classList.remove('c8');
                        curIcon.classList.add('c11');
                        break;
                    case "ukr_post":
                        curIcon.classList.remove('c8');
                        curIcon.classList.add('c20');
                        break;
                }
            }
            updateNotification();
            updateFormFields();
        });
    });

    const iconsPayment = document.querySelectorAll('[data-payment]');

    const removePaymentActiveClass = () => {
        iconsPayment.forEach((icon) => {
            const typeOfIcon = icon.dataset.payment;
            switch (typeOfIcon) {
                case "liqpay":
                    const pathesLiqpay = icon.children[0].children;
                    pathesLiqpay[0].classList.remove("c14");
                    for (let i = 1; i <= 2; i++) {
                        pathesLiqpay[i].classList.remove("c23");
                        pathesLiqpay[i].classList.add("c6");
                    }
                    break;
                case "payment_card":
                    icon.classList.remove("c20");
                    icon.classList.add("c8");
                    break;
                case "payment_real":
                    icon.setAttribute("src", "/static/assets/basket-icons/oplata-kartoy_grey.png");
                    break;
            }
        });
    }

    iconsPayment.forEach((icon) => {
        icon.addEventListener('click', (e) => {
            const typeOfIcon = e.currentTarget.dataset.payment;
            const curIcon = e.currentTarget;
            if (selectedPayment === typeOfIcon) {
                selectedPayment = null;
                formOrder.setSelectedPayment(null);
                removePaymentActiveClass();
            } else {
                removePaymentActiveClass();
                selectedPayment = typeOfIcon;
                formOrder.setSelectedPayment(typeOfIcon);
                switch (typeOfIcon) {
                    case "liqpay":
                        const pathesLiqpay = curIcon.children[0].children;
                        pathesLiqpay[0].classList.add("c14");
                        for (let i = 1; i <= 2; i++) {
                            pathesLiqpay[i].classList.remove("c6");
                            pathesLiqpay[i].classList.add("c23");
                        }
                        break;
                    case "payment_card":
                        curIcon.classList.remove("c8");
                        curIcon.classList.add("c20");
                        break;
                    case "payment_real":
                        icon.setAttribute("src", "/static/assets/basket-icons/oplata-kartoy.png");
                        break;
                }
            }
            updateNotification();
            updateFormFields();
        });
    });

    const updateFormFields = () => {
        const fieldsToShow = [];

        if (selectedDelivery === "artmagic_department" || selectedDelivery === "ukr_post") {
            fieldsToShow.push("fullName", "clientPhone", "address", "email");
        }
        if (selectedDelivery === "new_post_packing" || selectedDelivery === "new_post_department") {
            fieldsToShow.push("fullName", "clientPhone", "area", "city", "email", "department");
        }
        if (selectedDelivery === "new_post_address" ){
            fieldsToShow.push("fullName", "clientPhone","address", "area", "city", "email");
        }


        orderInputWraps.forEach((wrap) => {
            const fieldName = wrap.querySelector('.order__input').dataset.field;
            if (fieldsToShow.includes(fieldName)) {
                show(wrap);
            } else {
                hide(wrap);
            }
        });
    };

    // Initialize form fields with null values
    const initializeFormFields = () => {
        document.querySelector('[data-field="fullName"]').value = '';
        document.querySelector('[data-field="clientPhone"]').value = '';
        document.querySelector('[data-field="email"]').value = '';
        document.querySelector('[data-field="address"]').value = '';
        document.querySelector('[data-field="area"]').value = 'null';
        document.querySelector('[data-field="city"]').value = 'null';
    };

    initializeFormFields();
    updateFormFields();
});
