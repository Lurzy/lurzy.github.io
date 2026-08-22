:root {
    --bg-color: #0d0b1a;
    --primary: #7c3aed;
    --primary-light: #a855f7;
    --primary-dark: #4c1d95;
    --accent: #c084fc;
    --text: #e2e8f0;
    --text-muted: #94a3b8;
    --card-bg: rgba(255, 255, 255, 0.06);
    --card-border: rgba(255, 255, 255, 0.1);
    --gold: #fbbf24;
}

* { box-sizing: border-box; }

body {
    font-family: 'Montserrat', sans-serif;
    background: var(--bg-color);
    color: var(--text);
    min-height: 100vh;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow-x: hidden;
}

/* Обычный градиентный фон */
.background-animation {
    position: fixed;
    top: -20px;
    left: -20px;
    right: -20px;
    bottom: -20px;
    background: linear-gradient(135deg, #1e1b4b, #4c1d95, #0d0b1a, #2e1065);
    background-size: 400% 400%;
    animation: gradientShift 30s ease infinite;
    z-index: -3;
    transition: opacity 0.8s ease;
    will-change: transform;
    transform: translate3d(0,0,0);
}

@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

/* GAY MODE картинка */
.gay-bg {
    position: fixed;
    top: -20px;
    left: -20px;
    right: -20px;
    bottom: -20px;
    background-image: url('gaymode.jpg');
    background-size: cover;
    background-position: center;
    z-index: -2;
    opacity: 0;
    transition: opacity 0.8s ease;
    will-change: transform;
    transform: translate3d(0,0,0);
    pointer-events: none;
}

/* При включённом GAY MODE показываем картинку, скрываем градиент */
body.gay-mode .gay-bg {
    opacity: 1;
}

body.gay-mode .background-animation {
    opacity: 0;
}

.casino-bg {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #7c3aed, #c084fc, #5b21b6, #3b0764);
    background-size: 400% 400%;
    animation: casinoShift 6s ease infinite;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.8s ease;
    pointer-events: none;
}

.casino-bg.show { opacity: 1; }

@keyframes casinoShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.container {
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--card-border);
    border-radius: 24px;
    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    padding: 40px;
    max-width: 720px;
    width: 90%;
    text-align: center;
    position: relative;
    z-index: 1;
}

h1 {
    margin: 0 0 20px;
    font-size: 2.2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #c084fc, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.emoji {
    -webkit-text-fill-color: initial;
    background: none;
}

/* Общие стили для кнопок */
button {
    font-family: inherit;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: white;
    border: none;
    padding: 12px 28px;
    font-size: 1rem;
    border-radius: 50px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    margin-bottom: 15px;
    font-weight: 600;
    letter-spacing: 0.5px;
}

button:disabled { background: #444; cursor: not-allowed; box-shadow: none; }
button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4); }
button:active { transform: translateY(0); box-shadow: none; }

/* Кнопка "Сгенерировать билд" с анимацией бегущего градиента */
#generateBtn {
    position: relative;
    padding: 12px 28px;
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 300px;
    min-height: 60px;
    text-align: center;
    color: #fff;
    text-transform: uppercase;
    text-decoration: none;
    box-sizing: border-box;
    border: none;
    border-radius: 30px;
    z-index: 1;
    user-select: none;
    cursor: pointer;
    background: linear-gradient(90deg, #7c3aed, #c084fc, #4c1d95, #7c3aed);
    background-size: 400%;
    transition: color 0.3s ease;
}

#generateBtn:hover {
    animation: animate-49 8s linear infinite;
    color: #fff;
    transform: none;
    box-shadow: none;
}

#generateBtn::before {
    content: "";
    position: absolute;
    top: -5px;
    right: -5px;
    bottom: -5px;
    left: -5px;
    z-index: -1;
    background: linear-gradient(90deg, #7c3aed, #c084fc, #4c1d95, #7c3aed);
    background-size: 400%;
    border-radius: 40px;
    opacity: 0;
    transition: opacity 0.5s;
}

#generateBtn:hover::before {
    filter: blur(20px);
    opacity: 1;
    animation: animate-49 8s linear infinite;
}

#generateBtn:disabled {
    pointer-events: none;
    opacity: 0.65;
    color: #7e7e7e;
    box-shadow: none;
    background: #dcdcdc;
    animation: none;
}

#generateBtn:disabled::before {
    display: none;
}

@keyframes animate-49 {
    0% { background-position: 0%; }
    100% { background-position: 400%; }
}

/* Свитчер GAY MODE */
.mode-switch {
    margin-bottom: 20px;
}

.gay-mode-toggle {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin: 0;
    position: relative;
}

