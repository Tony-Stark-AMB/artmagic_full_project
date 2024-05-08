

const changeState = (fieldName) => {
    const target = document.querySelector(`input[data-field="${fieldName}"]`);
    
}



const form = () => {
    const getField = (fieldName) => document.querySelector(`input[data-field="${fieldName}"]`);
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
        },
        clearField: (fieldName) => getField(fieldName).value = "",
        triggerInput: (fieldName) => {
            formData[fieldName] = getField(fieldName).value;
            console.log(formData);
        },
        submitForm: () => {},
        
    }
}

const userForm = form();

