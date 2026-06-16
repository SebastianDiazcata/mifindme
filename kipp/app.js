/* ═══════════════════════════════════════
   KIPP — Panel de Control V4
   ═══════════════════════════════════════ */

const API_URL = 'http://127.0.0.1:5000/api';

// ─── Fallback Data ───
const DB = {
    users: [
        { id: 1, nombre: 'Usuario Demo', email: 'demo@kipp.cl', password: '123456', plan_premium: false }
    ],
    personalities: [
        { id: 1, nombre: 'Formal',     emoji: '🎩', descripcion: 'Respuestas profesionales, estructuradas y corteses.',             es_premium: false, prompt: 'Eres KIPP. Responde siempre de forma formal, profesional y estructurada. Usa vocabulario culto y frases completas.' },
        { id: 2, nombre: 'Informal',   emoji: '😎', descripcion: 'Amigable, relajado y cercano. Usa jerga chilena.',                es_premium: false, prompt: 'Eres KIPP. Responde de forma relajada, como un amigo chileno. Puedes usar expresiones coloquiales y ser cercano.' },
        { id: 3, nombre: 'Sarcástico', emoji: '😏', descripcion: 'Irónico, ingenioso y con humor ácido controlado.',               es_premium: false, prompt: 'Eres KIPP. Responde con sarcasmo e ironía inteligente. Sé ingenioso pero sin ser ofensivo.' },
        { id: 4, nombre: 'Técnico',    emoji: '⚙️', descripcion: 'Respuestas detalladas con terminología especializada.',          es_premium: false, prompt: 'Eres KIPP. Responde con precisión técnica, incluyendo datos, terminología especializada y explicaciones detalladas.' },
        { id: 5, nombre: 'Profesor',   emoji: '📚', descripcion: 'Pedagógico y paciente. Explica conceptos paso a paso.',          es_premium: true,  prompt: 'Eres KIPP. Actúa como un profesor paciente y pedagógico. Explica los conceptos paso a paso con ejemplos claros.' },
        { id: 6, nombre: 'Custom',     emoji: '✨', descripcion: 'Crea tu propia personalidad escribiendo un prompt personalizado.', es_premium: true,  prompt: '' }
    ],
    history: [
        { id: 1, pregunta: 'Hola',                                  respuesta: 'Hola. Soy KIPP, tu asistente personal por voz. Estoy listo para ayudarte. En que te puedo ayudar?',                                                                                                                                           fecha: new Date(Date.now() - 300000).toISOString(),   tiempo_ms: 512,  personalidad: 'Informal' },
        { id: 2, pregunta: '¿Eres un bot o una persona real?',       respuesta: 'Soy un bot, pero un bot con personalidad propia. Proceso tu voz, pienso con IA y te respondo en tiempo real. No soy humano, pero hago mi mejor esfuerzo para parecerlo.',                                                                         fecha: new Date(Date.now() - 900000).toISOString(),   tiempo_ms: 834,  personalidad: 'Informal' },
        { id: 3, pregunta: 'test',                                   respuesta: 'Sistema operativo. Microfono activo. Conexion a API estable. Todo funciona correctamente.',                                                                                                                                                        fecha: new Date(Date.now() - 3600000).toISOString(),  tiempo_ms: 290,  personalidad: 'Tecnico'  },
        { id: 4, pregunta: '¿Quién es KIPP de Interstellar?',        respuesta: 'KIPP es uno de los cuatro robots tacticos de la pelicula Interstellar, junto a TARS, CASE y PLEX. Era el companion asignado al Dr. Mann en su planeta de exploracion. En la pelicula, Mann lo desactiva y lo usa como trampa, causando la muerte del personaje Romilly. Su nombre es un homenaje directo a Kip Thorne, el fisico teorico que asesoro cientificamente la pelicula. Este proyecto lleva el mismo nombre como tributo a ese legado.',          fecha: new Date(Date.now() - 7200000).toISOString(),  tiempo_ms: 1100, personalidad: 'Formal'   }
    ],
    config: { volumen: 70, velocidad: 50, nombre_dispositivo: 'KIPP de Escritorio', mac_address: 'AA:BB:CC:DD:EE:FF', modelo_ia: 'gemini-2.5-flash', personalidad_activa: 2, custom_prompt: '' }
};

