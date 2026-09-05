import { BOOTS_ITEM_KEYS } from './config.js';

export function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
export function randomElement(arr) { return arr[randomInt(0, arr.length - 1)]; }

export function getRandomBoot(excludeKey = null) {
  let available = window.bootsData;
  if (excludeKey) {
    available = window.bootsData.filter(b => b.key !== excludeKey);
    if (available.length === 0) available = window.bootsData;
  }
  return randomElement(available);
}

export function getRandomRegularItem() {
  let available = window.regularItemsData.filter(item => !window.recentRegularItems.includes(item.key));
  if (available.length === 0) {
    available = window.regularItemsData.slice();
  }
  const item = randomElement(available);
  window.recentRegularItems.push(item.key);
  if (window.recentRegularItems.length > 5) window.recentRegularItems.shift();
  return item;
}

export function getNormalSkillMax(level) { return Math.ceil(level / 2); }
export function getUltimateLimit(level) {
  if (level < 6) return 0;
  if (level < 12) return 1;
  if (level < 18) return 2;
  return 3;
}

export function generateBuild(hero) {
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

export function buildItems() {
  const boots = getRandomBoot();
  const regulars = [];
  for (let i = 0; i < 5; i++) regulars.push(getRandomRegularItem());
  return [boots, ...regulars];
}

export function createBuildForHero(hero) {
  window.recentRegularItems = [];
  const { order, talents } = generateBuild(hero);
  return { hero, items: buildItems(), buildOrder: order, talents };
}