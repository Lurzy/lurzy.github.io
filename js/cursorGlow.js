export function initCursorGlow() {
  const canvas = document.createElement('canvas');
  canvas.id = 'cursorGlowCanvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5; /* выше частиц, но ниже контента */
    pointer-events: none;
  `;
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let mouseX = -1000;
  let mouseY = -1000;
  let targetX = -1000;
  let targetY = -1000;
  const glowRadius = 250;       // радиус свечения
  const glowIntensity = 0.15;   // максимальная непрозрачность (0..1)

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  // Плавное следование
  function animate() {
    mouseX += (targetX - mouseX) * 0.1;
    mouseY += (targetY - mouseY) * 0.1;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Создаём радиальный градиент
    const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, glowRadius);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${glowIntensity})`);
    gradient.addColorStop(0.5, `rgba(192, 132, 252, ${glowIntensity * 0.6})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    requestAnimationFrame(animate);
  }

  resizeCanvas();
  animate();
}