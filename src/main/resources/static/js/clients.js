// ============================================================
// 👥 CLIENTS — Appel API réelle + interface riche
// ============================================================
let allClients = [];

const LOYALTY_LEVELS = {
    GOLD:   { label: 'Client VIP 🥇', color: '#FFD700', bg: '#FFFDF0', min: 15000 },
    SILVER: { label: 'Fidèle 🥈',    color: '#78909C', bg: '#F4F6F7', min: 5000 },
    BRONZE: { label: 'Nouveau 🥉',   color: '#A1887F', bg: '#FAF8F7', min: 0 }
};

document.addEventListener("DOMContentLoaded", () => {
    loadClients();
});

// ============================================================
// 🔄 CHARGEMENT DES CLIENTS DEPUIS L'API RÉELLE
// ============================================================
async function loadClients() {
    const listContainer = document.getElementById('clientsList');
    if (!listContainer) return;

    listContainer.innerHTML = `
        <div style="text-align:center; padding: 40px; color: #888;">
            <div class="spinner" style="margin-bottom:10px;">🌸</div>
            Analyse de la base client...
        </div>`;

    try {
        const response = await axios.get(API + '/clients');
        const clientsData = response.data || [];

        // Transforme les données API en format attendu par le tableau
        allClients = clientsData.map(c => ({
            id: "CLI-" + c.id,
            name: c.nom || 'Inconnu',
            phone: c.telephone || '—',
            email: c.email || '—',
            history: c.history || [],
            totalDepense: c.totalDepense || 0,
            nombreCommandes: c.nombreCommandes || 0,
            statut: c.statut || 'ACTIF'
        }));

        renderClientsTable(allClients);

    } catch (error) {
        console.error("Erreur base client:", error);
        listContainer.innerHTML = `<p style="color:red; text-align:center; padding:20px;">Erreur de chargement des clients.</p>`;
    }
}

