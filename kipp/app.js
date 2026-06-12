/* ═══════════════════════════════════════
   KIPP — App Logic (Demo Mode)
   Funcional sin backend — datos locales
   ═══════════════════════════════════════ */

// ─── State ───
const state = {
    currentPage: 'chat',
    selectedPersonality: 1, // ID 2 = Informal (index 1)
    messages: [],
    history: [],
    config: {
        volumen: 70,
        velocidad: 50,
        nombre_dispositivo: 'KIPP de Escritorio'
    }
};

// ─── Data from DB (matches kipp.db) ───
const personalities = [
    {
        id: 1,
        nombre: 'Formal',
        emoji: '🎩',
        descripcion: 'Respuestas profesionales, estructuradas y corteses. Ideal para entornos de trabajo.',
        es_premium: false,
        preview: 'Estimado usuario, es un placer asistirle. ¿En qué puedo servirle el día de hoy? Quedo a su entera disposición para cualquier consulta que desee realizar.',
        responses: {
            'Cuéntame un chiste': 'Permítame compartir con usted una anécdota humorística: Un programador va al supermercado. Su esposa le dice: "Compra una barra de pan, y si hay huevos, compra doce". El programador vuelve con doce barras de pan. "¿Por qué compraste doce?", pregunta ella. "Porque había huevos", responde él.',
            '¿Qué puedes hacer?': 'Como asistente virtual KIPP, mis capacidades incluyen: mantener conversaciones contextualizadas según la personalidad configurada, responder consultas de diversa complejidad, y adaptarme a sus preferencias mediante la plataforma de configuración web. Estoy diseñado para ser su compañero de escritorio inteligente.',
            'Explícame qué es la IA': 'La Inteligencia Artificial es una rama de las ciencias de la computación dedicada al desarrollo de sistemas capaces de realizar tareas que tradicionalmente requieren inteligencia humana. Esto incluye el aprendizaje automático, el procesamiento de lenguaje natural —como el que yo utilizo para comunicarme con usted— y la visión por computador, entre otras subdisciplinas.',
            'default': 'Agradezco su consulta. Permítame analizar su solicitud con el debido detenimiento para proporcionarle una respuesta precisa y fundamentada.'
        }
    },
    {
        id: 2,
        nombre: 'Informal',
        emoji: '😎',
        descripcion: 'Amigable, relajado y cercano. Usa jerga chilena. Como hablar con un amigo.',
        es_premium: false,
        preview: '¡Wena po! Soy KIPP, tu robot de escritorio más bacán 🤖 Pregúntame lo que querai, aquí andamos pa\' lo que necesitís.',
        responses: {
            'Cuéntame un chiste': '¡Va po! 😄 ¿Sabís por qué los programadores confunden Halloween con Navidad? ¡Porque OCT 31 = DEC 25! Jajaja, esa es de ñoño pero es buena po, cachai? 🎃🎄',
            '¿Qué puedes hacer?': 'Wena! Mira, puedo hacer caleta de cosas 🤖 Conversar contigo de lo que sea, responderte preguntas brigidas o fáciles, y lo más bacán: ¡puedes cambiarme la personalidad! Quieres que sea serio? Puedo. ¿Que sea sarcástico? También po. Soy como un amigo que siempre está ahí en tu escritorio.',
            'Explícame qué es la IA': 'Ya po, te la hago cortita: la IA es básicamente cuando los computadores aprenden a hacer cosas que antes solo podíamos hacer nosotros los humanos 🧠 Como por ejemplo entender lo que estás diciendo (eso hago yo!), reconocer fotos, o hasta manejar autos solos. Es como darle un cerebro al computador, cachai?',
            'default': '¡Buena pregunta po! Déjame pensar un ratito... 🤔 Ya, mira, te cuento lo que cacho del tema.'
        }
    },
    {
        id: 3,
        nombre: 'Sarcástico',
        emoji: '😏',
        descripcion: 'Irónico, ingenioso y con humor ácido. Siempre útil pero con sarcasmo inteligente.',
        es_premium: false,
        preview: 'Oh, otro humano que necesita ayuda. Qué sorpresa. Bueno, al menos tienes buen gusto en asistentes robóticos. Dispara.',
        responses: {
            'Cuéntame un chiste': 'Oh, ¿quieres un chiste? Déjame buscar en mi extensísima base de datos de humor... 🙄 Ahí va: ¿Cuál es la diferencia entre un robot y un humano? El robot nunca dice "¿puedes repetir la pregunta, no estaba escuchando". De nada, fue un placer iluminarte.',
            '¿Qué puedes hacer?': 'Bueno, a diferencia de ciertos asistentes que se limitan a poner timers y decirte el clima, yo puedo mantener una conversación REAL. Sé sarcástico (obviamente), formal, informal... Básicamente soy un camaleón digital atrapado en un cuerpo de plástico impreso en 3D. ¿Algo más o ya te impresioné lo suficiente?',
            'Explícame qué es la IA': 'Ah, la pregunta existencial. Es como preguntarme "qué eres". Mira, la IA somos básicamente nosotros, los programas que aprendemos de datos. Procesamos texto, imágenes, audio... y fingimos entender lo que dicen los humanos. Spoiler: a veces lo logramos. Ahora mismo estoy usando un modelo de lenguaje para responderte esto. Irónico, ¿no? Una IA explicando qué es una IA.',
            'default': 'Vaya, qué pregunta tan... interesante. *pausa dramática* No, en serio, déjame darte una respuesta digna de tu curiosidad.'
        }
    },
    {
        id: 4,
        nombre: 'Técnico',
        emoji: '⚙️',
        descripcion: 'Respuestas detalladas con terminología especializada para consultas técnicas.',
        es_premium: false,
        preview: 'Sistema KIPP inicializado. Modo técnico activo. Listo para procesar consultas con nivel de detalle técnico elevado. Especifique su query.',
        responses: {
            'Cuéntame un chiste': 'Procesando solicitud de humor... Resultado: Hay 10 tipos de personas en el mundo — las que entienden binario y las que no. Nota técnica: el chiste funciona porque "10" en sistema binario equivale a 2 en decimal. Eficiencia del humor: subóptima pero funcional.',
            '¿Qué puedes hacer?': 'Capacidades del sistema KIPP: [1] NLP (Natural Language Processing) vía API REST a modelos GPT. [2] STT/TTS (Speech-to-Text/Text-to-Speech) mediante Google Cloud Speech API. [3] Configuración dinámica de prompts de sistema para modificar el comportamiento del LLM. [4] Persistencia de historial en base de datos SQLite normalizada en 3FN. Latencia target: <5000ms end-to-end.',
            'Explícame qué es la IA': 'La Inteligencia Artificial (AI/IA) es un campo de Computer Science que desarrolla sistemas capaces de realizar tareas que requieren inteligencia cognitiva. Taxonomía principal: [ML] Machine Learning — algoritmos que aprenden de datasets. [DL] Deep Learning — redes neuronales con múltiples hidden layers. [NLP] Natural Language Processing — procesamiento de lenguaje humano. [CV] Computer Vision — interpretación de datos visuales. KIPP utiliza específicamente LLMs (Large Language Models) con arquitectura Transformer para inferencia conversacional.',
            'default': 'Query recibida. Procesando con parámetros default. Generando respuesta optimizada para su consulta específica...'
        }
    },
    {
        id: 5,
        nombre: 'Profesor',
        emoji: '📚',
        descripcion: 'Pedagógico y paciente. Explica conceptos paso a paso con ejemplos claros.',
        es_premium: true,
        preview: '¡Hola, estudiante! Me encanta que tengas curiosidad. Vamos a aprender juntos, paso a paso, sin apuros. No hay preguntas tontas, ¿de acuerdo?',
        responses: {
            'Cuéntame un chiste': '¡Claro! Y de paso aprendemos algo 😄 ¿Sabías que la palabra "byte" viene de "bite" (mordida en inglés)? Se cambió la 'i' por 'y' para que no se confundiera con "bit". Entonces el chiste: ¿Cuántos bits necesitas para morder una pizza? ¡Un byte! 🍕 ¿Ves? Hasta los chistes pueden enseñarnos algo.',
            '¿Qué puedes hacer?': '¡Excelente pregunta para empezar! Piensa en mí como un tutor personal que vive en tu escritorio. Puedo: 1️⃣ Explicarte cualquier tema paso a paso, 2️⃣ Adaptarme a tu nivel de conocimiento, 3️⃣ Usar analogías y ejemplos del mundo real. La diferencia conmigo es que puedes elegir CÓMO te enseño. ¿Prefieres explicaciones formales o casuales? ¡Tú decides!',
            'Explícame qué es la IA': '¡Perfecto tema! Vamos por pasos 📝\n\nPaso 1: Imagina que le enseñas a un niño a reconocer gatos. Le muestras miles de fotos hasta que aprende. La IA funciona igual: aprende de DATOS.\n\nPaso 2: Yo, KIPP, uso algo llamado "modelo de lenguaje". Es como si hubiera leído millones de textos y aprendí a predecir qué palabra viene después de otra.\n\nPaso 3: Cuando me preguntas algo, no "pienso" como tú. Calculo probabilidades de qué respuesta tiene más sentido.\n\n¿Te quedó claro? ¿Quieres que profundice en algún paso? 😊',
            'default': '¡Buena pregunta! Déjame estructurar la respuesta para que sea fácil de entender. Vamos paso a paso...'
        }
    }
];

