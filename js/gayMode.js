import { replaceItemWithoutCost } from './ui.js';

export function initGayMode() {
  const gayModeToggle = document.getElementById('gayModeToggle');

  gayModeToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    window.isGayMode = !window.isGayMode;
    document.body.classList.toggle('gay-mode', window.isGayMode);
    this.classList.toggle('active', window.isGayMode);

    // Меняем цвет частиц
    if (window.isGayMode) {
      window.particlesColor = { r: 255, g: 0, b: 204 }; // розовый
    } else {
      window.particlesColor = { r: 192, g: 132, b: 252 }; // фиолетовый
    }

    if (window.hoverAudio) {
      window.hoverAudio.pause();
      window.hoverAudio.currentTime = 0;
      window.hoverAudio = null;
    }
  });

  // Клик в GAY MODE
  document.addEventListener('click', function(e) {
    if (window.isGayMode) {
      try {
        if (window.gayAudio) {
          window.gayAudio.pause();
          window.gayAudio = null;
        }
        window.gayAudio = new Audio('gay.mp3');
        window.gayAudio.volume = 0.5;
        window.gayAudio.play().catch(err => console.warn('Не удалось воспроизвести gay.mp3:', err));
      } catch (err) {
        console.warn('Ошибка воспроизведения gay.mp3:', err);
      }
    }
  });

  // Наведение на кнопку "Сгенерировать билд"
  const generateBtn = document.getElementById('generateBtn');

  generateBtn.addEventListener('mouseenter', function() {
    if (window.isGayMode) {
      try {
        if (window.hoverAudio) {
          window.hoverAudio.pause();
          window.hoverAudio = null;
        }
        window.hoverAudio = new Audio('click.mp3');
        window.hoverAudio.loop = true;
        window.hoverAudio.volume = 0.5;
        window.hoverAudio.play().catch(err => console.warn('Не удалось воспроизвести click.mp3:', err));
      } catch (err) {
        console.warn('Ошибка воспроизведения click.mp3:', err);
      }
    }
  });

  generateBtn.addEventListener('mouseleave', function() {
    if (window.hoverAudio) {
      window.hoverAudio.pause();
      window.hoverAudio.currentTime = 0;
      window.hoverAudio = null;
    }
  });

  // Параллакс
  document.addEventListener('mousemove', function(e) {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    window.parallaxX = x * 10;
    window.parallaxY = y * 10;
    document.documentElement.style.setProperty('--parallax-x', `${window.parallaxX}px`);
    document.documentElement.style.setProperty('--parallax-y', `${window.parallaxY}px`);
  });

  // Контекстное меню для бесплатной замены
  document.addEventListener('contextmenu', function(e) {
    const itemEl = e.target.closest('.item');
    if (itemEl && !window.isRouletteActive) {
      e.preventDefault();
      const index = parseInt(itemEl.dataset.index);
      replaceItemWithoutCost(index);
    }
  });
}