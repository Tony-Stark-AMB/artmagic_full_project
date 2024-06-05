
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

    const successLabel = document.querySelector("div#successMessage");
    

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
        clearField: function(fieldName) { 
            getField(fieldName).value = "";
            this.triggerInput(fieldName);
        },
        triggerInput: function (fieldName)  {
            const errorElem = errorMessageElement(fieldName);
            this.validateField(fieldName, errorElem)
            formData[fieldName].value = getField(fieldName).value;

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
        initForm: function (obj, path) {
            dataSubmitBtn.addEventListener("click", async (e) => {
                e.preventDefault();
                for(const [key] of Object.entries(formData)){
                    this.triggerInput(key)
                }

                const submitedFormData = this.mapedFormData(obj);
                console.log(submitedFormData)
                Object.values(submitedFormData).forEach((value) => {
                    if(value === ""){
                        console.log('err')
                        return;
                    }
                })
                const request = await this.fetchNewUserData(path);
                console.log(request, "request");
                this.showAlert("success", "Інформацію профілю успішно змінено", 3000);
            })
        },
        fetchNewUserData: async (path) => {
            return fetch(`${PROTOCOL}://${HOST}:${PORT}/${path}`, {
                method: "PUT",
                mode: "cors"      
            }).then((data) => data.json());
        },
        mapedFormData: (obj) => (Object.fromEntries(Object.entries(formData).map(([key, { value }]) => [obj[key] || key, value]))),
        showAlert: (type, text, animDuration) => {
            switch(type){
                case "success":
                    successLabel.classList.add("alert_anim");
                    successLabel.querySelector("div.alert-text").textContent = text;
                        setTimeout(() => {
                            successLabel.classList.remove("alert_anim");
 
                        }, animDuration);
                    break;
                case "err":
                    
            }
                
        } 
    }
}

   


