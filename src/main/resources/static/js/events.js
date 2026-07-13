// ============================================================================
// SHASHAP GRAPHIC ENGINE & SYSTEM THEMES (PHASE 3)
// ============================================================================



const SHASHAP_THEMES = {
  Urban: {
    '--primary-color': '#CCFF00',
    '--secondary-color': '#111827',
    '--background-color': '#040404',
    '--card-background': '#0A0A0A',
    '--text-color': '#FFFFFF',
    '--muted-color': '#888888',
    '--font-title': "'Anton', sans-serif",
    '--font-body': "'Montserrat', sans-serif"
  },
  Festival: {
    '--primary-color': '#FF3E6C',
    '--secondary-color': '#FFBE0B',
    '--background-color': '#1A002C',
    '--card-background': '#2A0845',
    '--text-color': '#FFFFFF',
    '--muted-color': '#A8A29E',
    '--font-title': "'Bebas Neue', sans-serif",
    '--font-body': "'Poppins', sans-serif"
  },
  VIP: {
    '--primary-color': '#D4AF37',
    '--secondary-color': '#1A1A1A',
    '--background-color': '#0B0B0B',
    '--card-background': '#161616',
    '--text-color': '#FFFFFF',
    '--muted-color': '#A3A3A3',
    '--font-title': "'Oswald', sans-serif",
    '--font-body': "'Inter', sans-serif"
  },
  Minimal: {
    '--primary-color': '#000000',
    '--secondary-color': '#F3F4F6',
    '--background-color': '#FFFFFF',
    '--card-background': '#F9FAFB',
    '--text-color': '#000000',
    '--muted-color': '#6B7280',
    '--font-title': "'Inter', sans-serif",
    '--font-body': "'Inter', sans-serif"
  },
  Afro: {
    '--primary-color': '#E65C00',
    '--secondary-color': '#F9D423',
    '--background-color': '#2B1B17',
    '--card-background': '#3D251E',
    '--text-color': '#FFF8DC',
    '--muted-color': '#D2B48C',
    '--font-title': "'Anton', sans-serif",
    '--font-body': "'Poppins', sans-serif"
  },
  Gold: {
    '--primary-color': '#F3E5AB',
    '--secondary-color': '#4A0E17',
    '--background-color': '#190005',
    '--card-background': '#2D000B',
    '--text-color': '#FFFFFF',
    '--muted-color': '#C5A059',
    '--font-title': "'Oswald', sans-serif",
    '--font-body': "'Montserrat', sans-serif"
  },
  Corporate: {
    '--primary-color': '#0066CC',
    '--secondary-color': '#002244',
    '--background-color': '#0A192F',
    '--card-background': '#172A45',
    '--text-color': '#F8F9FA',
    '--muted-color': '#8892B0',
    '--font-title': "'Inter', sans-serif",
    '--font-body': "'Inter', sans-serif"
  }
};

const SHASHAP_FONTS = ['Montserrat', 'Poppins', 'Inter', 'Anton', 'Bebas Neue', 'Oswald'];

