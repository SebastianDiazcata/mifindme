/* ═══════════════════════════════════════
   KIPP — Panel de Control (Demo)
   Login, Personalidad, Historial,
   Suscripción, Ajustes
   ═══════════════════════════════════════ */

// ─── Data (matches kipp.db) ───
const DB = {
    users: [
        { id: 1, nombre: 'Usuario Demo', email: 'demo@kipp.cl', password: '123456', plan_premium: false }
    ],
    personalities: [
        { id: 1, nombre: 'Formal', emoji: '🎩', descripcion: 'Respuestas profesionales, estructuradas y corteses. Ideal para entornos de trabajo o consultas serias.', es_premium: false, prompt: 'Eres KIPP, un asistente virtual. Tu personalidad es FORMAL y profesional...' },
        { id: 2, nombre: 'Informal', emoji: '😎', descripcion: 'Amigable, relajado y cercano. Usa jerga chilena y expresiones coloquiales. Como hablar con un amigo.', es_premium: false, prompt: 'Eres KIPP, un asistente virtual. Tu personalidad es INFORMAL y amigable...' },
        { id: 3, nombre: 'Sarcástico', emoji: '😏', descripcion: 'Irónico, ingenioso y con humor ácido. Siempre útil pero con una dosis de sarcasmo inteligente.', es_premium: false, prompt: 'Eres KIPP, un asistente virtual. Tu personalidad es SARCÁSTICA...' },
        { id: 4, nombre: 'Técnico', emoji: '⚙️', descripcion: 'Respuestas detalladas con terminología especializada. Perfecto para consultas técnicas y desarrollo.', es_premium: false, prompt: 'Eres KIPP, un asistente virtual. Tu personalidad es TÉCNICA...' },
        { id: 5, nombre: 'Profesor', emoji: '📚', descripcion: 'Pedagógico y paciente. Explica conceptos paso a paso con ejemplos claros y analogías.', es_premium: true, prompt: 'Eres KIPP, un asistente virtual. Tu personalidad es de PROFESOR...' }
    ],
    history: [
        { id: 1, pregunta: '¿Hola, quién eres?', respuesta: '¡Soy KIPP po! Tu robot de escritorio más bacán. Estoy aquí pa conversar y hacerte compañía mientras trabajas 🤖', personalidad: 'Informal', tiempo_ms: 502, fecha: '2026-06-11T18:40:13' },
        { id: 2, pregunta: '¿Qué es la inteligencia artificial?', respuesta: 'La IA es básicamente cuando los computadores aprenden a hacer cosas que antes solo podíamos hacer nosotros. Como entender lo que dices, reconocer fotos, o hasta manejar autos solos. Es como darle cerebro al computador, cachai?', personalidad: 'Informal', tiempo_ms: 1230, fecha: '2026-06-11T18:42:30' },
        { id: 3, pregunta: 'Cuéntame un chiste', respuesta: 'Procesando solicitud de humor... Un programador va al supermercado. Su esposa le dice: "Compra pan, y si hay huevos, compra doce". Vuelve con doce panes. Eficiencia del humor: subóptima pero funcional.', personalidad: 'Técnico', tiempo_ms: 890, fecha: '2026-06-11T19:05:00' }
    ],
    config: { volumen: 70, velocidad: 50, nombre_dispositivo: 'KIPP de Escritorio', modelo_ia: 'gpt-4o-mini', personalidad_activa: 2 }
};

// ─── State ───
let state = {
    user: null,
    currentPage: 'personalidad',
    selectedPersonality: null,
    activePersonality: 2
};

// ─── Init ───
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    const savedUser = localStorage.getItem('kipp_user');
    if (savedUser) {
        state.user = JSON.parse(savedUser);
        showApp();
    }

    // Load saved data
    const savedConfig = localStorage.getItem('kipp_config');
    if (savedConfig) Object.assign(DB.config, JSON.parse(savedConfig));

    const savedHistory = localStorage.getItem('kipp_history');
    if (savedHistory) DB.history = JSON.parse(savedHistory);

    const savedActive = localStorage.getItem('kipp_active_personality');
    if (savedActive) state.activePersonality = parseInt(savedActive);

    // Bind all events
    bindLoginEvents();
    bindNavEvents();
    bindPageEvents();
    initParticles('particleCanvas');
});

