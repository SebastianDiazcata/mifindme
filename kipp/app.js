/* ═══════════════════════════════════════
   KIPP — Panel de Control V3 (OLED/DB/Premium)
   ═══════════════════════════════════════ */

const API_URL = 'http://127.0.0.1:5000/api';

// ─── Data Fallback (in case backend is down) ───
const DB = {
    users: [
        { id: 1, nombre: 'Usuario Demo', email: 'demo@kipp.cl', password: '123456', plan_premium: false }
    ],
    personalities: [
        { id: 1, nombre: 'Formal', emoji: '🎩', descripcion: 'Respuestas profesionales, estructuradas y corteses.', es_premium: false, prompt: 'Eres KIPP, personalidad FORMAL.' },
        { id: 2, nombre: 'Informal', emoji: '😎', descripcion: 'Amigable, relajado y cercano. Usa jerga chilena.', es_premium: false, prompt: 'Eres KIPP, personalidad INFORMAL.' },
        { id: 3, nombre: 'Sarcástico', emoji: '😏', descripcion: 'Irónico, ingenioso y con humor ácido.', es_premium: false, prompt: 'Eres KIPP, personalidad SARCÁSTICA.' },
        { id: 4, nombre: 'Técnico', emoji: '⚙️', descripcion: 'Respuestas detalladas con terminología especializada.', es_premium: false, prompt: 'Eres KIPP, personalidad TÉCNICA.' },
        { id: 5, nombre: 'Profesor', emoji: '📚', descripcion: 'Pedagógico y paciente. Explica conceptos paso a paso.', es_premium: true, prompt: 'Eres KIPP, personalidad PROFESOR.' },
        { id: 6, nombre: 'Custom', emoji: '✨', descripcion: 'Crea tu propia personalidad escribiendo un prompt personalizado.', es_premium: true, prompt: '' }
    ],
    history: [],
    config: { volumen: 70, velocidad: 50, nombre_dispositivo: 'KIPP de Escritorio', modelo_ia: 'gpt-4o-mini', personalidad_activa: 2, custom_prompt: '' }
};

// ─── State ───
let state = {
    user: null,
    currentPage: 'personalidad',
    selectedPersonality: null,
    activePersonality: 2
};

// ─── Init ───
document.addEventListener('DOMContentLoaded', async function() {
    const savedUser = localStorage.getItem('kipp_user');
    if (savedUser) {
        state.user = JSON.parse(savedUser);
        showApp();
    }

    const savedConfig = localStorage.getItem('kipp_config');
    if (savedConfig) Object.assign(DB.config, JSON.parse(savedConfig));

    const savedActive = localStorage.getItem('kipp_active_personality');
    if (savedActive) state.activePersonality = parseInt(savedActive);

    bindLoginEvents();
    bindNavEvents();
    bindPageEvents();
    bindPaymentEvents();
});

// ═══════════════════════════════════════
//  API FETCH
// ═══════════════════════════════════════
async function fetchFromDB() {
    try {
        const pRes = await fetch(API_URL + '/personalidades');
        if (pRes.ok) {
            const pData = await pRes.json();
            // keep custom at the end
            const customP = DB.personalities.find(p => p.id === 6);
            DB.personalities = pData;
            if(!DB.personalities.find(p => p.id===6)) DB.personalities.push(customP);
        }

        const hRes = await fetch(API_URL + '/historial');
        if (hRes.ok) {
            DB.history = await hRes.json();
            renderHistory();
        }
    } catch (e) {
        console.warn('Backend API not reachable. Using fallback data.', e);
        showToast('Modo Offline: Backend no conectado', 'error');
    }
}

// ═══════════════════════════════════════
//  LOGIN / AUTH
// ═══════════════════════════════════════
function bindLoginEvents() {
    var loginForm = document.getElementById('loginForm');
    var demoBtn = document.getElementById('demoBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var email = document.getElementById('loginEmail').value.trim();
            var pass = document.getElementById('loginPassword').value;

            var user = DB.users.find(function(u) { return u.email === email && u.password === pass; });
            if (user) {
                loginSuccess(user);
            } else {
                showToast('Acceso Denegado', 'error');
            }
        });
    }

    if (demoBtn) {
        demoBtn.addEventListener('click', function() {
            loginSuccess(DB.users[0]);
        });
    }

    var toggleLoginPass = document.getElementById('toggleLoginPass');
    if (toggleLoginPass) {
        toggleLoginPass.addEventListener('click', function() {
            var inp = document.getElementById('loginPassword');
            inp.type = inp.type === 'password' ? 'text' : 'password';
        });
    }
}

