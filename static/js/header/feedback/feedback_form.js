class FeedbackForm extends Form{
    constructor(obj, patterns, formName, alertCl, ...args){
        super(obj, patterns, formName, alertCl, ...args);
    }

    async initForm(formContainerId, obj, path, methodType, msgObj, animDuration, clearCond = true){
        
        const formContainer = document.getElementById(formContainerId);

        const fields = formContainer.querySelectorAll("[data-field]");
        fields.forEach((field) => 
            field.addEventListener("input", (e) => 
                this.triggerInput(field.dataset.field)
        ));

        this.userAuthDefaultData();

        const btnsWrappers = Array.from(document.querySelectorAll(".index-page__user-info__btns-wrap"))
            .map((btnsWrapper) => btnsWrapper.children);

        btnsWrappers.forEach(([btnEdit, btnClear]) => {
            btnEdit.addEventListener("click", () => this.editField(btnEdit.dataset.edit));
            btnClear.addEventListener("click", () => this.clearField(btnClear.dataset.clear));
        })

        this.dataSubmitBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            this.showModalLoader();

            
            let emptyForm = false;
            Object.keys(this.formData).forEach(key => this.triggerInput(key));
            
            const submitedFormData = {...this.mapedFormData(obj), ...this.selectedBasketObj};

            try {
                Object.keys(this.formData).map(key => {
                    if(this.formData[key].value === ""){
                        emptyForm = true;
                        throw Error();
                    }
                });

                const response = await this.fetchData(path, methodType, submitedFormData);
                if(!response.message){
                    throw response.error;
                }
                this.hideModalLoader();
                this.alert("success", msgObj.successMessage, animDuration);
                console.log(response);

                
                if (clearCond) {
                    this.clearForm(this.initObj);
                    
                }
                this.userAuthDefaultData();
            } catch (err) {
                this.userAuthDefaultData();
                this.hideModalLoader();
                let errText = ""
                    for (const [key, val] of Object.entries(err)) {
                        errText += `${this.errorKeys[key]}: ${val}\n\n`
                }
                if(emptyForm)
                    this.alert("err", "Будь ласка заповніть поля форми", animDuration);
                else 
                    this.alert("err", errText, animDuration)
            }
        });
    }

    showModalLoader(){
        document.getElementById("feedback-modal-content").style.display = "flex";
    }

    hideModalLoader(){
        document.getElementById("feedback-modal-content").style.display = "none"
    }

}