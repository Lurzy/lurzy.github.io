import { heroesUrl, abilitiesUrl, heroAbilitiesUrl, itemsUrl, CDN_BASE, ALLOWED_ITEM_KEYS, BOOTS_ITEM_KEYS } from './config.js';
import { loadBuildsFromStorage, renderBuildTabs, generateBuildForActiveSlot, updateLoadPreviousBuildButton } from './multiBuild.js';
import { renderBuild } from './ui.js';

export async function loadData() {
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

    window.heroesData = heroes.map(hero => {
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

    window.bootsData = allItems.filter(i => BOOTS_ITEM_KEYS.has(i.key));
    window.regularItemsData = allItems.filter(i => !BOOTS_ITEM_KEYS.has(i.key));

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