.gay-mode-toggle__track {
    display: inline-block;
    width: 60px;
    height: 30px;
    background: #3d3d5c;
    border-radius: 15px;
    position: relative;
    transition: background 0.4s ease;
}

.gay-mode-toggle__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 26px;
    height: 26px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55), background 0.4s ease;
}

.gay-mode-toggle.active .gay-mode-toggle__track {
    background: linear-gradient(90deg, #ff00cc, #ff9900, #ffff00);
}

.gay-mode-toggle.active .gay-mode-toggle__thumb {
    transform: translateX(30px);
    background: #ffcc00;
}

.gay-mode-toggle__label {
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.5px;
    user-select: none;
}

/* Параллакс эффект */
.background-animation,
.gay-bg {
    transform: translate3d(var(--parallax-x, 0), var(--parallax-y, 0), 0);
}

/* Остальные элементы интерфейса */
.status { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 25px; }
.result { text-align: left; }

.hero-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 25px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 15px 20px;
    backdrop-filter: blur(10px);
}

.hero-img {
    width: 80px; height: 80px;
    border-radius: 50%;
    border: 3px solid var(--accent);
    object-fit: cover;
    background: #2a2a3d;
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
}

.hero-name {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent);
    text-shadow: 0 0 10px rgba(192, 132, 252, 0.5);
}

.section { margin-bottom: 25px; }

.section h3 {
    border-bottom: 1px solid var(--card-border);
    padding-bottom: 8px;
    color: var(--accent);
    font-size: 1.2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.replace-counter { font-size: 0.9rem; color: var(--text-muted); font-weight: 400; }

.items-list { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }

.item {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    padding: 8px 40px 8px 12px;
    border-radius: 12px;
    font-size: 0.95rem;
    min-height: 48px;
    backdrop-filter: blur(10px);
    transition: border-color 0.2s, box-shadow 0.2s;
}

.item:hover { border-color: var(--primary-light); box-shadow: 0 0 15px rgba(124, 58, 237, 0.3); }

.item-img {
    width: 36px; height: 36px;
    border-radius: 6px;
    object-fit: contain;
    background: rgba(0,0,0,0.3);
    flex-shrink: 0;
}

.item-name { display: inline-block; vertical-align: middle; }

.replace-item-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: 1px solid var(--accent);
    border-radius: 50%;
    color: var(--accent);
    cursor: pointer;
    width: 26px; height: 26px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    line-height: 1;
    flex-shrink: 0;
    box-sizing: border-box;
    transition: color 0.2s, background 0.2s;
}

.replace-item-btn:hover { color: #fff; background: var(--primary); transform: translateY(-50%) !important; }

.build-order { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; margin-top: 10px; }

.level-entry {
    display: flex;
    align-items: center;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 0.9rem;
    backdrop-filter: blur(5px);
}

.skill-img { width: 28px; height: 28px; margin-right: 8px; border-radius: 4px; object-fit: contain; }

.talents-tree {
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
    padding: 10px 0;
    margin-top: 10px;
}

.talents-tree::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 20px;
    bottom: 20px;
    width: 2px;
    background: var(--card-border);
    transform: translateX(-50%);
    z-index: 0;
}

.talent-level-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 1;
}

.talent-node {
    width: 40%;
    padding: 10px 14px;
    border-radius: 10px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    color: var(--text-muted);
    cursor: default;
    transition: background 0.3s, color 0.3s, border-color 0.3s;
    position: relative;
}

.talent-node.left { text-align: right; }
.talent-node.right { text-align: left; }

.talent-node.selected {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    border-color: var(--accent);
    color: #fff;
    font-weight: 600;
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.5);
}

.talent-center { width: 40px; display: flex; justify-content: center; align-items: center; z-index: 1; }

.talent-level-number {
    background: #1e1b4b;
    border: 2px solid var(--accent);
    color: var(--accent);
    width: 32px; height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: 700;
    font-size: 0.9rem;
}

.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0; top: 0;
    width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.7);
    backdrop-filter: blur(5px);
    align-items: center;
    justify-content: center;
}

.modal.show { display: flex; }

.modal-content {
    background: #2a2a3d;
    color: var(--text);
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    text-align: center;
    max-width: 400px;
    width: 90%;
    position: relative;
    border: 1px solid var(--card-border);
}

.modal-close {
    position: absolute;
    top: 10px; right: 15px;
    font-size: 28px;
    font-weight: bold;
    color: var(--accent);
    cursor: pointer;
    transition: color 0.3s;
}

.modal-close:hover { color: var(--gold); }

.modal-image {
    display: block;
    margin: 0 auto 15px auto;
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    object-fit: contain;
}

