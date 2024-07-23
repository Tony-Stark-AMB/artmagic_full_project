import logging
from django.shortcuts import render, redirect
from django.http import JsonResponse
from .forms import DeliveryOptionForm
from .models import DeliveryOption
from .nova_poshta import NovaPoshtaAPI

# Настройка логирования
logger = logging.getLogger('nova_poshta')

def delivery_options(request):
    if request.method == 'POST':
        form = DeliveryOptionForm(request.POST)
        if form.is_valid():
            try:
                delivery_option = DeliveryOption(
                    user=request.user,
                    method=form.cleaned_data['method'],
                    city=form.cleaned_data['city'],
                    branch_id=form.cleaned_data.get('branch_id'),
                    postomat_id=form.cleaned_data.get('postomat_id')
                )
                delivery_option.save()
                return redirect('some_success_page')
            except Exception as e:
                logger.error("Error saving delivery option: %s", e)
                return render(request, 'delivery/delivery_options.html', {'form': form, 'error': str(e)})
    else:
        form = DeliveryOptionForm()

    context = {
        'form': form,
    }
    return render(request, 'delivery/delivery_options.html', context)

def get_regions(request):
    logger.debug("Fetching regions")
    regions = NovaPoshtaAPI.get_regions()
    logger.debug("Regions: %s", regions)
    return JsonResponse({
        'regions': regions.get('data', []),
    })

def get_cities(request):
    region_ref = request.GET.get('region_ref')
    if not region_ref:
        logger.error("region_ref is missing in request")
        return JsonResponse({'error': 'region_ref is missing'}, status=400)

    logger.debug("Fetching cities for region_ref: %s", region_ref)
    cities = NovaPoshtaAPI.get_cities(region_ref=region_ref)
    logger.debug("Cities: %s", cities)
    return JsonResponse({
        'cities': cities.get('data', []),
    })

def get_branches_and_postomats(request):
    city_ref = request.GET.get('city_ref')
    if not city_ref:
        logger.error("city_ref is missing in request")
        return JsonResponse({'error': 'city_ref is missing'}, status=400)

    logger.debug("Fetching branches and postomats for city_ref: %s", city_ref)
    branches = NovaPoshtaAPI.get_branches(city_ref=city_ref)
    postomats = NovaPoshtaAPI.get_postomats(city_ref=city_ref)

    logger.debug("Branches: %s", branches)
    logger.debug("Postomats: %s", postomats)

    return JsonResponse({
        'branches': branches.get('data', []),
        'postomats': postomats.get('data', []),
    })
