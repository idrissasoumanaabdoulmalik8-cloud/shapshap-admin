// ================================================================
// ❤️ FAVORIS - Gestion des produits likés par client
// ================================================================

const FAVORITES_API = API + '/favorites';

async function loadFavorites() {
    const container = document.getElementById('favoritesList');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align:center; padding: 40px; color: #888;">
            <div class="spinner" style="margin-bottom:10px;">❤️</div>
            Chargement des favoris...
        </div>`;

    try {
        const clientsRes = await axios.get(API + '/clients');
        const clients = clientsRes.data || [];
        let html = '';

        if (clients.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 50px; color: #aaa;">
                    📭 Aucun client enregistré
                </div>`;
            return;
        }

        for (const client of clients) {
            try {
                const favRes = await axios.get(FAVORITES_API + '/' + client.telephone + '/ids');
                const favIds = favRes.data || [];

                if (favIds.length > 0) {
                    // Récupérer les produits favoris pour avoir leurs noms
                    const productsRes = await axios.get(API + '/products');
                    const allProducts = productsRes.data || [];
                    const favProducts = allProducts.filter(p => favIds.includes(p.id));

                    html += `
                        <div class="favorite-client-card">
                            <div class="fav-client-header">
                                <div class="fav-client-avatar">${client.nom.charAt(0).toUpperCase()}</div>
                                <div>
                                    <strong>${client.nom}</strong>
                                    <div style="font-size:12px; color:#888;">📱 ${client.telephone}</div>
                                </div>
                                <span class="fav-count">${favIds.length} ❤️</span>
                            </div>
                            <div class="fav-products-list">
                                ${favProducts.map(p => `
                                    <div class="fav-product-item">
                                        <span>🍔</span>
                                        <span style="flex:1;">${p.name}</span>
                                        <span style="color:#E91E63; font-weight:bold;">${p.price} FCFA</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>`;
                }
            } catch (e) {
                console.error('Erreur chargement favoris pour', client.telephone, e);
            }
        }

        container.innerHTML = html || `
            <div style="text-align:center; padding: 50px; color: #aaa;">
                ❤️ Aucun favori trouvé
            </div>`;

    } catch (error) {
        console.error('Erreur chargement favoris:', error);
        container.innerHTML = `
            <div style="text-align:center; padding: 30px; color: #e53935;">
                ❌ Erreur de chargement
            </div>`;
    }
}