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

    showCatalogToast('Génération du catalogue premium...', 'info');

    var menuUrl = 'https://shapshap-admin-malik.up.railway.app';
    var qrCodeImg = null;

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

    var doc = new jspdf.jsPDF('p', 'mm', 'a4');
    var pW = 210, pH = 297, mg = 15, IMG = 25;
    var HY = 42;

    var cNoir = [13, 12, 16];
    var cCharbon = [38, 32, 41];
    var cRose = [184, 112, 143];
    var cBlush = [240, 184, 205];
    var cCreme = [248, 238, 243];

    // ── PAGE 1 : LA COUVERTURE ───────────────────
    doc.setFillColor(cNoir[0], cNoir[1], cNoir[2]);
    doc.rect(0, 0, pW, pH, 'F');

    doc.setFont('times', 'normal');
    doc.setFontSize(32);
    doc.setTextColor(cCreme[0], cCreme[1], cCreme[2]);
    doc.text('S H A S H A P', mg, 35);

    doc.setFillColor(cRose[0], cRose[1], cRose[2]);
    doc.rect(mg, 42, 40, 0.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(cBlush[0], cBlush[1], cBlush[2]);
    doc.text("l'art de la gastronomie", mg, 50);

    doc.setFontSize(8);
    doc.setTextColor(cCharbon[0], cCharbon[1], cCharbon[2]);
    doc.text('Édition du ' + new Date().toLocaleDateString('fr-FR'), pW - mg, pH - mg, { align: 'right' });

    // ── PAGE 2 : LE MANIFESTE ───────────────────
    doc.addPage();
    doc.setFillColor(cCharbon[0], cCharbon[1], cCharbon[2]);
    doc.rect(0, 0, pW, pH, 'F');

    doc.setFont('times', 'italic');
    doc.setFontSize(26);
    doc.setTextColor(cCreme[0], cCreme[1], cCreme[2]);

    var manifeste = [
      "Chaque plat est une intention.",
      "Chaque saveur, une conversation.",
      "Shashap est né à Niamey",
      "pour que la gastronomie",
      "devienne accessible,",
      "sans jamais cesser",
      "d'être exceptionnelle."
    ];

    doc.text(manifeste, pW / 2, pH / 2 - 30, { align: 'center', lineHeightFactor: 1.8 });

    doc.setFillColor(cRose[0], cRose[1], cRose[2]);
    doc.rect(30, pH / 2 - 45, 0.5, 80, 'F');

    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(cRose[0], cRose[1], cRose[2]);
    doc.text("II", pW / 2, pH - 20, { align: 'center' });

    // ── PAGES PRODUITS ──────────────────────────────────────
    doc.addPage();

    var drawHeader = function() {
        doc.setFillColor(cNoir[0], cNoir[1], cNoir[2]);
        doc.rect(0, 0, pW, pH, 'F');
        doc.setFont('times', 'normal'); doc.setFontSize(16); doc.setTextColor(cCreme[0], cCreme[1], cCreme[2]);
        doc.text('SHASHAP', mg, 22);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(cBlush[0], cBlush[1], cBlush[2]);
        doc.text('LA CARTE', mg, 27);
        doc.setDrawColor(cCharbon[0], cCharbon[1], cCharbon[2]); doc.setLineWidth(0.2);
        doc.line(mg, 32, pW - mg, 32);
    };

    drawHeader();

    var sections = {};
    products.forEach(function(p) {
      var cat = (p.category || 'INCONTOURNABLES').toUpperCase();
      if (!sections[cat]) sections[cat] = [];
      sections[cat].push(p);
    });

    var curY = HY;
    var cellH = IMG + 10;

    for (var sec in sections) {
      if (!sections.hasOwnProperty(sec)) continue;
      var prods = sections[sec];

      if (curY > pH - 45) {
        doc.addPage();
        drawHeader();
        curY = HY;
      }

      doc.setFont('times', 'italic'); doc.setFontSize(18); doc.setTextColor(cRose[0], cRose[1], cRose[2]);
      doc.text('\u2014 ' + sec + ' \u2014', pW / 2, curY + 6, { align: 'center' });
      curY += 15;

      doc.autoTable({
        startY: curY,
        body: prods.map(function(p) {
          return [
            '',
            (p.name || 'CRÉATION').toUpperCase() + '\n' + (p.description || ''),
            p.price ? Number(p.price).toLocaleString('fr-FR') + ' FCFA' : '\u2014'
          ];
        }),
        theme: 'plain',
        margin: { top: HY, left: mg, right: mg },
        bodyStyles: {
          minCellHeight: cellH, fontSize: 11, textColor: cCreme,
          valign: 'middle', cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
          fillColor: cNoir
        },
        columnStyles: {
          0: { cellWidth: 40, halign: 'left', valign: 'middle' },
          1: { cellWidth: 100, font: 'times', fontStyle: 'bold', valign: 'middle' },
          2: { cellWidth: 40, halign: 'right', textColor: cRose, font: 'times', fontSize: 12 },
        },
        didDrawCell: function(d) {
          if (d.column.index === 0 && d.section === 'body') {
            var p = prods[d.row.index];
            var xo = d.cell.x;
            var yo = d.cell.y + (d.cell.height - IMG) / 2;

            if (p && p._cachedImg) {
              try {
                doc.addImage(p._cachedImg, 'PNG', xo, yo, IMG + 10, IMG);
              } catch (e) {
                console.warn(e);
              }
            }
          }
        },
        didDrawPage: function() {
          var activePage = doc.internal.getNumberOfPages();
          doc.setPage(activePage);
          drawHeader();
        }
      });
      curY = doc.lastAutoTable.finalY + 15;
    }

    // ── DERNIÈRE PAGE : CONTACT & QR ────────────────────────
    doc.addPage();
    doc.setFillColor(cNoir[0], cNoir[1], cNoir[2]); doc.rect(0, 0, pW, pH, 'F');

    doc.setFont('times', 'normal'); doc.setFontSize(24); doc.setTextColor(cCreme[0], cCreme[1], cCreme[2]);
    doc.text('SHASHAP', pW / 2, 60, { align: 'center' });

    var qrS = 50, qrX = (pW - qrS) / 2, qrY = 90;
    doc.setFillColor(cCharbon[0], cCharbon[1], cCharbon[2]);
    doc.roundedRect(qrX - 5, qrY - 5, qrS + 10, qrS + 10, 3, 3, 'F');
    doc.setDrawColor(cRose[0], cRose[1], cRose[2]); doc.setLineWidth(0.3);
    doc.roundedRect(qrX - 5, qrY - 5, qrS + 10, qrS + 10, 3, 3, 'S');

    if (qrCodeImg) {
      doc.addImage(qrCodeImg, 'PNG', qrX, qrY, qrS, qrS);
    }
    doc.link(qrX, qrY, qrS, qrS, { url: menuUrl });

    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(cBlush[0], cBlush[1], cBlush[2]);
    doc.text("Scannez pour commander.", pW / 2, 160, { align: 'center' });

    doc.setFontSize(8); doc.setTextColor(cCharbon[0], cCharbon[1], cCharbon[2]);
    doc.text("S H A S H A P   C O  \u2014  N I A M E Y ,  N I G E R", pW / 2, pH - 20, { align: 'center' });

    doc.save('Catalogue_Shashap_' + new Date().toISOString().split('T')[0] + '.pdf');
    showCatalogToast('Catalogue premium prêt !', 'success');

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