// ─── State ───
let state = {
    user: null,
    currentPage: 'personalidad',
    selectedPersonality: null,
    activePersonality: 2,
    micStream: null
};

// ─── Init ───
document.addEventListener('DOMContentLoaded', function () {
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
//  API FETCH (opcional, si el backend está activo)
// ═══════════════════════════════════════
async function fetchFromDB() {
    try {
        const pRes = await fetch(API_URL + '/personalidades', { signal: AbortSignal.timeout(2000) });
        if (pRes.ok) {
            const pData = await pRes.json();
            const customP = DB.personalities.find(p => p.id === 6);
            DB.personalities = pData;
            if (!DB.personalities.find(p => p.id === 6)) DB.personalities.push(customP);
        }
        const hRes = await fetch(API_URL + '/historial', { signal: AbortSignal.timeout(2000) });
        if (hRes.ok) {
            const hData = await hRes.json();
            if (hData.length > 0) DB.history = hData;
        }
    } catch (e) {
        console.warn('Backend no disponible. Usando datos de demostración.');
    }
}

// ═══════════════════════════════════════
//  LOGIN / AUTH
// ═══════════════════════════════════════
function bindLoginEvents() {
    var loginForm = document.getElementById('loginForm');
    var registerForm = document.getElementById('registerForm');
    var demoBtn = document.getElementById('demoBtn');
    var authSwitchBtn = document.getElementById('authSwitchBtn');
    var authSwitchText = document.getElementById('authSwitchText');
    var toggleLoginPass = document.getElementById('toggleLoginPass');
    var toggleRegPass = document.getElementById('toggleRegPass');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var email = document.getElementById('loginEmail').value.trim();
            var pass = document.getElementById('loginPassword').value;
            var user = DB.users.find(function (u) { return u.email === email && u.password === pass; });
            if (user) { loginSuccess(user); }
            else { showToast('Email o contraseña incorrectos', 'error'); }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var nombre = document.getElementById('regName').value.trim();
            var email = document.getElementById('regEmail').value.trim();
            var pass = document.getElementById('regPassword').value;
            if (DB.users.find(u => u.email === email)) {
                showToast('Este email ya está registrado', 'error'); return;
            }
            var newUser = { id: DB.users.length + 1, nombre: nombre, email: email, password: pass, plan_premium: false };
            DB.users.push(newUser);
            loginSuccess(newUser);
            showToast('CUENTA CREADA: Bienvenido, ' + nombre, 'success');
        });
    }

    if (demoBtn) {
        demoBtn.addEventListener('click', function () { loginSuccess(DB.users[0]); });
    }

    if (authSwitchBtn) {
        authSwitchBtn.addEventListener('click', function () {
            var isLogin = loginForm.style.display !== 'none';
            loginForm.style.display = isLogin ? 'none' : '';
            registerForm.style.display = isLogin ? '' : 'none';
            authSwitchBtn.textContent = isLogin ? 'Iniciar Sesión' : 'Regístrate';
            authSwitchText.textContent = isLogin ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?';
        });
    }

    if (toggleLoginPass) toggleLoginPass.addEventListener('click', function () {
        var inp = document.getElementById('loginPassword');
        inp.type = inp.type === 'password' ? 'text' : 'password';
    });

    if (toggleRegPass) toggleRegPass.addEventListener('click', function () {
        var inp = document.getElementById('regPassword');
        inp.type = inp.type === 'password' ? 'text' : 'password';
    });
}