// ═══════════════════════════════════════
//  LOGIN / AUTH
// ═══════════════════════════════════════
function bindLoginEvents() {
    var loginForm = document.getElementById('loginForm');
    var registerForm = document.getElementById('registerForm');
    var authSwitchBtn = document.getElementById('authSwitchBtn');
    var demoBtn = document.getElementById('demoBtn');
    var toggleLoginPass = document.getElementById('toggleLoginPass');
    var toggleRegPass = document.getElementById('toggleRegPass');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var email = document.getElementById('loginEmail').value.trim();
            var pass = document.getElementById('loginPassword').value;

            var user = DB.users.find(function(u) { return u.email === email && u.password === pass; });
            if (user) {
                state.user = user;
                localStorage.setItem('kipp_user', JSON.stringify(user));
                showApp();
                showToast('¡Bienvenido, ' + user.nombre + '!', 'success');
            } else {
                showToast('Email o contraseña incorrectos', 'error');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var name = document.getElementById('regName').value.trim();
            var email = document.getElementById('regEmail').value.trim();
            var pass = document.getElementById('regPassword').value;

            if (pass.length < 6) {
                showToast('La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }

            var newUser = { id: DB.users.length + 1, nombre: name, email: email, password: pass, plan_premium: false };
            DB.users.push(newUser);
            state.user = newUser;
            localStorage.setItem('kipp_user', JSON.stringify(newUser));
            showApp();
            showToast('¡Cuenta creada! Bienvenido, ' + name, 'success');
        });
    }

    if (authSwitchBtn) {
        authSwitchBtn.addEventListener('click', function() {
            var isLogin = loginForm.style.display !== 'none';
            loginForm.style.display = isLogin ? 'none' : 'flex';
            registerForm.style.display = isLogin ? 'flex' : 'none';
            document.getElementById('authSwitchText').textContent = isLogin ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?';
            authSwitchBtn.textContent = isLogin ? 'Inicia sesión' : 'Regístrate';
        });
    }

    if (demoBtn) {
        demoBtn.addEventListener('click', function() {
            state.user = DB.users[0];
            localStorage.setItem('kipp_user', JSON.stringify(DB.users[0]));
            showApp();
            showToast('Sesión demo iniciada', 'info');
        });
    }

    if (toggleLoginPass) {
        toggleLoginPass.addEventListener('click', function() {
            var inp = document.getElementById('loginPassword');
            inp.type = inp.type === 'password' ? 'text' : 'password';
        });
    }

    if (toggleRegPass) {
        toggleRegPass.addEventListener('click', function() {
            var inp = document.getElementById('regPassword');
            inp.type = inp.type === 'password' ? 'text' : 'password';
        });
    }
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    initParticles('particleCanvasApp');
    updateUserUI();
    renderPersonalities();
    renderHistory();
    loadSettings();
    navigateTo('personalidad');
}

function logout() {
    state.user = null;
    localStorage.removeItem('kipp_user');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    showToast('Sesión cerrada', 'info');
}

function updateUserUI() {
    if (!state.user) return;
    var initial = state.user.nombre.charAt(0).toUpperCase();
    document.getElementById('userAvatar').textContent = initial;
    document.getElementById('userName').textContent = state.user.nombre;
    document.getElementById('userPlan').textContent = state.user.plan_premium ? '★ Premium' : 'Plan Gratuito';
    document.getElementById('settingsUserName').textContent = state.user.nombre;
    document.getElementById('settingsUserEmail').textContent = state.user.email;
}

// ═══════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════
function bindNavEvents() {
    // Sidebar links
    document.querySelectorAll('.sidebar-link').forEach(function(link) {
        link.addEventListener('click', function() {
            var page = this.getAttribute('data-page');
            navigateTo(page);
            closeSidebar();
        });
    });

    // Hamburger
    var hamburger = document.getElementById('hamburgerBtn');
    if (hamburger) hamburger.addEventListener('click', openSidebar);

    // Sidebar close
    var closeBtn = document.getElementById('sidebarClose');
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

    // Overlay
    var overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Logout
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

function navigateTo(page) {
    state.currentPage = page;

    // Update pages
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    var target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    // Update nav
    document.querySelectorAll('.sidebar-link').forEach(function(l) {
        l.classList.toggle('active', l.getAttribute('data-page') === page);
    });

    // Update title
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

        var premium = p.es_premium ? '<span class="premium-tag">★ Premium</span>' : '';
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
        showToast('Personalidad exclusiva — Requiere KIPP Premium ($4.990/mes)', 'info');
        return;
    }

    state.selectedPersonality = id;

    // Show preview
    var panel = document.getElementById('previewPanel');
    panel.style.display = 'block';
    document.getElementById('previewEmoji').textContent = p.emoji;
    document.getElementById('previewName').textContent = p.nombre;
    document.getElementById('previewText').textContent = '"' + p.prompt + '"';

    var isActive = id === state.activePersonality;
    document.getElementById('previewTag').textContent = isActive ? '✓ Activa' : 'Seleccionada';
    document.getElementById('previewTag').style.color = isActive ? '#22c55e' : '#60a5fa';

    // Update card selection visually
    document.querySelectorAll('.p-card').forEach(function(c) {
        c.classList.toggle('selected', parseInt(c.getAttribute('data-id')) === id);
    });
}

