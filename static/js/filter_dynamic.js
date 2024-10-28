// document.addEventListener("DOMContentLoaded", function () {
//     // Функция для обновления категорий и значений фильтров
//     function updateFilters(filterGroupSelect) {
//         const filterCategorySelect = filterGroupSelect.closest('tr').querySelector('select[id$="-filter_category"]');
//         const filterValueSelect = filterCategorySelect.closest('tr').querySelector('select[id$="-filter_value"]');
//         const productId = filterGroupSelect.closest('tr').querySelector('input[name$="-product"]').value; // Получаем product_id
//         const groupId = filterGroupSelect.value;
//         const categoryId = filterCategorySelect.value; // Получаем category_id
//         const valueId = filterValueSelect.value; // Получаем значение фильтра

//         // Если выбрана группа
//         if (groupId) {
//             const url = `/get-filter-data/${groupId}/?product_id=${productId}&category_id=${categoryId}&value_id=${valueId}`;

//             fetch(url, {
//                 method: 'GET',
//                 headers: {
//                     'X-Requested-With': 'XMLHttpRequest',
//                 }
//             })
//             .then(response => response.json())
//             .then(data => {
//                 // Обновление категорий фильтров
//                 filterCategorySelect.innerHTML = '';
//                 data.categories.forEach(function(category) {
//                     const option = document.createElement('option');
//                     option.value = category.id;
//                     option.text = category.name;
//                     option.selected = category.selected;  // Устанавливаем выбранное значение
//                     filterCategorySelect.appendChild(option);
//                 });

//                 // Обновление значений фильтров
//                 filterValueSelect.innerHTML = '';
//                 data.values.forEach(function(value) {
//                     const option = document.createElement('option');
//                     option.value = value.id;
//                     option.text = value.value;
//                     option.selected = value.selected;  // Устанавливаем выбранное значение
//                     filterValueSelect.appendChild(option);
//                 });
//             })
//             .catch(error => {
//                 console.error('Error fetching filter data:', error);
//             });
//         }
//     }

//     // Функция для обновления значений фильтров при изменении категории
//     function updateFilterValues(filterCategorySelect) {
//         const filterValueSelect = filterCategorySelect.closest('tr').querySelector('select[id$="-filter_value"]');
//         const productId = filterCategorySelect.closest('tr').querySelector('input[name$="-product"]').value; // Получаем product_id
//         const groupId = filterCategorySelect.closest('tr').querySelector('select[id$="-filter_group"]').value; // Получаем group_id
//         const categoryId = filterCategorySelect.value; // Получаем category_id
//         const valueId = filterValueSelect.value; // Получаем значение фильтра

//         // Если выбрана категория
//         if (categoryId) {
//             const url = `/get-filter-data/${groupId}/?product_id=${productId}&category_id=${categoryId}&value_id=${valueId}`;

//             fetch(url, {
//                 method: 'GET',
//                 headers: {
//                     'X-Requested-With': 'XMLHttpRequest',
//                 }
//             })
//             .then(response => response.json())
//             .then(data => {
//                 // Обновление значений фильтров
//                 filterValueSelect.innerHTML = '';
//                 data.values.forEach(function(value) {
//                     const option = document.createElement('option');
//                     option.value = value.id;
//                     option.text = value.value;
//                     option.selected = value.selected;  // Устанавливаем выбранное значение
//                     filterValueSelect.appendChild(option);
//                 });
//             })
//             .catch(error => {
//                 console.error('Error fetching filter values:', error);
//             });
//         }
//     }

//     // При изменении группы категорий фильтра
//     document.addEventListener('change', function (event) {
//         if (event.target.matches('select[id^="id_filters-"][id$="-filter_group"]')) {
//             updateFilters(event.target);
//         } else if (event.target.matches('select[id^="id_filters-"][id$="-filter_category"]')) {
//             updateFilterValues(event.target);
//         }
//     });

