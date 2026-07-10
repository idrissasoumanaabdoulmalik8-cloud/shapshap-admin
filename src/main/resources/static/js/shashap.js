/* ============================================================
   SHASHAP ADMIN — JS v3.0
   Adapté au nouveau dashboard harmonieux
   ============================================================ */
const API = 'https://shapshap-admin-malik.up.railway.app/api';
//const API = "http://localhost:8080/api";
// ── État global ──────────────────────────────────────────────
let allProducts        = [];
let searchTimeout      = null;
let currentView        = 'list';
let selectedProducts   = [];
let statsOpen          = false;

// Stories
const STORIES_KEY      = 'shashap_stories_v3';
let storiesData        = [];
let allProductsForStories = [];
let viewerCurrentIndex = 0;
let viewerAutoClose    = null;

// Quick View
let quickViewProductId = null;

// Pagination
let currentPage            = 1;
let productsPerPage        = 12;
let totalFilteredProducts  = 0;

// ============================================================
// TOAST
// ============================================================
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className   = 'toast ' + type;
  setTimeout(() => t.classList.add('show'), 80);
  setTimeout(() => t.classList.remove('show'), 3600);
}

// ============================================================
// NAVIGATION (sidebar + topbar titre)
// ============================================================
function switchPage(page) {
  // Sidebar links
  document.querySelectorAll('.sidebar nav a').forEach(l => l.classList.remove('active'));
  const link = document.querySelector(`.sidebar nav a[data-page="${page}"]`);
  if (link) link.classList.add('active');

  // Pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById(page);
  if (pageEl) pageEl.classList.add('active');

  // Topbar titre (nouveau dashboard)
  const titles = {
    dashboard : 'Tableau de bord',
    orders    : 'Commandes',
    products  : 'Produits',
    clients   : 'Clients',
    favorites : '❤️ Favoris',
  };
  const subs = {
    dashboard : 'Vue d\'ensemble en temps réel',
    orders    : 'Suivi en temps réel',
    products  : 'Catalogue et gestion du menu',
    clients   : 'Base de données clients',
    favorites : 'Produits likés par vos clients',
  };
  const titleEl = document.getElementById('pageTitle');
  const subEl   = document.getElementById('pageSub');
  if (titleEl) titleEl.textContent = titles[page]  || '';
  if (subEl)   subEl.textContent   = subs[page]    || '';

  // Chargement
  if      (page === 'dashboard') loadDashboard();
  else if (page === 'orders')    loadOrders();
  else if (page === 'products')  loadProducts();
  else if (page === 'clients')   loadClients();
  else if (page === 'favorites') loadFavorites();
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  // ── Liens sidebar ──────────────────────────────────────────
  document.querySelectorAll('.sidebar nav a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.dataset.page;
      if (page) switchPage(page);
    });
  });

  // ── Upload image (drag & drop + click) ────────────────────
  const dropZone  = document.getElementById('dropZone');
  const fileInput = document.getElementById('productImageFile');
  const urlInput  = document.getElementById('productImageUrl');
  const imgPrev   = document.getElementById('imagePreview');

  if (dropZone && fileInput) {
    dropZone.addEventListener('click',    () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave',  () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleImageUpload(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener('change', function() {
      if (this.files.length > 0) handleImageUpload(this.files[0]);
    });
  }

  if (urlInput && imgPrev) {
    urlInput.addEventListener('input', function() {
      if (this.value) {
        imgPrev.src = this.value + '?_t=' + Date.now();
        imgPrev.style.display = 'block';
      } else {
        imgPrev.style.display = 'none';
      }
    });
  }

  async function handleImageUpload(file) {
    const formData  = new FormData();
    formData.append('file', file);
    const objectUrl = URL.createObjectURL(file);
    imgPrev.src     = objectUrl;
    imgPrev.style.display  = 'block';
    imgPrev.style.opacity  = '0.65';
    imgPrev.style.border   = '2px solid #FF9800';
    try {
      const r = await axios.post(API + '/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (urlInput) urlInput.value = r.data;
      imgPrev.src            = r.data + '?_t=' + Date.now();
      imgPrev.style.opacity  = '1';
      imgPrev.style.border   = '2px solid #4CAF50';
      showToast('✅ Image uploadée avec succès');
      await loadProducts();
      syncStoriesImages();
      renderStories();
    } catch (err) {
      showToast('❌ Échec de l\'upload : ' + err.message, 'error');
      imgPrev.style.display  = 'none';
      imgPrev.style.opacity  = '1';
      imgPrev.style.border   = '';
    }
  }

  // ── Bulk actions bar (injectée dynamiquement) ─────────────
  const prodPage = document.getElementById('products');
  if (prodPage) {
    const bulk  = document.createElement('div');
    bulk.id     = 'bulkActions';
    bulk.className = 'bulk-actions';
    bulk.innerHTML = `
      <span id="selectedCount" style="font-weight:700;color:#555;font-size:13px;"></span>
      <button class="btn btn-success btn-sm"   onclick="bulkActivate()">✅ Activer</button>
      <button class="btn btn-warning btn-sm"   onclick="bulkDeactivate()">❌ Désactiver</button>
      <button class="btn btn-danger btn-sm"    onclick="bulkDelete()">🗑️ Supprimer</button>
      <button class="btn btn-outline btn-sm"   onclick="clearSelection()">✖ Désélectionner</button>`;
    const fa = prodPage.querySelector('.filters-advanced');
    if (fa) fa.parentNode.insertBefore(bulk, fa.nextSibling);
  }

  // ── Touche Échap → ferme les panneaux ────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeQuickView();
      closeStoryViewer();
    }
  });

  // ── Init ─────────────────────────────────────────────────
  loadStoriesFromStorage();
  renderStories();
  setView('list');
  loadDashboard();
});

// ============================================================
// UTILITAIRES
// ============================================================
function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
}
function getStatusLabel(s) {
  return { PENDING:'En attente', PREPARING:'En préparation', READY:'Prête', COMPLETED:'Terminée', CANCELLED:'Annulée' }[s] || s;
}
function getCategoryEmoji(cat) {
  return { Burger:'🍔', Pizza:'🍕', Boisson:'🥤', Dessert:'🍰', Accompagnement:'🍟' }[cat] || '🍽️';
}
// ✅ LA NOUVELLE FONCTION PROPRE
function freshImg(url) {
  if (!url) return '';
  // On renvoie juste l'url directement, sans lui ajouter de poison à la fin !
  return url;
}
function fmtPrice(n) {
  return (n || 0).toLocaleString('fr-FR');
}

// ============================================================
// SKELETON LOADERS
// ============================================================
function showSkeletonList() {
  const c = document.getElementById('productsListView');
  if (!c) return;
  let html = `<table><thead><tr>
    <th></th><th>ID</th><th>Photo</th><th>Nom</th>
    <th>Catégorie</th><th>Prix</th><th>Dispo</th><th>Actions</th>
  </tr></thead><tbody>`;
  for (let i = 0; i < 8; i++) {
    html += `<tr>
      <td><div class="skeleton" style="width:17px;height:17px;margin:0 auto;"></div></td>
      <td><div class="skeleton" style="width:38px;height:17px;border-radius:6px;"></div></td>
      <td><div class="skeleton" style="width:44px;height:44px;border-radius:10px;margin:0 auto;"></div></td>
      <td><div class="skeleton" style="width:120px;height:14px;"></div></td>
      <td><div class="skeleton" style="width:68px;height:14px;"></div></td>
      <td><div class="skeleton" style="width:58px;height:14px;"></div></td>
      <td><div class="skeleton" style="width:22px;height:22px;border-radius:50%;margin:0 auto;"></div></td>
      <td><div style="display:flex;gap:4px;justify-content:center;">
        <div class="skeleton" style="width:28px;height:28px;border-radius:6px;"></div>
        <div class="skeleton" style="width:28px;height:28px;border-radius:6px;"></div>
      </div></td>
    </tr>`;
  }
  c.innerHTML = html + '</tbody></table>';
}