function loginSuccess(user) {
    state.user = user;
    localStorage.setItem('kipp_user', JSON.stringify(user));
    showApp();
    showToast('ACCESO CONCEDIDO: ' + user.nombre, 'success');
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    updateUserUI();
    fetchFromDB().then(() => {
        renderPersonalities();
        renderHistory();
    });
    loadSettings();
    navigateTo('personalidad');
}

function logout() {
    state.user = null;
    localStorage.removeItem('kipp_user');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    showToast('SESIÓN TERMINADA', 'info');
}

function updateUserUI() {
    if (!state.user) return;
    document.getElementById('userName').textContent = state.user.nombre;
    document.getElementById('userPlan').textContent = state.user.plan_premium ? '★ PREMIUM' : 'FREE';
    
    // Update Subscription page visually
    const currentPlanName = document.getElementById('currentPlanName');
    const currentPlanDesc = document.getElementById('currentPlanDesc');
    const planIcon = document.querySelector('.plan-icon-box');
    const upgradeBtn = document.getElementById('upgradePremiumBtn');

    if (state.user.plan_premium) {
        currentPlanName.textContent = 'Plan Premium';
        currentPlanDesc.textContent = 'Funciones avanzadas y prompts personalizados activos.';
        if(planIcon) {
            planIcon.classList.remove('free');
            planIcon.classList.add('premium-active');
            planIcon.innerHTML = '★';
        }
        if(upgradeBtn) {
            upgradeBtn.textContent = 'PLAN ACTIVO';
            upgradeBtn.disabled = true;
            upgradeBtn.style.opacity = '0.5';
        }
    }
}

// ═══════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════
function bindNavEvents() {
    document.querySelectorAll('.sidebar-link').forEach(function(link) {
        link.addEventListener('click', function() {
            navigateTo(this.getAttribute('data-page'));
            closeSidebar();
        });
    });

    var hamburger = document.getElementById('hamburgerBtn');
    if (hamburger) hamburger.addEventListener('click', openSidebar);

    var closeBtn = document.getElementById('sidebarClose');
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

    var overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.addEventListener('click', closeSidebar);

    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

function navigateTo(page) {
    state.currentPage = page;
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    var target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    document.querySelectorAll('.sidebar-link').forEach(function(l) {
        l.classList.toggle('active', l.getAttribute('data-page') === page);
    });

    var titles = { personalidad: 'Personalidad', historial: 'Historial', suscripcion: 'Suscripción', ajustes: 'Ajustes' };
    document.getElementById('pageTitle').textContent = titles[page] || page;
}

function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('open');
}
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('open');
}

// ═══════════════════════════════════════
//  PERSONALITY
// ═══════════════════════════════════════
function renderPersonalities() {
    var grid = document.getElementById('personalityGrid');
    if (!grid) return;
    grid.innerHTML = '';

    DB.personalities.forEach(function(p) {
        var card = document.createElement('div');
        var isActive = p.id === state.activePersonality;
        var isLocked = p.es_premium && (!state.user || !state.user.plan_premium);

        card.className = 'p-card' + (isActive ? ' selected' : '') + (isLocked ? ' locked' : '');
        card.setAttribute('data-id', p.id);

        var premium = p.es_premium ? '<span class="premium-tag">PREMIUM</span>' : '';
        card.innerHTML = '<div class="p-card-emoji">' + p.emoji + '</div>' +
            '<div class="p-card-name">' + p.nombre + '</div>' +
            '<div class="p-card-desc">' + p.descripcion + '</div>' + premium;

        card.addEventListener('click', function() { selectPersonality(p.id); });
        grid.appendChild(card);
    });
}

function selectPersonality(id) {
    var p = DB.personalities.find(function(x) { return x.id === id; });
    if (!p) return;

    var isLocked = p.es_premium && (!state.user || !state.user.plan_premium);
    if (isLocked) {
        showToast('REQUIERE UPGRADE A PREMIUM', 'error');
        navigateTo('suscripcion');
        return;
    }

    state.selectedPersonality = id;

    var panel = document.getElementById('previewPanel');
    panel.style.display = 'block';
    document.getElementById('previewEmoji').textContent = p.emoji;
    document.getElementById('previewName').textContent = p.nombre;
    document.getElementById('previewText').textContent = p.prompt ? 'PROMPT: "' + p.prompt + '"' : '';

    var customArea = document.getElementById('customPromptArea');
    var customInput = document.getElementById('customPromptInput');
    if (p.nombre === 'Custom') {
        customArea.style.display = 'block';
        customInput.value = DB.config.custom_prompt || '';
    } else {
        customArea.style.display = 'none';
    }

    var isActive = id === state.activePersonality;
    document.getElementById('previewTag').textContent = isActive ? '[ACTIVA]' : '[SELECCIONADA]';

    document.querySelectorAll('.p-card').forEach(function(c) {
        c.classList.toggle('selected', parseInt(c.getAttribute('data-id')) === id);
    });
}

