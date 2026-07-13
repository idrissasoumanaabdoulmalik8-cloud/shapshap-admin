import { ImageManager } from './ImageManager.js';

export class PosterEditor {
  constructor(containerId) {
    // Configuration de l'export final
    this.POSTER_WIDTH = 1080;
    this.POSTER_HEIGHT = 1920;

    // Récupération du conteneur principal
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`PosterEditor: Conteneur #${containerId} introuvable.`);
      return;
    }

    // Ciblage des éléments du DOM
    this.fileInput = this.container.querySelector('#file-upload');
    this.urlInput = this.container.querySelector('#url-input');
    this.urlBtn = this.container.querySelector('#url-import-btn');
    this.exportBtn = this.container.querySelector('#export-btn');
    this.previewImg = this.container.querySelector('#poster-preview');
    this.loadingText = this.container.querySelector('#loading-text');
    this.errorText = this.container.querySelector('#error-text');

    // Initialisation du Moteur de Traitement (Core)
    this.imageManager = new ImageManager('/images/placeholder.png');

    // Lancement des écouteurs d'événements
    this.bindEvents();
  }

  /**
   * Attache les événements aux éléments HTML
   */
  bindEvents() {
    this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    this.urlBtn.addEventListener('click', () => this.handleUrlLoad());
    this.exportBtn.addEventListener('click', () => this.handleExport());
  }

  /**
   * Logique centrale de chargement et mise à jour de l'UI
   */
  async loadImage(source) {
    this.setLoading(true);

    const result = await this.imageManager.load(source);

    if (result.success) {
      this.previewImg.src = result.url;
      this.setError(null);
    } else {
      this.previewImg.src = result.url; // Affiche l'image de fallback
      this.setError("Impossible de charger l'image. Format non supporté ou sécurité CORS.");
    }

    this.setLoading(false);
  }

  /**
   * Événement : Choix d'un fichier local
   */
  handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      this.loadImage(file);
    }
  }

  /**
   * Événement : Clic sur "Importer URL"
   */
  handleUrlLoad() {
    const url = this.urlInput.value.trim();
    if (url) {
      this.loadImage(url);
    }
  }

  /**
   * Événement : Export en HD
   */
  handleExport() {
    // On génère la base64 exacte avec la résolution finale souhaitée (Smart Crop appliqué)
    const base64Data = this.imageManager.exportToDataURL(this.POSTER_WIDTH, this.POSTER_HEIGHT, 'image/jpeg', 0.9);

    // Si besoin d'envoyer au serveur Spring Boot, on peut faire un fetch() ici.
    // Pour l'exemple, on lance le téléchargement pour l'utilisateur :
    const link = document.createElement('a');
    link.download = 'shashap-poster-export.jpg';
    link.href = base64Data;
    link.click();
  }

  /**
   * Utilitaires pour l'UI (Remplace useState)
   */
  setLoading(isLoading) {
    this.loadingText.style.display = isLoading ? 'block' : 'none';
    this.urlBtn.disabled = isLoading;
    this.fileInput.disabled = isLoading;
    this.exportBtn.disabled = isLoading;

    // Effet visuel pendant le chargement
    this.previewImg.style.opacity = isLoading ? '0.5' : '1';
  }

  setError(message) {
    if (message) {
      this.errorText.textContent = '⚠️ ' + message;
      this.errorText.style.display = 'block';
    } else {
      this.errorText.style.display = 'none';
    }
  }
}

// === INITIALISATION AU CHARGEMENT DE LA PAGE ===
document.addEventListener('DOMContentLoaded', () => {
  // On instancie l'éditeur en lui passant l'ID du conteneur HTML
  new PosterEditor('poster-editor');
});