function showSkeletonGrid() {
  const c = document.getElementById('productsGridView');
  if (!c) return;
  c.style.display = 'grid';
  c.innerHTML = Array.from({ length: 6 }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton sk-card-img"></div>
      <div class="sk-card-body">
        <div class="skeleton sk-card-tag"></div>
        <div class="skeleton sk-card-title"></div>
        <div class="skeleton sk-card-price"></div>
        <div class="sk-card-actions">
          <div class="skeleton sk-btn"></div>
          <div class="skeleton sk-btn-icon"></div>
        </div>
      </div>
    </div>`).join('');
}

// ============================================================
// QUICK VIEW
// ============================================================
function openQuickView(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;
  quickViewProductId = productId;

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('qvCategory',   product.category || '—');
  setText('qvName',       product.name     || 'Sans nom');
  setText('qvPrice',      fmtPrice(product.price) + ' FCFA');
  setText('qvId',         '#' + product.id);
  setText('qvPopularity', (product.popularity || 0) + ' ⭐');

  const img      = document.getElementById('qvImage');
  const fallback = document.getElementById('qvFallback');
  const emoji    = document.getElementById('qvEmoji');
  const imgSrc   = freshImg(product.imageUrl);

  if (img && fallback) {
    if (imgSrc) {
      img.src = imgSrc;
      img.style.display      = 'block';
      fallback.style.display = 'none';
      img.onerror = () => {
        img.style.display      = 'none';
        fallback.style.display = 'flex';
        if (emoji) emoji.textContent = getCategoryEmoji(product.category);
      };
    } else {
      img.style.display      = 'none';
      fallback.style.display = 'flex';
      if (emoji) emoji.textContent = getCategoryEmoji(product.category);
    }
  }

  const badge = document.getElementById('qvAvailable');
  if (badge) {
    badge.textContent = product.isAvailable ? '✅' : '❌';
    badge.style.background = product.isAvailable
      ? 'rgba(232,245,233,0.9)' : 'rgba(255,235,238,0.9)';
  }

  const tagsEl = document.getElementById('qvTags');
  if (tagsEl) {
    const tags = [];
    if (product.isNew)                tags.push('<span class="badge-tag badge-new">🌟 Nouveau</span>');
    if (product.promo)                tags.push('<span class="badge-tag badge-promo">🔥 Promo</span>');
    if (product.isBio)                tags.push('<span class="badge-tag badge-bio">🌿 Bio</span>');
    if ((product.popularity || 0) > 10) tags.push('<span class="badge-tag badge-popular">⭐ Populaire</span>');
    tagsEl.innerHTML = tags.length
      ? tags.join('')
      : '<span style="color:#ccc;font-size:12px;">Aucun tag</span>';
  }

  const overlay = document.getElementById('quickViewOverlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeQuickView(event) {
  if (event && event.target !== document.getElementById('quickViewOverlay')) return;
  const overlay = document.getElementById('quickViewOverlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
  quickViewProductId = null;
}

function quickViewEdit()   { if (quickViewProductId) { closeQuickView(); editProduct(quickViewProductId);   } }
function quickViewDelete() { if (quickViewProductId) { closeQuickView(); deleteProduct(quickViewProductId); } }

// ============================================================
// DASHBOARD — nouveau layout harmonieux
// ============================================================
async function loadDashboard() {
  try {
    const [oR, pR, cR] = await Promise.all([
      axios.get(API + '/orders'),
      axios.get(API + '/products'),
      axios.get(API + '/clients'),
    ]);
    const orders   = oR.data || [];
    const products = pR.data || [];
    const clients  = cR.data || [];

    const ca      = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const pending = orders.filter(o => o.status === 'PENDING').length;
    const done    = orders.filter(o => o.status === 'COMPLETED').length;

    // Badge sidebar
    const badge = document.getElementById('ordersBadge');
    if (badge) {
      badge.textContent    = pending;
      badge.style.display  = pending > 0 ? '' : 'none';
    }

    // ── 1. Cartes stat (zone #stats) ────────────────────────
    const statsEl = document.getElementById('stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-card pink">
          <div class="stat-icon-wrap">📦</div>
          <h3>Commandes totales</h3>
          <div class="value">${orders.length}</div>
          <div class="trend">${pending} en attente · ${done} terminées</div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon-wrap">💰</div>
          <h3>Chiffre d'affaires</h3>
          <div class="value">${fmtPrice(ca)}</div>
          <div class="trend">FCFA — toutes commandes</div>
        </div>
        <div class="stat-card orange">
          <div class="stat-icon-wrap">🍔</div>
          <h3>Produits au menu</h3>
          <div class="value">${products.length}</div>
          <div class="trend">${products.filter(p => p.isAvailable).length} disponibles</div>
        </div>
        <div class="stat-card blue">
          <div class="stat-icon-wrap">👥</div>
          <h3>Clients enregistrés</h3>
          <div class="value">${clients.length}</div>
          <div class="trend">Base de données active</div>
        </div>`;
    }

    // ── 2. Grille basse du dashboard (#recentOrders) ─────────
    // On injecte toute la structure dash-grid dans #recentOrders
    const recentEl = document.getElementById('recentOrders');
    if (!recentEl) return;

    // Données du bar chart (7 derniers jours)
    const barData    = _buildWeekBars(orders);
    const todayCount = barData[barData.length - 1].count;
    const todayCA    = barData[barData.length - 1].amount;
    const maxCount   = Math.max(...barData.map(d => d.count), 1);

    // Répartition catégories pour donut
    const catCounts  = {};
    products.forEach(p => { catCounts[p.category || 'Autre'] = (catCounts[p.category || 'Autre'] || 0) + 1; });
    const catColors  = ['#E91E63', '#1D9E75', '#378ADD', '#EF9F27', '#9C27B0'];
    const catEntries = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const total      = catEntries.reduce((s, [, n]) => s + n, 0);

    // Activité récente (4 dernières commandes)
    const recent4 = orders.slice(-4).reverse();
    const actIcons = [
      { cls:'new-order',   icon:'📦' },
      { cls:'new-product', icon:'🍔' },
      { cls:'new-client',  icon:'👤' },
      { cls:'cancel',      icon:'❌' },
    ];

    recentEl.innerHTML = `
    <div class="dash-grid">

      <!-- Colonne gauche -->
      <div class="dash-col">

        <!-- Table commandes récentes -->
        <div class="dash-card">
          <div class="dash-card-header">
            <span class="dash-card-title">Commandes récentes</span>
            <a class="dash-card-link" href="#" onclick="event.preventDefault();switchPage('orders')">
              Voir tout <span style="font-size:13px;">→</span>
            </a>
          </div>
          <table class="orders-mini-table">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody id="recentOrdersBody">
              ${_renderRecentOrdersRows(orders.slice(-5).reverse())}
            </tbody>
          </table>
        </div>

        <!-- Activité récente -->
        <div class="dash-card">
          <div class="dash-card-header">
            <span class="dash-card-title">Activité récente</span>
          </div>
          <div class="activity-feed" id="activityList">
            ${recent4.length
              ? recent4.map((o, i) => `
                <div class="act-item">
                  <div class="act-icon ${actIcons[i % 4].cls}">${actIcons[i % 4].icon}</div>
                  <div class="act-text">Commande <strong>#${o.orderNumber || o.id}</strong> — ${o.customerName || 'Client'}</div>
                  <div class="act-time">récente</div>
                </div>`).join('')
              : '<div style="padding:18px;text-align:center;color:#ccc;font-size:13px;">Aucune activité récente</div>'
            }
          </div>
        </div>

      </div><!-- /dash-col gauche -->

      <!-- Colonne droite -->
      <div class="dash-col">

        <!-- Bar chart semaine -->
        <div class="dash-card">
          <div class="dash-card-header">
            <span class="dash-card-title">Commandes cette semaine</span>
          </div>
          <div class="chart-bars">
            ${barData.map((d, i) => {
              const pct = Math.round((d.count / maxCount) * 100);
              const isToday = i === barData.length - 1;
              return `<div class="bar-wrap">
                <div class="bar ${isToday ? 'active' : ''}" style="height:${Math.max(pct, 4)}%;"></div>
                <span class="bar-label">${d.label}</span>
              </div>`;
            }).join('')}
          </div>
          <div class="mini-stats-row">
            <div class="mini-stat-box">
              <div class="mini-stat-val">${todayCount}</div>
              <div class="mini-stat-label">Aujourd'hui</div>
            </div>
            <div class="mini-stat-box">
              <div class="mini-stat-val">${fmtPrice(todayCA)}</div>
              <div class="mini-stat-label">Revenu (FCFA)</div>
            </div>
          </div>
        </div>

        <!-- Donut répartition -->
        <div class="dash-card">
          <div class="dash-card-header">
            <span class="dash-card-title">Répartition des ventes</span>
          </div>
          ${_renderDonut(catEntries, catColors, total)}
        </div>

        <!-- Actions rapides -->
        <div class="dash-card">
          <div class="dash-card-header">
            <span class="dash-card-title">Actions rapides</span>
          </div>
          <div class="quick-actions-grid">
            <button class="qa-btn" onclick="openProductModal();switchPage('products')">
              <span style="font-size:15px;color:var(--rose);">➕</span> Nouveau produit
            </button>
            <button class="qa-btn" onclick="exportTablePDF()">
              <span style="font-size:15px;color:var(--rose);">📕</span> Catalogue PDF
            </button>
            <button class="qa-btn" onclick="switchPage('clients')">
              <span style="font-size:15px;color:var(--rose);">👥</span> Voir clients
            </button>
            <button class="qa-btn" onclick="switchPage('products');setTimeout(toggleStats,300)">
              <span style="font-size:15px;color:var(--rose);">📊</span> Statistiques
            </button>
          </div>
        </div>

      </div><!-- /dash-col droite -->

    </div><!-- /dash-grid -->`;

  } catch (e) {
    console.error('Dashboard:', e);
    showToast('❌ Erreur chargement dashboard', 'error');
  }
}

// ── Helpers dashboard ────────────────────────────────────────
function _renderRecentOrdersRows(orders) {
  if (!orders.length) return '<tr><td colspan="4" style="text-align:center;color:#ccc;padding:22px;">Aucune commande</td></tr>';
  return orders.map(o => `
    <tr>
      <td><span class="order-num-mini">${o.orderNumber || 'N/A'}</span></td>
      <td><span class="client-name-mini">${o.customerName || 'Inconnu'}</span></td>
      <td><span class="amount-mini">${fmtPrice(o.totalAmount)} FCFA</span></td>
      <td><span class="status-badge status-${o.status}">${getStatusLabel(o.status)}</span></td>
    </tr>`).join('');
}

function _buildWeekBars(orders) {
  const days    = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  const today   = new Date();
  const result  = [];
  for (let i = 6; i >= 0; i--) {
    const d   = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOrders = orders.filter(o => (o.createdAt || '').startsWith(dateStr));
    result.push({
      label : i === 0 ? 'Auj.' : days[d.getDay()],
      count  : dayOrders.length,
      amount : dayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0),
    });
  }
  return result;
}

