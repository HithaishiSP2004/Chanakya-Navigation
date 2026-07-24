from django.db import models

class Zone(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class Building(models.Model):
    ZONE_CHOICES = [
        ('ADMINISTRATIVE', 'Administrative'),
        ('ACADEMIC', 'Academic'),
        ('RESIDENTIAL', 'Residential'),
        ('SPORTS', 'Sports'),
        ('LANDSCAPE', 'Landscape'),
    ]

    building_id = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=200)
    zone = models.CharField(max_length=30, choices=ZONE_CHOICES, default='ACADEMIC')
    description = models.TextField()
    hero_image = models.CharField(max_length=500, default='/images/placeholders/building.svg')
    thumbnail_image = models.CharField(max_length=500, default='/images/placeholders/building.svg')
    official_web_link = models.URLField(blank=True, null=True)
    centroid_lat = models.FloatField()
    centroid_lng = models.FloatField()
    polygon_coordinates = models.JSONField(help_style='Array of {lat, lng} points')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} [{self.code}]"

class BuildingEntrance(models.Model):
    ENTRANCE_TYPE_CHOICES = [
        ('MAIN', 'Main Entrance'),
        ('WHEELCHAIR', 'Wheelchair Accessible'),
        ('SIDE', 'Side Entrance'),
        ('SERVICE', 'Service Door'),
    ]

    entrance_id = models.CharField(max_length=50, unique=True)
    building = models.ForeignKey(Building, related_name='entrances', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    entrance_type = models.CharField(max_length=20, choices=ENTRANCE_TYPE_CHOICES, default='MAIN')
    lat = models.FloatField()
    lng = models.FloatField()
    associated_node_id = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.name} - {self.building.name}"

class School(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    dean_name = models.CharField(max_length=100, blank=True)
    building = models.ForeignKey(Building, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField()
    web_link = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name

class Venue(models.Model):
    CATEGORY_CHOICES = [
        ('ADMISSION', 'Admission'),
        ('ACADEMIC', 'Academic'),
        ('HOSTEL', 'Hostel'),
        ('LIBRARY', 'Library'),
        ('CAFETERIA', 'Cafeteria'),
        ('PARKING', 'Parking'),
        ('MEDICAL', 'Medical'),
        ('FACULTY', 'Faculty'),
        ('SPORTS', 'Sports'),
        ('EMERGENCY', 'Emergency'),
    ]

    venue_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    building_name = models.CharField(max_length=200)
    floor = models.IntegerField(default=0)
    lat = models.FloatField()
    lng = models.FloatField()
    description = models.TextField()
    image_url = models.CharField(max_length=500, default='/images/placeholders/building.svg')
    is_accessible = models.BooleanField(default=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    official_link = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.category})"

class Announcement(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class SynonymRegistry(models.Model):
    keyword = models.CharField(max_length=100, unique=True)
    target_building_id = models.CharField(max_length=50)

    def __str__(self):
        return f"'{self.keyword}' -> {self.target_building_id}"
