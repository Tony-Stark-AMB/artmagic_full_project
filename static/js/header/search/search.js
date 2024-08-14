// async fetchProducts(page) {
//     const pageUrl = window.location.href.split("/").filter(part => part !== "");
//     let slug = pageUrl[pageUrl.length - 1];
//     // console.log('-----=11==--', filtrartionProductsQuery);
//     let filtrartionProductsQuery = this.updateFilterString();
//     console.log('-----=22==--', filtrartionProductsQuery);
//     const { productsPerPage } = this.swiperPagination;

//     // Получаем параметры из URL
//     const urlParams = new URLSearchParams(window.location.search);
    
//     // Проверяем, есть ли параметр query в URL
//     if (urlParams.has('query')) {
//         filtrartionProductsQuery = slug.split('?')[1]; // Получаем параметры запроса
//         slug = 'search';  // Меняем slug на 'search', если есть параметр query
//     }

//     console.log('-----=44==--', filtrartionProductsQuery);
//     const url = `http://localhost:8000/product/${slug}/add-filters?page=${page}&productsPerPage=${productsPerPage}&${filtrartionProductsQuery ? filtrartionProductsQuery : ""}`;
//     console.log('---------url', url);
//     const response = await fetch(url, {
//         method: "GET",
//         mode: "cors",
//         headers: {
//             "Content-Type": "application/json"
//         }
//     });
//     return await response.json();
// }



// const fetchProducts = async (page = 1) =>{
//     const pageUrl = window.location.href.split("/").filter(part => part !== "");
//     const slug = pageUrl[pageUrl.length - 1];
//     const filtrartionProductsQuery = slug.split('?')[1];
//     const queryWordSlugSearch = 'search'
//     const { productsPerPage } = {
//         productsPerPage: 12,
//         currentPageGroup: 0,
//         buttonsPerGroup: 10,
//         totalPageGroups: 0,
//         previousPageIndex: 0
//     }

//     const url = `http://localhost:8000/product/${queryWordSlugSearch}/add-filters?page=${page}&productsPerPage=${productsPerPage}&${filtrartionProductsQuery ? filtrartionProductsQuery : ""}`;

//     const response = await fetch(url, {
//         method: "GET",
//         mode: "cors",
//         headers: {
//             "Content-Type": "application/json"
//         }
//     });
//     return await response.json();
// }



const searchInput = document.querySelector('[name="query"]');
const searchInputBtn = document.querySelector('[name="query__btn"]');

searchInputBtn.addEventListener("click", async () => searchInputLogic())

searchInput.addEventListener("keypress", async (e) => {
    if(e.key === "Enter")
        searchInputLogic()
})

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
