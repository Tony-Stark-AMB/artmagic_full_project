// import { initImagesRation } from "./common/index.js";
// import { basket } from "./basket.js"
// import { PROFILE } from "./common/constants.js";
// for images ratio
initImagesRation(PROFILE);
// for products working
basket(PROFILE);
// basket(PROFILE).initBasket();


const { MIN_2_LETTERS_UA, FIRST_LETTER_CAPITALISE_UA, EMAIL, PHONE_UA, REQUIRED }  = regexp;

const formData = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
}

// Не забувати, що патерни можуть перекривати один одного
const patterns = {
    firstName: [
        { rule:  MIN_2_LETTERS_UA, errorMsg: "Мінімум 2 літери UA"},
        { rule:  FIRST_LETTER_CAPITALISE_UA, errorMsg: "1-рша - велика літера в імені"},
    ],
    lastName: [
        { rule:  MIN_2_LETTERS_UA, errorMsg: "Мінімум 2 літери UA"},
        { rule:  FIRST_LETTER_CAPITALISE_UA, errorMsg: "1-рша - велика літера в прізвищі"},
    ],
    email: [
        { rule: EMAIL, errorMsg: "Неправильний email" }
    ],
    phoneNumber: [
        { rule: PHONE_UA, errorMsg: "Неправильний номер телефону" }
    ],
    address: [
        { rule:  MIN_2_LETTERS_UA, errorMsg: "Мінімум 2 літери UA"},
    ]
};

const userForm = form(formData, patterns);

userForm.initForm({
    firstName: "first_name",
    lastName: "last_name",
    email: "user_email",
    phoneNumber: "user_pnone",
    address: "address",
}, "user/profile-field/");
