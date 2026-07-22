// ============================================================
// 📋 CATALOGUE — Chargement réel depuis l'API Shashap
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
        titleEl.textContent = `— ${sec} —`;
        sectionEl.appendChild(titleEl);

        const gridEl = document.createElement('div');
        gridEl.className = 'products-grid';

        prods.forEach(p => {
            const cardEl = document.createElement('div');
            cardEl.className = 'product-card';

            const imgSrc = p.imageUrl || '';

            cardEl.innerHTML = `
                <div class="product-image-container">
                    ${imgSrc
                        ? `<img src="${imgSrc}" alt="${p.name || ''}" class="product-image" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                           <div class="product-image-fallback" style="display:none; width:100%; height:100%; align-items:center; justify-content:center; background:var(--color-charbon-doux); font-size:40px;">
                               ${getCatalogCategoryEmoji(p.category)}
                           </div>`
                        : `<div class="product-image-fallback" style="display:flex; width:100%; height:100%; align-items:center; justify-content:center; background:var(--color-charbon-doux); font-size:40px;">
                               ${getCatalogCategoryEmoji(p.category)}
                           </div>`
                    }
                </div>
                <div class="product-info">
                    <div>
                        <h3 class="product-name">${p.name || 'Sans nom'}</h3>
                        <p class="product-desc">${p.description || 'Une création Shashap'}</p>
                    </div>
                    <div class="product-price">${Number(p.price || 0).toLocaleString('fr-FR')} FCFA</div>
                </div>
            `;
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
        'Burger': '🍔', 'Pizza': '🍕', 'Boisson': '🥤',
        'Dessert': '🍰', 'Accompagnement': '🍟'
    };
    return map[cat] || '🍽️';
}

