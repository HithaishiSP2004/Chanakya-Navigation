from django.contrib import admin
from .models import Zone, Building, BuildingEntrance, School, Venue, Announcement, SynonymRegistry

class BuildingEntranceInline(admin.TabularInline):
    model = BuildingEntrance
    extra = 1

@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'zone', 'centroid_lat', 'centroid_lng']
    search_fields = ['name', 'code', 'description']
    list_filter = ['zone']
    inlines = [BuildingEntranceInline]

@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'category', 'building_name', 'floor']
    search_fields = ['name', 'code', 'description']
    list_filter = ['category', 'floor']

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'dean_name']

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_active', 'created_at']

@admin.register(SynonymRegistry)
class SynonymRegistryAdmin(admin.ModelAdmin):
    list_display = ['keyword', 'target_building_id']
    search_fields = ['keyword', 'target_building_id']

admin.site.register(Zone)
