// ============================================================
// 🗺️ LOCALISATION — Carte intelligente Shashap (multi-entités)
// Avec CSS premium Gemini : popups design, animations
// ============================================================

let locMap = null;
let locMarkers = [];
let markerIdCounter = 0;

// Gestion des fonds de carte professionnels
let locLayerGroups = {};
let currentLayerKey = 'standard';

// Groupe de clusters (Leaflet.markercluster)
let locClusterGroup = null;

// Cache géocodage
const geocodeCache = {};

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

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
    const iconUrls = {
        restaurants: 'images/image_2f3f9f.png',
        clients: 'images/image_2f4017.png',
        orders: 'images/image_2f405b.png',
        events: 'images/image_2f4098.png'
    };

    return L.icon({
        iconUrl: iconUrls[type] || 'images/image_2f4017.png',
        iconSize: [46, 46],
        iconAnchor: [23, 46],
        popupAnchor: [0, -42],
        className: 'shashap-marker'
    });
}

function getCurrentIconSize() {
    return 46;
}

function updateMarkerIcons() {
    // Désactivé
}

async function geocodeAddress(address) {
    if (!address) return null;
    if (geocodeCache[address]) {
        console.log(`📦 Cache : ${address} → ${geocodeCache[address].lat}, ${geocodeCache[address].lon}`);
        return geocodeCache[address];
    }
    try {
        const resp = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q: address, format: 'json', limit: 1 }
        });
        if (resp.data && resp.data.length > 0) {
            const result = {
                lat: parseFloat(resp.data[0].lat),
                lon: parseFloat(resp.data[0].lon)
            };
            geocodeCache[address] = result;
            console.log(`✅ Géocodage réussi : ${address} → ${result.lat}, ${result.lon}`);
            return result;
        } else {
            console.warn(`⚠️ Adresse introuvable : ${address}`);
        }
    } catch (e) {
        console.warn('Géocodage échoué pour', address);
    }
    return null;
}

function injectPremiumStyles() {
    if (document.getElementById('shashap-premium-ui-styles')) return;
    const style = document.createElement('style');
    style.id = 'shashap-premium-ui-styles';
    style.innerHTML = `
        .shashap-marker {
            filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.2));
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease !important;
            animation: markerPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
            will-change: transform;
        }
        .shashap-marker:hover {
            transform: scale(1.15) translateY(-4px) !important;
            filter: drop-shadow(0 12px 16px rgba(0, 0, 0, 0.3));
            z-index: 1000 !important;
        }
        .shashap-bounce {
            animation: markerBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        .shashap-cluster-custom {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 2px solid #111827;
            border-radius: 50%;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: markerPopIn 0.4s ease backwards;
            transition: transform 0.2s, background 0.2s;
        }
        .shashap-cluster-custom:hover {
            transform: scale(1.1);
            background: #ffffff;
        }
        .shashap-cluster-icon {
            font-weight: 800;
            font-size: 15px;
            color: #111827;
            font-family: inherit;
        }
        .shashap-popup-wrapper .leaflet-popup-content-wrapper {
            padding: 0 !important;
            border-radius: 16px !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
            overflow: hidden;
            border: 1px solid rgba(0, 0, 0, 0.05);
            background: #ffffff;
        }
        .shashap-popup-wrapper .leaflet-popup-content {
            margin: 0 !important;
            width: 240px !important;
        }
        .shashap-popup-wrapper .leaflet-popup-tip {
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        .shashap-popup-wrapper .leaflet-popup-close-button {
            color: #111827 !important;
            top: 10px !important;
            right: 10px !important;
            background: rgba(255, 255, 255, 0.9) !important;
            backdrop-filter: blur(4px);
            border-radius: 50%;
            width: 26px !important;
            height: 26px !important;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            z-index: 10;
            transition: all 0.2s;
        }
        .shashap-popup-wrapper .leaflet-popup-close-button:hover {
            background: #f1f5f9 !important;
            transform: scale(1.05);
        }
        .shashap-modern-popup {
            font-family: inherit;
            display: flex;
            flex-direction: column;
        }
        .popup-header {
            padding: 14px 16px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .badge-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        .popup-body {
            padding: 16px;
            font-size: 13px;
            color: #475569;
            line-height: 1.6;
        }
        .popup-body b {
            display: block;
            font-size: 16px;
            color: #0f172a;
            margin-bottom: 6px;
            letter-spacing: -0.3px;
        }
        .popup-btn {
            margin: 0 16px 16px 16px;
            padding: 12px;
            color: #fff;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .popup-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }
        @keyframes markerPopIn {
            0% { opacity: 0; transform: scale(0) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes markerBounce {
            0%, 100% { transform: scale(1) translateY(0); }
            50% { transform: scale(0.8) translateY(6px); }
        }
    `;
    document.head.appendChild(style);
}

