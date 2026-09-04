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

const MAX_REPLACES = 10;
const MAX_BUILDS = 5;

let rouletteAudio = null;
let gayAudio = null;
let hoverAudio = null;
let heroesData = [];
let bootsData = [];
let regularItemsData = [];
let isDataLoaded = false;

let builds = [];
let previousBuilds = [];
let activeBuildIndex = 0;

let replaceCount = 0;
let isRouletteActive = false;
let draggedItemIndex = null;
let isShareAnimating = false;

let recentRegularItems = [];

const urlParams = new URLSearchParams(window.location.search);
let sharedBuild = null;

let isGayMode = false;
let parallaxX = 0;
let parallaxY = 0;

// Скрытый ввод
let hiddenHeroId = '';
let hiddenItemQuery = '';
let ctrlPressed = false;
let forcedHeroId = null;
let forcedItemKey = null;

// ===== ЧАСТИЦЫ =====
const particlesCanvas = document.createElement('canvas');
particlesCanvas.id = 'particlesCanvas';
particlesCanvas.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.8;
`;
document.body.prepend(particlesCanvas);

const ctx = particlesCanvas.getContext('2d');
let particles = [];
let mouse = { x: -9999, y: -9999 };
let particlesColor = { r: 192, g: 132, b: 252 };

function initParticles() {
  const dpr = window.devicePixelRatio || 1;
  particlesCanvas.width = window.innerWidth * dpr;
  particlesCanvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  particles = [];
  const count = Math.min(80, Math.floor(window.innerWidth / 20));
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      translateX: 0,
      translateY: 0,
      size: Math.random() * 2 + 0.5,
      alpha: 0,
      targetAlpha: Math.random() * 0.6 + 0.1,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
      magnetism: 0.1 + Math.random() * 4
    });
  }
  drawParticlesFrame();
  requestAnimationFrame(animateParticles);
}

function drawParticle(p) {
  ctx.beginPath();
  ctx.arc(p.x + p.translateX, p.y + p.translateY, p.size, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${particlesColor.r}, ${particlesColor.g}, ${particlesColor.b}, ${p.alpha})`;
  ctx.shadowBlur = 10;
  ctx.shadowColor = `rgba(${particlesColor.r}, ${particlesColor.g}, ${particlesColor.b}, ${p.alpha})`;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawParticlesFrame() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles.forEach(drawParticle);
}

function animateParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const w = window.innerWidth;
  const h = window.innerHeight;

  particles.forEach((p, i) => {
    const edge = [
      p.x + p.translateX - p.size,
      w - p.x - p.translateX - p.size,
      p.y + p.translateY - p.size,
      h - p.y - p.translateY - p.size
    ];
    const closestEdge = Math.min(...edge);
    const remapClosestEdge = Math.max(0, Math.min(1, closestEdge / 20));

    if (remapClosestEdge > 1) {
      p.alpha += 0.02;
      if (p.alpha > p.targetAlpha) p.alpha = p.targetAlpha;
    } else {
      p.alpha = p.targetAlpha * remapClosestEdge;
    }

    p.x += p.dx;
    p.y += p.dy;
    const dxMouse = (mouse.x - w / 2) / 50;
    const dyMouse = (mouse.y - h / 2) / 50;
    p.translateX += (dxMouse * p.magnetism - p.translateX) / 10;
    p.translateY += (dyMouse * p.magnetism - p.translateY) / 10;

    drawParticle(p);

    if (p.x < -p.size || p.x > w + p.size || p.y < -p.size || p.y > h + p.size) {
      particles.splice(i, 1);
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        translateX: 0,
        translateY: 0,
        size: Math.random() * 2 + 0.5,
        alpha: 0,
        targetAlpha: Math.random() * 0.6 + 0.1,
        dx: (Math.random() - 0.5) * 0.2,
        dy: (Math.random() - 0.5) * 0.2,
        magnetism: 0.1 + Math.random() * 4
      });
    }
  });

  requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => {
  initParticles();
});

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

initParticles();
// ===== КОНЕЦ ЧАСТИЦ =====

// ===== МУЛЬТИ-БИЛД =====
function getActiveBuild() {
  return builds[activeBuildIndex] || null;
}

function setActiveBuildIndex(index) {
  if (index >= 0 && index < builds.length) {
    activeBuildIndex = index;
    localStorage.setItem('activeBuildIndex', index);
    const build = getActiveBuild();
    if (build) {
      replaceCount = build.replaceCount !== undefined ? build.replaceCount : 0;
    } else {
      replaceCount = 0;
    }
    renderBuildTabs();
    renderBuild(false);
  }
}

