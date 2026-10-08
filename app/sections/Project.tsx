import {
  AnimatePresence,
  motion as Motion,
  useMotionValueEvent,
  useScroll,
} from 'framer-motion';
import Image from 'next/image';
import React from 'react';

import img1 from '@/app/assets/img1.jpg';
import img2 from '@/app/assets/img2.jpg';
import img3 from '@/app/assets/img3.jpg';
import photo1 from '@/app/assets/photo1.jpg';
import photo2 from '@/app/assets/photo2.png';
import photo3 from '@/app/assets/photo3.png';

const useInMobile = (query = '(max-width: 639px)') => {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia(query);
    const handler = e => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    setIsMobile(mediaQuery.matches);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return isMobile;
};
const Project = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const isMobile = useInMobile();
  const sceneRef = React.useRef(null);

  const project = React.useMemo(
    () => [
      {
        title: 'Bank of Cyprus UK',
        description:
          'A banking application for Cyprus Bank UK, providing users with seamless access to their accounts and financial services.',
        imageUrl: isMobile ? photo1 : img2,
        projectUrl: 'https://www.bankofcyprus.com/',
        bgColor: 'teal',
      },
      {
        title: 'Teleformica',
        description:
          'A comprehensive telecommunication management platform that streamlines operations and enhances customer experience for telecom providers.',
        imageUrl: isMobile ? photo2 : img1,
        projectUrl: 'https://www.telefonica.com/en/',
        bgColor: 'blue',
      },
      {
        title: 'HSBC UK',
        description:
          'A robust banking solution for HSBC UK, offering users a secure and user-friendly interface to manage their finances effectively.',
        imageUrl: isMobile ? photo3 : img3,
        projectUrl: 'https://www.hsbc.co.uk/',
        bgColor: '#DB0011',
      },
    ],
    [isMobile],
  );

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start start', 'end end'],
  });

  const thresholds = project.map((_, index) => (index + 1) / project.length);

  useMotionValueEvent(scrollYProgress, 'change', v => {
    const idx = thresholds.findIndex(t => v < t);
    setActiveIndex(idx === -1 ? project.length - 1 : idx);
  });
  const activeProject = project[activeIndex];

  return (
    <section
      ref={sceneRef}
      className="relative text-white"
      id="project"
      style={{
        height: `${100 * project.length}vh`,
        backgroundColor: activeProject.bgColor,
        transition: 'background-color 400ms ease',
      }}>
      <div className="sticky top-0 h-screen flex flex-col item-center justify-center">
        <h2
          className={`text-3xl font-semibold z-10 text-center ${
            isMobile ? 'mt-4' : 'mt-8'
          }`}>
          My Work
        </h2>
        <div
          className={`relative flex-1 w-full flex items-center justify-center ${
            isMobile ? '-mt-4' : ''
          }`}>
          {project.map((proj, indx) => (
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                activeIndex === indx
                  ? 'opacity-100 z-20'
                  : 'opacity-0 z-0 sm:z-10'
              }`}
              key={indx}
              style={{ width: '85%', maxWidth: '1200px' }}>
              <AnimatePresence mode="wait">
                {activeIndex === indx && (
                  <Motion.h3
                    key={proj.title}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`block text-center text-[clamp(2rem, 6vw,3rem)] text-white sm:absolute sm:top-20 sm:left[35%] lg:left-[-5%] sm:mb-0 italic font-semibold
                     ${isMobile ? '-mt-4' : ''} sm:top-[-6%]`}
                    style={{
                      zIndex: 5,
                      textAlign: isMobile ? 'center' : 'left',
                    }}>
                    {proj.title}
                  </Motion.h3>
                )}
              </AnimatePresence>

              <div
                className={`relative w-full overflow-hidden bg-black/20 shadow-2xl md:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7)] ${
                  isMobile ? 'mb-6 rounded-lg' : 'mb-10 sm:mb-12 rounded-xl'
                }
              h-[62vh] sm:h-[66vh]`}
                style={{ zIndex: 10, transition: 'box-shadow 250ms ease' }}>
                <div className="w-full h-full object-cover drop-shadow-xl md:drop-shadow-2xl">
                  <Image
                    src={proj.imageUrl}
                    alt={proj.title}
                    aria-describedby={proj.description}
                    //className="object-cover drop-shadow-xl md:drop-shadow-2xl"
                    fill
                    style={{
                      //position: 'relative',
                      zIndex: 10,
                      filter: 'drop-shadow(0 16px 40px rgba(0, 0, 0, 0.65))',
                      transition: 'filter 250ms ease',
                    }}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className={` absolute ${isMobile ? 'bottom-10' : 'bottom-5'} ${isMobile ? 'left-[30%]' : 'left-[46%]'}`}>
          <a
            target="_blank"
            href={activeProject.projectUrl}
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-white text-black font-semibold rounded-lg shadow-md hover:bg-gray-200 transition-all"
            aria-label={`View project: ${activeProject.title}`}>
            View Project
          </a>
        </div>
      </div>
    </section>
  );
};

export default Project;
