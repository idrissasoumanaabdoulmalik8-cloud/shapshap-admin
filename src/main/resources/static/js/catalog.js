// ============================================================
// 📖 MAGAZINE GASTRONOMIQUE SHASHAP — Export PDF Premium
// Version 2.0 — Tous bugs corrigés
// ============================================================

// ============================================================
// 🛡️ UTILITAIRES — Sécurité et nettoyage
// ============================================================

/**
 * Supprime tous les caractères HTML et entités indésirables.
 * Corrige définitivement le bug "&2 /&5&0&0&" dans jsPDF.
 */

 // ============================================================
 // 📋 CATALOGUE — Variables globales
 // ============================================================
 var catalogProducts = [];

 // ============================================================
 // 🔔 TOAST NOTIFICATION
 // ============================================================
 // ============================================================
 // 🔄 CHARGEMENT DES PRODUITS DEPUIS L'API
 // ============================================================
 async function loadCatalogFromAPI() {
     var container = document.getElementById('catalogMain');
     if (!container) return;

     container.innerHTML = '<div style="text-align:center; padding:60px; color:#B8708F;">🌸 Chargement du catalogue...</div>';

     try {
         var response = await axios.get(API + '/products');
         catalogProducts = response.data || [];
         renderCatalogWeb();
     } catch (e) {
         console.error('Erreur chargement catalogue:', e);
         container.innerHTML = '<div style="text-align:center; padding:60px; color:#E91E63;">❌ Erreur de chargement du catalogue</div>';
     }
 }

 // ============================================================
 // 🖥️ RENDU WEB DU CATALOGUE
 // ============================================================
 function renderCatalogWeb() {
     var container = document.getElementById('catalogMain');
     if (!container) return;

     container.innerHTML = '';

     var available = catalogProducts.filter(function(p) { return p.isAvailable; });

     if (available.length === 0) {
         container.innerHTML = '<div style="text-align:center; padding:60px; color:#B8708F;">📭 Aucun produit disponible</div>';
         return;
     }

     var sections = {};
     available.forEach(function(p) {
         var cat = (p.category || 'Incontournables').toUpperCase();
         if (!sections[cat]) sections[cat] = [];
         sections[cat].push(p);
     });

     for (var sec in sections) {
         if (!sections.hasOwnProperty(sec)) continue;
         var prods = sections[sec];

         var sectionEl = document.createElement('section');
         sectionEl.className = 'category-block';

         var titleEl = document.createElement('h2');
         titleEl.className = 'category-title';
         titleEl.textContent = '— ' + sec + ' —';
         sectionEl.appendChild(titleEl);

         var gridEl = document.createElement('div');
         gridEl.className = 'products-grid';

         prods.forEach(function(p) {
             var cardEl = document.createElement('div');
             cardEl.className = 'product-card';

             var imgSrc = p.imageUrl || '';
             var proxyUrl = imgSrc ? '/proxy-image?url=' + encodeURIComponent(imgSrc) : '';

             var imageHtml = imgSrc
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

 function getCatalogCategoryEmoji(cat) {
     var map = { 'Burger': '🍔', 'Pizza': '🍕', 'Boisson': '🥤', 'Dessert': '🍰', 'Accompagnement': '🍟' };
     return map[cat] || '🍽️';
 }


 function showCatalogToast(message, type) {
     type = type || 'success';
     var toastContainer = document.getElementById('toastContainer');
     if (!toastContainer) return;
     var toast = document.createElement('div');
     toast.className = 'toast ' + type;
     toast.textContent = message;
     toastContainer.appendChild(toast);
     setTimeout(function() { toast.remove(); }, 3000);
 }
function stripHtml(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&[a-zA-Z0-9#]+;/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Formate un prix de façon sécurisée — jamais de caractères parasites.
 * Exemple : 2500 → "2 500 FCFA"
 */
function formatPrice(price) {
  var n = parseFloat(price);
  if (isNaN(n)) return '— FCFA';
  return n.toLocaleString('fr-FR') + ' FCFA';
}

// ============================================================
// 📝 DESCRIPTIONS GASTRONOMIQUES AUTOMATIQUES
// Générées quand p.description est null ou vide
// ============================================================

var GASTRO_DESCRIPTIONS = {
  // ── BOISSONS ────────────────────────────────────────────
  'cappuccino':        'Espresso corsé, lait entier monté à la vapeur, couronné d\'une mousse veloutée. Une invitation à ralentir.',
  'chocolat chaud':    'Cacao pur fondant dans un lait soyeux, légèrement épicé, intensément réconfortant. La chaleur dans un verre.',
  'chocolat vert':     'Thé matcha du Japon, lait d\'avoine crémeux, douceur herbacée et élégance végétale. Pour les palais qui osent.',
  'fanta':             'L\'éclat de l\'orange pressée, pétillant et vif. Fraîcheur instantanée, sourire garanti.',
  'coca-cola':         'L\'iconique. Servi frais sur glace, pour ceux qui savent exactement ce qu\'ils veulent.',
  'citronnade':        'Citrons pressés à la minute, sirop de canne léger, quelques feuilles de menthe fraîche. Notre signature.',
  'milkshake':         'Glace vanille de Madagascar, lait entier, crème fouettée maison. L\'enfance revisitée avec élégance.',
  'smoothie':          'Fruits mûris au soleil de saison, mixés sans sucre ajouté. La saveur du Niger dans un verre.',
  'jus':               'Pressé à froid, sans additifs. La nature dans toute sa simplicité aromatique.',

  // ── BURGERS ─────────────────────────────────────────────
  'cheeseburger':      'Steak haché façonné à la main, cheddar fondu, oignons caramélisés, sauce secrète sur brioche toastée.',
  'burger':            'Viande sélectionnée, garnitures fraîches du jour, pain brioché légèrement toasté. Un classique maîtrisé.',
  'double burger':     'Deux steaks, double générosité. Pour ceux qui ne font jamais les choses à moitié.',
  'poulet':            'Cuisson lente, marinade aux herbes fraîches et citron confit. Un classique élevé au rang d\'art.',
  'bbq':               'Sauce barbecue fumée maison, viande fondante, légumes croquants. L\'intensité du feu dans chaque bouchée.',

  // ── PIZZAS ──────────────────────────────────────────────
  'pizza hawaii':      'Mozzarella di bufala, jambon fumé, ananas confit, basilic frais. Le débat culinaire qui divise — et qui régale.',
  'pepperoni':         'Sauce tomate San Marzano, pepperoni tranché fin, mozzarella généreuse, origan sauvage. L\'Italie à Niamey.',
  'quattro':           'Mozzarella, gorgonzola, parmesan, chèvre frais. Quatre fromages, une seule obsession : vous.',
  'pizza legumes':     'Courgettes, poivrons, champignons grillés à la flamme sur crème fraîche aux herbes. La pizza qui prend soin.',
  'pizza':             'Pâte fine levée 48h, sauce tomate maison, garnitures généreuses. L\'authenticité italienne à chaque part.',

  // ── PAR CATÉGORIE ────────────────────────────────────────
  '_boisson':          'Une boisson sélectionnée avec soin pour accompagner chaque moment de votre journée.',
  '_burger':           'Préparé minute, avec des ingrédients frais sélectionnés chaque matin.',
  '_pizza':            'Pâte artisanale, garnitures généreuses, cuite au four à haute température.',
  '_dessert':          'Une création sucrée pour clore le repas en beauté.',
  '_default':          'Une création Shashap, préparée avec soin et passion pour votre plaisir.',
};

/**
 * Retourne une description gastronomique pour un produit.
 * Priorité : 1) description API  2) correspondance nom  3) catégorie  4) défaut
 */
function getGastroDescription(product) {
  // 1. Description de l'API — priorité absolue
  if (product.description && product.description.trim().length > 5) {
    return stripHtml(product.description);
  }

  var nameLower = (product.name || '').toLowerCase();

  // 2. Correspondance exacte sur le nom
  for (var key in GASTRO_DESCRIPTIONS) {
    if (key.startsWith('_')) continue;
    if (nameLower.includes(key)) {
      return GASTRO_DESCRIPTIONS[key];
    }
  }

  // 3. Correspondance sur la catégorie
  var catKey = '_' + (product.category || '').toLowerCase();
  if (GASTRO_DESCRIPTIONS[catKey]) {
    return GASTRO_DESCRIPTIONS[catKey];
  }

  // 4. Description par défaut
  return GASTRO_DESCRIPTIONS['_default'];
}

// ============================================================
// 🖼️ CHARGEMENT D'IMAGES — Corrigé (CORS + erreurs silencieuses)
// ============================================================

/**
 * Charge une image depuis une URL et retourne sa base64.
 * Gère : CORS, erreurs silencieuses, timeout, formats mixtes.
 *
 * CORRECTION BUG IMAGES :
 * - Ne pas ajouter ?_t= sur les URLs proxy (casse le cache)
 * - Gérer le cas où canvas.toDataURL() échoue (CORS tainted)
 * - Timeout de 8 secondes pour éviter les blocages infinis
 */
function loadImageBase64(url) {
  return new Promise(function(resolve) {
    if (!url || typeof url !== 'string' || url.trim() === '' || url === 'null') {
      resolve(null);
      return;
    }

    var isExternal = url.startsWith('http://') || url.startsWith('https://');
    var isProxy    = url.startsWith('/proxy-image');

    var img = new Image();

    // crossOrigin uniquement sur URLs externes directes
    if (isExternal && !isProxy) {
      img.crossOrigin = 'Anonymous';
    }

    // Timeout de sécurité — évite les blocages infinis
    var timeout = setTimeout(function() {
      img.src = '';
      resolve(null);
    }, 8000);

    img.onload = function() {
      clearTimeout(timeout);
      try {
        var canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth  || img.width  || 400;
        canvas.height = img.naturalHeight || img.height || 300;

        var ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // toDataURL peut échouer si l'image est CORS tainted
        try {
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } catch (corsErr) {
          // Tentative JPEG → PNG
          try {
            resolve(canvas.toDataURL('image/png'));
          } catch (e) {
            resolve(null);
          }
        }
      } catch (e) {
        resolve(null);
      }
    };

    img.onerror = function() {
      clearTimeout(timeout);
      resolve(null);
    };

    // CORRECTION : ne pas ajouter ?_t= sur les URLs proxy
    // Cela cassait le cache et forçait des re-téléchargements inutiles
    if (isProxy) {
      img.src = url;
    } else if (isExternal) {
      // Cache-bust uniquement sur les URLs externes directes
      img.src = url + (url.includes('?') ? '&' : '?') + '_cb=' + Date.now();
    } else {
      img.src = url;
    }
  });
}

/**
 * Génère un QR Code base64 depuis l'API publique qrserver.com
 */
function generateQrCodeBase64(targetUrl) {
  var qrApiUrl = [
    'https://api.qrserver.com/v1/create-qr-code/',
    '?size=300x300',
    '&data=', encodeURIComponent(targetUrl),
    '&color=0D0C10',
    '&bgcolor=F8EEF3',
    '&qzone=2',
    '&format=png'
  ].join('');

  return loadImageBase64(qrApiUrl);
}

// ============================================================
// 🎨 DESSIN PDF — Fonctions de rendu
// ============================================================

/**
 * Dessine un rectangle avec coins arrondis simulés (compatible jsPDF).
 */
function drawRoundedCard(doc, x, y, w, h, color) {
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');
}

/**
 * Dessine la bannière d'une catégorie.
 * Style : pleine largeur, fond rose, titre centré.
 */
function drawCategoryBanner(doc, categoryName, y, pW, colors) {
  var bannerH = 18;

  // Fond rose pleine largeur
  doc.setFillColor(colors.rose[0], colors.rose[1], colors.rose[2]);
  doc.rect(0, y, pW, bannerH, 'F');

  // Lignes décoratives haut/bas
  doc.setFillColor(colors.charbon[0], colors.charbon[1], colors.charbon[2]);
  doc.rect(0, y, pW, 0.8, 'F');
  doc.rect(0, y + bannerH - 0.8, pW, 0.8, 'F');

  // Nom de catégorie
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(14);
  doc.setTextColor(colors.creme[0], colors.creme[1], colors.creme[2]);
  doc.text(categoryName, pW / 2, y + 12, { align: 'center' });

  return bannerH;
}

/**
 * Dessine une carte produit HÉROS (pleine largeur).
 * Utilisée pour le premier produit de chaque catégorie.
 */
function drawHeroCard(doc, product, curY, pW, mg, colors) {
  var imgH   = 70;   // Hauteur de l'image
  var infoH  = 45;   // Hauteur de la zone info
  var cardH  = imgH + infoH;
  var cardW  = pW - 2 * mg;

  // Fond de la carte
  doc.setFillColor(colors.charbon[0], colors.charbon[1], colors.charbon[2]);
  doc.roundedRect(mg, curY, cardW, cardH, 3, 3, 'F');

  // Image pleine largeur
  if (product._cachedImg) {
    // Clip simulé via dessin au-dessus
    doc.addImage(product._cachedImg, 'JPEG', mg, curY, cardW, imgH);
  } else {
    // Placeholder élégant
    doc.setFillColor(colors.charbon[0] + 15, colors.charbon[1] + 10, colors.charbon[2] + 15);
    doc.rect(mg, curY, cardW, imgH, 'F');
    doc.setFont('times', 'italic');
    doc.setFontSize(32);
    doc.setTextColor(colors.rose[0], colors.rose[1], colors.rose[2]);
    doc.text(getCategoryEmoji(product.category), pW / 2, curY + imgH / 2 + 6, { align: 'center' });
  }

  // Ligne séparatrice rose
  doc.setFillColor(colors.rose[0], colors.rose[1], colors.rose[2]);
  doc.rect(mg, curY + imgH, cardW, 1, 'F');

  // Zone texte
  var txtY  = curY + imgH + 10;
  var txtX  = mg + 10;
  var maxTW = cardW - 20;

  // Nom du produit
  var name = stripHtml(product.name || 'CRÉATION SHASHAP').toUpperCase();
  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(colors.creme[0], colors.creme[1], colors.creme[2]);
  doc.text(name, pW / 2, txtY, { align: 'center' });

  // Description gastronomique
  var desc  = getGastroDescription(product);
  var lines = doc.splitTextToSize(desc, maxTW);
  if (lines.length > 2) lines = [lines[0], lines[1].substring(0, lines[1].length - 3) + '...'];

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(colors.blush[0], colors.blush[1], colors.blush[2]);
  doc.text(lines, pW / 2, txtY + 9, { align: 'center' });

  // Prix — badge arrondi
  var priceStr = formatPrice(product.price);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  var priceW = doc.getTextWidth(priceStr) + 14;
  var priceX = (pW - priceW) / 2;
  var priceY = curY + cardH - 12;

  doc.setFillColor(colors.rose[0], colors.rose[1], colors.rose[2]);
  doc.roundedRect(priceX, priceY - 5, priceW, 8, 3, 3, 'F');
  doc.setTextColor(colors.creme[0], colors.creme[1], colors.creme[2]);
  doc.text(priceStr, pW / 2, priceY + 1.5, { align: 'center' });

  return cardH;
}

/**
 * Dessine une carte produit STANDARD (image à gauche, texte à droite).
 * Alternée gauche/droite selon l'index.
 */
function drawStandardCard(doc, product, curY, pW, mg, colors, isRight) {
  var imgS  = 55;    // Carré image
  var cardH = 60;    // Hauteur totale de la carte
  var cardW = pW - 2 * mg;
  var gap   = 10;    // Espace entre image et texte

  // Fond de la carte
  doc.setFillColor(colors.charbon[0], colors.charbon[1], colors.charbon[2]);
  doc.roundedRect(mg, curY, cardW, cardH, 3, 3, 'F');

  // Positions selon alternance gauche/droite
  var imgX = isRight ? (mg + cardW - imgS) : mg;
  var txtX = isRight ? mg + gap            : mg + imgS + gap;
  var txtW = cardW - imgS - gap * 2;

  // Image ou placeholder
  if (product._cachedImg) {
    doc.addImage(product._cachedImg, 'JPEG', imgX, curY, imgS, imgS);
  } else {
    doc.setFillColor(colors.charbon[0] + 20, colors.charbon[1] + 15, colors.charbon[2] + 20);
    doc.rect(imgX, curY, imgS, imgS, 'F');
    doc.setFont('times', 'italic');
    doc.setFontSize(20);
    doc.setTextColor(colors.rose[0], colors.rose[1], colors.rose[2]);
    doc.text(getCategoryEmoji(product.category), imgX + imgS / 2, curY + imgS / 2 + 4, { align: 'center' });
  }

  // Ligne séparatrice verticale rose
  var lineX = isRight ? imgX : imgX + imgS;
  doc.setFillColor(colors.rose[0], colors.rose[1], colors.rose[2]);
  doc.rect(lineX, curY + 6, 0.8, imgS - 12, 'F');

  // Nom du produit
  var name = stripHtml(product.name || 'CRÉATION SHASHAP').toUpperCase();
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(colors.creme[0], colors.creme[1], colors.creme[2]);
  doc.text(name, txtX, curY + 14);

  // Description
  var desc  = getGastroDescription(product);
  var lines = doc.splitTextToSize(desc, txtW);
  if (lines.length > 2) lines = [lines[0], lines[1].substring(0, lines[1].length - 3) + '...'];

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.blush[0], colors.blush[1], colors.blush[2]);
  doc.text(lines, txtX, curY + 23);

  // Prix — badge compact
  var priceStr = formatPrice(product.price);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  var priceW = doc.getTextWidth(priceStr) + 10;
  var priceY = curY + cardH - 11;

  doc.setFillColor(colors.rose[0], colors.rose[1], colors.rose[2]);
  doc.roundedRect(txtX, priceY - 4, priceW, 7, 2, 2, 'F');
  doc.setTextColor(colors.creme[0], colors.creme[1], colors.creme[2]);
  doc.text(priceStr, txtX + 5, priceY + 1.5);

  return cardH;
}

/**
 * Emoji par catégorie — pour les placeholders image.
 */
function getCategoryEmoji(cat) {
  var map = {
    'Burger': '🍔',
    'Pizza':  '🍕',
    'Boisson':'🥤',
    'Dessert':'🍰',
  };
  return map[cat] || '🍽️';
}

// ============================================================
// 📥 EXPORT PDF PRINCIPAL — exportCatalogPDF()
// Remplace entièrement l'ancienne version
// ============================================================
async function exportCatalogPDF() {
  try {
    // ── Vérification des prérequis ──────────────────────────
    if (!window.jspdf) {
      showCatalogToast("Erreur : jsPDF n'est pas chargé", 'error');
      return;
    }

    var products = catalogProducts.filter(function(p) { return p.isAvailable; });
    if (!products.length) {
      showCatalogToast('Aucun produit disponible pour l\'export', 'error');
      return;
    }

    showCatalogToast('Génération du magazine en cours...', 'info');

    // ── Palette de couleurs ─────────────────────────────────
    var colors = {
      noir:    [13,  12,  16 ],   // #0D0C10
      charbon: [38,  32,  41 ],   // #262029
      rose:    [184, 112, 143],   // #B8708F
      blush:   [240, 184, 205],   // #F0B8CD
      creme:   [248, 238, 243],   // #F8EEF3
    };

    // ── Dimensions A4 ───────────────────────────────────────
    var pW = 210, pH = 297, mg = 12;
    var menuUrl = 'https://shapshap-admin-malik.up.railway.app';

    // ── Préchargement de toutes les images en parallèle ─────
    // CORRECTION : on attend correctement chaque image
    showCatalogToast('Chargement des images...', 'info');

    var imagePromises = products.map(function(p) {
      if (!p.imageUrl) return Promise.resolve(null);
      var proxyUrl = '/proxy-image?url=' + encodeURIComponent(p.imageUrl);
      return loadImageBase64(proxyUrl).then(function(img) {
        p._cachedImg = img;   // Stockage par effet de bord
        return img;
      });
    });

    var qrPromise = generateQrCodeBase64(menuUrl);

    // On attend tout en parallèle
    var allResults = await Promise.all([qrPromise].concat(imagePromises));
    var qrCodeImg  = allResults[0];

    // ── Initialisation jsPDF ────────────────────────────────
    var doc      = new jspdf.jsPDF('p', 'mm', 'a4');
    var pageNum  = 1;
    var curY     = 0;

    // ── Fond de page + footer ────────────────────────────────
    function drawPageBackground() {
      doc.setFillColor(colors.noir[0], colors.noir[1], colors.noir[2]);
      doc.rect(0, 0, pW, pH, 'F');

      // Lignes décoratives
      doc.setFillColor(colors.charbon[0], colors.charbon[1], colors.charbon[2]);
      doc.rect(mg, mg, pW - 2 * mg, 0.4, 'F');
      doc.rect(mg, pH - mg - 0.4, pW - 2 * mg, 0.4, 'F');

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 90, 105);
      doc.text("SHASHAP — L'ART DE LA GASTRONOMIE", mg, pH - 5);
      doc.text('PAGE ' + pageNum, pW - mg, pH - 5, { align: 'right' });
      pageNum++;
    }

    // ── Vérifie si une nouvelle page est nécessaire ──────────
    function checkPageBreak(neededH) {
      if (curY + neededH > pH - mg - 10) {
        doc.addPage();
        drawPageBackground();
        curY = mg + 8;
      }
    }

    // ════════════════════════════════════════════════════════
    // PAGE 1 — COUVERTURE MAGAZINE
    // ════════════════════════════════════════════════════════
    doc.setFillColor(colors.noir[0], colors.noir[1], colors.noir[2]);
    doc.rect(0, 0, pW, pH, 'F');

    // Image de couverture (premier produit avec image)
    var coverProduct = products.find(function(p) { return p._cachedImg; });
    if (coverProduct && coverProduct._cachedImg) {
      // Image pleine page en haut
      doc.addImage(coverProduct._cachedImg, 'JPEG', 0, 0, pW, 155);

      // Dégradé simulé noir → transparent (superposition)
      doc.setFillColor(colors.noir[0], colors.noir[1], colors.noir[2]);
      doc.rect(0, 110, pW, 45, 'F');     // Bas de l'image masqué progressivement
    } else {
      // Fond uni si aucune image disponible
      doc.setFillColor(colors.charbon[0], colors.charbon[1], colors.charbon[2]);
      doc.rect(0, 0, pW, 155, 'F');
    }

    // Ligne rose séparatrice
    doc.setFillColor(colors.rose[0], colors.rose[1], colors.rose[2]);
    doc.rect(0, 152, pW, 1.5, 'F');

    // Zone titre
    doc.setFont('times', 'bold');
    doc.setFontSize(48);
    doc.setTextColor(colors.creme[0], colors.creme[1], colors.creme[2]);
    doc.text('S H A S H A P', pW / 2, 175, { align: 'center' });

    // Sous-titre italique
    doc.setFont('times', 'italic');
    doc.setFontSize(13);
    doc.setTextColor(colors.blush[0], colors.blush[1], colors.blush[2]);
    doc.text("L'art de la gastronomie", pW / 2, 185, { align: 'center' });

    // Ligne décorative rose courte
    doc.setFillColor(colors.rose[0], colors.rose[1], colors.rose[2]);
    doc.rect(pW / 2 - 18, 190, 36, 0.7, 'F');

    // Nombre de créations
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(colors.rose[0], colors.rose[1], colors.rose[2]);
    doc.text('Découvrez ' + products.length + ' créations exclusives', pW / 2, 198, { align: 'center' });

    // QR Code couverture
    if (qrCodeImg) {
      var qrCoverS = 30;
      var qrCoverX = pW / 2 - qrCoverS / 2;
      var qrCoverY = 215;

      // Cadre QR
      doc.setFillColor(colors.charbon[0], colors.charbon[1], colors.charbon[2]);
      doc.roundedRect(qrCoverX - 5, qrCoverY - 5, qrCoverS + 10, qrCoverS + 10, 3, 3, 'F');
      doc.setFillColor(colors.rose[0], colors.rose[1], colors.rose[2]);
      doc.rect(qrCoverX - 5, qrCoverY - 5, qrCoverS + 10, 0.6, 'F');

      doc.addImage(qrCodeImg, 'PNG', qrCoverX, qrCoverY, qrCoverS, qrCoverS);
      doc.link(qrCoverX, qrCoverY, qrCoverS, qrCoverS, { url: menuUrl });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(150, 140, 155);
      doc.text('SCANNER POUR COMMANDER', pW / 2, qrCoverY + qrCoverS + 10, { align: 'center' });
    }

    // Pied de couverture
    var today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 70, 85);
    doc.text('CARTE OFFICIELLE DES SÉLECTIONS', mg, pH - 15);
    doc.text('Édition du ' + new Date().toLocaleDateString('fr-FR'), pW - mg, pH - 15, { align: 'right' });

    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(colors.rose[0], colors.rose[1], colors.rose[2]);
    doc.text(products.length + ' CRÉATIONS EXCLUSIVES', mg, pH - 8);

    doc.setTextColor(80, 70, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Édition du ' + new Date().toLocaleDateString('fr-FR'), pW - mg, pH - 8, { align: 'right' });

    // ════════════════════════════════════════════════════════
    // PAGES INTÉRIEURES — CATALOGUE PAR CATÉGORIES
    // ════════════════════════════════════════════════════════
    doc.addPage();
    drawPageBackground();
    curY = mg + 8;

    // Groupement des produits par catégorie
    var sections = {};
    products.forEach(function(p) {
      var cat = (p.category || 'INCONTOURNABLES').toUpperCase();
      if (!sections[cat]) sections[cat] = [];
      sections[cat].push(p);
    });

    // Entête de la carte des saveurs
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(colors.creme[0], colors.creme[1], colors.creme[2]);
    doc.text('SHASHAP', mg, curY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(colors.rose[0], colors.rose[1], colors.rose[2]);
    doc.text('LA CARTE DES SAVEURS', mg, curY + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 70, 85);
    doc.text('Édition du ' + new Date().toLocaleDateString('fr-FR'), pW - mg, curY + 8, { align: 'right' });

    doc.setFillColor(colors.rose[0], colors.rose[1], colors.rose[2]);
    doc.rect(mg, curY + 20, pW - 2 * mg, 0.5, 'F');

    curY += 30;

    var cardIndex = 0;   // Index global pour alternance droite/gauche

    // ── Boucle principale par catégorie ─────────────────────
    for (var sec in sections) {
      if (!sections.hasOwnProperty(sec)) continue;
      var prods = sections[sec];

      // Nouvelle page pour chaque catégorie (sauf la première)
      if (cardIndex > 0) {
        doc.addPage();
        drawPageBackground();
        curY = mg + 8;
      }

      // Bannière de catégorie
      checkPageBreak(25);
      var bannerH = drawCategoryBanner(doc, '— ' + sec + ' —', curY, pW, colors);
      curY += bannerH + 8;

      // Produits de la catégorie
      prods.forEach(function(p, idx) {
        var isHero  = (idx === 0);                    // Premier produit = héros
        var isRight = (cardIndex % 2 !== 0);          // Alternance gauche/droite

        if (isHero) {
          // ─ Carte héros ──────────────────────────────────
          checkPageBreak(145);
          var heroH = drawHeroCard(doc, p, curY, pW, mg, colors);
          curY += heroH + 10;
        } else {
          // ─ Carte standard ───────────────────────────────
          checkPageBreak(70);
          var stdH = drawStandardCard(doc, p, curY, pW, mg, colors, isRight);
          curY += stdH + 8;
        }

        cardIndex++;
      });
    }

    // ════════════════════════════════════════════════════════
    // DERNIÈRE PAGE — CALL TO ACTION
    // ════════════════════════════════════════════════════════
    doc.addPage();
    drawPageBackground();

    // Titre final
    doc.setFont('times', 'italic');
    doc.setFontSize(26);
    doc.setTextColor(colors.creme[0], colors.creme[1], colors.creme[2]);
    doc.text("L'expérience continue", pW / 2, 65, { align: 'center' });
    doc.text('chez vous.', pW / 2, 77, { align: 'center' });

    doc.setFillColor(colors.rose[0], colors.rose[1], colors.rose[2]);
    doc.rect(pW / 2 - 20, 84, 40, 0.6, 'F');

    // Grand QR Code
    var qrFinalS = 65;
    var qrFinalX = (pW - qrFinalS) / 2;
    var qrFinalY = 100;

    // Cadre luxueux
    doc.setFillColor(colors.charbon[0], colors.charbon[1], colors.charbon[2]);
    doc.roundedRect(qrFinalX - 10, qrFinalY - 10, qrFinalS + 20, qrFinalS + 20, 5, 5, 'F');
    doc.setFillColor(colors.rose[0], colors.rose[1], colors.rose[2]);
    doc.rect(qrFinalX - 10, qrFinalY - 10, qrFinalS + 20, 1, 'F');
    doc.rect(qrFinalX - 10, qrFinalY + qrFinalS + 9, qrFinalS + 20, 1, 'F');

    if (qrCodeImg) {
      doc.addImage(qrCodeImg, 'PNG', qrFinalX, qrFinalY, qrFinalS, qrFinalS);
      doc.link(qrFinalX, qrFinalY, qrFinalS, qrFinalS, { url: menuUrl });
    }

    // CTA texte
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colors.rose[0], colors.rose[1], colors.rose[2]);
    doc.text('SCANNEZ POUR COMMANDER MAINTENANT', pW / 2, 185, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(colors.blush[0], colors.blush[1], colors.blush[2]);
    doc.text('Ou cliquez directement sur le QR code', pW / 2, 193, { align: 'center' });

    // Infos contact
    var contactY = 215;
    var contacts = [
      { label: 'Site web',   val: menuUrl },
      { label: 'Instagram',  val: '@shashap_ne' },
      { label: 'Localisation', val: 'Niamey, Niger' },
    ];

    contacts.forEach(function(c, i) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(colors.rose[0], colors.rose[1], colors.rose[2]);
      doc.text(c.label.toUpperCase(), mg + 10, contactY + i * 12);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.creme[0], colors.creme[1], colors.creme[2]);
      doc.text(c.val, mg + 45, contactY + i * 12);
    });

    // Logo final
    doc.setFont('times', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(colors.creme[0], colors.creme[1], colors.creme[2]);
    doc.text('S H A S H A P', pW / 2, 262, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(70, 60, 75);
    doc.text("Niamey, Niger  •  L'Art de la Gastronomie  •  " + new Date().getFullYear(), pW / 2, 270, { align: 'center' });

    // ── Sauvegarde ──────────────────────────────────────────
    var filename = 'Magazine_Shashap_' + new Date().toISOString().split('T')[0] + '.pdf';
    doc.save(filename);
    showCatalogToast('Magazine généré avec succès !', 'success');

  } catch (error) {
    console.error('[SHASHAP PDF] Erreur:', error);
    showCatalogToast('Erreur : ' + error.message, 'error');
  }
}