import { kernels, systemdServices } from '../../../application/boot';

window.__adblockDetected = (() => {
  const baitClasses = [
    'adsbox pub_300x250',
    'advertisement banner',
    'ad-wrapper',
    'ad-container ad-banner',
    'adsbygoogle',
    'adslot',
    'ad-box',
    'ad-slot',
    'google_ads',
    'ad-div',
  ];
  let detected = false;
  for (const cls of baitClasses) {
    const el = document.createElement('div');
    el.className = cls;
    el.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px';
    document.body.appendChild(el);
    if (el.offsetHeight === 0 || el.offsetParent === null || el.offsetWidth === 0) {
      detected = true;
    }
    el.remove();
    if (detected) break;
  }
  const adScripts = [
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
    'https://www.googletagservices.com/activeview/js/current/osd.js',
  ];
  let networkOk = false;
  for (const url of adScripts) {
    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    s.onerror = () => {
      if (networkOk || navigator.onLine) window.__adblockDetected = true;
    };
    s.onload = () => {
      networkOk = true;
      if (url.includes('adsbygoogle') && typeof window.adsbygoogle === 'undefined') {
        window.__adblockDetected = true;
      }
    };
    document.head.appendChild(s);
  }
  return detected;
})();
const bootScreen = document.getElementById('boot-screen');
const bootOutput = document.getElementById('boot-output');
let __bootCompleteDispatched = false;

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
    if (window.__skipAnimation) {
      if (!__bootCompleteDispatched) { __bootCompleteDispatched = true; window.dispatchEvent(new CustomEvent('bootComplete')); }
      return;
    }
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
        if (window.__skipAnimation) {
          if (!__bootCompleteDispatched) { __bootCompleteDispatched = true; window.dispatchEvent(new CustomEvent('bootComplete')); }
          return;
        }
        bootOutput.innerHTML = '';
        bootOutput.style.height = 'auto';
        bootScreen.classList.add('boot-screen--centered');
        const msgs = [
          '> initializing AR3LYX1 portfolio...',
          '> system ready. welcome.',
        ];
        if (window.__adblockDetected) msgs.splice(1, 0, '> WARNING: Ad blocker detected — some components may not display correctly. Disable it for the best experience.');

        function typeInit(lineIdx, charIdx, cursorEl) {
          if (window.__skipAnimation) {
            if (!__bootCompleteDispatched) { __bootCompleteDispatched = true; window.dispatchEvent(new CustomEvent('bootComplete')); }
            return;
          }
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
                if (window.__skipAnimation) {
                  if (!__bootCompleteDispatched) { __bootCompleteDispatched = true; window.dispatchEvent(new CustomEvent('bootComplete')); }
                  return;
                }
                bootScreen.style.transition = 'opacity 0.3s ease';
                bootScreen.style.opacity = '0';
                setTimeout(() => {
                  if (window.__adblockDetected && window.innerWidth >= 768 && !document.getElementById('adblock-crt-warning')) {
                    const warn = document.createElement('div');
                    warn.id = 'adblock-crt-warning';
                    warn.innerHTML = '<div class="crt-scanlines"></div><div class="crt-warn-content"><span class="crt-warn-icon">⚠</span><p class="crt-warn-title">AD BLOCKER DETECTED</p><p class="crt-warn-text">This page uses a component which may be blocked<br>by an ad blocker. Disable it for the best experience.</p><div class="crt-warn-follow"><span class="crt-warn-follow-text">FOLLOW ME</span><div class="crt-warn-links"><a href="https://github.com/arelyX1" target="_blank" rel="noopener" class="crt-warn-btn">GITHUB</a><a href="https://www.linkedin.com/in/andry-caceres-439504331/" target="_blank" rel="noopener" class="crt-warn-btn">LINKEDIN</a></div></div><button class="crt-warn-dismiss" id="crt-warn-dismiss">&gt; DISMISS</button></div>';
                    document.body.appendChild(warn);
                  }
                }, 500);
                setTimeout(() => {
                  if (window.__skipAnimation) {
                    if (!__bootCompleteDispatched) { __bootCompleteDispatched = true; window.dispatchEvent(new CustomEvent('bootComplete')); }
                    return;
                  }
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

  document.addEventListener('click', function dismissWarn(e) {
    if (e.target.id === 'crt-warn-dismiss' || e.target.closest('#crt-warn-dismiss')) {
      const warn = document.getElementById('adblock-crt-warning');
      if (warn) {
        warn.style.transition = 'opacity 0.3s ease';
        warn.style.opacity = '0';
        setTimeout(() => warn.remove(), 350);
      }
    }
  });

  requestAnimationFrame(showBatch);
}
