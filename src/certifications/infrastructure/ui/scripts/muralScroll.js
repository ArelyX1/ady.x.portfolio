export function initMuralScroll(containerId, scrollId = 'mural-scroll', wallId = 'mural-wall', titleId = 'mural-title') {
  const section = document.getElementById(containerId);
  const muralScroll = document.getElementById(scrollId);
  const wall = document.getElementById(wallId);
  const title = document.getElementById(titleId);

  if (!section || !muralScroll || !wall || !title || section.dataset.muralInit === 'true') return;

  const cards = wall.querySelectorAll('.project-card');
  if (!cards.length) return;

  section.dataset.muralInit = 'true';

  function measureTitle() {
    const origLeft = title.style.left;
    const origTop = title.style.top;
    const origVis = title.style.visibility;
    title.style.left = '0px';
    title.style.top = '0px';
    title.style.visibility = 'hidden';
    const w = title.offsetWidth;
    title.style.left = origLeft;
    title.style.top = origTop;
    title.style.visibility = origVis;
    return w;
  }

  function getLayout(i, titleRight, vh) {
    const yPad = 60;
    const layouts = [
      { w: 260, h: 340, x: titleRight + 160, y: yPad + 400, rot: 0, z: 11 },
      { w: 240, h: 295, x: titleRight + 240, y: yPad + 15, rot: 0, z: 11 },
      { w: 600, h: 700, x: titleRight + 470, y: (vh - 650) / 2, rot: 0, z: 9 },
      { w: 250, h: 360, x: titleRight + 1080, y: (vh - 630) / 2, rot: 0, z: 9 },
      { w: 190, h: 290, x: titleRight + 1130, y: (vh + 200) / 2, rot: 0, z: 9 },
      { w: 360, h: 280, x: titleRight + 1320, y: (vh - 50) / 2, rot: 0, z: 9 },
      { w: 300, h: 300, x: titleRight + 1500, y: (vh - 640) / 2, rot: 0, z: 9 },
      { w: 450, h: 650, x: titleRight + 1800, y: (vh - 600) / 2, rot: 0, z: 9 },
      { w: 250, h: 250, x: titleRight + 2300, y: (vh + 200) / 2, rot: 0, z: 9 },
      { w: 350, h: 250, x: titleRight + 2280, y: (vh - 535) / 2, rot: 0, z: 9 },
    ];

    if (i < layouts.length) return layouts[i];

    const last = layouts[layouts.length - 1];
    const overflow = i - layouts.length + 1;
    return {
      w: last.w,
      h: last.h,
      x: last.x + overflow * 320,
      y: last.y + (overflow % 2 === 0 ? 0 : 120),
      rot: 0,
      z: last.z,
    };
  }

  function layoutMural() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 768;
    const PAD = 80;

    if (isMobile) {
      cards.forEach(card => {
        card.style.position = '';
        card.style.display = '';
        card.style.left = '';
        card.style.top = '';
        card.style.width = '';
        card.style.height = '';
        card.style.zIndex = '';
        card.style.rotate = '';
        card.style.transform = '';
      });
      wall.style.width = '';
      wall.style.height = '';
      muralScroll.style.transform = '';
      section.style.height = '';
      title.style.position = '';
      title.style.left = '';
      title.style.top = '';
      title.style.transform = '';
      return vw;
    }

    const titleW = measureTitle();
    const titleX = Math.max(PAD, (vw - titleW) / 2);
    const titleY = (vh / 2) - 60;
    title.style.position = 'absolute';
    title.style.left = titleX + 'px';
    title.style.top = titleY + 'px';
    title.style.transform = 'none';

    const titleRight = titleX + titleW + 120;
    let maxRight = 0;

    cards.forEach((card, i) => {
      const l = getLayout(i, titleRight, vh);
      maxRight = Math.max(maxRight, l.x + l.w);

      card.style.position = 'absolute';
      card.style.display = 'flex';
      card.style.left = l.x + 'px';
      card.style.top = l.y + 'px';
      card.style.width = l.w + 'px';
      card.style.height = l.h + 'px';
      card.style.zIndex = l.z;
      card.style.rotate = l.rot + 'deg';
    });

    const muralWidth = Math.max(maxRight + PAD, vw + 100);
    wall.style.width = muralWidth + 'px';
    wall.style.height = '100vh';

    const maxX = Math.max(0, muralWidth - vw);

    cards.forEach(card => {
      const cardX = parseFloat(card.style.left);
      const cardW = parseFloat(card.style.width);
      const rawStart = maxX > 0 ? (cardX - vw + cardW * 0.3) / maxX : 0;
      const start = Math.max(0, Math.min(rawStart, 0.5));
      const end = Math.min(1, start + 0.5);
      card.dataset.animStart = start;
      card.dataset.animEnd = end;
    });

    return muralWidth;
  }

  let muralWidth = layoutMural();
  section.classList.add('visible');

  function getMaxX() {
    return Math.max(0, muralWidth - window.innerWidth);
  }

  function updateScroll() {
    if (window.innerWidth < 768) return;
    const rect = section.getBoundingClientRect();
    const sh = section.offsetHeight;
    const vh = window.innerHeight;
    const totalScroll = sh - vh;
    if (totalScroll <= 0) return;
    const scrolled = Math.max(0, Math.min(totalScroll, -rect.top));
    const progress = scrolled / totalScroll;
    muralScroll.style.transform = `translateX(${-progress * getMaxX()}px)`;

    cards.forEach(card => {
      const start = parseFloat(card.dataset.animStart) || 0;
      const end = parseFloat(card.dataset.animEnd) || 0.1;
      const range = end - start;
      let p;
      if (range <= 0) {
        p = progress >= start ? 1 : 0;
      } else {
        p = Math.max(0, Math.min(1, (progress - start) / range));
      }
      const ease = 1 - Math.pow(1 - p, 4);
      card.style.transform = `translateX(${550 - 550 * ease}px) rotate(${12 - 12 * ease}deg)`;
    });
  }

  document.fonts.ready.then(() => {
    muralWidth = layoutMural();
    updateScroll();
  });

  window.addEventListener('scroll', updateScroll, { passive: true });

  window.addEventListener('resize', () => {
    muralWidth = layoutMural();
    updateScroll();
  });

  requestAnimationFrame(updateScroll);
}