function addBuild() {
  if (builds.length >= MAX_BUILDS) return;
  builds.push(null);
  previousBuilds.push(null);
  activeBuildIndex = builds.length - 1;
  localStorage.setItem('builds', JSON.stringify(builds));
  localStorage.setItem('previousBuilds', JSON.stringify(previousBuilds));
  localStorage.setItem('activeBuildIndex', activeBuildIndex);
  generateBuildForActiveSlot();
  renderBuildTabs(); // Исправлено: сразу обновляем вкладки
}

function removeBuild(index) {
  if (builds.length <= 1) return;
  builds.splice(index, 1);
  previousBuilds.splice(index, 1);
  if (activeBuildIndex >= builds.length) activeBuildIndex = builds.length - 1;
  localStorage.setItem('builds', JSON.stringify(builds));
  localStorage.setItem('previousBuilds', JSON.stringify(previousBuilds));
  localStorage.setItem('activeBuildIndex', activeBuildIndex);
  const build = getActiveBuild();
  if (build) {
    replaceCount = build.replaceCount !== undefined ? build.replaceCount : 0;
  } else {
    replaceCount = 0;
  }
  renderBuildTabs();
  renderBuild(false);
}

function renderBuildTabs() {
  const container = document.getElementById('buildsTabs');
  if (!container) return;
  container.innerHTML = '';
  builds.forEach((build, index) => {
    const dot = document.createElement('div');
    dot.className = 'build-dot' + (index === activeBuildIndex ? ' active' : '');
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
  if (builds.length < MAX_BUILDS) {
    const addBtn = document.createElement('button');
    addBtn.className = 'build-dot-add';
    addBtn.textContent = '+';
    addBtn.addEventListener('click', addBuild);
    container.appendChild(addBtn);
  }
}

function loadBuildsFromStorage() {
  try {
    const saved = localStorage.getItem('builds');
    if (saved) {
      builds = JSON.parse(saved);
      builds = builds.map(b => {
        if (b && b.hero && b.hero.name) {
          const hero = heroesData.find(h => h.name === b.hero.name);
          if (hero) b.hero = hero;
          else return null;
          if (b.replaceCount === undefined) b.replaceCount = 0;
        }
        return b;
      }).filter(b => b !== null);
    }
    const savedPrev = localStorage.getItem('previousBuilds');
    if (savedPrev) {
      previousBuilds = JSON.parse(savedPrev);
    }
    const savedIndex = localStorage.getItem('activeBuildIndex');
    if (savedIndex !== null) {
      activeBuildIndex = parseInt(savedIndex, 10);
      if (activeBuildIndex >= builds.length) activeBuildIndex = 0;
    }
  } catch (e) {
    console.warn('Ошибка загрузки билдов из localStorage:', e);
  }
}

function saveBuildsToStorage() {
  try {
    localStorage.setItem('builds', JSON.stringify(builds));
    localStorage.setItem('previousBuilds', JSON.stringify(previousBuilds));
    localStorage.setItem('activeBuildIndex', activeBuildIndex);
  } catch (e) {
    console.warn('Не удалось сохранить билды:', e);
  }
}

function generateBuildForActiveSlot() {
  if (!isDataLoaded) return;
  let hero;

  if (hiddenHeroId) {
    const id = parseInt(hiddenHeroId, 10);
    hero = heroesData.find(h => h.id === id);
    hiddenHeroId = '';
  }

  if (!hero) {
    hero = randomElement(heroesData);
  }

  const newBuild = createBuildForHero(hero);
  newBuild.replaceCount = 0;
  builds[activeBuildIndex] = newBuild;
  replaceCount = 0;
  saveBuildsToStorage();
  renderBuild(true);
  renderBuildTabs(); // Исправлено: после генерации обновляем вкладки
}

function savePreviousBuildForActive() {
  if (builds[activeBuildIndex]) {
    previousBuilds[activeBuildIndex] = builds[activeBuildIndex];
    saveBuildsToStorage();
  }
}

function loadPreviousBuildForActive() {
  const prev = previousBuilds[activeBuildIndex];
  if (prev) {
    builds[activeBuildIndex] = prev;
    previousBuilds[activeBuildIndex] = null;
    replaceCount = prev.replaceCount || 0;
    saveBuildsToStorage();
    renderBuild(false);
    updateLoadPreviousBuildButton();
  }
}

function updateLoadPreviousBuildButton() {
  const btn = document.getElementById('loadPreviousBuildBtn');
  if (!btn) return;
  if (previousBuilds[activeBuildIndex]) {
    btn.classList.remove('hidden');
  } else {
    btn.classList.add('hidden');
  }
}
// ===== КОНЕЦ МУЛЬТИ-БИЛД =====

// ===== СКРЫТЫЙ ВВОД =====
document.addEventListener('keydown', function(e) {
  if (e.key === 'Control') {
    ctrlPressed = true;
    hiddenItemQuery = '';
    e.preventDefault();
    return;
  }
  if (ctrlPressed) {
    if (e.key.length === 1 && !e.altKey && !e.metaKey) {
      hiddenItemQuery += e.key.toLowerCase();
      e.preventDefault();
    }
  } else {
    if (/^\d$/.test(e.key)) {
      hiddenHeroId += e.key;
      e.preventDefault();
    }
  }
});

document.addEventListener('keyup', function(e) {
  if (e.key === 'Control') {
    ctrlPressed = false;
    if (hiddenItemQuery.length > 0) {
      const allItems = [...regularItemsData, ...bootsData];
      const bestMatch = findBestItemMatch(hiddenItemQuery, allItems);
      if (bestMatch) forcedItemKey = bestMatch.key;
      hiddenItemQuery = '';
    }
  }
});

function findBestItemMatch(query, items) {
  const q = query.toLowerCase().replace(/\s+/g, '');
  if (!q) return null;
  let exact = items.find(item => item.name.toLowerCase() === q || item.key.toLowerCase() === q);
  if (exact) return exact;
  let substring = items.filter(item => item.name.toLowerCase().includes(q) || item.key.toLowerCase().includes(q));
  if (substring.length > 0) {
    substring.sort((a, b) => a.name.length - b.name.length);
    return substring[0];
  }
  let best = null;
  let bestDistance = Infinity;
  for (const item of items) {
    const distance = levenshteinDistance(q, item.name.toLowerCase());
    if (distance < bestDistance) {
      bestDistance = distance;
      best = item;
    }
  }
  if (best && bestDistance <= Math.max(3, q.length / 2)) return best;
  return null;
}

function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}
// ===== КОНЕЦ СКРЫТОГО ВВОДА =====

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

    // Инициализация билдов
    loadBuildsFromStorage();
    if (builds.length === 0) {
      builds.push(null);
      previousBuilds.push(null);
      activeBuildIndex = 0;
      generateBuildForActiveSlot();
    } else {
      renderBuildTabs();
      if (builds[activeBuildIndex]) {
        replaceCount = builds[activeBuildIndex].replaceCount || 0;
        renderBuild(false);
      } else {
        generateBuildForActiveSlot();
      }
    }
    updateLoadPreviousBuildButton();
  } catch (e) {
    console.error(e);
    document.getElementById('status').textContent = `Ошибка: ${e.message}`;
  }
}

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomElement(arr) { return arr[randomInt(0, arr.length - 1)]; }

