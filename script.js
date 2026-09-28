(() => {
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.forEach((item) => {
        item.classList.remove('is-active');
        item.removeAttribute('aria-current');
      });
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    });
  });


  const newsletterForm = document.querySelector('#newsletter-form');
  const newsletterEmail = document.querySelector('#newsletter-email');
  const newsletterMessage = document.querySelector('#newsletter-message');

  if (newsletterForm && newsletterEmail && newsletterMessage) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!newsletterEmail.checkValidity()) {
        newsletterEmail.reportValidity();
        return;
      }
      newsletterMessage.textContent = 'Спасибо! Форма готова к подключению рассылки.';
      newsletterForm.reset();
    });
  }

  // Появление элементов по очереди при прокрутке/загрузке.
  const revealItems = document.querySelectorAll('.reveal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
  }


  // Mobile header dropdown
  const mobileMenuButton = document.querySelector('.mobile-menu-toggle');
  const siteHeader = document.querySelector('.site-header');
  const primaryNavigation = document.querySelector('#primary-navigation');

  if (mobileMenuButton && siteHeader && primaryNavigation) {
    const closeMobileMenu = () => {
      siteHeader.classList.remove('is-menu-open');
      mobileMenuButton.setAttribute('aria-expanded', 'false');
      mobileMenuButton.setAttribute('aria-label', 'Открыть меню');
    };

    mobileMenuButton.addEventListener('click', () => {
      const isOpen = mobileMenuButton.getAttribute('aria-expanded') === 'true';
      siteHeader.classList.toggle('is-menu-open', !isOpen);
      mobileMenuButton.setAttribute('aria-expanded', String(!isOpen));
      mobileMenuButton.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
    });

    primaryNavigation.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMobileMenu();
    });

    const mobileBreakpoint = window.matchMedia('(min-width: 641px)');
    mobileBreakpoint.addEventListener?.('change', (event) => {
      if (event.matches) closeMobileMenu();
    });
  }

  // card carousels 
  const carouselMedia = window.matchMedia('(max-width: 640px)');
  const carouselReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const carouselTimers = new Map();

  function stopCarousel(grid) {
    const timer = carouselTimers.get(grid);
    if (timer) window.clearInterval(timer);
    carouselTimers.delete(grid);
  }

  function startCarousel(grid) {
    stopCarousel(grid);
    if (!carouselMedia.matches || carouselReducedMotion || grid.children.length < 2) return;

    const timer = window.setInterval(() => {
      if (grid.matches(':hover') || grid.contains(document.activeElement)) return;
      const cards = Array.from(grid.children);
      const current = Math.round(grid.scrollLeft / (cards[0].getBoundingClientRect().width + 12));
      const next = (current + 1) % cards.length;
      const gridRect = grid.getBoundingClientRect();
      const cardRect = cards[next].getBoundingClientRect();
      grid.scrollTo({
        left: grid.scrollLeft + cardRect.left - gridRect.left,
        behavior: 'smooth'
      });
    }, 3600);
    carouselTimers.set(grid, timer);
  }

  const cardCarousels = document.querySelectorAll('.metrics-grid, .recipes-grid');
  cardCarousels.forEach((grid) => {
    grid.setAttribute('tabindex', '0');
    grid.setAttribute('aria-roledescription', 'карусель');
    startCarousel(grid);
  });

  carouselMedia.addEventListener?.('change', () => {
    cardCarousels.forEach(startCarousel);
  });

  const hero = document.querySelector('.hero');
  const particleLayer = document.querySelector('.hero__vitamins');
  if (!hero || !particleLayer) return;

  const PARTICLE_SIZE = 40;
  const RADIUS = PARTICLE_SIZE / 2;
  const GRAVITY = 1750;           
  const RESTITUTION = 0.12;         
  const AIR_DRAG = 0.998;
  const FLOOR_FRICTION = 0.78;
  const MAX_PARTICLES = 180;

  let nextType = 0;
  let particles = [];
  let rafId = null;
  let previousTime = 0;


  const placeholderSvg = (type) => type === 0
    ? `<svg viewBox="0 0 43 53" focusable="false" aria-hidden="true" style="width:100%;height:100%">
        <rect x="0.683013" y="11.0162" width="20.6665" height="47.1477" rx="10.3332" transform="rotate(-30 0.683013 11.0162)" fill="#075059" stroke="#075059"/>
        <path d="M35.5562 32.6968C38.0492 37.0147 36.5704 42.5363 32.2525 45.0292C27.9346 47.5221 22.4133 46.042 19.9204 41.7241L14.2031 31.8215L29.8389 22.7942L35.5562 32.6968Z" fill="#F6F6F6"/>
      </svg>`
    : `<svg viewBox="0 0 35 35" focusable="false" aria-hidden="true" style="width:100%;height:100%">
        <circle cx="17.1668" cy="17.1668" r="10.7549" transform="rotate(52.8952 17.1668 17.1668)" fill="#F6F6F6" stroke="#075059" stroke-width="3"/>
        <rect x="23.4027" y="12.0458" width="0.644995" height="16.5549" rx="0.322498" transform="rotate(52.8952 23.4027 12.0458)" fill="#F6F6F6" stroke="#075059" stroke-width="0.644995"/>
      </svg>`;

  function renderParticle(particle) {
    particle.el.style.left = `${particle.x}px`;
    particle.el.style.top = `${particle.y}px`;
    particle.el.style.transform = `translate(-50%, -50%) rotate(${particle.angle}rad)`;
  }

  function createParticle(x, y) {
    const type = nextType;
    nextType = 1 - nextType;

    const el = document.createElement('span');
    el.className = `vitamin-particle vitamin-particle--type-${type === 0 ? 'a' : 'b'}`;
    el.innerHTML = placeholderSvg(type);
    particleLayer.appendChild(el);

    const bounds = hero.getBoundingClientRect();
    const particle = {
      el,
      type,
      r: RADIUS,
      x: Math.max(RADIUS, Math.min(bounds.width - RADIUS, x)),
      y: Math.max(RADIUS, y),
      vx: (Math.random() - 0.5) * 90,
      vy: 0,
      angle: (Math.random() - 0.5) * 0.3,
      spin: (Math.random() - 0.5) * 1.8,
      sleeping: false
    };

    particles.push(particle);

    // Защита от чрезмерного количества DOM-элементов.
    while (particles.length > MAX_PARTICLES) {
      const removed = particles.shift();
      removed.el.remove();
    }

    startPhysics();
  }

  function resolveBounds(p, width, height) {
    if (p.x < p.r) {
      p.x = p.r;
      if (p.vx < 0) p.vx = -p.vx * RESTITUTION;
      p.vy *= 0.985;
    } else if (p.x > width - p.r) {
      p.x = width - p.r;
      if (p.vx > 0) p.vx = -p.vx * RESTITUTION;
      p.vy *= 0.985;
    }

    if (p.y > height - p.r) {
      p.y = height - p.r;
      if (p.vy > 0) p.vy = -p.vy * RESTITUTION;
      p.vx *= FLOOR_FRICTION;
      p.spin *= 0.72;
      if (Math.abs(p.vy) < 24) p.vy = 0;
      if (Math.abs(p.vx) < 8) p.vx = 0;
    }
  }


  function resolvePair(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const minDistance = a.r + b.r;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared >= minDistance * minDistance) return false;

    const distance = Math.sqrt(distanceSquared) || 0.001;
    const nx = dx / distance;
    const ny = dy / distance;
    const overlap = minDistance - distance;

    const aMovable = !a.sleeping;
    const bMovable = !b.sleeping;
    if (!aMovable && !bMovable) return true;

    if (aMovable && bMovable) {
      a.x -= nx * overlap * 0.5;
      a.y -= ny * overlap * 0.5;
      b.x += nx * overlap * 0.5;
      b.y += ny * overlap * 0.5;
    } else if (aMovable) {
      a.x -= nx * overlap;
      a.y -= ny * overlap;
    } else {
      b.x += nx * overlap;
      b.y += ny * overlap;
    }

    const relativeVx = b.vx - a.vx;
    const relativeVy = b.vy - a.vy;
    const normalVelocity = relativeVx * nx + relativeVy * ny;

    if (normalVelocity < 0) {
      const invA = aMovable ? 1 : 0;
      const invB = bMovable ? 1 : 0;
      const impulse = -(1 + RESTITUTION) * normalVelocity / (invA + invB || 1);
      if (aMovable) {
        a.vx -= impulse * nx;
        a.vy -= impulse * ny;
      }
      if (bMovable) {
        b.vx += impulse * nx;
        b.vy += impulse * ny;
      }

      
      const tx = -ny;
      const ty = nx;
      const tangentVelocity = relativeVx * tx + relativeVy * ty;
      const frictionImpulse = tangentVelocity * 0.12 / (invA + invB || 1);
      if (aMovable) {
        a.vx += frictionImpulse * tx;
        a.vy += frictionImpulse * ty;
      }
      if (bMovable) {
        b.vx -= frictionImpulse * tx;
        b.vy -= frictionImpulse * ty;
      }
    }

    
    if (a.sleeping && bMovable && overlap > 0.5) a.sleeping = false;
    if (b.sleeping && aMovable && overlap > 0.5) b.sleeping = false;
    return true;
  }

  function step(timestamp) {
    if (!previousTime) previousTime = timestamp;
    const dt = Math.min((timestamp - previousTime) / 1000, 0.025);
    previousTime = timestamp;

    const bounds = hero.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;
    const active = particles.filter((p) => !p.sleeping);

    active.forEach((p) => {
      p.vy += GRAVITY * dt;
      p.vx *= AIR_DRAG;
      p.vy *= AIR_DRAG;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.angle += p.spin * dt;
      resolveBounds(p, width, height);
    });

    
    for (let pass = 0; pass < 5; pass += 1) {
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          resolvePair(particles[i], particles[j]);
        }
      }
      particles.forEach((p) => resolveBounds(p, width, height));
    }

    particles.forEach((p) => {
      if (!p.sleeping && Math.abs(p.vx) < 5 && Math.abs(p.vy) < 8) {
        
        const restingOnFloor = p.y >= height - p.r - 0.8;
        const restingOnParticle = particles.some((other) => {
          if (other === p) return false;
          const dx = p.x - other.x;
          const dy = p.y - other.y;
          return Math.hypot(dx, dy) <= p.r + other.r + 1;
        });
        if (restingOnFloor || restingOnParticle) {
          p.vx = 0;
          p.vy = 0;
          p.spin = 0;
          p.sleeping = true;
        }
      }
      renderParticle(p);
    });

    if (particles.some((p) => !p.sleeping)) {
      rafId = requestAnimationFrame(step);
    } else {
      rafId = null;
      previousTime = 0;
    }
  }

  function startPhysics() {
    if (rafId === null) {
      previousTime = 0;
      rafId = requestAnimationFrame(step);
    }
  }

  hero.addEventListener('click', (event) => {
    if (event.target.closest('a, button, nav')) return;
    const bounds = hero.getBoundingClientRect();
    createParticle(event.clientX - bounds.left, event.clientY - bounds.top);
  });

 
  let lastWidth = 0;
  let lastHeight = 0;

  function handleHeroResize() {
    const bounds = hero.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;

    if (Math.abs(width - lastWidth) < 1 && Math.abs(height - lastHeight) < 1) return;
    lastWidth = width;
    lastHeight = height;

    particles.forEach((p) => {
      p.x = Math.max(p.r, Math.min(width - p.r, p.x));

      
      if (p.y > height - p.r) {
        p.y = height - p.r;
        p.vy = 0;
      }

      
      p.sleeping = false;
      p.vx *= 0.25;
      p.vy = Math.max(0, p.vy);
      renderParticle(p);
    });

    startPhysics();
  }

 
  window.addEventListener('resize', handleHeroResize, { passive: true });

  if ('ResizeObserver' in window) {
    const heroResizeObserver = new ResizeObserver(handleHeroResize);
    heroResizeObserver.observe(hero);
  }

 
  const initialBounds = hero.getBoundingClientRect();
  lastWidth = initialBounds.width;
  lastHeight = initialBounds.height;
})();
