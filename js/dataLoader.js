import {
  USE_LOCAL_DATA,
  localHeroAbilitiesUrl,
  localItemsUrl,
  heroesUrl,
  abilitiesUrl,
  heroAbilitiesUrl,
  itemsUrl,
  CDN_BASE,
  ALLOWED_ITEM_KEYS,
  BOOTS_ITEM_KEYS
} from './config.js';
import { loadBuildsFromStorage, renderBuildTabs, generateBuildForActiveSlot, updateLoadPreviousBuildButton } from './multiBuild.js';
import { renderBuild } from './ui.js';

// ============================================================
// Функция преобразования пути к картинке.
// Позволяет использовать как локальные файлы (img/...), так и CDN.
// ============================================================
function resolveImagePath(path) {
  if (!path) return '';
  // Если путь уже полный (http/https) — возвращаем как есть
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Локальный путь: img/..., ./img/..., ../img/...
  if (path.startsWith('img/') || path.startsWith('./img/') || path.startsWith('../img/')) return path;
  // Путь от CDN: /apps/... — добавляем базовый URL
  if (path.startsWith('/apps/')) return CDN_BASE + path;
  // По умолчанию — CDN
  return CDN_BASE + path;
}

// ============================================================
// Преобразование объекта heroAbilities (из локального файла)
// в массив героев, используемый приложением.
// ============================================================
function buildHeroesFromLocalData(heroAbilitiesObj) {
  if (!heroAbilitiesObj) return [];

  return Object.entries(heroAbilitiesObj).map(([id, data]) => {
    const heroId = parseInt(id, 10);
    const heroName = data.name || `Hero ${id}`;
    const heroImg = data.heroImg ? resolveImagePath(data.heroImg) : '';

    const skills = [];
    const talentLevels = {};

    // --- Таланты ---
    if (Array.isArray(data.talents)) {
      data.talents.forEach(talent => {
        const gameLevel = 10 + (talent.level - 1) * 5;
        if (!talentLevels[gameLevel]) talentLevels[gameLevel] = [];
        talentLevels[gameLevel].push(talent.name);
      });
    }

    // --- Способности ---
    const rawAbilities = Array.isArray(data.abilities) ? data.abilities : [];
    const ultimateData = data.ultimate && data.ultimate.name ? data.ultimate : null;

    let ultimateSkill = null;

    if (ultimateData) {
      ultimateSkill = {
        name: ultimateData.name,
        img: ultimateData.img ? resolveImagePath(ultimateData.img) : null,
        maxLevel: 3,
        isUltimate: true,
        key: ultimateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
      };
    } else {
      // Ищем последний generic_hidden
      const genericIndices = rawAbilities
        .map((ab, idx) => (ab.name && ab.name.includes('generic_hidden') ? idx : -1))
        .filter(idx => idx !== -1);
      const lastGenericIndex = genericIndices.length > 0 ? Math.max(...genericIndices) : -1;

      if (lastGenericIndex !== -1) {
        // Ульта — первый не-generic после последнего generic
        for (let i = lastGenericIndex + 1; i < rawAbilities.length; i++) {
          if (!rawAbilities[i].name.includes('generic_hidden')) {
            ultimateSkill = {
              name: rawAbilities[i].name,
              img: rawAbilities[i].img ? resolveImagePath(rawAbilities[i].img) : null,
              maxLevel: 3,
              isUltimate: true,
              key: rawAbilities[i].name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
            };
            break;
          }
        }
      } else {
        // Если нет generic, считаем последний не-generic ультой
        const nonGeneric = rawAbilities.filter(ab => !ab.name.includes('generic_hidden'));
        if (nonGeneric.length > 0) {
          const last = nonGeneric[nonGeneric.length - 1];
          ultimateSkill = {
            name: last.name,
            img: last.img ? resolveImagePath(last.img) : null,
            maxLevel: 3,
            isUltimate: true,
            key: last.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
          };
        }
      }
    }

    // --- Обычные способности ---
    let nonGenericAbilities = [];
    if (ultimateSkill) {
      // Определяем индекс ульты в исходном массиве
      const ultIndex = rawAbilities.findIndex(ab => ab.name === ultimateSkill.name && !ab.name.includes('generic_hidden'));
      const endIndex = ultIndex !== -1 ? ultIndex : rawAbilities.length;
      nonGenericAbilities = rawAbilities
        .slice(0, endIndex)
        .filter(ab => !ab.name.includes('generic_hidden'))
        .map(ab => ({
          name: ab.name,
          img: ab.img ? resolveImagePath(ab.img) : null,
          maxLevel: 4,
          isUltimate: false,
          key: ab.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
        }));
    } else {
      // Если ульты нет, все не-generic — обычные
      nonGenericAbilities = rawAbilities
        .filter(ab => !ab.name.includes('generic_hidden'))
        .map(ab => ({
          name: ab.name,
          img: ab.img ? resolveImagePath(ab.img) : null,
          maxLevel: 4,
          isUltimate: false,
          key: ab.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
        }));
    }

    // Добавляем обычные скиллы
    nonGenericAbilities.forEach(skill => skills.push(skill));

    // Добавляем ульту (если есть)
    if (ultimateSkill) {
      skills.push(ultimateSkill);
    }

    const ultimateIndex = skills.findIndex(s => s.isUltimate);

    return {
      id: heroId,
      name: heroName,
      img: heroImg,
      skills: skills,
      ultimateIndex: ultimateIndex,
      talents: talentLevels
    };
  }).filter(hero => hero.skills.length > 0);
}