function initLayerSwitcher() {
    locLayerGroups.standard = L.layerGroup([
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        })
    ]);

    locLayerGroups.satellite = L.layerGroup([
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri'
        })
    ]);

    locLayerGroups.hybrid = L.layerGroup([
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri'
        }),
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
            attribution: '© CartoDB',
            pane: 'shadowPane'
        })
    ]);

    locLayerGroups[currentLayerKey].addTo(locMap);

    if (!document.getElementById('shashap-switcher-styles')) {
        const style = document.createElement('style');
        style.id = 'shashap-switcher-styles';
        style.innerHTML = `
            .shashap-layer-control { position: absolute; top: 20px; right: 20px; z-index: 1100; font-family: inherit; }
            .switcher-btn { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(0, 0, 0, 0.08); border-radius: 14px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06); transition: all 0.3s; font-size: 18px; }
            .switcher-btn:hover { transform: scale(1.04); background: #ffffff; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); }
            .switcher-menu { position: absolute; top: 56px; right: 0; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(16px); border: 1px solid rgba(0, 0, 0, 0.06); border-radius: 18px; padding: 12px; display: flex; gap: 12px; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12); opacity: 0; transform: translateY(-12px) scale(0.95); pointer-events: none; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
            .shashap-layer-control.open .switcher-menu { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
            .layer-opt { display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; width: 58px; }
            .layer-thumb { width: 54px; height: 54px; border-radius: 12px; border: 2px solid transparent; transition: all 0.25s ease; }
            .layer-opt:hover .layer-thumb { transform: translateY(-2px); }
            .layer-opt.active .layer-thumb { border-color: #111827; box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.15); }
            .layer-opt span { font-size: 11px; font-weight: 600; color: #64748b; transition: color 0.2s; }
            .layer-opt.active span { color: #111827; font-weight: 700; }
            .thumb-standard { background: linear-gradient(135deg, #aad3df 0%, #f2efe9 100%); border: 1px solid rgba(0,0,0,0.1); }
            .thumb-satellite { background: linear-gradient(135deg, #182c16 0%, #3a5337 100%); }
            .thumb-hybrid { background: linear-gradient(135deg, #1e293b 0%, #64748b 100%); }
        `;
        document.head.appendChild(style);
    }

    const container = document.getElementById('locMapContainer');
    if (!container) return;

    const controlDiv = document.createElement('div');
    controlDiv.className = 'shashap-layer-control';
    controlDiv.innerHTML = `
        <button class="switcher-btn" title="Changer de vue">🗺️</button>
        <div class="switcher-menu">
            <div class="layer-opt active" data-layer="standard">
                <div class="layer-thumb thumb-standard"></div>
                <span>Standard</span>
            </div>
            <div class="layer-opt" data-layer="satellite">
                <div class="layer-thumb thumb-satellite"></div>
                <span>Satellite</span>
            </div>
            <div class="layer-opt" data-layer="hybrid">
                <div class="layer-thumb thumb-hybrid"></div>
                <span>Hybride</span>
            </div>
        </div>
    `;
    container.appendChild(controlDiv);

    const btn = controlDiv.querySelector('.switcher-btn');
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        controlDiv.classList.toggle('open');
    });

    locMap.on('click', () => controlDiv.classList.remove('open'));

    controlDiv.querySelectorAll('.layer-opt').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetLayer = opt.getAttribute('data-layer');
            if (targetLayer === currentLayerKey) return;

            locMap.removeLayer(locLayerGroups[currentLayerKey]);
            locLayerGroups[targetLayer].addTo(locMap);

            controlDiv.querySelector('.layer-opt.active').classList.remove('active');
            opt.classList.add('active');
            currentLayerKey = targetLayer;
            controlDiv.classList.remove('open');
        });
    });
}

