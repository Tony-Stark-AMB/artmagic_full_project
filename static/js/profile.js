const formData = {
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
}

fetch("http://localhost:8000/users/profile-field", {
    method: "GET",
    mode: "cors"
}).then((data) => data.json())
.then((data) => console.log(data));

const form = (obj) => {
    const getField = (fieldName) => document.querySelector(`input[data-field="${fieldName}"]`);
    const errorMessageElement = (fieldName) => document.querySelector(`p[data-error="${fieldName}"]`);
    const dataSubmitBtn = document.querySelector(`button[data-submit="btn"]`);
    const validateField = (fieldName, errorElem, pattern, errorText) => {
        if(!pattern.test(getField(fieldName).value)){
            getField(fieldName).classList.add("invalid-input");
            errorElem.classList.remove("error-message-hidden");
            errorElem.classList.add("error-message");
            errorElem.textContent = errorText;
            return false;
        } else {
            getField(fieldName).classList.remove("invalid-input");
            errorElem.classList.remove("error-message");
            errorElem.classList.add("error-message-hidden")
            errorElem.textContent = errorText;
            return true;
        }
    }
    const formData = {...obj};
   
    return {
        editField: (fieldName) => {
            const target = getField(fieldName);
            if(target.disabled)
                target.disabled = false;
            else
                target.disabled = true;
            target.focus();
            target.setSelectionRange(target.value.length, target.value.length);
        },
        clearField: (fieldName) => { getField(fieldName).value = "";},
        triggerInput: (fieldName) => {
            const errorElem = errorMessageElement(fieldName);
            formData[fieldName] = getField(fieldName).value;
            const validateMinFiveLetters = () => {
                const pattern = /^\w{5,}$/
                validateField(fieldName, errorElem, pattern, "Мінімальна довжина 5 літер");
            }
            switch(getField(fieldName).dataset.field){
                case "email": {
                    const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
                    validateField(fieldName, errorElem, pattern, "Неправильна пошта");
                    break;
                }
                case "phoneNumber": {
                    const pattern = /((\+38)?\(?\d{3}\)?[\s\.-]?(\d{7}|\d{3}[\s\.-]\d{2}[\s\.-]\d{2}|\d{3}-\d{4}))/g;
                    validateField(fieldName, errorElem, pattern, "Неправильний телефон");
                    break;
                }
                case "lastName": {
                    validateMinFiveLetters();
                    break;
                }
                case "firstName": {
                    validateMinFiveLetters();
                    break;
                }
                case "userName": {
                    validateMinFiveLetters();
                }
                case "address": {
                    validateMinFiveLetters();
                }
            }
        },
        submitForm: function () {
            dataSubmitBtn.addEventListener("click", (e) => {
                e.preventDefault();
                const {userName: user_name, firstName: first_name} = formData;
                for(const [key, value] of Object.entries(formData)){
                    this.triggerInput(key);
                }
                const myObj = {
                    user_name,
                    first_name
                }
                // fetch("http://localhost:8000")
            })
        },
    }
}

const userForm = form(formData);

userForm.submitForm();