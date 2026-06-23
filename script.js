/* =========================================================
   FUNDACIÓN MARA HOLÍSTICA — Interacciones
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ----- Año dinámico en el footer ----- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- Menú móvil ----- */
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    // Cerrar al hacer clic en un enlace
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ----- Sombra de la navbar al hacer scroll ----- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ----- Animaciones de aparición al hacer scroll ----- */
  const revealEls = document.querySelectorAll(
    '.pillar, .card, .gallery-item, .testimonial, .stat, .section-head'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  /* ----- Contadores animados de estadísticas ----- */
  const counters = document.querySelectorAll('.stat-num');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10) || 0;
      const duration = 1500;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        // easing suave
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('es');
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('es') + '+';
      };
      requestAnimationFrame(step);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countObserver.observe(c));

  /* ----- Formulario de contacto: enviar por WhatsApp o correo ----- */

  // 👉 CONFIGURACIÓN: cambia estos datos si hace falta.
  const WHATSAPP_NUMERO = '573195034730';        // 57 = Colombia + número, sin espacios ni signos
  const CORREO_DESTINO  = 'hola@maraholistica.org'; // correo donde quieres recibir los mensajes

  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  const emailBtn = document.getElementById('sendEmailBtn');

  // Valida los campos y devuelve {nombre, email, mensaje} o null si hay error.
  function leerFormulario() {
    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const mensaje = form.mensaje.value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!nombre || !email || !mensaje) {
      note.textContent = 'Por favor completa todos los campos.';
      note.className = 'form-note err';
      return null;
    }
    if (!emailOk) {
      note.textContent = 'Introduce un correo electrónico válido.';
      note.className = 'form-note err';
      return null;
    }
    return { nombre, email, mensaje };
  }

  if (form) {
    // Botón principal → WhatsApp
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const datos = leerFormulario();
      if (!datos) return;

      const texto =
        '¡Hola Fundación Mara Holística! 🌿%0A%0A' +
        '*Nombre:* ' + encodeURIComponent(datos.nombre) + '%0A' +
        '*Correo:* ' + encodeURIComponent(datos.email) + '%0A' +
        '*Mensaje:* ' + encodeURIComponent(datos.mensaje);

      const url = 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + texto;
      window.open(url, '_blank');

      note.textContent = 'Abriendo WhatsApp para enviar tu mensaje... 💬';
      note.className = 'form-note ok';
    });

    // Botón secundario → Correo
    if (emailBtn) {
      emailBtn.addEventListener('click', () => {
        const datos = leerFormulario();
        if (!datos) return;

        const asunto = encodeURIComponent('Contacto desde la web — ' + datos.nombre);
        const cuerpo = encodeURIComponent(
          'Nombre: ' + datos.nombre + '\n' +
          'Correo: ' + datos.email + '\n\n' +
          'Mensaje:\n' + datos.mensaje
        );
        window.location.href =
          'mailto:' + CORREO_DESTINO + '?subject=' + asunto + '&body=' + cuerpo;

        note.textContent = 'Abriendo tu aplicación de correo... ✉️';
        note.className = 'form-note ok';
      });
    }
  }

  /* ----- Botones "copiar al portapapeles" (página de donaciones) ----- */
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const valor = btn.getAttribute('data-copy');
      const original = btn.textContent;
      try {
        await navigator.clipboard.writeText(valor);
      } catch (_) {
        // Respaldo para navegadores antiguos
        const tmp = document.createElement('textarea');
        tmp.value = valor;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
      }
      btn.textContent = '¡Copiado! ✅';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 2000);
    });
  });

});
