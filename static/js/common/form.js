
// fetch("http://localhost:8000/users/profile-field", {
//     method: "GET",
//     mode: "cors"
// }).then((data) => data.json())
// .then((data) => console.log(data));

const form = function (obj, patterns)  {

    const formData = Object.fromEntries(
        Object.keys(obj).map(key => [
            key, 
            { 
                value: "", 
                patterns: patterns[key] || [] 
            }
        ])
    );
    
    
    console.log(formData)

    const getField = (fieldName) => document.querySelector(`input[data-field="${fieldName}"]`);
    const errorMessageElement = (fieldName) => document.querySelector(`p[data-error="${fieldName}"]`);
    const dataSubmitBtn = document.querySelector(`button[data-submit="btn"]`);

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
        triggerInput: function (fieldName)  {
            const errorElem = errorMessageElement(fieldName);
            this.validateField(fieldName, errorElem);
        },
        validateField: (fieldName, errorElem) => {
            const field = getField(fieldName);
            const fieldValue = field.value;
            const patterns = formData[fieldName].patterns;
        
            for (let patternObj of patterns) {
                const regex = new RegExp(patternObj.rule);
                if (!regex.test(fieldValue)) {
                    field.classList.add("invalid-input");
                    errorElem.classList.remove("error-message-hidden");
                    errorElem.classList.add("error-message");
                    errorElem.textContent = patternObj.errorMsg;
                    return false;
                }
            }
        
            field.classList.remove("invalid-input");
            errorElem.classList.remove("error-message");
            errorElem.classList.add("error-message-hidden");
            errorElem.textContent = '';
            return true;
        },
        initForm: function (obj) {
            dataSubmitBtn.addEventListener("click", (e) => {
                e.preventDefault();
                for(const [key] of Object.entries(formData)){
                    this.triggerInput(key);
                }
                const submitedFormData = this.mapedFormData(obj);
                console.log(submitedFormData)
                // fetch("http://localhost:8000")
            })
        },
        mapedFormData: (obj) => (Object.fromEntries(Object.entries(formData).map(([key, { value }]) => [obj[key] || key, value]))),
    }
}

   


