// ── Navbar scroll effect ──
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ── Mobile menu toggle ──
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  menuToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.textContent = '☰';
  });
});

// ── Scroll reveal ──
const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealElements.forEach(el => observer.observe(el));

// ── Smooth scroll for nav ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── Quote form ──
// Las cotizaciones llegan directo a: sebadiazlobos@gmail.com
// Servicio: FormSubmit.co (gratis, sin cuenta necesaria)
const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/sebadiazlobos@gmail.com';

const quoteForm = document.getElementById('quote-form');
const btnSubmit = document.getElementById('btn-submit');

quoteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(quoteForm);

  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Enviando...';

  try {
    const response = await fetch(FORMSUBMIT_URL, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    const result = await response.json();

    if (result.success) {
      showToast('¡Cotización enviada con éxito! Te contactaremos pronto. 🎉');
      quoteForm.reset();
    } else {
      showToast('Error al enviar. Intenta de nuevo o escríbenos al correo. ❌');
    }
  } catch (error) {
    showToast('Error de conexión. Intenta de nuevo. ❌');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Enviar Solicitud de Cotización →';
  }
});

// ── Product quote buttons ──
document.querySelectorAll('.btn-quote-sm').forEach(btn => {
  btn.addEventListener('click', () => {
    const productName = btn.closest('.product-card').querySelector('h3').textContent;
    const serviceSelect = document.getElementById('service');
    const detailsField = document.getElementById('details');
    document.getElementById('cotizar').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      if (detailsField) detailsField.value = `Estoy interesado/a en: ${productName}`;
    }, 600);
  });
});

// ── Toast notification ──
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ── Animated counter ──
function animateCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current) + suffix;
    }, 25);
  });
}
const statsSection = document.querySelector('.stats');
const statsObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    animateCounters();
    statsObserver.unobserve(statsSection);
  }
}, { threshold: 0.5 });
statsObserver.observe(statsSection);