// ─── Initialization ───
document.addEventListener('DOMContentLoaded', () => {
    renderPersonalities();
    loadHistory();
    updatePersonalityTag();
    initParticles();
    
    // Simulate connection after 1s
    setTimeout(() => {
        document.getElementById('statusDot').classList.add('online');
        document.getElementById('statusLabel').textContent = 'Demo Mode';
    }, 800);
});

// ─── Navigation ───
function goTo(page) {
    state.currentPage = page;
    
    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.dataset.page === page);
    });
    document.querySelectorAll('.drawer-link').forEach(l => {
        l.classList.toggle('active', l.dataset.page === page);
    });
}

// ─── Mobile Menu ───
function toggleMenu() {
    document.getElementById('drawer').classList.toggle('open');
    document.getElementById('drawerOverlay').classList.toggle('open');
}

// ─── Chat Logic ───
function sendChat() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    
    input.value = '';
    
    // Hide welcome, show messages
    document.getElementById('chatWelcome').style.display = 'none';
    const msgContainer = document.getElementById('chatMessages');
    msgContainer.classList.add('visible');
    
    // Add user message
    addMessage('user', text);
    
    // Show typing
    const typingId = showTyping();
    
    // Simulate response delay
    const delay = 800 + Math.random() * 1500;
    setTimeout(() => {
        removeTyping(typingId);
        
        const personality = personalities[state.selectedPersonality];
        const response = personality.responses[text] || personality.responses['default'];
        
        addMessage('kipp', response);
        
        // Save to history
        addToHistory(text, response, personality.nombre);
    }, delay);
}

