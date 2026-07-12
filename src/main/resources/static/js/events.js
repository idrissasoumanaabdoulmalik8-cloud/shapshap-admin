// ============================================================
// 🎤 ÉVÉNEMENTS — gestion des soirées/lives
// ============================================================

function loadEvents() {
  const container = document.getElementById('eventsList');
  if (!container) return;

  const events = storiesData.filter(s => s.isEvent);

  if (events.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 50px; color: #aaa;">
        🎤 Aucun événement pour le moment
      </div>`;
    return;
  }

  let html = '';
  events.forEach((ev, idx) => {
    const realIndex = storiesData.indexOf(ev);
    html += `
      <div style="background:#fff; margin:16px; padding:16px; border-radius:12px; border:1px solid #fce4ec; display:flex; justify-content:space-between; align-items:center;">
        <div style="flex:1;">
          <strong style="font-size:16px;">${ev.artistName || ev.name || 'Sans nom'}</strong>
          <div style="color:#888; font-size:13px;">📅 ${ev.eventDate || '—'}</div>
          <div style="color:#aaa; font-size:12px; margin-top:4px;">${ev.description || ''}</div>
          <div style="margin-top:6px;">
            <span style="background:#E91E63;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;">
              📅 ${ev.startDate || '?'} → ${ev.endDate || '?'}
            </span>
          </div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          ${ev.image ? `<img src="${ev.image}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;margin-right:8px;">` : ''}
          <button class="btn btn-secondary btn-sm" onclick="editEventByIndex(${realIndex})">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteEventByIndex(${realIndex})">🗑️</button>
        </div>
      </div>`;
  });

  container.innerHTML = html;
}

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
    const end = ev.endDate || '?';

    html += `
      <div class="event-card" style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.05); border: 1px solid #fce4ec; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column;"
           onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 30px rgba(233,30,99,0.1)'"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.05)'">

        <!-- Bannière image ou dégradé -->
        <div style="height: 120px; ${ev.image ? `background-image: url('${ev.image}'); background-size: cover; background-position: center;` : 'background: linear-gradient(135deg, #F5A623, #8E24AA);'} position: relative;">
          <div style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); padding: 4px 12px; border-radius: 20px; color: #fff; font-size: 11px; font-weight: 700;">
            🎤 ÉVÉNEMENT
          </div>
          <div style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.25); backdrop-filter: blur(8px); padding: 4px 10px; border-radius: 20px; color: #fff; font-size: 11px; font-weight: 600;">
            ${start} → ${end}
          </div>
        </div>

        <!-- Contenu de la carte -->
        <div style="padding: 18px 20px; flex: 1; display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #E91E63, #F5A623); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px;">
              ${(ev.artistName || ev.name).charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1e1e2f;">${ev.artistName || ev.name || 'Sans nom'}</h3>
              <span style="font-size: 13px; color: #888;">📅 ${ev.eventDate || '—'}</span>
            </div>
          </div>
          <p style="color: #555; font-size: 13px; line-height: 1.4; margin: 8px 0 12px 0; flex: 1;">${ev.description || 'Aucune description.'}</p>

          <!-- Actions -->
          <div style="display: flex; gap: 8px; margin-top: auto;">
            <button class="btn btn-secondary btn-sm" onclick="editEventByIndex(${realIndex})"
                    style="flex: 1; background: #f5f5f7; border: none; padding: 10px; border-radius: 12px; font-weight: 600; font-size: 13px; cursor: pointer; transition: background 0.2s;"
                    onmouseover="this.style.background='#eee'" onmouseout="this.style.background='#f5f5f7'">
              ✏️ Modifier
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteEventByIndex(${realIndex})"
                    style="flex: 1; background: #ffebee; color: #E53935; border: none; padding: 10px; border-radius: 12px; font-weight: 600; font-size: 13px; cursor: pointer; transition: background 0.2s;"
                    onmouseover="this.style.background='#ffcdd2'" onmouseout="this.style.background='#ffebee'">
              🗑️ Supprimer
            </button>
          </div>
        </div>
      </div>`;
  });

  container.innerHTML = html;
}