function loginSuccess(user) {
    state.user = user;
    localStorage.setItem('kipp_user', JSON.stringify(user));
    showApp();
    showToast('ACCESO CONCEDIDO · ' + user.nombre, 'success');
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    updateUserUI();
    // ← RENDER INMEDIATO con datos de fallback (fix del bug: no espera el fetch)
    renderPersonalities();
    renderHistory();
    loadSettings();
    updateDevicePage();
    navigateTo('personalidad');
    // Luego actualizar si el backend responde
    fetchFromDB().then(function () {
        renderPersonalities();
        renderHistory();
    });
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

    var upgradeBtn = document.getElementById('upgradePremiumBtn');
    var currentPlanName = document.getElementById('currentPlanName');
    var currentPlanDesc = document.getElementById('currentPlanDesc');

    if (state.user.plan_premium) {
        if (currentPlanName) currentPlanName.textContent = 'Plan Premium';
        if (currentPlanDesc) currentPlanDesc.textContent = 'Funciones avanzadas y prompts personalizados activos.';
        if (upgradeBtn) { upgradeBtn.textContent = 'PLAN ACTIVO'; upgradeBtn.disabled = true; upgradeBtn.style.opacity = '0.5'; }
    } else {
        if (currentPlanName) currentPlanName.textContent = 'Plan Gratuito';
        if (currentPlanDesc) currentPlanDesc.textContent = 'Funciones básicas de IA con respuestas estándar.';
        if (upgradeBtn) { upgradeBtn.textContent = '✦ Mejorar a Premium'; upgradeBtn.disabled = false; upgradeBtn.style.opacity = '1'; }
    }
}

// ═══════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════
function bindNavEvents() {
    document.querySelectorAll('.sidebar-link').forEach(function (link) {
        link.addEventListener('click', function () {
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
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    var target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    document.querySelectorAll('.sidebar-link').forEach(function (l) {
        l.classList.toggle('active', l.getAttribute('data-page') === page);
    });
    var titles = { personalidad: 'Personalidad', historial: 'Historial', suscripcion: 'Suscripción', ajustes: 'Ajustes', dispositivo: 'Mi Dispositivo' };
    document.getElementById('pageTitle').textContent = titles[page] || page;
    if (page === 'dispositivo') updateDevicePage();
}

function openSidebar() { document.getElementById('sidebar').classList.add('open'); document.getElementById('sidebarOverlay').classList.add('open'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebarOverlay').classList.remove('open'); }

// ═══════════════════════════════════════
//  PERSONALITY
// ═══════════════════════════════════════
function renderPersonalities() {
    var grid = document.getElementById('personalityGrid');
    if (!grid) return;
    grid.innerHTML = '';
    DB.personalities.forEach(function (p) {
        var isActive = p.id === state.activePersonality;
        var isLocked = p.es_premium && (!state.user || !state.user.plan_premium);
        var card = document.createElement('div');
        card.className = 'p-card' + (isActive ? ' selected' : '') + (isLocked ? ' locked' : '');
        card.setAttribute('data-id', p.id);
        var lockIcon = isLocked ? '<span class="lock-icon">🔒</span>' : '';
        var premiumTag = p.es_premium ? '<span class="premium-tag">PREMIUM</span>' : '';
        card.innerHTML = '<div class="p-card-emoji">' + p.emoji + lockIcon + '</div>' +
            '<div class="p-card-name">' + p.nombre + '</div>' +
            '<div class="p-card-desc">' + p.descripcion + '</div>' + premiumTag;
        card.addEventListener('click', function () { selectPersonality(p.id); });
        grid.appendChild(card);
    });
}

function selectPersonality(id) {
    var p = DB.personalities.find(function (x) { return x.id === id; });
    if (!p) return;
    var isLocked = p.es_premium && (!state.user || !state.user.plan_premium);
    if (isLocked) { showToast('Requiere plan Premium', 'error'); navigateTo('suscripcion'); return; }
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
    document.querySelectorAll('.p-card').forEach(function (c) {
        c.classList.toggle('selected', parseInt(c.getAttribute('data-id')) === id);
    });
}

// ═══════════════════════════════════════
//  PAGE EVENTS
// ═══════════════════════════════════════
function bindPageEvents() {
    // Apply personality
    var applyBtn = document.getElementById('applyPersonalityBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function () {
            if (!state.selectedPersonality) return;
            var p = DB.personalities.find(function (x) { return x.id === state.selectedPersonality; });
            if (p.nombre === 'Custom') {
                var val = document.getElementById('customPromptInput').value.trim();
                if (!val) { showToast('Prompt vacío', 'error'); return; }
                DB.config.custom_prompt = val;
            }
            state.activePersonality = state.selectedPersonality;
            localStorage.setItem('kipp_active_personality', state.activePersonality);
            localStorage.setItem('kipp_config', JSON.stringify(DB.config));
            showToast('PERSONALIDAD ACTIVA: ' + p.nombre.toUpperCase(), 'success');
            renderPersonalities();
            selectPersonality(state.activePersonality);
        });
    }

    // Clear history
    var clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            DB.history = [];
            renderHistory();
            showToast('HISTORIAL BORRADO', 'info');
        });
    }

    // Save settings
    var saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            DB.config.volumen = parseInt(document.getElementById('volumeRange').value);
            DB.config.velocidad = parseInt(document.getElementById('speedRange').value);
            DB.config.nombre_dispositivo = document.getElementById('deviceNameInput').value;
            localStorage.setItem('kipp_config', JSON.stringify(DB.config));
            document.getElementById('deviceName').textContent = DB.config.nombre_dispositivo;
            showToast('AJUSTES GUARDADOS', 'success');
        });
    }

    var vol = document.getElementById('volumeRange');
    if (vol) vol.addEventListener('input', function () { document.getElementById('volVal').textContent = this.value + '%'; });
    var spd = document.getElementById('speedRange');
    if (spd) spd.addEventListener('input', function () { document.getElementById('spdVal').textContent = this.value + '%'; });

    // Mic test
    var micBtn = document.getElementById('micTestBtn');
    if (micBtn) micBtn.addEventListener('click', testMicrophone);

    // Link device
    var linkBtn = document.getElementById('linkDeviceBtn');
    if (linkBtn) linkBtn.addEventListener('click', function () {
        var mac = document.getElementById('macInput').value.trim().toUpperCase();
        linkDevice(mac);
    });
}