function _renderDonut(entries, colors, total) {
  if (!total) {
    return '<p style="text-align:center;color:#ccc;padding:20px;font-size:13px;">Aucune donnée</p>';
  }
  // SVG donut manuel (cercle 30, périmètre ≈ 188.5)
  const circumference = 2 * Math.PI * 30; // ≈ 188.5
  let offset = 0;
  const slices = entries.map(([cat, count], i) => {
    const pct  = count / total;
    const dash = circumference * pct;
    const gap  = circumference - dash;
    const color = colors[i % colors.length];
    const slice = `<circle cx="40" cy="40" r="30" fill="none"
      stroke="${color}" stroke-width="14"
      stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}"
      stroke-dashoffset="-${offset.toFixed(2)}"/>`;
    offset += dash;
    return { slice, cat, count, color, pct };
  });

  return `
    <div class="donut-wrap">
      <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r="30" fill="none" stroke="#F1EFE8" stroke-width="14"/>
        ${slices.map(s => s.slice).join('')}
      </svg>
      <div class="legend">
        ${slices.map(s => `
          <div class="legend-item">
            <div class="legend-dot" style="background:${s.color};"></div>
            ${s.cat}
            <span class="legend-val">${Math.round(s.pct * 100)}%</span>
          </div>`).join('')}
      </div>
    </div>`;
}

// ============================================================
// ORDERS
// ============================================================
async function loadOrders() {
  try {
    const res    = await axios.get(API + '/orders');
    const filterEl = document.getElementById('orderStatusFilter');
    const filter = filterEl ? filterEl.value : 'all';
    const filtered = filter === 'all' ? res.data : res.data.filter(o => o.status === filter);
    const c = document.getElementById('ordersList');
    if (!c) return;

    if (!filtered.length) {
      c.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>Aucune commande trouvée</p></div>';
      return;
    }
    c.innerHTML = `
      <table class="orders-table">
        <thead><tr>
          <th>ID</th><th>N° Commande</th><th>Client</th>
          <th>Montant</th><th>Statut</th><th style="text-align:center;">Actions</th>
        </tr></thead>
        <tbody>${filtered.map(o => `
          <tr>
            <td><span class="id-pill">#${o.id}</span></td>
            <td><span class="order-num">${o.orderNumber || 'N/A'}</span></td>
            <td>
              <div class="client-chip">
                <div class="client-avatar">${initials(o.customerName)}</div>
                <span style="font-weight:600;">${o.customerName || 'Inconnu'}</span>
              </div>
            </td>
            <td class="amount-text">${fmtPrice(o.totalAmount)} FCFA</td>
            <td><span class="status-badge status-${o.status}">${getStatusLabel(o.status)}</span></td>
            <td style="text-align:center;">
              <div style="display:flex;gap:4px;justify-content:center;">
                <button class="btn btn-secondary btn-sm btn-icon" onclick="updateStatus(${o.id},'PREPARING')" title="En préparation">👨‍🍳</button>
                <button class="btn btn-success  btn-sm btn-icon" onclick="updateStatus(${o.id},'READY')"     title="Prête">✅</button>
                <button class="btn btn-danger   btn-sm btn-icon" onclick="updateStatus(${o.id},'CANCELLED')" title="Annuler">❌</button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (e) {
    const c = document.getElementById('ordersList');
    if (c) c.innerHTML = '<p style="padding:24px;color:#e53935;text-align:center;">❌ Erreur de chargement</p>';
  }
}

// ============================================================
// PANEL STATS PRODUITS
// ============================================================
function toggleStats() {
  statsOpen = !statsOpen;
  const panel   = document.getElementById('statsPanel');
  const btn     = document.getElementById('statsToggleBtn');
  if (panel) panel.classList.toggle('open', statsOpen);
  if (btn)   btn.classList.toggle('active', statsOpen);
  if (statsOpen) updateProductsStats(allProducts);
}

function updateProductsStats(products) {
  const total   = products.length;
  const avail   = products.filter(p => p.isAvailable).length;
  const avgP    = total > 0 ? Math.round(products.reduce((s, p) => s + (p.price || 0), 0) / total) : 0;
  const popular = products.filter(p => (p.popularity || 0) > 10).length;
  const cats    = new Set(products.map(p => p.category)).size;

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('totalProductsCount',      total);
  setText('availableProductsCount',  avail);
  setText('unavailableProductsCount', total - avail);
  setText('popularProductsCount',    popular);
  setText('averagePrice',            fmtPrice(avgP) + ' FCFA');
  setText('categoriesCount',         cats);

  // Mini chart catégories
  const chartEl = document.getElementById('categoryChart');
  if (chartEl) {
    const catMap = {};
    products.forEach(p => { catMap[p.category || 'Autre'] = (catMap[p.category || 'Autre'] || 0) + 1; });
    const colors = ['#E91E63', '#43A047', '#1E88E5', '#FF9800', '#9C27B0', '#607D8B'];
    chartEl.innerHTML = Object.entries(catMap).map(([cat, count], i) => `
      <div class="chart-category-item">
        <span class="chart-dot" style="background:${colors[i % colors.length]};"></span>
        ${cat}
        <span class="chart-count">${count}</span>
      </div>`).join('');
  }
}

// ============================================================
// VUE (liste / grille)
// ============================================================
function setView(view) {
  currentView = view;
  currentPage = 1;
  const lb = document.getElementById('viewListBtn');
  const gb = document.getElementById('viewGridBtn');
  if (lb) lb.classList.toggle('active', view === 'list');
  if (gb) gb.classList.toggle('active', view === 'grid');
  const lv = document.getElementById('productsListView');
  const gv = document.getElementById('productsGridView');
  if (lv) lv.style.display = view === 'list' ? 'block' : 'none';
  if (gv) gv.style.display = view === 'grid' ? 'grid'  : 'none';
  loadProducts();
}

function debounceSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(loadProducts, 280);
}

function resetFilters() {
  currentPage = 1;
  ['searchProduct','categoryFilter','priceFilter','availabilityFilter','tagFilter','sortFilter','dateFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = el.tagName === 'INPUT' ? '' : (id === 'sortFilter' ? 'name-asc' : 'all');
  });
  loadProducts(1);
}

// ============================================================
// LOAD PRODUCTS (filtres + tri + pagination)
// ============================================================
async function loadProducts(page = 1) {
  currentPage = page;
  if (currentView === 'list') showSkeletonList();
  else                        showSkeletonGrid();

  try {
    const res    = await axios.get(API + '/products');
    allProducts  = res.data || [];
    let filtered = [...allProducts];

    // Catégorie
    const cat = document.getElementById('categoryFilter')?.value;
    if (cat && cat !== 'all') filtered = filtered.filter(p => p.category === cat);

    // Recherche
    const q = (document.getElementById('searchProduct')?.value || '').toLowerCase().trim();
    if (q) filtered = filtered.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q));

    // Prix
    const pf = document.getElementById('priceFilter')?.value;
    if (pf && pf !== 'all') {
      const [mn, mx] = pf.split('-').map(Number);
      filtered = filtered.filter(p => {
        const pr = p.price || 0;
        return mx === 999999 ? pr >= mn : pr >= mn && pr <= mx;
      });
    }

    // Disponibilité
    const av = document.getElementById('availabilityFilter')?.value;
    if (av === 'available')   filtered = filtered.filter(p =>  p.isAvailable);
    if (av === 'unavailable') filtered = filtered.filter(p => !p.isAvailable);

    // Tags
    const tag = document.getElementById('tagFilter')?.value;
    if (tag && tag !== 'all') filtered = filtered.filter(p => {
      if (tag === 'nouveau')  return !!p.isNew;
      if (tag === 'promo')    return !!p.promo;
      if (tag === 'bio')      return !!p.isBio;
      if (tag === 'populaire')return (p.popularity || 0) > 10;
      return true;
    });

    // Date
    const df = document.getElementById('dateFilter')?.value;
    if (df && df !== 'all') {
      const now = new Date();
      let startDate = null;
      if (df === 'today')  startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (df === 'week')   { const d = now.getDay(); startDate = new Date(now); startDate.setDate(now.getDate() - d + (d===0?-6:1)); startDate.setHours(0,0,0,0); }
      if (df === 'month')  startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      if (df === 'year')   startDate = new Date(now.getFullYear(), 0, 1);
      if (startDate) filtered = filtered.filter(p => p.createdAt && new Date(p.createdAt) >= startDate);
    }

    // Tri
    const sort = document.getElementById('sortFilter')?.value || 'name-asc';
    const sortFns = {
      'name-asc'  : (a, b) => (a.name || '').localeCompare(b.name || ''),
      'name-desc' : (a, b) => (b.name || '').localeCompare(a.name || ''),
      'price-asc' : (a, b) => (a.price || 0) - (b.price || 0),
      'price-desc': (a, b) => (b.price || 0) - (a.price || 0),
      'id-asc'    : (a, b) => (a.id || 0) - (b.id || 0),
      'id-desc'   : (a, b) => (b.id || 0) - (a.id || 0),
      'popularity': (a, b) => (b.popularity || 0) - (a.popularity || 0),
      'newest'    : (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    };
    if (sortFns[sort]) filtered.sort(sortFns[sort]);

    // Pagination
    totalFilteredProducts = filtered.length;
    const totalPages      = Math.max(1, Math.ceil(totalFilteredProducts / productsPerPage));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (currentPage - 1) * productsPerPage;
    const paginated = filtered.slice(start, start + productsPerPage);

    // Compteur filtres
    const cnt = document.getElementById('filterCount');
    if (cnt) cnt.textContent = totalFilteredProducts + ' produit' + (totalFilteredProducts > 1 ? 's' : '');

    updateProductsStats(filtered);

    if (currentView === 'list') displayProductsList(paginated);
    else                        displayProductsGrid(paginated);

    renderPagination(currentPage, totalPages);
    syncStoriesImages();
    renderStories();

  } catch (e) {
    showToast('❌ Erreur chargement produits', 'error');
    console.error('loadProducts:', e);
  }
}

