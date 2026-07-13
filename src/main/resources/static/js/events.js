// ============================================================
// 🎤 ÉVÉNEMENTS — gestion des soirées/lives
// ============================================================
function openEventModal(editIndex = null) {
  const existing = editIndex !== null ? storiesData[editIndex] : null;
  const isEdit = existing !== null;
  const today = new Date().toISOString().split('T')[0];

  // Extraction sécurisée des valeurs existantes
  const getVal = (key, defaultVal = '') => existing && existing[key] !== undefined ? existing[key] : defaultVal;

  // Logique billetterie existante
  const currentPrice = parseFloat(getVal('price', 0));
  const isFreeEvent = currentPrice === 0;

  // Création ou récupération du modal
  let modal = document.getElementById('eventModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'eventModal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  // --- STYLES ENCAPSULÉS (UI Premium Linear/Apple) ---
  const modalStyles = `
    <style>
      .sh-modal-wrapper { display: flex; justify-content: center; align-items: center; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      .sh-modal-content { background: #F9FAFB; border-radius: 16px; width: 100%; max-width: 700px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #E5E7EB; }
      .sh-modal-header { padding: 20px 24px; background: #FFFFFF; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; z-index: 10; }
      .sh-modal-header h3 { margin: 0; font-size: 18px; font-weight: 600; color: #111827; letter-spacing: -0.02em; }
      .sh-modal-body { padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; }

      /* Cartes (Sections) */
      .sh-card { background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; padding: 20px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03); transition: box-shadow 0.2s ease; }
      .sh-card:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
      .sh-card-title { font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.05em; }

      /* Grilles et Inputs */
      .sh-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .sh-input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
      .sh-input-group.mb-0 { margin-bottom: 0; }
      .sh-label { font-size: 13px; font-weight: 500; color: #4B5563; }
      .sh-input, .sh-select, .sh-textarea { width: 100%; padding: 10px 14px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; color: #111827; background: #F9FAFB; transition: all 0.2s ease; box-sizing: border-box; }
      .sh-input:focus, .sh-select:focus, .sh-textarea:focus { outline: none; border-color: #111827; background: #FFFFFF; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
      .sh-textarea { resize: vertical; min-height: 80px; }

      /* Billetterie Radio */
      .sh-radio-group { display: flex; gap: 24px; margin-bottom: 16px; }
      .sh-radio-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: #374151; cursor: pointer; }
      .sh-radio-label input { width: 16px; height: 16px; accent-color: #111827; cursor: pointer; }

      /* Footer */
      .sh-modal-footer { padding: 16px 24px; background: #FFFFFF; border-top: 1px solid #E5E7EB; display: flex; justify-content: flex-end; gap: 12px; z-index: 10; }
      .sh-btn { padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; border: none; }
      .sh-btn-outline { background: #FFFFFF; border: 1px solid #D1D5DB; color: #374151; }
      .sh-btn-outline:hover { background: #F3F4F6; }
      .sh-btn-primary { background: #111827; color: #FFFFFF; }
      .sh-btn-primary:hover { background: #374151; }

      /* Utilitaires */
      .sh-preview-img { max-width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-top: 8px; border: 1px solid #E5E7EB; display: none; }
    </style>
  `;

  // --- TEMPLATES MODULAIRES ---
  const generalSection = `
    <div class="sh-card">
      <h4 class="sh-card-title">📝 Informations générales</h4>
      <div class="sh-grid-2">
        <div class="sh-input-group">
          <label class="sh-label">Nom de l'artiste / DJ <span style="color:#E53935">*</span></label>
          <input type="text" id="evArtistName" class="sh-input" placeholder="Ex: Barakina" value="${getVal('artistName', getVal('name'))}">
        </div>
        <div class="sh-input-group">
          <label class="sh-label">Type d'événement</label>
          <select id="evEventType" class="sh-select">
            <option value="Concert" ${getVal('eventType') === 'Concert' ? 'selected' : ''}>Concert</option>
            <option value="DJ Set" ${getVal('eventType') === 'DJ Set' ? 'selected' : ''}>DJ Set</option>
            <option value="Festival" ${getVal('eventType') === 'Festival' ? 'selected' : ''}>Festival</option>
            <option value="Showcase" ${getVal('eventType') === 'Showcase' ? 'selected' : ''}>Showcase</option>
            <option value="Soirée VIP" ${getVal('eventType') === 'Soirée VIP' ? 'selected' : ''}>Soirée VIP</option>
            <option value="Conférence" ${getVal('eventType') === 'Conférence' ? 'selected' : ''}>Conférence</option>
            <option value="Exposition" ${getVal('eventType') === 'Exposition' ? 'selected' : ''}>Exposition</option>
            <option value="Autre" ${getVal('eventType') === 'Autre' ? 'selected' : ''}>Autre</option>
          </select>
        </div>
      </div>
      <div class="sh-input-group">
        <label class="sh-label">Nom de l'événement <span style="color:#E53935">*</span></label>
        <input type="text" id="evEventName" class="sh-input" placeholder="Ex: The Summer Vibes Festival" value="${getVal('eventName')}">
      </div>
      <div class="sh-grid-2">
        <div class="sh-input-group mb-0">
          <label class="sh-label">Sous-titre (Optionnel)</label>
          <input type="text" id="evSubtitle" class="sh-input" placeholder="Ex: Live Concert" value="${getVal('subtitle')}">
        </div>
        <div class="sh-input-group mb-0">
          <label class="sh-label">Slogan (Optionnel)</label>
          <input type="text" id="evSlogan" class="sh-input" placeholder="Ex: One Night • One Stage" value="${getVal('slogan')}">
        </div>
      </div>
      <div class="sh-input-group" style="margin-top: 16px;">
        <label class="sh-label">Description</label>
        <textarea id="evDescription" class="sh-textarea" placeholder="Détails de l'événement...">${getVal('description')}</textarea>
      </div>
    </div>
  `;

  const dateTimeSection = `
    <div class="sh-card">
      <h4 class="sh-card-title">📅 Date et Heure</h4>
      <div class="sh-grid-2">
        <div class="sh-input-group mb-0">
          <label class="sh-label">Date <span style="color:#E53935">*</span></label>
          <!-- ID conservé pour ne pas casser l'ancien onchange="validateEventDates()" -->
          <input type="date" id="evStartDate" class="sh-input" value="${getVal('startDate', today)}" onchange="typeof validateEventDates === 'function' && validateEventDates()">
          <!-- Champ caché pour la rétrocompatibilité stricte si validateEventDates cherche evEndDate -->
          <input type="hidden" id="evEndDate" value="${getVal('endDate', today)}">
        </div>
        <div class="sh-grid-2" style="gap: 8px;">
          <div class="sh-input-group mb-0">
            <label class="sh-label">Heure début</label>
            <input type="time" id="evStartTime" class="sh-input" value="${getVal('startTime', '21:00')}">
          </div>
          <div class="sh-input-group mb-0">
            <label class="sh-label">Heure fin (Opt.)</label>
            <input type="time" id="evEndTime" class="sh-input" value="${getVal('endTime', '')}">
          </div>
        </div>
      </div>
      <span id="evDateError" style="color:#E53935; font-size:12px; display:none; margin-top:8px;"></span>
    </div>
  `;

  const locationSection = `
    <div class="sh-card">
      <h4 class="sh-card-title">📍 Localisation</h4>
      <div class="sh-input-group">
        <label class="sh-label">Lieu <span style="color:#E53935">*</span></label>
        <input type="text" id="evVenue" class="sh-input" placeholder="Ex: Stade Général Seyni Kountché" value="${getVal('venue')}">
      </div>
      <div class="sh-grid-2">
        <div class="sh-input-group mb-0">
          <label class="sh-label">Ville</label>
          <input type="text" id="evCity" class="sh-input" placeholder="Ex: Niamey" value="${getVal('city', 'Niamey')}">
        </div>
        <div class="sh-input-group mb-0">
          <label class="sh-label">Pays</label>
          <input type="text" id="evCountry" class="sh-input" placeholder="Ex: Niger" value="${getVal('country', 'Niger')}">
        </div>
      </div>
    </div>
  `;

  const ticketingSection = `
    <div class="sh-card">
      <h4 class="sh-card-title">🎟️ Billetterie</h4>
      <div class="sh-radio-group">
        <label class="sh-radio-label">
          <input type="radio" name="ticketType" value="free" ${isFreeEvent ? 'checked' : ''}>
          Gratuit
        </label>
        <label class="sh-radio-label">
          <input type="radio" name="ticketType" value="paid" ${!isFreeEvent ? 'checked' : ''}>
          Payant
        </label>
      </div>
      <div id="evPriceContainer" class="sh-input-group mb-0" style="display: ${isFreeEvent ? 'none' : 'block'}; max-width: 50%;">
        <label class="sh-label">Prix du billet (FCFA)</label>
        <input type="number" id="evPrice" class="sh-input" placeholder="Ex: 5000" min="0" value="${currentPrice}">
      </div>
    </div>
  `;

  const mediaSection = `
    <div class="sh-card">
      <h4 class="sh-card-title">🖼️ Médias (Phase 1)</h4>
      <div class="sh-grid-2">
        <div class="sh-input-group mb-0">
          <label class="sh-label">Photo Artiste (URL)</label>
          <input type="text" id="evImageUrl" class="sh-input" placeholder="https://..." value="${getVal('image')}">
          <img id="evPreviewArtist" class="sh-preview-img" src="${getVal('image')}" style="${getVal('image') ? 'display:block;' : ''}">
        </div>
        <div class="sh-input-group mb-0">
          <label class="sh-label">Image de Couverture (URL)</label>
          <input type="text" id="evCoverUrl" class="sh-input" placeholder="https://..." value="${getVal('coverImage')}">
          <img id="evPreviewCover" class="sh-preview-img" src="${getVal('coverImage')}" style="${getVal('coverImage') ? 'display:block;' : ''}">
        </div>
      </div>
    </div>
  `;

  // --- ASSEMBLAGE DU MODAL ---
  modal.innerHTML = `
    ${modalStyles}
    <div class="sh-modal-wrapper" style="width:100%; height:100%;">
      <div class="sh-modal-content">
        <div class="sh-modal-header">
          <h3>${isEdit ? '✏️ Modifier l\'événement' : '✨ Nouvel événement Premium'}</h3>
          <button class="close-btn" style="background:none; border:none; font-size:20px; cursor:pointer; color:#9CA3AF;" onclick="closeEventModal()">✕</button>
        </div>

        <div class="sh-modal-body">
          ${generalSection}
          ${dateTimeSection}
          ${locationSection}
          ${ticketingSection}
          ${mediaSection}
          <!-- Les futures sections (Sponsors, QR, Thèmes) viendront s'insérer ici -->
        </div>

        <div class="sh-modal-footer">
          <button class="sh-btn sh-btn-outline" onclick="closeEventModal()">Annuler</button>
          <button class="sh-btn sh-btn-primary" id="evSaveBtn">💾 Enregistrer l'événement</button>
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
  modal.style.backdropFilter = 'blur(4px)';

  // --- LOGIQUE D'INTERFACE DYNAMIQUE ---

  // 1. Gestion d'affichage du Prix
  const ticketRadios = modal.querySelectorAll('input[name="ticketType"]');
  const priceContainer = document.getElementById('evPriceContainer');
  const priceInput = document.getElementById('evPrice');

  ticketRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'paid') {
        priceContainer.style.display = 'block';
        if (priceInput.value == 0) priceInput.value = ''; // Reset visuel
      } else {
        priceContainer.style.display = 'none';
        priceInput.value = 0;
      }
    });
  });

  // 2. Prévisualisations d'images
  const setupPreview = (inputId, imgId) => {
    const input = document.getElementById(inputId);
    const img = document.getElementById(imgId);
    if (input && img) {
      input.addEventListener('input', () => {
        if (input.value) {
          img.src = input.value;
          img.style.display = 'block';
        } else {
          img.style.display = 'none';
        }
      });
    }
  };
  setupPreview('evImageUrl', 'evPreviewArtist');
  setupPreview('evCoverUrl', 'evPreviewCover');

  // Appel de validation initial si la fonction existe globalement
  if (typeof validateEventDates === 'function') validateEventDates();

  // --- SAUVEGARDE & VALIDATION ---
  document.getElementById('evSaveBtn').onclick = () => {
    // Récupération des champs obligatoires
    const artistName = document.getElementById('evArtistName').value.trim();
    const eventName = document.getElementById('evEventName').value.trim();
    const date = document.getElementById('evStartDate').value;
    const venue = document.getElementById('evVenue').value.trim();

    // Validations élégantes (Toasts)
    if (!artistName) { showToast('⚠️ Le nom de l\'artiste est requis', 'error'); return; }
    if (!eventName) { showToast('⚠️ Le nom de l\'événement est requis', 'error'); return; }
    if (!date) { showToast('⚠️ La date est obligatoire', 'error'); return; }
    if (!venue) { showToast('⚠️ Le lieu est requis', 'error'); return; }

    const isFree = document.querySelector('input[name="ticketType"]:checked').value === 'free';
    const finalPrice = isFree ? 0 : parseFloat(document.getElementById('evPrice').value) || 0;

    // Construction du Payload Mixte (Rétrocompatibilité + Nouveaux champs)
    const eventData = {
      // --- ANCIENNE LOGIQUE (Intouchée pour ne pas casser le code existant) ---
      id: existing?.id || Date.now(),
      name: eventName || artistName, // On priorise le nom de l'event pour l'affichage général
      artistName: artistName,
      eventDate: date, // Remplace l'ancien format texte libre par la date stricte
      description: document.getElementById('evDescription').value.trim(),
      startDate: date, // Gardé pour les anciens algos de tri
      endDate: date,   // Synchronisé avec la date unique pour éviter les erreurs
      image: document.getElementById('evImageUrl').value.trim(),
      category: 'Événement',
      price: finalPrice,
      promo: existing?.promo || null,
      seen: existing?.seen || false,
      isEvent: true,

      // --- NOUVEAUX CHAMPS (Phase 1 Shashap) ---
      eventType: document.getElementById('evEventType').value,
      eventName: eventName,
      subtitle: document.getElementById('evSubtitle').value.trim(),
      slogan: document.getElementById('evSlogan').value.trim(),
      startTime: document.getElementById('evStartTime').value,
      endTime: document.getElementById('evEndTime').value,
      venue: venue,
      city: document.getElementById('evCity').value.trim(),
      country: document.getElementById('evCountry').value.trim(),
      coverImage: document.getElementById('evCoverUrl').value.trim(),
      isFree: isFree
    };

    // Mise à jour de l'état global
    if (isEdit) {
      storiesData[editIndex] = eventData;
    } else {
      storiesData.unshift(eventData);
    }

    // Chaîne d'actions existante conservée
    saveStoriesToStorage();
    renderStories();
    closeEventModal();
    syncStoriesToBackend();
    loadEvents();
    showToast('✅ Événement configuré avec succès');
  };
}

// ✅ Validation en temps réel des dates
function validateEventDates() {
  const startInput = document.getElementById('evStartDate');
  const endInput = document.getElementById('evEndDate');
  const saveBtn = document.getElementById('evSaveBtn');
  const errorSpan = document.getElementById('evDateError');

  if (!startInput || !endInput || !saveBtn || !errorSpan) return;

  const start = startInput.value;
  const end = endInput.value;

  // Réinitialiser
  errorSpan.style.display = 'none';
  saveBtn.disabled = false;
  startInput.style.border = '1px solid #eee';
  endInput.style.border = '1px solid #eee';

  // Vérifier que les dates sont valides
  if (!start || !end) {
    saveBtn.disabled = true;
    return;
  }

  // La date de fin ne doit pas être avant la date de début
  if (end < start) {
    errorSpan.textContent = '⚠️ La date de fin doit être après la date de début';
    errorSpan.style.display = 'block';
    saveBtn.disabled = true;
    endInput.style.border = '1px solid #E53935';
    return;
  }

  // Empêcher les dates trop lointaines (> 1 an)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];
  if (end > maxDateStr) {
    errorSpan.textContent = '⚠️ La date de fin ne peut pas dépasser ' + maxDate.toLocaleDateString('fr-FR');
    errorSpan.style.display = 'block';
    saveBtn.disabled = true;
    endInput.style.border = '1px solid #E53935';
  }
}

function editEventByIndex(index) {
  openEventModal(index);
}

function deleteEventByIndex(index) {
  if (!confirm('Supprimer cet événement ?')) return;
  storiesData.splice(index, 1);
  saveStoriesToStorage();
  renderStories();
  syncStoriesToBackend();
  loadEvents();
  showToast('🗑️ Événement supprimé');
}

function closeEventModal() {
  const m = document.getElementById('eventModal');
  if (m) m.style.display = 'none';
}
// 1. La fonction d'animation du bouton Supprimer (inchangée)
function confirmDelete(button, index) {
  if (button.dataset.confirm === 'true') {
    deleteEventByIndex(index);
    return;
  }
  button.dataset.confirm = 'true';
  const originalHtml = button.innerHTML;

  button.style.background = '#DC2626';
  button.style.color = '#ffffff';
  button.style.borderColor = '#DC2626';
  button.style.transform = 'scale(1.05)';
  button.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
    Confirmer ?
  `;

  setTimeout(() => {
    if (button.dataset.confirm === 'true') {
      button.dataset.confirm = 'false';
      button.style.background = '#ffffff';
      button.style.color = '#DC2626';
      button.style.borderColor = 'rgba(220, 38, 38, 0.2)';
      button.style.transform = 'scale(1)';
      button.innerHTML = originalHtml;
    }
  }, 3000);
}

// 2. Ta fonction principale corrigée
function loadEvents() {
  const container = document.getElementById('eventsList');
  if (!container) return;

  const events = storiesData.filter(s => s.isEvent);

  if (events.length === 0) {
    container.innerHTML = `
      <div style="
        text-align:center; padding:100px 20px; grid-column:1 / -1;
        background: linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%);
        border-radius:32px; border: 1px solid rgba(255, 255, 255, 0.5);
        box-shadow: inset 0 2px 4px rgba(255,255,255,0.8), 0 12px 24px -8px rgba(0,0,0,0.05);
        display: flex; flex-direction: column; align-items: center;
      ">
        <div style="font-size:64px; margin-bottom:24px; filter: drop-shadow(0 8px 12px rgba(0,0,0,0.1));">✨</div>
        <h3 style="font-family: 'New York', 'Playfair Display', serif; font-weight:600; color:#111827; font-size:28px; margin-bottom:12px;">L'agenda est vide</h3>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; color:#6B7280; font-size:16px; max-width:400px; margin:0 auto 32px; line-height: 1.5;">
          C'est le moment de créer une expérience inoubliable pour votre communauté.
        </p>
        <button onclick="/* ta fonction d'ouverture de modal */"
          style="
            height: 52px; padding: 0 32px; display:flex; align-items:center; justify-content:center; gap:8px;
            background: linear-gradient(135deg, #111827 0%, #374151 100%); color:#ffffff; border: none; border-radius: 26px;
            font-size:15px; font-weight:600; cursor:pointer; box-shadow: 0 8px 20px rgba(17, 24, 39, 0.3), inset 0 1px 1px rgba(255,255,255,0.2); transition: all 0.3s ease;
          "
          onmouseover="this.style.boxShadow='0 12px 24px rgba(17, 24, 39, 0.4)'; this.style.transform='translateY(-2px)';"
          onmouseout="this.style.boxShadow='0 8px 20px rgba(17, 24, 39, 0.3)'; this.style.transform='translateY(0)';"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Créer un événement
        </button>
      </div>`;
    return;
  }

  let html = '';
  events.forEach((ev, idx) => {
    const realIndex = storiesData.indexOf(ev);
    const displayDate = ev.eventDate || "19 JUIL • 21H";
    const title = ev.artistName || ev.name || 'Événement Exclusif';

    html += `
      <div style="
        position:relative; background:#ffffff; border-radius: 32px; overflow:hidden;
        box-shadow: 0 24px 48px -12px rgba(0,0,0,0.08), 0 4px 16px -2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1);
        transition: all 0.5s cubic-bezier(0.2,0.8,0.2,1);
        display:flex; flex-direction:column; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
      "
      onmouseover="
        this.style.transform='translateY(-6px)';
        this.style.boxShadow='0 32px 64px -12px rgba(0,0,0,0.12), 0 8px 24px -4px rgba(0,0,0,0.06)';
        const img = this.querySelector('.event-img'); if(img) img.style.transform='scale(1.05)';
      "
      onmouseout="
        this.style.transform='translateY(0)';
        this.style.boxShadow='0 24px 48px -12px rgba(0,0,0,0.08), 0 4px 16px -2px rgba(0,0,0,0.04)';
        const img = this.querySelector('.event-img'); if(img) img.style.transform='scale(1)';
      ">

        <!-- Image immersive -->
        <div style="width:100%; height: 280px; overflow:hidden; position:relative; background: #111;">
          ${ ev.image
            ? `<img src="${ev.image}" alt="${title}" class="event-img" style="width:100%; height:100%; object-fit:cover; display:block; transition: transform 0.8s cubic-bezier(0.2,0.8,0.2,1);" />`
            : `<div class="event-img" style="width:100%; height:100%; background: linear-gradient(135deg, #2c3e50, #000000); display:flex; align-items:center; justify-content:center; transition: transform 0.8s cubic-bezier(0.2,0.8,0.2,1);"><span style="font-size:64px; opacity:0.3;">🎵</span></div>`
          }
          <div style="position:absolute; inset:0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);"></div>

          <!-- Badges de l'image -->
          <div style="position:absolute; top:20px; left:20px; backdrop-filter: blur(12px) saturate(180%); -webkit-backdrop-filter: blur(12px) saturate(180%); background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 16px; padding: 6px 12px; color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display:flex; align-items:center; gap:6px;">
            📅 ${displayDate}
          </div>
          <div style="position:absolute; top:20px; right:20px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 6px 12px; color: #ffffff; font-size: 12px; font-weight: 600; display:flex; align-items:center; gap: 6px;">
            <span style="display:block; width:8px; height:8px; background:#10B981; border-radius:50%; box-shadow: 0 0 8px rgba(16,185,129,0.8);"></span> À venir
          </div>
          <div style="position:absolute; bottom: 36px; left:24px; right:24px;">
            <h3 style="margin:0 0 4px 0; color:#ffffff; font-family: 'New York', 'Playfair Display', serif; font-size: 30px; font-weight: 600; letter-spacing: -0.5px; text-shadow: 0 4px 12px rgba(0,0,0,0.5); line-height: 1.1;">${title}</h3>
          </div>
        </div>

        <!-- Corps de la carte -->
        <div style="padding: 24px; flex:1; display:flex; flex-direction:column; gap: 24px;">

          <!-- Description de l'événement (HARAKA, etc.) -->
          <p style="
            margin: 0; font-size: 15px; color: #4B5563; line-height: 1.6;
            font-weight: 400; min-height: 44px;
          ">
            ${ev.description || 'Aucune description pour cet événement.'}
          </p>

          <!-- Badges de contexte fixes (Style Notion/Linear) -->
          <div style="display:flex; flex-wrap:wrap; gap: 8px;">
            <div style="display:flex; align-items:center; gap:6px; background:#F3F4F6; padding:6px 12px; border-radius:12px; color:#4B5563; font-size:12px; font-weight:600;">
              🎧 DJ Set
            </div>
            <div style="display:flex; align-items:center; gap:6px; background:#F3F4F6; padding:6px 12px; border-radius:12px; color:#4B5563; font-size:12px; font-weight:600;">
              ✨ Premium
            </div>
          </div>

          <!-- Boutons -->
          <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:auto;">

            <button onclick="editEventByIndex(${realIndex})" style="min-width:100px; flex:1; height: 48px; padding: 0 12px; display:flex; align-items:center; justify-content:center; gap:6px; background: linear-gradient(135deg, #4c1d95 0%, #be185d 100%); color:#ffffff; border: none; border-radius: 16px; font-size:13px; font-weight:600; cursor:pointer; box-shadow: 0 6px 16px rgba(190, 24, 93, 0.25); transition: all 0.3s ease;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'" onmouseover="this.style.filter='brightness(1.1)'; this.style.boxShadow='0 8px 20px rgba(190, 24, 93, 0.4)';" onmouseout="this.style.filter='brightness(1)'; this.style.boxShadow='0 6px 16px rgba(190, 24, 93, 0.25)';">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg> Modifier
            </button>

            <button onclick="exportEventToPDF(${realIndex})" style="min-width:100px; flex:1; height: 48px; padding: 0 12px; display:flex; align-items:center; justify-content:center; gap:6px; background:#ffffff; color:#374151; border: 1px solid #E5E7EB; border-radius: 16px; font-size:13px; font-weight:600; cursor:pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.3s ease;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'" onmouseover="this.style.background='#F9FAFB'; this.style.borderColor='#D1D5DB'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.05)';" onmouseout="this.style.background='#ffffff'; this.style.borderColor='#E5E7EB'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.02)';">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> PDF
            </button>

            <button data-confirm="false" onclick="confirmDelete(this, ${realIndex})" style="min-width:100px; flex:1; height: 48px; padding: 0 12px; display:flex; align-items:center; justify-content:center; gap:6px; background:#ffffff; color:#DC2626; border: 1px solid rgba(220, 38, 38, 0.2); border-radius: 16px; font-size:13px; font-weight:600; cursor:pointer; transition: all 0.3s cubic-bezier(0.2,0.8,0.2,1);" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'" onmouseover="if(this.dataset.confirm !== 'true') { this.style.background='#FEF2F2'; this.style.borderColor='#DC2626'; this.style.boxShadow='0 4px 12px rgba(220, 38, 38, 0.1)'; }" onmouseout="if(this.dataset.confirm !== 'true') { this.style.background='#ffffff'; this.style.borderColor='rgba(220, 38, 38, 0.2)'; this.style.boxShadow='none'; }">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Supprimer
            </button>

          </div>
        </div>
      </div>`;
  });

  container.innerHTML = html;
}

async function exportEventToPDF(index) {
  const ev = storiesData[index];
  if (!ev) return;

  // --- 1. EXTRACTION & FORMATTAGE SÉCURISÉ DES NOUVELLES DONNÉES ---
  const artistName = ev.artistName || 'BARAKINA';
  const eventName = ev.eventName || ev.name || 'ÉVÉNEMENT';
  const eventType = ev.eventType || 'CONCERT';
  const subtitle = ev.subtitle ? ev.subtitle.trim() : '';
  const slogan = ev.slogan ? ev.slogan.trim() : '';

  // Gestion intelligente des dates et heures
  const dateStr = ev.startDate || "DATE À COMMUNIQUER";
  const timeStr = ev.startTime ? `${ev.startTime}${ev.endTime ? ` - ${ev.endTime}` : ''}` : '21H00';

  // Gestion de la localisation combinée
  const venue = ev.venue || 'Lieu à venir';
  const locationDetails = [ev.city, ev.country].filter(Boolean).join(', ');
  const fullLocationStr = locationDetails ? `${venue} (${locationDetails})` : venue;

  // Règle d'or de la billetterie
  const priceStr = ev.isFree || parseFloat(ev.price) === 0 ? "ENTRÉE GRATUITE" : `${ev.price} FCFA`;

  // Images
  const artistImage = ev.image || 'https://via.placeholder.com/800x1000/111/fff?text=Photo';
  const coverImage = ev.coverImage || '';

  // --- 2. ARCHITECTURE DES COMPOSANTS EXTENSIBLES (Thèmes & Couleurs) ---
  // Préparation Phase 2 : Tu pourras lier ces variables aux futurs champs du formulaire
  const theme = {
    primaryColor: '#CCFF00', // Le jaune signature Shashap
    backgroundColor: '#040404',
    cardBackground: '#020202',
    textColor: '#FFFFFF',
    mutedTextColor: '#888888'
  };

  // --- 3. GÉNÉRATION DU CANEVAS HAUTE RÉSOLUTION ---
  const poster = document.createElement('div');
  poster.id = "premium-dynamic-poster";

  // Texture papier de fond
  const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`;

  Object.assign(poster.style, {
    position: 'absolute',
    left: '-9999px',
    top: '0',
    width: '794px',   // Format A4 standard
    height: '1123px',
    backgroundColor: theme.backgroundColor,
    overflow: 'hidden',
    boxSizing: 'border-box'
  });

  poster.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@400;500;600;700;900&display=swap" rel="stylesheet">

    <!-- ================= CONTEXTE ATMOSPHÉRIQUE DYNAMIQUE ================= -->
    <div style="position: absolute; inset: 0; background-image: ${noiseTexture}; z-index: 1;"></div>

    <!-- Effet de couverture floutée (Style Apple Music / Spotify) -->
    ${coverImage ? `
      <img src="${coverImage}" crossorigin="anonymous" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(50px) brightness(15%); opacity: 0.35; z-index: 2;" />
    ` : ''}

    <!-- Faisceaux lumineux standards -->
    <div style="position: absolute; top: -10%; left: 10%; width: 200px; height: 800px; background: linear-gradient(165deg, rgba(255,255,255,0.02) 0%, transparent 60%); transform: rotate(10deg); filter: blur(20px); z-index: 3;"></div>
    <div style="position: absolute; top: -10%; right: 10%; width: 200px; height: 800px; background: linear-gradient(-165deg, rgba(255,255,255,0.02) 0%, transparent 60%); transform: rotate(-10deg); filter: blur(20px); z-index: 3;"></div>

    <!-- Brouillard coloré dynamique basé sur la couleur primaire -->
    <div style="position: absolute; top: 30%; left: 50%; transform: translateX(-50%); width: 90%; height: 50%; background: radial-gradient(circle, ${theme.primaryColor}0a 0%, transparent 70%); z-index: 3;"></div>
    <!-- ==================================================================== -->

    <div style="position: relative; width: 100%; height: 100%; z-index: 10; display: flex; flex-direction: column;">

      <!-- LOGO SHASHAP BRANDING -->
      <div style="position: absolute; top: 40px; left: 0; width: 100%; text-align: center; z-index: 20;">
        <span style="font-family: 'Montserrat', sans-serif; font-weight: 900; font-size: 14px; color: ${theme.textColor}; letter-spacing: 8px; opacity: 0.5; text-transform: uppercase;">
          SHASHAP<span style="color: ${theme.primaryColor};">.</span>
        </span>
      </div>

      <!-- PHOTO DE L'ARTISTE (Ratio vertical 64% x 55% validé) -->
      <div style="position: absolute; top: 10%; left: 50%; transform: translateX(-50%); width: 64%; height: 55%; z-index: 10; box-shadow: 0 40px 80px rgba(0,0,0,0.85); border-radius: 4px; overflow: hidden;">
        <img src="${artistImage}" crossorigin="anonymous" style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%) contrast(110%) brightness(95%);" />
        <div style="position: absolute; bottom: -2px; left: 0; width: 100%; height: 50%; background: linear-gradient(to top, ${theme.backgroundColor} 8%, transparent 100%);"></div>
      </div>

      <!-- BLOC TYPOGRAPHIQUE (Hiérarchie stricte sans ligne vide) -->
      <div style="position: absolute; top: 49%; left: 40px; right: 40px; text-align: center; z-index: 20;">

        <!-- Type d'événement (Badge discret) -->
        <div style="font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 11px; color: ${theme.primaryColor}; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 8px; opacity: 0.9;">
          // ${eventType}
        </div>

        <!-- Titre Principal (Nom de l'artiste ou de l'événement) -->
        <h1 style="font-family: 'Anton', sans-serif; font-size: 130px; margin: 0; color: ${theme.textColor}; line-height: 0.85; letter-spacing: -1px; text-transform: uppercase; text-shadow: 0 15px 30px rgba(0,0,0,0.9);">
          ${artistName}
        </h1>

        <!-- Sous-titre conditionnel (Ex: "Live Concert") -->
        ${subtitle ? `
          <h2 style="font-family: 'Montserrat', sans-serif; font-weight: 900; font-size: 22px; margin: 10px 0 0 0; color: ${theme.textColor}; letter-spacing: 12px; text-transform: uppercase; opacity: 0.95;">
            ${subtitle}
          </h2>
        ` : ''}

        <!-- Slogan conditionnel -->
        ${slogan ? `
          <h3 style="font-family: 'Montserrat', sans-serif; font-weight: 500; font-size: 11px; margin: 16px 0 0 0; color: ${theme.mutedTextColor}; letter-spacing: 4px; text-transform: uppercase;">
            ${slogan}
          </h3>
        ` : ''}
      </div>

      <!-- BLOC INFOS & QR CODE -->
      <div style="position: absolute; top: 73%; left: 60px; right: 60px; z-index: 20; display: flex; justify-content: space-between; align-items: flex-end;">

        <!-- Métadonnées de l'événement -->
        <div style="display: flex; flex-direction: column; gap: 16px; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; color: #E5E7EB; letter-spacing: 1px;">

          <!-- Date -->
          <div style="display: flex; align-items: center; gap: 14px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${theme.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span style="text-transform: uppercase;">${dateStr}</span>
          </div>

          <!-- Heure (Gère dynamiquement l'heure de fin si présente) -->
          <div style="display: flex; align-items: center; gap: 14px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${theme.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>${timeStr}</span>
          </div>

          <!-- Lieu & Ville / Pays -->
          <div style="display: flex; align-items: center; gap: 14px; max-width: 400px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${theme.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span style="line-height: 1.3;">${fullLocationStr}</span>
          </div>

          <!-- Prix / Entrée Gratuité native -->
          <div style="display: flex; align-items: center; gap: 14px; margin-top: 4px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${theme.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><path d="M4 10h16"></path><path d="M4 14h16"></path></svg>
            <span style="color: ${ev.isFree || parseFloat(ev.price) === 0 ? theme.primaryColor : theme.textColor}; font-weight: 700; text-transform: uppercase;">
              ${priceStr}
            </span>
          </div>
        </div>

        <!-- ZONE ENCAPSULÉE POUR LE QR CODE (Prête pour Phase 2) -->
        <div id="poster-qrcode-zone" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 700; color: ${theme.mutedTextColor}; text-transform: uppercase; letter-spacing: 2px;">
            Pass Officiel
          </div>
          <div style="background: #FFFFFF; padding: 6px; border-radius: 6px; width: 90px; height: 90px; box-shadow: 0 15px 30px rgba(0,0,0,0.5);">
            <!-- URL de repli propre pointant sur l'ID unique de l'événement -->
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=https://shashap.com/event/${ev.id || 'live'}&bgcolor=FFFFFF&color=000000&margin=0" crossorigin="anonymous" style="width: 100%; height: 100%; display: block;" />
          </div>
          <div style="font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 700; color: ${theme.primaryColor}; text-transform: uppercase; letter-spacing: 1px;">
            Scanner pour réserver
          </div>
        </div>
      </div>

      <!-- ZONE ENCAPSULÉE POUR LES SPONSORS (Style Monochrome Corporate - Prête pour Phase 2) -->
      <div id="poster-sponsors-zone" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 75px; background: ${theme.cardBackground}; border-top: 1px solid rgba(255, 255, 255, 0.04); display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 6px;">
        <div style="font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 600; color: #4B5563; text-transform: uppercase; letter-spacing: 3px;">
          Partenaires Officiels
        </div>
        <!-- Conteneur de logos unifiés. En phase 2, une boucle map() viendra injecter les images ici -->
        <div style="display: flex; gap: 36px; font-family: 'Arial', sans-serif; font-size: 14px; font-weight: 800; color: #374151; text-transform: uppercase; letter-spacing: 1px; align-items: center; opacity: 0.75;">
          <span>ORANGE</span>
          <span>MOOV</span>
          <span style="font-family: 'Times New Roman', serif; font-style: italic; font-size: 16px;">Airtel</span>
          <span style="font-size: 11px; font-family: 'Montserrat', sans-serif; font-weight: 900;">MASTERCARD</span>
        </div>
      </div>

    </div>
  `;

  // --- 4. ENGINE DE RENDU ET EXPORT PDF ---
  document.body.appendChild(poster);

  try {
    await document.fonts.ready;
    // Timeout sécurisé pour charger les images distantes sans briser le canevas
    await new Promise(resolve => setTimeout(resolve, 800));

    const canvas = await html2canvas(poster, {
      scale: 2, // Garantit une impression nette (HQ)
      useCORS: true,
      backgroundColor: theme.backgroundColor,
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

    // Nettoyage propre du nom de fichier
    const safeTitle = eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    pdf.save(`shashap_${safeTitle}_2026.pdf`);

  } catch (error) {
    console.error("Erreur d'export PDF Shashap:", error);
    alert("Un problème est survenu lors de la création de l'affiche premium.");
  } finally {
    // Nettoyage obligatoire du DOM pour préserver les performances de la page admin
    document.body.removeChild(poster);
  }
}