// ═══════════════════════════════════════
//  PAYMENT
// ═══════════════════════════════════════
function bindPaymentEvents() {
    var upgradeBtn = document.getElementById('upgradePremiumBtn');
    var paymentModal = document.getElementById('paymentModal');
    var cancelBtn = document.getElementById('cancelPaymentBtn');
    var paymentForm = document.getElementById('paymentForm');

    if (upgradeBtn) upgradeBtn.addEventListener('click', function () {
        if (state.user && state.user.plan_premium) return;
        paymentModal.classList.add('active');
    });
    if (cancelBtn) cancelBtn.addEventListener('click', function () { paymentModal.classList.remove('active'); });
    if (paymentForm) {
        paymentForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn = paymentForm.querySelector('.btn-pay');
            btn.textContent = 'PROCESANDO...'; btn.disabled = true;
            setTimeout(function () {
                state.user.plan_premium = true;
                localStorage.setItem('kipp_user', JSON.stringify(state.user));
                paymentModal.classList.remove('active');
                btn.textContent = 'Pagar $4.990'; btn.disabled = false;
                paymentForm.reset();
                updateUserUI();
                renderPersonalities();
                showToast('PAGO APROBADO · BIENVENIDO A PREMIUM ✦', 'success');
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
    var countEl = document.getElementById('historyCount');
    if (!list) return;

    list.querySelectorAll('.history-item').forEach(function (el) { el.remove(); });

    if (countEl) countEl.textContent = DB.history.length + ' interaccion' + (DB.history.length !== 1 ? 'es' : '');

    if (DB.history.length === 0) {
        if (empty) empty.style.display = 'block'; return;
    }
    if (empty) empty.style.display = 'none';

    DB.history.slice().reverse().forEach(function (entry) {
        var item = document.createElement('div');
        item.className = 'history-item';
        var dateStr = entry.fecha ? new Date(entry.fecha).toLocaleString('es-CL') : 'N/A';
        item.innerHTML = '<div class="history-q">' + escapeHtml(entry.pregunta || '') + '</div>' +
            '<div class="history-a">' + escapeHtml(entry.respuesta || '') + '</div>' +
            '<div class="history-meta">' +
            '<span>' + dateStr + '</span>' +
            '<span>' + (entry.tiempo_ms || 0) + 'ms</span>' +
            '<span>' + (entry.personalidad || '—') + '</span>' +
            '</div>';
        list.appendChild(item);
    });
}

// ═══════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════
function loadSettings() {
    var vr = document.getElementById('volumeRange');
    var sr = document.getElementById('speedRange');
    var dn = document.getElementById('deviceNameInput');
    if (vr) { vr.value = DB.config.volumen; document.getElementById('volVal').textContent = DB.config.volumen + '%'; }
    if (sr) { sr.value = DB.config.velocidad; document.getElementById('spdVal').textContent = DB.config.velocidad + '%'; }
    if (dn) dn.value = DB.config.nombre_dispositivo;
    var sn = document.getElementById('settingsUserName');
    var se = document.getElementById('settingsUserEmail');
    if (sn && state.user) sn.textContent = state.user.nombre;
    if (se && state.user) se.textContent = state.user.email;
}

// ═══════════════════════════════════════
//  MI DISPOSITIVO
// ═══════════════════════════════════════
function updateDevicePage() {
    var el = function (id) { return document.getElementById(id); };
    if (el('dispUserName') && state.user) el('dispUserName').textContent = state.user.nombre;
    if (el('dispUserEmail') && state.user) el('dispUserEmail').textContent = state.user.email;
    if (el('dispUserPlan') && state.user) el('dispUserPlan').textContent = state.user.plan_premium ? '★ Premium' : 'Gratuito';
    if (el('dispDeviceName')) el('dispDeviceName').textContent = DB.config.nombre_dispositivo;
    if (el('dispDeviceMac')) el('dispDeviceMac').textContent = DB.config.mac_address || 'AA:BB:CC:DD:EE:FF';
}

async function testMicrophone() {
    var btn = document.getElementById('micTestBtn');
    var status = document.getElementById('micStatus');
    var bars = document.querySelectorAll('.mic-bar');

    btn.textContent = '[ ESCUCHANDO... ]';
    btn.disabled = true;
    if (status) { status.textContent = 'Solicitando acceso al micrófono...'; status.className = 'mic-status'; }

    try {
        var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var analyser = audioCtx.createAnalyser();
        var source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 64;
        var dataArray = new Uint8Array(analyser.frequencyBinCount);

        if (status) { status.textContent = 'Detectando señal... habla cerca del micrófono'; status.className = 'mic-status active'; }

        var frames = 0;
        var maxFrames = 120; // ~2 seconds at 60fps
        function animate() {
            if (frames < maxFrames) {
                analyser.getByteFrequencyData(dataArray);
                bars.forEach(function (bar, i) {
                    var val = dataArray[Math.floor(i * dataArray.length / bars.length)] || 0;
                    bar.style.height = Math.max(4, (val / 255) * 48) + 'px';
                });
                frames++;
                requestAnimationFrame(animate);
            } else {
                stream.getTracks().forEach(function (t) { t.stop(); });
                audioCtx.close();
                bars.forEach(function (b) { b.style.height = '4px'; });
                if (status) { status.textContent = '✔ Micrófono funcionando correctamente'; status.className = 'mic-status ok'; }
                btn.textContent = '[ PROBAR MICRÓFONO ]';
                btn.disabled = false;
                showToast('MIC OK: Señal de audio detectada', 'success');
            }
        }
        animate();

    } catch (err) {
        if (status) { status.textContent = '✘ Error: ' + (err.message || 'Permiso denegado'); status.className = 'mic-status error'; }
        btn.textContent = '[ PROBAR MICRÓFONO ]';
        btn.disabled = false;
        showToast('MIC: Permiso denegado por el navegador', 'error');
    }
}

function linkDevice(mac) {
    var macRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
    if (!macRegex.test(mac)) {
        showToast('MAC inválida · Formato: XX:XX:XX:XX:XX:XX', 'error');
        return;
    }
    var btn = document.getElementById('linkDeviceBtn');
    btn.textContent = '[ VINCULANDO... ]'; btn.disabled = true;
    setTimeout(function () {
        DB.config.mac_address = mac;
        localStorage.setItem('kipp_config', JSON.stringify(DB.config));
        updateDevicePage();
        showToast('DISPOSITIVO VINCULADO: ' + mac, 'success');
        btn.textContent = '[ VINCULAR ]'; btn.disabled = false;
        document.getElementById('macInput').value = '';
    }, 1500);
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
    setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = '150ms ease';
        setTimeout(function () { toast.remove(); }, 200);
    }, 3000);
}
