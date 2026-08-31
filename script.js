const heroesUrl = 'https://cdn.jsdelivr.net/gh/odota/dotaconstants/build/heroes.json';
const abilitiesUrl = 'https://cdn.jsdelivr.net/gh/odota/dotaconstants/build/abilities.json';
const heroAbilitiesUrl = 'https://cdn.jsdelivr.net/gh/odota/dotaconstants/build/hero_abilities.json';
const itemsUrl = 'https://cdn.jsdelivr.net/gh/odota/dotaconstants/build/items.json';

const CDN_BASE = 'https://cdn.cloudflare.steamstatic.com';
const ROULETTE_SOUND_FILE = 'roulette_sound.mp3';
const GAY_ROULETTE_SOUND_FILE = 'sergey.mp3';
const GAY_HOVER_SOUND_FILE = 'click.mp3';

const ALLOWED_ITEM_KEYS = new Set([
  'soul_ring', 'orb_of_corrosion', 'falcon_blade', 'power_treads', 'phase_boots', 'travel_boots',
  'mask_of_madness', 'hand_of_midas', 'helm_of_the_dominator', 'moon_shard', 'helm_of_the_overlord', 'travel_boots_2',
  'urn_of_shadows', 'tranquil_boots', 'pavise', 'arcane_boots', 'drum', 'mekansm', 'vladmir', 'spirit_vessel',
  'pipe', 'guardian_greaves', 'crimson_guard', 'boots_of_bearing', 'holy_locket', 'solar_crest',
  'veil_of_discord', 'glimmer_cape', 'force_staff', 'aether_lens', 'witch_blade', 'cyclone', 'rod_of_atos',
  'orchid', 'ultimate_scepter', 'nullifier', 'kaya', 'ethereal_blade', 'dagon', 'kaya_and_yasha', 'sange_and_kaya',
  'bloodstone', 'refresher', 'sheepstick', 'octarine_core', 'wind_waker', 'specialists_array',
  'vanguard', 'blade_mail', 'mage_slayer', 'soul_booster', 'lotus_orb', 'black_king_bar',
  'hurricane_pike', 'sphere', 'aeon_disk', 'shivas_guard', 'manta', 'heart', 'assault', 'bloodthorn',
  'crystalys', 'meteor_hammer', 'armlet', 'basher', 'shadow_blade', 'bfury', 'monkey_king_bar', 'maelstrom',
  'diffusal_blade', 'desolator', 'heavens_halberd', 'sange', 'yasha', 'sange_and_yasha', 'echo_sabre',
  'silver_edge', 'radiance', 'abyssal_blade', 'disperser', 'greater_crit',
  'dragon_lance', 'kaya_and_sange', 'harpoon', 'satanic', 'khanda', 'mjollnir', 'skadi', 'butterfly',
  'rapier', 'parasma', 'overwhelming_blink', 'swift_blink', 'arcane_blink', 'hydras_breath', 'blink',
  'boots',
  'aghanims_shard'
]);

const BOOTS_ITEM_KEYS = new Set([
  'arcane_boots', 'travel_boots', 'travel_boots_2', 'boots', 'boots_of_bearing', 'tranquil_boots', 'phase_boots', 'power_treads', 'guardian_greaves'
]);

let rouletteAudio = null;
let gayAudio = null;
let hoverAudio = null;
let heroesData = [];
let bootsData = [];
let regularItemsData = [];
let isDataLoaded = false;

let currentBuild = null;
let replaceCount = 0;
const MAX_REPLACES = 10;
let isRouletteActive = false;
let draggedItemIndex = null;
let isShareAnimating = false;

let recentRegularItems = []; // очередь последних 5 обычных предметов

const urlParams = new URLSearchParams(window.location.search);
let sharedBuild = null;

let isGayMode = false;
let parallaxX = 0;
let parallaxY = 0;

