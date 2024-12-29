document.addEventListener("DOMContentLoaded", function () {
    // Выбираем все поля родительской категории
    const categorySelects = document.querySelectorAll('select[id$="-parent_category"]');

    // Обрабатываем изменения в родительских категориях
    categorySelects.forEach(function (categorySelect) {
        const subCategorySelect = categorySelect.closest('tr').querySelector('select[id$="-category_id"]');

        // Обработчик изменения родительской категории
        categorySelect.addEventListener('change', function () {
            const selectedCategoryId = this.value;  // Получаем выбранную родительскую категорию
            subCategorySelect.innerHTML = '<option value="" selected="">---------</option>';  // Очищаем старые подкатегории

            if (selectedCategoryId) {
                // Загружаем подкатегории для выбранной родительской категории
                loadSubcategories(selectedCategoryId, subCategorySelect);
            }
        });
    });
});

// Функция для загрузки подкатегорий
function loadSubcategories(categoryId, subCategorySelect, callback) {
    fetch(`/get-subcategories/${categoryId}/`)  // Запрашиваем подкатегории по родительской категории
        .then(response => response.json())
        .then(data => {
            subCategorySelect.innerHTML = '<option value="" selected="">---------</option>';  // Очищаем старые подкатегории
            data.subcategories.forEach(subCategory => {
                const option = document.createElement('option');
                option.value = subCategory.id;
                option.textContent = subCategory.name;
                subCategorySelect.appendChild(option);
            });

            // Вызываем callback после загрузки подкатегорий
            if (callback) callback();
        })
        .catch(error => {
            console.error('Ошибка при загрузке подкатегорий:', error);
        });
}


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