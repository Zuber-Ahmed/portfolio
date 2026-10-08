import { motion as Motion, useMotionValue } from 'framer-motion';
import React from 'react';
import { DiMysql, DiNodejsSmall } from 'react-icons/di';
import {
  FaAws,
  FaBootstrap,
  FaFigma,
  FaGithub,
  FaJenkins,
  FaReact,
} from 'react-icons/fa';
import {
  SiBlueprint,
  SiFastapi,
  SiGithubcopilot,
  SiMongodb,
  SiNextdotjs,
  SiPostman,
  SiRedux,
  SiStrapi,
  SiSwagger,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si';
import { TbBrandReactNative } from 'react-icons/tb';

const Skills = () => {
  const skills = [
    { icon: <FaReact />, name: 'React' },
    { icon: <SiNextdotjs />, name: 'Next.js' },
    { icon: <SiTypescript />, name: 'TypeScript' },
    { icon: <SiTailwindcss />, name: 'Tailwind CSS' },
    { icon: <FaBootstrap />, name: 'Bootstrap' },
    { icon: <SiFastapi />, name: 'FastAPI' },
    { icon: <DiNodejsSmall />, name: 'Node.js' },
    { icon: <SiMongodb />, name: 'MongoDB' },
    { icon: <FaJenkins />, name: 'Jenkins' },
    { icon: <FaAws />, name: 'AWS' },
    { icon: <SiPostman />, name: 'Postman' },
    { icon: <SiSwagger />, name: 'Swagger' },
    { icon: <SiGithubcopilot />, name: 'GitHub Copilot' },
    { icon: <SiStrapi />, name: 'Strapi' },
    { icon: <FaFigma />, name: 'Figma' },
    { icon: <SiBlueprint />, name: 'BlueprintJS' },
    { icon: <DiMysql />, name: 'MySQL' },
    { icon: <SiRedux />, name: 'Redux' },
    { icon: <FaGithub />, name: 'GitHub' },
    { icon: <TbBrandReactNative />, name: 'React Native' },
  ];
  const repeated = [...skills, ...skills];
  const [active, setActive] = React.useState(false);
  const [dir, setDir] = React.useState(-1);
  const containerRef = React.useRef(null);
  const trackRef = React.useRef(null);
  const touchRef = React.useRef(null);
  const x = useMotionValue(0);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting && entry.intersectionRatio >= 0.1);
      },
      { threshold: [0.1] },
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    if (!active) return;
    const onWheel = e => setDir(e.deltaY > 0 ? -1 : 1);
    const onTouchStart = e => (touchRef.current = e.touches[0].clientY);

    const onTouchMove = e => {
      if (touchRef.current == null) return;
      const delta = e.touches[0].clientY - touchRef.current;
      setDir(delta > 0 ? 1 : -1);
      touchRef.current = e.touches[0].clientY;
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [active]);

  React.useEffect(() => {
    let id;
    let last = performance.now();

    const speed = 80; // pixels per second
    const tick = now => {
      const delta = (now - last) / 1000;
      last = now;
      let next = x.get() + speed * dir * delta;
      const loop = trackRef.current?.scrollWidth / 2 || 0;

      if (loop) {
        if (next <= -loop) next += loop;
        if (next >= 0) next -= loop;
      }
      x.set(next);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(id);
  }, [dir, x]);

  return (
    <section
      ref={containerRef}
      id="skills"
      className="h-1/2 w-full pb-8 flex flex-col items-center justify-center relative bg-black text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-[#302b63] via-[#00bf8f] to-[#1cd8d2] opacity-20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-[#302b63] via-[#00bf8f] to-[#1cd8d2] opacity-20 blur-[120px] animate-pulse delay-500" />
      </div>

      <Motion.h2
        className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1cd8d2] via-[#00bf8f] to-[#302b63]"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}>
        My Skills
      </Motion.h2>
      <Motion.p
        className="mt-2 mb-8 text-white/90 text-base sm:text-lg z-10"
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}>
        Modern Applications | Modern Technologies
      </Motion.p>

      <div className="relative w-full overflow-hidden">
        <Motion.div
          ref={trackRef}
          style={{ x, whiteSpace: 'nowrap', willChange: 'transform' }}
          className="flex gap-10 text-6xl text-[#1cd8d2] animate-scroll whitespace-nowrap"
          initial={{ x: 0 }}>
          {repeated.map((skill, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 min-w-[120px]"
              aria-label={skill.name}
              title={skill.name}>
              <span className="hover:scale-125  transition-transform duration-300">
                {skill.icon}
              </span>
              <p className="text-sm">{skill.name}</p>
            </div>
          ))}
        </Motion.div>
      </div>
    </section>
  );
};

export default Skills;