//     // При загрузке страницы подгружаем данные для уже выбранных групп
//     document.querySelectorAll('select[id^="id_filters-"][id$="-filter_group"]').forEach(function (filterGroupSelect) {
//         if (filterGroupSelect.value) {
//             updateFilters(filterGroupSelect);
//         }
//     });
// });
document.addEventListener("DOMContentLoaded", function () {
    // Отслеживаем селекторы для родительской категории
    const categorySelects = document.querySelectorAll('select[id$="-parent_category"]'); 
    // console.log("Найденные элементы для родительской категории:", categorySelects);

    categorySelects.forEach(function (categorySelect) {
        const subCategorySelect = categorySelect.closest('tr').querySelector('select[id$="-category_id"]'); 
        // console.log("Найденное поле подкатегории:", subCategorySelect);

        // Инициализация подкатегорий при загрузке страницы
        const initialCategoryId = categorySelect.value;

        if (initialCategoryId) {
            console.log("Загрузка подкатегорий при загрузке страницы для категории:", initialCategoryId);
            loadSubcategories(initialCategoryId, subCategorySelect);
        }

        // Слушаем изменение поля родительской категории
        categorySelect.addEventListener('change', function () {
            const selectedCategoryId = this.value;
            console.log("Выбрана родительская категория:", selectedCategoryId);

            // Очищаем подкатегории перед загрузкой новых значений
            subCategorySelect.innerHTML = '<option value="" selected="">---------</option>';

            if (selectedCategoryId) {
                loadSubcategories(selectedCategoryId, subCategorySelect);
            }
        });
    });

    // Функция загрузки подкатегорий
    function loadSubcategories(categoryId, subCategorySelect) {
        console.log("Отправка запроса на подкатегории для категории:", categoryId);
        fetch(`/get-subcategories/${categoryId}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("Получены подкатегории:", data);  // Отладка данных
                // Очищаем предыдущие значения
                subCategorySelect.innerHTML = '<option value="" selected="">---------</option>';  
                data.subcategories.forEach(subCategory => {
                    const option = document.createElement('option');
                    option.value = subCategory.id;
                    option.textContent = subCategory.name;
                    subCategorySelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Ошибка при загрузке подкатегорий:', error);
                // Вы можете добавить обработку ошибки, например, показать сообщение пользователю
            });
    }
});


// При загрузке страницы: первый скрипт загружает фильтры для уже выбранных значений.
document.addEventListener("DOMContentLoaded", function () {
    function loadInitialFilters(groupId, categoryId, valueId, productId, filterCategorySelect, filterValueSelect) {
        const url = `/load-initial-filter-data/${groupId}/?product_id=${productId}&category_id=${categoryId}&value_id=${valueId}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Обновляем категории
                if (groupId) {
                    filterCategorySelect.innerHTML = '';
                    data.categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.id;
                        option.text = category.name;
                        option.selected = category.selected; // Устанавливаем 'selected' из ответа
                        filterCategorySelect.appendChild(option);
                    });
                }
                // Обновляем значения
                if (categoryId) {
                    filterValueSelect.innerHTML = '';
                    data.values.forEach(value => {
                        const option = document.createElement('option');
                        option.value = value.id;
                        option.text = value.value;
                        option.selected = value.selected; // Устанавливаем 'selected' из ответа
                        filterValueSelect.appendChild(option);
                    });
                }
            })
            .catch(error => console.error('Error loading initial filter data:', error));
    }

    // Загружаем данные при загрузке страницы
    document.querySelectorAll('select[id^="id_filters-"][id$="-filter_group"]').forEach(filterGroupSelect => {
        const filterRow = filterGroupSelect.closest('tr');
        const filterCategorySelect = filterRow.querySelector('select[id$="-filter_category"]');
        const filterValueSelect = filterRow.querySelector('select[id$="-filter_value"]');
        const productId = filterRow.querySelector('input[name$="-product"]').value;

        const groupId = filterGroupSelect.value || 0; // Если группа не выбрана, используем 0
        const categoryId = filterCategorySelect.value || ''; // Текущая категория
        const valueId = filterValueSelect.value || ''; // Текущее значение
        // Просто загружаем данные, не проверяя groupId
        loadInitialFilters(groupId, categoryId, valueId, productId, filterCategorySelect, filterValueSelect);
    });
});