// ============================================================
// 🎨 RENDU DU TABLEAU CLIENTS
// ============================================================
function renderClientsTable(clients) {
    const listContainer = document.getElementById('clientsList');
    if (!listContainer) return;

    if (clients.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align:center; padding: 40px; color:#aaa;">
                🔍 Aucun client ne correspond à votre recherche.
            </div>`;
        return;
    }

    let html = `
        <table class="admin-table" style="width:100%; border-collapse:collapse; text-align:left;">
            <thead>
                <tr style="background:#fdfbfe; border-bottom:2px solid #f2ebf4; color:#8c8c9b; font-size:12px; text-transform: uppercase;">
                    <th style="padding:15px; width:70px;">PROFIL</th>
                    <th style="padding:15px;">NOM COMPLET</th>
                    <th style="padding:15px;">COORDONNÉES</th>
                    <th style="padding:15px; text-align:center;">COMMANDES</th>
                    <th style="padding:15px;">TOTAL DÉPENSÉ</th>
                    <th style="padding:15px; text-align:center;">STATUT VIP</th>
                    <th style="padding:15px; text-align:center;">ACTION</th>
                </tr>
            </thead>
            <tbody style="font-size:13.5px; color:#333;">
    `;

    clients.forEach(client => {
        const totalSpent = client.totalDepense || client.history?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
        const totalOrders = client.nombreCommandes || client.history?.length || 0;

        let badge = LOYALTY_LEVELS.BRONZE;
        if (totalSpent >= LOYALTY_LEVELS.GOLD.min) badge = LOYALTY_LEVELS.GOLD;
        else if (totalSpent >= LOYALTY_LEVELS.SILVER.min) badge = LOYALTY_LEVELS.SILVER;

        const firstLetter = client.name.charAt(0).toUpperCase();

        html += `
            <tr style="border-bottom:1px solid #f7eff8; transition: background 0.2s;" onmouseover="this.style.background='#faf7fc'" onmouseout="this.style.background='transparent'">
                <td style="padding:15px;">
                    <div style="width:36px; height:36px; background:#f2e6f5; color:#9C27B0; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:14px;">
                        ${firstLetter}
                    </div>
                </td>
                <td style="padding:15px; font-weight:600; color:#181823;">
                    ${client.name}
                    <div style="font-size:11px; font-weight:normal; color:#bbb; margin-top:2px;">ID: ${client.id}</div>
                </td>
                <td style="padding:15px;">
                    <div>📱 ${client.phone}</div>
                    <div style="font-size:11.5px; color:#777; margin-top:2px;">✉️ ${client.email}</div>
                </td>
                <td style="padding:15px; text-align:center; font-weight:bold; color:#555;">
                    <span style="background:#f5f5f5; padding:4px 10px; border-radius:12px;">${totalOrders}</span>
                </td>
                <td style="padding:15px; font-weight:bold; color:#9C27B0;">
                    ${totalSpent.toLocaleString('fr-FR')} FCFA
                </td>
                <td style="padding:15px; text-align:center;">
                    <span style="background:${badge.bg}; color:${badge.color}; border:1px solid ${badge.color}40; padding:4px 12px; border-radius:20px; font-weight:bold; font-size:11.5px; display:inline-block;">
                        ${badge.label}
                    </span>
                </td>
                <td style="padding:15px; text-align:center;">
                    <button class="btn btn-sm" onclick="openClientDetailModal('${client.id}')"
                            style="background:#fff; border:1.5px solid #eee; border-radius:30px; padding:6px 14px; cursor:pointer; color:#9C27B0; font-weight:600; display:inline-flex; align-items:center; gap:4px; transition:all 0.2s;"
                            onmouseover="this.style.borderColor='#9C27B0'; this.style.background='#FBF5FD';"
                            onmouseout="this.style.borderColor='#eee'; this.style.background='#fff';">
                        <i class="ti ti-folder"></i> Dossier
                    </button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    listContainer.innerHTML = html;
}

// ============================================================
// 🔍 RECHERCHE CLIENTS
// ============================================================
function searchClients() {
    const searchInput = document.getElementById('searchClient');
    if (!searchInput) return;
    const value = searchInput.value.toLowerCase().trim();
    const filtered = allClients.filter(client =>
        client.name.toLowerCase().includes(value) ||
        client.phone.includes(value)
    );
    renderClientsTable(filtered);
}

// ============================================================
// 🔎 FICHE DÉTAIL CLIENT
// ============================================================
async function openClientDetailModal(clientId) {
    const client = allClients.find(c => c.id === clientId);
    if (!client) return;

    // 🔄 Charger les commandes depuis l'API et filtrer par téléphone
    let clientOrders = [];
    try {
        const ordersRes = await axios.get(API + '/orders');
        const allOrders = ordersRes.data || [];
        // Nettoie le téléphone pour la comparaison
        const cleanPhone = client.phone.replace(/[\s\+-]/g, '');
        clientOrders = allOrders.filter(o => {
            const orderPhone = (o.clientPhone || o.phoneNumber || '').replace(/[\s\+-]/g, '');
            return orderPhone.includes(cleanPhone) || cleanPhone.includes(orderPhone);
        });
    } catch (e) {
        console.warn('Impossible de charger les commandes du client');
    }

    // Calculs à partir des vraies commandes
    const totalSpent = clientOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
    const totalOrders = clientOrders.length;
    const averageBasket = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

    let badge = LOYALTY_LEVELS.BRONZE;
    if (totalSpent >= LOYALTY_LEVELS.GOLD.min) badge = LOYALTY_LEVELS.GOLD;
    else if (totalSpent >= LOYALTY_LEVELS.SILVER.min) badge = LOYALTY_LEVELS.SILVER;

    // Remplissage des infos client
    document.getElementById('detClientAvatar').innerText = client.name.charAt(0).toUpperCase();
    document.getElementById('profileClientName').innerText = client.name;
    document.getElementById('profileClientPhone').innerText = `📱 ${client.phone}`;
    document.getElementById('profileClientEmail').innerText = `✉️ ${client.email}`;
// Liens d'action
document.getElementById('profileCallLink').href = 'tel:' + client.phone.replace(/[\s]/g, '');
document.getElementById('profileEmailLink').href = 'mailto:' + client.email;

    const badgeEl = document.getElementById('profileLoyaltyBadge');
    badgeEl.innerText = badge.label;
    badgeEl.style.background = badge.bg;
    badgeEl.style.color = badge.color;
    badgeEl.style.border = `1px solid ${badge.color}40`;

    document.getElementById('statTotalOrders').innerText = totalOrders;
    document.getElementById('statTotalSpent').innerText = `${totalSpent.toLocaleString('fr-FR')} FCFA`;
    document.getElementById('statAverageBasket').innerText = `${averageBasket.toLocaleString('fr-FR')} FCFA`;

    // Historique des commandes
    const historyContainer = document.getElementById('profileOrdersList');
    if (clientOrders.length === 0) {
        historyContainer.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:15px; color:#aaa;">Aucun achat enregistré</td></tr>`;
    } else {
        historyContainer.innerHTML = clientOrders.map(order => `
            <tr style="border-bottom: 1px solid #fbfbfb;">
                <td style="padding: 10px 15px; font-weight: bold; color: #E91E63;">#${order.id}</td>
                <td style="padding: 10px 15px; color:#666;">${order.date ? new Date(order.date).toLocaleDateString('fr-FR') : '—'}</td>
                <td style="padding: 10px 15px; font-size:12px; color:#444;">${(order.items || []).length > 0 ? order.items.map(i => (i.qty || 1) + 'x ' + (i.name || i.productName || '—')).join(', ') : 'Commande #' + order.id}</td>
                <td style="padding: 10px 15px; text-align: right; font-weight: bold; color: #181823;">${(order.totalAmount || order.total || 0).toLocaleString('fr-FR')} FCFA</td>
            </tr>
        `).join('');
    }

    document.getElementById('clientDetailModal').style.display = 'flex';
}

function closeClientDetailModal() {
    document.getElementById('clientDetailModal').style.display = 'none';
}