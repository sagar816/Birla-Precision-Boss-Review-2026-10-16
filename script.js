/* Scroll scenes use native sticky positioning and one requestAnimationFrame loop. */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a, b, p) => a + (b - a) * p;
const ease = p => p * p * (3 - 2 * p);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let dirty = true, metrics = {}, lastSector = -1, sectorManual = false, toastTimer;
const hero = $('.hero-scroll'), about = $('.about-scroll'), division = $('.division-scroll'), industry = $('.industry-scroll');
function progress(el) { return clamp(-el.getBoundingClientRect().top / (el.offsetHeight - innerHeight)); }
function measure() {
    const containerWidth = $('.hero-copy').parentElement.clientWidth;
    const heroScale = Math.min(1, (containerWidth - 64) / 1200, Math.max(480, innerHeight - 90) / 650);
    $('.hero-stage').style.setProperty('--hero-scale', heroScale);
    const contact = $('.contact'), form = $('#enquiry');
    contact.style.setProperty('--contact-split', (form.getBoundingClientRect().left - contact.getBoundingClientRect().left + 40) + 'px');
    const m = $('.hero-media'); m.style.cssText = '';
    if (innerWidth > 760) {
        const first = $('.hero-first').getBoundingClientRect();
        const last = $('.hero-last').getBoundingClientRect();
        const stage = $('.hero-stage').getBoundingClientRect();
        m.style.top = ((first.bottom + last.top - m.offsetHeight) / 2 - stage.top) + 'px';
    }
    metrics.hero = { left: m.offsetLeft, top: m.offsetTop, width: m.offsetWidth, height: m.offsetHeight };
    const large = $('.heritage-large'), target = $('.year-target'); large.style.transform = 'none';
    const lr = large.getBoundingClientRect(), tr = target.getBoundingClientRect();
    metrics.year = { x: tr.left - lr.left, y: tr.top - lr.top, scale: tr.width / lr.width };
    dirty = true;
}
function selectSector(index) { lastSector = index; $$('.industry-images img').forEach((img, i) => img.classList.toggle('active', i === index)); $$('[data-sector]').forEach((tab, i) => { tab.setAttribute('aria-selected', i === index); tab.tabIndex = i === index ? 0 : -1; }); }
const processTrack = $('.tool-track'), processTool = $('.moving-tool');
let toolAngle = 0, toolTarget = 0, toolFrameTime = 0;
function animate(now = performance.now()) {
    const frameDelta = Math.min(64, Math.max(0, now - (toolFrameTime || now)));
    toolFrameTime = now;
    if (dirty) {
        dirty = false;
        if (processTrack && !reduced.matches) {
            const rect = processTrack.getBoundingClientRect();
            toolTarget = clamp((innerHeight * .7 - rect.top) / Math.max(1, rect.height)) * 360;
        }
        if (!reduced.matches) {
            const hp = ease(clamp(progress(hero) * 1.35)), m = $('.hero-media'), base = metrics.hero;
            if (base) { m.style.left = mix(base.left, 0, hp) + 'px'; m.style.top = mix(base.top, 0, hp) + 'px'; m.style.width = mix(base.width, innerWidth, hp) + 'px'; m.style.height = mix(base.height, innerHeight, hp) + 'px'; $('.hero-copy').style.opacity = 1 - clamp(hp * 2); $('.hero-lines').style.opacity = 1 - hp; $('.video-caption').style.opacity = clamp((hp - .6) * 3); }
            const ap = ease(clamp(progress(about) * 1.25)), y = metrics.year;
            if (y) { $('.heritage-large').style.transform = `translate(${y.x * ap}px,${y.y * ap}px) scale(${mix(1, y.scale, ap)})`; $('.heritage-large').style.color = `rgba(23,23,23,${ap})`; $('.heritage-large').style.webkitTextStrokeColor = `rgba(180,175,170,${1 - ap})`; $('.heritage-large').style.opacity = ap > .99 ? 0 : 1; $('.year-target').style.opacity = ap > .99 ? 1 : 0; }
            if (innerWidth > 760) {
                // Hold the section in place while the stack opens over a short scroll.
                const dp = clamp((90 - division.getBoundingClientRect().top) / 140); const pitch = ($('.card-arena').clientWidth + 16) / 5; const positions = [[-2 * pitch, 0], [-pitch, 0], [0, 0], [pitch, 0], [2 * pitch, 0]];
                $$('.product-card').forEach((card, i) => { let p = ease(clamp((dp - i * .02) / .92)); let x = mix((i - 2) * 10, positions[i][0], p), y = mix(Math.abs(i - 2) * 4, positions[i][1], p); let rotation = mix((i - 2) * -2, 0, p); let scale = mix(1, 1, p); card.style.transform = `translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) rotate(${rotation}deg) scale(${scale})`; card.style.zIndex = 5 - Math.abs(i - 2); }); $('.orbit').style.opacity = ease(clamp((dp - .25) * 2)); $('.orbit-logo').style.opacity = ease(clamp((dp - .45) * 3));
            }


        }
    }
    if (processTool && !reduced.matches && Math.abs(toolTarget - toolAngle) > .01) {
        toolAngle += (toolTarget - toolAngle) * (1 - Math.exp(-frameDelta / 160));
        if (window.renderProcessDrill) window.renderProcessDrill(toolAngle);
    }
    requestAnimationFrame(animate);
}
addEventListener('scroll', () => { dirty = true; sectorManual = false; }, { passive: true }); addEventListener('resize', measure); document.fonts.ready.then(measure); addEventListener('load', measure); reduced.addEventListener('change', () => location.reload()); measure(); requestAnimationFrame(animate);
$$('[data-sector]').forEach((button, i) => { button.addEventListener('click', () => { sectorManual = true; selectSector(i) }); button.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) { e.preventDefault(); const next = (i + (['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : 4)) % 5; sectorManual = true; selectSector(next); $$('[data-sector]')[next].focus(); } }); });
$('.menu-toggle').addEventListener('click', () => { const open = $('header nav').classList.toggle('open'); $('.menu-toggle').setAttribute('aria-expanded', open); $('.menu-toggle').setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }); $$('header nav a').forEach(a => a.addEventListener('click', () => { $('header nav').classList.remove('open'); $('.menu-toggle').setAttribute('aria-expanded', 'false'); }));
const languageButton = $('#language-button'), languageOptions = $('#language-options'); languageButton.addEventListener('click', () => { languageOptions.hidden = !languageOptions.hidden; languageButton.setAttribute('aria-expanded', !languageOptions.hidden); });
function toast(message) { $('.toast').textContent = message; $('.toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('.toast').classList.remove('show'), 3500); }
$$('[data-lang]').forEach(b => b.addEventListener('click', () => { languageOptions.hidden = true; languageButton.setAttribute('aria-expanded', 'false'); toast(b.dataset.lang === 'English' ? 'You are viewing the English website.' : b.dataset.lang + ' is a planned language option. This preview remains in English.'); }));
document.addEventListener('click', e => { if (!e.target.closest('.language')) { languageOptions.hidden = true; languageButton.setAttribute('aria-expanded', 'false'); } }); document.addEventListener('keydown', e => { if (e.key === 'Escape') { languageOptions.hidden = true; languageButton.setAttribute('aria-expanded', 'false'); } });
const video = $('video'); if (reduced.matches) video.pause();
$('.marquee-toggle').addEventListener('click', () => { const paused = $('.marquee').classList.toggle('paused'); $('.marquee-toggle').textContent = paused ? '▶' : 'Ⅱ'; $('.marquee-toggle').setAttribute('aria-label', paused ? 'Play scrolling text' : 'Pause scrolling text'); });
$('#enquiry').addEventListener('submit', e => { e.preventDefault(); const data = new FormData(e.currentTarget); const body = `Name: ${data.get('name')}\nCompany: ${data.get('company')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone')}\nDivision: ${data.get('division')}\n\nRequirement:\n${data.get('requirement')}`; location.href = 'mailto:info@birlaprecision.com?subject=' + encodeURIComponent('Website enquiry — ' + data.get('division')) + '&body=' + encodeURIComponent(body); $('#form-status').textContent = 'Your email draft is ready to open. Please send it from your email app. If no app opens, email info@birlaprecision.com.'; }); $('#year').textContent = new Date().getFullYear();

// The source footer has no published destinations for these three entries.
document.querySelectorAll("[data-footer-note]").forEach(b => b.addEventListener("click", () => toast(b.dataset.footerNote)));

$$('[data-sector]').forEach((button, i) => { button.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') selectSector(i); }); button.addEventListener('focus', () => selectSector(i)); });

// Count each mission statistic once when it enters the viewport.
const statsBlock = $('.stats');
if (statsBlock && !reduced.matches) {
 const counters = $$('[data-count]', statsBlock);
 counters.forEach(el => { el.textContent = '0' + el.dataset.suffix; });
 const observer = new IntersectionObserver(entries => {
  if (!entries.some(entry => entry.isIntersecting)) return;
  observer.disconnect();
  const start = performance.now(), duration = 1800;
  function count(now) {
   const p = clamp((now - start) / duration), eased = 1 - Math.pow(1-p, 3);
   counters.forEach(el => { el.textContent = Math.round(Number(el.dataset.count)*eased) + el.dataset.suffix; });
   if(p < 1) requestAnimationFrame(count);
  }
  requestAnimationFrame(count);
 }, {threshold:.35});
 observer.observe(statsBlock);
}