function bindPageEvents() {
    var applyBtn = document.getElementById('applyPersonalityBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            if (state.selectedPersonality) {
                var p = DB.personalities.find(function(x) { return x.id === state.selectedPersonality; });
                
                if (p.nombre === 'Custom') {
                    var val = document.getElementById('customPromptInput').value.trim();
                    if(!val) {
                        showToast('ERROR: PROMPT VACÍO', 'error');
                        return;
                    }
                    DB.config.custom_prompt = val;
                }

                state.activePersonality = state.selectedPersonality;
                localStorage.setItem('kipp_active_personality', state.activePersonality);
                localStorage.setItem('kipp_config', JSON.stringify(DB.config));
                
                showToast('CONFIGURADA: ' + p.nombre.toUpperCase(), 'success');
                renderPersonalities();
                selectPersonality(state.activePersonality);
            }
        });
    }

    var saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            DB.config.volumen = parseInt(document.getElementById('volumeRange').value);
            DB.config.velocidad = parseInt(document.getElementById('speedRange').value);
            DB.config.nombre_dispositivo = document.getElementById('deviceNameInput').value;
            localStorage.setItem('kipp_config', JSON.stringify(DB.config));
            showToast('AJUSTES GUARDADOS', 'success');
        });
    }

    var vol = document.getElementById('volumeRange');
    if (vol) vol.addEventListener('input', function() { document.getElementById('volVal').textContent = this.value; });

    var spd = document.getElementById('speedRange');
    if (spd) spd.addEventListener('input', function() { document.getElementById('spdVal').textContent = this.value; });
}

// ═══════════════════════════════════════
//  PAYMENT MODAL
// ═══════════════════════════════════════
function bindPaymentEvents() {
    var upgradeBtn = document.getElementById('upgradePremiumBtn');
    var paymentModal = document.getElementById('paymentModal');
    var cancelBtn = document.getElementById('cancelPaymentBtn');
    var paymentForm = document.getElementById('paymentForm');

    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', function() {
            if (state.user && state.user.plan_premium) return;
            paymentModal.classList.add('active');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            paymentModal.classList.remove('active');
        });
    }

    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Simulate payment processing
            var btn = paymentForm.querySelector('.btn-pay');
            var originalText = btn.textContent;
            btn.textContent = 'PROCESANDO...';
            btn.disabled = true;

            setTimeout(function() {
                state.user.plan_premium = true;
                localStorage.setItem('kipp_user', JSON.stringify(state.user));
                
                paymentModal.classList.remove('active');
                btn.textContent = originalText;
                btn.disabled = false;
                paymentForm.reset();

                updateUserUI();
                renderPersonalities(); // Unlock premium cards
                showToast('PAGO APROBADO: BIENVENIDO A PREMIUM', 'success');
            }, 1500);
        });
    }
}

// ═══════════════════════════════════════
//  HISTORY
// ═══════════════════════════════════════
function renderHistory() {
    var list = document.getElementById('historyList');
    var empty = document.getElementById('emptyHistory');
    if (!list) return;

    list.querySelectorAll('.history-item').forEach(function(el) { el.remove(); });

    if (DB.history.length === 0) {
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    DB.history.forEach(function(entry) {
        var item = document.createElement('div');
        item.className = 'history-item';

        var dateStr = entry.fecha ? new Date(entry.fecha).toLocaleString() : 'N/A';

        item.innerHTML = '<div class="history-q">' + escapeHtml(entry.pregunta || '') + '</div>' +
            '<div class="history-a">' + escapeHtml(entry.respuesta || '') + '</div>' +
            '<div class="history-meta">' +
            '<span>TIME: ' + dateStr + '</span>' +
            '<span>LATENCY: ' + (entry.tiempo_ms || 0) + 'ms</span>' +
            '<span>MODE: ' + (entry.personalidad || 'Desconocido') + '</span>' +
            '</div>';

        list.appendChild(item);
    });
}

// ═══════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════
function loadSettings() {
    document.getElementById('volumeRange').value = DB.config.volumen;
    document.getElementById('volVal').textContent = DB.config.volumen;
    document.getElementById('speedRange').value = DB.config.velocidad;
    document.getElementById('spdVal').textContent = DB.config.velocidad;
    document.getElementById('deviceNameInput').value = DB.config.nombre_dispositivo;
}

// ═══════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════
function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toastContainer');
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = '150ms ease';
        setTimeout(function() { toast.remove(); }, 200);
    }, 3000);
}
