export const {HOST, PORT, PROTOCOL} = {
    HOST: "127.0.0.1",
    PORT: "8000",
    PROTOCOL: "http"
}

export const rerenderImage = function(images) {
    console.log("rerender")
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