function getRandomBoot(excludeKey = null) {
  let available = bootsData;
  if (excludeKey) {
    available = bootsData.filter(b => b.key !== excludeKey);
    if (available.length === 0) available = bootsData;
  }
  return randomElement(available);
}

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
  const boots = getRandomBoot();
  const regulars = [];
  for (let i = 0; i < 5; i++) {
    regulars.push(getRandomRegularItem());
  }
  return [boots, ...regulars];
}

function createBuildForHero(hero) {
  recentRegularItems = [];
  const { order, talents } = generateBuild(hero);
  return { hero, items: buildItems(), buildOrder: order, talents };
}

function replaceItem(index) {
  const build = getActiveBuild();
  if (!build || isRouletteActive) return;
  if (build.replaceCount >= MAX_REPLACES) { showModal(); return; }

  if (index === 0) {
    if (forcedItemKey && BOOTS_ITEM_KEYS.has(forcedItemKey)) {
      build.items[0] = bootsData.find(b => b.key === forcedItemKey);
      forcedItemKey = null;
    } else {
      build.items[0] = getRandomBoot(build.items[0].key);
    }
  } else {
    if (forcedItemKey && !BOOTS_ITEM_KEYS.has(forcedItemKey)) {
      build.items[index] = regularItemsData.find(i => i.key === forcedItemKey);
      forcedItemKey = null;
    } else {
      build.items[index] = getRandomRegularItem();
    }
  }
  build.replaceCount++;
  replaceCount = build.replaceCount;
  saveBuildsToStorage();
  renderBuild(false);
}

