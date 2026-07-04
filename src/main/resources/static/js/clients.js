// ============================================================================
// 👥 BASE DE DONNÉES CLIENTS & MOCK DATA (Liaison locale)
// ============================================================================
let allClients = [];

// Configuration des paliers de fidélité (Basé sur le montant total dépensé)
const LOYALTY_LEVELS = {
    GOLD:   { label: 'Client VIP 🥇', color: '#FFD700', bg: '#FFFDF0', min: 15000 },
    SILVER: { label: 'Fidèle 🥈',    color: '#78909C', bg: '#F4F6F7', min: 5000 },
    BRONZE: { label: 'Nouveau 🥉',   color: '#A1887F', bg: '#FAF8F7', min: 0 }
};

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    loadClients();
});

// ============================================================================
// 🔄 CHARGEMENT ET CALCULS DES CLIENTS
// ============================================================================
async function loadClients() {
    const listContainer = document.getElementById('clientsList');
    if (!listContainer) return;

    listContainer.innerHTML = `
        <div style="text-align:center; padding: 40px; color: #888;">
            <div class="spinner" style="margin-bottom:10px;">🌸</div>
            Analyse de la base client...
        </div>`;

    try {
        // 🛠️ Remplacer par ton API Laravel/Spring Boot : const response = await axios.get('/api/clients');

        if (allClients.length === 0) {
            allClients = [
                {
                    id: "CLI-9821",
                    name: "Awa Diop",
                    phone: "+221 77 123 45 67",
                    email: "awa.diop@gmail.com",
                    history: [
                        { id: "SH-001", date: "2026-06-24", items: "2x Chicken Burger", total: 6600 },
                        { id: "SH-012", date: "2026-06-10", items: "1x Pizza Regina", total: 4500 },
                        { id: "SH-034", date: "2026-05-29", items: "3x Tacos Viande", total: 7500 }
                    ]
                },
                {
                    id: "CLI-4512",
                    name: "Ibrahim Diallo",
                    phone: "+226 70 987 65 43",
                    email: "ib.diallo@outlook.com",
                    history: [
                        { id: "SH-002", date: "2026-06-24", items: "1x Fish Burger, 2x Jus", total: 6700 }
                    ]
                },
                {
                    id: "CLI-3089",
                    name: "Mariam Koné",
                    phone: "+225 05 44 33 22 11",
                    email: "mariam.kone@yahoo.fr",
                    history: [
                        { id: "SH-003", date: "2026-06-24", items: "3x Eau, 1x Expori", total: 2100 },
                        { id: "SH-019", date: "2026-06-15", items: "2x Cheeseburger", total: 4000 }
                    ]
                }
            ];
        }

        renderClientsTable(allClients);

    } catch (error) {
        console.error("Erreur base client:", error);
        listContainer.innerHTML = `<p style="color:red; text-align:center; padding:20px;">Erreur de chargement des clients.</p>`;
    }
}

// ============================================================================
// 🎨 RENDU DU TABLEAU CLIENTS
// ============================================================================
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
                    <th style="padding:15px;">TOTAL COMMANDE</th>
                    <th style="padding:15px; text-align:center;">STATUT VIP</th>
                    <th style="padding:15px; text-align:center;">ACTION</th>
                </tr>
            </thead>
            <tbody style="font-size:13.5px; color:#333;">
    `;

    clients.forEach(client => {
        // Calculs financiers automatiques pour le client
        const totalSpent = client.history.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = client.history.length;

        // Détermination du badge de fidélité
        let badge = LOYALTY_LEVELS.BRONZE;
        if (totalSpent >= LOYALTY_LEVELS.GOLD.min) badge = LOYALTY_LEVELS.GOLD;
        else if (totalSpent >= LOYALTY_LEVELS.SILVER.min) badge = LOYALTY_LEVELS.SILVER;

        // Première lettre pour l'avatar circularise
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

// ============================================================================
// 🔍 BARRE DE RECHERCHE FILTRANTE EN TEMPS RÉEL
// ============================================================================
function searchClients() {
    const searchInput = document.getElementById('searchClient');
    if (!searchInput) return;

    const value = searchInput.value.toLowerCase().trim();

    // Filtrage basé sur le nom ou sur le numéro de téléphone
    const filtered = allClients.filter(client =>
        client.name.toLowerCase().includes(value) ||
        client.phone.includes(value)
    );

    renderClientsTable(filtered);
}

// ============================================================================
// 🔎 INTERACTION : OUVERTURE DE LA FICHE VIP CLIENT
// ============================================================================
function openClientDetailModal(clientId) {
    const client = allClients.find(c => c.id === clientId);
    if (!client) return;

    // Calculs financiers
    const totalSpent = client.history.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = client.history.length;
    const averageBasket = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

    // Ajustement de la fidélité
    let badge = LOYALTY_LEVELS.BRONZE;
    if (totalSpent >= LOYALTY_LEVELS.GOLD.min) badge = LOYALTY_LEVELS.GOLD;
    else if (totalSpent >= LOYALTY_LEVELS.SILVER.min) badge = LOYALTY_LEVELS.SILVER;

    // Injection des données d'identité
    document.getElementById('detClientAvatar').innerText = client.name.charAt(0).toUpperCase();
    document.getElementById('profileClientName').innerText = client.name;
    document.getElementById('profileClientPhone').innerText = `📱 ${client.phone}`;
    document.getElementById('profileClientEmail').innerText = `✉️ ${client.email}`;

    // Rendu du badge badge VIP modal
    const badgeEl = document.getElementById('profileLoyaltyBadge');
    badgeEl.innerText = badge.label;
    badgeEl.style.background = badge.bg;
    badgeEl.style.color = badge.color;
    badgeEl.style.border = `1px solid ${badge.color}40`;

    // Rendu des blocs de statistiques chiffrées
    document.getElementById('statTotalOrders').innerText = totalOrders;
    document.getElementById('statTotalSpent').innerText = `${totalSpent.toLocaleString('fr-FR')} FCFA`;
    document.getElementById('statAverageBasket').innerText = `${averageBasket.toLocaleString('fr-FR')} FCFA`;

    // Injection des lignes du tableau de son historique
    const historyContainer = document.getElementById('profileOrdersList');
    if (client.history.length === 0) {
        historyContainer.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:15px; color:#aaa;">Aucun achat enregistré</td></tr>`;
    } else {
        historyContainer.innerHTML = client.history.map(order => `
            <tr style="border-bottom: 1px solid #fbfbfb;">
                <td style="padding: 10px 15px; font-weight: bold; color: #E91E63;">#${order.id}</td>
                <td style="padding: 10px 15px; color:#666;">${new Date(order.date).toLocaleDateString('fr-FR')}</td>
                <td style="padding: 10px 15px; font-size:12px; color:#444;">${order.items}</td>
                <td style="padding: 10px 15px; text-align: right; font-weight: bold; color: #181823;">${order.total.toLocaleString('fr-FR')} FCFA</td>
            </tr>
        `).join('');
    }

    // Affichage de la modal
    document.getElementById('clientDetailModal').style.display = 'flex';
}

function closeClientDetailModal() {
    document.getElementById('clientDetailModal').style.display = 'none';
}