// MOTEUR DE GABARIT ET COMPOSANTS INDÉPENDANTS (Modèle pur)
function generatePosterHTML(eventData, format = 'A4', selectedTheme = 'Urban') {
  const t = SHASHAP_THEMES[selectedTheme] || SHASHAP_THEMES.Urban;

  // Variables CSS d'environnement de l'affiche
  const cssVariables = Object.entries(t).map(([k, v]) => `${k}: ${v};`).join(' ');

  // Détermination des dimensions du conteneur en fonction du format (Architecture cible)
  let dimensions = { width: '100%', height: '100%', aspectRatio: '794/1123' }; // Format A4 par défaut
  if (format === 'STORY_IG') dimensions = { width: '100%', height: '100%', aspectRatio: '9/16' };
  if (format === 'BANNER_FB') dimensions = { width: '100%', height: '100%', aspectRatio: '16/9' };

  // Nettoyage et formatage sécurisé des chaînes de données de l'événement
  const artistName = (eventData.artistName || 'ARTISTE').trim().toUpperCase();
  const eventName = (eventData.eventName || eventData.name || '').trim().toUpperCase();
  const eventType = (eventData.eventType || 'CONCERT').trim().toUpperCase();
  const subtitle = (eventData.subtitle || '').trim().toUpperCase();
  const slogan = (eventData.slogan || '').trim().toUpperCase();
  const dateStr = (eventData.startDate || 'DATE À COMMUNIQUER').toUpperCase();
  const timeStr = eventData.startTime ? `${eventData.startTime}${eventData.endTime ? ` - ${eventData.endTime}` : ''}` : '21H00';

  const venue = (eventData.venue || 'Lieu à venir').trim();
  const locationDetails = [eventData.city, eventData.country].filter(Boolean).join(', ');
  const fullLocationStr = locationDetails ? `${venue} (${locationDetails})` : venue;
  const priceStr = eventData.isFree || parseFloat(eventData.price) === 0 ? "ENTRÉE GRATUITE" : `${eventData.price} FCFA`;

  // Vérification de proxy uniquement si l'image n'est pas déjà un flux Base64 (upload local)
  const isBase64 = eventData.image && eventData.image.startsWith('data:image');
  const artistImage = eventData.image
    ? (isBase64 ? eventData.image : `/proxy-image?url=${encodeURIComponent(eventData.image)}`)
    : '/images/default-artist.jpg';

  const coverImage = eventData.coverImage || '';
  const eventSponsors = eventData.sponsors || [];

  // Texture papier grainée universelle
  const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.07'/%3E%3C/svg%3E")`;

  // --- RENDU EN CASCADE DES COMPOSANTS INDÉPENDANTS ---

  // Component: PosterBackground
  const componentBackground = `
    <div style="position: absolute; inset: 0; background-image: ${noiseTexture}; z-index: 1; pointer-events: none;"></div>
    ${coverImage ? `
      <img src="${coverImage}" crossorigin="anonymous" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(45px) brightness(20%); opacity: 0.4; z-index: 2;" onerror="this.style.display='none'"/>
    ` : ''}
    <div style="position: absolute; top: -10%; left: 10%; width: 200px; height: 800px; background: linear-gradient(165deg, rgba(255,255,255,0.02) 0%, transparent 60%); transform: rotate(10deg); filter: blur(20px); z-index: 3;"></div>
    <div style="position: absolute; top: 30%; left: 50%; transform: translateX(-50%); width: 95%; height: 50%; background: radial-gradient(circle, var(--primary-color) 0.04, transparent 70%); z-index: 3; opacity: 0.15;"></div>
  `;

  // Component: PosterHeader
  const componentHeader = `
    <div style="position: absolute; top: 40px; left: 0; width: 100%; text-align: center; z-index: 20;">
      <span style="font-family: var(--font-body); font-weight: 900; font-size: 13px; color: var(--text-color); letter-spacing: 8px; opacity: 0.4; text-transform: uppercase;">
        SHASHAP<span style="color: var(--primary-color);">.</span>
      </span>
    </div>
  `;

  // Component: ArtistPhoto
  const componentArtistPhoto = `
    <div data-layer="photo" style="position: absolute; top: 11%; left: 50%; transform: translateX(-50%); width: 62%; height: 53%; z-index: 10; box-shadow: 0 35px 70px rgba(0,0,0,0.85); border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
      <img src="${artistImage}" crossorigin="anonymous" style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%) contrast(115%) brightness(90%);" onerror="this.src='https://via.placeholder.com/800x1000/222/fff?text=Image+Indisponible'" />
      <div style="position: absolute; bottom: -2px; left: 0; width: 100%; height: 45%; background: linear-gradient(to top, var(--background-color) 12%, transparent 100%);"></div>
    </div>
  `;

  // Component: Typography Block (ArtistName, Subtitle, Slogan)
  const componentTypographyBlock = `
    <div data-layer="typography" style="position: absolute; top: 51%; left: 40px; right: 40px; text-align: center; z-index: 20; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <div style="font-family: var(--font-body); font-weight: 700; font-size: 10px; color: var(--primary-color); letter-spacing: 5px; text-transform: uppercase; margin-bottom: 6px;">
        // ${eventType} ${eventName ? `• ${eventName}` : ''}
      </div>
      <h1 style="font-family: var(--font-title); font-size: 120px; margin: 0; color: var(--text-color); line-height: 0.85; letter-spacing: -1px; text-transform: uppercase; text-shadow: 0 15px 30px rgba(0,0,0,0.95);">
        ${artistName}
      </h1>
      ${subtitle ? `
        <h2 style="font-family: var(--font-body); font-weight: 900; font-size: 20px; margin: 12px 0 0 0; color: var(--text-color); letter-spacing: 10px; text-transform: uppercase; opacity: 0.95;">
          ${subtitle}
        </h2>
      ` : ''}
      ${slogan ? `
        <h3 style="font-family: var(--font-body); font-weight: 500; font-size: 11px; margin: 14px 0 0 0; color: var(--muted-color); letter-spacing: 4px; text-transform: uppercase; max-width: 80%; line-height: 1.4;">
          ${slogan}
        </h3>
      ` : ''}
    </div>
  `;

  // Component: EventInfo + QRCode
  const componentMetadataBlock = `
    <div data-layer="metadata" style="position: absolute; top: 75%; left: 60px; right: 60px; z-index: 20; display: flex; justify-content: space-between; align-items: flex-end;">

      <div style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-body); font-size: 13px; font-weight: 600; color: #F3F4F6; letter-spacing: 1px; text-align: left;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span style="text-transform: uppercase;">${dateStr}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>${timeStr}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; max-width: 380px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span style="line-height: 1.4;">${fullLocationStr}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; margin-top: 2px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><path d="M4 10h16"></path></svg>
          <span style="color: var(--primary-color); font-weight: 800; text-transform: uppercase; font-size: 14px;">${priceStr}</span>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
        <div style="font-family: var(--font-body); font-size: 8px; font-weight: 700; color: var(--muted-color); text-transform: uppercase; letter-spacing: 2px;">Pass Numérique</div>
        <div style="background: #FFFFFF; padding: 5px; border-radius: 6px; width: 80px; height: 80px; box-shadow: 0 12px 24px rgba(0,0,0,0.6);">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://shashap.com/event/${eventData.id || 'live'}&bgcolor=FFFFFF&color=000000&margin=0" crossorigin="anonymous" style="width: 100%; height: 100%; display: block;" />
        </div>
        <div style="font-family: var(--font-body); font-size: 8px; font-weight: 700; color: var(--primary-color); text-transform: uppercase; letter-spacing: 1px;">Scanner pour Entrer</div>
      </div>
    </div>
  `;

  // Component: Sponsors & Footer Line
  const componentSponsorsBlock = `
    <div data-layer="sponsors" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 75px; background: var(--card-background); border-top: 1px solid rgba(255, 255, 255, 0.03); display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 6px;">
      <div style="font-family: var(--font-body); font-size: 8px; font-weight: 700; color: var(--muted-color); text-transform: uppercase; letter-spacing: 3px;">
        ${eventSponsors.length > 0 ? 'Partenaires Officiels' : 'Plateforme de production Shashap'}
      </div>
      <div style="display: flex; gap: 26px; align-items: center; justify-content: center; max-width: 90%; overflow: hidden;">
        ${eventSponsors.length > 0 ? eventSponsors.map(s => `
          <div style="display: flex; align-items: center;">
            ${s.logo ? `
              <img src="${s.logo}" crossorigin="anonymous" style="height: 18px; max-width: 100px; object-fit: contain; filter: grayscale(100%) brightness(250%); opacity: 0.85;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline'"/>
            ` : ''}
            <span style="display: ${s.logo ? 'none' : 'inline'}; font-family: var(--font-body); font-size: 11px; font-weight: 800; color: #E5E7EB; letter-spacing: 0.5px; text-transform: uppercase;">${s.name}</span>
          </div>
        `).join('') : `
          <span style="font-family: var(--font-body); font-size: 10px; font-weight: 500; color: #4B5563; letter-spacing: 2px; text-transform: uppercase;">SHASHAP.COM</span>
        `}
      </div>
    </div>
  `;

  // Construction de l'enveloppe CSS et injection des composants
  return `
    <div style="${cssVariables} position: relative; width: ${dimensions.width}; height: ${dimensions.height}; aspect-ratio: ${dimensions.aspectRatio}; background-color: var(--background-color); overflow: hidden; box-sizing: border-box; user-select: none;">
      <link href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Inter:wght@400;600;700;900&family=Montserrat:wght@400;600;700;900&family=Oswald:wght@400;700&family=Poppins:wght@400;600;700;900&display=swap" rel="stylesheet">
      ${componentBackground}
      ${componentHeader}
      ${componentArtistPhoto}
      ${componentTypographyBlock}
      ${componentMetadataBlock}
      ${componentSponsorsBlock}
    </div>
  `;
}

