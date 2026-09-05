import { MAX_REPLACES, BOOTS_ITEM_KEYS } from './config.js';
import { getActiveBuild, updateLoadPreviousBuildButton, saveBuildsToStorage, loadPreviousBuildForActive } from './multiBuild.js';
import { getRandomBoot, getRandomRegularItem } from './buildGenerator.js';
import { shareBuild } from './share.js';

export function renderBuild(animate = false) {
  const build = getActiveBuild();
  if (!build) return;

  const { hero, items, buildOrder, talents } = build;
  const currentReplaceCount = build.replaceCount !== undefined ? build.replaceCount : 0;
  window.replaceCount = currentReplaceCount;

  let html = `
    <div class="hero-header">
      <img class="hero-img" src="${hero.img}" alt="${hero.name}">
      <span class="hero-name">${hero.name}</span>
      <button id="loadPreviousBuildBtn" class="hero-back-btn hidden">↩ Предыдущий билд</button>
    </div>
    <div class="section">
      <h3>Предметы <span class="replace-counter">(Осталось замен: ${MAX_REPLACES - currentReplaceCount})</span></h3>
      <div class="items-list" id="itemsList">`;

  items.forEach((item, index) => {
    const draggable = index === 0 ? '' : 'draggable="true"';
    html += `
      <span class="item" data-index="${index}" ${draggable}>
        <img class="item-img" src="${item.img}" alt="${item.name}">
        <span class="item-name">${item.name}</span>
        <button class="replace-item-btn" data-index="${index}" title="Заменить">↻</button>
      </span>`;
  });

  html += `</div></div>
    <div class="section"><h3>Порядок прокачки</h3><div class="build-order">`;

  buildOrder.forEach(entry => {
    const img = entry.img ? `<img class="skill-img" src="${entry.img}" alt="">` : '';
    html += `<div class="level-entry">${img} ⚔️ Ур.${entry.level}: ${entry.value}</div>`;
  });

  html += `</div></div>
    <div class="section"><h3>Таланты</h3><div class="talents-tree">`;

  [25,20,15,10].forEach(level => {
    const tl = hero.talents[level] || [];
    if (!tl.length) return;
    const left = tl[1] || '';
    const right = tl[0] || '';
    const selected = talents.find(t => t.level === level);
    const leftSel = left && selected?.value === left;
    const rightSel = right && selected?.value === right;
    html += `
      <div class="talent-level-row">
        <div class="talent-node left ${leftSel ? 'selected' : ''}">${left}</div>
        <div class="talent-center"><span class="talent-level-number">${level}</span></div>
        <div class="talent-node right ${rightSel ? 'selected' : ''}">${right}</div>
      </div>`;
  });

  html += `</div></div>`;

  html += `<div class="section" style="text-align: center;">
              <button id="shareBtn" class="hidden"><span class="share-text">🔗 Поделиться билдом</span></button>
           </div>`;

  const resultEl = document.getElementById('result');
  resultEl.innerHTML = html;

  if (animate) {
    resultEl.classList.remove('animate-in');
    void resultEl.offsetWidth;
    resultEl.classList.add('animate-in');
  }

  const shareBtn = document.getElementById('shareBtn');
  shareBtn.classList.remove('hidden');
  shareBtn.addEventListener('click', () => shareBuild('link'));
  shareBtn.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    shareBuild('text');
  });

  const loadPrevBtn = document.getElementById('loadPreviousBuildBtn');
  if (loadPrevBtn) {
    loadPrevBtn.addEventListener('click', loadPreviousBuildForActive);
    updateLoadPreviousBuildButton();
  }

  attachDragAndDropHandlers();
  updateLoadPreviousBuildButton();
}

export function replaceItem(index) {
  const build = getActiveBuild();
  if (!build || window.isRouletteActive) return;
  if (build.replaceCount >= MAX_REPLACES) { showModal(); return; }

  if (index === 0) {
    if (window.forcedItemKey && BOOTS_ITEM_KEYS.has(window.forcedItemKey)) {
      build.items[0] = window.bootsData.find(b => b.key === window.forcedItemKey);
      window.forcedItemKey = null;
    } else {
      build.items[0] = getRandomBoot(build.items[0].key);
    }
  } else {
    if (window.forcedItemKey && !BOOTS_ITEM_KEYS.has(window.forcedItemKey)) {
      build.items[index] = window.regularItemsData.find(i => i.key === window.forcedItemKey);
      window.forcedItemKey = null;
    } else {
      build.items[index] = getRandomRegularItem();
    }
  }
  build.replaceCount++;
  window.replaceCount = build.replaceCount;
  saveBuildsToStorage();
  renderBuild(false);
}

export function replaceItemWithoutCost(index) {
  const build = getActiveBuild();
  if (!build || window.isRouletteActive) return;
  if (index === 0) {
    if (window.forcedItemKey && BOOTS_ITEM_KEYS.has(window.forcedItemKey)) {
      build.items[0] = window.bootsData.find(b => b.key === window.forcedItemKey);
      window.forcedItemKey = null;
    } else {
      build.items[0] = getRandomBoot(build.items[0].key);
    }
  } else {
    if (window.forcedItemKey && !BOOTS_ITEM_KEYS.has(window.forcedItemKey)) {
      build.items[index] = window.regularItemsData.find(i => i.key === window.forcedItemKey);
      window.forcedItemKey = null;
    } else {
      build.items[index] = getRandomRegularItem();
    }
  }
  saveBuildsToStorage();
  renderBuild(false);
}

export function attachDragAndDropHandlers() {
  const list = document.getElementById('itemsList');
  if (!list) return;

  list.addEventListener('dragstart', e => {
    const item = e.target.closest('.item');
    if (!item || item.dataset.index === '0') { e.preventDefault(); return; }
    window.draggedItemIndex = parseInt(item.dataset.index);
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', window.draggedItemIndex);
  });

  list.addEventListener('dragend', e => {
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
    window.draggedItemIndex = null;
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    list.classList.remove('drag-over');
  });

  list.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const item = e.target.closest('.item');
    if (item && item.dataset.index !== '0') item.classList.add('drag-over');
    list.classList.add('drag-over');
  });

  list.addEventListener('dragleave', e => {
    const item = e.target.closest('.item');
    if (item) item.classList.remove('drag-over');
    list.classList.remove('drag-over');
  });

  list.addEventListener('drop', e => {
    e.preventDefault();
    const target = e.target.closest('.item');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    list.classList.remove('drag-over');
    if (!target || window.draggedItemIndex === null) return;
    const targetIndex = parseInt(target.dataset.index);
    if (targetIndex === 0 || targetIndex === window.draggedItemIndex) return;

    const build = getActiveBuild();
    const items = build.items;
    [items[window.draggedItemIndex], items[targetIndex]] = [items[targetIndex], items[window.draggedItemIndex]];
    saveBuildsToStorage();
    renderBuild(false);
  });
}

export function showModal() { document.getElementById('replaceLimitModal').classList.add('show'); }
export function closeModal() { document.getElementById('replaceLimitModal').classList.remove('show'); }