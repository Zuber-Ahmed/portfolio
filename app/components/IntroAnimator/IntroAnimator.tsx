import { AnimatePresence, motion as Motion } from 'framer-motion';
import React from 'react';

const GREETINGS = [
  'Hello',
  'नमस्ते',
  'Hola',
  'Bonjour',
  'Ciao',
  'Olá',
  'Здравствуйте',
  'Merhaba',
  'Γειά',
  'Hej',
  'Hallo',
  'Salam',
  'Konnichiwa',
  'Zdravstvuyte',
  'Nǐ hǎo',
];

const IntroAnimator = ({ onFinish }: { onFinish: () => void }) => {
  const [index, setIndex] = React.useState(0);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (index < GREETINGS.length - 1) {
      const timeout = setInterval(() => {
        setIndex(index + 1);
      }, 180);
      return () => clearInterval(timeout);
    } else {
      const id = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(id);
    }
  }, [index]);

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {visible && (
        <Motion.div
          key="intro-animator"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black text-white overflow-hidden"
          initial={{ y: 1 }}
          exit={{
            y: '-100%',
            transition: { duration: 1.05, ease: [0.22, 1, 0.36, 1] },
          }}>
          <Motion.h1
            key={index}
            className="text-5xl md:text-7xl lg:text-8xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.12 }}>
            {GREETINGS[index]}
          </Motion.h1>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimator;
