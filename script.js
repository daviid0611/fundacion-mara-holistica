document.addEventListener('DOMContentLoaded', () => {

  // Configuración: número de WhatsApp y correo donde llegan los mensajes.
  const WHATSAPP_NUMERO = '573115956597';
  const CORREO_DESTINO  = 'fundacionmaraholistica@gmail.com';

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Menú móvil
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // Sombra de la navbar al hacer scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Animaciones de aparición al hacer scroll
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

  // Contadores animados de estadísticas
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10) || 0;
      const duration = 1500;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('es');
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('es') + '+';
      };
      requestAnimationFrame(step);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num').forEach(c => countObserver.observe(c));

  // Formulario de contacto: envía por WhatsApp o por correo
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  const emailBtn = document.getElementById('sendEmailBtn');

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
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const datos = leerFormulario();
      if (!datos) return;

      const texto =
        '¡Hola Fundación Mara Holística! 🌿%0A%0A' +
        '*Nombre:* ' + encodeURIComponent(datos.nombre) + '%0A' +
        '*Correo:* ' + encodeURIComponent(datos.email) + '%0A' +
        '*Mensaje:* ' + encodeURIComponent(datos.mensaje);

      window.open('https://wa.me/' + WHATSAPP_NUMERO + '?text=' + texto, '_blank');
      note.textContent = 'Abriendo WhatsApp para enviar tu mensaje... 💬';
      note.className = 'form-note ok';
    });

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

  // Lightbox: ver la foto de la galería en grande al hacer clic
  const galleryLinks = document.querySelectorAll('.gallery-item');
  if (galleryLinks.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML =
      '<button class="lightbox-close" aria-label="Cerrar">&times;</button>' +
      '<img class="lightbox-img" alt="" />';
    document.body.appendChild(lb);

    const lbImg = lb.querySelector('.lightbox-img');
    const closeBtn = lb.querySelector('.lightbox-close');

    const abrir = (src, alt) => {
      lbImg.src = src;
      lbImg.alt = alt || '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const cerrar = () => {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      lbImg.removeAttribute('src');
    };

    galleryLinks.forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const img = a.querySelector('img');
        abrir(a.getAttribute('href'), img ? img.alt : '');
      });
    });

    closeBtn.addEventListener('click', cerrar);
    lb.addEventListener('click', (e) => { if (e.target === lb) cerrar(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lb.classList.contains('open')) cerrar();
    });
  }

  // Botones "copiar al portapapeles" (página de donaciones)
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const valor = btn.getAttribute('data-copy');
      const original = btn.textContent;
      try {
        await navigator.clipboard.writeText(valor);
      } catch (_) {
        // Respaldo para navegadores sin Clipboard API
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
