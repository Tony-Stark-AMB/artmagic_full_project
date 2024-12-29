initImagesRation(DETAILE);

const formatText = (text) =>{
    // Заменяем знаки ":" и ставим пробел после них
    text = text.replace(/:/g, ': ');

    // Заменяем знаки ";" и сносим дважды строку после них
    text = text.replace(/;/g, ';\n\n');

    return text;
}

document.addEventListener("DOMContentLoaded", () => {

    const productDescriptionElement = document.querySelector(".product-description");
    productDescriptionElement.innerText = formatText(productDescriptionElement.innerText);

    function changeMainImage(thumbnail) {
        const mainImage = document.querySelector('.products-detaile__item__img');
        mainImage.classList.remove('show'); // Убираем класс show для начала анимации

    
        mainImage.src = thumbnail.src;
        mainImage.classList.add('show'); // Добавляем класс show для эффекта fade-in
 
        // Убираем класс active у всех миниатюр и добавляем его для активной
        const thumbnails = document.querySelectorAll('.product-thumbnails');
        thumbnails.forEach(function(img) {
            img.classList.remove('active');
        });
        thumbnail.classList.add('active');
    }

    // Находим все миниатюры и добавляем обработчик клика
    const thumbnails = document.querySelectorAll('.product-thumbnails');
    if(thumbnails.length > 1){
        changeMainImage(thumbnails[0])
        thumbnails.forEach(function(thumbnail) {
            thumbnail.addEventListener('click', function() {
                changeMainImage(this);
            });
        });
    }
    
    const productImage = document.querySelector(".products-detaile__item__img");
    const modal = document.getElementById("productImageModal");
    const modalImage = document.getElementById("productModalImage");
    const closeButton = document.querySelector(".product-modal__close");

    // Открытие модалки при клике на изображение
    productImage.addEventListener("click", () => {
        modal.style.display = "block";
        modalImage.src = productImage.src;
    });

    // Закрытие модалки при клике на кнопку закрытия
    closeButton.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Закрытие модалки при клике вне изображения
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
})