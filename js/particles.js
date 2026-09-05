// particles.js
export function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particlesCanvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    opacity: 0.8;
  `;
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -9999, y: -9999 };

  // Инициализируем цвет частиц, если он ещё не задан
  window.particlesColor = window.particlesColor || { r: 192, g: 132, b: 252 }; // фиолетовый по умолчанию

  function init() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
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
    draw();
    requestAnimationFrame(animate);
  }

  // Функция отрисовки одной частицы
  function drawParticle(p) {
    const color = window.particlesColor || { r: 192, g: 132, b: 252 };
    ctx.beginPath();
    ctx.arc(p.x + p.translateX, p.y + p.translateY, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${p.alpha})`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${p.alpha})`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Отрисовка всех частиц (один кадр)
  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach(drawParticle);
  }

  // Анимационный цикл
  function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const w = window.innerWidth;
    const h = window.innerHeight;

    particles.forEach((p, i) => {
      // Вычисление близости к краю для изменения прозрачности
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

      // Движение
      p.x += p.dx;
      p.y += p.dy;

      // Притяжение к мыши
      const dxMouse = (mouse.x - w / 2) / 50;
      const dyMouse = (mouse.y - h / 2) / 50;
      p.translateX += (dxMouse * p.magnetism - p.translateX) / 10;
      p.translateY += (dyMouse * p.magnetism - p.translateY) / 10;

      drawParticle(p);

      // Если частица улетела за край — заменяем её новой
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

    requestAnimationFrame(animate);
  }

  // Обработчики событий
  window.addEventListener('resize', init);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Запуск
  init();
}