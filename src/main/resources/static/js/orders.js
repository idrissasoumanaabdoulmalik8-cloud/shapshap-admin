// ============================================================================
// 📦 ORDERS.JS — GESTION COMPLÈTE DES COMMANDES (TEMPS RÉEL + NOTIFICATIONS)
// ============================================================================

const API_ORDERS = 'https://shapshap-admin-malik.up.railway.app/api/orders';
let allOrders = [];
let notificationAlarm = null;

const STATUS_CONFIG = {
    'PENDING':    { label: 'En attente',   emoji: '⏳', color: '#FF9800', bg: '#FFF3E0' },
    'PREPARING':  { label: 'En cuisine',   emoji: '🍳', color: '#1E88E5', bg: '#E3F2FD' },
    'READY':      { label: 'Prête ✨',     emoji: '🔔', color: '#9C27B0', bg: '#F3E5F5' },
    'COMPLETED':  { label: 'Terminée ✅',   emoji: '🎉', color: '#43A047', bg: '#E8F5E9' },
    'CANCELLED':  { label: 'Annulée ❌',   emoji: '🛑', color: '#E53935', bg: '#FFEBEE' }
};

// ============================================================================
// 🔊 SYSTÈME DE SONS (3 NOTIFICATIONS)
// ============================================================================

function playNewOrderSound() {
    if (!notificationAlarm) {
        notificationAlarm = new Audio("/sounds/new-order.mp3");
        notificationAlarm.loop = true;
        notificationAlarm.volume = 0.8;
    }
    notificationAlarm.currentTime = 0;
    notificationAlarm.play().catch(e => console.log("🔇 Son bloqué par le navigateur"));
    console.log("🔔 ALARME NOUVELLE COMMANDE !");
}

function playAcceptedSound() {
    const sound = new Audio("/sounds/accepted.mp3");
    sound.volume = 0.7;
    sound.play().catch(e => {});
}

function playReadySound() {
    const sound = new Audio("/sounds/ready.mp3");
    sound.volume = 0.7;
    sound.play().catch(e => {});
}

function stopAlarm() {
    if (notificationAlarm) {
        notificationAlarm.pause();
        notificationAlarm.currentTime = 0;
        console.log("🔕 Alarme arrêtée");
    }
}

// ============================================================================
// 🟡 BADGE "NOUVELLE COMMANDE"
// ============================================================================