/* Рулетка-слоты 3x3 */
.roulette-overlay {
    display: none;
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    z-index: 2000;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.roulette-overlay.active { display: flex; }

.slot-grid {
    display: grid;
    grid-template-columns: repeat(3, 200px);
    grid-template-rows: repeat(3, 150px);
    gap: 5px;
    margin-bottom: 30px;
    transition: all 0.8s ease;
    z-index: 1;
    position: relative;
}

.slot-cell {
    width: 200px;
    height: 150px;
    overflow: hidden;
    border: 2px solid var(--accent);
    border-radius: 8px;
    background: #1e1e2f;
    opacity: 0;
    transform: scale(0);
    transition: opacity 0.5s ease, transform 0.5s ease, width 1.2s ease-in-out, height 1.2s ease-in-out;
}

.slot-cell.visible { opacity: 1; transform: scale(1); }
.slot-cell.center-row { border-color: var(--gold); }

.slot-track {
    display: flex;
    flex-direction: column;
    transition: transform 8.5s cubic-bezier(0.25, 0.1, 0.25, 1);
    will-change: transform;
}

.slot-item {
    width: 200px;
    height: 150px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.slot-item img { width: 100%; height: 100%; object-fit: cover; }

/* Затемнение рядов, кроме центрального */
.slot-grid:not(.merged) .slot-cell:nth-child(-n+3) {
    opacity: 0.35;
    filter: brightness(0.5);
    transition: opacity 0.5s ease, filter 0.5s ease, width 1.2s ease-in-out, height 1.2s ease-in-out;
}

.slot-grid:not(.merged) .slot-cell:nth-child(n+7) {
    opacity: 0.35;
    filter: brightness(0.5);
    transition: opacity 0.5s ease, filter 0.5s ease, width 1.2s ease-in-out, height 1.2s ease-in-out;
}

/* Центральный ряд остаётся ярким */
.slot-grid:not(.merged) .slot-cell:nth-child(4),
.slot-grid:not(.merged) .slot-cell:nth-child(5),
.slot-grid:not(.merged) .slot-cell:nth-child(6) {
    opacity: 1;
    filter: brightness(1);
}

/* После остановки: все квадраты, кроме центрального, схлопываются в него */
.slot-grid.merged {
    display: block;
    position: relative;
    width: 200px;
    height: 150px;
}

.slot-grid.merged .slot-cell {
    position: absolute;
    top: 0;
    left: 0;
    transition: all 1.2s ease-in-out;
}

.slot-grid.merged .slot-cell:not([data-index="4"]) {
    width: 0;
    height: 0;
    opacity: 0;
    border-width: 0;
    margin: 0;
    transform: translate(100px, 75px) scale(0);
}

.slot-grid.merged .slot-cell[data-index="4"] {
    width: 200px;
    height: 150px;
    top: 0;
    left: 0;
}

.hidden { display: none; }

/* Drag & drop */
.item.dragging {
    opacity: 0.5;
    transform: scale(0.95);
    cursor: grabbing;
    border: 2px dashed var(--accent);
}

.item.drag-over {
    border: 2px dashed var(--gold);
    transform: scale(1.05);
    transition: transform 0.2s, border-color 0.2s;
}

.items-list.drag-over { background: rgba(124, 58, 237, 0.1); border-radius: 12px; }

.confetti {
    position: fixed;
    width: 10px; height: 10px;
    background: #f00;
    z-index: 3000;
    pointer-events: none;
    animation: confettiFall 1.5s ease-out forwards;
}

@keyframes confettiFall {
    0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
    100% { opacity: 0; transform: translateY(400px) rotate(720deg) scale(0); }
}

/* Кнопка "Поделиться" с заливкой */
#shareBtn {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: white;
    border: none;
    padding: 12px 28px;
    font-size: 1rem;
    border-radius: 50px;
    cursor: pointer;
    font-weight: 600;
    letter-spacing: 0.5px;
    z-index: 1;
    transition: color 0.3s ease;
}

#shareBtn::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background: #4CAF50;
    transition: width 1.5s ease;
    z-index: -1;
    border-radius: inherit;
}

#shareBtn.copied::after {
    width: 100%;
}

#shareBtn .share-text {
    position: relative;
    z-index: 2;
    transition: opacity 0.5s ease, transform 0.5s ease;
    display: inline-block;
}

#shareBtn .share-text.hidden {
    opacity: 0;
    transform: translateY(5px);
}
/* Затемнение контейнера в GAY MODE */
body.gay-mode .container {
    background: rgba(13, 11, 26, 0.85);
    backdrop-filter: blur(25px);
    border-color: rgba(255, 255, 255, 0.2);
}
