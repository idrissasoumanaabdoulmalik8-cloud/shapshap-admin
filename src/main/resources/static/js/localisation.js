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
            console.log(`✅ Géocodage réussi : ${address} → ${resp.data[0].lat}, ${resp.data[0].lon}`);
            return {
                lat: parseFloat(resp.data[0].lat),
                lon: parseFloat(resp.data[0].lon)
            };
        } else {
            console.warn(`⚠️ Adresse introuvable : ${address}`);
        }
    } catch (e) {
        console.warn('Géocodage échoué pour', address);
    }
    return null;
}

function initLayerSwitcher() {
    // 1. Définition des groupes de calques professionnels
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
            pane: 'shadowPane' // Maintient les étiquettes lisibles au-dessus des tuiles satellites
        })
    ]);

    // Activation de la couche standard par défaut
    locLayerGroups[currentLayerKey].addTo(locMap);

    // 2. Injection dynamique des styles CSS pour un rendu premium sans toucher à vos fichiers CSS externes
    if (!document.getElementById('shashap-switcher-styles')) {
        const style = document.createElement('style');
        style.id = 'shashap-switcher-styles';
        style.innerHTML = `
            .shashap-layer-control {
                position: absolute;
                top: 20px;
                right: 20px;
                z-index: 1100;
                font-family: inherit;
            }
            .switcher-btn {
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(0, 0, 0, 0.08);
                border-radius: 14px;
                width: 44px;
                height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-size: 18px;
            }
            .switcher-btn:hover {
                transform: scale(1.04);
                background: #ffffff;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            }
            .switcher-menu {
                position: absolute;
                top: 56px;
                right: 0;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border: 1px solid rgba(0, 0, 0, 0.06);
                border-radius: 18px;
                padding: 12px;
                display: flex;
                gap: 12px;
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
                opacity: 0;
                transform: translateY(-12px) scale(0.95);
                pointer-events: none;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .shashap-layer-control.open .switcher-menu {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }
            .layer-opt {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                width: 58px;
            }
            .layer-thumb {
                width: 54px;
                height: 54px;
                border-radius: 12px;
                border: 2px solid transparent;
                transition: all 0.25s ease;
            }
            .layer-opt:hover .layer-thumb {
                transform: translateY(-2px);
            }
            .layer-opt.active .layer-thumb {
                border-color: #111827;
                box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.15);
            }
            .layer-opt span {
                font-size: 11px;
                font-weight: 600;
                color: #64748b;
                transition: color 0.2s;
            }
            .layer-opt.active span {
                color: #111827;
                font-weight: 700;
            }
            .thumb-standard { background: linear-gradient(135deg, #aad3df 0%, #f2efe9 100%); border: 1px solid rgba(0,0,0,0.1); }
            .thumb-satellite { background: linear-gradient(135deg, #182c16 0%, #3a5337 100%); }
            .thumb-hybrid { background: linear-gradient(135deg, #1e293b 0%, #64748b 100%); }
        `;
        document.head.appendChild(style);
    }

    // 3. Construction et injection des éléments DOM dans le conteneur de la carte
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

    // 4. Attachement des gestionnaires d'événements interactifs
    const btn = controlDiv.querySelector('.switcher-btn');
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        controlDiv.classList.toggle('open');
    });

    locMap.on('click', () => {
        controlDiv.classList.remove('open');
    });

    controlDiv.querySelectorAll('.layer-opt').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetLayer = opt.getAttribute('data-layer');
            if (targetLayer === currentLayerKey) return;

            // Remplacement instantané de la couche de tuiles sans impacter les marqueurs
            locMap.removeLayer(locLayerGroups[currentLayerKey]);
            locLayerGroups[targetLayer].addTo(locMap);

            // Mise à jour de l'état visuel de l'interface
            controlDiv.querySelector('.layer-opt.active').classList.remove('active');
            opt.classList.add('active');
            currentLayerKey = targetLayer;
            controlDiv.classList.remove('open');
        });
    });
}

function loadLocalisation() {
    console.log('📍 Chargement localisation...');

    if (!locMap) {
        const container = document.getElementById('locMapContainer');
        if (!container) return;

        locMap = L.map('locMapContainer').setView([13.5116, 2.1254], 13);

        // Initialisation de la gestion avancée des calques
        initLayerSwitcher();

        locMap.on('zoomend', updateMarkerIcons);
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
        let clients = clientsRes.data || [];

        let restaurants = [];
        let hasApiRestaurants = false;
        try {
            const restRes = await axios.get(API + '/restaurants');
            restaurants = restRes.data || [];
            hasApiRestaurants = restaurants.length > 0;
        } catch (e) {
            console.warn('Endpoint /restaurants non disponible – utilisation du restaurant par défaut.');
        }

        console.log(`👥 ${clients.length} clients récupérés, vérification des adresses...`);
        for (let client of clients) {
            if ((!client.latitude || !client.longitude) && client.adresse) {
                console.log(`🔄 Tentative de géocodage pour ${client.nom} : ${client.adresse}`);
                const coords = await geocodeAddress(client.adresse);
                if (coords) {
                    client.latitude = coords.lat;
                    client.longitude = coords.lon;
                }
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        animateCounter('locCountOrders', orders.length);
        animateCounter('locCountEvents', events.length);
        animateCounter('locCountClients', clients.length);
        const totalRestaurants = Math.max(restaurants.length, 1);
        animateCounter('locCountRestaurants', totalRestaurants);

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
            marker.bindPopup(`<div class="shashap-popup">${popupHtml}</div>`);
            locMarkers.push(marker);
        };

        if (type === 'all' || type === 'orders') {
            orders.filter(o => o.latitude && o.longitude).forEach(order => {
                if (search && !(order.customerName || '').toLowerCase().includes(search)) return;
                addMarker(order.latitude, order.longitude, 'orders',
                    `<b>📦 ${order.orderNumber || order.id}</b><br>${order.customerName || 'Client'}<br>${Number(order.totalAmount || 0).toLocaleString('fr-FR')} FCFA`);
            });
        }

        if (type === 'all' || type === 'events') {
            events.filter(ev => ev.latitude && ev.longitude).forEach(ev => {
                if (search && !(ev.name || ev.artistName || '').toLowerCase().includes(search)) return;
                addMarker(ev.latitude, ev.longitude, 'events',
                    `<b>🎉 ${ev.artistName || ev.name}</b><br>${ev.venue || ''}<br>${ev.eventDate || ''}`);
            });
        }

        if (type === 'all' || type === 'clients') {
            clients.filter(c => c.latitude && c.longitude).forEach(client => {
                if (search && !(client.nom || '').toLowerCase().includes(search)) return;
                addMarker(client.latitude, client.longitude, 'clients',
                    `<b>👤 ${client.nom}</b><br>📱 ${client.telephone}<br>📦 ${client.nombreCommandes || 0} commandes`);
            });
        }

        if (type === 'all' || type === 'restaurants') {
            restaurants.filter(r => r.latitude && r.longitude).forEach(resto => {
                if (search && !(resto.nom || '').toLowerCase().includes(search)) return;
                addMarker(resto.latitude, resto.longitude, 'restaurants',
                    `<b>🍽️ ${resto.nom}</b><br>📞 ${resto.telephone || ''}<br>⭐ ${resto.note || '-'}`);
            });

            if (!hasApiRestaurants) {
                const defaultResto = { lat: 13.5116, lng: 2.1254, nom: "Shashap" };
                addMarker(defaultResto.lat, defaultResto.lng, 'restaurants',
                    `<b>🍽️ ${defaultResto.nom}</b><br>📍 Position par défaut`);
            }
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