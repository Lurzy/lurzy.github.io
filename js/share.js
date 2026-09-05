import { getActiveBuild } from './multiBuild.js';

export function shareBuild(mode = 'link') {
  const build = getActiveBuild();
  if (!build || window.isShareAnimating) return;

  const btn = document.getElementById('shareBtn');
  const textSpan = btn.querySelector('.share-text');
  const originalText = textSpan ? textSpan.textContent : btn.textContent;

  window.isShareAnimating = true;

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
      window.isShareAnimating = false;
    }, 6000);
  }).catch(() => {
    window.isShareAnimating = false;
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