function showNewOrderBadge(orderNumber) {
    let badge = document.getElementById('newOrderBanner');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'newOrderBanner';
        badge.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 9999;
            background: linear-gradient(135deg, #FF9800, #F57C00);
            color: #fff; padding: 14px 22px; border-radius: 16px;
            font-weight: 800; font-size: 15px; cursor: pointer;
            box-shadow: 0 8px 30px rgba(255,152,0,0.4);
            animation: bounceIn 0.5s ease, pulse 2s infinite;
            display: flex; align-items: center; gap: 10px;
        `;
        badge.onclick = () => {
            switchPage('orders');
            badge.remove();
        };
        document.body.appendChild(badge);
    }

    badge.innerHTML = `🛵 <strong>${orderNumber}</strong> — Nouvelle commande ! <span style="font-size:20px;">🔔</span>`;

    clearTimeout(badge._timeout);
    badge._timeout = setTimeout(() => {
        if (badge && badge.parentNode) {
            badge.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => badge.remove(), 500);
        }
    }, 15000);
}

function hideNewOrderBadge() {
    const badge = document.getElementById('newOrderBanner');
    if (badge) {
        badge.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => badge.remove(), 500);
    }
}

// ============================================================================
// 📡 WEBSOCKET — RECEVOIR LES COMMANDES EN TEMPS RÉEL
// ============================================================================

function connectOrdersWebSocket() {
    const wsUrl = 'ws://localhost:8080/ws';
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log('📡 WebSocket commandes connecté');
        socket.send('CONNECT\naccept-version:1.1,1.2\nhost:localhost\n\n\0');
        socket.send('SUBSCRIBE\nid:sub-orders\ndestination:/topic/orders\n\n\0');
        console.log('📡 Abonné à /topic/orders ✅');
    };

    socket.onmessage = (event) => {
        const text = event.data;
        console.log('📩 WS:', text.substring(0, 100));

        if (text.includes('MESSAGE') && text.includes('{')) {
            try {
                const jsonStart = text.indexOf('{');
                const jsonEnd = text.lastIndexOf('}');
                if (jsonStart >= 0 && jsonEnd > jsonStart) {
                    const json = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
                    console.log('📨 Nouvelle commande !', json);
                    playNewOrderSound();
                    showNewOrderBadge(json.orderNumber || json.orderId || 'Nouvelle');
                    loadOrders();
                    if (typeof loadDashboard === 'function') loadDashboard();
                }
            } catch(e) { console.error('❌ Erreur parsing:', e); }
        }
    };

    socket.onclose = () => {
        console.log('📡 WebSocket fermé — reconnexion dans 5s');
        setTimeout(connectOrdersWebSocket, 5000);
    };

    socket.onerror = (e) => console.error('❌ WebSocket erreur');
}

// ============================================================================
// 🎨 STYLES D'ANIMATION
// ============================================================================

function addOrderStyles() {
    if (document.getElementById('order-animations')) return;

    const style = document.createElement('style');
    style.id = 'order-animations';
    style.textContent = `
        @keyframes bounceIn {
            0%   { transform: translateX(100px); opacity: 0; }
            60%  { transform: translateX(-10px); opacity: 1; }
            100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { box-shadow: 0 8px 30px rgba(255,152,0,0.4); }
            50%      { box-shadow: 0 8px 50px rgba(255,152,0,0.7); }
        }
        @keyframes fadeOut {
            to { opacity: 0; transform: translateY(-20px); }
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// ============================================================================
// INITIALISATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
    loadOrders();
    connectOrdersWebSocket();
    addOrderStyles();
});

// ============================================================================
// 🔄 CHARGEMENT ET FILTRAGE DES COMMANDES
// ============================================================================

async function loadOrders() {
    const listContainer = document.getElementById('ordersList');
    if (!listContainer) return;

    listContainer.innerHTML = `
        <div style="text-align:center; padding: 40px; color: #888;">
            <div class="spinner" style="margin-bottom:10px; animation: spin 1s linear infinite;">🌸</div>
            Chargement des commandes en cours...
        </div>`;

    try {
        const response = await axios.get(API_ORDERS);
        allOrders = response.data || [];

        const filterValue = document.getElementById('orderStatusFilter')?.value || 'all';
        const filteredOrders = filterValue === 'all'
            ? allOrders
            : allOrders.filter(o => o.status === filterValue);

        updateOrdersSidebarBadge();
        renderOrdersTable(filteredOrders);

        const pendingCount = allOrders.filter(o => o.status === 'PENDING').length;
        if (pendingCount === 0) {
            stopAlarm();
            hideNewOrderBadge();
        }

    } catch (error) {
        console.error("Erreur chargement commandes:", error);
        listContainer.innerHTML = `
            <div style="text-align:center; padding: 30px; color: #e53935;">
                <i class="ti ti-alert-triangle" style="font-size:30px;"></i>
                <p>Impossible de charger la liste des commandes.</p>
            </div>`;
    }
}

// ============================================================================
// 🎨 RENDU DU TABLEAU
// ============================================================================

function renderOrdersTable(orders) {
    const listContainer = document.getElementById('ordersList');

    if (orders.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align:center; padding: 50px 20px; color:#aaa; font-size:14px;">
                🍃 Aucune commande trouvée pour ce critère.
            </div>`;
        return;
    }

    let html = `
        <table class="admin-table" style="width:100%; border-collapse:collapse; text-align:left;">
            <thead>
                <tr style="background:#fcf8fa; border-bottom:2px solid #f0e2e7; color:#8c8c9b; font-size:12px; text-transform: uppercase; letter-spacing: 0.5px;">
                    <th style="padding:15px;">REF CODE</th>
                    <th style="padding:15px;">CLIENT</th>
                    <th style="padding:15px;">COMPOSITION</th>
                    <th style="padding:15px;">TOTAL</th>
                    <th style="padding:15px;">STATUT</th>
                    <th style="padding:15px; text-align:center;">ACTIONS</th>
                </tr>
            </thead>
            <tbody style="font-size:13.5px; color:#333;">
    `;

    orders.forEach(order => {
        const conf = STATUS_CONFIG[order.status] || { label: order.status, emoji: '📦', color: '#333', bg: '#eee' };

        const itemsSummary = (order.items || []).map(i =>
            `<span style="display:inline-block; background:#f5f5f7; padding:2px 8px; border-radius:15px; margin:2px; font-size:11px; font-weight:600; color:#555;">
                ${i.qty || 1}x ${i.name || '—'}
             </span>`
        ).join('');

        const orderTime = order.date ? new Date(order.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—';

        html += `
            <tr style="border-bottom:1px solid #f9eff3; transition: background 0.2s;" onmouseover="this.style.background='#fffcfd'" onmouseout="this.style.background='transparent'">
                <td style="padding:15px; font-weight:bold; color:#181823;">
                    <span style="color:#E91E63;">#</span>${String(order.id).padStart(4, '0')}
                    <div style="font-size:11px; font-weight:normal; color:#aaa; margin-top:3px;">🕒 ${orderTime}</div>
                </td>
                <td style="padding:15px;">
                    <div style="font-weight:600; color:#222;">${order.clientName || order.customerName || '—'}</div>
                    <div style="font-size:11px; color:#777; margin-top:2px;">📱 ${order.clientPhone || order.phoneNumber || '—'}</div>
                </td>
                <td style="padding:15px; max-width: 250px;">
                    <div style="display:flex; flex-wrap:wrap;">${itemsSummary}</div>
                </td>
                <td style="padding:15px; font-weight:bold; color:#181823; font-size:14px;">
                    ${Number(order.total || order.totalAmount || 0).toLocaleString('fr-FR')} FCFA
                </td>
                <td style="padding:15px;">
                    <select onchange="updateOrderStatus('${order.id}', this.value)"
                            style="background:${conf.bg}; color:${conf.color}; border:1px solid ${conf.color}40;
                                   padding:6px 12px; border-radius:20px; font-weight:bold; font-size:12px;
                                   outline:none; cursor:pointer; font-family:inherit; transition: all 0.3s;">
                        ${Object.keys(STATUS_CONFIG).map(stKey => `
                            <option value="${stKey}" ${order.status === stKey ? 'selected' : ''}>
                                ${STATUS_CONFIG[stKey].emoji} ${STATUS_CONFIG[stKey].label}
                            </option>
                        `).join('')}
                    </select>
                </td>
                <td style="padding:15px; text-align:center;">
                    <button class="btn btn-sm" onclick="openOrderDetailModal('${order.id}')"
                            style="background:#fff; border:1.5px solid #eee; border-radius:30px; padding:6px 14px; cursor:pointer; color:#E91E63; font-weight:600; display:inline-flex; align-items:center; gap:4px; transition:all 0.2s;"
                            onmouseover="this.style.borderColor='#E91E63'; this.style.background='#FFF0F5';"
                            onmouseout="this.style.borderColor='#eee'; this.style.background='#fff';">
                        <i class="ti ti-eye"></i> Inspecter
                    </button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    listContainer.innerHTML = html;
}

// ============================================================================
// ⚡ CHANGEMENT DE STATUT (AVEC SONS)
// ============================================================================

async function updateOrderStatus(orderId, newStatus) {
    const order = allOrders.find(o => o.id == orderId);
    const oldStatus = order ? order.status : null;

    try {
        await axios.put(`${API_ORDERS}/${orderId}/status`, { status: newStatus });

        if (order) {
            order.status = newStatus;
        }

        // 🔊 SONS SELON LE NOUVEAU STATUT
        if (newStatus === 'PREPARING' && oldStatus === 'PENDING') {
            stopAlarm();
            playAcceptedSound();
        }
        if (newStatus === 'READY') {
            playReadySound();
        }
        if (newStatus === 'COMPLETED') {
            playReadySound();
        }
        if (newStatus === 'CANCELLED') {
            stopAlarm();
        }

        const pendingCount = allOrders.filter(o => o.status === 'PENDING').length;
        if (pendingCount === 0) {
            stopAlarm();
            hideNewOrderBadge();
        }

        if (typeof showToast === 'function') {
            showToast(`Commande #${String(orderId).padStart(4, '0')} → ${STATUS_CONFIG[newStatus].label} ${STATUS_CONFIG[newStatus].emoji}`, 'success');
        }

        loadOrders();
        if (typeof loadDashboard === 'function') {
            loadDashboard();
        }

    } catch (error) {
        console.error("Erreur changement de statut:", error);
        if (typeof showToast === 'function') showToast("Erreur de modification", 'error');
    }
}

// ============================================================================
// 🔎 MODAL DÉTAILS COMMANDE
// ============================================================================

function openOrderDetailModal(orderId) {
    const order = allOrders.find(o => o.id == orderId);
    if (!order) return;

    const conf = STATUS_CONFIG[order.status] || { label: order.status, emoji: '📦' };

    document.getElementById('detOrderId').innerText = `#${String(order.id).padStart(4, '0')}`;
    document.getElementById('detClientName').innerText = order.clientName || order.customerName || '—';
    document.getElementById('detClientPhone').innerText = order.clientPhone || order.phoneNumber || '—';
    document.getElementById('detOrderDate').innerText = order.date ? new Date(order.date).toLocaleString('fr-FR') : '—';
    document.getElementById('detOrderNotes').innerText = order.notes || "Aucune note particulière.";
    document.getElementById('detOrderTotal').innerText = `${Number(order.total || order.totalAmount || 0).toLocaleString('fr-FR')} FCFA`;

    const badge = document.getElementById('detStatusBadge');
    badge.innerText = `${conf.emoji} ${conf.label}`;
    badge.style.background = conf.bg;
    badge.style.color = conf.color;
    badge.style.padding = "4px 12px";
    badge.style.borderRadius = "20px";
    badge.style.fontSize = "12px";
    badge.style.fontWeight = "bold";

    const listContainer = document.getElementById('detItemsList');
    listContainer.innerHTML = (order.items || []).map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 15px; border-bottom:1px solid #eee; font-size:13.5px;">
            <div>
                <strong style="color:#181823;">${item.name || '—'}</strong>
                <span style="color:#888; font-size:12px; margin-left:8px;">x${item.qty || 1}</span>
            </div>
            <div style="font-weight:600; color:#555;">
                ${Number((item.price || 0) * (item.qty || 1)).toLocaleString('fr-FR')} FCFA
            </div>
        </div>
    `).join('');

    document.getElementById('orderDetailModal').style.display = 'flex';

    document.getElementById('detPrintBtn').onclick = () => {
        window.print();
    };
}

function closeOrderDetailModal() {
    document.getElementById('orderDetailModal').style.display = 'none';
}

// ============================================================================
// 🔢 BADGE SIDEBAR
// ============================================================================

function updateOrdersSidebarBadge() {
    const pendingCount = allOrders.filter(o => o.status === 'PENDING').length;
    const badge = document.getElementById('ordersBadge');
    if (badge) {
        if (pendingCount > 0) {
            badge.innerText = pendingCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}