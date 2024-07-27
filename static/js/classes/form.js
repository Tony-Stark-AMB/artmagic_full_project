class Form {
    constructor(obj, patterns, formName, ...args) {
        this.formData = Object.fromEntries(
            Object.keys(obj).map(key => [
                key,
                {
                    value: "",
                    patterns: patterns[key] || []
                }
            ])
        );
        const [productManager, basket] = args;
        this.productManager = productManager ?? null;
        this.basket = basket ?? null;
        this.initObj = obj;
        this.formName = formName;
        this.dataSubmitBtn = document.querySelector(`button[data-submit="btn_${formName}"]`);
        this.successLabel = document.querySelector("div#successMessage");
        this.errorLabel = document.querySelector("div#errorMessage");
        this.areasDataWithNullField = [];
    }

    getField(fieldName) {
        return document.querySelector(`input[data-field="${fieldName}"]`) 
        ?? document.querySelector(`textarea[data-field="${fieldName}"]`) 
        ?? document.querySelector(`select[data-field="${fieldName}"]`); 
    }

    errorMessageElement(fieldName) {
        return document.querySelector(`p[data-error="${fieldName}"]`);
    }

    editField(fieldName) {
        const target = this.getField(fieldName);
        target.disabled = !target.disabled;
        target.focus();
        target.setSelectionRange(target.value.length, target.value.length);
    }

    clearField(fieldName, triggerInpCond = true) {
        this.getField(fieldName).value = "";
        if (triggerInpCond) this.triggerInput(fieldName);
    }

    triggerInput(fieldName) {
        const errorElem = this.errorMessageElement(fieldName);
        this.formData[fieldName].value = this.getField(fieldName).value;
        return !this.validateField(fieldName, errorElem);
    }

    validateField(fieldName, errorElem) {
        const field = this.getField(fieldName);
        const fieldValue = field.value;
        const patterns = this.formData[fieldName].patterns;

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

        if (errorElem) {
            field.classList.remove("invalid-input");
            errorElem.classList.remove("error-message");
            errorElem.classList.add("error-message-hidden");
            errorElem.textContent = '';
        }
        return true;
    }

    async initForm(formContainerId, obj, path, methodType, msgObj, animDuration, clearCond = true) {
        const formContainer = document.getElementById(formContainerId);

        
        const fields = formContainer.querySelectorAll("[data-field]");
        fields.forEach((field) => field.addEventListener("input", (e) => {
            this.triggerInput(field.dataset.field)
        }));

        if(formContainerId === "profileForm"){
            const btnsWrappers = Array.from(document.querySelectorAll(".profile-page__user-info__btns-wrap")).map((btnsWrapper) => btnsWrapper.children);
            btnsWrappers.forEach(([btnEdit, btnClear]) => {
                btnEdit.addEventListener("click", () => this.editField(btnEdit.dataset.edit));
                btnClear.addEventListener("click", () => this.clearField(btnClear.dataset.clear));
            })
        };

        if(formContainerId === "orderForm"){
            const areaInputWrap = this.orderInputWrap("area");

            this.updateAreaOptions(areaInputWrap);

            const cityInputWrap = this.orderInputWrap("city");
            const departmentInputWrap = this.orderInputWrap("department");

            this.fetchSomeOptions(areaInputWrap, cityInputWrap, "get_cities", "region_ref", "-- Оберіть Місто --", "cities", undefined, this.areasDataWithNullField);
            this.fetchSomeOptions(cityInputWrap, departmentInputWrap, "get_branches_and_postomats", "city_ref", "-- Оберіть відділення", "branches")
            
        }
        


        this.dataSubmitBtn.addEventListener("click", async (e) => {
            e.preventDefault();
           
            let emptyForm = false;
            Object.keys(this.formData).forEach(key => this.triggerInput(key));
            

            const submitedFormData = this.mapedFormData(obj);
            if (this.productManager !== null) submitedFormData.products = 
                this.productManager.filterProductsByQuantity(this.productManager.getProducts());
            const productsExistCondition = 
                submitedFormData.products && submitedFormData.products.length === 0;
            try {
                
                Object.keys(this.formData).map(key => {
                    if(this.formData[key].value === ""){
                        emptyForm = true;
                        throw Error();
                    }
                });

                if (productsExistCondition) throw Error();           
                await this.fetchData(path, methodType, submitedFormData);
                this.showAlert("success", msgObj.successMessage, animDuration);

                if (clearCond) {
                    this.clearForm(this.initObj);
                    if (this.productManager !== null) {
                        this.productManager.clearStorageProducts();
                        this.productManager.clearProducts();
                        this.basket.renderBasket();
                    }
                }
            } catch (err) {
                switch(true){
                    case productsExistCondition:
                        this.showAlert("err", "Неможливо зробити замовлення без обраного товару", animDuration);
                        break;
                    case emptyForm:
                        this.showAlert("err", "Будь ласка заповніть поля форми", animDuration);
                        break;
                    default :
                        this.showAlert("err", msgObj.errorMessage, animDuration);
                        break; 
                }


            }
        });
    }

    async fetchData(path, methodType, data) {
        return fetch(`${PROTOCOL}://${HOST}:${PORT}/${path}`, {
            method: methodType,
            mode: "cors",
            body: JSON.stringify(data),
            headers: {
                'X-CSRFToken': this.getCookie("csrftoken")
            },
        }).then((data) => data.json());
    }

    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.startsWith(`${name}=`)) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    mapedFormData(obj) {
        return Object.fromEntries(Object.entries(this.formData).map(([key, { value }]) => [obj[key] || key, value]));
    }

    showAlert(type, text, animDuration) {
        const label = type === "success" ? this.successLabel : this.errorLabel;
        label.classList.add("alert_anim");
        label.querySelector("div.alert-text").textContent = text;
        setTimeout(() => {
            label.classList.remove("alert_anim");
        }, animDuration);
    }

    clearForm(obj) {
        Object.keys(obj).forEach((key) => this.clearField(key, false));
    }

    async fetchNewPostAPIData(pathName, query = ""){
        const path = `api/${pathName}`
        const data = await fetch(`${PROTOCOL}://${HOST}:${PORT}/delivery/${path}?${query}`, 
            {
                method: "GET",
                mode: "cors"
            }
        )
            .then((data) => data.json())
        return data;
    }

    orderInputWrap(fieldName){
        return document.querySelector(`[data-field="${fieldName}"]`);
    }

    async fetchSomeOptions(triggerInputWrap, containerInputWrap, url, queryKey, nullElementText, dataKey, filtrationFunc){
        this.areasDataWithNullField = await this.updateAreaOptions()
        triggerInputWrap.addEventListener("change", async () => {
            if(triggerInputWrap.value != "null"){
                const nullElement = document.querySelector("option");
                let data = (await this.fetchNewPostAPIData(url, `${queryKey}=${triggerInputWrap.value}`))[dataKey];

                if(filtrationFunc)
                    data = filtrationFunc(data);
                

                containerInputWrap.innerHTML = "";  
                nullElement.value = null;
                nullElement.textContent = nullElementText;
                containerInputWrap.appendChild(nullElement);
                data.forEach((city) => {
                    const element = document.createElement("option");
                    element.value = city.Ref;
                    element.textContent = city.Description;
                    containerInputWrap.appendChild(element);
                })
            } 
        });
    }

    clearOptions = (selectElement) => {
        selectElement.innerHTML = "";
    };

    async updateAreaOptions(container){
        const areasData = (await this.fetchNewPostAPIData("get_regions")).regions;
        this.areasDataWithNullField = [{ Ref: null, Description: "-- Оберіть область --" }, ...areasData];
    
        this.clearOptions(container);
    
        this.areasDataWithNullField.forEach((area) => {
            const element = document.createElement("option");
            element.value = area.Ref;
            element.textContent = area.Description;
            container.appendChild(element);
        });

        return areasData;
    }
}