// ============================================================
// PAGINATION
// ============================================================
function renderPagination(curPage, totalPages) {
  // Cherche le .table-card de la section produits
  const tableCard = document.querySelector('#products .table-card');
  if (!tableCard) return;

  // Retire l'ancienne pagination
  tableCard.querySelector('.pagination-container')?.remove();
  if (totalPages <= 1) return;

  // Calcul des pages à afficher
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (curPage > 3) pages.push('…');
    for (let i = Math.max(2, curPage-1); i <= Math.min(totalPages-1, curPage+1); i++) pages.push(i);
    if (curPage < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  const start = (curPage - 1) * productsPerPage + 1;
  const end   = Math.min(curPage * productsPerPage, totalFilteredProducts);

  tableCard.insertAdjacentHTML('beforeend', `
    <div class="pagination-container">
      <div class="pagination-info">
        <strong>${start}–${end}</strong> sur <strong>${totalFilteredProducts}</strong> produits
        <select class="per-page-select" onchange="changePerPage(this.value)" style="margin-left:10px;">
          <option value="12"  ${productsPerPage===12  ? 'selected':''}>12/page</option>
          <option value="24"  ${productsPerPage===24  ? 'selected':''}>24/page</option>
          <option value="48"  ${productsPerPage===48  ? 'selected':''}>48/page</option>
          <option value="96"  ${productsPerPage===96  ? 'selected':''}>96/page</option>
        </select>
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" onclick="goToPage(${curPage-1})" ${curPage===1 ? 'disabled':''}>‹</button>
        ${pages.map(p =>
          p === '…'
            ? '<span class="pagination-ellipsis">…</span>'
            : `<button class="pagination-btn ${p===curPage?'active':''}" onclick="goToPage(${p})">${p}</button>`
        ).join('')}
        <button class="pagination-btn" onclick="goToPage(${curPage+1})" ${curPage===totalPages ? 'disabled':''}>›</button>
      </div>
    </div>`);
}

function goToPage(page) {
  const total = Math.ceil(totalFilteredProducts / productsPerPage);
  if (page < 1 || page > total) return;
  currentPage = page;
  document.querySelector('#products .table-card')?.scrollIntoView({ behavior:'smooth', block:'start' });
  loadProducts(page);
}

function changePerPage(value) {
  productsPerPage = parseInt(value);
  currentPage     = 1;
  loadProducts(1);
}

// ============================================================
// AFFICHAGE LISTE
// ============================================================
function displayProductsList(products) {
  const c = document.getElementById('productsListView');
  if (!c) return;
  if (!products.length) {
    c.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🔍</div>
      <p>Aucun produit trouvé</p>
      <small>Modifiez vos filtres</small>
    </div>`;
    return;
  }
  c.innerHTML = `
    <table class="products-table">
      <thead><tr>
        <th><input type="checkbox" onchange="toggleAllProducts(this.checked)" style="accent-color:var(--rose);"></th>
        <th>ID</th>
        <th style="text-align:center;">Photo</th>
        <th>Nom</th>
        <th>Catégorie</th>
        <th>Prix</th>
        <th style="text-align:center;">Dispo</th>
        <th style="text-align:center;">Actions</th>
      </tr></thead>
      <tbody>${products.map(p => {
        const imgSrc = freshImg(p.imageUrl);
        return `<tr>
          <td><input type="checkbox" class="product-checkbox" value="${p.id}"
               onchange="toggleProductSelection(${p.id},this.checked)"
               style="accent-color:var(--rose);"></td>
          <td><span class="id-pill">${p.id}</span></td>
          <td>
            <div class="product-img-cell">
              <div class="product-img-wrap">
                ${imgSrc
                  ? `<img src="${imgSrc}"
                         onerror="this.parentElement.innerHTML='<span style=font-size:22px>${getCategoryEmoji(p.category)}</span>'"
                         alt="${p.name || ''}">`
                  : `<span style="font-size:22px;">${getCategoryEmoji(p.category)}</span>`}
              </div>
            </div>
          </td>
          <td>
            <strong style="cursor:pointer;color:#1a1a2e;transition:color .2s;"
                    onclick="openQuickView(${p.id})"
                    onmouseover="this.style.color='var(--rose)'"
                    onmouseout="this.style.color='#1a1a2e'"
                    title="Aperçu rapide">${p.name || 'Sans nom'}</strong>
            ${p.isNew              ? '<span class="badge-tag badge-new">🌟 Nouveau</span>'  : ''}
            ${p.promo              ? '<span class="badge-tag badge-promo">🔥 Promo</span>'  : ''}
            ${p.isBio              ? '<span class="badge-tag badge-bio">🌿 Bio</span>'      : ''}
            ${(p.popularity||0)>10 ? '<span class="badge-tag badge-popular">⭐ Top</span>'  : ''}
          </td>
          <td><span class="cat-chip">${p.category || '-'}</span></td>
          <td class="amount-text">${fmtPrice(p.price)} FCFA</td>
          <td style="text-align:center;font-size:18px;">${p.isAvailable ? '✅' : '❌'}</td>
          <td style="text-align:center;">
            <div style="display:flex;gap:4px;justify-content:center;">
              <button class="btn btn-secondary btn-sm btn-icon"
                      onclick="event.stopPropagation();editProduct(${p.id})" title="Modifier">✏️</button>
              <button class="btn btn-danger btn-sm btn-icon"
                      onclick="event.stopPropagation();deleteProduct(${p.id})" title="Supprimer">🗑️</button>
            </div>
          </td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>`;
}

// ============================================================
// AFFICHAGE GRILLE
// ============================================================
function displayProductsGrid(products) {
  const c = document.getElementById('productsGridView');
  if (!c) return;
  c.style.display = 'grid';
  if (!products.length) {
    c.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <div class="empty-icon">🔍</div><p>Aucun produit trouvé</p>
      <small>Modifiez vos filtres</small>
    </div>`;
    return;
  }
  c.innerHTML = products.map(p => {
    const imgSrc = freshImg(p.imageUrl);
    const imgZone = imgSrc
      ? `<img src="${imgSrc}" alt="${p.name || ''}"
             onload="this.style.opacity=1"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
             style="width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .5s;display:block;">
         <div class="img-fallback" style="display:none;width:100%;height:100%;flex-direction:column;align-items:center;justify-content:center;gap:8px;">
           <span style="font-size:40px;">${getCategoryEmoji(p.category)}</span>
           <small style="font-size:10px;color:rgba(233,30,99,0.5);font-weight:700;">${p.category||'Produit'}</small>
         </div>`
      : `<div class="img-fallback" style="display:flex;width:100%;height:100%;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#fce4ec,#f8f0f6);">
           <span style="font-size:40px;">${getCategoryEmoji(p.category)}</span>
           <small style="font-size:10px;color:rgba(233,30,99,0.5);font-weight:700;">${p.category||'Produit'}</small>
         </div>`;
    const tags = [
      p.isNew              ? '<span class="badge-tag badge-new">🌟</span>'    : '',
      p.promo              ? '<span class="badge-tag badge-promo">🔥</span>'   : '',
      p.isBio              ? '<span class="badge-tag badge-bio">🌿</span>'     : '',
      (p.popularity||0)>10 ? '<span class="badge-tag badge-popular">⭐</span>' : '',
    ].filter(Boolean);
    return `
      <div class="product-card" onclick="openQuickView(${p.id})">
        <div class="product-card-img-zone">
          ${imgZone}
          <div class="card-dispo-badge ${p.isAvailable ? 'dispo' : 'indispo'}">${p.isAvailable ? '✅' : '❌'}</div>
          ${tags.length ? `<div class="card-tags-overlay">${tags.join('')}</div>` : ''}
        </div>
        <div class="product-card-body">
          <div class="product-card-cat"><span class="cat-dot"></span>${p.category || '—'}</div>
          <div class="product-card-name" title="${p.name||''}">${p.name||'Sans nom'}</div>
          <div class="product-card-price">${fmtPrice(p.price)}<small>FCFA</small></div>
          <div class="card-divider"></div>
          <div class="product-card-actions">
            <button class="btn-edit" onclick="event.stopPropagation();editProduct(${p.id})">✏️ Modifier</button>
            <button class="btn-del"  onclick="event.stopPropagation();deleteProduct(${p.id})" title="Supprimer">🗑️</button>
          </div>
        </div>
      </div>`;
  }).join('');

  // Active les images déjà chargées
  setTimeout(() => {
    c.querySelectorAll('img').forEach(img => {
      if (img.complete && img.naturalWidth > 0) img.style.opacity = '1';
    });
  }, 60);
}

// ============================================================
// STORIES
// ============================================================
function loadStoriesFromStorage() {
  try {
    const s = localStorage.getItem(STORIES_KEY);
    if (s) storiesData = JSON.parse(s);
  } catch (e) { storiesData = []; }
}

function saveStoriesToStorage() {
  try { localStorage.setItem(STORIES_KEY, JSON.stringify(storiesData)); } catch (e) {}
}

function syncStoriesImages() {
  if (!storiesData.length || !allProducts.length) return;
  let changed = false;
  storiesData = storiesData.map(story => {
    const p = allProducts.find(p => p.id === story.id);
    if (p && p.imageUrl !== story.image) {
      changed = true;
      return { ...story, image:p.imageUrl||null, name:p.name, category:p.category, price:p.price };
    }
    return story;
  });
  if (changed) saveStoriesToStorage();
}

function renderStories() {
  // 🎯 On cible exactement le conteneur de ton HTML
  const c = document.getElementById('storiesContainer');
  if (!c) return;
  c.innerHTML = '';

  // 📈 Mise à jour automatique de ton compteur de stories de la page produit
  const countEl = document.getElementById('storiesCount');
  if (countEl) {
    countEl.textContent = storiesData ? storiesData.length : 0;
  }

  // Si le tableau est vraiment vide (aucune story créée)
  if (!storiesData || storiesData.length === 0) {
    c.innerHTML = '<p style="color:#8c8c9b; font-size:12px; padding: 15px; margin:0;">Aucune story active</p>';
    return;
  }

  // On boucle sur TES vraies stories issues de ton ajout/modification
  storiesData.forEach((story, index) => {
    let imgSrc = story.image || null;
    if (typeof freshImg === 'function' && story.image) {
      try { imgSrc = freshImg(story.image); } catch(e) {}
    }

    // Calcul de l'émoji selon la catégorie de ton produit
    let emoji = "🍔";
    const cat = (story.category || "").toLowerCase();
    if (cat.includes("pizz")) emoji = "🍕";
    else if (cat.includes("bois") || cat.includes("bev") || cat.includes("jus")) emoji = "🍹";
    else if (cat.includes("frit") || cat.includes("snack")) emoji = "🍟";
    else if (cat.includes("dess") || cat.includes("sucr")) emoji = "🍰";

    let imgHtml = "";
    if (imgSrc) {
      imgHtml = `<img src="${imgSrc}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width:100%; height:100%; border-radius:50%; object-fit:cover; border: 2.5px solid #fff;">`;
    }

    const fallbackHtml = `<div style="${imgSrc ? 'display:none;' : 'display:flex;'} width:100%; height:100%; border-radius:50%; align-items:center; justify-content:center; background:#fce4ec; border: 2.5px solid #fff;">
      <span style="font-size:20px;">${emoji}</span>
    </div>`;

    const item = document.createElement('div');
    item.className = 'story-item';
    item.style = 'display: flex; flex-direction: column; align-items: center; text-align: center; cursor: pointer; min-width: 85px; transition: transform 0.2s;';

    item.innerHTML = `
      <div class="story-ring-premium" onclick="if(typeof openStoryViewer === 'function') { openStoryViewer(${index}); } else { openStoryAnalytics(${index}); }" style="width: 66px; height: 66px; border-radius: 50%; padding: 2.5px; display: flex; align-items: center; justify-content: center; background: linear-gradient(45deg, #FF9800, #E91E63, #9C27B0); position: relative;">
        <div style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden; display: flex;">
          ${imgHtml}
          ${fallbackHtml}
        </div>
        ${story.promo ? `<span style="position: absolute; bottom: -2px; right: -2px; background: #E91E63; color: white; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 10px; border: 2px solid #fff;">-${story.promo}%</span>` : ''}
      </div>
      <span style="font-size: 11.5px; font-weight: 600; color: #1e1e2f; margin-top: 8px; max-width: 75px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${story.name || 'Produit'}</span>

      <div onclick="event.stopPropagation(); openStoryAnalytics(${index});" style="margin-top: 3px; background: #fff0f5; padding: 1px 7px; border-radius: 20px; display: flex; align-items: center; gap: 3px; border: 1px solid #fce4ec;">
        <span style="font-size: 10px; font-weight: 700; color: #E91E63;">👁️ ${story.viewsCount || 0}</span>
      </div>
    `;

    item.addEventListener('mouseenter', () => item.style.transform = 'scale(1.04)');
    item.addEventListener('mouseleave', () => item.style.transform = 'scale(1)');

    c.appendChild(item);
  });
}

// ── Story Viewer ─────────────────────────────────────────────
function openStoryViewer(index) {
  viewerCurrentIndex = index;
  document.getElementById('storyViewerOverlay')?.remove();

  const overlay     = document.createElement('div');
  overlay.className = 'story-viewer';
  overlay.id        = 'storyViewerOverlay';
  overlay.onclick   = e => { if (e.target === overlay) closeStoryViewer(); };
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('active'), 10);
  renderViewerContent(overlay, index);
}

function renderViewerContent(overlay, index) {
  const story = storiesData[index];
  if (!story) return;

  const imgSrc       = story.image ? freshImg(story.image) : null;
  const hasPromo     = !!story.promo;
  const discounted   = hasPromo ? Math.round((story.price||0) * (1 - parseInt(story.promo)/100)) : null;

  const imgZone = imgSrc
    ? `<img src="${imgSrc}"
           style="width:100%;height:100%;object-fit:cover;display:block;"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" alt="${story.name||''}">
       <div class="img-fallback-viewer" style="display:none;">
         <span>${getCategoryEmoji(story.category)}</span>
         <p>${story.category||'Produit'}</p>
       </div>`
    : `<div class="img-fallback-viewer">
         <span>${getCategoryEmoji(story.category)}</span>
         <p>${story.category||'Produit'}</p>
       </div>`;

  overlay.innerHTML = `
    <div class="story-viewer-card">
      <div class="story-progress-bar">
        <div class="story-progress-fill" id="storyProgressFill"></div>
      </div>
      <div class="story-viewer-top">
        <div class="story-viewer-brand">
          <div class="viewer-brand-icon">🌸</div>
          <div class="viewer-brand-info">
            <p>Shashap</p>
            <small>${story.category||'Produit'}</small>
          </div>
        </div>
        <button class="story-viewer-close-btn" onclick="closeStoryViewer()">✕</button>
      </div>
      <div class="story-viewer-img-zone">${imgZone}</div>
      <div class="story-viewer-body">
        <div class="viewer-cat-label"><span class="viewer-cat-dot"></span>${story.category||''}</div>
        <div class="viewer-product-name">${story.name||'Sans nom'}</div>
        <div class="viewer-price-row">
          <span class="viewer-price-main">${fmtPrice(hasPromo ? discounted : story.price)}</span>
          <span class="viewer-price-unit">FCFA</span>
          ${hasPromo ? `<span class="viewer-old-price">${fmtPrice(story.price)} FCFA</span>
                        <span class="viewer-promo-chip">${story.promo}</span>` : ''}
        </div>
        <div class="story-viewer-cta">
          <button class="btn-view" onclick="closeStoryViewer()">🛒 Voir le produit</button>
        </div>
      </div>
      <div class="story-dots">
        ${storiesData.map((_,i) =>
          `<div class="story-dot ${i===index?'active':''}"
               onclick="event.stopPropagation();jumpToStory(${i})"></div>`).join('')}
      </div>
      ${storiesData.length > 1 ? `
        ${index > 0 ? `<button class="story-nav-prev" onclick="event.stopPropagation();prevStory()">‹</button>` : ''}
        ${index < storiesData.length-1 ? `<button class="story-nav-next" onclick="event.stopPropagation();nextStory()">›</button>` : ''}
      ` : ''}
    </div>`;

  // Reset barre de progression (force re-animation CSS)
  const fill = overlay.querySelector('#storyProgressFill');
  if (fill) {
    const clone = fill.cloneNode(true);
    fill.parentNode.replaceChild(clone, fill);
    void clone.offsetHeight; // reflow
    clone.style.animation = 'progress-fill 4s linear forwards';
  }

  storiesData[index].seen = true;
  saveStoriesToStorage();
  renderStories();

  clearTimeout(viewerAutoClose);
  viewerAutoClose = setTimeout(
    () => index < storiesData.length - 1 ? nextStory() : closeStoryViewer(),
    4000
  );
}

function nextStory() {
  if (viewerCurrentIndex < storiesData.length - 1) {
    viewerCurrentIndex++;
    const ov = document.getElementById('storyViewerOverlay');
    if (ov) renderViewerContent(ov, viewerCurrentIndex);
  } else closeStoryViewer();
}

function prevStory() {
  if (viewerCurrentIndex > 0) {
    viewerCurrentIndex--;
    const ov = document.getElementById('storyViewerOverlay');
    if (ov) renderViewerContent(ov, viewerCurrentIndex);
  }
}

function jumpToStory(i) {
  viewerCurrentIndex = i;
  const ov = document.getElementById('storyViewerOverlay');
  if (ov) renderViewerContent(ov, i);
}

function closeStoryViewer() {
  clearTimeout(viewerAutoClose);
  const ov = document.getElementById('storyViewerOverlay');
  if (!ov) return;
  ov.classList.remove('active');
  setTimeout(() => ov.remove(), 320);
}

// ── Gestionnaire de stories (modal) ──────────────────────────
function openStoryManager() {
  axios.get(API + '/products').then(res => {
    allProductsForStories = res.data || [];
    const storyIds = storiesData.map(s => s.id);

    let modal = document.getElementById('storyManagerModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id        = 'storyManagerModal';
      modal.className = 'modal';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div class="modal-content" style="max-width:580px;">
        <div class="modal-header">
          <h3>📱 Gestion des Stories</h3>
          <button class="close-btn" onclick="closeStoryManager()">✕</button>
        </div>
        <p style="font-size:13px;color:#aaa;margin-bottom:13px;">
          Sélectionnez les produits à afficher. Vous pouvez ajouter une promotion.
        </p>
        <div class="story-manager-list" id="storyManagerList"></div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeStoryManager()">Annuler</button>
          <button class="btn btn-primary" onclick="saveStories()">💾 Enregistrer les stories</button>
        </div>
      </div>`;
    modal.style.display = 'flex';

    const list = document.getElementById('storyManagerList');
    list.innerHTML = allProductsForStories.map(p => {
      const selected    = storyIds.includes(p.id);
      const storyIdx    = storiesData.findIndex(s => s.id === p.id);
      const order       = storyIdx !== -1 ? '#' + (storyIdx+1) : '—';
      const currentPromo = storyIdx !== -1 ? (storiesData[storyIdx].promo || '') : '';
      const imgSrc      = freshImg(p.imageUrl);
      return `
        <div class="story-manager-item ${selected ? 'selected' : ''}" id="smitem-${p.id}">
          ${imgSrc
            ? `<img src="${imgSrc}"
                   onerror="this.outerHTML='<span style=font-size:28px;>${getCategoryEmoji(p.category)}</span>'"
                   alt="${p.name||''}" style="width:44px;height:44px;border-radius:11px;object-fit:cover;flex-shrink:0;">`
            : `<div style="width:44px;height:44px;border-radius:11px;background:linear-gradient(135deg,#fce4ec,#f8f0f6);
                            display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">
                 ${getCategoryEmoji(p.category)}
               </div>`}
          <div class="item-info">
            <div class="item-name">${p.name||'Sans nom'}</div>
            <div class="item-cat">${p.category||''} · ${fmtPrice(p.price)} FCFA</div>
          </div>
          <span class="item-order" id="smorder-${p.id}">${selected ? order : '—'}</span>
          <select class="promo-select" data-id="${p.id}" style="display:${selected ? 'inline-block' : 'none'};">
            <option value="">Aucune promo</option>
            ${['-10%','-15%','-20%','-25%','-30%'].map(v =>
              `<option value="${v}" ${currentPromo===v ? 'selected':''}>${v}</option>`).join('')}
          </select>
          <input type="checkbox" class="story-checkbox" data-id="${p.id}" ${selected ? 'checked' : ''}
                 style="accent-color:var(--rose);">
        </div>`;
    }).join('');

    // Events checkboxes
    list.querySelectorAll('.story-checkbox').forEach(cb => {
      cb.addEventListener('change', function() {
        const id     = parseInt(this.dataset.id);
        const promoSel = list.querySelector(`.promo-select[data-id="${id}"]`);
        const item   = document.getElementById('smitem-' + id);
        if (this.checked) {
          promoSel.style.display = 'inline-block';
          item.classList.add('selected');
          const product = allProductsForStories.find(p => p.id === id);
          if (product && !storiesData.find(s => s.id === id)) {
            storiesData.push({
              id: product.id, name: product.name,
              image: product.imageUrl||null, category: product.category,
              price: product.price, promo: promoSel.value||null, seen: false,
            });
          }
        } else {
          promoSel.style.display = 'none';
          item.classList.remove('selected');
          storiesData = storiesData.filter(s => s.id !== id);
        }
        // Mise à jour ordres
        list.querySelectorAll('.story-checkbox').forEach(c2 => {
          const i2  = parseInt(c2.dataset.id);
          const si  = storiesData.findIndex(s => s.id === i2);
          const el  = document.getElementById('smorder-' + i2);
          if (el) el.textContent = c2.checked && si !== -1 ? '#' + (si+1) : '—';
        });
        saveStoriesToStorage();
        renderStories();
      });
    });

    // Events promo selects
    list.querySelectorAll('.promo-select').forEach(sel => {
      sel.addEventListener('change', function() {
        const id    = parseInt(this.dataset.id);
        const story = storiesData.find(s => s.id === id);
        if (story) { story.promo = this.value || null; saveStoriesToStorage(); renderStories(); }
      });
    });

  }).catch(() => showToast('❌ Erreur chargement produits', 'error'));
}
// Fonction d'ouverture de l'analyse d'audience
function openStoryAnalytics(index) {
  const story = storiesData ? storiesData[index] : null; // Connecté sur ton vrai tableau
  if (!story) return;

  document.getElementById('analyticsStoryTitle').innerText = `🔥 Story : ${story.name || 'Produit'}`;
  document.getElementById('analyticsTotalViews').innerText = `${story.viewsCount || 0} vues`;

  const container = document.getElementById('analyticsViewersList');
  if (!container) return;
  container.innerHTML = '';

  if (!story.viewers || story.viewers.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:30px 10px; color:#b5b5c3;">
        <div style="font-size:24px; margin-bottom:5px;">⏳</div>
        <div style="font-size:12.5px; font-weight:500;">Aucun visionnage pour le moment</div>
      </div>`;
  } else {
    container.innerHTML = story.viewers.map(viewer => {
      let letter = viewer.name ? viewer.name.trim().charAt(0).toUpperCase() : "C";
      return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 11px 14px; background: #fff; border: 1px solid #f3edf1; border-radius: 14px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; background: #fff0f5; color: #E91E63; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; border: 1px solid #fce4ec;">
            ${letter}
          </div>
          <div>
            <div style="font-size: 13px; font-weight: 700; color: #1e1e2f;">${viewer.name}</div>
            <div style="font-size: 11px; color: #9c9cb2; margin-top: 1px;">${viewer.phone || 'Pas de numéro'}</div>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 10px; font-weight: 700; color: ${viewer.color || '#E91E63'}; background: ${viewer.color || '#E91E63'}12; padding: 2px 8px; border-radius: 10px; display: inline-block;">
            ${viewer.badge || 'Client'}
          </span>
          <div style="font-size: 10px; color: #b5b5c3; margin-top: 3px;">${viewer.time || 'Récemment'}</div>
        </div>
      </div>`;
    }).join('');
  }

  const modal = document.getElementById('storyAnalyticsModal');
  if (modal) modal.style.display = 'flex';
}

function closeStoryAnalytics() {
  document.getElementById('storyAnalyticsModal').style.display = 'none';
}

function saveStories() {
    saveStoriesToStorage();
    renderStories();
    closeStoryManager();

    // ✅ SYNCHRONISER AVEC LE BACKEND POUR L'APP ANDROID
    syncStoriesToBackend();

    showToast('✅ Stories enregistrées et synchronisées');
}
function closeStoryManager() { const m = document.getElementById('storyManagerModal'); if (m) m.style.display = 'none'; }

// ============================================================
// SÉLECTION MULTIPLE (bulk)
// ============================================================
function toggleProductSelection(id, checked) {
  if (checked && !selectedProducts.includes(id)) selectedProducts.push(id);
  else selectedProducts = selectedProducts.filter(p => p !== id);
  updateBulkActions();
}

function toggleAllProducts(checked) {
  document.querySelectorAll('.product-checkbox').forEach(cb => {
    cb.checked = checked;
    const id   = parseInt(cb.value);
    if (checked && !selectedProducts.includes(id)) selectedProducts.push(id);
    else if (!checked) selectedProducts = selectedProducts.filter(p => p !== id);
  });
  updateBulkActions();
}

function updateBulkActions() {
  const el = document.getElementById('bulkActions');
  if (!el) return;
  el.style.display = selectedProducts.length ? 'flex' : 'none';
  const cnt = document.getElementById('selectedCount');
  if (cnt) cnt.textContent = selectedProducts.length + ' produit(s) sélectionné(s)';
}

function clearSelection() {
  selectedProducts = [];
  document.querySelectorAll('.product-checkbox').forEach(cb => cb.checked = false);
  updateBulkActions();
}

async function bulkActivate() {
  for (const id of selectedProducts) await axios.put(API + '/products/' + id, { isAvailable: true });
  showToast(`✅ ${selectedProducts.length} activé(s)`);
  clearSelection(); loadProducts();
}

async function bulkDeactivate() {
  for (const id of selectedProducts) await axios.put(API + '/products/' + id, { isAvailable: false });
  showToast(`✅ ${selectedProducts.length} désactivé(s)`, 'info');
  clearSelection(); loadProducts();
}

async function bulkDelete() {
  if (!confirm(`Supprimer ${selectedProducts.length} produits ?`)) return;
  for (const id of selectedProducts) await axios.delete(API + '/products/' + id);
  showToast(`✅ ${selectedProducts.length} supprimé(s)`);
  clearSelection(); loadProducts();
}

// ============================================================
// CLIENTS
// ============================================================
async function loadClients() {
  try {
    const res = await axios.get(API + '/clients');
    const c   = document.getElementById('clientsList');
    if (!c) return;
    if (!res.data.length) {
      c.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><p>Aucun client trouvé</p></div>';
      return;
    }
    c.innerHTML = `
      <table class="clients-table">
        <thead><tr>
          <th>ID</th><th>Nom</th><th>Téléphone</th>
          <th>Commandes</th><th>Total dépensé</th><th>Statut</th>
        </tr></thead>
        <tbody>${res.data.map(cl => `
          <tr>
            <td><span class="id-pill">${cl.id}</span></td>
            <td>
              <div class="client-chip">
                <div class="client-avatar">${initials(cl.nom)}</div>
                <strong>${cl.nom}</strong>
              </div>
            </td>
            <td style="color:#777;">${cl.telephone}</td>
            <td style="font-weight:800;color:#1565C0;">${cl.nombreCommandes || 0}</td>
            <td class="amount-text">${fmtPrice(cl.totalDepense)} FCFA</td>
            <td>
              <span class="status-badge" style="background:#e8f5e9;color:#1b5e20;">
                ${cl.statut || 'ACTIF'}
              </span>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (e) { console.error('Clients:', e); }
}

function searchClients() {
  const q = (document.getElementById('searchClient')?.value || '').toLowerCase();
  document.querySelectorAll('#clientsList tbody tr').forEach(r => {
    r.style.display = r.innerText.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ============================================================
// UPDATE STATUS COMMANDE
// ============================================================
async function updateStatus(id, status) {
  try {
    await axios.put(API + '/orders/' + id + '/status', { status: status });
    loadOrders();
    loadDashboard();
    showToast('✅ Statut mis à jour');
  } catch (e) {
    showToast('❌ Erreur : ' + e.message, 'error');
  }
}

// ============================================================
// CRUD PRODUITS
// ============================================================
function openProductModal() {
  // On ajoute 'productImageFile' à la liste des éléments à vider
  ['productId','productName','productPrice','productImageUrl','productImageFile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const cat  = document.getElementById('productCategory');
  if (cat)   cat.value   = 'Burger';
  const av   = document.getElementById('productAvailable');
  if (av)    av.checked  = true;

  // Réinitialisation de l'aperçu
  const prev = document.getElementById('imagePreview');
  if (prev)  { prev.style.display = 'none'; prev.src = ''; }

  // On fait réapparaître le texte et l'icône de la DropZone
  const dropZone = document.getElementById('dropZone');
  if (dropZone) {
    dropZone.querySelectorAll('.drop-icon, p').forEach(el => el.style.display = 'block');
  }

  const title = document.getElementById('modalTitle');
  if (title)  title.textContent = '➕ Ajouter un produit';
  const modal = document.getElementById('productModal');
  if (modal)  modal.style.display = 'flex';
}
function closeModal() {
  const m = document.getElementById('productModal');
  if (m) m.style.display = 'none';
}

function closeDeleteModal() {
  const m = document.getElementById('deleteModal');
  if (m) m.style.display = 'none';
}

async function editProduct(id) {
  const p = allProducts.find(p => p.id === id);
  if (!p) return;
  const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val; };
  set('productId',       p.id);
  set('productName',     p.name);
  set('productCategory', p.category);
  set('productPrice',    p.price);
  set('productImageUrl', p.imageUrl || '');

  // Au lieu de: const src = freshImg(p.imageUrl);
    // On prend directement l'URL du produit
    const prev = document.getElementById('imagePreview');
    if (prev) {
      if (p.imageUrl) {
        prev.src = p.imageUrl;
        prev.style.display = 'block';
        // On cache le texte de la dropzone puisqu'il y a déjà une image
        document.getElementById('dropZone').querySelectorAll('.drop-icon, p').forEach(el => el.style.display = 'none');
      } else {
        prev.style.display = 'none';
      }
    }
  const av = document.getElementById('productAvailable');
  if (av)   av.checked = p.isAvailable;
  const title = document.getElementById('modalTitle');
  if (title)  title.textContent = '✏️ Modifier le produit';
  const modal = document.getElementById('productModal');
  if (modal)  modal.style.display = 'flex';
}

async function saveProduct() {
  const id = document.getElementById('productId')?.value;
  const fileInput = document.getElementById('productImageFile');
  let imageUrl = document.getElementById('productImageUrl')?.value || null;

  // 1. 🚀 SI UN FICHIER PHYSIQUE EST SÉLECTIONNÉ (DropZone ou Clic)
  if (fileInput && fileInput.files && fileInput.files[0]) {
    try {
      showToast('⏳ Téléchargement de l\'image...');

      // On prépare le fichier dans un format FormData pour Spring Boot
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      // On appelle ta route d'upload @PostMapping("/upload")
      const uploadResponse = await axios.post(API + '/products/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Spring Boot renvoie le chemin de l'image (ex: /api/products/uploads/un-nom-uuid.png)
      imageUrl = uploadResponse.data;

    } catch (uploadError) {
      showToast('❌ Erreur lors du stockage de l\'image : ' + uploadError.message, 'error');
      return; // On arrête tout si l'upload échoue
    }
  }

  // 2. 📝 CONSTITUTION DE L'OBJET PRODUIT
  const product = {
    name      : document.getElementById('productName')?.value,
    category  : document.getElementById('productCategory')?.value,
    price     : parseFloat(document.getElementById('productPrice')?.value),
    imageUrl  : imageUrl, // Sera soit l'URL collée au clavier, soit le lien du fichier uploadé !
    isAvailable: document.getElementById('productAvailable')?.checked,
  };

  if (!product.name || !product.price) {
    showToast('⚠️ Nom et prix obligatoires', 'error');
    return;
  }

  // 3. 💾 ENREGISTREMENT DANS LA BASE DE DONNÉES
  try {
    if (id) {
      await axios.put(API + '/products/' + id, product);
      showToast('✅ Produit modifié');
    } else {
      await axios.post(API + '/products', product);
      showToast('✅ Produit ajouté');
    }
    closeModal();
    await loadProducts();
  } catch (e) {
    showToast('❌ Erreur : ' + e.message, 'error');
  }
}

let deleteTargetId = null;

async function deleteProduct(id) {
  const p  = allProducts.find(p => p.id === id);
  const dm = document.getElementById('deleteModal');
  if (dm && p) {
    const nameEl = document.getElementById('deleteProductName');
    if (nameEl)   nameEl.textContent = '"' + p.name + '"';
    deleteTargetId = id;
    dm.style.display = 'flex';
  } else {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await axios.delete(API + '/products/' + id);
      await loadProducts();
      showToast('✅ Produit supprimé');
    } catch (e) {
      showToast('❌ Erreur : ' + e.message, 'error');
    }
  }
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  try {
    await axios.delete(API + '/products/' + deleteTargetId);
    await loadProducts();
    showToast('✅ Produit supprimé');
    closeDeleteModal();
    deleteTargetId = null;
  } catch (e) {
    showToast('❌ Erreur : ' + e.message, 'error');
  }
}

// ============================================================
// URL → BASE64 (pour export PDF)
// ============================================================
function urlToBase64(url) {
  return new Promise(resolve => {
    if (!url || typeof url !== 'string' || url === 'null' || url.trim() === '') { resolve(null); return; }
    if (url.startsWith('data:image')) { resolve(url); return; }

    const img        = new Image();
    const isExternal = url.startsWith('http://') || url.startsWith('https://');
    if (isExternal)  img.crossOrigin = 'Anonymous';

    img.onload = function() {
      try {
        const canvas   = document.createElement('canvas');
        canvas.width   = img.naturalWidth  || img.width;
        canvas.height  = img.naturalHeight || img.height;
        if (!canvas.width || !canvas.height) { resolve(null); return; }
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch (e) { console.warn('Canvas tainted:', e); resolve(null); }
    };
    img.onerror = () => resolve(null);

    img.src = isExternal
      ? url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now()
      : url;
  });
}
// ===== SYNCHRONISER LES STORIES AVEC LE BACKEND (POUR L'APP ANDROID) =====
async function syncStoriesToBackend() {
    try {
        const payload = storiesData.map((s, i) => ({
            name: s.name || "Sans nom",
            imageUrl: s.image || "",
            imageResId: 0,                    // ✅ Toujours un int
            promoLabel: s.promo || "",        // ✅ Chaîne vide au lieu de null
            originalPrice: s.price || 0,      // ✅ Toujours un int
            discountedPrice: s.promo ? Math.round((s.price || 0) * (1 - parseInt(s.promo) / 100)) : (s.price || 0), // ✅ Toujours un int
            isSeen: s.seen || false           // ✅ Toujours un boolean
        }));

        console.log('📤 Envoi synchro stories:', JSON.stringify(payload));

        const response = await axios.post(API + '/products/stories/sync', payload);
        console.log('✅ ' + payload.length + ' stories synchronisées - Réponse:', response.data);
    } catch (e) {
        console.error('❌ Erreur synchro stories:', e.response ? e.response.data : e.message);
    }
}


// ============================================================
// EXPORT PDF CATALOGUE
// ============================================================
// ============================================================
// 📥 EXPORT DU CATALOGUE INTERACTIF PRESTIGE (CORRIGÉ NET)
// ============================================================
async function exportTablePDF() {
  try {
    if (!window.jspdf) {
      showToast("Erreur : jsPDF n'est pas chargé", 'error');
      return;
    }

    const products = allProducts.filter(p => p.isAvailable);
    if (!products.length) {
      showToast("Aucun produit disponible pour l'export", 'error');
      return;
    }

    showToast('Génération de l\'expérience premium...', 'info');

    // 1. Chargement asynchrone des images rondes et du QR Code artistique
    const menuUrl = 'https://shapshap-admin-malik.up.railway.app';
    const [qrCodeImg] = await Promise.all([
      fetchQrCodeBase64(menuUrl),
      ...products.map(async (p) => {
        p._cachedImg = p.imageUrl ? await urlToCircleBase64(p.imageUrl) : null;
      })
    ]);

    const doc = new jspdf.jsPDF('p', 'mm', 'a4');
    const pW = 210, pH = 297, mg = 15, IMG = 22;
    const HY = 42; // Zone de sécurité : le contenu commence strictement à 42mm pour éviter la superposition

    // ── TEMPLATE DE L'EN-TÊTE DE PAGE LUXE (Inclus sur toutes les pages) ──
    const drawHeader = () => {
      // Le petit trait rose caractéristique parfaitement positionné
      doc.setFillColor(233, 30, 99);
      doc.rect(mg, 12, 12, 2.5, 'F');

      // Titre principal et sous-titre de la marque
      doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(24, 24, 35);
      doc.text('SHASHAP', mg, 22);

      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(140, 140, 155);
      doc.text('LA CARTE DES SAVEURS', mg, 27);

      // Date d'édition à droite parfaitement alignée
      doc.setFontSize(8);
      doc.text('Édition du ' + new Date().toLocaleDateString('fr-FR'), pW - mg, 22, { align: 'right' });

      // Ligne fine de séparation de l'en-tête
      doc.setDrawColor(242, 230, 235); doc.setLineWidth(0.2);
      doc.line(mg, 32, pW - mg, 32);
    };

    // ── 1. PAGE DE COUVERTURE DU CATALOGUE ───────────────────
    doc.setFillColor(255, 252, 253); doc.rect(0, 0, pW, pH, 'F');
    doc.setFillColor(253, 235, 241); doc.rect(0, 0, pW, 55, 'F');

    // Grand macaron de marque central
    const lx = pW / 2, ly = 85, lr = 20;
    doc.setFillColor(233, 30, 99); doc.circle(lx, ly, lr, 'F');
    doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.8);
    doc.circle(lx, ly + 0.2, lr - 3, 'S');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(28); doc.setTextColor(255, 255, 255);
    doc.text('S', lx, ly + 5, { align: 'center' });

    // Titres de couverture
    doc.setFontSize(38); doc.setTextColor(24, 24, 35); doc.setFont('helvetica', 'bold');
    doc.text('SHASHAP', pW / 2, 122, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(140, 140, 155);
    doc.text("L'ART DE LA GASTRONOMIE", pW / 2, 131, { align: 'center' });
    doc.setFillColor(233, 30, 99); doc.rect(pW / 2 - 15, 138, 30, 0.7, 'F');
    doc.setFontSize(9); doc.setTextColor(100, 100, 115);
    doc.text('Découvrez ' + products.length + ' créations exclusives', pW / 2, 148, { align: 'center' });

    // Intégration du QR Code Haute Définition cliquable et stylisé
    const qrS = 32, qrX = pW - mg - qrS, qrY = pH - mg - qrS - 12;
    doc.setFillColor(253, 235, 241); doc.roundedRect(qrX, qrY, qrS, qrS, 2, 2, 'F');

    if (qrCodeImg) {
      doc.addImage(qrCodeImg, 'PNG', qrX + 1.5, qrY + 1.5, qrS - 3, qrS - 3);
    } else {
      doc.setDrawColor(233, 30, 99); doc.setLineWidth(0.4); doc.roundedRect(qrX, qrY, qrS, qrS, 2, 2, 'S');
      doc.setFontSize(6.5); doc.setTextColor(233, 30, 99); doc.setFont('helvetica', 'bold');
      doc.text('SCANNER', qrX + qrS / 2, qrY + 13, { align: 'center' });
    }
    doc.link(qrX, qrY, qrS, qrS, { url: menuUrl });

    // Pied de page de couverture
    doc.setFillColor(248, 235, 241); doc.rect(0, pH - 22, pW, 22, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(160, 100, 120);
    doc.text('CARTE OFFICIELLE DES SÉLECTIONS', mg, pH - 13);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(233, 30, 99);
    doc.text(products.length + ' CRÉATIONS EXCLUSIVES', mg, pH - 7);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(180, 140, 155);
    doc.text('Édition du ' + new Date().toLocaleDateString('fr-FR'), pW - mg, pH - 7, { align: 'right' });

    // ── 2. ENCHAÎNEMENT DES PAGES DU MENU ───────────────────
    doc.addPage();
    drawHeader();

    const sections = {};
    products.forEach(p => {
      const cat = (p.category || 'LES INCONTOURNABLES').toUpperCase();
      if (!sections[cat]) sections[cat] = [];
      sections[cat].push(p);
    });

    let curY = HY;
    const cellH = IMG + 6;

    for (const [sec, prods] of Object.entries(sections)) {
      if (curY > pH - 45) {
        doc.addPage();
        drawHeader();
        curY = HY;
      }

      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(233, 30, 99);
      doc.text('— ' + sec + ' —', pW / 2, curY + 6, { align: 'center' });
      curY += 12;

      doc.autoTable({
        startY: curY,
        head: [['VISUEL', 'DESCRIPTION DU CHEF-D\'ŒUVRE', 'TARIF UNIQUE']],
        body: prods.map(p => [
          '',
          (p.name || 'CRÉATION').toUpperCase(),
          p.price ? Number(p.price).toLocaleString('fr-FR') + ' FCFA' : '—'
        ]),
        theme: 'striped',
        margin: { top: HY, left: mg, right: mg },
        headStyles: {
          fillColor: [255, 255, 255], textColor: [180, 130, 150],
          fontStyle: 'bold', fontSize: 7.5, valign: 'middle'
        },
        bodyStyles: {
          minCellHeight: cellH, fontSize: 10, textColor: [45, 45, 55],
          valign: 'middle', lineColor: [248, 240, 244], lineWidth: 0.2,
          cellPadding: { top: 3, right: 4, bottom: 3, left: 4 }
        },
        alternateRowStyles: { fillColor: [255, 252, 254] },
        columnStyles: {
          0: { cellWidth: 32, halign: 'center', valign: 'middle' },
          1: { cellWidth: 108, fontStyle: 'bold', valign: 'middle' },
          2: { cellWidth: 40, halign: 'right', textColor: [233, 30, 99], fontStyle: 'bold', fontSize: 10.5 },
        },
        willDrawCell(d) {
          if (d.section === 'head') {
            doc.setDrawColor(233, 30, 99); doc.setLineWidth(0.5);
            doc.line(d.cell.x, d.cell.y + d.cell.height, d.cell.x + d.cell.width, d.cell.y + d.cell.height);
          }
        },
        didDrawCell(d) {
          if (d.column.index === 0 && d.section === 'body') {
            const p = prods[d.row.index];
            const xo = d.cell.x + (d.cell.width - IMG) / 2;
            const yo = d.cell.y + (d.cell.height - IMG) / 2;

            doc.setFillColor(253, 245, 248);
            doc.circle(xo + IMG/2, yo + IMG/2, IMG/2, 'F');

            if (p && p._cachedImg) {
              try {
                doc.addImage(p._cachedImg, 'PNG', xo, yo, IMG, IMG);
              } catch (e) {
                console.warn(e);
              }
            }

            // Liseré rose artistique de présentation autour de l'image
            doc.setDrawColor(233, 30, 99);
            doc.setLineWidth(0.25);
            doc.circle(xo + IMG/2, yo + IMG/2, IMG/2, 'S');
          }
          if (d.column.index === 1 && d.section === 'body') {
            const p = prods[d.row.index];
            if (p && p.name) {
              doc.link(d.cell.x, d.cell.y, d.cell.width, d.cell.height, {
                url: 'https://shashap.com/menu?search=' + encodeURIComponent(p.name)
              });
            }
          }
        },
        didDrawPage() {
          const activePage = doc.internal.getNumberOfPages();
          doc.setPage(activePage);
          drawHeader();
        }
      });
      curY = doc.lastAutoTable.finalY + 10;
    }

    // ── 3. COMPTEURS DE PAGES ET FINITION DES PIEDS DE PAGE ──
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      doc.setPage(i);

      // Ligne inférieure fine du footer (Le double cercle central perturbateur a été supprimé ici 🛠️)
      doc.setDrawColor(238, 218, 226); doc.setLineWidth(0.25);
      doc.line(mg, pH - 14, pW - mg, pH - 14);

      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(170, 145, 158);
      doc.text('Maison Shashap — Haute Cuisine & Prestige', mg, pH - 9);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(233, 30, 99);
      doc.text('Page ' + (i - 1) + ' / ' + (totalPages - 1), pW - mg, pH - 9, { align: 'right' });
    }

    doc.save('Catalogue_Shashap_' + new Date().toISOString().split('T')[0] + '.pdf');
    showToast('Catalogue sublime et corrigé prêt !', 'success');

  } catch (error) {
    console.error('Erreur PDF :', error);
    showToast('Échec : ' + error.message, 'error');
  }
}

// ============================================================
// 🖼️ CONVERTISSEUR ET DÉCOUPEUR D'IMAGE EN CERCLE PARFAIT
// ============================================================
function urlToCircleBase64(url) {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string' || url === 'null' || url.trim() === '') {
      resolve(null);
      return;
    }

    const img = new Image();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      img.crossOrigin = 'Anonymous';
    }

    img.onload = function() {
      const canvas = document.createElement('canvas');
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }

      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

      try {
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        resolve(null);
      }
    };

    img.onerror = function() { resolve(null); };

    if (url.startsWith('http://') || url.startsWith('https://')) {
      img.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
    } else {
      img.src = url;
    }
  });
}

// ============================================================
// 🎨 GÉNÉRATEUR DYNAMIQUE DE QR CODE TEXTURÉ ARTISTIQUE
// ============================================================
function fetchQrCodeBase64(targetUrl) {
  return new Promise((resolve) => {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(targetUrl)}&color=e91e63&bgcolor=fff2f6&qzone=1`;

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }

      ctx.drawImage(img, 0, 0);
      try {
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        resolve(null);
      }
    };

    img.onerror = function() { resolve(null); };
    img.src = qrApiUrl;
  });
}