// ============================================================
// 📋 CATALOGUE — Chargement réel depuis l'API Shashapp
// ============================================================
let catalogProducts = [];

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    loadCatalogFromAPI();
});

// ============================================================
// 🔄 CHARGEMENT DES PRODUITS DEPUIS L'API
// ============================================================
async function loadCatalogFromAPI() {
    const container = document.getElementById('catalogMain');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align:center; padding:60px; color:#B8708F;">
            🌸 Chargement du catalogue...
        </div>`;

    try {
        const response = await axios.get(API + '/products');
        catalogProducts = response.data || [];
        renderCatalogWeb();
    } catch (e) {
        console.error('Erreur chargement catalogue:', e);
        container.innerHTML = `
            <div style="text-align:center; padding:60px; color:#E91E63;">
                ❌ Erreur de chargement du catalogue
            </div>`;
    }
}

// ============================================================
// 🖥️ RENDU WEB DU CATALOGUE MAGAZINE
// ============================================================
function renderCatalogWeb() {
    const container = document.getElementById('catalogMain');
    if (!container) return;

    container.innerHTML = '';

    const available = catalogProducts.filter(p => p.isAvailable);

    if (available.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:60px; color:#B8708F;">
                📭 Aucun produit disponible
            </div>`;
        return;
    }

    const sections = {};
    available.forEach(p => {
        const cat = (p.category || 'Incontournables').toUpperCase();
        if (!sections[cat]) sections[cat] = [];
        sections[cat].push(p);
    });

    for (const [sec, prods] of Object.entries(sections)) {
        const sectionEl = document.createElement('section');
        sectionEl.className = 'category-block';

        const titleEl = document.createElement('h2');
        titleEl.className = 'category-title';
        titleEl.textContent = '\u2014 ' + sec + ' \u2014';
        sectionEl.appendChild(titleEl);

        const gridEl = document.createElement('div');
        gridEl.className = 'products-grid';

        prods.forEach(p => {
            const cardEl = document.createElement('div');
            cardEl.className = 'product-card';

            const imgSrc = p.imageUrl || '';
            const proxyUrl = imgSrc ? '/proxy-image?url=' + encodeURIComponent(imgSrc) : '';

            const imageHtml = imgSrc
                ? '<img src="' + proxyUrl + '" alt="' + (p.name || '') + '" class="product-image" loading="lazy" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
                  '<div class="product-image-fallback" style="display:none; width:100%; height:100%; align-items:center; justify-content:center; background:var(--color-charbon-doux); font-size:40px;">' +
                  getCatalogCategoryEmoji(p.category) +
                  '</div>'
                : '<div class="product-image-fallback" style="display:flex; width:100%; height:100%; align-items:center; justify-content:center; background:var(--color-charbon-doux); font-size:40px;">' +
                  getCatalogCategoryEmoji(p.category) +
                  '</div>';

            cardEl.innerHTML =
                '<div class="product-image-container">' +
                imageHtml +
                '</div>' +
                '<div class="product-info">' +
                '<div>' +
                '<h3 class="product-name">' + (p.name || 'Sans nom') + '</h3>' +
                '<p class="product-desc">' + (p.description || 'Une création Shashap') + '</p>' +
                '</div>' +
                '<div class="product-price">' + Number(p.price || 0).toLocaleString('fr-FR') + ' FCFA</div>' +
                '</div>';

            gridEl.appendChild(cardEl);
        });

        sectionEl.appendChild(gridEl);
        container.appendChild(sectionEl);
    }
}

// ============================================================
// 🏷️ EMOJI PAR CATÉGORIE
// ============================================================
function getCatalogCategoryEmoji(cat) {
    const map = {
        'Burger': '\uD83C\uDF54',
        'Pizza': '\uD83C\uDF55',
        'Boisson': '\uD83E\uDD64',
        'Dessert': '\uD83C\uDF70',
        'Accompagnement': '\uD83C\uDF5F'
    };
    return map[cat] || '\uD83C\uDF7D\uFE0F';
}

// ============================================================
// 🔔 SYSTÈME DE TOAST NOTIFICATION
// ============================================================
function showCatalogToast(message, type) {
    type = type || 'success';
    var toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;

    toastContainer.appendChild(toast);
    setTimeout(function() {
        toast.remove();
    }, 3000);
}