function loadLocalisation() {
    if (typeof L === 'undefined') { console.error('❌ Leaflet non chargé'); return; }
    if (typeof axios === 'undefined') { console.error('❌ Axios non chargé'); return; }
    if (typeof API === 'undefined') { console.error('❌ API non définie'); return; }

    console.log('📍 Chargement localisation...');

    if (!locMap) {
        const container = document.getElementById('locMapContainer');
        if (!container) return;

        locMap = L.map('locMapContainer').setView([13.5116, 2.1254], 13);

        initLayerSwitcher();
        injectPremiumStyles();
    }

    loadLocalisationData();
}

async function loadLocalisationData() {
    const type = document.getElementById('locTypeFilter')?.value || 'all';
    const search = document.getElementById('locSearch')?.value?.toLowerCase() || '';

    try {
        const [ordersRes, clientsRes] = await Promise.all([
            axios.get(API + '/orders', { timeout: 10000 }),
            axios.get(API + '/clients', { timeout: 10000 })
        ]);
        const orders = ordersRes.data || [];
        let clients = clientsRes.data || [];

        const events = (typeof storiesData !== 'undefined' && Array.isArray(storiesData) ? storiesData.filter(s => s && s.isEvent) : []);

        let restaurants = [];
        let hasApiRestaurants = false;
        try {
            const restRes = await axios.get(API + '/restaurants', { timeout: 5000 });
            restaurants = Array.isArray(restRes.data) ? restRes.data : [];
            hasApiRestaurants = restaurants.length > 0;
        } catch (e) {
            console.warn('Endpoint /restaurants non disponible – utilisation du restaurant par défaut.');
        }

        console.log(`👥 ${clients.length} clients récupérés, vérification des adresses...`);
        for (let client of clients) {
            if (client && (!client.latitude || !client.longitude) && client.adresse) {
                const coords = await geocodeAddress(client.adresse);
                if (coords) {
                    client.latitude = coords.lat;
                    client.longitude = coords.lon;
                }
                await new Promise(r => setTimeout(r, 200));
            }
        }

        animateCounter('locCountOrders', orders.length);
        animateCounter('locCountEvents', events.length);
        animateCounter('locCountClients', clients.length);
        const totalRestaurants = Math.max(restaurants.length, 1);
        animateCounter('locCountRestaurants', totalRestaurants);

        if (locClusterGroup) {
            locClusterGroup.clearLayers();
            locMap.removeLayer(locClusterGroup);
        } else {
            locMarkers.forEach(m => locMap.removeLayer(m));
        }
        locMarkers = [];

        if (typeof L.markerClusterGroup === 'function') {
            locClusterGroup = L.markerClusterGroup({
                showCoverageOnHover: false,
                spiderfyOnMaxZoom: true,
                maxClusterRadius: 45,
                iconCreateFunction: function (cluster) {
                    return L.divIcon({
                        html: `<div class="shashap-cluster-icon">${cluster.getChildCount()}</div>`,
                        className: 'shashap-cluster-custom',
                        iconSize: [44, 44]
                    });
                }
            });
        } else {
            console.warn("Leaflet.markercluster non détecté, repli sur L.featureGroup.");
            locClusterGroup = L.featureGroup();
        }

        const addMarker = (lat, lng, type, popupHtml) => {
            const marker = L.marker([lat, lng], { icon: buildMarkerIcon(type) });

            const themes = {
                orders: { color: '#FF9800', bg: '#fff3e0', label: 'Commande' },
                events: { color: '#9C27B0', bg: '#f3e5f5', label: 'Événement' },
                clients: { color: '#1E88E5', bg: '#e3f2fd', label: 'Client' },
                restaurants: { color: '#DC2626', bg: '#ffebee', label: 'Restaurant' }
            };
            const theme = themes[type] || themes.clients;

            const modernPopup = `
                <div class="shashap-modern-popup">
                    <div class="popup-header" style="background: ${theme.bg}; color: ${theme.color};">
                        <span class="badge-dot" style="background: ${theme.color}"></span>
                        ${theme.label}
                    </div>
                    <div class="popup-body">
                        ${popupHtml}
                    </div>
                </div>
            `;

            marker.bindPopup(modernPopup, {
                className: 'shashap-popup-wrapper',
                closeButton: true
            });

            marker.on('click', function(e) {
                const el = e.target.getElement();
                if (el) {
                    el.classList.remove('shashap-bounce');
                    void el.offsetWidth;
                    el.classList.add('shashap-bounce');
                }
            });

            locClusterGroup.addLayer(marker);
            locMarkers.push(marker);
        };

        if (type === 'all' || type === 'orders') {
            orders.filter(o => o && o.latitude && o.longitude).forEach(order => {
                if (search && !(order.customerName || '').toLowerCase().includes(search)) return;
                addMarker(order.latitude, order.longitude, 'orders',
                    `<b>📦 ${escapeHtml(order.orderNumber || order.id)}</b><br>${escapeHtml(order.customerName || 'Client')}<br>${Number(order.totalAmount || 0).toLocaleString('fr-FR')} FCFA`);
            });
        }

        if (type === 'all' || type === 'events') {
            events.filter(ev => ev && ev.latitude && ev.longitude).forEach(ev => {
                if (search && !(ev.name || ev.artistName || '').toLowerCase().includes(search)) return;
                addMarker(ev.latitude, ev.longitude, 'events',
                    `<b>🎉 ${escapeHtml(ev.artistName || ev.name)}</b><br>${escapeHtml(ev.venue || '')}<br>${escapeHtml(ev.eventDate || '')}`);
            });
        }

        if (type === 'all' || type === 'clients') {
            clients.filter(c => c && c.latitude && c.longitude).forEach(client => {
                if (search && !(client.nom || '').toLowerCase().includes(search)) return;
                addMarker(client.latitude, client.longitude, 'clients',
                    `<b>👤 ${escapeHtml(client.nom)}</b><br>📱 ${escapeHtml(client.telephone)}<br>📦 ${client.nombreCommandes || 0} commandes`);
            });
        }

        if (type === 'all' || type === 'restaurants') {
            restaurants.filter(r => r && r.latitude && r.longitude).forEach(resto => {
                if (search && !(resto.nom || '').toLowerCase().includes(search)) return;
                addMarker(resto.latitude, resto.longitude, 'restaurants',
                    `<b>🍽️ ${escapeHtml(resto.nom)}</b><br>📞 ${escapeHtml(resto.telephone || '')}<br>⭐ ${escapeHtml(resto.note || '-')}`);
            });

            if (!hasApiRestaurants) {
                const defaultResto = { lat: 13.5116, lng: 2.1254, nom: "Shashap" };
                addMarker(defaultResto.lat, defaultResto.lng, 'restaurants',
                    `<b>🍽️ ${escapeHtml(defaultResto.nom)}</b><br>📍 Position par défaut`);
            }
        }

        locMap.addLayer(locClusterGroup);

        if (locMarkers.length > 0) {
            locMap.fitBounds(locClusterGroup.getBounds().pad(0.1));
        } else {
            console.log('Aucun marqueur trouvé.');
            locMap.setView([13.5116, 2.1254], 13);
        }

    } catch (error) {
        console.error('Erreur chargement localisation:', error);
    }
}