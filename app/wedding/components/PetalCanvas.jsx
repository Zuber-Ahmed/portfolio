import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const COLORS = [
  '#e89ea4',
  '#f7d6dc',
  '#ffffff',
  '#f5e5c9',
  '#d4af37',
  '#c97d86',
];

const PetalCanvas = forwardRef(function PetalCanvas(_, ref) {
  const canvasRef = useRef(null);
  const burstRef = useRef(() => {});

  useImperativeHandle(
    ref,
    () => ({ burst: (count = 120) => burstRef.current(count) }),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    const petals = [];

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const createPetal = (burst = false) => {
      const isGold = Math.random() < 0.2;
      return {
        x: Math.random() * width,
        y: burst
          ? height * 0.45 + Math.random() * 120 - 60
          : Math.random() * -height,
        size: isGold ? Math.random() * 4 + 3 : Math.random() * 12 + 8,
        speedX: burst ? Math.random() * 14 - 7 : Math.random() * 1.8 - 0.9,
        speedY: burst ? Math.random() * -12 - 3 : Math.random() * 1.4 + 0.8,
        gravity: burst ? 0.35 : 0.02,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 2.5 - 1.25,
        opacity: Math.random() * 0.5 + 0.45,
        color: isGold
          ? '#d4af37'
          : COLORS[Math.floor(Math.random() * COLORS.length)],
        isGold,
        sway: Math.random() * 10,
      };
    };

    burstRef.current = count => {
      if (reducedMotion) return;
      const safeCount = Math.min(count, width < 600 ? 90 : 160);
      for (let index = 0; index < safeCount; index += 1)
        petals.push(createPetal(true));
    };

    const draw = petal => {
      context.save();
      context.translate(petal.x, petal.y);
      context.rotate((petal.rotation * Math.PI) / 180);
      context.globalAlpha = petal.opacity;
      context.fillStyle = petal.isGold ? '#dfb15b' : petal.color;
      context.beginPath();
      if (petal.isGold) {
        context.ellipse(
          0,
          0,
          petal.size * 0.8,
          petal.size * 0.4,
          0,
          0,
          Math.PI * 2,
        );
      } else {
        context.moveTo(0, 0);
        context.bezierCurveTo(
          -petal.size / 2,
          -petal.size / 2,
          -petal.size,
          petal.size / 3,
          0,
          petal.size,
        );
        context.bezierCurveTo(
          petal.size,
          petal.size / 3,
          petal.size / 2,
          -petal.size / 2,
          0,
          0,
        );
      }
      context.fill();
      context.restore();
    };

    const animate = () => {
      context.clearRect(0, 0, width, height);
      for (let index = petals.length - 1; index >= 0; index -= 1) {
        const petal = petals[index];
        petal.speedY = Math.min(petal.speedY + petal.gravity, 3.8);
        petal.y += petal.speedY;
        petal.x +=
          Math.sin((petal.y + petal.sway) * 0.008) * 1.2 + petal.speedX;
        petal.speedX *= 0.98;
        petal.rotation += petal.rotationSpeed;
        if (petal.y > height + 30) {
          if (petals.length > 24) petals.splice(index, 1);
          else Object.assign(petal, createPetal(false), { y: -20 });
        } else draw(petal);
      }
      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    if (!reducedMotion) {
      const ambientCount = width < 600 ? 12 : 24;
      for (let index = 0; index < ambientCount; index += 1)
        petals.push(createPetal(false));
      animate();
    }
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationFrame);
      burstRef.current = () => {};
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="wedding-petal-canvas"
      aria-hidden="true"
    />
  );
});

export default PetalCanvas;
