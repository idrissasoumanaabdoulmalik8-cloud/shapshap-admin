// ============================================================================
// MODULE UTILITAIRE : GESTION ET OPTIMISATION DES IMAGES
// ============================================================================

export class ImageManager {
  constructor() {
    this.MAX_RESOLUTION = 1920;
    this.QUALITY = 0.85;
  }

  /**
   * Reçoit un File (depuis un <input type="file">) et le convertit
   * en Base64 compressé pour garantir un export PDF sans erreur CORS.
   */
  async processImage(file) {
    try {
      if (!file) throw new Error("Aucun fichier fourni.");

      const objectUrl = URL.createObjectURL(file);
      const img = await this._loadImage(objectUrl);

      const optimizedBase64 = await this._compressToWebP(img);

      // Nettoyage de la mémoire
      URL.revokeObjectURL(objectUrl);

      return { success: true, url: optimizedBase64 };
    } catch (error) {
      console.error("ImageManager: Erreur de traitement", error);
      return { success: false, error: "Impossible de traiter l'image." };
    }
  }

  _loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image corrompue ou illisible."));
      img.src = src;
    });
  }

  async _compressToWebP(img) {
    let width = img.naturalWidth;
    let height = img.naturalHeight;

    // Redimensionnement intelligent si l'image est trop lourde
    if (width > this.MAX_RESOLUTION || height > this.MAX_RESOLUTION) {
      const ratio = width / height;
      if (width > height) {
        width = this.MAX_RESOLUTION;
        height = Math.round(this.MAX_RESOLUTION / ratio);
      } else {
        height = this.MAX_RESOLUTION;
        width = Math.round(this.MAX_RESOLUTION * ratio);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // Retourne l'image en Data URL (Base64) pour injection directe dans events.js
    return canvas.toDataURL('image/webp', this.QUALITY);
  }
}