function replaceItemWithoutCost(index) {
  const build = getActiveBuild();
  if (!build || isRouletteActive) return;
  if (index === 0) {
    if (forcedItemKey && BOOTS_ITEM_KEYS.has(forcedItemKey)) {
      build.items[0] = bootsData.find(b => b.key === forcedItemKey);
      forcedItemKey = null;
    } else {
      build.items[0] = getRandomBoot(build.items[0].key);
    }
  } else {
    if (forcedItemKey && !BOOTS_ITEM_KEYS.has(forcedItemKey)) {
      build.items[index] = regularItemsData.find(i => i.key === forcedItemKey);
      forcedItemKey = null;
    } else {
      build.items[index] = getRandomRegularItem();
    }
  }
  saveBuildsToStorage();
  renderBuild(false);
}

function renderBuild(animate = false) {
  const build = getActiveBuild();
  if (!build) return;

  const { hero, items, buildOrder, talents } = build;
  const currentReplaceCount = build.replaceCount !== undefined ? build.replaceCount : 0;
  replaceCount = currentReplaceCount;

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

    const build = getActiveBuild();
    const items = build.items;
    [items[draggedItemIndex], items[targetIndex]] = [items[targetIndex], items[draggedItemIndex]];
    saveBuildsToStorage();
    renderBuild(false);
  });
}

function shareBuild(mode = 'link') {
  const build = getActiveBuild();
  if (!build || isShareAnimating) return;

  const btn = document.getElementById('shareBtn');
  const textSpan = btn.querySelector('.share-text');
  const originalText = textSpan ? textSpan.textContent : btn.textContent;

  isShareAnimating = true;

  let contentToCopy = '';
  if (mode === 'link') {
    const data = {
      heroName: build.hero.name,
      items: build.items,
      buildOrder: build.buildOrder,
      talents: build.talents
    };
    const json = JSON.stringify(data);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    contentToCopy = `${window.location.origin}${window.location.pathname}?build=${encoded}`;
  } else {
    contentToCopy = buildTextDescription(build);
  }

  navigator.clipboard.writeText(contentToCopy).then(() => {
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
    prompt('Скопируйте текст:', contentToCopy);
  });
}

function buildTextDescription(build) {
  const hero = build.hero.name;
  const items = build.items.map(i => i.name).join(', ');
  const talents = build.talents;
  const talentLevels = [10, 15, 20, 25];
  const sides = [];

  talentLevels.forEach(level => {
    const selected = talents.find(t => t.level === level);
    if (!selected) return;
    const tl = build.hero.talents[level] || [];
    const left = tl[1] || '';
    const right = tl[0] || '';
    if (selected.value === left) sides.push('Лево');
    else if (selected.value === right) sides.push('Право');
    else sides.push('?');
  });

  return `Герой: ${hero}\nПредметы: ${items}\nТаланты: ${sides.join(' > ')}`;
}

function startRoulette() {
  if (!isDataLoaded || isRouletteActive) return;

  // Сохраняем предыдущий билд для активного слота
  savePreviousBuildForActive();

  isRouletteActive = true;
  replaceCount = 0;
  closeModal();

  let targetHero;

  if (hiddenHeroId) {
    const id = parseInt(hiddenHeroId, 10);
    targetHero = heroesData.find(h => h.id === id);
    hiddenHeroId = '';
  }

  if (!targetHero) {
    targetHero = randomElement(heroesData);
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
    builds[activeBuildIndex] = newBuild;
    saveBuildsToStorage();
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
  renderBuild(true);
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

// GAY MODE
const gayModeToggle = document.getElementById('gayModeToggle');
gayModeToggle.addEventListener('click', function(e) {
  e.stopPropagation();
  isGayMode = !isGayMode;
  document.body.classList.toggle('gay-mode', isGayMode);
  this.classList.toggle('active', isGayMode);

  if (isGayMode) {
    particlesColor = { r: 255, g: 0, b: 204 };
  } else {
    particlesColor = { r: 192, g: 132, b: 252 };
  }

  if (hoverAudio) {
    hoverAudio.pause();
    hoverAudio.currentTime = 0;
    hoverAudio = null;
  }
});

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

document.addEventListener('mousemove', function(e) {
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;
  parallaxX = x * 10;
  parallaxY = y * 10;
  document.documentElement.style.setProperty('--parallax-x', `${parallaxX}px`);
  document.documentElement.style.setProperty('--parallax-y', `${parallaxY}px`);
});

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
