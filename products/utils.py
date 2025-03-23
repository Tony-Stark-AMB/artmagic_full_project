import re


def alphanumeric_sort(text):
    """Функция для сортировки строк, содержащих как буквы, так и цифры."""

    def convert(text):
        return int(text) if text.isdigit() else text.lower()

    return [convert(c) for c in re.split('([0-9]+)', text)]

def get_sorted_product_attributes(product_attribute):
    attributes_dict={}

    for att in product_attribute:
        att_filter_category = att.filter_category.name
        if att_filter_category not in attributes_dict:
            attributes_dict[att_filter_category] = set()

        attributes_dict[att_filter_category].add(att.filter_value.value)
    for name, texts in sorted(attributes_dict.items(), key=lambda x: alphanumeric_sort(x[0])):
        print(name, texts)

    attributes = [{
        'name': name.upper(),
        'text': sorted(list(texts), key=alphanumeric_sort)  # сортируем сами значения
    } for name, texts in sorted(attributes_dict.items(), key=lambda x: alphanumeric_sort(x[0]))]

    return attributes