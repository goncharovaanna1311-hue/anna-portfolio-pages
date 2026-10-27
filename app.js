const dialog = document.querySelector('#request-dialog');
const frame = document.querySelector('#inquiry-frame');
const formState = document.querySelector('#form-loading');
const formEndpoint = 'https://script.google.com/macros/s/AKfycby8WighbvojWtXMi9hz6z6rIYX7qYdt0IeV2iQJoUy00vS96GZE1WenIVXxfjqZDu7q/exec';
let trigger, initialized = false, loadingTimer;
frame.addEventListener('load', () => {
  clearTimeout(loadingTimer);
  formState.textContent = 'Если форма не появилась, откройте её по ссылке ниже или напишите на email.';
});
document.querySelectorAll('[data-request]').forEach(button => {
  button.addEventListener('click', () => {
    trigger = button;
    if (!initialized) {
      const url = new URL(formEndpoint);
      const services = {'Лендинг':'Лендинги','Чат-бот':'Чат-боты','Калькулятор':'Калькуляторы','Трекер':'Трекеры','Дашборд':'Дашборды'};
      if (button.dataset.service) url.searchParams.set('service', services[button.dataset.service] || '');
      frame.src = url.href;
      document.querySelector('#open-inquiry-form').href = url.href;
      initialized = true;
      formState.textContent = 'Загружаем форму…';
      loadingTimer = setTimeout(() => { formState.textContent = 'Форма загружается дольше обычного. Откройте её по ссылке ниже или напишите на email.'; }, 15000);
    }
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('modal-open');
  });
});
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); trigger?.focus(); });

const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Открыть меню');
  navigation.classList.remove('is-open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

// A quiet, pale version of the Matrix rain; no external assets or requests.
const canvas = document.querySelector('#matrix');
const ctx = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const alphabet = '01アイウエオカキクケコ234789';
let columns = [], width = 0, height = 0, lastFrame = 0;
let seed = 23;
const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
function resizeRain() {
  const bounds = canvas.parentElement.getBoundingClientRect();
  width = bounds.width; height = bounds.height;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = width * ratio; canvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  seed = 23;
  columns = Array.from({length: Math.ceil(width / 19)}, (_, i) => ({x: i * 19 + 5, y: random() * height, speed: 0.15 + random() * 0.3, alpha: random() * .22 + .05, length: 12 + Math.floor(random() * 30)}));
  drawRain(0);
}
function drawRain(step) {
  ctx.clearRect(0, 0, width, height);
  ctx.font = '10px Consolas, monospace';
  columns.forEach((column, index) => {
    column.y = (column.y + step * column.speed) % (height + column.length * 12);
    // Leave breathing room around the first-screen copy.
    const quiet = width > 760 && column.x > width * .06 && column.x < width * .5 ? .12 : 1;
    for (let j = 0; j < column.length; j++) {
      ctx.fillStyle = `rgba(36,145,255,${column.alpha * quiet * (1 - j / column.length)})`;
      ctx.fillText(alphabet[(index * 7 + j * 11) % alphabet.length], column.x, column.y - j * 12);
    }
  });
}
function animateRain(time) {
  if (time - lastFrame > 85) {
    if (!reducedMotion.matches && !document.hidden) drawRain(2);
    lastFrame = time;
  }
  requestAnimationFrame(animateRain);
}
window.addEventListener('resize', resizeRain);
resizeRain();
requestAnimationFrame(animateRain);