// При изменении группы или категории: второй скрипт обновляет данные в зависимости от выбора.
document.addEventListener("DOMContentLoaded", function () {
    function updateFiltersOnChange(filterSelect, isCategoryUpdate = false) {
        const filterRow = filterSelect.closest('tr');
        const filterGroupSelect = filterRow.querySelector('select[id$="-filter_group"]');
        const filterCategorySelect = filterRow.querySelector('select[id$="-filter_category"]');
        const filterValueSelect = filterRow.querySelector('select[id$="-filter_value"]');
        const productId = filterRow.querySelector('input[name$="-product"]').value;
        const groupId = filterGroupSelect.value || 0;
        const categoryId = filterCategorySelect.value || '';
        const valueId = filterValueSelect.value || '';

        console.log(`Group ID: ${groupId}, Category ID: ${categoryId}, Value ID: ${valueId}`);
        
        const url = `/update-filter-data-on-change/${groupId}/?product_id=${productId}&category_id=${categoryId}&value_id=${valueId}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (!isCategoryUpdate) {
                    filterCategorySelect.innerHTML = '';
                    
                    // Обновляем категории, устанавливая первую как выбранную
                    data.categories.forEach((category, index) => {
                        const option = document.createElement('option');
                        option.value = category.id;
                        option.text = category.name;
                        option.selected = index === 0;  // Устанавливаем первую категорию как выбранную
                        filterCategorySelect.appendChild(option);
                    });
                    
                    // После установки новой категории вызываем обновление значений
                    updateFilterValues(filterCategorySelect);
                }
            })
            .catch(error => console.error('Error updating filter data on change:', error));
    }

    function updateFilterValues(filterCategorySelect) {
        const filterRow = filterCategorySelect.closest('tr');
        const filterGroupSelect = filterRow.querySelector('select[id$="-filter_group"]');
        const filterValueSelect = filterRow.querySelector('select[id$="-filter_value"]');
        const productId = filterRow.querySelector('input[name$="-product"]').value;
        const groupId = filterGroupSelect.value || 0;
        const categoryId = filterCategorySelect.value || '';

        const url = `/update-filter-data-on-change/${groupId}/?product_id=${productId}&category_id=${categoryId}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                filterValueSelect.innerHTML = '';
                data.values.forEach(value => {
                    const option = document.createElement('option');
                    option.value = value.id;
                    option.text = value.value;
                    option.selected = value.selected;
                    filterValueSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error updating filter values:', error));
    }

    document.addEventListener('change', function (event) {
        if (event.target.matches('select[id^="id_filters-"][id$="-filter_group"]')) {
            updateFiltersOnChange(event.target);
        } else if (event.target.matches('select[id^="id_filters-"][id$="-filter_category"]')) {
            // При изменении категории вызываем обновление только значений
            updateFilterValues(event.target);
        }
    });
});








// document.addEventListener("DOMContentLoaded", function () {
//         // Объединенная функция для обновления категорий и значений фильтров
//         function updateFiltersAndValues(filterSelect, isCategoryUpdate = false) {
//             const filterGroupSelect = filterSelect.closest('tr').querySelector('select[id$="-filter_group"]');
//             const filterCategorySelect = filterSelect.closest('tr').querySelector('select[id$="-filter_category"]');
//             const filterRow = filterCategorySelect.closest('tr');
//             const filterValueSelect = filterRow.querySelector('select[id$="-filter_value"]');
//             console.log(filterValueSelect)
//             const productId = filterSelect.closest('tr').querySelector('input[name$="-product"]').value; // Получаем product_id
//             const groupId = filterGroupSelect.value || 0; // Если groupId пустой, присваиваем 0
//             const categoryId = filterCategorySelect.value; // Получаем category_id
           
//             const valueId = filterRow.classList.contains('has_original') ? filterValueSelect.value : '';
//             // const valueId = filterValueSelect.value; // Получаем значение фильтра
//             console.log(valueId)
//             // Формируем URL для запроса
//             const url = `/get-filter-data/${groupId}/?product_id=${productId}&category_id=${categoryId}&value_id=${valueId}`;
    
//             fetch(url, {
//                 method: 'GET',
//                 headers: {
//                     'X-Requested-With': 'XMLHttpRequest',
//                 }
//             })
//             .then(response => response.json())
//             .then(data => {
//                 // Обновление категорий фильтров
//                 if (!isCategoryUpdate) {
//                     filterCategorySelect.innerHTML = ''; // Очищаем категории
//                     if (data.categories.length > 0) {
//                         data.categories.forEach(function(category) {
//                             const option = document.createElement('option');
//                             option.value = category.id;
//                             option.text = category.name;
//                             option.selected = category.selected;  // Устанавливаем выбранное значение
//                             filterCategorySelect.appendChild(option);
//                         });
//                     } else {
//                         const option = document.createElement('option');
//                         option.value = '';
//                         option.text = 'Не выбрано';
//                         filterCategorySelect.appendChild(option);
//                     }
//                 }
    
//                 // Обновление значений фильтров
//                 filterValueSelect.innerHTML = '';
//                 data.values.forEach(function(value) {
//                     const option = document.createElement('option');
//                     option.value = value.id;
//                     option.text = value.value;
//                     option.selected = value.selected;  // Устанавливаем выбранное значение
//                     filterValueSelect.appendChild(option);
//                 });
//             })
//             .catch(error => {
//                 console.error('Error fetching filter data:', error);
//             });
//         }
    
//         // При изменении группы категорий фильтра или категории фильтра
//         document.addEventListener('change', function (event) {
//             if (event.target.matches('select[id^="id_filters-"][id$="-filter_group"]')) {
//                 updateFiltersAndValues(event.target);
//             } else if (event.target.matches('select[id^="id_filters-"][id$="-filter_category"]')) {
//                 updateFiltersAndValues(event.target, true);
//                 const filterGroupSelect = event.target.closest('tr').querySelector('select[id$="-filter_group"]');
//                 if (!filterGroupSelect.value) {
//                     updateFiltersAndValues(filterGroupSelect);
//                 }
//             }
//         });
    
//         // При загрузке страницы подгружаем данные для уже выбранных фильтров
//         document.querySelectorAll('select[id^="id_filters-"][id$="-filter_group"]').forEach(function (filterGroupSelect) {
//             const filterCategorySelect = filterGroupSelect.closest('tr').querySelector('select[id$="-filter_category"]');
    
//             if (filterGroupSelect.value) {
//                 updateFiltersAndValues(filterGroupSelect);
//             } else if (filterCategorySelect.value) {
//                 updateFiltersAndValues(filterGroupSelect);
//             }
//         });
//     });


// Хороший вариант но постоянно подтягивает предыдущий вариант значений без сохранения
// document.addEventListener("DOMContentLoaded", function () {
//     // Объединенная функция для обновления категорий и значений фильтров
//     function updateFiltersAndValues(filterSelect, isCategoryUpdate = false) {
//         const filterGroupSelect = filterSelect.closest('tr').querySelector('select[id$="-filter_group"]');
//         const filterCategorySelect = filterSelect.closest('tr').querySelector('select[id$="-filter_category"]');
//         const filterValueSelect = filterCategorySelect.closest('tr').querySelector('select[id$="-filter_value"]');
//         const productId = filterSelect.closest('tr').querySelector('input[name$="-product"]').value; // Получаем product_id
//         const groupId = filterGroupSelect.value || 0; // Если groupId пустой, присваиваем 0
//         const categoryId = filterCategorySelect.value; // Получаем category_id
//         const valueId = filterValueSelect.value; // Получаем значение фильтра

//         // Формируем URL для запроса
//         const url = `/get-filter-data/${groupId}/?product_id=${productId}&category_id=${categoryId}&value_id=${valueId}`;

//         fetch(url, {
//             method: 'GET',
//             headers: {
//                 'X-Requested-With': 'XMLHttpRequest',
//             }
//         })
//         .then(response => response.json())
//         .then(data => {
//             // Обновление категорий фильтров
//             if (!isCategoryUpdate) {
//                 filterCategorySelect.innerHTML = ''; // Очищаем категории
//                 if (data.categories.length > 0) {
//                     data.categories.forEach(function(category) {
//                         const option = document.createElement('option');
//                         option.value = category.id;
//                         option.text = category.name;
//                         option.selected = category.selected;  // Устанавливаем выбранное значение
//                         filterCategorySelect.appendChild(option);
//                     });
//                 } else {
//                     const option = document.createElement('option');
//                     option.value = '';
//                     option.text = 'Не выбрано';
//                     filterCategorySelect.appendChild(option);
//                 }
//             }

//             // Обновление значений фильтров
//             filterValueSelect.innerHTML = '';
//             data.values.forEach(function(value) {
//                 const option = document.createElement('option');
//                 option.value = value.id;
//                 option.text = value.value;
//                 option.selected = value.selected;  // Устанавливаем выбранное значение
//                 filterValueSelect.appendChild(option);
//             });
//         })
//         .catch(error => {
//             console.error('Error fetching filter data:', error);
//         });
//     }

//     // При изменении группы категорий фильтра или категории фильтра
//     document.addEventListener('change', function (event) {
//         if (event.target.matches('select[id^="id_filters-"][id$="-filter_group"]')) {
//             updateFiltersAndValues(event.target);
//         } else if (event.target.matches('select[id^="id_filters-"][id$="-filter_category"]')) {
//             updateFiltersAndValues(event.target, true);
//             const filterGroupSelect = event.target.closest('tr').querySelector('select[id$="-filter_group"]');
//             if (!filterGroupSelect.value) {
//                 updateFiltersAndValues(filterGroupSelect);
//             }
//         }
//     });

//     // При загрузке страницы подгружаем данные для уже выбранных фильтров
//     document.querySelectorAll('select[id^="id_filters-"][id$="-filter_group"]').forEach(function (filterGroupSelect) {
//         const filterCategorySelect = filterGroupSelect.closest('tr').querySelector('select[id$="-filter_category"]');

//         if (filterGroupSelect.value) {
//             updateFiltersAndValues(filterGroupSelect);
//         } else if (filterCategorySelect.value) {
//             updateFiltersAndValues(filterGroupSelect);
//         }
//     });
// });


// До обьеденения функций
// document.addEventListener("DOMContentLoaded", function () {
//     // Функция для обновления категорий и значений фильтров
//     function updateFilters(filterGroupSelect) {
//         const filterCategorySelect = filterGroupSelect.closest('tr').querySelector('select[id$="-filter_category"]');
//         const filterValueSelect = filterCategorySelect.closest('tr').querySelector('select[id$="-filter_value"]');
//         const productId = filterGroupSelect.closest('tr').querySelector('input[name$="-product"]').value; // Получаем product_id
//         let groupId = filterGroupSelect.value || 0; // Если groupId пустой, присваиваем 0
//         const categoryId = filterCategorySelect.value; // Получаем category_id
//         const valueId = filterValueSelect.value; // Получаем значение фильтра
    
//         // Формируем URL для запроса
//         const url = `/get-filter-data/${groupId}/?product_id=${productId}&category_id=${categoryId}&value_id=${valueId}`;
    
//         fetch(url, {
//             method: 'GET',
//             headers: {
//                 'X-Requested-With': 'XMLHttpRequest',
//             }
//         })
//         .then(response => response.json())
//         .then(data => {
//             // Обновление категорий фильтров
//             filterCategorySelect.innerHTML = ''; // Очищаем категории
//             if (data.categories.length > 0) {
//                 // Если категории есть, добавляем их
//                 data.categories.forEach(function(category) {
//                     const option = document.createElement('option');
//                     option.value = category.id;
//                     option.text = category.name;
//                     option.selected = category.selected;  // Устанавливаем выбранное значение
//                     filterCategorySelect.appendChild(option);
//                 });
//             } else {
//                 // Если категории отсутствуют, добавляем пустой элемент "Не выбрано"
//                 const option = document.createElement('option');
//                 option.value = '';
//                 option.text = 'Не выбрано';
//                 filterCategorySelect.appendChild(option);
//             }
    
//             // Обновление значений фильтров
//             filterValueSelect.innerHTML = '';
//             data.values.forEach(function(value) {
//                 const option = document.createElement('option');
//                 option.value = value.id;
//                 option.text = value.value;
//                 option.selected = value.selected;  // Устанавливаем выбранное значение
//                 filterValueSelect.appendChild(option);
//             });
//         })
//         .catch(error => {
//             console.error('Error fetching filter data:', error);
//         });
//     }

//     // Функция для обновления значений фильтров при изменении категории
//     function updateFilterValues(filterCategorySelect) {
//         const filterValueSelect = filterCategorySelect.closest('tr').querySelector('select[id$="-filter_value"]');
//         const productId = filterCategorySelect.closest('tr').querySelector('input[name$="-product"]').value; // Получаем product_id
//         let groupId = filterCategorySelect.closest('tr').querySelector('select[id$="-filter_group"]').value || 0; // Если groupId пустой, присваиваем 0
//         const categoryId = filterCategorySelect.value; // Получаем category_id
//         const valueId = filterValueSelect.value; // Получаем значение фильтра

//         // Если выбрана категория
//         if (categoryId) {
//             const url = `/get-filter-data/${groupId}/?product_id=${productId}&category_id=${categoryId}&value_id=${valueId}`;

//             fetch(url, {
//                 method: 'GET',
//                 headers: {
//                     'X-Requested-With': 'XMLHttpRequest',
//                 }
//             })
//             .then(response => response.json())
//             .then(data => {
//                 // Обновление значений фильтров
//                 filterValueSelect.innerHTML = '';
//                 data.values.forEach(function(value) {
//                     const option = document.createElement('option');
//                     option.value = value.id;
//                     option.text = value.value;
//                     option.selected = value.selected;  // Устанавливаем выбранное значение
//                     filterValueSelect.appendChild(option);
//                 });
//             })
//             .catch(error => {
//                 console.error('Error fetching filter values:', error);
//             });
//         }
//     }

//     // При изменении группы категорий фильтра или категории фильтра
//     document.addEventListener('change', function (event) {
//         if (event.target.matches('select[id^="id_filters-"][id$="-filter_group"]')) {
//             updateFilters(event.target);
//         } else if (event.target.matches('select[id^="id_filters-"][id$="-filter_category"]')) {
//             updateFilterValues(event.target);

//             // Если группа не выбрана, отправляем запрос с groupId = 0
//             const filterGroupSelect = event.target.closest('tr').querySelector('select[id$="-filter_group"]');
//             if (!filterGroupSelect.value) {
//                 updateFilters(filterGroupSelect);
//             }
//         }
//     });

//     // При загрузке страницы подгружаем данные для уже выбранных фильтров
//     document.querySelectorAll('select[id^="id_filters-"][id$="-filter_group"]').forEach(function (filterGroupSelect) {
//         const filterCategorySelect = filterGroupSelect.closest('tr').querySelector('select[id$="-filter_category"]');

//         // Если группа категории выбрана, загружаем фильтры как обычно
//         if (filterGroupSelect.value) {
//             updateFilters(filterGroupSelect);
//         } 
//         // Если группа категории не выбрана, но выбрана категория фильтра, отправляем запрос с groupId = 0
//         else if (filterCategorySelect.value) {
//             updateFilters(filterGroupSelect);
//         }
//     });
// });
