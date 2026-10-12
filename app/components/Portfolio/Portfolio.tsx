'use client';
import { Suspense, useState } from 'react';

import { CustomCursor } from '@/app/components/CustomCursor/CustomCursor';
import IntroAnimator from '@/app/components/IntroAnimator/IntroAnimator';
import LoadingOverlay from '@/app/components/LoadingOverlay/LoadingOverlay';
import NavBar from '@/app/components/NavBar/NavBar';
import About from '@/app/sections/About';
import Contact from '@/app/sections/Contact';
import Experience from '@/app/sections/Experience';
import Footer from '@/app/sections/Footer';
import Home from '@/app/sections/Home';
import Project from '@/app/sections/Project';
import Skills from '@/app/sections/Skills';

export default function Portfolio() {
  const [showIntro, setShowIntro] = useState(false);

  return (
    <>
      <Suspense fallback={<LoadingOverlay visible={!showIntro} />}>
        {!showIntro && <IntroAnimator onFinish={() => setShowIntro(true)} />}
      </Suspense>
      {showIntro && (
        <div className="relative gradient text-white">
          <Suspense fallback={<LoadingOverlay visible={showIntro} />}>
            <CustomCursor />
          </Suspense>
          <Suspense fallback={<LoadingOverlay visible={showIntro} />}>
            <NavBar />
          </Suspense>
          <Suspense fallback={<LoadingOverlay visible={showIntro} />}>
            <Home />
          </Suspense>
          <Suspense fallback={<LoadingOverlay visible={showIntro} />}>
            <About />
          </Suspense>
          <Suspense fallback={<LoadingOverlay visible={showIntro} />}>
            <Skills />
          </Suspense>
          <Suspense fallback={<LoadingOverlay visible={showIntro} />}>
            <Project />
          </Suspense>
          <Suspense fallback={<LoadingOverlay visible={showIntro} />}>
            <Experience />
          </Suspense>
          <Suspense fallback={<LoadingOverlay visible={showIntro} />}>
            <Contact />
          </Suspense>
          <Suspense fallback={<LoadingOverlay visible={showIntro} />}>
            <Footer />
          </Suspense>
        </div>
      )}
    </>
  );
}
