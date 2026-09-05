// main.js
import { loadData } from './dataLoader.js';
import { initParticles } from './particles.js';
import { initHiddenInput } from './hiddenInput.js';
import { initGayMode } from './gayMode.js';
import { initCursorGlow } from './cursorGlow.js';
import { startRoulette, initRouletteButton } from './roulette.js';
import { replaceItem, replaceItemWithoutCost, showModal, closeModal } from './ui.js';
import { renderBuildTabs } from './multiBuild.js';

// Инициализация всех модулей после загрузки DOM
window.addEventListener('load', () => {
  // Частицы
  initParticles();

  // Свечение курсора
  initCursorGlow();

  // Скрытый ввод (герой по ID, предмет по Alt)
  initHiddenInput();

  // GAY MODE (звуки, параллакс, контекстное меню)
  initGayMode();

  // Кнопка "ПОГНАЛИ" в рулетке
  initRouletteButton();

  // Кнопка "Сгенерировать билд"
  document.getElementById('generateBtn').addEventListener('click', startRoulette);

  // Обработчик кликов по кнопкам замены предметов
  document.getElementById('result').addEventListener('click', e => {
    const btn = e.target.closest('.replace-item-btn');
    if (btn && !window.isRouletteActive) {
      replaceItem(parseInt(btn.dataset.index));
    }
  });

  // Правая кнопка мыши на предмете — бесплатная замена (уже в gayMode, но на всякий случай)
  // Лучше оставить в gayMode, но можно и здесь, если нужно.
  // document.addEventListener('contextmenu', ...) уже есть в gayMode.js

  // Модальное окно
  const modal = document.getElementById('replaceLimitModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  closeModalBtn.addEventListener('click', closeModal);
  window.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // Первичная отрисовка вкладок билдов
  renderBuildTabs();

  // Загрузка данных
  loadData();
});