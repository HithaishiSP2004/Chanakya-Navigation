from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import BuildingSerializer, VenueSerializer, SchoolSerializer, AnnouncementSerializer
from .selectors import get_all_buildings, get_venues_by_category, search_venues
from .models import School, Announcement

def standard_response(data, message="Success", status_code=status.HTTP_200_OK):
    return Response({
        'success': True,
        'message': message,
        'data': data
    }, status=status_code)

class BuildingListView(APIView):
    def get(self, request):
        buildings = get_all_buildings()
        serializer = BuildingSerializer(buildings, many=True)
        return standard_response(serializer.data)

class VenueListView(APIView):
    def get(self, request):
        category = request.query_params.get('category')
        venues = get_venues_by_category(category)
        serializer = VenueSerializer(venues, many=True)
        return standard_response(serializer.data)

class SearchView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '')
        category = request.query_params.get('category')
        results = search_venues(query, category)
        serializer = VenueSerializer(results, many=True)
        return standard_response(serializer.data)

class SchoolListView(APIView):
    def get(self, request):
        schools = School.objects.all()
        serializer = SchoolSerializer(schools, many=True)
        return standard_response(serializer.data)

class AnnouncementListView(APIView):
    def get(self, request):
        announcements = Announcement.objects.filter(is_active=True).order_by('-created_at')
        serializer = AnnouncementSerializer(announcements, many=True)
        return standard_response(serializer.data)
