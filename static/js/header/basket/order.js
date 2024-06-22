import { productManager, basket } from "./basket.js";

const { MIN_2_LETTERS_UA, FIRST_LETTER_CAPITALISE_UA, EMAIL, PHONE_UA, REQUIRED, POSTAL_INDEX }  = regexp;

const formDataOrder = {
    fullName: "",
    clientPhone: "",
    email: "",
    address: ""
}

// Не забувати, що патерни можуть перекривати один одного
const patternsOrder = {
    fullName: [
        { rule:  MIN_2_LETTERS_UA, errorMsg: "Мінімум 2 літери UA"},
    ],
    email: [
        { rule: EMAIL, errorMsg: "Неправильний email" }
    ],
    clientPhone: [
        { rule: PHONE_UA, errorMsg: "Неправильний номер телефону" }
    ],
    address: [
        { rule:  MIN_2_LETTERS_UA, errorMsg: "Мінімум 2 літери UA"},
    ],
};

const formOrder = new Form(formDataOrder, patternsOrder, "Order", productManager, basket );

formOrder.initForm({
    fullName: "name",
    email: "email",
    clientPhone: "phone",
    address: "address",
    products: "products",
}, "cart/process-order/", "POST", 
    {successMessage: "Ваше замовлення успішно прийняте", errorMessage: "Якась помилка"},
    3000, true
);

