// for images ratio
initImagesRation(PROFILE);
// for products working
const { EMAIL, POSTAL_INDEX } = regexp;

const formDataProfile = {
    firstName: "",
    lastName: "",
    profileEmail: "",
    profilePhone: "",
    profileAddress: "",
    postalCode: "",
}

// Не забувати, що патерни можуть перекривати один одного
const patternsProfile = {
    firstName: [
        // { rule:  MIN_2_LETTERS_UA, errorMsg: "Мінімум 2 літери UA"},
        // { rule:  FIRST_LETTER_CAPITALISE_UA, errorMsg: "1-рша - велика літера в імені"},
    ],
    lastName: [
        // { rule:  MIN_2_LETTERS_UA, errorMsg: "Мінімум 2 літери UA"},
        // { rule:  FIRST_LETTER_CAPITALISE_UA, errorMsg: "1-рша - велика літера в прізвищі"},
    ],
    profileEmail: [
        { rule: EMAIL, errorMsg: "Неправильний email" }
    ],
    profilePhone: [
        { rule: PHONE_UA, errorMsg: "Неправильний номер телефону" }
    ],
    profileAddress: [
        // { rule:  MIN_2_LETTERS_UA, errorMsg: "Мінімум 2 літери UA"},
    ],
    postalCode: [
        { rule: POSTAL_INDEX, errorMsg: "Вкажіть поштовий індекс (49000)"}
    ]
};

const formProfile = new ProfileForm(formDataProfile, patternsProfile, "Profile", Alert);

formProfile.initForm("profileForm", {
    firstName: "first_name",
    lastName: "last_name",
    profileEmail: "user_email",
    profilePhone: "user_pnone",
    profileAddress: "address",
    postalCode: "postal_code",
}, "user/profile-field/", "PUT", 
    {successMessage: "Інформацію профілю успішно змінено", errorMessage: "Якась помилка"},
    3000, false
);
