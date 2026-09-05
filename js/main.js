import { loadData } from './dataLoader.js';
import { initParticles } from './particles.js';
import { initHiddenInput } from './hiddenInput.js';
import { initGayMode } from './gayMode.js';
import { startRoulette, initRouletteButton } from './roulette.js';
import { replaceItem, replaceItemWithoutCost } from './ui.js';
import { showModal, closeModal } from './ui.js';

window.addEventListener('load', () => {
  initParticles();
  initHiddenInput();
  initGayMode();
  initRouletteButton();

  document.getElementById('generateBtn').addEventListener('click', startRoulette);
  document.getElementById('result').addEventListener('click', e => {
    const btn = e.target.closest('.replace-item-btn');
    if (btn && !window.isRouletteActive) replaceItem(parseInt(btn.dataset.index));
  });

  // Модальное окно
  const modal = document.getElementById('replaceLimitModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  closeModalBtn.addEventListener('click', closeModal);
  window.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  loadData();
});