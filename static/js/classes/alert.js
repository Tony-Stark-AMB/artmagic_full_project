let labelTimer = null;

const Alert = function (type, text, animDuration){
    successLabel = document.querySelector("div#successMessage");
    errorLabel = document.querySelector("div#errorMessage");
    const label = type =="success" ? successLabel : errorLabel;
        label.classList.add("alert_anim");
        label.querySelector("div.alert-text").textContent = text;
        
        if(labelTimer){
            clearInterval(labelTimer);
            console.log("Старый таймер убит")
        }

        labelTimer = setTimeout(() => {
            label.classList.remove("alert_anim");
        }, animDuration);
}