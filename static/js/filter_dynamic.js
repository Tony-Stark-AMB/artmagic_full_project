document.addEventListener("DOMContentLoaded", function () {
    // Функция для обновления категорий и значений фильтров
    function updateFilters(filterGroupSelect) {
        const filterCategorySelect = filterGroupSelect.closest('tr').querySelector('select[id$="-filter_category"]');
        const filterValueSelect = filterCategorySelect.closest('tr').querySelector('select[id$="-filter_value"]');
        const productId = filterGroupSelect.closest('tr').querySelector('input[name$="-product"]').value; // Получаем product_id
        const groupId = filterGroupSelect.value;
        const categoryId = filterCategorySelect.value; // Получаем category_id
        const valueId = filterValueSelect.value; // Получаем значение фильтра

        // Если выбрана группа
        if (groupId) {
            const url = `/get-filter-data/${groupId}/?product_id=${productId}&category_id=${categoryId}&value_id=${valueId}`;

            fetch(url, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
            .then(response => response.json())
            .then(data => {
                // Обновление категорий фильтров
                filterCategorySelect.innerHTML = '';
                data.categories.forEach(function(category) {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.text = category.name;
                    option.selected = category.selected;  // Устанавливаем выбранное значение
                    filterCategorySelect.appendChild(option);
                });

                // Обновление значений фильтров
                filterValueSelect.innerHTML = '';
                data.values.forEach(function(value) {
                    const option = document.createElement('option');
                    option.value = value.id;
                    option.text = value.value;
                    option.selected = value.selected;  // Устанавливаем выбранное значение
                    filterValueSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error fetching filter data:', error);
            });
        }
    }

    // Функция для обновления значений фильтров при изменении категории
    function updateFilterValues(filterCategorySelect) {
        const filterValueSelect = filterCategorySelect.closest('tr').querySelector('select[id$="-filter_value"]');
        const productId = filterCategorySelect.closest('tr').querySelector('input[name$="-product"]').value; // Получаем product_id
        const groupId = filterCategorySelect.closest('tr').querySelector('select[id$="-filter_group"]').value; // Получаем group_id
        const categoryId = filterCategorySelect.value; // Получаем category_id
        const valueId = filterValueSelect.value; // Получаем значение фильтра

        // Если выбрана категория
        if (categoryId) {
            const url = `/get-filter-data/${groupId}/?product_id=${productId}&category_id=${categoryId}&value_id=${valueId}`;

            fetch(url, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
            .then(response => response.json())
            .then(data => {
                // Обновление значений фильтров
                filterValueSelect.innerHTML = '';
                data.values.forEach(function(value) {
                    const option = document.createElement('option');
                    option.value = value.id;
                    option.text = value.value;
                    option.selected = value.selected;  // Устанавливаем выбранное значение
                    filterValueSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error fetching filter values:', error);
            });
        }
    }

    // При изменении группы категорий фильтра
    document.addEventListener('change', function (event) {
        if (event.target.matches('select[id^="id_filters-"][id$="-filter_group"]')) {
            updateFilters(event.target);
        } else if (event.target.matches('select[id^="id_filters-"][id$="-filter_category"]')) {
            updateFilterValues(event.target);
        }
    });

    // При загрузке страницы подгружаем данные для уже выбранных групп
    document.querySelectorAll('select[id^="id_filters-"][id$="-filter_group"]').forEach(function (filterGroupSelect) {
        if (filterGroupSelect.value) {
            updateFilters(filterGroupSelect);
        }
    });
});
