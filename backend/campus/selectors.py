from .models import Building, Venue, School, SynonymRegistry

def get_all_buildings():
    return Building.objects.prefetch_related('entrances').all()

def get_venues_by_category(category=None):
    queryset = Venue.objects.all()
    if category and category != 'ALL':
        queryset = queryset.filter(category=category)
    return queryset

def search_venues(query_text, category=None):
    queryset = Venue.objects.all()
    if category and category != 'ALL':
        queryset = queryset.filter(category=category)
    
    if not query_text:
        return queryset

    query_norm = query_text.lower().strip()
    
    # Tiered Search Filtering
    synonym = SynonymRegistry.objects.filter(keyword=query_norm).first()
    if synonym:
        return queryset.filter(venue_id__icontains=synonym.target_building_id)

    return queryset.filter(
        name__icontains=query_norm
    ) | queryset.filter(
        building_name__icontains=query_norm
    ) | queryset.filter(
        code__icontains=query_norm
    ) | queryset.filter(
        description__icontains=query_norm
    )