async function loadData() {
  try {
    const [heroesRes, abilitiesRes, itemsRes] = await Promise.all([
      fetch(heroesUrl), fetch(abilitiesUrl), fetch(itemsUrl)
    ]);
    if (!heroesRes.ok || !abilitiesRes.ok || !itemsRes.ok) throw new Error('Основные данные не загрузились');

    const heroesObj = await heroesRes.json();
    const heroes = Array.isArray(heroesObj) ? heroesObj : Object.values(heroesObj);
    const abilities = await abilitiesRes.json();
    const items = await itemsRes.json();

    let heroAbilities = null;
    try {
      const res = await fetch(heroAbilitiesUrl);
      if (res.ok) heroAbilities = await res.json();
      else console.warn('hero_abilities.json недоступен, используется fallback');
    } catch (e) { console.warn('hero_abilities.json ошибка', e); }

    heroesData = heroes.map(hero => {
      const heroName = hero.name;
      let skills = [], talents = {};

      if (heroAbilities && heroAbilities[heroName]) {
        const abilitiesList = heroAbilities[heroName].abilities || [];
        const talentsData = heroAbilities[heroName].talents || [];
        const genericIndex = abilitiesList.findIndex(n => n.includes('generic_hidden'));
        let normals = [], ultName = null;

        if (genericIndex !== -1) {
          normals = abilitiesList.slice(0, genericIndex).filter(n => !n.includes('generic'));
          const after = abilitiesList.slice(genericIndex + 1).filter(n => !n.includes('generic'));
          if (after.length) ultName = after[after.length - 1];
        } else {
          const all = abilitiesList.filter(n => !n.includes('generic'));
          if (all.length) { ultName = all[all.length - 1]; normals = all.slice(0, -1); }
        }

        normals.forEach(name => {
          const ab = abilities[name];
          if (!ab) return;
          skills.push({ name: ab.dname || name, maxLevel: ab.max_level || 4, isUltimate: false, img: ab.img ? CDN_BASE + ab.img : null, key: name });
        });
        if (ultName) {
          const ab = abilities[ultName];
          if (ab) skills.push({ name: ab.dname || ultName, maxLevel: ab.max_level || 3, isUltimate: true, img: ab.img ? CDN_BASE + ab.img : null, key: ultName });
        }

        talentsData.forEach(t => {
          const level = 10 + (t.level - 1) * 5;
          const ab = abilities[t.name];
          const name = ab && ab.dname ? ab.dname : t.name;
          if (!talents[level]) talents[level] = [];
          talents[level].push(name);
        });
      } else {
        // fallback
        const short = heroName.replace('npc_dota_hero_', '');
        const prefix = short + '_';
        const keys = Object.keys(abilities);
        const heroKeys = keys.filter(k => k.startsWith(prefix));
        const nonGeneric = heroKeys.filter(k => !k.includes('generic'));
        let ultName = null;
        if (nonGeneric.length) { ultName = nonGeneric[nonGeneric.length - 1]; }
        const normals = nonGeneric.filter(k => k !== ultName);
        normals.forEach(name => {
          const ab = abilities[name];
          if (!ab) return;
          skills.push({ name: ab.dname || name, maxLevel: ab.max_level || 4, isUltimate: false, img: ab.img ? CDN_BASE + ab.img : null, key: name });
        });
        if (ultName) {
          const ab = abilities[ultName];
          if (ab) skills.push({ name: ab.dname || ultName, maxLevel: ab.max_level || 3, isUltimate: true, img: ab.img ? CDN_BASE + ab.img : null, key: ultName });
        }

        const talentKeys = heroKeys.filter(k => k.startsWith('special_bonus_'));
        talentKeys.sort((a,b) => keys.indexOf(a) - keys.indexOf(b));
        const levels = [10,15,20,25];
        for (let i=0; i<talentKeys.length && i/2<levels.length; i+=2) {
          const lvl = levels[i/2];
          const pair = talentKeys.slice(i, i+2).map(k => abilities[k]?.dname || k);
          if (!talents[lvl]) talents[lvl] = [];
          talents[lvl].push(...pair);
        }
      }

      if (!skills.length) { console.warn(`Герой ${hero.name} без скиллов`); return null; }
      const ultIndex = skills.findIndex(s => s.isUltimate);
      if (ultIndex === -1) skills[skills.length - 1].isUltimate = true;

      return { id: hero.id, name: hero.localized_name || hero.name, img: CDN_BASE + hero.img, skills, ultimateIndex: ultIndex, talents };
    }).filter(h => h);

    const allItems = Object.entries(items)
      .filter(([k, it]) => ALLOWED_ITEM_KEYS.has(k.replace(/^item_/, '')) && it.dname && it.img)
      .map(([k, it]) => ({ key: k.replace(/^item_/, ''), name: it.dname, img: CDN_BASE + it.img }));

    bootsData = allItems.filter(i => BOOTS_ITEM_KEYS.has(i.key));
    regularItemsData = allItems.filter(i => !BOOTS_ITEM_KEYS.has(i.key));

    isDataLoaded = true;
    document.getElementById('generateBtn').disabled = false;
    document.getElementById('generateBtn').textContent = 'Сгенерировать билд';
    document.getElementById('status').textContent = `Героев: ${heroesData.length}, предметов: ${regularItemsData.length}, ботинок: ${bootsData.length}`;
    console.log(`Загружено героев: ${heroesData.length}, обычных предметов: ${regularItemsData.length}, ботинок: ${bootsData.length}`);

    // Проверяем, есть ли build в URL
    const buildParam = urlParams.get('build');
    if (buildParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(buildParam))));
        const hero = heroesData.find(h => h.name === decoded.heroName);
        if (hero) {
          currentBuild = { hero, items: decoded.items, buildOrder: decoded.buildOrder, talents: decoded.talents };
          replaceCount = 0;
          renderBuild();
        }
      } catch (e) {
        console.warn('Не удалось восстановить билд из URL:', e);
        generateBuildForRandomHero();
      }
    } else {
      generateBuildForRandomHero();
    }
  } catch (e) {
    console.error(e);
    document.getElementById('status').textContent = `Ошибка: ${e.message}`;
  }
}

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomElement(arr) { return arr[randomInt(0, arr.length - 1)]; }

