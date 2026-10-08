'use client';
import { Suspense, useState } from 'react';
import { RingLoader } from 'react-spinners';

import CustomCursor from '@/app/components/CustomCursor/CustomCursor';
import IntroAnimator from '@/app/components/IntroAnimator/IntroAnimator';
import NavBar from '@/app/components/NavBar/NavBar';
import About from '@/app/sections/About';
import Contact from '@/app/sections/Contact';
import Experience from '@/app/sections/Experience';
import Footer from '@/app/sections/Footer';
import Home from '@/app/sections/Home';
import Project from '@/app/sections/Project';
import Skills from '@/app/sections/Skills';

const Activity = (visible: boolean) => (
  <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black text-white overflow-hidden">
    <RingLoader loading={visible} size={50} color="white" speedMultiplier={2} />
  </div>
);

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(false);

  return (
    <>
      <Suspense fallback={Activity(!showIntro)}>
        {!showIntro && <IntroAnimator onFinish={() => setShowIntro(true)} />}
      </Suspense>
      {showIntro && (
        <div className="relative gradient text-white">
          <Suspense fallback={Activity(showIntro)}>
            <CustomCursor />
          </Suspense>
          <Suspense fallback={Activity(showIntro)}>
            <NavBar />
          </Suspense>
          <Suspense fallback={Activity(showIntro)}>
            <Home />
          </Suspense>
          <Suspense fallback={Activity(showIntro)}>
            <About />
          </Suspense>
          <Suspense fallback={Activity(showIntro)}>
            <Skills />
          </Suspense>
          <Suspense fallback={Activity(showIntro)}>
            <Project />
          </Suspense>
          <Suspense fallback={Activity(showIntro)}>
            <Experience />
          </Suspense>
          <Suspense fallback={Activity(showIntro)}>
            <Contact />
          </Suspense>
          <Suspense fallback={Activity(showIntro)}>
            <Footer />
          </Suspense>
        </div>
      )}
    </>
  );
}
