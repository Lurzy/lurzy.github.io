import { GAY_ROULETTE_SOUND_FILE, ROULETTE_SOUND_FILE } from './config.js';
import { createBuildForHero, randomElement } from './buildGenerator.js';
import { savePreviousBuildForActive, saveBuildsToStorage } from './multiBuild.js';
import { renderBuild } from './ui.js';
import { renderBuildTabs } from './multiBuild.js';

export function startRoulette() {
  if (!window.isDataLoaded || window.isRouletteActive) return;

  // Сохраняем предыдущий билд для активного слота
  savePreviousBuildForActive();

  window.isRouletteActive = true;
  window.replaceCount = 0;
  closeModal();

  let targetHero;

  if (window.hiddenHeroId) {
    const id = parseInt(window.hiddenHeroId, 10);
    targetHero = window.heroesData.find(h => h.id === id);
    window.hiddenHeroId = '';
  }

  if (!targetHero) {
    targetHero = randomElement(window.heroesData);
  }

  const newBuild = createBuildForHero(targetHero);
  newBuild.replaceCount = 0;

  const overlay = document.getElementById('rouletteOverlay');
  overlay.classList.add('active');
  document.getElementById('startBuildBtn').classList.add('hidden');
  document.getElementById('casinoBg').classList.add('show');
  const grid = document.getElementById('slotGrid');
  grid.classList.remove('merged');

  const cells = document.querySelectorAll('.slot-cell');
  cells.forEach((cell, i) => {
    cell.classList.remove('visible');
    setTimeout(() => cell.classList.add('visible'), i * 50);
  });

  const tracks = [];
  for (let i = 0; i < 9; i++) tracks.push(document.getElementById(`track${i}`));
  tracks.forEach(track => track.innerHTML = '');

  const firstCell = document.querySelector('.slot-cell');
  const itemHeight = firstCell ? firstCell.offsetHeight : 150;

  for (let col = 0; col < 3; col++) {
    const shuffled = [...window.heroesData].sort(() => Math.random() - 0.5);
    const prefix = shuffled.slice(0, 20);
    const suffix = shuffled.slice(20, 39);
    const sequence = [...prefix, targetHero, ...suffix];
    const targetIndex = prefix.length;

    for (let row = 0; row < 3; row++) {
      const trackIndex = row * 3 + col;
      const track = tracks[trackIndex];
      sequence.forEach(hero => {
        const div = document.createElement('div');
        div.className = 'slot-item';
        const img = document.createElement('img');
        img.src = hero.img;
        img.alt = hero.name;
        div.appendChild(img);
        track.appendChild(div);
      });

      track.style.transition = 'none';
      track.style.transform = 'translateY(0)';
      track.getBoundingClientRect();
      track.style.transition = `transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)`;
      track.style.transform = `translateY(-${targetIndex * itemHeight}px)`;
    }
  }

  try {
    if (window.rouletteAudio) { window.rouletteAudio.pause(); window.rouletteAudio = null; }
    const soundFile = window.isGayMode ? GAY_ROULETTE_SOUND_FILE : ROULETTE_SOUND_FILE;
    window.rouletteAudio = new Audio(soundFile);
    window.rouletteAudio.loop = true;
    window.rouletteAudio.volume = 0.2;
    window.rouletteAudio.play()
      .then(() => console.log('Звук запущен'))
      .catch(e => console.warn('Звук не воспроизведён:', e.message));
  } catch (e) {
    console.warn('Ошибка создания аудио:', e.message);
  }

  setTimeout(() => {
    if (window.rouletteAudio) { window.rouletteAudio.pause(); window.rouletteAudio.currentTime = 0; window.rouletteAudio = null; }
    document.getElementById('casinoBg').classList.remove('show');
    grid.classList.add('merged');
    document.getElementById('startBuildBtn').classList.remove('hidden');
    createConfetti();
    window.builds[window.activeBuildIndex] = newBuild;
    saveBuildsToStorage();
    renderBuildTabs(); // Обновляем вкладки после рулетки
  }, 5000);
}

export function initRouletteButton() {
  document.getElementById('startBuildBtn').addEventListener('click', function() {
    document.getElementById('rouletteOverlay').classList.remove('active');
    document.getElementById('slotGrid').classList.remove('merged');
    document.querySelectorAll('.slot-cell').forEach(cell => {
      cell.style.width = '';
      cell.style.height = '';
    });
    if (window.rouletteAudio) { window.rouletteAudio.pause(); window.rouletteAudio.currentTime = 0; window.rouletteAudio = null; }
    document.getElementById('casinoBg').classList.remove('show');
    renderBuild(true);
    renderBuildTabs(); // Обновляем вкладки после показа билда
    window.isRouletteActive = false;
  });
}

function createConfetti() {
  const colors = ['#ff00cc', '#3333ff', '#00ffff', '#ff9900', '#ff0066', '#00ff99'];
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = Math.random() * -20 + 'vh';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 1 + 1) + 's';
    confetti.style.width = (Math.random() * 6 + 6) + 'px';
    confetti.style.height = (Math.random() * 6 + 6) + 'px';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 2000);
  }
}

export function closeModal() { document.getElementById('replaceLimitModal').classList.remove('show'); }