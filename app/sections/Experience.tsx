import { motion as Motion, useScroll, useTransform } from 'framer-motion';
import React from 'react';

const ExperienceItem = ({ exp, idx, start, end, scrollYProgress, layout }) => {
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
const experiences = [
  {
    role: 'Software Engineer II',
    company: 'Synechron Technologies',
    duration: 'Sept 2023 - Nov 2025',
    description:
      'Developed and maintained web applications using ReactJS, improving performance by 30%. Collaborated with cross-functional teams to design scalable solutions for financial clients.',
  },
  {
    role: 'Software Engineer II',
    company: 'Wipro Technologies.',
    duration: 'Jul 2022 - Sept 2023',
    description:
      'Implemented new features and optimized existing codebase for a SaaS platform, resulting in a 20% increase in user engagement. Participated in code reviews and agile ceremonies.',
  },
  {
    role: 'Software Engineer I',
    company: 'Al Kabeer Group.',
    duration: 'Aug 2019 - May 2022',
    description:
      'Led the development of an internal inventory management system using Node.js and Express, reducing manual errors by 25%. Worked closely with stakeholders to gather requirements and deliver solutions on time.',
  },
];
const thresholds = experiences.map(
  (_, index) => (index + 1) / experiences.length,
);

const Experience = () => {
  const sceneRef = React.useRef(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const SCENE_HEIGHT_VH = isMobile
    ? 160 * experiences.length
    : 120 * experiences.length;
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start start', 'end end'],
  });

  const lineSize = useTransform(scrollYProgress, v => `${v * 100}%`);

  return (
    <section className="bg-black text-white relative" id="experience">
      <div
        ref={sceneRef}
        style={{ height: `${SCENE_HEIGHT_VH}vh`, minHeight: '120vh' }}
        className="relative ">
        <div className="sticky top-0 h-screen flex flex-col">
          <h2 className="text-4xl sm:text-5xl font-semibold mt-5 text-center">
            Experience
          </h2>
          <div className="flex flex-1 items-center justify-center px-6 pb-10">
            {!isMobile && (
              <div className="relative w-full max-w-7xl">
                <div className="relative h-[6px] bg-white/15 rounded">
                  <Motion.div
                    className="absolute left-0 top-0 h-[6px] bg-white rounded origin-left"
                    style={{ width: lineSize }}></Motion.div>
                </div>

                <div className="relative flex justify-between mt-0">
                  {experiences.map((exp, idx) => (
                    <ExperienceItem
                      key={idx}
                      exp={exp}
                      idx={idx}
                      start={idx === 0 ? 0 : thresholds[idx - 1]}
                      end={thresholds[idx]}
                      scrollYProgress={scrollYProgress}
                      layout="desktop"
                    />
                  ))}
                </div>
              </div>
            )}

            {isMobile && (
              <div className="relative w-full max-w-md">
                <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-white/15 rounded">
                  <Motion.div
                    className="absolute top-0 left-0 w-[6px] bg-white rounded origin-top "
                    style={{
                      height: lineSize,
                    }}></Motion.div>
                </div>
                <div className="relative flex flex-col gap-10 ml-10 mt-6 pb-28">
                  {experiences.map((exp, idx) => (
                    <ExperienceItem
                      key={idx}
                      exp={exp}
                      idx={idx}
                      start={idx === 0 ? 0 : thresholds[idx - 1]}
                      end={thresholds[idx]}
                      scrollYProgress={scrollYProgress}
                      layout="mobile"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
