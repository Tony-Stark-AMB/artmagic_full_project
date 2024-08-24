if (!localStorage.getItem('products')) 
    // Если данных нет, создаем объект с пустым массивом и записываем его в Local Storage
    localStorage.setItem('products', JSON.stringify([]));

    const adminLinkEl = document.getElementById("adminLink");

    // http://localhost:8000/admin

    adminLinkEl.setAttribute("href", `${PROTOCOL}://${HOST}:${PORT}/admin`)
