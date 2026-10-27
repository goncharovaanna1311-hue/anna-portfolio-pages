const dialog = document.querySelector('#request-dialog');
const form = document.querySelector('#request-form');
const status = document.querySelector('.form-status');
const fallback = document.querySelector('.copy-fallback');
const sendButton = document.querySelector('.send-button');
const copyButton = document.querySelector('.copy-button');
const notice = document.querySelector('#form-notice');
const contactNotice = document.querySelector('#contact-notice');
let sending = false;
let trigger;

function refreshInquiryAvailability() {
  sendButton.disabled = false;
  notice.textContent = 'Заполните форму, чтобы подготовить письмо на annay22_gav@mail.ru. Отправьте его в своём почтовом приложении или скопируйте текст заявки.';
  document.querySelector('.form-footnote').textContent = 'Письмо отправляется только после вашего подтверждения в почтовом приложении.';
}
refreshInquiryAvailability();

document.querySelectorAll('[data-request]').forEach(button => {
  button.addEventListener('click', () => {
    trigger = button;
    status.textContent = '';
    fallback.hidden = true;
    if (button.dataset.service && !form.elements.task.value.trim()) {
      form.elements.task.value = `Интересует ${button.dataset.service.toLowerCase()}. `;
    }
    dialog.showModal();
    document.body.classList.add('modal-open');
    if (!sending) refreshInquiryAvailability();
  });
});
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  trigger?.focus();
});
function getInquiry() {
  const name = form.elements.name.value.trim();
  const task = form.elements.task.value.trim();
  if (!name || !task) {
    status.textContent = 'Пожалуйста, укажите имя и опишите задачу.';
    (!name ? form.elements.name : form.elements.task).focus();
    return null;
  }
  return { name, email: form.elements.email.value.trim(), task };
}
copyButton.addEventListener('click', async () => {
  if (!form.reportValidity()) return;
  const data = getInquiry();
  if (!data) return;
  const text = `Заявка для Анны\nИмя: ${data.name}\nEmail: ${data.email}\n\nЗадача:\n${data.task}`;
  try {
    await navigator.clipboard.writeText(text);
    fallback.hidden = true;
    status.textContent = 'Текст заявки скопирован. Копирование не отправляет заявку.';
  } catch {
    document.querySelector('#copy-text').value = text;
    fallback.hidden = false;
    status.textContent = 'Автоматическое копирование недоступно. Скопируйте текст ниже. Заявка не отправлена.';
    document.querySelector('#copy-text').focus();
    document.querySelector('#copy-text').select();
  }
});
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = getInquiry();
  if (!data) return;
  const text = 'Заявка для Анны\nИмя: ' + data.name + '\nEmail: ' + data.email + '\n\nЗадача:\n' + data.task;
  const subject = encodeURIComponent('Заявка на разработку — ' + data.name);
  const body = encodeURIComponent(text);
  status.textContent = 'Подтвердите отправку в своём почтовом приложении. Если оно не открылось, скопируйте заявку и отправьте на annay22_gav@mail.ru. Данные остаются в форме.';
  window.location.href = 'mailto:annay22_gav@mail.ru?subject=' + subject + '&body=' + body;
});

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
