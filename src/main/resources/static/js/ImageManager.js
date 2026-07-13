/**
 * ImageManager - Moteur de traitement d'images (Vanilla ES6)
 */
export class ImageManager {
  constructor(fallbackImageUrl = '/images/placeholder.png') {
    this.originalImage = null;
    this.optimizedBlob = null;
    this.previewUrl = null;
    this.fallbackImageUrl = fallbackImageUrl;
    this.transforms = { scale: 1, x: 0, y: 0, rotation: 0 };
  }

  async load(source) {
    try {
      let imageSrc = source;
      if (source instanceof File || source instanceof Blob) {
        imageSrc = URL.createObjectURL(source);
      }

      this.originalImage = await this._createImageElement(imageSrc);
      await this._analyzeAndOptimize();

      return { success: true, url: this.previewUrl };
    } catch (error) {
      console.warn("⚠️ ImageManager: Échec du chargement.", error);
      this.previewUrl = this.fallbackImageUrl;
      return { success: false, url: this.previewUrl, error };
    }
  }

  _createImageElement(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Erreur de chargement."));
      img.src = src;
    });
  }

  async _analyzeAndOptimize() {
    const MAX_RESOLUTION = 1920;
    let width = this.originalImage.naturalWidth;
    let height = this.originalImage.naturalHeight;

    if (width > MAX_RESOLUTION || height > MAX_RESOLUTION) {
      const ratio = width / height;
      if (width > height) {
        width = MAX_RESOLUTION;
        height = Math.round(MAX_RESOLUTION / ratio);
      } else {
        height = MAX_RESOLUTION;
        width = Math.round(MAX_RESOLUTION * ratio);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this.originalImage, 0, 0, width, height);

    this.optimizedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.85));

    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = URL.createObjectURL(this.optimizedBlob);
  }

  exportToCanvas(targetWidth, targetHeight) {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!this.originalImage) return canvas;

    const imgW = this.originalImage.naturalWidth;
    const imgH = this.originalImage.naturalHeight;
    const targetRatio = targetWidth / targetHeight;
    const imgRatio = imgW / imgH;

    let sWidth = imgW, sHeight = imgH, sx = 0, sy = 0;

    if (imgRatio > targetRatio) {
      sWidth = imgH * targetRatio;
      sx = (imgW - sWidth) / 2;
    } else {
      sHeight = imgW / targetRatio;
      sy = (imgH - sHeight) / 2;
    }

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(this.transforms.x, this.transforms.y);
    ctx.drawImage(this.originalImage, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
    ctx.restore();

    return canvas;
  }

  exportToDataURL(targetWidth, targetHeight, format = 'image/jpeg', quality = 0.9) {
    return this.exportToCanvas(targetWidth, targetHeight).toDataURL(format, quality);
  }
}