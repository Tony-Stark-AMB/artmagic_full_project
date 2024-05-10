

const changeState = (fieldName) => {
    const target = document.querySelector(`input[data-field="${fieldName}"]`);
    
}



const form = () => {
    const getField = (fieldName) => document.querySelector(`input[data-field="${fieldName}"]`);
    const validateField = (fieldName, errorElem, pattern, errorText) => {
        if(!pattern.test(getField(fieldName).value)){
            getField(fieldName).classList.add("invalid-input");
            errorElem.style.visibility = "visible";
            errorElem.style.height = "0";
            errorElem.textContent = errorText;
        } else {
            getField(fieldName).classList.remove("invalid-input");
            errorElem.style.visibility = "hidden";
            errorElem.style.height = "30px";
            errorElem.textContent = errorText;
        }
        return;
    }
    const formData = {
        userName: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
    }
   
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
        clearField: (fieldName) => {
            getField(fieldName).value = "";
            console.log(this.triggerInput);
        },
        triggerInput: (fieldName) => {
            const errorMessageElement = document.getElementById("errorMessage");
            formData[fieldName] = getField(fieldName).value;
            console.log(getField(fieldName).dataset.field)
            switch(getField(fieldName).dataset.field){
                case "email": {
                    errorMessageElement.textContent = "Неправильна пошта";
                    const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
                    validateField(fieldName, errorMessageElement, pattern, "Incorect email");
                    break;
                }
            }
            console.log(formData);
        },
        submitForm: () => {},
    }
}

const userForm = form();

