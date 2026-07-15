// ============================================================
// 🗺️ LOCALISATION — Carte intelligente Shashap
// ============================================================

let locMap = null;
let locMarkers = [];

function loadLocalisation() {
    console.log('📍 Chargement localisation...');

    // Afficher la carte si ce n'est pas déjà fait
    if (!locMap) {
        const container = document.getElementById('locMapContainer');
        if (!container) return;

        locMap = L.map('locMapContainer').setView([13.5116, 2.1254], 13); // Niamey par défaut
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(locMap);
    }

    // Charger les données
    loadLocalisationData();
}

async function loadLocalisationData() {
    const type = document.getElementById('locTypeFilter')?.value || 'all';
    const search = document.getElementById('locSearch')?.value?.toLowerCase() || '';

    try {
        // Charger commandes
        const ordersRes = await axios.get(API + '/orders');
        const orders = ordersRes.data || [];

        // Charger événements (depuis storiesData global)
        const events = (typeof storiesData !== 'undefined' ? storiesData.filter(s => s.isEvent) : []);

        // Charger clients
        const clientsRes = await axios.get(API + '/clients');
        const clients = clientsRes.data || [];

        // Mise à jour compteurs
        document.getElementById('locCountOrders').textContent = orders.length;
        document.getElementById('locCountEvents').textContent = events.length;
        document.getElementById('locCountClients').textContent = clients.length;

        // Nettoyer anciens marqueurs
        locMarkers.forEach(m => locMap.removeLayer(m));
        locMarkers = [];

        // Ajouter commandes géolocalisées
        if (type === 'all' || type === 'orders') {
            orders.filter(o => o.latitude && o.longitude).forEach(order => {
                if (search && !(order.customerName || '').toLowerCase().includes(search)) return;
                const marker = L.marker([order.latitude, order.longitude], {
                    icon: L.divIcon({ className: 'loc-icon loc-icon-order', html: '📦', iconSize: [30, 30] })
                }).addTo(locMap);
                marker.bindPopup(`<b>📦 ${order.orderNumber || order.id}</b><br>${order.customerName || 'Client'}<br>${Number(order.totalAmount || 0).toLocaleString('fr-FR')} FCFA`);
                locMarkers.push(marker);
            });
        }

        // Ajouter événements
        if (type === 'all' || type === 'events') {
            events.filter(ev => ev.latitude && ev.longitude).forEach(ev => {
                if (search && !(ev.name || ev.artistName || '').toLowerCase().includes(search)) return;
                const marker = L.marker([ev.latitude, ev.longitude], {
                    icon: L.divIcon({ className: 'loc-icon loc-icon-event', html: '🎉', iconSize: [30, 30] })
                }).addTo(locMap);
                marker.bindPopup(`<b>🎉 ${ev.artistName || ev.name}</b><br>${ev.venue || ''}<br>${ev.eventDate || ''}`);
                locMarkers.push(marker);
            });
        }

        // Ajouter clients
        if (type === 'all' || type === 'clients') {
            clients.filter(c => c.latitude && c.longitude).forEach(client => {
                if (search && !(client.nom || '').toLowerCase().includes(search)) return;
                const marker = L.marker([client.latitude, client.longitude], {
                    icon: L.divIcon({ className: 'loc-icon loc-icon-client', html: '👤', iconSize: [30, 30] })
                }).addTo(locMap);
                marker.bindPopup(`<b>👤 ${client.nom}</b><br>📱 ${client.telephone}<br>📦 ${client.nombreCommandes || 0} commandes`);
                locMarkers.push(marker);
            });
        }

        // Ajuster la vue si des marqueurs existent
        if (locMarkers.length > 0) {
            const group = L.featureGroup(locMarkers);
            locMap.fitBounds(group.getBounds().pad(0.1));
        }

    } catch (error) {
        console.error('Erreur chargement localisation:', error);
    }
}