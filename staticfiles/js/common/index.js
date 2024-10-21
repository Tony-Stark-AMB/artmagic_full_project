const rerenderImage = function(images) {
    images.forEach(img => {
        img.onload = function () {
            
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            const ratio = height / width;
            if (ratio <= 1.2) {
                img.classList.add('ratio-1-1');
            } else if (ratio <= 2) {
                img.classList.add('ratio-1-2');
            } else if (ratio <= 3) {
                img.classList.add('ratio-1-3');
            } else if (ratio <= 4) {
                img.classList.add('ratio-1-4');
            }
        };

        // If the image is already loaded (from cache)
        if (img.complete) {
            img.onload();
        }
    });
}

const isFloat = (value) => (typeof value === 'number' && value % 1 !== 0);

const initImagesRation = (page) => {
    console.log("initImagesRation")
    try{
        const images = document.querySelectorAll(`.products-${page}__item__img`)

        document.addEventListener('DOMContentLoaded', () => rerenderImage(images));
    }
    catch (err) {
        const newErr = new Error(err);
        console.log(newErr);
        throw newErr;
        
    }
}


    

