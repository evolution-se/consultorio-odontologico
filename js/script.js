'use strict';

/* ============================================================
   CLÍNICA ODONTOLÓGICA ALVORADA — script.js
   JavaScript vanilla: interações, WhatsApp, formulário e FAQ.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. CONFIGURAÇÃO ---------- */

  // SUBSTITUIR pelo número real da clínica (formato internacional, com DDI 55).
  const WHATSAPP_NUMBER = '5511900000000';

  const DEFAULT_MESSAGE = 'Olá! Gostaria de agendar uma avaliação odontológica.';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = function (sel, root) { return (root || document).querySelector(sel); };
  const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- 2. LINKS DO WHATSAPP ---------- */

  function buildWhatsAppLink(message) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message || DEFAULT_MESSAGE);
  }

  function initWhatsAppLinks() {
    $$('[data-whatsapp-message]').forEach(function (el) {
      el.href = buildWhatsAppLink(el.dataset.whatsappMessage);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
  }

  /* ---------- 3. HEADER — sombra ao rolar ---------- */

  function initHeaderScroll() {
    const header = $('.header');
    if (!header) return;

    const update = function () {
      header.classList.toggle('scrolled', window.pageYOffset > 40);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- 4. MENU MOBILE ---------- */

  function initMobileMenu() {
    const toggler = $('.header-toggler');
    const nav = $('.header-nav');
    if (!toggler || !nav) return;

    const closeMenu = function () {
      nav.classList.remove('show');
      toggler.classList.remove('active');
      toggler.setAttribute('aria-expanded', 'false');
    };

    const openMenu = function () {
      nav.classList.add('show');
      toggler.classList.add('active');
      toggler.setAttribute('aria-expanded', 'true');
    };

    toggler.addEventListener('click', function () {
      if (nav.classList.contains('show')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Fecha o menu ao navegar (qualquer link do painel).
    $$('a', nav).forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Fecha com a tecla Escape.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('show')) {
        closeMenu();
        toggler.focus();
      }
    });

    // Fecha ao rolar ou ao voltar para o desktop.
    window.addEventListener('scroll', function () {
      if (nav.classList.contains('show') && window.pageYOffset > 40) closeMenu();
    }, { passive: true });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) closeMenu();
    });
  }

  /* ---------- 5. SCROLL SPY (link ativo no menu) ---------- */

  function initScrollSpy() {
    const links = $$('.header-nav-link[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    const sections = links
      .map(function (link) { return document.getElementById(link.getAttribute('href').slice(1)); })
      .filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          const active = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('active', active);
          if (active) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------- 6. ANIMAÇÕES DE APARIÇÃO (reveal) ---------- */

  function initReveal() {
    const elements = $$('.reveal');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 7. VOLTAR AO TOPO ---------- */

  function initBackToTop() {
    const button = $('.back-to-top');
    if (!button) return;

    const update = function () {
      button.classList.toggle('visible', window.pageYOffset > 600);
    };

    window.addEventListener('scroll', update, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
    update();
  }

  /* ---------- 8. FAQ (acordeão) ---------- */

  function initFaq() {
    const items = $$('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      const button = $('.faq-question', item);
      if (!button) return;

      button.addEventListener('click', function () {
        const isOpen = item.classList.contains('open');

        items.forEach(function (other) {
          other.classList.remove('open');
          const otherBtn = $('.faq-question', other);
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('open');
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------- 9. GALERIA — modal com imagem ampliada ---------- */

  function initGalleryModal() {
    const modalEl = $('#galleryModal');
    const modalImg = $('#galleryModalImg');
    const caption = $('#galleryModalCaption');
    if (!modalEl || !modalImg || typeof bootstrap === 'undefined') return;

    $$('.gallery-item').forEach(function (item) {
      item.addEventListener('click', function () {
        const src = item.dataset.img;
        const alt = item.dataset.caption || 'Imagem do consultório';
        if (src) {
          modalImg.src = src;
          modalImg.alt = alt;
        }
        if (caption) caption.textContent = item.dataset.captionFull || alt;
      });
    });
  }

  /* ---------- 10. FORMULÁRIO — máscara, validação e envio ---------- */

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
    if (digits.length <= 10) {
      return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 6) + '-' + digits.slice(6);
    }
    return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 7) + '-' + digits.slice(7);
  }

  function setFieldError(field, hasError) {
    const group = field.closest('.form-group');
    if (!group) return;
    group.classList.toggle('has-error', hasError);
    field.setAttribute('aria-invalid', hasError ? 'true' : 'false');
  }

  function initForm() {
    const form = $('#contactForm');
    if (!form) return;

    const nameField = $('#formName');
    const phoneField = $('#formPhone');
    const interestField = $('#formInterest');
    const messageField = $('#formMessage');
    const privacyField = $('#formPrivacy');
    const summary = $('#formErrorSummary');
    const success = $('#formSuccess');

    // Máscara visual do telefone.
    if (phoneField) {
      phoneField.addEventListener('input', function () {
        phoneField.value = formatPhone(phoneField.value);
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (success) success.classList.remove('visible');

      const errors = [];

      const nameOk = nameField && nameField.value.trim().length >= 2;
      if (nameField) setFieldError(nameField, !nameOk);
      if (!nameOk) errors.push('Informe seu nome.');

      const phoneOk = phoneField && phoneField.value.replace(/\D/g, '').length >= 10;
      if (phoneField) setFieldError(phoneField, !phoneOk);
      if (!phoneOk) errors.push('Informe um telefone válido com DDD.');

      const interestOk = interestField && interestField.value !== '';
      if (interestField) setFieldError(interestField, !interestOk);
      if (!interestOk) errors.push('Selecione o assunto do seu interesse.');

      const privacyOk = privacyField && privacyField.checked;
      if (privacyField) setFieldError(privacyField, !privacyOk);
      if (!privacyOk) errors.push('É necessário ler e aceitar a Política de Privacidade.');

      if (errors.length) {
        if (summary) {
          summary.textContent = 'Verifique os campos: ' + errors.join(' ');
          summary.classList.add('visible');
        }
        const firstInvalid = $('.has-error input, .has-error select', form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (summary) {
        summary.textContent = '';
        summary.classList.remove('visible');
      }

      // Mensagem montada com os dados digitados; o envio abre o WhatsApp.
      const lines = [
        'Olá! Gostaria de agendar uma avaliação pela Clínica Odontológica Alvorada.',
        'Nome: ' + nameField.value.trim(),
        'Telefone: ' + phoneField.value,
        'Interesse: ' + interestField.value
      ];
      if (messageField && messageField.value.trim()) {
        lines.push('Mensagem: ' + messageField.value.trim());
      }

      window.open(buildWhatsAppLink(lines.join('\n')), '_blank', 'noopener');

      if (success) {
        success.textContent = 'Tudo certo! O WhatsApp foi aberto em uma nova aba para você concluir o envio.';
        success.classList.add('visible');
      }
      form.reset();
    });

    // Limpa o erro do campo quando o usuário volta a digitar.
    $$('.form-group input, .form-group select, .form-group textarea', form).forEach(function (field) {
      field.addEventListener('input', function () {
        const group = field.closest('.form-group');
        if (group && group.classList.contains('has-error')) setFieldError(field, false);
      });
    });
  }

  /* ---------- 11. ANO CORRENTE NO RODAPÉ ---------- */

  function initYear() {
    $$('[data-current-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------- INICIALIZAÇÃO ---------- */

  initWhatsAppLinks();
  initHeaderScroll();
  initMobileMenu();
  initScrollSpy();
  initReveal();
  initBackToTop();
  initFaq();
  initGalleryModal();
  initForm();
  initYear();
});
