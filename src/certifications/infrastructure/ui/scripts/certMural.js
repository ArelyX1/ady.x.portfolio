const MURALS = [
  ['crt-tech', 'crt-track-tech', 'crt-title-tech'],
  ['crt-otros', 'crt-track-otros', 'crt-title-otros'],
];

let booted = false;

function initMural(sectionId, trackId, titleId) {
  const section = document.getElementById(sectionId);
  const track = document.getElementById(trackId);
  const wall = track?.querySelector('.crt-wall');
  const title = document.getElementById(titleId);
  if (!section || !track || !wall || !title) return;

  const cards = [...wall.querySelectorAll('.project-card')];
  if (!cards.length) return;

  let maxX = 0;

  function measureTitle() {
    const oL = title.style.left;
    const oT = title.style.top;
    const oV = title.style.visibility;
    title.style.left = '0px';
    title.style.top = '0px';
    title.style.visibility = 'hidden';
    const w = title.offsetWidth;
    title.style.left = oL;
    title.style.top = oT;
    title.style.visibility = oV;
    return w;
  }

  function layout() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const PAD = 80;

    const titleW = measureTitle();
    const titleX = Math.max(PAD, (vw - titleW) / 2);
    const titleY = (vh / 2) - 60;
    title.style.position = 'absolute';
    title.style.left = `${titleX}px`;
    title.style.top = `${titleY}px`;

    const titleRight = titleX + titleW + 120;
    const yPad = 60;
    let maxRight = 0;

    const layouts = [
      { w: 260, h: 340, x: titleRight + 160, y: yPad + 400, rot: 0, z: 11 },
      { w: 240, h: 295, x: titleRight + 240, y: yPad + 15, rot: 0, z: 11 },
      { w: 400, h: 300, x: titleRight + 590, y: (vh - 650) / 2, rot: 0, z: 9 },
      { w: 250, h: 360, x: titleRight + 1030, y: (vh - 630) / 2, rot: 0, z: 9 },
      { w: 190, h: 290, x: titleRight + 1130, y: (vh + 20) / 2, rot: 0, z: 9 },
      { w: 360, h: 280, x: titleRight + 1320, y: (vh - 50) / 2, rot: 0, z: 9 },
      { w: 300, h: 300, x: titleRight + 1500, y: (vh - 640) / 2, rot: 0, z: 9 },
      { w: 450, h: 650, x: titleRight + 1800, y: (vh - 600) / 2, rot: 0, z: 9 },
      { w: 250, h: 250, x: titleRight + 2300, y: (vh + 130) / 2, rot: 0, z: 9 },
      { w: 350, h: 250, x: titleRight + 2280, y: (vh - 535) / 2, rot: 0, z: 9 },
    ];

    const overflowSizes = [
      { w: 280, h: 320, x: titleRight + 2600, y: (vh - 585) / 2, rot: 0, z: 9 },
      { w: 220, h: 260, x: titleRight + 2600, y: (vh + 10) / 2, rot: 0, z: 9 },
      { w: 380, h: 280, x: titleRight + 2880, y: (vh - 20) / 2, rot: 0, z: 9 },
      { w: 200, h: 300, x: titleRight + 3000, y: (vh - 750) / 2, rot: 0, z: 9 },
      { w: 320, h: 240, x: titleRight + 3280, y: (vh - 53) / 2, rot: 0, z: 9 },
      { w: 320, h: 240, x: titleRight + 3680, y: (vh - 0) / 2, rot: 0, z: 9 },
      { w: 320, h: 240, x: titleRight + 3400, y: (vh - 653) / 2, rot: 0, z: 9 },
    ];

    cards.forEach((card, i) => {
      let l;
      if (i < layouts.length) {
        l = layouts[i];
      } else {
        const off = (i - layouts.length) % overflowSizes.length;
        l = overflowSizes[off];
      }
      maxRight = Math.max(maxRight, l.x + l.w);
      card.style.position = 'absolute';
      card.style.display = 'flex';
      card.style.left = `${l.x}px`;
      card.style.top = `${l.y}px`;
      card.style.width = `${l.w}px`;
      card.style.zIndex = l.z;
      card.style.rotate = `${l.rot}deg`;
    });

    const muralWidth = Math.max(maxRight + PAD, vw + 100);
    wall.style.width = `${muralWidth}px`;
    wall.style.height = '100vh';
    maxX = Math.max(0, muralWidth - vw);

    cards.forEach(card => {
      const cardX = parseFloat(card.style.left);
      const cardW = parseFloat(card.style.width);
      const rawStart = maxX > 0 ? (cardX - vw + cardW * 0.3) / maxX : 0;
      const start = Math.max(0, Math.min(rawStart, 0.5));
      card.dataset.animStart = start;
      card.dataset.animEnd = Math.min(1, start + 0.5);
    });
  }

  function update() {
    const vh = window.innerHeight;
    const rect = section.getBoundingClientRect();
    const sh = Math.max(section.offsetHeight, section.scrollHeight);
    const total = sh - vh;
    if (total <= 0) return;

    const scrolled = Math.max(0, Math.min(total, -rect.top));
    const progress = scrolled / total;

    track.style.transform = `translateX(${-progress * maxX}px)`;

    cards.forEach(card => {
      const s = parseFloat(card.dataset.animStart) || 0;
      const e = parseFloat(card.dataset.animEnd) || 0.1;
      const range = e - s;
      let p;
      if (range <= 0) {
        p = progress >= s ? 1 : 0;
      } else {
        p = Math.max(0, Math.min(1, (progress - s) / range));
      }
      const ease = 1 - Math.pow(1 - p, 4);
      card.style.transform = `translateX(${550 - 550 * ease}px) rotate(${12 - 12 * ease}deg)`;
    });
  }

  layout();
  update();

  let ticking = false;
  function tick() {
    if (!ticking) return;
    update();
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(([entry]) => {
    ticking = entry.isIntersecting;
    if (ticking) requestAnimationFrame(tick);
  }, { root: null, threshold: 0 });
  io.observe(section);

  window.addEventListener('scroll', update, { passive: true });

  window.addEventListener('resize', () => {
    layout();
    update();
  });

  document.fonts?.ready?.then(() => {
    layout();
    update();
  });
}

export function initCertMurals() {
  if (booted) return;
  if (window.innerWidth < 768) return;
  booted = true;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      for (const args of MURALS) initMural(...args);
    });
  });
}