// Выбор случайного ботинка, с возможным исключением
function getRandomBoot(excludeKey = null) {
  let available = bootsData;
  if (excludeKey) {
    available = bootsData.filter(b => b.key !== excludeKey);
    if (available.length === 0) available = bootsData;
  }
  return randomElement(available);
}

// Выбор случайного обычного предмета с учётом запрета повторов (5 роллов)
function getRandomRegularItem() {
  let available = regularItemsData.filter(item => !recentRegularItems.includes(item.key));
  if (available.length === 0) {
    available = regularItemsData.slice();
  }
  const item = randomElement(available);
  recentRegularItems.push(item.key);
  if (recentRegularItems.length > 5) {
    recentRegularItems.shift();
  }
  return item;
}

function getNormalSkillMax(level) { return Math.ceil(level / 2); }
function getUltimateLimit(level) {
  if (level < 6) return 0;
  if (level < 12) return 1;
  if (level < 18) return 2;
  return 3;
}

function generateBuild(hero) {
  const order = [], talents = [];
  const skillCounts = hero.skills.map(() => 0);
  const talentLevels = [10, 15, 20, 25];
  let ultCount = 0, pendingPoints = 0;

  for (let level = 1; level <= 25; level++) {
    if (talentLevels.includes(level)) {
      const tl = hero.talents[level];
      if (tl && tl.length) talents.push({ level, value: randomElement(tl) });
      continue;
    }

    pendingPoints++;
    const ultLimit = getUltimateLimit(level);
    const ultMax = hero.skills.find(s => s.isUltimate)?.maxLevel || 3;
    const canTakeUlt = ultCount < Math.min(ultLimit, ultMax);

    const available = [];
    hero.skills.forEach((skill, idx) => {
      if (skillCounts[idx] >= skill.maxLevel) return;
      if (skill.isUltimate) {
        if (canTakeUlt) available.push({ skill, idx });
      } else {
        if (skillCounts[idx] < getNormalSkillMax(level)) available.push({ skill, idx });
      }
    });

    if (available.length && pendingPoints > 0) {
      const chosen = randomElement(available);
      skillCounts[chosen.idx]++;
      if (chosen.skill.isUltimate) ultCount++;
      pendingPoints--;
      order.push({ level, type: 'skill', value: chosen.skill.name, img: chosen.skill.img });
    }
  }
  return { order, talents };
}

function buildItems() {
  const boots = getRandomBoot(); // без исключения
  const regulars = [];
  for (let i = 0; i < 5; i++) {
    regulars.push(getRandomRegularItem());
  }
  return [boots, ...regulars];
}

function createBuildForHero(hero) {
  // Сброс истории недавних предметов при новом билде
  recentRegularItems = [];
  const { order, talents } = generateBuild(hero);
  return { hero, items: buildItems(), buildOrder: order, talents };
}

function generateBuildForRandomHero() {
  if (!isDataLoaded) return;
  const hero = randomElement(heroesData);
  currentBuild = createBuildForHero(hero);
  replaceCount = 0;
  closeModal();
  renderBuild();
}