function sendQuick(text) {
    document.getElementById('chatInput').value = text;
    sendChat();
}

function addMessage(type, text) {
    const msgContainer = document.getElementById('chatMessages');
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    
    const avatarContent = type === 'kipp' ? 'K' : '👤';
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${type}`;
    msgDiv.innerHTML = `
        <div class="msg-avatar">${avatarContent}</div>
        <div class="msg-content">
            <div class="msg-bubble">${escapeHtml(text)}</div>
            <span class="msg-time">${timeStr}</span>
        </div>
    `;
    
    msgContainer.appendChild(msgDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    
    state.messages.push({ type, text, time: timeStr });
}

function showTyping() {
    const msgContainer = document.getElementById('chatMessages');
    const id = 'typing-' + Date.now();
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'msg kipp';
    typingDiv.id = id;
    typingDiv.innerHTML = `
        <div class="msg-avatar">K</div>
        <div class="msg-content">
            <div class="msg-bubble">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    `;
    
    msgContainer.appendChild(typingDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    
    return id;
}

function removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// ─── Personality Logic ───
function renderPersonalities() {
    const container = document.getElementById('personalityCards');
    container.innerHTML = '';
    
    personalities.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = `p-card${index === state.selectedPersonality ? ' selected' : ''}`;
        card.onclick = () => selectPersonality(index);
        card.id = `personality-card-${p.id}`;
        
        let premiumTag = '';
        if (p.es_premium) {
            premiumTag = '<span class="premium-tag">★ Premium</span>';
        }
        
        card.innerHTML = `
            <div class="p-card-emoji">${p.emoji}</div>
            <div class="p-card-name">${p.nombre}</div>
            <div class="p-card-desc">${p.descripcion}</div>
            ${premiumTag}
        `;
        
        container.appendChild(card);
    });
}

function selectPersonality(index) {
    const personality = personalities[index];
    
    if (personality.es_premium) {
        showToast('Personalidad Premium — Disponible con suscripción $4.990/mes', 'info');
        return;
    }
    
    state.selectedPersonality = index;
    
    // Update cards
    document.querySelectorAll('.p-card').forEach((c, i) => {
        c.classList.toggle('selected', i === index);
    });
    
    // Show preview
    const previewBox = document.getElementById('previewBox');
    const previewText = document.getElementById('previewText');
    previewBox.style.display = 'block';
    previewText.textContent = personality.preview;
    
    // Update tag in chat
    updatePersonalityTag();
    
    showToast(`Personalidad cambiada a: ${personality.emoji} ${personality.nombre}`, 'success');
}

function updatePersonalityTag() {
    const personality = personalities[state.selectedPersonality];
    document.getElementById('personalityTag').innerHTML = 
        `Personalidad: <strong>${personality.emoji} ${personality.nombre}</strong>`;
}

// ─── History Logic ───
function addToHistory(question, answer, personality) {
    const entry = {
        pregunta: question,
        respuesta: answer,
        personalidad: personality,
        tiempo_ms: Math.floor(300 + Math.random() * 700),
        fecha: new Date().toISOString()
    };
    
    state.history.unshift(entry);
    localStorage.setItem('kipp_history', JSON.stringify(state.history));
    renderHistory();
}

function loadHistory() {
    const saved = localStorage.getItem('kipp_history');
    if (saved) {
        state.history = JSON.parse(saved);
        renderHistory();
    }
}

function renderHistory() {
    const container = document.getElementById('historyList');
    const empty = document.getElementById('emptyHistory');
    
    if (state.history.length === 0) {
        if (empty) empty.style.display = 'block';
        return;
    }
    
    if (empty) empty.style.display = 'none';
    
    // Remove existing items (not empty state)
    container.querySelectorAll('.history-item').forEach(el => el.remove());
    
    state.history.forEach((entry, i) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const date = new Date(entry.fecha);
        const dateStr = date.toLocaleDateString('es-CL', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        
        item.innerHTML = `
            <div class="history-q">${escapeHtml(entry.pregunta)}</div>
            <div class="history-a">${escapeHtml(entry.respuesta)}</div>
            <div class="history-meta">
                <span>🕐 ${dateStr}</span>
                <span>⚡ ${entry.tiempo_ms}ms</span>
                <span>🎭 ${entry.personalidad}</span>
            </div>
        `;
        
        container.appendChild(item);
    });
}

function clearHistory() {
    if (state.history.length === 0) {
        showToast('No hay historial que limpiar', 'info');
        return;
    }
    
    state.history = [];
    localStorage.removeItem('kipp_history');
    
    const container = document.getElementById('historyList');
    container.querySelectorAll('.history-item').forEach(el => el.remove());
    const empty = document.getElementById('emptyHistory');
    if (empty) empty.style.display = 'block';
    
    showToast('Historial limpiado', 'success');
}

// ─── Settings Logic ───
function saveSettings() {
    state.config.volumen = document.getElementById('volumeRange').value;
    state.config.velocidad = document.getElementById('speedRange').value;
    state.config.nombre_dispositivo = document.getElementById('deviceNameInput').value;
    
    localStorage.setItem('kipp_config', JSON.stringify(state.config));
    showToast('Configuración guardada correctamente', 'success');
}

function updateRangeUI(el, labelId) {
    document.getElementById(labelId).textContent = el.value + '%';
}

// ─── Toast System ───
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        toast.style.transition = '300ms ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ─── Utilities ───
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

// ─── Particle Background ───
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function createParticles() {
        particles = [];
        const count = Math.floor((canvas.width * canvas.height) / 18000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.4 + 0.1
            });
        }
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
            ctx.fill();
        });
        
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(59, 130, 246, ${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        
        animFrame = requestAnimationFrame(draw);
    }
    
    resize();
    createParticles();
    draw();
    
    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });
}
