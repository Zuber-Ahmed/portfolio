'use client';

import {
  motion as Motion,
  type MotionValue,
  useTransform,
} from 'framer-motion';

type ExperienceItemProps = {
  exp: { role: string; company: string; duration: string; description: string };
  idx: number;
  start: number;
  end: number;
  scrollYProgress: MotionValue<number>;
  layout: 'desktop' | 'mobile';
};

const ExperienceItem = ({
  exp,
  idx,
  start,
  end,
  scrollYProgress,
  layout,
}: ExperienceItemProps) => {
  const scale = useTransform(scrollYProgress, [start, end], [0, 1]);
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const y = useTransform(
    scrollYProgress,
    [start, end],
    [idx % 2 === 0 ? 30 : -30, 0],
  );
  const x = useTransform(scrollYProgress, [start, end], [-24, 0]);

  if (layout === 'desktop') {
    return (
      <div className="relative flex flex-1 justify-center items-center min-w-0">
        <Motion.div
          className="z-10 w-7 h-7 rounded-full bg-white shadow-[0_0_0_80px_rgba(255,255,255,0.1)]"
          style={{ scale, opacity }}></Motion.div>
        <Motion.div
          className={`absolute ${
            idx % 2 === 0 ? '-top-8' : '-bottom-8'
          } bg-white/40 w-[3px]`}
          style={{ height: 40, opacity }}></Motion.div>
        <Motion.article
          className={`absolute ${
            idx % 2 === 0 ? 'bottom-12' : 'top-12'
          } backdrop-blur border p-7 bg-gray-900/80 rounded-xl w-[320px] shadow-lg`}
          style={{
            opacity,
            y,
            maxWidth: '90vw',
          }}
          transition={{ duration: 0.4, delay: idx * 0.15 }}>
          <h3> {exp.role}</h3>
          <p className="text-md text-gray-400 mb-3">
            {exp.company} | {exp.duration}
          </p>
          <p className="text-gray-300 break-words">{exp.description}</p>
        </Motion.article>
      </div>
    );
  }
  return (
    <div className="relative flex item-start">
      <Motion.div
        className="absolute -left-[40px] top-3 z-10 w-7 h-7 rounded-full bg-white shadow-[0_0_0_80px_rgba(255,255,255,0.1)]"
        style={{ scale, opacity }}>
        <Motion.article
          className="bg-gray-900/80 backdrop-blur border border-gray-700/70 p-5 rounded-xl w-[90vw] max-w-sm ml-6 shadow-lg"
          style={{ opacity, x }}
          transition={{ duration: 0.4, delay: idx * 0.15 }}>
          <h3 className="text-lg font-semibold break-word">{exp.role}</h3>

          <p className="text-sm text-gray-400 break-word">
            {exp.company} | {exp.duration}
          </p>
          <p className="text-sm text-gray-300 break-word">{exp.description}</p>
        </Motion.article>
      </Motion.div>
    </div>
  );
};

export default ExperienceItem;
