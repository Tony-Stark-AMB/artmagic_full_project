document.addEventListener("DOMContentLoaded", function () {
    // Обработчик событий для изменения категории фильтра
    document.addEventListener('change', function (event) {
        // Проверяем, что изменился элемент с фильтром категории
        if (event.target.matches('select[id^="id_filters-"][id$="-filter_category"]')) {
            const filterCategorySelect = event.target;
            const filterValueSelect = filterCategorySelect.closest('tr').querySelector('select[id$="-filter_value"]');

            const categoryId = filterCategorySelect.value;

            // Если выбрана категория
            if (categoryId) {
                fetch(`/get-filter-values/${categoryId}/`, {
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
                        filterValueSelect.appendChild(option);
                    });
                })
                .catch(error => {
                    console.error('Error fetching filter values:', error);
                });
            }
        }
    });
});
