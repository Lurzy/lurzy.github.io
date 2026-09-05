import { MAX_BUILDS, MAX_REPLACES } from './config.js';
import { createBuildForHero, randomElement } from './buildGenerator.js';
import { renderBuild } from './ui.js';

export function getActiveBuild() {
  return window.builds[window.activeBuildIndex] || null;
}

export function setActiveBuildIndex(index) {
  if (index >= 0 && index < window.builds.length) {
    window.activeBuildIndex = index;
    localStorage.setItem('activeBuildIndex', index);
    const build = getActiveBuild();
    if (build) {
      window.replaceCount = build.replaceCount !== undefined ? build.replaceCount : 0;
    } else {
      window.replaceCount = 0;
    }
    renderBuildTabs();
    renderBuild(false);
  }
}

export function addBuild() {
  if (window.builds.length >= MAX_BUILDS) return;
  window.builds.push(null);
  window.previousBuilds.push(null);
  window.activeBuildIndex = window.builds.length - 1;
  localStorage.setItem('builds', JSON.stringify(window.builds));
  localStorage.setItem('previousBuilds', JSON.stringify(window.previousBuilds));
  localStorage.setItem('activeBuildIndex', window.activeBuildIndex);
  generateBuildForActiveSlot();
  renderBuildTabs(); // Добавлено для немедленного отображения
}

export function removeBuild(index) {
  if (window.builds.length <= 1) return;
  window.builds.splice(index, 1);
  window.previousBuilds.splice(index, 1);
  if (window.activeBuildIndex >= window.builds.length) window.activeBuildIndex = window.builds.length - 1;
  localStorage.setItem('builds', JSON.stringify(window.builds));
  localStorage.setItem('previousBuilds', JSON.stringify(window.previousBuilds));
  localStorage.setItem('activeBuildIndex', window.activeBuildIndex);
  const build = getActiveBuild();
  if (build) {
    window.replaceCount = build.replaceCount !== undefined ? build.replaceCount : 0;
  } else {
    window.replaceCount = 0;
  }
  renderBuildTabs();
  renderBuild(false);
}

export function renderBuildTabs() {
  const container = document.getElementById('buildsTabs');
  if (!container) return;
  container.innerHTML = '';
  window.builds.forEach((build, index) => {
    const dot = document.createElement('div');
    dot.className = 'build-dot' + (index === window.activeBuildIndex ? ' active' : '');
    if (build && build.hero) {
      const img = document.createElement('img');
      img.src = build.hero.img;
      img.alt = build.hero.name;
      dot.appendChild(img);
    } else {
      dot.textContent = '?';
    }
    dot.addEventListener('click', () => setActiveBuildIndex(index));
    dot.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      removeBuild(index);
    });
    container.appendChild(dot);
  });
  if (window.builds.length < MAX_BUILDS) {
    const addBtn = document.createElement('button');
    addBtn.className = 'build-dot-add';
    addBtn.textContent = '+';
    addBtn.addEventListener('click', addBuild);
    container.appendChild(addBtn);
  }
}

export function loadBuildsFromStorage() {
  try {
    const saved = localStorage.getItem('builds');
    if (saved) {
      window.builds = JSON.parse(saved);
      window.builds = window.builds.map(b => {
        if (b && b.hero && b.hero.name) {
          const hero = window.heroesData.find(h => h.name === b.hero.name);
          if (hero) b.hero = hero;
          else return null;
          if (b.replaceCount === undefined) b.replaceCount = 0;
        }
        return b;
      }).filter(b => b !== null);
    }
    const savedPrev = localStorage.getItem('previousBuilds');
    if (savedPrev) {
      window.previousBuilds = JSON.parse(savedPrev);
    }
    const savedIndex = localStorage.getItem('activeBuildIndex');
    if (savedIndex !== null) {
      window.activeBuildIndex = parseInt(savedIndex, 10);
      if (window.activeBuildIndex >= window.builds.length) window.activeBuildIndex = 0;
    }
  } catch (e) {
    console.warn('Ошибка загрузки билдов из localStorage:', e);
  }
}

export function saveBuildsToStorage() {
  try {
    localStorage.setItem('builds', JSON.stringify(window.builds));
    localStorage.setItem('previousBuilds', JSON.stringify(window.previousBuilds));
    localStorage.setItem('activeBuildIndex', window.activeBuildIndex);
  } catch (e) {
    console.warn('Не удалось сохранить билды:', e);
  }
}

export function generateBuildForActiveSlot() {
  if (!window.isDataLoaded) return;
  let hero;

  if (window.hiddenHeroId) {
    const id = parseInt(window.hiddenHeroId, 10);
    hero = window.heroesData.find(h => h.id === id);
    window.hiddenHeroId = '';
  }

  if (!hero) {
    hero = randomElement(window.heroesData);
  }

  const newBuild = createBuildForHero(hero);
  newBuild.replaceCount = 0;
  window.builds[window.activeBuildIndex] = newBuild;
  window.replaceCount = 0;
  saveBuildsToStorage();
  renderBuild(true);
  renderBuildTabs(); // Добавлено для обновления вкладок
}

export function savePreviousBuildForActive() {
  if (window.builds[window.activeBuildIndex]) {
    window.previousBuilds[window.activeBuildIndex] = window.builds[window.activeBuildIndex];
    saveBuildsToStorage();
  }
}

export function loadPreviousBuildForActive() {
  const prev = window.previousBuilds[window.activeBuildIndex];
  if (prev) {
    window.builds[window.activeBuildIndex] = prev;
    window.previousBuilds[window.activeBuildIndex] = null;
    window.replaceCount = prev.replaceCount || 0;
    saveBuildsToStorage();
    renderBuild(false);
    updateLoadPreviousBuildButton();
  }
}

export function updateLoadPreviousBuildButton() {
  const btn = document.getElementById('loadPreviousBuildBtn');
  if (!btn) return;
  if (window.previousBuilds[window.activeBuildIndex]) {
    btn.classList.remove('hidden');
  } else {
    btn.classList.add('hidden');
  }
}