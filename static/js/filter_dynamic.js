document.addEventListener("DOMContentLoaded", function () {
    // Функция для обновления значений фильтра на основе выбранной категории
    function updateFilterValues(filterCategorySelect) {
        const filterValueSelect = filterCategorySelect.closest('tr').querySelector('select[id$="-filter_value"]');
        const categoryId = filterCategorySelect.value;
        const productId = filterCategorySelect.closest('tr').querySelector('input[name$="-product"]').value;  // Получаем product_id из скрытого input

        // Если выбрана категория
        if (categoryId) {
            fetch(`/get-filter-values/${categoryId}/?product_id=${productId}`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
            .then(response => response.json())
            .then(data => {
                // Очистка предыдущих значений
                filterValueSelect.innerHTML = '';
                // Добавление новых значений
                data.values.forEach(function(value) {
                    const option = document.createElement('option');
                    option.value = value.id;
                    option.text = value.value;
                    if (value.selected) {
                        option.selected = true;  // Устанавливаем выбранное значение
                    }
                    filterValueSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error fetching filter values:', error);
            });
        }
    }

    // При изменении категории фильтра
    document.addEventListener('change', function (event) {
        if (event.target.matches('select[id^="id_filters-"][id$="-filter_category"]')) {
            updateFilterValues(event.target);
        }
    });

    // При загрузке страницы подгружаем значения для уже выбранных категорий фильтров
    document.querySelectorAll('select[id^="id_filters-"][id$="-filter_category"]').forEach(function (filterCategorySelect) {
        if (filterCategorySelect.value) {
            updateFilterValues(filterCategorySelect);
        }
    });
});
