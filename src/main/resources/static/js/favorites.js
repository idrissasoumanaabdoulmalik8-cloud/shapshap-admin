// ================================================================
// ❤️ FAVORIS - Gestion des produits likés par client
// ================================================================

const FAVORITES_API = API + '/favorites';

async function loadFavorites() {
    const container = document.getElementById('favoritesList');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align:center; padding: 40px; color: #888;">
            <div class="spinner">❤️</div>
            Chargement des favoris...
        </div>`;

    try {
        const clientsRes = await axios.get(API + '/clients');
        const clients = clientsRes.data || [];
        let totalFavs = 0;
        let cardsHtml = '';

        for (const client of clients) {
            const favRes = await axios.get(API + '/favorites/' + client.telephone + '/ids');
            const favIds = favRes.data || [];

            if (favIds.length > 0) {
                totalFavs += favIds.length;
                const productsRes = await axios.get(API + '/products');
                const allProducts = productsRes.data || [];
                const favProducts = allProducts.filter(p => favIds.includes(p.id));

                cardsHtml += `
                    <div class="fav-card">
                        <div class="fav-header">
                            <div class="fav-avatar">${(client.nom || 'C').charAt(0).toUpperCase()}</div>
                            <div class="fav-info">
                                <strong>${client.nom}</strong>
                                <div class="fav-phone">📱 ${client.telephone}</div>
                            </div>
                            <span class="fav-badge">❤️ ${favIds.length}</span>
                        </div>
                        <div class="fav-items">
                            ${favProducts.map(p => `
                                <div class="fav-item">
                                    <div class="fav-item-icon">🍔</div>
                                    <span class="fav-item-name">${p.name}</span>
                                    <span class="fav-item-price">${p.price} FCFA</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>`;
            }
        }

        document.getElementById('favoritesStats').textContent = totalFavs + ' favori' + (totalFavs > 1 ? 's' : '');

        container.innerHTML = cardsHtml
            ? `<div class="favorites-grid">${cardsHtml}</div>`
            : `<div style="text-align:center; padding:50px; color:#aaa;">❤️ Aucun favori trouvé</div>`;

    } catch (e) {
        container.innerHTML = `<div style="text-align:center; padding:30px; color:#e53935;">❌ Erreur</div>`;
    }
}