// ============================================================
// Главная функция загрузки данных
// ============================================================
export async function loadData() {
  try {
    let heroesData = [];
    let bootsData = [];
    let regularItemsData = [];

    if (USE_LOCAL_DATA) {
      // ================= ЛОКАЛЬНЫЙ РЕЖИМ =================
      const [heroAbilitiesRes, itemsRes] = await Promise.all([
        fetch(localHeroAbilitiesUrl),
        fetch(localItemsUrl)
      ]);
      if (!heroAbilitiesRes.ok || !itemsRes.ok) throw new Error('Локальные данные не загрузились');

      const heroAbilitiesObj = await heroAbilitiesRes.json();
      const items = await itemsRes.json();

      heroesData = buildHeroesFromLocalData(heroAbilitiesObj);

      // Предметы
      const allItems = Object.entries(items)
        .filter(([k, it]) => ALLOWED_ITEM_KEYS.has(k.replace(/^item_/, '')) && it.dname && it.img)
        .map(([k, it]) => ({ key: k.replace(/^item_/, ''), name: it.dname, img: resolveImagePath(it.img) }));

      bootsData = allItems.filter(i => BOOTS_ITEM_KEYS.has(i.key));
      regularItemsData = allItems.filter(i => !BOOTS_ITEM_KEYS.has(i.key));

    } else {
      // ================= ВНЕШНИЙ РЕЖИМ =================
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

      // Предметы
      const allItems = Object.entries(items)
        .filter(([k, it]) => ALLOWED_ITEM_KEYS.has(k.replace(/^item_/, '')) && it.dname && it.img)
        .map(([k, it]) => ({ key: k.replace(/^item_/, ''), name: it.dname, img: CDN_BASE + it.img }));

      bootsData = allItems.filter(i => BOOTS_ITEM_KEYS.has(i.key));
      regularItemsData = allItems.filter(i => !BOOTS_ITEM_KEYS.has(i.key));

      // ===== Смешанный режим: попытка переопределить героя локальными данными =====
      try {
        const localHeroRes = await fetch(localHeroAbilitiesUrl);
        if (localHeroRes.ok) {
          const localHeroData = await localHeroRes.json();
          // Переопределяем героя с id=1 (пример)
          const overrideId = 1;
          const localHero = localHeroData[String(overrideId)];
          if (localHero) {
            const heroesFromLocal = buildHeroesFromLocalData({ [overrideId]: localHero });
            if (heroesFromLocal.length > 0) {
              const idx = heroesData.findIndex(h => h.id === overrideId);
              if (idx !== -1) {
                heroesData[idx] = heroesFromLocal[0];
                console.log(`Герой ${localHero.name} переопределён локальными данными`);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Не удалось загрузить локальные данные для переопределения героя:', e);
      }
    }

    // ================= Общая часть =================
    window.heroesData = heroesData;
    window.bootsData = bootsData;
    window.regularItemsData = regularItemsData;
    window.isDataLoaded = true;

    document.getElementById('generateBtn').disabled = false;
    document.getElementById('generateBtn').textContent = 'Сгенерировать билд';
    document.getElementById('status').textContent = `Героев: ${window.heroesData.length}, предметов: ${window.regularItemsData.length}, ботинок: ${window.bootsData.length}`;
    console.log(`Загружено героев: ${window.heroesData.length}, обычных предметов: ${window.regularItemsData.length}, ботинок: ${window.bootsData.length}`);

    loadBuildsFromStorage();
    if (window.builds.length === 0) {
      window.builds.push(null);
      window.previousBuilds.push(null);
      window.activeBuildIndex = 0;
      generateBuildForActiveSlot();
    } else {
      renderBuildTabs();
      if (window.builds[window.activeBuildIndex]) {
        window.replaceCount = window.builds[window.activeBuildIndex].replaceCount || 0;
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