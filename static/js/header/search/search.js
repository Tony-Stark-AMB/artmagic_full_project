
const searchInput = document.querySelector('[name="query"]');
const searchInputBtn = document.querySelector('[name="query__btn"]');

searchInputBtn.addEventListener("click", async () => searchInputLogic())

searchInput.addEventListener('input', function() {
    // Заменяем все символы "/" и "\" на пустую строку
    this.value = this.value.replace(/[\/\\]/g, '');
});

searchInput.addEventListener("keypress", async (e) => {
    if(e.key === "Enter")
        searchInputLogic();
});



const searchInputLogic = () => {
    const searchInputValue = searchInput.value.trim();
    if(searchInput.value.trim() == "")
        return;
    
    localStorage.setItem("searchInputValue", searchInputValue);
    window.location.href = `${PROTOCOL}://${HOST}:${PORT}/product/search/?query=${searchInputValue}`;
    
}

document.addEventListener("DOMContentLoaded", () => {
    if(!window.location.href.includes("search"))
        return
    searchInput.value = localStorage.getItem("searchInputValue") ?? "";
})
