// ============================================================
// 🗺️ LOCALISATION — Carte intelligente Shashap (multi-entités)
// ============================================================

let locMap = null;
let locMarkers = [];
let markerIdCounter = 0;

function animateCounter(elementId, targetValue, duration = 800) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let start = 0;
    const step = Math.ceil(targetValue / (duration / 16));
    const timer = setInterval(() => {
        start += step;
        if (start >= targetValue) {
            el.textContent = targetValue;
            clearInterval(timer);
        } else {
            el.textContent = start;
        }
    }, 16);
}

function buildMarkerIcon(type) {
    const id = 'grad' + (++markerIdCounter);
    let svg = '';
    if (type === 'orders') {
        svg = `<svg width="100%" height="100%" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="36" r="36" fill="url(#${id})"/>
            <path d="M22 28L36 20L50 28L36 36L22 28Z" fill="white" opacity="0.95"/>
            <path d="M22 28V42L36 50V36L22 28Z" fill="white" opacity="0.85"/>
            <path d="M50 28V42L36 50V36L50 28Z" fill="white" opacity="0.75"/>
            <defs><linearGradient id="${id}" x1="0" y1="0" x2="72" y2="72">
                <stop stop-color="#FF9800"/><stop offset="1" stop-color="#F57C00"/>
            </linearGradient></defs>
        </svg>`;
    } else if (type === 'events') {
        svg = `<svg width="100%" height="100%" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="36" r="36" fill="url(#${id})"/>
            <path d="M24 20H48V28H24V20Z" fill="white" opacity="0.9"/>
            <path d="M26 28V46H46V28H26Z" fill="white" opacity="0.8"/>
            <circle cx="32" cy="38" r="2" fill="#9C27B0"/>
            <circle cx="40" cy="38" r="2" fill="#9C27B0"/>
            <path d="M30 44H42" stroke="#9C27B0" stroke-width="2" stroke-linecap="round"/>
            <defs><linearGradient id="${id}" x1="0" y1="0" x2="72" y2="72">
                <stop stop-color="#9C27B0"/><stop offset="1" stop-color="#E91E63"/>
            </linearGradient></defs>
        </svg>`;
    } else if (type === 'clients') {
        svg = `<svg width="100%" height="100%" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="36" r="36" fill="url(#${id})"/>
            <circle cx="28" cy="28" r="6" fill="white" opacity="0.9"/>
            <circle cx="44" cy="28" r="6" fill="white" opacity="0.9"/>
            <path d="M22 48C22 42.477 26.477 38 32 38H40C45.523 38 50 42.477 50 48V50H22V48Z" fill="white" opacity="0.9"/>
            <defs><linearGradient id="${id}" x1="0" y1="0" x2="72" y2="72">
                <stop stop-color="#1E88E5"/><stop offset="1" stop-color="#00BCD4"/>
            </linearGradient></defs>
        </svg>`;
    } else if (type === 'restaurants') {
        svg = `<svg width="100%" height="100%" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="36" r="36" fill="url(#${id})"/>
            <path d="M28 22H44V26H40V38H32V26H28V22Z" fill="white" opacity="0.9"/>
            <rect x="30" y="38" width="12" height="12" fill="white" opacity="0.8"/>
            <defs><linearGradient id="${id}" x1="0" y1="0" x2="72" y2="72">
                <stop stop-color="#DC2626"/><stop offset="1" stop-color="#F97316"/>
            </linearGradient></defs>
        </svg>`;
    }
    return svg;
}

const BASE_ZOOM = 13;
const BASE_SIZE = 120;

function getCurrentIconSize() {
    if (!locMap) return BASE_SIZE;
    const zoom = locMap.getZoom();
    const scale = Math.pow(2, BASE_ZOOM - zoom);
    return Math.max(40, Math.round(BASE_SIZE * scale));
}

function updateMarkerIcons() {
    const size = getCurrentIconSize();
    locMarkers.forEach(marker => {
        const oldHtml = marker.getIcon().options.html;
        const newIcon = L.divIcon({
            html: oldHtml,
            iconSize: [size, size],
            iconAnchor: [size/2, size/2],
            className: 'marker-icon-animated'
        });
        marker.setIcon(newIcon);
    });
}

async function geocodeAddress(address) {
    try {
        const resp = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q: address, format: 'json', limit: 1 }
        });
        if (resp.data && resp.data.length > 0) {
            return {
                lat: parseFloat(resp.data[0].lat),
                lon: parseFloat(resp.data[0].lon)
            };
        }
    } catch (e) {
        console.warn('Géocodage échoué pour', address);
    }
    return null;
}

