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

  const artistName = ev.artistName || ev.name || 'Barakina';
  const displayDate = ev.eventDate || "VEN 19 JUIL • 21H";
  const desc = ev.description || 'Le meilleur artiste Nigerien';
  const imageSrc = ev.image || 'https://via.placeholder.com/600x800/2c3e50/ffffff?text=Photo+Artiste';
  const shashapAddress = "123 Avenue de la République, Niamey, Niger";
  const shashapWebsite = "www.shashap-niamey.com";

  // ✅ Liste des sponsors (modifiable avec leurs vrais logos)
  const sponsors = [
    { name: "Orange Niger",    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Orange_logo.svg/1200px-Orange_logo.svg.png" },
    { name: "MTN",            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/MTN_Logo.svg/1200px-MTN_Logo.svg.png" },
    { name: "Moov Africa",    logo: "https://www.moov-africa.com/themes/custom/moov/logo.svg" },
    { name: "Niger Telecom",  logo: "https://www.nigertelecoms.ne/sites/default/files/logo_nt.png" },
    { name: "Shashap",        logo: "https://i.postimg.cc/X7N9X3fD/shashap-logo.png" } // placeholder, à remplacer
  ];

  const poster = document.createElement('div');
  poster.id = "temp-poster-export";
  Object.assign(poster.style, {
    position: 'absolute', left: '-9999px', top: '0',
    width: '794px', height: '1123px',
    backgroundColor: '#111111',
    backgroundImage: 'radial-gradient(circle at 50% 30%, #1e1e1e 0%, #111111 80%)',
    fontFamily: "'Oswald', 'Impact', sans-serif",
    overflow: 'hidden', boxSizing: 'border-box'
  });

  poster.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Oswald:wght@500;700&display=swap" rel="stylesheet">

    <div style="padding: 60px 60px 0 60px; width: 100%; height: 100%; box-sizing: border-box; position: relative;">

      <!-- Conteneur de la Photo (cadre blanc) -->
      <div style="position: relative; width: 75%; height: 480px; background: #FFFFFF; padding: 15px; box-sizing: border-box; margin: 0 auto; box-shadow: 0 25px 50px rgba(0,0,0,0.6);">
        <img src="${imageSrc}" crossorigin="anonymous" style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%) contrast(130%) brightness(85%);" />
        <div style="position: absolute; top: -20px; right: 20px; width: 150px; height: 35px; background: #E2F000; transform: rotate(20deg); box-shadow: 2px 4px 10px rgba(0,0,0,0.3); opacity: 0.95;"></div>
        <div style="position: absolute; bottom: -20px; left: -10px; width: 130px; height: 35px; background: #E2F000; transform: rotate(-15deg); box-shadow: 2px 4px 10px rgba(0,0,0,0.3); opacity: 0.95;"></div>
      </div>

      <!-- Titre Massif -->
      <div style="position: relative; margin-top: -45px; z-index: 10; line-height: 0.85;">
        <h1 style="margin: 0; font-family: 'Impact', sans-serif; font-size: 140px; color: #E2F000; text-transform: uppercase; letter-spacing: -2px; text-shadow: 0 10px 20px rgba(0,0,0,0.5);">MUSIC</h1>
        <h1 style="margin: 0; font-family: 'Impact', sans-serif; font-size: 140px; color: #FFFFFF; text-transform: uppercase; letter-spacing: -2px; text-shadow: 0 10px 20px rgba(0,0,0,0.5);">EVENTS</h1>
      </div>

      <div style="width: 100%; height: 1px; background: rgba(255,255,255,0.15); margin-top: 30px; margin-bottom: 30px;"></div>

      <!-- Artiste + Date -->
      <div style="display: flex; justify-content: flex-end; align-items: flex-end; margin-bottom: 30px;">
        <div style="text-align: right;">
          <h2 style="font-family: 'Dancing Script', cursive; font-size: 65px; color: #E2F000; margin: 0 0 15px 0; font-weight: normal; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${artistName}</h2>
          <div style="background: #E2F000; display: inline-block; padding: 8px 16px; margin-bottom: 10px;"><span style="font-family: 'Impact', sans-serif; font-size: 22px; color: #111; letter-spacing: 1px;">MUSIC - DRINKS - FOODS</span></div><br>
          <div style="background: #E2F000; display: inline-block; padding: 8px 16px;"><span style="font-family: 'Impact', sans-serif; font-size: 22px; color: #111; letter-spacing: 1px;">📅 ${displayDate}</span></div>
        </div>
      </div>

      <!-- Pied de page -->
      <div style="position: absolute; bottom: 90px; left: 60px; right: 60px; display: flex; justify-content: space-between; align-items: flex-end; font-family: 'Oswald', sans-serif; font-size: 14px;">
        <div style="color: #AAAAAA; max-width: 50%;">
          <p style="margin:0 0 8px 0; color:#CCCCCC; font-size:14px;">${desc}</p>
          <p style="margin:0; color:#888888; font-size:13px;">📍 ${shashapAddress}</p>
        </div>
        <div style="text-align: right; color: #FFFFFF; line-height: 1.4;">
          <p style="margin:0 0 4px 0; font-size:12px; color:#AAAAAA;">PLUS D'INFOS SUR</p>
          <strong style="font-size: 18px; letter-spacing: 1px; color:#E2F000;">${shashapWebsite.toUpperCase()}</strong>
        </div>
      </div>

      <!-- ✅ BARRE SPONSORS AVEC LOGOS -->
      <div style="
        position: absolute; bottom: 0; left: 0; width: 100%; height: 70px;
        background: rgba(0,0,0,0.8);
        border-top: 1px solid rgba(255,255,255,0.1);
        display: flex; align-items: center; justify-content: center;
        gap: 30px; padding: 0 40px; box-sizing: border-box;
      ">
        ${sponsors.map(s => `
          <div style="display: flex; align-items: center; gap: 8px; font-family: 'Oswald', sans-serif; font-size: 12px; color: #CCCCCC;">
            <img src="${s.logo}" alt="${s.name}" style="height: 28px; max-width: 60px; object-fit: contain;" onerror="this.style.display='none';" />
            <span style="white-space: nowrap;">${s.name}</span>
          </div>
        `).join('')}
      </div>

    </div>
  `;

  document.body.appendChild(poster);

  try {
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 500));
    const canvas = await html2canvas(poster, { scale: 2, useCORS: true, backgroundColor: '#111111' });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    const safeTitle = artistName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    pdf.save(`affiche_${safeTitle}_shashap.pdf`);
  } catch (error) {
    console.error("Erreur PDF:", error);
  } finally {
    document.body.removeChild(poster);
  }
}