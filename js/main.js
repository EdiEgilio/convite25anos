/**
 * Edi & Dani — 25 Anos
 * Scrollytelling com GSAP + ScrollTrigger. Cai graciosamente para
 * exibição estática (sem animação) se as libs não carregarem ou se
 * prefers-reduced-motion estiver ativo.
 */
(function () {
  "use strict";

  // URL do Google Apps Script (Web App) que grava as confirmações na planilha.
  // Configure seguindo o passo a passo em README.md > "Configurando o Google Sheets".
  const RSVP_ENDPOINT_URL =
    "https://script.google.com/macros/s/AKfycbwn5Jx0X3o6qw45AvAa8O7P-p9d5y2GWoXh9GhDKgLR2w069fEcfPuPcO_t98vaCVIe/exec";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------------------------------------------------------
   * 1. Reveal genérico (fade + translateY) para blocos .reveal
   * ------------------------------------------------------- */
  function initReveals() {
    const items = document.querySelectorAll(".reveal");

    if (prefersReducedMotion) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    if (hasGsap) {
      items.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => el.classList.add("is-visible"),
        });
      });
      return;
    }

    // Fallback sem GSAP: IntersectionObserver puro
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    items.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------
   * 2. Hero: Ken Burns + contador 0 -> 25
   * ------------------------------------------------------- */
  function initHero() {
    const heroImg = document.querySelector(".hero__img");
    const counterEl = document.querySelector(".hero__counter-number");
    const target = counterEl ? parseInt(counterEl.dataset.counterTarget, 10) : 25;

    if (prefersReducedMotion) {
      if (counterEl) counterEl.textContent = String(target);
      return;
    }

    if (hasGsap) {
      if (heroImg) {
        gsap.to(heroImg, {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (counterEl) {
        const counterState = { value: 0 };
        gsap.to(counterState, {
          value: target,
          duration: 2,
          ease: "power2.out",
          delay: 0.3,
          onUpdate: () => {
            counterEl.textContent = String(Math.floor(counterState.value));
          },
          onComplete: () => {
            counterEl.textContent = String(target);
          },
        });
      }
      return;
    }

    // Fallback sem GSAP: contador simples com requestAnimationFrame
    if (counterEl) {
      const duration = 1600;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        counterEl.textContent = String(Math.floor(progress * target));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  }

  /* ---------------------------------------------------------
   * 3. Linha do tempo: preenchimento vertical conforme o scroll
   * ------------------------------------------------------- */
  function initTimeline() {
    const fill = document.getElementById("timelineFill");
    const timeline = document.querySelector(".timeline");
    if (!fill || !timeline) return;

    if (prefersReducedMotion) {
      fill.style.height = "100%";
      return;
    }

    if (hasGsap) {
      gsap.to(fill, {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: timeline,
          start: "top 70%",
          end: "bottom 60%",
          scrub: true,
        },
      });
      return;
    }

    // Fallback: calcula proporção no scroll nativo
    function updateFill() {
      const rect = timeline.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const start = viewportH * 0.7;
      const total = rect.height + start;
      const scrolled = start - rect.top;
      const ratio = Math.min(Math.max(scrolled / total, 0), 1);
      fill.style.height = (ratio * 100).toFixed(1) + "%";
    }
    window.addEventListener("scroll", updateFill, { passive: true });
    updateFill();
  }

  /* ---------------------------------------------------------
   * 4. Botão flutuante "Confirmar presença"
   * ------------------------------------------------------- */
  function initFloatingCta() {
    const cta = document.getElementById("floatingCta");
    const hero = document.getElementById("hero");
    const rsvpSection = document.getElementById("confirmacao");
    if (!cta || !hero) return;

    if (hasGsap) {
      ScrollTrigger.create({
        trigger: hero,
        start: "bottom top+=120",
        onEnter: () => cta.classList.add("is-shown"),
        onLeaveBack: () => cta.classList.remove("is-shown"),
      });

      if (rsvpSection) {
        ScrollTrigger.create({
          trigger: rsvpSection,
          start: "top center",
          onEnter: () => cta.classList.remove("is-shown"),
          onLeaveBack: () => cta.classList.add("is-shown"),
        });
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          cta.classList.toggle("is-shown", !entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );
    observer.observe(hero);
  }

  /* ---------------------------------------------------------
   * 5. Formulário de confirmação — validação client-side apenas.
   *    O envio real depende da escolha de backend (ver README).
   * ------------------------------------------------------- */
  function onlyDigits(value) {
    return value.replace(/\D/g, "");
  }

  function isValidCpf(raw) {
    const cpf = onlyDigits(raw);
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf[i], 10) * (10 - i);
    let check1 = (sum * 10) % 11;
    if (check1 === 10) check1 = 0;
    if (check1 !== parseInt(cpf[9], 10)) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf[i], 10) * (11 - i);
    let check2 = (sum * 10) % 11;
    if (check2 === 10) check2 = 0;
    return check2 === parseInt(cpf[10], 10);
  }

  function formatCpf(raw) {
    const digits = onlyDigits(raw).slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function setError(input, errorEl, message) {
    if (message) {
      input.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
    } else {
      input.removeAttribute("aria-invalid");
      errorEl.textContent = "";
    }
  }

  function initRsvpForm() {
    const form = document.getElementById("rsvpForm");
    if (!form) return;

    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const cpf = document.getElementById("cpf");
    const rg = document.getElementById("rg");
    const mensagem = document.getElementById("mensagem");
    const status = document.getElementById("rsvpStatus");
    const submitBtn = form.querySelector('button[type="submit"]');
    const endpointConfigured =
      RSVP_ENDPOINT_URL && !RSVP_ENDPOINT_URL.includes("COLE_AQUI");

    const errNome = document.getElementById("err-nome");
    const errEmail = document.getElementById("err-email");
    const errCpf = document.getElementById("err-cpf");
    const errRg = document.getElementById("err-rg");

    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

    cpf.addEventListener("input", () => {
      cpf.value = formatCpf(cpf.value);
    });

    rg.addEventListener("input", () => {
      rg.value = rg.value.replace(/[^\dXx.-]/g, "");
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      status.textContent = "";

      let valid = true;

      if (!nome.value.trim()) {
        setError(nome, errNome, "Por favor, informe seu nome completo.");
        valid = false;
      } else {
        setError(nome, errNome, "");
      }

      if (!isValidEmail(email.value)) {
        setError(email, errEmail, "Por favor, informe um e-mail válido.");
        valid = false;
      } else {
        setError(email, errEmail, "");
      }

      if (!isValidCpf(cpf.value)) {
        setError(cpf, errCpf, "CPF inválido. Confira os números digitados.");
        valid = false;
      } else {
        setError(cpf, errCpf, "");
      }

      if (onlyDigits(rg.value).length < 5) {
        setError(rg, errRg, "Por favor, informe um RG válido.");
        valid = false;
      } else {
        setError(rg, errRg, "");
      }

      if (!valid) {
        status.textContent = "Verifique os campos destacados acima.";
        return;
      }

      if (!endpointConfigured) {
        // A planilha do Google Sheets ainda não foi configurada — ver
        // README.md > "Configurando o Google Sheets".
        status.textContent =
          "Formulário validado, mas o envio ainda não foi configurado (veja o README do projeto).";
        return;
      }

      const payload = {
        nome: nome.value.trim(),
        email: email.value.trim(),
        cpf: onlyDigits(cpf.value),
        rg: rg.value.trim(),
        mensagem: mensagem.value.trim(),
        enviadoEm: new Date().toISOString(),
      };

      submitBtn.disabled = true;
      status.textContent = "Enviando...";

      // mode: "no-cors" + Content-Type text/plain evitam o preflight CORS,
      // que o Apps Script não responde corretamente. Como consequência,
      // não conseguimos ler o corpo da resposta (é "opaca") — por isso o
      // catch abaixo só cobre falhas de rede, não erros do lado do script.
      fetch(RSVP_ENDPOINT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      })
        .then(() => {
          status.textContent =
            "Presença confirmada! Muito obrigado — nos vemos lá. 💛";
          form.reset();
        })
        .catch(() => {
          status.textContent =
            "Não conseguimos enviar agora. Tente novamente em instantes ou fale com a gente pelo telefone.";
        })
        .finally(() => {
          submitBtn.disabled = false;
        });
    });
  }

  /* ---------------------------------------------------------
   * Init
   * ------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initReveals();
    initHero();
    initTimeline();
    initFloatingCta();
    initRsvpForm();
  });
})();
