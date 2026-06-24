import { kernels, systemdServices } from '../../../application/boot';

const adblockDetected = (() => {
  const bait = document.createElement('div');
  bait.className = 'adsbox pub_300x250';
  bait.id = 'ad-container--bait';
  bait.innerHTML = '&nbsp;';
  bait.style.position = 'absolute';
  bait.style.left = '-9999px';
  document.body.appendChild(bait);
  const blocked = bait.offsetHeight === 0 || bait.offsetParent === null;
  bait.remove();
  return blocked;
})();

const bootScreen = document.getElementById('boot-screen');
const bootOutput = document.getElementById('boot-output');
if (bootScreen && bootOutput) {
  const now = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const month = months[now.getMonth()];
  const day = String(now.getDate()).padStart(2, '0');
  function ts(sec) {
    const d = new Date(now);
    d.setSeconds(d.getSeconds() - 20 + sec);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${month} ${day} ${hh}:${mm}:${ss}`;
  }

  const bootLines = [];
  const pid = () => Math.floor(Math.random() * 9999) + 1;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  let sec = 0;
  const lineCount = 60;

  for (let i = 0; i < lineCount; i++) {
    const t = ts(sec);
    if (i < 50) {
      bootLines.push(`${t} AR3LYX1 sys kernel: ${pick(kernels)}`);
    } else {
      const svc = pick(systemdServices);
      const svcName = svc[0];
      const msgs = svc[2];
      bootLines.push(`${t} AR3LYX1 sys ${svcName}[${pid()}]: ${pick(msgs)}`);
    }
    sec += 0.066;
  }

  const blinkStyle = document.createElement('style');
  blinkStyle.textContent = `
    @keyframes boot-blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
  `;
  document.head.appendChild(blinkStyle);

  let idx = 0;
  const batchSize = 2;

  function showBatch() {
    const fragment = document.createDocumentFragment();
    for (let j = 0; j < batchSize && idx < bootLines.length; j++, idx++) {
      const line = document.createElement('div');
      line.textContent = bootLines[idx];
      fragment.appendChild(line);
    }
    bootOutput.appendChild(fragment);
    bootOutput.scrollTop = bootOutput.scrollHeight;

    if (idx < bootLines.length) {
      requestAnimationFrame(showBatch);
    } else {
      setTimeout(() => {
        bootOutput.innerHTML = '';
        bootOutput.style.height = 'auto';
        bootScreen.classList.add('boot-screen--centered');
        const msgs = [
          '> inicializando AR3LYX1 portfolio...',
          '> sistema listo. bienvenido.',
        ];
        if (adblockDetected) msgs.splice(1, 0, '> WARNING: Ad blocker detected — some content may not display correctly. Please disable it for this site.');

        function typeInit(lineIdx, charIdx, cursorEl) {
          if (charIdx < msgs[lineIdx].length) {
            cursorEl.before(document.createTextNode(msgs[lineIdx][charIdx]));
            setTimeout(() => typeInit(lineIdx, charIdx + 1, cursorEl), 40);
          } else {
            cursorEl.remove();
            if (lineIdx + 1 < msgs.length) {
              const nextLine = document.createElement('div');
              const nextCursor = document.createElement('span');
              nextCursor.className = 'boot-cursor';
              nextLine.appendChild(nextCursor);
              bootOutput.appendChild(nextLine);
              setTimeout(() => typeInit(lineIdx + 1, 0, nextCursor), 40);
            } else {
              setTimeout(() => {
                bootScreen.style.transition = 'opacity 0.3s ease';
                bootScreen.style.opacity = '0';
                setTimeout(() => {
                  bootScreen.style.display = 'none';
                  window.dispatchEvent(new CustomEvent('bootComplete'));
                }, 350);
              }, 1000);
            }
          }
        }

        const firstLine = document.createElement('div');
        const cursor = document.createElement('span');
        cursor.className = 'boot-cursor';
        firstLine.appendChild(cursor);
        bootOutput.appendChild(firstLine);
        requestAnimationFrame(() => typeInit(0, 0, cursor));
      }, 1000);
    }
  }

  requestAnimationFrame(showBatch);
}