function bindPageEvents() {
    // Apply personality
    var applyBtn = document.getElementById('applyPersonalityBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            if (state.selectedPersonality) {
                state.activePersonality = state.selectedPersonality;
                localStorage.setItem('kipp_active_personality', state.activePersonality);
                var p = DB.personalities.find(function(x) { return x.id === state.activePersonality; });
                showToast('Personalidad aplicada: ' + p.emoji + ' ' + p.nombre, 'success');
                renderPersonalities();
                selectPersonality(state.activePersonality);
            }
        });
    }

    // Clear history
    var clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (DB.history.length === 0) {
                showToast('No hay historial que limpiar', 'info');
                return;
            }
            DB.history = [];
            localStorage.setItem('kipp_history', JSON.stringify(DB.history));
            renderHistory();
            showToast('Historial limpiado', 'success');
        });
    }

    // Save settings
    var saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            DB.config.volumen = parseInt(document.getElementById('volumeRange').value);
            DB.config.velocidad = parseInt(document.getElementById('speedRange').value);
            DB.config.nombre_dispositivo = document.getElementById('deviceNameInput').value;
            localStorage.setItem('kipp_config', JSON.stringify(DB.config));
            document.getElementById('deviceName').textContent = DB.config.nombre_dispositivo;
            showToast('Configuración guardada correctamente', 'success');
        });
    }

    // Range sliders
    var vol = document.getElementById('volumeRange');
    if (vol) vol.addEventListener('input', function() { document.getElementById('volVal').textContent = this.value + '%'; });

    var spd = document.getElementById('speedRange');
    if (spd) spd.addEventListener('input', function() { document.getElementById('spdVal').textContent = this.value + '%'; });

    // Upgrade premium
    var upgradeBtn = document.getElementById('upgradePremiumBtn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', function() {
            showToast('¡Próximamente! Pago con WebPay / Transferencia', 'info');
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

    // Remove existing items
    list.querySelectorAll('.history-item').forEach(function(el) { el.remove(); });

    document.getElementById('historyCount').textContent = DB.history.length + ' interacciones';

    if (DB.history.length === 0) {
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    DB.history.forEach(function(entry) {
        var item = document.createElement('div');
        item.className = 'history-item';

        var date = new Date(entry.fecha);
        var dateStr = date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        item.innerHTML = '<div class="history-q">' + escapeHtml(entry.pregunta) + '</div>' +
            '<div class="history-a">' + escapeHtml(entry.respuesta) + '</div>' +
            '<div class="history-meta">' +
            '<span>🕐 ' + dateStr + '</span>' +
            '<span>⚡ ' + entry.tiempo_ms + 'ms</span>' +
            '<span>🎭 ' + entry.personalidad + '</span>' +
            '</div>';

        list.appendChild(item);
    });
}

// ═══════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════
function loadSettings() {
    document.getElementById('volumeRange').value = DB.config.volumen;
    document.getElementById('volVal').textContent = DB.config.volumen + '%';
    document.getElementById('speedRange').value = DB.config.velocidad;
    document.getElementById('spdVal').textContent = DB.config.velocidad + '%';
    document.getElementById('deviceNameInput').value = DB.config.nombre_dispositivo;
    document.getElementById('deviceName').textContent = DB.config.nombre_dispositivo;
    document.getElementById('modelLabel').textContent = DB.config.modelo_ia;
}

// ═══════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════
function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toastContainer');
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        toast.style.transition = '300ms ease';
        setTimeout(function() { toast.remove(); }, 300);
    }, 3500);
}

// ═══════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════
function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ═══════════════════════════════════════
//  PARTICLES
// ═══════════════════════════════════════
function initParticles(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function create() {
        particles = [];
        var count = Math.floor((canvas.width * canvas.height) / 20000);
        for (var i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.35 + 0.05
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(59,130,246,' + p.opacity + ')';
            ctx.fill();

            for (var j = i + 1; j < particles.length; j++) {
                var dx = p.x - particles[j].x;
                var dy = p.y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = 'rgba(59,130,246,' + (0.04 * (1 - dist / 100)) + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }

    resize();
    create();
    draw();
    window.addEventListener('resize', function() { resize(); create(); });
}
