from django.urls import path
from .views import (
    BuildingListView,
    VenueListView,
    SearchView,
    SchoolListView,
    AnnouncementListView
)

urlpatterns = [
    path('buildings/', BuildingListView.as_view(), name='building-list'),
    path('venues/', VenueListView.as_view(), name='venue-list'),
    path('search/', SearchView.as_view(), name='search'),
    path('schools/', SchoolListView.as_view(), name='school-list'),
    path('announcements/', AnnouncementListView.as_view(), name='announcement-list'),
]
