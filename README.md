# Chanakya Navigate — Official Smart Campus Guide (v1.0 RC)

> **"Find Your Way. Explore Your Campus. Instantly."**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-0D5C3A)](https://web.dev/progressive-web-apps/)
[![Django](https://img.shields.io/badge/Django-5-092E20)](https://www.djangoproject.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

Chanakya Navigate is the official digital navigation platform and campus handbook for **Chanakya University (Global Campus, Devanahalli, Bengaluru)**. Engineered as a mobile-first Progressive Web Application (PWA), it allows visitors, freshers, faculty guests, and parents to scan entrance QR codes for **instant zero-friction spatial guidance**—without downloading app store apps or registering accounts.

---

## 🌟 Key Architecture & Highlights

- **Zero-Friction Access**: Instant QR entry (`/?entry=security_arch&purpose=admission`) with no login required.
- **100% Client-Side Local Pathfinder**: Pedestrian pathfinding powered locally by Dijkstra's algorithm (`src/utils/dijkstra.ts`) over walkway GIS graphs (`routing_nodes.json` & `routing_edges.json`), completely bypassing Google Directions API.
- **Digital Twin Data Hierarchy**: Multi-tier spatial modeling (`Campus -> Zones -> Walkways -> Building Polygons -> Door Entrances -> POIs`).
- **Door Entrance Snapping**: Routes terminate precisely at building entrance doors (`BuildingEntrance`), never at building geometric centroids.
- **GPS Kalman Filter & Edge Snapping**: Continuous location tracking with noise reduction, device gyroscope compass heading, and 12m walkway edge snapping.
- **Automatic 15m Rerouting Engine**: Dynamic deviation detection automatically recalculates walking paths if users stray off-route.
- **Dual Arrival Engine**: Triggers arrival celebration cards when users step inside building polygons or reach <5m from entrance doors.
- **"Explore Chanakya" Digital Guide**: Handbook tab featuring academic school directories, service touchpoints, and direct bridges to the official university portal.
- **Presentation Demo Simulator**: Built-in walkthrough simulator allowing judges to preview guidance animations and camera tracking indoors.
- **GeoDjango Backend Gateway (`backend/`)**: Django 5 + DRF + GeoDjango REST platform providing dynamic administrative content control.

---

## ⚡ Deployment on Vercel

To deploy this application to **Vercel**:

1. **Push Code to GitHub**: Ensure this repository is imported into your Vercel account.
2. **Configure Environment Variables**: In your Vercel Project Settings under **Environment Variables**, add:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=your_custom_map_id
   BACKEND_API_URL=https://your-backend-domain.com/api/v1
   DJANGO_SECRET_KEY=your_production_secret_key
   ```
3. **Build & Output Settings**:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: Next.js default (`.next`)

---

## 🚀 Quick Start (Frontend Development)

### Prerequisites
- Node.js 18+ & npm

### Installation & Launch
```bash
# Clone repository
git clone https://github.com/HithaishiSP2004/Chanakya-Navigation.git
cd Chanakya-Navigation

# Install dependencies
npm install

# Setup local environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐍 Backend Platform & GIS Seeding (`backend/`)

### Setup Django Backend
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed GIS Data directly from local JSON files
python manage.py seed_gis_data

# Start Django REST API server
python manage.py runserver 8000
```

The Django Admin Portal will be available at `http://localhost:8000/admin/`.

---

## 🐳 Docker Production Deployment

Run the complete full stack (Next.js Frontend + Django REST Backend + PostGIS Database + Nginx Reverse Proxy) with a single command:

```bash
docker-compose up --build -d
```

---

## 📄 License & Institutional Credits

Developed for **Chanakya University**, Devanahalli, Bengaluru.  
All branding, logo vectors, and campus GIS datasets belong to Chanakya University.
