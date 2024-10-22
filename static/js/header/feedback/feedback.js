// FORM INIT DATA MUST HAVE UNIC KEYS

const {REQUIRED, MIN_2_LETTERS_UA, PHONE_UA } = regexp

const formDataFeedback = {
    firstName: "",
    lastName: "",
    phone: "",
    text: ""
}

// Не забувати, що патерни можуть перекривати один одного
const patternsFeedback = {
    firstName: [
        { rule: REQUIRED, errorMsg: "Обов'язкове поле" },
        { rule:  MIN_2_LETTERS_UA, errorMsg: "Мінімум 2 літери UA"},
        // { rule:  FIRST_LETTER_CAPITALISE_UA, errorMsg: "1-рша - велика літера в імені"},
    ],
    lastName: [
        { rule: REQUIRED, errorMsg: "Обов'язкове поле" },
        { rule:  MIN_2_LETTERS_UA, errorMsg: "Мінімум 2 літери UA"},
        // { rule:  FIRST_LETTER_CAPITALISE_UA, errorMsg: "1-рша - велика літера в прізвищі"},
    ],
    phone: [
        { rule: REQUIRED, errorMsg: "Обов'язкове поле" },
        { rule: PHONE_UA, errorMsg: "Неправильний номер телефону" }
    ],
};

const userData = new Map();

Array.from(document.querySelectorAll("[data-user]")).map(el => {
    const key = el.dataset.user;
    const val = el.textContent;
    userData.set(key, val)
    return userData
});

const formFeedback = new FeedbackForm(formDataFeedback, patternsFeedback, "Feedback", Alert, null, null, userData, null);

formFeedback.initForm("feedbackForm", {
    firstName: "first_name",
    lastName: "last_name",
    phone: "phone_number",
    text: "message",
}, "user/feedback/", "POST", 
    {successMessage: "Ваша заявка успішно відправлена!", errorMessage: "Якась помилка"},
    3000, true
);
