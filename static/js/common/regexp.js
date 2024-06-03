const regexp = {
    MIN_2_LETTERS_UA: /[а-щьюяґєії]+/,
    FIRST_LETTER_CAPITALISE_UA: /^[А-ЩЬЮЯҐЄІЇ]/,
    MIN_2_LETTERS_RU: /[а-яё]+/,
    FIRST_LETTER_CAPITALISE_RU: /^[А-ЯЁ]/,
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,
    PHONE_UA: /^(\+380\d{9}|(050|066|067|068|091|092|093|094|095|096|097|098|099)\d{7})$/,
}