// ============================================================================
// WORKSPACE WORKFLOW & INTERFACE MODAL INTERACTIVE
// ============================================================================

let shashapUndoStack = [];
let shashapRedoStack = [];
let shashapAutoSaveTimeout = null;

function openEventModal(editIndex = null) {
  const existing = editIndex !== null ? storiesData[editIndex] : null;
  const isEdit = existing !== null;
  const today = new Date().toISOString().split('T')[0];

  // Instanciation de l'unique source de vérité (SOT)
  let eventData = {
    id: existing?.id || Date.now(),
    artistName: existing?.artistName || existing?.name || '',
    eventType: existing?.eventType || 'Concert',
    eventName: existing?.eventName || '',
    subtitle: existing?.subtitle || '',
    slogan: existing?.slogan || '',
    description: existing?.description || '',
    startDate: existing?.startDate || today,
    startTime: existing?.startTime || '21:00',
    endTime: existing?.endTime || '',
    venue: existing?.venue || '',
    city: existing?.city || '',
    country: existing?.country || '',
    image: existing?.image || '',
    coverImage: existing?.coverImage || '',
    isFree: existing?.isFree !== undefined ? existing?.isFree : true,
    price: existing?.price || 0,
    sponsors: existing?.sponsors ? JSON.parse(JSON.stringify(existing?.sponsors)) : [],
    theme: existing?.theme || 'Urban',
    font: existing?.font || 'Montserrat'
  };

  let modal = document.getElementById('eventModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'eventModal';
    modal.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:9999; display:flex; align-items:center; justify-content:center; padding:15px; box-sizing:border-box;";
    document.body.appendChild(modal);
  }

  // Layout Workspace Split-Screen Premium
  modal.innerHTML = `
    <div style="background:#0F1115; border-radius:14px; width:100%; max-width:1240px; height:88vh; display:flex; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,0.5); border:1px solid #222630; color:#E2E8F0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

      <!-- COLONNE GAUCHE : FORMULAIRE DÉFILABLE (55%) -->
      <div id="sh-workspace-form-pane" style="width:55%; height:100%; overflow-y:auto; padding:24px; box-sizing:border-box; border-right:1px solid #222630; display:flex; flex-direction:column; gap:20px; scroll-behavior:smooth;">

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h2 style="margin:0; font-size:20px; font-weight:700;">${isEdit ? 'Studio : Édition' : 'Studio : Nouvelle Affiche'}</h2>
          <div style="display:flex; gap:8px;">
            <button id="sh-action-undo" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px;">⤺ Annuler</button>
            <button id="sh-action-redo" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px;">⤻ Rétablir</button>
          </div>
        </div>

        <!-- BLOC : DIRECTION ARTISTIQUE & THÈMES -->
        <div style="background:#161920; border-radius:10px; padding:16px; border:1px solid #222630;">
          <h4 style="margin:0 0 14px 0; font-size:12px; text-transform:uppercase; color:#94A3B8; letter-spacing:1px;">🎨 Direction Artistique</h4>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:12px; color:#94A3B8;">Modèle Graphique / Thème</label>
              <select id="ui-theme-select" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px;">
                ${Object.keys(SHASHAP_THEMES).map(t => `<option value="${t}" ${eventData.theme === t ? 'selected' : ''}>Thème ${t}</option>`).join('')}
              </select>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:12px; color:#94A3B8;">Typographie de secours</label>
              <select id="ui-font-select" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px;">
                ${SHASHAP_FONTS.map(f => `<option value="${f}" ${eventData.font === f ? 'selected' : ''}>${f}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- BLOC : IDENTITÉ -->
        <div style="background:#161920; border-radius:10px; padding:16px; border:1px solid #222630;">
          <h4 style="margin:0 0 14px 0; font-size:12px; text-transform:uppercase; color:#94A3B8; letter-spacing:1px;">📝 Informations Événement</h4>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:12px;">
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:12px; color:#94A3B8;">Artiste / Line-up *</label>
              <input type="text" id="in-artist" value="${eventData.artistName}" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:12px; color:#94A3B8;">Type de show</label>
              <input type="text" id="in-type" value="${eventData.eventType}" placeholder="Ex: CONCERT, FESTIVAL, DJ SET" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px;">
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:12px;">
            <label style="font-size:12px; color:#94A3B8;">Nom officiel de l'événement</label>
            <input type="text" id="in-eventname" value="${eventData.eventName}" placeholder="Ex: L'Épopée Musicale" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px;">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:12px; color:#94A3B8;">Sous-titre (Accroche)</label>
              <input type="text" id="in-subtitle" value="${eventData.subtitle}" placeholder="Ex: Tournée Mondiale" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:12px; color:#94A3B8;">Slogan de bas d'affiche</label>
              <input type="text" id="in-slogan" value="${eventData.slogan}" placeholder="Ex: Places limitées" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px;">
            </div>
          </div>
        </div>

        <!-- BLOC : LOCALISATION & INFOS RETENUES -->
        <div style="background:#161920; border-radius:10px; padding:16px; border:1px solid #222630;">
          <h4 style="margin:0 0 14px 0; font-size:12px; text-transform:uppercase; color:#94A3B8; letter-spacing:1px;">📅 Logistique & Horaires</h4>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:12px; color:#94A3B8;">Date</label>
              <input type="date" id="in-date" value="${eventData.startDate}" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:12px; color:#94A3B8;">Heure Début</label>
              <input type="time" id="in-time-start" value="${eventData.startTime}" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:12px; color:#94A3B8;">Heure Fin</label>
              <input type="time" id="in-time-end" value="${eventData.endTime}" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px;">
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:12px; color:#94A3B8;">Salle / Complexe</label>
              <input type="text" id="in-venue" value="${eventData.venue}" placeholder="Ex: Opéra" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:12px; color:#94A3B8;">Ville</label>
              <input type="text" id="in-city" value="${eventData.city}" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:12px; color:#94A3B8;">Pays</label>
              <input type="text" id="in-country" value="${eventData.country}" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px;">
            </div>
          </div>
        </div>

        <!-- BLOC : TARIFICATION -->
        <div style="background:#161920; border-radius:10px; padding:16px; border:1px solid #222630;">
          <h4 style="margin:0 0 14px 0; font-size:12px; text-transform:uppercase; color:#94A3B8; letter-spacing:1px;">🎟️ Billetterie & Accès</h4>
          <div style="display:flex; gap:20px; margin-bottom:12px;">
            <label style="cursor:pointer; font-size:13px;"><input type="radio" name="ui-ticket-type" value="free" ${eventData.isFree ? 'checked' : ''}> Entrée Libre / Gratuit</label>
            <label style="cursor:pointer; font-size:13px;"><input type="radio" name="ui-ticket-type" value="paid" ${!eventData.isFree ? 'checked' : ''}> Entrée Payante</label>
          </div>
          <div id="ui-price-input-wrapper" style="display:${eventData.isFree ? 'none' : 'block'};">
            <label style="font-size:12px; color:#94A3B8; display:block; margin-bottom:4px;">Tarif Standard (FCFA)</label>
            <input type="number" id="in-price" value="${eventData.price}" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px; width:100%; box-sizing:border-box;">
          </div>
        </div>

        <!-- BLOC : ASSETS MULTIMÉDIAS -->
        <div style="background:#161920; border-radius:10px; padding:16px; border:1px solid #222630;">
          <h4 style="margin:0 0 14px 0; font-size:12px; text-transform:uppercase; color:#94A3B8; letter-spacing:1px;">🖼️ Photographies & Couvertures</h4>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
            <!-- Ajout des inputs files reliés au module ImageManager -->
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:12px; color:#94A3B8;">Photo Artiste (Fichier local ou URL)</label>
              <input type="file" id="in-file-artist" accept="image/*" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:4px; border-radius:6px; font-size:11px; margin-bottom:4px;">
              <input type="text" id="in-img-artist" value="${eventData.image}" placeholder="https://..." style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:12px; color:#94A3B8;">Image Fond (Fichier local ou URL)</label>
              <input type="file" id="in-file-cover" accept="image/*" style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:4px; border-radius:6px; font-size:11px; margin-bottom:4px;">
              <input type="text" id="in-img-cover" value="${eventData.coverImage}" placeholder="https://..." style="background:#1F232E; border:1px solid #33394F; color:#FFF; padding:8px 12px; border-radius:6px; font-size:13px;">
            </div>
          </div>
        </div>

        <!-- BLOC : SPONSORS EN LIGNE (LOGIQUE INTERNE CONSERVÉE) -->
        <div style="background:#161920; border-radius:10px; padding:16px; border:1px solid #222630;">
          <div style="display:flex; justify-content:between; align-items:center; margin-bottom:14px;">
            <h4 style="margin:0; font-size:12px; text-transform:uppercase; color:#94A3B8; letter-spacing:1px; flex-grow:1;">🤝 Écosystème Partenaires</h4>
            <button type="button" id="ui-add-sponsor-trigger" style="background:#0066CC; border:none; color:#FFF; padding:4px 10px; border-radius:4px; font-size:11px; cursor:pointer;">+ Nouveau</button>
          </div>

          <!-- Formulaire de saisie inline d'un partenaire -->
          <div id="ui-inline-sponsor-form" style="display:none; background:#1F232E; border:1px dashed #33394F; padding:12px; border-radius:8px; margin-bottom:12px;">
            <input type="hidden" id="sp-form-index" value="">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:8px;">
              <input type="text" id="sp-form-name" placeholder="Nom du partenaire *" style="background:#161920; border:1px solid #33394F; color:#FFF; padding:6px 10px; border-radius:4px; font-size:12px;">
              <select id="sp-form-type" style="background:#161920; border:1px solid #33394F; color:#FFF; padding:6px 10px; border-radius:4px; font-size:12px;">
                <option value="Sponsor">Sponsor</option><option value="Partenaire">Partenaire</option><option value="Média">Média</option><option value="Institution">Institution</option>
              </select>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
              <input type="text" id="sp-form-logo" placeholder="URL du Logo" style="background:#161920; border:1px solid #33394F; color:#FFF; padding:6px 10px; border-radius:4px; font-size:12px;">
              <input type="text" id="sp-form-web" placeholder="Site Web" style="background:#161920; border:1px solid #33394F; color:#FFF; padding:6px 10px; border-radius:4px; font-size:12px;">
            </div>
            <div style="display:flex; justify-content:flex-end; gap:6px;">
              <button type="button" id="sp-form-cancel" style="background:#33394F; border:none; color:#FFF; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer;">Annuler</button>
              <button type="button" id="sp-form-validate" style="background:#22C55E; border:none; color:#FFF; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer;">Valider</button>
            </div>
          </div>

          <div id="ui-sponsors-workflow-list" style="display:flex; flex-direction:column; gap:6px;"></div>
        </div>

        <!-- COMMANDE DE FIN DE FORMULAIRE -->
        <div style="margin-top:auto; padding-top:20px; border-top:1px solid #222630; display:flex; justify-content:flex-end; gap:12px;">
          <button style="background:transparent; border:1px solid #33394F; color:#94A3B8; padding:10px 20px; border-radius:8px; cursor:pointer;" onclick="closeEventModal()">Quitter</button>
          <button id="ui-main-save-btn" style="background:#22C55E; border:none; color:#FFF; font-weight:600; padding:10px 20px; border-radius:8px; cursor:pointer;">Enregistrer & Publier</button>
        </div>

      </div>

      <!-- COLONNE DROITE : STUDIO APERÇU TEMPS RÉEL FIXE (45%) -->
      <div style="width:45%; height:100%; background:#090A0F; display:flex; flex-direction:column; box-sizing:border-box;">

        <!-- Barre d'outils supérieure de l'aperçu -->
        <div style="padding:14px 20px; border-bottom:1px solid #222630; display:flex; justify-content:space-between; align-items:center; background:#0F1115;">
          <span style="font-size:12px; font-weight:600; color:#94A3B8; text-transform:uppercase; letter-spacing:0.5px;">Studio de Contrôle A4</span>
          <button id="ui-action-export-pdf" style="background:#FFF; color:#000; font-weight:600; border:none; padding:6px 14px; border-radius:6px; font-size:12px; cursor:pointer; display:flex; align-items:center; gap:6px;">
            <span>📥 Télécharger le PDF</span>
          </button>
        </div>

        <!-- Zone Scénique de Centrage de l'Affiche (Gris Studio Canva) -->
        <div style="flex-grow:1; display:flex; align-items:center; justify-content:center; padding:30px; box-sizing:border-box; overflow:hidden; position:relative;">

          <!-- Conteneur d'ajustement proportionnel (Wrapper Évolutif) -->
          <div id="sh-poster-viewport-container" style="width:100%; max-width:410px; box-shadow:0 30px 70px rgba(0,0,0,0.8); border-radius:6px; overflow:hidden; background:#000; transition: transform 0.2s ease;">
            <!-- Injection dynamique en temps réel -->
          </div>

        </div>

      </div>

    </div>
  `;

  // ============================================================================
  // LOGIQUE DE FLUX ET MISE À JOUR LIVE SANS RECHARGEMENT (MOTEUR INTERNE)
  // ============================================================================

  const updateLivePreview = () => {
    const container = document.getElementById('sh-poster-viewport-container');
    if (container) {
      container.innerHTML = generatePosterHTML(eventData, 'A4', eventData.theme);
    }
  };

  const executeDataStateChange = (mutationBlock) => {
    shashapUndoStack.push(JSON.stringify(eventData));
    shashapRedoStack = [];
    mutationBlock();
    updateLivePreview();
    triggerAutoSave();
  };

  const triggerAutoSave = () => {
    clearTimeout(shashapAutoSaveTimeout);
    shashapAutoSaveTimeout = setTimeout(() => {
      localStorage.setItem('shashap_autosave_draft', JSON.stringify(eventData));
    }, 2500);
  };

  // ÉCOUTEURS COMPORTEMENTAUX ET EXTRACTION DIRECTE SOT
  const bindLiveListeners = () => {
    const inputsMap = {
      'in-artist': 'artistName',
      'in-type': 'eventType',
      'in-eventname': 'eventName',
      'in-subtitle': 'subtitle',
      'in-slogan': 'slogan',
      'in-date': 'startDate',
      'in-time-start': 'startTime',
      'in-time-end': 'endTime',
      'in-venue': 'venue',
      'in-city': 'city',
      'in-country': 'country',
      'in-img-artist': 'image',
      'in-img-cover': 'coverImage',
      'in-price': 'price',
      'ui-theme-select': 'theme',
      'ui-font-select': 'font'
    };

    Object.entries(inputsMap).forEach(([domId, dataKey]) => {
      const el = document.getElementById(domId);
      if (!el) return;
      el.addEventListener('input', (e) => {
        eventData[dataKey] = e.target.value;
        updateLivePreview();
        triggerAutoSave();
      });
    });

    // --- INTEGRATION MODULE IMAGE MANAGER ---
    const imgManager = new ImageManager();

    const handleFileUpload = async (e, dataKey, inputId) => {
      const file = e.target.files[0];
      if (!file) return;

      const result = await imgManager.processImage(file);
      if (result.success) {
        executeDataStateChange(() => {
          eventData[dataKey] = result.url;
          document.getElementById(inputId).value = result.url; // Met à jour l'UI
        });
      }
    };

    document.getElementById('in-file-artist')?.addEventListener('change', (e) => handleFileUpload(e, 'image', 'in-img-artist'));
    document.getElementById('in-file-cover')?.addEventListener('change', (e) => handleFileUpload(e, 'coverImage', 'in-img-cover'));
    // ----------------------------------------

    // Toggle Billetterie
    document.querySelectorAll('input[name="ui-ticket-type"]').forEach(r => {
      r.addEventListener('change', (e) => {
        executeDataStateChange(() => {
          eventData.isFree = (e.target.value === 'free');
          document.getElementById('ui-price-input-wrapper').style.display = eventData.isFree ? 'none' : 'block';
        });
      });
    });

    // Moteur d'historique (Undo / Redo)
    document.getElementById('sh-action-undo').onclick = () => {
      if (shashapUndoStack.length > 0) {
        shashapRedoStack.push(JSON.stringify(eventData));
        eventData = JSON.parse(shashapUndoStack.pop());
        syncFormFieldsWithSOT();
        updateLivePreview();
      }
    };
    document.getElementById('sh-action-redo').onclick = () => {
      if (shashapRedoStack.length > 0) {
        shashapUndoStack.push(JSON.stringify(eventData));
        eventData = JSON.parse(shashapRedoStack.pop());
        syncFormFieldsWithSOT();
        updateLivePreview();
      }
    };
  };

  const syncFormFieldsWithSOT = () => {
    if(document.getElementById('in-artist')) document.getElementById('in-artist').value = eventData.artistName;
    if(document.getElementById('ui-theme-select')) document.getElementById('ui-theme-select').value = eventData.theme;
    if(document.getElementById('ui-font-select')) document.getElementById('ui-font-select').value = eventData.font;
    if(document.getElementById('in-type')) document.getElementById('in-type').value = eventData.eventType;
    if(document.getElementById('in-eventname')) document.getElementById('in-eventname').value = eventData.eventName;
    if(document.getElementById('in-subtitle')) document.getElementById('in-subtitle').value = eventData.subtitle;
    if(document.getElementById('in-slogan')) document.getElementById('in-slogan').value = eventData.slogan;
    if(document.getElementById('in-date')) document.getElementById('in-date').value = eventData.startDate;
    if(document.getElementById('in-time-start')) document.getElementById('in-time-start').value = eventData.startTime;
    if(document.getElementById('in-time-end')) document.getElementById('in-time-end').value = eventData.endTime;
    if(document.getElementById('in-venue')) document.getElementById('in-venue').value = eventData.venue;
    if(document.getElementById('in-city')) document.getElementById('in-city').value = eventData.city;
    if(document.getElementById('in-country')) document.getElementById('in-country').value = eventData.country;
    if(document.getElementById('in-img-artist')) document.getElementById('in-img-artist').value = eventData.image;
    if(document.getElementById('in-img-cover')) document.getElementById('in-img-cover').value = eventData.coverImage;
    if(document.getElementById('in-price')) document.getElementById('in-price').value = eventData.price;
    renderSponsorsListWorkflow();
  };

  // RENDU INTERNE DE LA GESTION ET COMPOSANT SPONSORS
  const renderSponsorsListWorkflow = () => {
    const list = document.getElementById('ui-sponsors-workflow-list');
    if (!list) return;

    if (eventData.sponsors.length === 0) {
      list.innerHTML = `<div style="text-align:center; font-size:12px; color:#52525B; padding:10px; border:1px dashed #222630; border-radius:6px;">Aucun sponsor lié</div>`;
      return;
    }

    list.innerHTML = eventData.sponsors.map((s, idx) => `
      <div style="display:flex; align-items:center; justify-content:space-between; background:#1F232E; padding:8px 12px; border-radius:6px; border:1px solid #33394F;">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${s.logo || 'https://via.placeholder.com/60?text=Logo'}" style="width:26px; height:26px; object-fit:contain; background:#FFF; border-radius:4px; padding:1px;" onerror="this.src='https://via.placeholder.com/60?text=Logo'">
          <div style="display:flex; flex-direction:column;">
            <span style="font-size:12px; font-weight:600; color:#FFF;">${s.name}</span>
            <span style="font-size:9px; color:#94A3B8; text-transform:uppercase;">${s.type}</span>
          </div>
        </div>
        <div style="display:flex; gap:2px;">
          <button type="button" class="sh-sp-nav-up" data-idx="${idx}" style="background:none; border:none; color:#94A3B8; cursor:pointer; font-size:11px;" ${idx === 0 ? 'disabled style="opacity:0.2;"' : ''}>▲</button>
          <button type="button" class="sh-sp-nav-down" data-idx="${idx}" style="background:none; border:none; color:#94A3B8; cursor:pointer; font-size:11px;" ${idx === eventData.sponsors.length - 1 ? 'disabled style="opacity:0.2;"' : ''}>▼</button>
          <button type="button" class="sh-sp-nav-edit" data-idx="${idx}" style="background:none; border:none; color:#38BDF8; cursor:pointer; font-size:11px; margin-left:4px;">✏️</button>
          <button type="button" class="sh-sp-nav-del" data-idx="${idx}" style="background:none; border:none; color:#F87171; cursor:pointer; font-size:11px;">🗑️</button>
        </div>
      </div>
    `).join('');

    attachSponsorsWorkflowEvents();
  };

  const attachSponsorsWorkflowEvents = () => {
    document.querySelectorAll('.sh-sp-nav-up').forEach(b => b.onclick = (e) => {
      const idx = parseInt(e.target.dataset.idx);
      executeDataStateChange(() => {
        [eventData.sponsors[idx], eventData.sponsors[idx - 1]] = [eventData.sponsors[idx - 1], eventData.sponsors[idx]];
      });
      renderSponsorsListWorkflow();
    });

    document.querySelectorAll('.sh-sp-nav-down').forEach(b => b.onclick = (e) => {
      const idx = parseInt(e.target.dataset.idx);
      executeDataStateChange(() => {
        [eventData.sponsors[idx], eventData.sponsors[idx + 1]] = [eventData.sponsors[idx + 1], eventData.sponsors[idx]];
      });
      renderSponsorsListWorkflow();
    });

    document.querySelectorAll('.sh-sp-nav-del').forEach(b => b.onclick = (e) => {
      const idx = parseInt(e.target.dataset.idx);
      executeDataStateChange(() => { eventData.sponsors.splice(idx, 1); });
      renderSponsorsListWorkflow();
    });

    document.querySelectorAll('.sh-sp-nav-edit').forEach(b => b.onclick = (e) => {
      const idx = parseInt(e.target.dataset.idx);
      const s = eventData.sponsors[idx];
      document.getElementById('sp-form-index').value = idx;
      document.getElementById('sp-form-name').value = s.name;
      document.getElementById('sp-form-type').value = s.type;
      document.getElementById('sp-form-logo').value = s.logo || '';
      document.getElementById('sp-form-web').value = s.website || '';
      document.getElementById('ui-inline-sponsor-form').style.display = 'block';
    });
  };

  // Triggers d'activation formulaire sponsors
  document.getElementById('ui-add-sponsor-trigger').onclick = () => {
    document.getElementById('sp-form-index').value = '';
    document.getElementById('sp-form-name').value = '';
    document.getElementById('sp-form-logo').value = '';
    document.getElementById('sp-form-web').value = '';
    document.getElementById('ui-inline-sponsor-form').style.display = 'block';
  };

  document.getElementById('sp-form-cancel').onclick = () => {
    document.getElementById('ui-inline-sponsor-form').style.display = 'none';
  };

  document.getElementById('sp-form-validate').onclick = () => {
    const name = document.getElementById('sp-form-name').value.trim();
    if (!name) return alert('Le nom du partenaire est obligatoire.');

    const sIdx = document.getElementById('sp-form-index').value;
    const sponsorPayload = {
      name,
      type: document.getElementById('sp-form-type').value,
      logo: document.getElementById('sp-form-logo').value.trim(),
      website: document.getElementById('sp-form-web').value.trim()
    };

    executeDataStateChange(() => {
      if (sIdx !== '') eventData.sponsors[parseInt(sIdx)] = sponsorPayload;
      else eventData.sponsors.push(sponsorPayload);
    });

    document.getElementById('ui-inline-sponsor-form').style.display = 'none';
    renderSponsorsListWorkflow();
  };

  // INITIALISATION DES COMPOSANTS ET ÉCOUTEURS
  updateLivePreview();
  bindLiveListeners();
  renderSponsorsListWorkflow();

  // ACTION DU BOUTON DE TÉLÉCHARGEMENT DIRECT DEPUIS L'APERÇU REAL-TIME
  document.getElementById('ui-action-export-pdf').onclick = async () => {
    const renderNode = document.createElement('div');
    renderNode.style.cssText = "position:absolute; left:-9999px; top:0; width:794px; height:1123px;";
    renderNode.innerHTML = generatePosterHTML(eventData, 'A4', eventData.theme);
    document.body.appendChild(renderNode);

    try {
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 600));

      const canvas = await html2canvas(renderNode.firstElementChild, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      const cleanTitle = (eventData.artistName || 'shashap').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`shashap_${cleanTitle}_2026.pdf`);
      showToast('🚀 Affiche haute définition générée avec succès !');
    } catch (err) {
      console.error("Erreur d'acquisition canevas Studio Shashap:", err);
    } finally {
      document.body.removeChild(renderNode);
    }
  };

  // ENREGISTREMENT ET PIPELINES D'INFRASTRUCTURE EXISTANTS (ZÉRO RUPTURE)
  document.getElementById('ui-main-save-btn').onclick = () => {
    if (!eventData.artistName.trim()) {
      alert("Le nom de l'artiste est requis pour l'impression.");
      return;
    }

    eventData.name = eventData.eventName || eventData.artistName;
    eventData.endDate = eventData.startDate;
    eventData.isEvent = true;

    if (isEdit) storiesData[editIndex] = eventData;
    else storiesData.unshift(eventData);

    if (typeof saveStoriesToStorage === 'function') saveStoriesToStorage();
    if (typeof renderStories === 'function') renderStories();
    if (typeof syncStoriesToBackend === 'function') syncStoriesToBackend();
    if (typeof loadEvents === 'function') loadEvents();

    localStorage.removeItem('shashap_autosave_draft');
    closeEventModal();
    if (typeof showToast === 'function') showToast('✨ Événement et charte graphique enregistrés');
  };
}

// ============================================================================
// PIPELINE D'EXPORT UNIFIÉ EXTRACANVAS (FONCTION GLOBALE ACCESSIBLE)
// ============================================================================
 async function exportEventToPDF(index) {
  const ev = storiesData[index];
  if (!ev) return;

  const targetNode = document.createElement('div');
  targetNode.style.cssText = "position:absolute; left:-9999px; top:0; width:794px; height:1123px;";
  targetNode.innerHTML = generatePosterHTML(ev, 'A4', ev.theme || 'Urban');
  document.body.appendChild(targetNode);

  try {
    await document.fonts.ready;
    await new Promise(r => setTimeout(r, 700));

    const canvas = await html2canvas(targetNode.firstElementChild, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

    const cleanTitle = (ev.artistName || ev.name || 'event').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    pdf.save(`shashap_${cleanTitle}_2026.pdf`);
  } catch (error) {
    console.error("Erreur lors de l'export autonome:", error);
  } finally {
    document.body.removeChild(targetNode);
  }
}
 function closeEventModal() {
  const modal = document.getElementById('eventModal');
  if (modal) modal.style.display = 'none';
  clearTimeout(shashapAutoSaveTimeout);
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

  errorSpan.style.display = 'none';
  saveBtn.disabled = false;
  startInput.style.border = '1px solid #eee';
  endInput.style.border = '1px solid #eee';

  if (!start || !end) {
    saveBtn.disabled = true;
    return;
  }

  if (end < start) {
    errorSpan.textContent = '⚠️ La date de fin doit être après la date de début';
    errorSpan.style.display = 'block';
    saveBtn.disabled = true;
    endInput.style.border = '1px solid #E53935';
    return;
  }

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
        <button onclick="openEventModal()"
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

        <div style="width:100%; height: 280px; overflow:hidden; position:relative; background: #111;">
          ${ ev.image
            ? `<img src="${ev.image}" alt="${title}" class="event-img" style="width:100%; height:100%; object-fit:cover; display:block; transition: transform 0.8s cubic-bezier(0.2,0.8,0.2,1);" />`
            : `<div class="event-img" style="width:100%; height:100%; background: linear-gradient(135deg, #2c3e50, #000000); display:flex; align-items:center; justify-content:center; transition: transform 0.8s cubic-bezier(0.2,0.8,0.2,1);"><span style="font-size:64px; opacity:0.3;">🎵</span></div>`
          }
          <div style="position:absolute; inset:0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);"></div>

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

        <div style="padding: 24px; flex:1; display:flex; flex-direction:column; gap: 24px;">

          <p style="
            margin: 0; font-size: 15px; color: #4B5563; line-height: 1.6;
            font-weight: 400; min-height: 44px;
          ">
            ${ev.description || 'Aucune description pour cet événement.'}
          </p>

          <div style="display:flex; flex-wrap:wrap; gap: 8px;">
            <div style="display:flex; align-items:center; gap:6px; background:#F3F4F6; padding:6px 12px; border-radius:12px; color:#4B5563; font-size:12px; font-weight:600;">
              🎧 DJ Set
            </div>
            <div style="display:flex; align-items:center; gap:6px; background:#F3F4F6; padding:6px 12px; border-radius:12px; color:#4B5563; font-size:12px; font-weight:600;">
              ✨ Premium
            </div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:auto;">
            <button onclick="editEventByIndex(${realIndex})" style="min-width:100px; flex:1; height: 48px; padding: 0 12px; display:flex; align-items:center; justify-content:center; gap:6px; background: linear-gradient(135deg, #4c1d95 0%, #be185d 100%); color:#ffffff; border: none; border-radius: 16px; font-size:13px; font-weight:600; cursor:pointer; box-shadow: 0 6px 16px rgba(190, 24, 93, 0.25); transition: all 0.3s ease;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg> Modifier
            </button>

            <button onclick="exportEventToPDF(${realIndex})" style="min-width:100px; flex:1; height: 48px; padding: 0 12px; display:flex; align-items:center; justify-content:center; gap:6px; background:#ffffff; color:#374151; border: 1px solid #E5E7EB; border-radius: 16px; font-size:13px; font-weight:600; cursor:pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.3s ease;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> PDF
            </button>

            <button data-confirm="false" onclick="confirmDelete(this, ${realIndex})" style="min-width:100px; flex:1; height: 48px; padding: 0 12px; display:flex; align-items:center; justify-content:center; gap:6px; background:#ffffff; color:#DC2626; border: 1px solid rgba(220, 38, 38, 0.2); border-radius: 16px; font-size:13px; font-weight:600; cursor:pointer; transition: all 0.3s cubic-bezier(0.2,0.8,0.2,1);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Supprimer
            </button>
          </div>
        </div>
      </div>`;
  });

  container.innerHTML = html;
}
// ============================================================================
// EXPOSITION GLOBALE POUR COMPATIBILITÉ AVEC SHASHAP.JS
// ============================================================================
window.loadEvents = loadEvents;
window.openEventModal = openEventModal;
window.editEventByIndex = editEventByIndex;
window.deleteEventByIndex = deleteEventByIndex;
window.exportEventToPDF = exportEventToPDF;
window.closeEventModal = closeEventModal;
window.validateEventDates = validateEventDates;
window.confirmDelete = confirmDelete;
window.gene
