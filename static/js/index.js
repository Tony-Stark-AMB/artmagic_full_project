// for images ratio
initImagesRation(INDEX);
// for products working
basket;

// const { MIN_2_LETTERS_UA, FIRST_LETTER_CAPITALISE_UA, EMAIL, PHONE_UA, REQUIRED, POSTAL_INDEX }  = regexp;

// FORM INIT DATA MUST HAVE UNIC KEYS

const formDataFeedback = {
    firstName: "",
    lastName: "",
    phone: "",
    text: ""
}

// Не забувати, що патерни можуть перекривати один одного
const patternsFeedback = {
    firstName: [
        { rule:  MIN_2_LETTERS_UA, errorMsg: "Мінімум 2 літери UA"},
        // { rule:  FIRST_LETTER_CAPITALISE_UA, errorMsg: "1-рша - велика літера в імені"},
    ],
    lastName: [
        { rule:  MIN_2_LETTERS_UA, errorMsg: "Мінімум 2 літери UA"},
        // { rule:  FIRST_LETTER_CAPITALISE_UA, errorMsg: "1-рша - велика літера в прізвищі"},
    ],
    email: [
        { rule: EMAIL, errorMsg: "Неправильний email" }
    ],
    phone: [
        { rule: PHONE_UA, errorMsg: "Неправильний номер телефону" }
    ],
};

const formFeedback = form(formDataFeedback, patternsFeedback, "Feedback");

formFeedback.initForm({
    firstName: "first_name",
    lastName: "last_name",
    phone: "phone_number",
    text: "message",
}, "user/feedback/", "POST", 
    {successMessage: "Ваша заявка успішно відправлена!", errorMessage: "Якась помилка"},
    3000, true
);