function replaceItem(index) {
  if (!currentBuild || isRouletteActive) return;
  if (replaceCount >= MAX_REPLACES) { showModal(); return; }

  if (index === 0) {
    currentBuild.items[0] = getRandomBoot(currentBuild.items[0].key);
  } else {
    currentBuild.items[index] = getRandomRegularItem();
  }
  replaceCount++;
  renderBuild();
}

// Замена без траты лимита (правая кнопка мыши)
function replaceItemWithoutCost(index) {
  if (!currentBuild || isRouletteActive) return;
  if (index === 0) {
    currentBuild.items[0] = getRandomBoot(currentBuild.items[0].key);
  } else {
    currentBuild.items[index] = getRandomRegularItem();
  }
  renderBuild();
}

function renderBuild() {
  if (!currentBuild) return;
  const { hero, items, buildOrder, talents } = currentBuild;

  let html = `
    <div class="hero-header">
      <img class="hero-img" src="${hero.img}" alt="${hero.name}">
      <span class="hero-name">${hero.name}</span>
    </div>
    <div class="section">
      <h3>Предметы <span class="replace-counter">(Осталось замен: ${MAX_REPLACES - replaceCount})</span></h3>
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

  // Кнопка "Поделиться" под талантами, по центру
  html += `<div class="section" style="text-align: center;">
              <button id="shareBtn" class="hidden"><span class="share-text">🔗 Поделиться билдом</span></button>
           </div>`;

  document.getElementById('result').innerHTML = html;
  const shareBtn = document.getElementById('shareBtn');
  shareBtn.classList.remove('hidden');
  shareBtn.addEventListener('click', shareBuild);
  attachDragAndDropHandlers();
}

function attachDragAndDropHandlers() {
  const list = document.getElementById('itemsList');
  if (!list) return;

  list.addEventListener('dragstart', e => {
    const item = e.target.closest('.item');
    if (!item || item.dataset.index === '0') { e.preventDefault(); return; }
    draggedItemIndex = parseInt(item.dataset.index);
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedItemIndex);
  });

  list.addEventListener('dragend', e => {
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
    draggedItemIndex = null;
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
    if (!target || draggedItemIndex === null) return;
    const targetIndex = parseInt(target.dataset.index);
    if (targetIndex === 0 || targetIndex === draggedItemIndex) return;

    const items = currentBuild.items;
    [items[draggedItemIndex], items[targetIndex]] = [items[targetIndex], items[draggedItemIndex]];
    renderBuild();
  });
}

function shareBuild() {
  if (!currentBuild || isShareAnimating) return;

  const btn = document.getElementById('shareBtn');
  const textSpan = btn.querySelector('.share-text');
  const originalText = textSpan ? textSpan.textContent : btn.textContent;

  isShareAnimating = true;

  const data = {
    heroName: currentBuild.hero.name,
    items: currentBuild.items,
    buildOrder: currentBuild.buildOrder,
    talents: currentBuild.talents
  };

  const json = JSON.stringify(data);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  const url = `${window.location.origin}${window.location.pathname}?build=${encoded}`;

  navigator.clipboard.writeText(url).then(() => {
    btn.classList.add('copied');
    textSpan.classList.add('hidden');

    setTimeout(() => {
      textSpan.textContent = '✅ Ссылка скопирована';
      textSpan.classList.remove('hidden');
    }, 1500);

    setTimeout(() => {
      btn.classList.remove('copied');
      textSpan.classList.add('hidden');
    }, 4500);

    setTimeout(() => {
      textSpan.textContent = originalText;
      textSpan.classList.remove('hidden');
      isShareAnimating = false;
    }, 6000);
  }).catch(() => {
    isShareAnimating = false;
    prompt('Скопируйте ссылку:', url);
  });
}

function startRoulette() {
  if (!isDataLoaded || isRouletteActive) return;
  isRouletteActive = true;
  replaceCount = 0;
  closeModal();

  const targetHero = randomElement(heroesData);
  currentBuild = createBuildForHero(targetHero);

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

  const itemHeight = 150;

  for (let col = 0; col < 3; col++) {
    const shuffled = [...heroesData].sort(() => Math.random() - 0.5);
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
    if (rouletteAudio) { rouletteAudio.pause(); rouletteAudio = null; }
    const soundFile = isGayMode ? GAY_ROULETTE_SOUND_FILE : ROULETTE_SOUND_FILE;
    rouletteAudio = new Audio(soundFile);
    rouletteAudio.loop = true;
    rouletteAudio.volume = 0.2;
    rouletteAudio.play()
      .then(() => console.log('Звук запущен'))
      .catch(e => console.warn('Звук не воспроизведён:', e.message));
  } catch (e) {
    console.warn('Ошибка создания аудио:', e.message);
  }

  setTimeout(() => {
    if (rouletteAudio) { rouletteAudio.pause(); rouletteAudio.currentTime = 0; rouletteAudio = null; }
    document.getElementById('casinoBg').classList.remove('show');
    grid.classList.add('merged');
    document.getElementById('startBuildBtn').classList.remove('hidden');
    createConfetti();
  }, 5000);
}

document.getElementById('startBuildBtn').addEventListener('click', function() {
  document.getElementById('rouletteOverlay').classList.remove('active');
  document.getElementById('slotGrid').classList.remove('merged');
  document.querySelectorAll('.slot-cell').forEach(cell => {
    cell.style.width = '';
    cell.style.height = '';
  });
  if (rouletteAudio) { rouletteAudio.pause(); rouletteAudio.currentTime = 0; rouletteAudio = null; }
  document.getElementById('casinoBg').classList.remove('show');
  renderBuild();
  isRouletteActive = false;
});

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

// GAY MODE переключатель
const gayModeToggle = document.getElementById('gayModeToggle');
gayModeToggle.addEventListener('click', function(e) {
  e.stopPropagation();
  isGayMode = !isGayMode;
  document.body.classList.toggle('gay-mode', isGayMode);
  this.classList.toggle('active', isGayMode);

  if (hoverAudio) {
    hoverAudio.pause();
    hoverAudio.currentTime = 0;
    hoverAudio = null;
  }
});

// Обработчик кликов для GAY MODE (звук gay.mp3)
document.addEventListener('click', function(e) {
  if (isGayMode) {
    try {
      if (gayAudio) {
        gayAudio.pause();
        gayAudio = null;
      }
      gayAudio = new Audio('gay.mp3');
      gayAudio.volume = 0.5;
      gayAudio.play().catch(err => console.warn('Не удалось воспроизвести gay.mp3:', err));
    } catch (err) {
      console.warn('Ошибка воспроизведения gay.mp3:', err);
    }
  }
});

// Наведение на кнопку "Сгенерировать билд" в GAY MODE
const generateBtn = document.getElementById('generateBtn');

generateBtn.addEventListener('mouseenter', function() {
  if (isGayMode) {
    try {
      if (hoverAudio) {
        hoverAudio.pause();
        hoverAudio = null;
      }
      hoverAudio = new Audio(GAY_HOVER_SOUND_FILE);
      hoverAudio.loop = true;
      hoverAudio.volume = 0.5;
      hoverAudio.play().catch(err => console.warn('Не удалось воспроизвести click.mp3:', err));
    } catch (err) {
      console.warn('Ошибка воспроизведения click.mp3:', err);
    }
  }
});

generateBtn.addEventListener('mouseleave', function() {
  if (hoverAudio) {
    hoverAudio.pause();
    hoverAudio.currentTime = 0;
    hoverAudio = null;
  }
});

// Параллакс эффект
document.addEventListener('mousemove', function(e) {
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;
  parallaxX = x * 10;
  parallaxY = y * 10;
  document.documentElement.style.setProperty('--parallax-x', `${parallaxX}px`);
  document.documentElement.style.setProperty('--parallax-y', `${parallaxY}px`);
});

// Контекстное меню (правая кнопка мыши) для замены без траты лимита
document.addEventListener('contextmenu', function(e) {
  const itemEl = e.target.closest('.item');
  if (itemEl && !isRouletteActive) {
    e.preventDefault();
    const index = parseInt(itemEl.dataset.index);
    replaceItemWithoutCost(index);
  }
});

const modal = document.getElementById('replaceLimitModal');
const closeModalBtn = document.getElementById('closeModalBtn');
function showModal() { modal.classList.add('show'); }
function closeModal() { modal.classList.remove('show'); }
closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', e => { if (e.target === modal) closeModal(); });

document.getElementById('result').addEventListener('click', e => {
  const btn = e.target.closest('.replace-item-btn');
  if (btn && !isRouletteActive) replaceItem(parseInt(btn.dataset.index));
});

document.getElementById('generateBtn').addEventListener('click', startRoulette);
window.addEventListener('load', loadData);
