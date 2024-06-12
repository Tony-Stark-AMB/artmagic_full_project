
// const form = function (obj, patterns, formName)  {

//     const formData = Object.fromEntries(
//         Object.keys(obj).map(key => [
//             key, 
//             { 
//                 value: "", 
//                 patterns: patterns[key] || [] 
//             }
//         ])
//     );
    
    
//     const initObj = obj;

//     const getField = (fieldName) => document.querySelector(`input[data-field="${fieldName}"]`) ?? document.querySelector(`textarea[data-field="${fieldName}"]`);
//     const errorMessageElement = (fieldName) => document.querySelector(`p[data-error="${fieldName}"]`);
//     const dataSubmitBtn = document.querySelector(`button[data-submit="btn_${formName}"]`);

//     const successLabel = document.querySelector("div#successMessage");
//     const errorLabel = document.querySelector("div#errorMessage");

//     return {
//         editField: (fieldName) => {
//             const target = getField(fieldName);
//             if(target.disabled)
//                 target.disabled = false;
//             else
//                 target.disabled = true;
//             target.focus();
//             target.setSelectionRange(target.value.length, target.value.length);
//         },
//         clearField: function(fieldName, triggerInpCond = true) { 
//             getField(fieldName).value = "";
//             if(triggerInpCond)
//                 this.triggerInput(fieldName);
//         },
//         triggerInput: function (fieldName)  {
//             const errorElem = errorMessageElement(fieldName);
//             this.validateField(fieldName, errorElem)
//             formData[fieldName].value = getField(fieldName).value;

//         },
//         validateField: (fieldName, errorElem) => {
//             const field = getField(fieldName);
           
//             const fieldValue = field.value;
 
//             const patterns = formData[fieldName].patterns;
        
//             for (let patternObj of patterns) {
//                 const regex = new RegExp(patternObj.rule);
//                 if (!regex.test(fieldValue)) {
//                     field.classList.add("invalid-input");
//                     errorElem.classList.remove("error-message-hidden");
//                     errorElem.classList.add("error-message");
//                     errorElem.textContent = patternObj.errorMsg;
//                     return false;
//                 }
//             }
//             if(errorElem){
//                 field.classList.remove("invalid-input");
//                 errorElem.classList.remove("error-message");
//                 errorElem.classList.add("error-message-hidden");
//                 errorElem.textContent = '';
//             }
//             return true;
//         },
//         initForm: function (obj, path, methodType, msgObj, animDuration, clearCond = true, 
//             ...args) {
//             dataSubmitBtn.addEventListener("click", async (e) => {
//                 e.preventDefault();
//                 const [getProducts, clearStorageProducts, clearProducts, basketRerender ] = args;
//                 for(const [key] of Object.entries(formData)){
//                     this.triggerInput(key)
//                 }

//                 const submitedFormData = this.mapedFormData(obj);
//                 if(args.length > 0)
//                     submitedFormData.products = getProducts();

                
                    
//                 try{
//                     if(submitedFormData.products.arr.length === 0){
//                         throw Error()
//                     }

//                     await this.fetchData(path, methodType, submitedFormData);

//                     this.showAlert("success", msgObj.successMessage, animDuration);
    
//                     if(clearCond){
//                         this.clearForm(initObj);
//                         if(args.length > 0){
//                             clearStorageProducts();
//                             clearProducts();
//                             basketRerender();
//                         }
                        
//                     }
//                 } catch (err){
//                     if(submitedFormData.products.arr.length === 0){
//                         this.showAlert("err", "Неможливо зробити замовлення без обраного товару", animDuration);
//                     } else {
//                         this.showAlert("err", msgObj.errorMessage, animDuration);
//                     }
                    
//                 }
         
               
                
               
//             })
//         },
//         fetchData: async function (path, methodType, data)  {
//             return fetch(`${PROTOCOL}://${HOST}:${PORT}/${path}`, {
//                 method: methodType,
//                 mode: "cors",      
//                 body: JSON.stringify(data),
//                 headers: {
//                     'X-CSRFToken': this.getCookie("csrftoken") // Добавляем CSRF токен в заголовок
//                 },
//             }).then((data) => data.json());
//         },
//         getCookie: (name) => {
//             let cookieValue = null;
//             if (document.cookie && document.cookie !== '') {
//                 const cookies = document.cookie.split(';');
//                 for (let i = 0; i < cookies.length; i++) {
//                     const cookie = cookies[i].trim();
//                     if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                         cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                         break;
//                     }
//                 }
//             }
//             return cookieValue;
//         },
//         mapedFormData: (obj) => (Object.fromEntries(Object.entries(formData).map(([key, { value }]) => [obj[key] || key, value]))),
//         showAlert: (type, text, animDuration) => {
//             console.log("show alert")
//             switch(type){
//                 case "success":
//                     successLabel.classList.add("alert_anim");
//                     successLabel.querySelector("div.alert-text").textContent = text;
//                         setTimeout(() => {
//                             successLabel.classList.remove("alert_anim");
 
//                         }, animDuration);
//                     break;
//                 case "err":
//                     errorLabel.classList.add("alert_anim");
//                     errorLabel.querySelector("div.alert-text").textContent = text;
//                     setTimeout(() => {
//                         errorLabel.classList.remove("alert_anim");
//                     }, animDuration);
//             }
                
//         },
//         clearForm: function (obj) { Object.keys(obj).forEach((key) =>  this.clearField(key, false))}
//     }
// }

   


