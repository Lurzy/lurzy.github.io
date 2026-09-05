// hiddenInput.js
export function initHiddenInput() {
  // Инициализируем переменные
  window.hiddenHeroId = '';
  window.hiddenItemQuery = '';
  window.altPressed = false;
  window.forcedItemKey = null;

  document.addEventListener('keydown', function(e) {
    // Проверяем Alt вместо Ctrl
    if (e.key === 'Alt') {
      window.altPressed = true;
      window.hiddenItemQuery = '';
      e.preventDefault();
      return;
    }

    if (window.altPressed) {
      // Ввод названия предмета (любые буквы и цифры)
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        window.hiddenItemQuery += e.key.toLowerCase();
        e.preventDefault();
      }
    } else {
      // Ввод ID героя (только цифры)
      if (/^\d$/.test(e.key)) {
        window.hiddenHeroId += e.key;
        e.preventDefault();
      }
    }
  });

  document.addEventListener('keyup', function(e) {
    if (e.key === 'Alt') {
      window.altPressed = false;
      if (window.hiddenItemQuery.length > 0) {
        const allItems = [...window.regularItemsData, ...window.bootsData];
        const bestMatch = findBestItemMatch(window.hiddenItemQuery, allItems);
        if (bestMatch) {
          window.forcedItemKey = bestMatch.key;
        }
        window.hiddenItemQuery = '';
      }
    }
  });
}

// Функция нечёткого поиска предмета (не изменилась)
function findBestItemMatch(query, items) {
  const q = query.toLowerCase().replace(/\s+/g, '');
  if (!q) return null;

  // 1. Точное совпадение
  let exact = items.find(item => item.name.toLowerCase() === q || item.key.toLowerCase() === q);
  if (exact) return exact;

  // 2. Вхождение подстроки
  let substring = items.filter(item => item.name.toLowerCase().includes(q) || item.key.toLowerCase().includes(q));
  if (substring.length > 0) {
    substring.sort((a, b) => a.name.length - b.name.length);
    return substring[0];
  }

  // 3. Расстояние Левенштейна (приблизительное совпадение)
  let best = null;
  let bestDistance = Infinity;
  for (const item of items) {
    const distance = levenshteinDistance(q, item.name.toLowerCase());
    if (distance < bestDistance) {
      bestDistance = distance;
      best = item;
    }
  }
  if (best && bestDistance <= Math.max(3, q.length / 2)) {
    return best;
  }
  return null;
}

// Функция расстояния Левенштейна
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}