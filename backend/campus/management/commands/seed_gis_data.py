import json
import os
from pathlib import Path
from django.core.management.base import BaseCommand
from campus.models import Building, BuildingEntrance, Venue, SynonymRegistry

class Command(BaseCommand):
    help = 'Seeds PostGIS/SQLite database with campus GIS JSON records'

    def handle(self, *args, **options):
        base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
        gis_dir = base_dir / 'src' / 'gis'
        knowledge_dir = base_dir / 'knowledge'

        bldg_file = gis_dir / 'building-polygons.json'
        synonym_file = gis_dir / 'synonyms.json'
        poi_file = knowledge_dir / 'poi_database.json'

        self.stdout.write(self.style.SUCCESS('Starting GIS Data Seeding...'))

        # Seed Buildings & Entrances
        if bldg_file.exists():
            with open(bldg_file, 'r') as f:
                bldgs = json.load(f)
                for item in bldgs:
                    bldg, _ = Building.objects.update_or_create(
                        building_id=item['id'],
                        defaults={
                            'code': item['code'],
                            'name': item['name'],
                            'zone': item['zone'],
                            'description': item['description'],
                            'hero_image': item.get('heroImage', '/images/placeholders/building.svg'),
                            'thumbnail_image': item.get('thumbnailImage', '/images/placeholders/building.svg'),
                            'official_web_link': item.get('officialWebLink', ''),
                            'centroid_lat': item['centroid']['lat'],
                            'centroid_lng': item['centroid']['lng'],
                            'polygon_coordinates': item['polygon'],
                        }
                    )

                    for ent_item in item.get('entrances', []):
                        BuildingEntrance.objects.update_or_create(
                            entrance_id=ent_item['id'],
                            defaults={
                                'building': bldg,
                                'name': ent_item['name'],
                                'entrance_type': ent_item['type'],
                                'lat': ent_item['coordinate']['lat'],
                                'lng': ent_item['coordinate']['lng'],
                                'associated_node_id': ent_item['associatedNodeId'],
                            }
                        )

        # Seed Synonyms
        if synonym_file.exists():
            with open(synonym_file, 'r') as f:
                synonyms = json.load(f)
                for kw, target_id in synonyms.items():
                    SynonymRegistry.objects.update_or_create(
                        keyword=kw.lower(),
                        defaults={'target_building_id': target_id}
                    )

        # Seed Venues
        venues_sample = [
            {
                'venue_id': 'v-admin-01',
                'name': 'Office of Admissions & Registration',
                'code': 'ND-ADMIS-02',
                'category': 'ADMISSION',
                'building_name': 'Dr. Sita Ram Jindal Administrative Block',
                'floor': 0,
                'lat': 13.2255,
                'lng': 77.7124,
                'description': 'Spot admissions, document submission, fee structure confirmation.',
                'image_url': '/images/placeholders/building.svg',
                'is_accessible': True,
                'phone': '08031233133',
                'email': 'admissions@chanakyauniversity.edu.in',
                'official_link': 'https://chanakyauniversity.edu.in/admissions/'
            },
            {
                'venue_id': 'v-acad-01',
                'name': 'School of Engineering & Computer Labs',
                'code': 'SOE',
                'category': 'ACADEMIC',
                'building_name': 'Sudha & Kris Gopalakrishnan Academic Block',
                'floor': 1,
                'lat': 13.2268,
                'lng': 77.7136,
                'description': 'Robotics, AI, Computer Science labs, S.N. Bose Computing Lab.',
                'image_url': '/images/placeholders/building.svg',
                'is_accessible': True,
                'official_link': 'https://chanakyauniversity.edu.in/school-of-engineering/'
            }
        ]

        for v_item in venues_sample:
            Venue.objects.update_or_create(
                venue_id=v_item['venue_id'],
                defaults=v_item
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded all GIS records!'))