function loadLocalisation() {
    console.log('📍 Chargement localisation...');

    if (!locMap) {
        const container = document.getElementById('locMapContainer');
        if (!container) return;

        locMap = L.map('locMapContainer').setView([13.5116, 2.1254], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(locMap);

        locMap.on('zoomend', updateMarkerIcons);
    }

    loadLocalisationData();
}

async function loadLocalisationData() {
    const type = document.getElementById('locTypeFilter')?.value || 'all';
    const search = document.getElementById('locSearch')?.value?.toLowerCase() || '';

    try {
        // Commandes
        const ordersRes = await axios.get(API + '/orders');
        const orders = ordersRes.data || [];

        // Événements
        const events = (typeof storiesData !== 'undefined' ? storiesData.filter(s => s.isEvent) : []);

        // Clients (avec géocodage optionnel)
        const clientsRes = await axios.get(API + '/clients');
        let clients = clientsRes.data || [];

        // Restaurants (endpoint à créer si besoin)
        let restaurants = [];
        try {
            const restRes = await axios.get(API + '/restaurants');
            restaurants = restRes.data || [];
        } catch (e) {
            console.warn('Endpoint /restaurants non disponible.');
        }

        // Géocodage des clients sans coordonnées mais avec adresse
        for (let client of clients) {
            if ((!client.latitude || !client.longitude) && client.adresse) {
                const coords = await geocodeAddress(client.adresse);
                if (coords) {
                    client.latitude = coords.lat;
                    client.longitude = coords.lon;
                }
                await new Promise(r => setTimeout(r, 1000)); // respect du rate limit Nominatim
            }
        }

        animateCounter('locCountOrders', orders.length);
        animateCounter('locCountEvents', events.length);
        animateCounter('locCountClients', clients.length);
        animateCounter('locCountRestaurants', restaurants.length);

        locMarkers.forEach(m => locMap.removeLayer(m));
        locMarkers = [];

        const currentSize = getCurrentIconSize();

        const addMarker = (lat, lng, type, popupHtml) => {
            const icon = L.divIcon({
                html: buildMarkerIcon(type),
                iconSize: [currentSize, currentSize],
                iconAnchor: [currentSize/2, currentSize/2],
                className: 'marker-icon-animated'
            });
            const marker = L.marker([lat, lng], { icon }).addTo(locMap);
            marker.bindPopup(popupHtml);
            locMarkers.push(marker);
        };

        // Commandes
        if (type === 'all' || type === 'orders') {
            orders.filter(o => o.latitude && o.longitude).forEach(order => {
                if (search && !(order.customerName || '').toLowerCase().includes(search)) return;
                addMarker(order.latitude, order.longitude, 'orders',
                    `<b>📦 ${order.orderNumber || order.id}</b><br>${order.customerName || 'Client'}<br>${Number(order.totalAmount || 0).toLocaleString('fr-FR')} FCFA`);
            });
        }

        // Événements
        if (type === 'all' || type === 'events') {
            events.filter(ev => ev.latitude && ev.longitude).forEach(ev => {
                if (search && !(ev.name || ev.artistName || '').toLowerCase().includes(search)) return;
                addMarker(ev.latitude, ev.longitude, 'events',
                    `<b>🎉 ${ev.artistName || ev.name}</b><br>${ev.venue || ''}<br>${ev.eventDate || ''}`);
            });
        }

        // Clients
        if (type === 'all' || type === 'clients') {
            clients.filter(c => c.latitude && c.longitude).forEach(client => {
                if (search && !(client.nom || '').toLowerCase().includes(search)) return;
                addMarker(client.latitude, client.longitude, 'clients',
                    `<b>👤 ${client.nom}</b><br>📱 ${client.telephone}<br>📦 ${client.nombreCommandes || 0} commandes`);
            });
        }

        // Restaurants
        if (type === 'all' || type === 'restaurants') {
            restaurants.filter(r => r.latitude && r.longitude).forEach(resto => {
                if (search && !(resto.nom || '').toLowerCase().includes(search)) return;
                addMarker(resto.latitude, resto.longitude, 'restaurants',
                    `<b>🍽️ ${resto.nom}</b><br>📞 ${resto.telephone || ''}<br>⭐ ${resto.note || '-'}`);
            });
        }

        if (locMarkers.length > 0) {
            const group = L.featureGroup(locMarkers);
            locMap.fitBounds(group.getBounds().pad(0.1));
        } else {
            console.log('Aucun marqueur trouvé.');
        }

    } catch (error) {
        console.error('Erreur chargement localisation:', error);
    }
}