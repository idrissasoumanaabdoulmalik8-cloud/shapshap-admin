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

    // Formatage simulé pour une date élégante (à adapter selon ta donnée réelle)
    const displayDate = ev.eventDate || "19 JUIL • 21H";
    const title = ev.artistName || ev.name || 'Événement Exclusif';

    html += `
      <div style="
        position:relative;
        background:#ffffff;
        border-radius: 32px;
        overflow:hidden;
        box-shadow: 0 24px 48px -12px rgba(0,0,0,0.08), 0 4px 16px -2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1);
        transition: all 0.5s cubic-bezier(0.2,0.8,0.2,1);
        display:flex; flex-direction:column;
        font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
      "
      onmouseover="
        this.style.transform='translateY(-6px)';
        this.style.boxShadow='0 32px 64px -12px rgba(0,0,0,0.12), 0 8px 24px -4px rgba(0,0,0,0.06)';
        const img = this.querySelector('.event-img');
        if(img) img.style.transform='scale(1.05)';
      "
      onmouseout="
        this.style.transform='translateY(0)';
        this.style.boxShadow='0 24px 48px -12px rgba(0,0,0,0.08), 0 4px 16px -2px rgba(0,0,0,0.04)';
        const img = this.querySelector('.event-img');
        if(img) img.style.transform='scale(1)';
      ">

        <!-- Image immersive avec Gradient Sombre -->
        <div style="
          width:100%; height: 280px; overflow:hidden; position:relative;
          background: #111;
        ">
          ${ ev.image
            ? `<img src="${ev.image}" alt="${title}" class="event-img"
                   style="width:100%; height:100%; object-fit:cover; display:block; transition: transform 0.8s cubic-bezier(0.2,0.8,0.2,1);" />`
            : `<div class="event-img" style="width:100%; height:100%; background: linear-gradient(135deg, #2c3e50, #000000); display:flex; align-items:center; justify-content:center; transition: transform 0.8s cubic-bezier(0.2,0.8,0.2,1);">
                 <span style="font-size:64px; opacity:0.3;">🎵</span>
               </div>`
          }

          <!-- Overlay dégradé profond pour lisibilité -->
          <div style="
            position:absolute; inset:0;
            background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
          "></div>

          <!-- Badge Date Ultra Compact -->
          <div style="
            position:absolute; top:20px; left:20px;
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.25);
            border-radius: 16px;
            padding: 6px 12px;
            color: #ffffff; font-size: 12px; font-weight: 700;
            letter-spacing: 0.5px; text-transform: uppercase;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display:flex; align-items:center; gap:6px;
          ">
            📅 ${displayDate}
          </div>

          <!-- Badge Statut (À venir) -->
          <div style="
            position:absolute; top:20px; right:20px;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 6px 12px;
            color: #ffffff; font-size: 12px; font-weight: 600;
            display:flex; align-items:center; gap: 6px;
          ">
            <span style="display:block; width:8px; height:8px; background:#10B981; border-radius:50%; box-shadow: 0 0 8px rgba(16,185,129,0.8);"></span>
            À venir
          </div>

          <!-- Titre Élégant (Remonté) -->
          <div style="
            position:absolute; bottom: 36px; left:24px; right:24px;
          ">
            <h3 style="
              margin:0 0 4px 0; color:#ffffff;
              font-family: 'New York', 'Playfair Display', serif;
              font-size: 30px; font-weight: 600;
              letter-spacing: -0.5px;
              text-shadow: 0 4px 12px rgba(0,0,0,0.5);
              line-height: 1.1;
            ">${title}</h3>
          </div>
        </div>

        <!-- Corps de la carte -->
        <div style="padding: 24px; flex:1; display:flex; flex-direction:column; gap: 28px;">

          <!-- Tags structurés (Airbnb Style) -->
          <div style="display:flex; flex-wrap:wrap; gap: 10px;">
            <div style="display:flex; align-items:center; gap:6px; background:#F3F4F6; padding:6px 12px; border-radius:12px; color:#374151; font-size:13px; font-weight:600;">
              <span>📍</span> Haraka
            </div>
            <div style="display:flex; align-items:center; gap:6px; background:#F3F4F6; padding:6px 12px; border-radius:12px; color:#374151; font-size:13px; font-weight:600;">
              <span>🎧</span> DJ Set
            </div>
            <div style="display:flex; align-items:center; gap:6px; background:#F3F4F6; padding:6px 12px; border-radius:12px; color:#374151; font-size:13px; font-weight:600;">
              <span>👥</span> 350 places
            </div>
          </div>

          <!-- Trio de Boutons Premium 2026 -->
          <div style="display:flex; gap:10px; margin-top:auto;">

            <!-- Bouton Modifier : Glass-Gradient -->
            <button onclick="editEventByIndex(${realIndex})"
              style="
                flex:1; height: 48px; padding: 0;
                display:flex; align-items:center; justify-content:center; gap:6px;
                background: linear-gradient(135deg, #4c1d95 0%, #be185d 100%);
                color:#ffffff; border: none; border-radius: 16px;
                font-size:13px; font-weight:600;
                cursor:pointer;
                box-shadow: 0 6px 16px rgba(190, 24, 93, 0.25);
                transition: all 0.3s ease;
              "
              onmousedown="this.style.transform='scale(0.95)'"
              onmouseup="this.style.transform='scale(1)'"
              onmouseover="this.style.filter='brightness(1.1)'; this.style.boxShadow='0 8px 20px rgba(190, 24, 93, 0.4)';"
              onmouseout="this.style.filter='brightness(1)'; this.style.boxShadow='0 6px 16px rgba(190, 24, 93, 0.25)';"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              Modifier
            </button>

            <!-- Bouton PDF : Neutre Premium -->
            <button onclick="/* ta fonction PDF ici */"
              style="
                flex:1; height: 48px; padding: 0;
                display:flex; align-items:center; justify-content:center; gap:6px;
                background:#ffffff; color:#374151;
                border: 1px solid #E5E7EB; border-radius: 16px;
                font-size:13px; font-weight:600;
                cursor:pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                transition: all 0.3s ease;
              "
              onmousedown="this.style.transform='scale(0.95)'"
              onmouseup="this.style.transform='scale(1)'"
              onmouseover="this.style.background='#F9FAFB'; this.style.borderColor='#D1D5DB'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.05)';"
              onmouseout="this.style.background='#ffffff'; this.style.borderColor='#E5E7EB'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.02)';"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              PDF
            </button>

            <!-- Bouton Supprimer : Danger Subtil -->
            <button onclick="deleteEventByIndex(${realIndex})"
              style="
                flex:1; height: 48px; padding: 0;
                display:flex; align-items:center; justify-content:center; gap:6px;
                background:#ffffff; color:#DC2626;
                border: 1px solid rgba(220, 38, 38, 0.2); border-radius: 16px;
                font-size:13px; font-weight:600;
                cursor:pointer;
                transition: all 0.3s ease;
              "
              onmousedown="this.style.transform='scale(0.95)'"
              onmouseup="this.style.transform='scale(1)'"
              onmouseover="this.style.background='#FEF2F2'; this.style.borderColor='#DC2626'; this.style.boxShadow='0 4px 12px rgba(220, 38, 38, 0.1)';"
              onmouseout="this.style.background='#ffffff'; this.style.borderColor='rgba(220, 38, 38, 0.2)'; this.style.boxShadow='none';"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Supprimer
            </button>
          </div>

        </div>
      </div>`;
  });

  container.innerHTML = html;
}