// ============================================================
// 📥 EXPORT DU CATALOGUE PREMIUM (PDF)
// ============================================================
// ============================================================
// 📥 EXPORT DU CATALOGUE MAGAZINE PREMIUM (PDF)
// ============================================================
async function exportCatalogPDF() {
  try {
    if (!window.jspdf) {
      showCatalogToast("Erreur : jsPDF n'est pas chargé", 'error');
      return;
    }

    var products = catalogProducts.filter(function(p) { return p.isAvailable; });
    if (!products.length) {
      showCatalogToast("Aucun produit disponible pour l'export", 'error');
      return;
    }

    showCatalogToast('Création de votre magazine gastronomique...', 'info');

    var menuUrl = 'https://shapshap-admin-malik.up.railway.app';
    var qrCodeImg = null;

    // 1. Préchargement de toutes les images via le proxy
    var results = await Promise.all([
      fetchCatalogQrCodeBase64(menuUrl)
    ].concat(products.map(async function(p) {
      if (p.imageUrl) {
        var proxyUrl = '/proxy-image?url=' + encodeURIComponent(p.imageUrl);
        p._cachedImg = await urlToCatalogCircleBase64(proxyUrl);
      } else {
        p._cachedImg = null;
      }
    })));

    qrCodeImg = results[0];

    // 2. Initialisation du document
    var doc = new jspdf.jsPDF('p', 'mm', 'a4');
    var pW = 210, pH = 297, mg = 15;
    var pageNum = 1;

    // Palette de couleurs exactes
    var cNoir = [13, 12, 16];     // #0D0C10
    var cCharbon = [38, 32, 41];  // #262029
    var cRose = [184, 112, 143];  // #B8708F
    var cBlush = [240, 184, 205]; // #F0B8CD
    var cCreme = [248, 238, 243]; // #F8EEF3

    // Fonction utilitaire pour le fond des pages intérieures
    var drawPageBg = function() {
      doc.setFillColor.apply(doc, cNoir);
      doc.rect(0, 0, pW, pH, 'F');

      // Bordures décoratives haut/bas
      doc.setDrawColor.apply(doc, cCharbon);
      doc.setLineWidth(0.5);
      doc.line(mg, mg, pW - mg, mg);
      doc.line(mg, pH - mg, pW - mg, pH - mg);

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("SHASHAP \u2014 L'ART DE LA GASTRONOMIE", mg, pH - 8);
      doc.text("PAGE " + pageNum, pW - mg, pH - 8, { align: 'right' });
      pageNum++;
    };

    // ── PAGE 1 : LA COUVERTURE MAGAZINE ─────────────────────────────
    doc.setFillColor.apply(doc, cNoir);
    doc.rect(0, 0, pW, pH, 'F');

    // Recherche d'une image pour la couverture
    var coverImgSrc = products.find(function(p) { return p._cachedImg; });
    if (coverImgSrc && coverImgSrc._cachedImg) {
      doc.addImage(coverImgSrc._cachedImg, 'PNG', 0, 0, pW, 160);
      // Ligne de séparation élégante
      doc.setFillColor.apply(doc, cRose);
      doc.rect(0, 160, pW, 1.5, 'F');
    }

    // Encart sombre flottant pour le titre (Effet studio design)
    doc.setFillColor.apply(doc, cNoir);
    doc.roundedRect(mg, 110, pW - 2 * mg, 110, 4, 4, 'F');

    doc.setDrawColor.apply(doc, cCharbon);
    doc.setLineWidth(0.5);
    doc.roundedRect(mg + 3, 113, pW - 2 * mg - 6, 104, 3, 3, 'S');

    doc.setFont('times', 'bold');
    doc.setFontSize(42);
    doc.setTextColor.apply(doc, cCreme);
    doc.text("S H A S H A P", pW / 2, 145, { align: 'center' });

    doc.setFont('times', 'italic');
    doc.setFontSize(14);
    doc.setTextColor.apply(doc, cBlush);
    doc.text("L'expérience gastronomique ultime", pW / 2, 155, { align: 'center' });

    doc.setFillColor.apply(doc, cRose);
    doc.rect(pW / 2 - 15, 165, 30, 0.5, 'F');

    // QR Code miniature sur la couverture
    if (qrCodeImg) {
      var cQrS = 25;
      doc.addImage(qrCodeImg, 'PNG', pW / 2 - cQrS / 2, 175, cQrS, cQrS);
      doc.link(pW / 2 - cQrS / 2, 175, cQrS, cQrS, { url: menuUrl });
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("ÉDITION \u2014 " + new Date().toLocaleDateString('fr-FR'), pW / 2, 210, { align: 'center' });

    // ── PAGES INTÉRIEURES : LE CATALOGUE ────────────────────────────
    doc.addPage();
    drawPageBg();

    var curY = 25;
    var layoutIdx = 0; // Sert à alterner les mises en page

    var checkPageBreak = function(h) {
      if (curY + h > pH - 20) {
        doc.addPage();
        drawPageBg();
        curY = 25;
      }
    };

    // Groupement par catégories
    var sections = {};
    products.forEach(function(p) {
      var cat = (p.category || 'INCONTOURNABLES').toUpperCase();
      if (!sections[cat]) sections[cat] = [];
      sections[cat].push(p);
    });

    for (var sec in sections) {
      if (!sections.hasOwnProperty(sec)) continue;

      // 1. BANNIÈRE DE CATÉGORIE
      checkPageBreak(50);
      doc.setFillColor.apply(doc, cRose);
      doc.rect(0, curY, pW, 35, 'F');

      doc.setFont('times', 'bold');
      doc.setFontSize(26);
      doc.setTextColor.apply(doc, cCreme);
      doc.text(sec, pW / 2, curY + 22, { align: 'center' });

      curY += 45;

      var prods = sections[sec];

      // 2. BOUCLE DES PRODUITS (RYTHME ÉDITORIAL)
      prods.forEach(function(p) {
        var isFeature = (layoutIdx % 5 === 0); // 1 produit sur 5 en grand
        var isRight = (layoutIdx % 2 !== 0);   // Alterne image droite/gauche

        if (isFeature && p._cachedImg) {
          // --- CARTE EN VEDETTE (Pleine largeur) ---
          var cardH = 115;
          checkPageBreak(cardH + 10);

          doc.setFillColor.apply(doc, cCharbon);
          doc.roundedRect(mg, curY, pW - 2 * mg, cardH, 4, 4, 'F');

          var fImgH = 65;
          doc.addImage(p._cachedImg, 'PNG', mg, curY, pW - 2 * mg, fImgH);

          doc.setFillColor.apply(doc, cRose);
          doc.rect(mg, curY + fImgH, pW - 2 * mg, 1.5, 'F');

          doc.setFont('times', 'bold');
          doc.setFontSize(16);
          doc.setTextColor.apply(doc, cCreme);
          doc.text((p.name || 'CRÉATION').toUpperCase(), pW / 2, curY + fImgH + 14, { align: 'center' });

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor.apply(doc, cBlush);
          var fDesc = doc.splitTextToSize(p.description || '', pW - 2 * mg - 30);
          if(fDesc.length > 2) fDesc = [fDesc[0], fDesc[1] + '...']; // Limite à 2 lignes
          doc.text(fDesc, pW / 2, curY + fImgH + 22, { align: 'center' });

          var pStr = Number(p.price || 0).toLocaleString('fr-FR') + ' FCFA';
          doc.setFont('times', 'bold'); doc.setFontSize(12);
          var pWd = doc.getTextWidth(pStr) + 12;
          var pX = (pW - pWd) / 2;

          doc.setFillColor.apply(doc, cRose);
          doc.roundedRect(pX, curY + cardH - 14, pWd, 8, 3, 3, 'F');
          doc.setTextColor.apply(doc, cCreme);
          doc.text(pStr, pX + 6, curY + cardH - 8);

          curY += cardH + 10;

        } else {
          // --- CARTE STANDARD (Image à gauche ou à droite) ---
          var cardH = 46;
          checkPageBreak(cardH + 10);

          doc.setFillColor.apply(doc, cCharbon);
          doc.roundedRect(mg, curY, pW - 2 * mg, cardH, 4, 4, 'F');

          var imgS = 46; // Image occupe toute la hauteur de la carte
          var iX = isRight ? (pW - mg - imgS) : mg;
          var tX = isRight ? (mg + 8) : (mg + imgS + 12);
          var maxW = pW - 2 * mg - imgS - 20;

          if (p._cachedImg) {
            doc.addImage(p._cachedImg, 'PNG', iX, curY, imgS, imgS);
          } else {
            doc.setFillColor(50, 45, 55);
            doc.rect(iX, curY, imgS, imgS, 'F');
          }

          // Bordure séparatrice subtile
          doc.setDrawColor.apply(doc, cRose);
          doc.setLineWidth(0.5);
          var lineX = isRight ? iX : iX + imgS;
          doc.line(lineX, curY, lineX, curY + imgS);

          doc.setFont('times', 'bold');
          doc.setFontSize(13);
          doc.setTextColor.apply(doc, cCreme);
          doc.text((p.name || 'CRÉATION').toUpperCase(), tX, curY + 12);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor.apply(doc, cBlush);
          var lines = doc.splitTextToSize(p.description || '', maxW);
          if (lines.length > 2) lines = [lines[0], lines[1] + '...'];
          doc.text(lines, tX, curY + 20);

          // Badge de prix façon Application Mobile
          var pStr2 = Number(p.price || 0).toLocaleString('fr-FR') + ' FCFA';
          doc.setFont('times', 'bold'); doc.setFontSize(11);
          var pWd2 = doc.getTextWidth(pStr2) + 10;
          doc.setFillColor.apply(doc, cRose);
          doc.roundedRect(tX, curY + 32, pWd2, 8, 3, 3, 'F');
          doc.setTextColor.apply(doc, cCreme);
          doc.text(pStr2, tX + 5, curY + 37.5);

          curY += cardH + 10;
        }
        layoutIdx++;
      });
    }

    // ── DERNIÈRE PAGE : CONCLUSION & CALL TO ACTION ─────────────────
    doc.addPage();
    drawPageBg();

    doc.setFont('times', 'italic');
    doc.setFontSize(28);
    doc.setTextColor.apply(doc, cCreme);
    doc.text("L'expérience continue", pW / 2, 60, { align: 'center' });
    doc.text("chez vous.", pW / 2, 72, { align: 'center' });

    var qrS = 65, qrX = (pW - qrS) / 2, qrY = 100;

    // Cadre luxueux pour le QR Code
    doc.setFillColor.apply(doc, cCharbon);
    doc.roundedRect(qrX - 12, qrY - 12, qrS + 24, qrS + 24, 6, 6, 'F');
    doc.setDrawColor.apply(doc, cRose);
    doc.setLineWidth(0.8);
    doc.roundedRect(qrX - 8, qrY - 8, qrS + 16, qrS + 16, 4, 4, 'S');

    if (qrCodeImg) {
      doc.addImage(qrCodeImg, 'PNG', qrX, qrY, qrS, qrS);
      doc.link(qrX, qrY, qrS, qrS, { url: menuUrl });
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor.apply(doc, cRose);
    doc.text("SCANNEZ POUR COMMANDER IMMÉDIATEMENT", pW / 2, 205, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor.apply(doc, cBlush);
    doc.text("Ou cliquez directement sur le QR code", pW / 2, 215, { align: 'center' });

    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.setTextColor.apply(doc, cCreme);
    doc.text("S H A S H A P", pW / 2, 260, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Niamey, Niger \u2022 @shashap_ne \u2022 L'Art de la Gastronomie", pW / 2, 270, { align: 'center' });

    // ── SAUVEGARDE DU FICHIER ───────────────────────────────────────
    doc.save('Magazine_Shashap_' + new Date().toISOString().split('T')[0] + '.pdf');
    showCatalogToast('Magazine généré avec succès !', 'success');

  } catch (error) {
    console.error('Erreur PDF catalogue:', error);
    showCatalogToast('Échec : ' + error.message, 'error');
  }
}

// ============================================================
// 🖼️ CONVERTISSEUR D'IMAGE
// ============================================================
function urlToCatalogCircleBase64(url) {
  return new Promise(function(resolve) {
    if (!url || typeof url !== 'string' || url === 'null' || url.trim() === '') {
      resolve(null);
      return;
    }

    var img = new Image();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      img.crossOrigin = 'Anonymous';
    }

    img.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      var ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }

      ctx.drawImage(img, 0, 0, img.width, img.height);

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
// 🎨 GÉNÉRATEUR QR CODE
// ============================================================
function fetchCatalogQrCodeBase64(targetUrl) {
  return new Promise(function(resolve) {
    var qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(targetUrl) + '&color=0D0C10&bgcolor=F8EEF3&qzone=1';

    var img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext('2d');
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