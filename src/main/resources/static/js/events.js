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
      <div style="text-align:center; padding: 60px 20px; color: #aaa; grid-column: 1 / -1;">
        <div style="font-size: 48px; margin-bottom: 16px;">🎤</div>
        <h3 style="font-weight: 700; color: #1e1e2f;">Aucun événement pour le moment</h3>
        <p style="color: #888; font-size: 14px;">Cliquez sur « Nouvel événement » pour créer une soirée.</p>
      </div>`;
    return;
  }

  let html = '';
  events.forEach((ev, idx) => {
    const realIndex = storiesData.indexOf(ev);
    const start = ev.startDate || '?';
    const end   = ev.endDate || '?';

    html += `
      <div style="
        background: #fff;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        border: 2px solid #D4AF37;
        transition: transform 0.25s, box-shadow 0.25s;
        display: flex; flex-direction: column;
        font-family: 'Poppins', 'Segoe UI', sans-serif;
      "
      onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 12px 30px rgba(212,175,55,0.2)'"
      onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.06)'"
      >

        <!-- Image de l'événement -->
        <div style="width:100%; height:220px; overflow:hidden; position:relative;">
          ${ ev.image
            ? `<img src="${ev.image}" alt="${ev.artistName || ev.name}"
                   style="width:100%; height:100%; object-fit:cover; display:block;" />`
            : `<div style="width:100%; height:100%;
                       background: linear-gradient(135deg, #1a1a2e, #16213e);
                       display:flex; align-items:center; justify-content:center;
                       color:#fff; font-size:56px;">🎤</div>`
          }
          <div style="position:absolute; bottom:0; left:0; right:0; height:60px;
                      background:linear-gradient(to top, rgba(0,0,0,0.5), transparent);"></div>
        </div>

        <!-- Contenu -->
        <div style="padding: 20px 22px 22px 22px; flex:1; display:flex; flex-direction:column;">

          <!-- Nom de l'artiste -->
          <h3 style="margin:0 0 6px 0; font-size:19px; font-weight:700; color:#1a1a2e; letter-spacing:-0.3px;">
            ${ev.artistName || ev.name || 'Sans nom'}
          </h3>

          <!-- Date et période -->
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
            <span style="font-size:13px; font-weight:600; color:#D4AF37; background:#FFF9E6; padding:3px 10px; border-radius:12px;">
              📅 ${ev.eventDate || '—'}
            </span>
            <span style="font-size:11px; color:#aaa;">${start} → ${end}</span>
          </div>

          <!-- Description -->
          <p style="margin:0 0 18px 0; font-size:13.5px; color:#4b5563; line-height:1.6; flex:1;">
            ${ev.description || 'Aucune description pour cet événement.'}
          </p>

          <!-- ✅ BOUTONS PREMIUM REDESIGNÉS -->
          <div style="display:flex; gap:12px;">
            <!-- Bouton Modifier -->
            <button onclick="editEventByIndex(${realIndex})"
              style="
                flex:1;
                height:44px;
                display:inline-flex; align-items:center; justify-content:center; gap:8px;
                background: linear-gradient(135deg, #1E2147 0%, #2D2B55 100%);
                color: #fff;
                border: none;
                border-radius: 16px;
                font-size: 13px; font-weight: 600; letter-spacing: 0.3px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(30,33,71,0.3);
                transition: all 0.2s ease;
                position: relative; overflow: hidden;
              "
              onmousedown="this.style.transform='scale(0.97)'"
              onmouseup="this.style.transform='scale(1)'"
              onmouseover="this.style.boxShadow='0 6px 18px rgba(30,33,71,0.4)'; this.style.background='linear-gradient(135deg, #272B5A 0%, #3B3668 100%)'"
              onmouseout="this.style.boxShadow='0 4px 12px rgba(30,33,71,0.3)'; this.style.background='linear-gradient(135deg, #1E2147 0%, #2D2B55 100%)'"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              Modifier
            </button>

            <!-- Bouton Supprimer -->
            <button onclick="deleteEventByIndex(${realIndex})"
              style="
                flex:1;
                height:44px;
                display:inline-flex; align-items:center; justify-content:center; gap:8px;
                background: #fff;
                color: #E53935;
                border: 1.5px solid #F5C6CB;
                border-radius: 16px;
                font-size: 13px; font-weight: 600; letter-spacing: 0.3px;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(229,57,53,0.08);
                transition: all 0.2s ease;
              "
              onmousedown="this.style.transform='scale(0.97)'"
              onmouseup="this.style.transform='scale(1)'"
              onmouseover="this.style.background='#FFF5F5'; this.style.borderColor='#E53935'; this.style.boxShadow='0 4px 12px rgba(229,57,53,0.15)'"
              onmouseout="this.style.background='#fff'; this.style.borderColor='#F5C6CB'; this.style.boxShadow='0 2px 8px rgba(229,57,53,0.08)'"
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