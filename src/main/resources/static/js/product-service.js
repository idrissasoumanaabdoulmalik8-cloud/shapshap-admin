// API URL
const API_URL = 'https://shapshap-admin-malik.up.railway.app/api';
// Service Produits
const ProductService = {
    // Récupérer tous les produits
    async getAll() {
        try {
            const response = await axios.get(`${API_URL}/products`);
            return response.data;
        } catch (error) {
            console.error('Erreur chargement produits:', error);
            return [];
        }
    },

    // Récupérer un produit par ID
    async getById(id) {
        try {
            const response = await axios.get(`${API_URL}/products/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur chargement produit:', error);
            return null;
        }
    },

    // Créer un produit
    async create(product) {
        try {
            const response = await axios.post(`${API_URL}/products`, product);
            return response.data;
        } catch (error) {
            console.error('Erreur création produit:', error);
            throw error;
        }
    },

    // Modifier un produit
    async update(id, product) {
        try {
            const response = await axios.put(`${API_URL}/products/${id}`, product);
            return response.data;
        } catch (error) {
            console.error('Erreur modification produit:', error);
            throw error;
        }
    },

    // Supprimer un produit
    async delete(id) {
        try {
            await axios.delete(`${API_URL}/products/${id}`);
            return true;
        } catch (error) {
            console.error('Erreur suppression produit:', error);
            throw error;
        }
    }
};