// ============================================================
// 🔔 SYSTÈME DE TOAST NOTIFICATION
// ============================================================
function showCatalogToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);
    setTimeout(() => {
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

    const products = catalogProducts.filter(p => p.isAvailable);
    if (!products.length) {
      showCatalogToast("Aucun produit disponible pour l'export", 'error');
      return;
    }

    showCatalogToast('Génération du catalogue premium...', 'info');

    const menuUrl = 'https://shapshap-admin-malik.up.railway.app';
    const [qrCodeImg] = await Promise.all([
      fetchCatalogQrCodeBase64(menuUrl),
      ...products.map(async (p) => {
        p._cachedImg = p.imageUrl ? await urlToCatalogCircleBase64(p.imageUrl) : null;
      })
    ]);

    const doc = new jspdf.jsPDF('p', 'mm', 'a4');
    const pW = 210, pH = 297, mg = 15, IMG = 25;
    const HY = 42;

    const cNoir = [13, 12, 16];
    const cCharbon = [38, 32, 41];
    const cRose = [184, 112, 143];
    const cBlush = [240, 184, 205];
    const cCreme = [248, 238, 243];

    // ── PAGE 1 : LA COUVERTURE ───────────────────
    doc.setFillColor(...cNoir);
    doc.rect(0, 0, pW, pH, 'F');

    doc.setFont('times', 'normal');
    doc.setFontSize(32);
    doc.setTextColor(...cCreme);
    doc.text('S H A S H A P', mg, 35);

    doc.setFillColor(...cRose);
    doc.rect(mg, 42, 40, 0.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...cBlush);
    doc.text("l'art de la gastronomie", mg, 50);

    doc.setFontSize(8);
    doc.setTextColor(...cCharbon);
    doc.text('Édition du ' + new Date().toLocaleDateString('fr-FR'), pW - mg, pH - mg, { align: 'right' });

    // ── PAGE 2 : LE MANIFESTE ───────────────────
    doc.addPage();
    doc.setFillColor(...cCharbon);
    doc.rect(0, 0, pW, pH, 'F');

    doc.setFont('times', 'italic');
    doc.setFontSize(26);
    doc.setTextColor(...cCreme);

    const manifeste = [
      "Chaque plat est une intention.",
      "Chaque saveur, une conversation.",
      "Shashap est né à Niamey",
      "pour que la gastronomie",
      "devienne accessible,",
      "sans jamais cesser",
      "d'être exceptionnelle."
    ];

    doc.text(manifeste, pW / 2, pH / 2 - 30, { align: 'center', lineHeightFactor: 1.8 });

    doc.setFillColor(...cRose);
    doc.rect(30, pH / 2 - 45, 0.5, 80, 'F');

    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(...cRose);
    doc.text("II", pW / 2, pH - 20, { align: 'center' });

    // ── PAGES PRODUITS ──────────────────────────────────────
    doc.addPage();

    const drawHeader = () => {
        doc.setFillColor(...cNoir);
        doc.rect(0, 0, pW, pH, 'F');
        doc.setFont('times', 'normal'); doc.setFontSize(16); doc.setTextColor(...cCreme);
        doc.text('SHASHAP', mg, 22);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...cBlush);
        doc.text('LA CARTE', mg, 27);
        doc.setDrawColor(...cCharbon); doc.setLineWidth(0.2);
        doc.line(mg, 32, pW - mg, 32);
    };

    drawHeader();

    const sections = {};
    products.forEach(p => {
      const cat = (p.category || 'INCONTOURNABLES').toUpperCase();
      if (!sections[cat]) sections[cat] = [];
      sections[cat].push(p);
    });

    let curY = HY;
    const cellH = IMG + 10;

    for (const [sec, prods] of Object.entries(sections)) {
      if (curY > pH - 45) {
        doc.addPage();
        drawHeader();
        curY = HY;
      }

      doc.setFont('times', 'italic'); doc.setFontSize(18); doc.setTextColor(...cRose);
      doc.text('— ' + sec + ' —', pW / 2, curY + 6, { align: 'center' });
      curY += 15;

      doc.autoTable({
        startY: curY,
        body: prods.map(p => [
          '',
          (p.name || 'CRÉATION').toUpperCase() + '\n' + (p.description || ''),
          p.price ? Number(p.price).toLocaleString('fr-FR') + ' FCFA' : '—'
        ]),
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
        didDrawCell(d) {
          if (d.column.index === 0 && d.section === 'body') {
            const p = prods[d.row.index];
            const xo = d.cell.x;
            const yo = d.cell.y + (d.cell.height - IMG) / 2;

            if (p && p._cachedImg) {
              try {
                doc.addImage(p._cachedImg, 'PNG', xo, yo, IMG + 10, IMG);
              } catch (e) {
                console.warn(e);
              }
            }
          }
        },
        didDrawPage() {
          const activePage = doc.internal.getNumberOfPages();
          doc.setPage(activePage);
          drawHeader();
        }
      });
      curY = doc.lastAutoTable.finalY + 15;
    }

    // ── DERNIÈRE PAGE : CONTACT & QR ────────────────────────
    doc.addPage();
    doc.setFillColor(...cNoir); doc.rect(0, 0, pW, pH, 'F');

    doc.setFont('times', 'normal'); doc.setFontSize(24); doc.setTextColor(...cCreme);
    doc.text('SHASHAP', pW / 2, 60, { align: 'center' });

    const qrS = 50, qrX = (pW - qrS) / 2, qrY = 90;
    doc.setFillColor(...cCharbon);
    doc.roundedRect(qrX - 5, qrY - 5, qrS + 10, qrS + 10, 3, 3, 'F');
    doc.setDrawColor(...cRose); doc.setLineWidth(0.3);
    doc.roundedRect(qrX - 5, qrY - 5, qrS + 10, qrS + 10, 3, 3, 'S');

    if (qrCodeImg) {
      doc.addImage(qrCodeImg, 'PNG', qrX, qrY, qrS, qrS);
    }
    doc.link(qrX, qrY, qrS, qrS, { url: menuUrl });

    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...cBlush);
    doc.text("Scannez pour commander.", pW / 2, 160, { align: 'center' });

    doc.setFontSize(8); doc.setTextColor(...cCharbon);
    doc.text("S H A S H A P   C O  —  N I A M E Y ,  N I G E R", pW / 2, pH - 20, { align: 'center' });

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
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
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
  return new Promise((resolve) => {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(targetUrl)}&color=0D0C10&bgcolor=F8EEF3&qzone=1`;

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