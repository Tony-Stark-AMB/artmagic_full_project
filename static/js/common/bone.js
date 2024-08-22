if (!localStorage.getItem('products')) 
    // Если данных нет, создаем объект с пустым массивом и записываем его в Local Storage
    localStorage.setItem('products', JSON.stringify([]));

