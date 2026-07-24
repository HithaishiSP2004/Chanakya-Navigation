from rest_framework import serializers
from .models import Building, BuildingEntrance, School, Venue, Announcement

class BuildingEntranceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildingEntrance
        fields = ['entrance_id', 'name', 'entrance_type', 'lat', 'lng', 'associated_node_id']

class BuildingSerializer(serializers.ModelSerializer):
    entrances = BuildingEntranceSerializer(many=True, read_only=True)

    class Meta:
        model = Building
        fields = [
            'building_id', 'code', 'name', 'zone', 'description', 
            'hero_image', 'thumbnail_image', 'official_web_link',
            'centroid_lat', 'centroid_lng', 'polygon_coordinates', 'entrances'
        ]

class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['code', 'name', 'dean_name', 'description', 'web_link']

class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = [
            'venue_id', 'name', 'code', 'category', 'building_name', 
            'floor', 'lat', 'lng', 'description', 'image_url', 
            'is_accessible', 'phone', 'email', 'official_link'
        ]

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'created_at']
