// ============================================================
// 🎤 ÉVÉNEMENTS — gestion des soirées/lives
// ============================================================
function openEventModal(editIndex = null) {
  const existing = editIndex !== null ? storiesData[editIndex] : null;
  const isEdit = existing !== null;
  const today = new Date().toISOString().split('T')[0];

  let modal = document.getElementById('eventModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'eventModal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content" style="max-width:550px;">
      <div class="modal-header">
        <h3>${isEdit ? '✏️ Modifier l\'événement' : '🎤 Nouvel événement'}</h3>
        <button class="close-btn" onclick="closeEventModal()">✕</button>
      </div>
      <div style="padding:16px; display:flex; flex-direction:column; gap:10px;">
        <input type="text" id="evArtistName" placeholder="Nom de l'artiste / DJ" value="${existing?.artistName || ''}" style="padding:10px;border:1px solid #eee;border-radius:8px;">
        <input type="text" id="evEventDate" placeholder="Date (ex: Ven 19 Juil · 21h)" value="${existing?.eventDate || ''}" style="padding:10px;border:1px solid #eee;border-radius:8px;">
        <textarea id="evDescription" placeholder="Description..." rows="2" style="padding:10px;border:1px solid #eee;border-radius:8px;">${existing?.description || ''}</textarea>
        <div style="display:flex;gap:10px;">
          <div style="flex:1;">
            <label style="font-size:11px;color:#888;">📅 Début</label>
            <input type="date" id="evStartDate" value="${existing?.startDate || today}" onchange="validateEventDates()" style="width:100%;padding:10px;border:1px solid #eee;border-radius:8px;">
          </div>
          <div style="flex:1;">
            <label style="font-size:11px;color:#888;">📅 Fin</label>
            <input type="date" id="evEndDate" value="${existing?.endDate || today}" onchange="validateEventDates()" style="width:100%;padding:10px;border:1px solid #eee;border-radius:8px;">
          </div>
        </div>
        <span id="evDateError" style="color:#E53935; font-size:12px; display:none;"></span>
        <div>
          <label style="font-size:12px;color:#888;">🖼️ Image (URL)</label>
          <input type="text" id="evImageUrl" value="${existing?.image || ''}" placeholder="https://..." style="width:100%;padding:10px;border:1px solid #eee;border-radius:8px;">
          <img id="evPreview" src="${existing?.image || ''}" style="${existing?.image ? 'max-width:100%;max-height:100px;margin-top:8px;border-radius:8px;' : 'display:none;'}">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeEventModal()">Annuler</button>
        <button class="btn btn-primary" id="evSaveBtn" disabled>💾 Enregistrer</button>
      </div>
    </div>`;
  modal.style.display = 'flex';

  // Prévisualisation image
  const imgInput = document.getElementById('evImageUrl');
  const preview = document.getElementById('evPreview');
  if (imgInput && preview) {
    imgInput.addEventListener('input', () => {
      if (imgInput.value) {
        preview.src = imgInput.value;
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }
    });
  }

  // Validation initiale des dates (active le bouton si OK)
  validateEventDates();

  document.getElementById('evSaveBtn').onclick = () => {
    const artistName = document.getElementById('evArtistName').value.trim();
    if (!artistName) { showToast('⚠️ Nom de l\'artiste requis', 'error'); return; }

    const startDate = document.getElementById('evStartDate').value;
    const endDate = document.getElementById('evEndDate').value;

    // Vérification finale des dates
    if (startDate && endDate && endDate < startDate) {
      showToast('⚠️ La date de fin doit être après la date de début', 'error');
      return;
    }

    const eventData = {
      id: existing?.id || Date.now(),
      name: artistName,
      artistName: artistName,
      eventDate: document.getElementById('evEventDate').value.trim(),
      description: document.getElementById('evDescription').value.trim(),
      startDate: startDate,
      endDate: endDate,
      image: document.getElementById('evImageUrl').value.trim(),
      category: 'Événement',
      price: 0,
      promo: null,
      seen: existing?.seen || false,
      isEvent: true,
    };

    if (isEdit) {
      storiesData[editIndex] = eventData;
    } else {
      storiesData.unshift(eventData);
    }

    saveStoriesToStorage();
    renderStories();
    closeEventModal();
    syncStoriesToBackend();
    loadEvents();
    showToast('✅ Événement enregistré');
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
      ">
        <div style="font-size:64px; margin-bottom:24px; filter: drop-shadow(0 8px 12px rgba(0,0,0,0.1));">✨</div>
        <h3 style="font-family: 'New York', 'Playfair Display', serif; font-weight:600; color:#111827; font-size:28px; margin-bottom:8px;">L'agenda est vide</h3>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; color:#6B7280; font-size:16px; max-width:400px; margin:0 auto; line-height: 1.5;">
          C'est le moment de créer une expérience inoubliable. Ajoutez votre premier événement.
        </p>
      </div>`;
    return;
  }

  let html = '';
  events.forEach((ev, idx) => {
    const realIndex = storiesData.indexOf(ev);
    const start = ev.startDate || 'Date inconnue';
    const end = ev.endDate ? ` → ${ev.endDate}` : '';
    const title = ev.artistName || ev.name || 'Événement Exclusif';

    // Fallback stylisé si la description est vide
    const desc = ev.description || 'DJ SET | LIVE PERFORMANCES | EXCLUSIVE • CAPACITÉ LIMITÉE • Expérience Premium';

    html += `
      <div style="
        position:relative;
        background:#FAFAFA;
        border-radius: 32px;
        overflow:hidden;
        box-shadow: 0 24px 48px -12px rgba(0,0,0,0.08), 0 4px 16px -2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1);
        transition: all 0.5s cubic-bezier(0.2,0.8,0.2,1);
        display:flex; flex-direction:column;
        font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
      "
      onmouseover="
        this.style.transform='translateY(-8px) scale(1.01)';
        this.style.boxShadow='0 32px 64px -12px rgba(0,0,0,0.14), 0 8px 24px -4px rgba(0,0,0,0.08)';
      "
      onmouseout="
        this.style.transform='translateY(0) scale(1)';
        this.style.boxShadow='0 24px 48px -12px rgba(0,0,0,0.08), 0 4px 16px -2px rgba(0,0,0,0.04)';
      ">

        {/* ── Image immersive avec Gradient Sombre ── */}
        <div style="
          width:100%; height: 280px; overflow:hidden; position:relative;
          background: #111;
        ">
          ${ ev.image
            ? `<img src="${ev.image}" alt="${title}"
                   style="width:100%; height:100%; object-fit:cover; display:block; transition: transform 0.8s cubic-bezier(0.2,0.8,0.2,1);"
                   onmouseover="this.style.transform='scale(1.08)'"
                   onmouseout="this.style.transform='scale(1)'" />`
            : `<div style="width:100%; height:100%; background: linear-gradient(135deg, #2c3e50, #000000); display:flex; align-items:center; justify-content:center;">
                 <span style="font-size:64px; opacity:0.3;">🎵</span>
               </div>`
          }

          {/* Overlay dégradé profond pour lisibilité typographique */}
          <div style="
            position:absolute; inset:0;
            background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, transparent 100%);
          "></div>

          {/* Badge Date Flottant "Glassmorphism" */}
          <div style="
            position:absolute; top:24px; left:24px;
            backdrop-filter: blur(16px) saturate(200%);
            -webkit-backdrop-filter: blur(16px) saturate(200%);
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            padding: 8px 16px;
            color: #ffffff; font-size: 13px; font-weight: 600;
            letter-spacing: 0.5px; text-transform: uppercase;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            display:flex; align-items:center; gap:8px;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            ${start}${end}
          </div>

          {/* Titre Élégant Typographie Serif */}
          <div style="
            position:absolute; bottom:24px; left:24px; right:24px;
          ">
            <h3 style="
              margin:0 0 6px 0; color:#ffffff;
              font-family: 'New York', 'Playfair Display', serif;
              font-size: 32px; font-weight: 500;
              letter-spacing: -0.5px;
              text-shadow: 0 4px 16px rgba(0,0,0,0.6);
            ">${title}</h3>
            <span style="
              color:rgba(255,255,255,0.7); font-size:12px; font-weight:600;
              letter-spacing: 2px; text-transform:uppercase;
            ">${ev.artistName || 'HARAKA'} • DJ SET</span>
          </div>
        </div>

        {/* ── Corps de la carte ── */}
        <div style="padding: 28px 24px 24px 24px; flex:1; display:flex; flex-direction:column; gap: 32px;">

          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <p style="
              margin:0; font-size:13px; color:#4B5563; line-height:1.7;
              font-weight:500; text-transform:uppercase; letter-spacing: 0.5px;
            ">
              ${desc}
            </p>
            {/* Icône Onde Sonore Subtile */}
            <div style="color:#D1D5DB; margin-left: 16px; flex-shrink:0;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 11h2v2H4zm4-4h2v10H8zm4 3h2v4h-2zm4-6h2v16h-2zm4 7h2v2h-2z"/>
              </svg>
            </div>
          </div>

          {/* ── Boutons Premium 2026 ── */}
          <div style="display:flex; gap:16px; margin-top:auto;">

            {/* Bouton Modifier : Glass-Gradient Spectaculaire */}
            <button onclick="editEventByIndex(${realIndex})"
              style="
                flex:1; height: 54px;
                display:flex; align-items:center; justify-content:center; gap:10px;
                background: linear-gradient(135deg, rgba(46,27,78,0.95) 0%, rgba(99,51,107,0.95) 50%, rgba(159,89,122,0.95) 100%);
                backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                color:#ffffff; border: 1px solid rgba(255,255,255,0.1); border-radius: 30px;
                font-size:15px; font-weight:600; letter-spacing: 0.3px;
                cursor:pointer;
                box-shadow: 0 8px 24px rgba(99, 51, 107, 0.4), inset 0 1px 1px rgba(255,255,255,0.2);
                transition: all 0.4s cubic-bezier(0.2,0.8,0.2,1);
              "
              onmousedown="this.style.transform='scale(0.95)'"
              onmouseup="this.style.transform='scale(1)'"
              onmouseover="
                this.style.boxShadow='0 12px 32px rgba(99, 51, 107, 0.6), inset 0 1px 1px rgba(255,255,255,0.4)';
                this.style.filter='brightness(1.15)';
                this.querySelector('svg').style.transform='rotate(-12deg) scale(1.1)';
              "
              onmouseout="
                this.style.boxShadow='0 8px 24px rgba(99, 51, 107, 0.4), inset 0 1px 1px rgba(255,255,255,0.2)';
                this.style.filter='brightness(1)';
                this.querySelector('svg').style.transform='rotate(0deg) scale(1)';
              "
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                   style="transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              </svg>
              Modifier
            </button>

            {/* Bouton Supprimer : Luxury Danger */}
            <button onclick="deleteEventByIndex(${realIndex})"
              style="
                flex:1; height: 54px;
                display:flex; align-items:center; justify-content:center; gap:10px;
                background:#ffffff; color:#D32F2F;
                border: 1px solid rgba(211, 47, 47, 0.15); border-radius: 30px;
                font-size:15px; font-weight:600; letter-spacing: 0.3px;
                cursor:pointer;
                box-shadow: 0 8px 24px rgba(211, 47, 47, 0.08);
                transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              "
              onmousedown="this.style.transform='scale(0.92)'"
              onmouseup="this.style.transform='scale(1)'"
              onmouseover="
                this.style.background='#D32F2F';
                this.style.color='#ffffff';
                this.style.boxShadow='0 12px 32px rgba(211, 47, 47, 0.3)';
                this.style.borderColor='#D32F2F';
                this.querySelector('svg').style.transform='scale(1.1)';
              "
              onmouseout="
                this.style.background='#ffffff';
                this.style.color='#D32F2F';
                this.style.boxShadow='0 8px 24px rgba(211, 47, 47, 0.08)';
                this.style.borderColor='rgba(211, 47, 47, 0.15)';
                this.querySelector('svg').style.transform='scale(1)';
              "
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                   style="transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Supprimer
            </button>
          </div>

        </div>
      </div>`;
  });

  container.innerHTML = html;
}