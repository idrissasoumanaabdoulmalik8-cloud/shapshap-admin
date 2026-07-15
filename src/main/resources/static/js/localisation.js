// ============================================================
// 🗺️ LOCALISATION — Carte intelligente Shashap
// ============================================================

let locMap = null;
let locMarkers = [];

// Animation compteur progressif
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

// Icônes SVG pour les marqueurs (×4 la taille, 120×120)
const markerIcons = {
    orders: `<svg width="120" height="120" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="36" cy="36" r="36" fill="url(#gradOrders)"/>
        <path d="M22 28L36 20L50 28L36 36L22 28Z" fill="white" opacity="0.95"/>
        <path d="M22 28V42L36 50V36L22 28Z" fill="white" opacity="0.85"/>
        <path d="M50 28V42L36 50V36L50 28Z" fill="white" opacity="0.75"/>
        <defs><linearGradient id="gradOrders" x1="0" y1="0" x2="72" y2="72">
            <stop stop-color="#FF9800"/><stop offset="1" stop-color="#F57C00"/>
        </linearGradient></defs>
    </svg>`,
    events: `<svg width="120" height="120" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="36" cy="36" r="36" fill="url(#gradEvents)"/>
        <path d="M24 20H48V28H24V20Z" fill="white" opacity="0.9"/>
        <path d="M26 28V46H46V28H26Z" fill="white" opacity="0.8"/>
        <circle cx="32" cy="38" r="2" fill="#9C27B0"/>
        <circle cx="40" cy="38" r="2" fill="#9C27B0"/>
        <path d="M30 44H42" stroke="#9C27B0" stroke-width="2" stroke-linecap="round"/>
        <defs><linearGradient id="gradEvents" x1="0" y1="0" x2="72" y2="72">
            <stop stop-color="#9C27B0"/><stop offset="1" stop-color="#E91E63"/>
        </linearGradient></defs>
    </svg>`,
    clients: `<svg width="120" height="120" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="36" cy="36" r="36" fill="url(#gradClients)"/>
        <circle cx="28" cy="28" r="6" fill="white" opacity="0.9"/>
        <circle cx="44" cy="28" r="6" fill="white" opacity="0.9"/>
        <path d="M22 48C22 42.477 26.477 38 32 38H40C45.523 38 50 42.477 50 48V50H22V48Z" fill="white" opacity="0.9"/>
        <defs><linearGradient id="gradClients" x1="0" y1="0" x2="72" y2="72">
            <stop stop-color="#1E88E5"/><stop offset="1" stop-color="#00BCD4"/>
        </linearGradient></defs>
    </svg>`
};

function loadLocalisation() {
    console.log('📍 Chargement localisation...');

    if (!locMap) {
        const container = document.getElementById('locMapContainer');
        if (!container) return;

        locMap = L.map('locMapContainer').setView([13.5116, 2.1254], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(locMap);
    }

    loadLocalisationData();
}

async function loadLocalisationData() {
    const type = document.getElementById('locTypeFilter')?.value || 'all';
    const search = document.getElementById('locSearch')?.value?.toLowerCase() || '';

    try {
        const ordersRes = await axios.get(API + '/orders');
        const orders = ordersRes.data || [];

        const events = (typeof storiesData !== 'undefined' ? storiesData.filter(s => s.isEvent) : []);

        const clientsRes = await axios.get(API + '/clients');
        const clients = clientsRes.data || [];

        animateCounter('locCountOrders', orders.length);
        animateCounter('locCountEvents', events.length);
        animateCounter('locCountClients', clients.length);

        locMarkers.forEach(m => locMap.removeLayer(m));
        locMarkers = [];

        // Commandes
        if (type === 'all' || type === 'orders') {
            orders.filter(o => o.latitude && o.longitude).forEach(order => {
                if (search && !(order.customerName || '').toLowerCase().includes(search)) return;
                const icon = L.divIcon({
                    html: markerIcons.orders,
                    iconSize: [120, 120],
                    iconAnchor: [60, 60],
                    className: '' // pas de classe pour éviter les conflits CSS
                });
                const marker = L.marker([order.latitude, order.longitude], { icon }).addTo(locMap);
                marker.bindPopup(`<b>📦 ${order.orderNumber || order.id}</b><br>${order.customerName || 'Client'}<br>${Number(order.totalAmount || 0).toLocaleString('fr-FR')} FCFA`);
                locMarkers.push(marker);
            });
        }

        // Événements
        if (type === 'all' || type === 'events') {
            events.filter(ev => ev.latitude && ev.longitude).forEach(ev => {
                if (search && !(ev.name || ev.artistName || '').toLowerCase().includes(search)) return;
                const icon = L.divIcon({
                    html: markerIcons.events,
                    iconSize: [120, 120],
                    iconAnchor: [60, 60],
                    className: ''
                });
                const marker = L.marker([ev.latitude, ev.longitude], { icon }).addTo(locMap);
                marker.bindPopup(`<b>🎉 ${ev.artistName || ev.name}</b><br>${ev.venue || ''}<br>${ev.eventDate || ''}`);
                locMarkers.push(marker);
            });
        }

        // Clients
        if (type === 'all' || type === 'clients') {
            clients.filter(c => c.latitude && c.longitude).forEach(client => {
                if (search && !(client.nom || '').toLowerCase().includes(search)) return;
                const icon = L.divIcon({
                    html: markerIcons.clients,
                    iconSize: [120, 120],
                    iconAnchor: [60, 60],
                    className: ''
                });
                const marker = L.marker([client.latitude, client.longitude], { icon }).addTo(locMap);
                marker.bindPopup(`<b>👤 ${client.nom}</b><br>📱 ${client.telephone}<br>📦 ${client.nombreCommandes || 0} commandes`);
                locMarkers.push(marker);
            });
        }

        if (locMarkers.length > 0) {
            const group = L.featureGroup(locMarkers);
            locMap.fitBounds(group.getBounds().pad(0.1));
        }

    } catch (error) {
        console.error('Erreur chargement localisation:', error);
    }
}