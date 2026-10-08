import { motion as Motion } from 'framer-motion';
import React from 'react';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

const social = [
  { Icon: FaGithub, label: 'GitHub', href: 'https://github.com/Zuber-Ahmed' },
  {
    Icon: FaLinkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/zuber-ahmed-04a194102/',
  },
  { Icon: FaXTwitter, label: 'Twitter', href: '' },
];

const glowVariants = {
  initial: { scale: 1, y: 0, filter: 'drop-shadow(0 0 0 rgba(0, 0, 0, 0))' },
  hover: {
    scale: 1.2,
    y: -3,
    filter:
      'drop-shadow(0 0 8px,rgba(13, 88, 204,0.9)) drop-shadow(0 0 18px,rgba(16, 185, 129,0.8))',
    transition: { type: 'spring', stiffness: 300, damping: 15 },
  },
  tap: { scale: 0.9, y: 0, transition: { duration: 0.08 } },
};

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_70%_35%,rgba(13,88,202,0.25),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_55%_at_30%_70%,rgba(16,185,129,0.35),transparent_70%)]" />
      <Motion.div
        className="relative z-10 px-4 sm:px-8 lg:px-10 py-16 md:py-20 flex  flex-col items-center text-center space-y-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}>
        <h1
          className="font-semibold leading-none text-white text-center select-none"
          style={{
            fontSize: 'clamp(3rem, 5vw, 14rem)',
            letterSpacing: '0.2em',
            lineHeight: 0.9,
            padding: '0 3vw',
            whiteSpace: 'nowrap',
            textShadow: '0 2px 18px rgba(0,0,0,0,0.45)',
          }}>
          Zuber Ahmed
        </h1>

        <div className="h-[3px] w-24 md:w-32 rounded-full bg-gradient-to-r from-[#0d58cc] via-cyan-300 to-emerald-400" />
        <div className="flex gap-5 text-2xl md:text-3xl">
          {social.map(({ Icon: SocialIcon, label, href }) => (
            <Motion.a
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noopener noreferrer"
              variants={glowVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="text-gray-300 transition-colors duration-200 inline-flex items-center justify-center">
              {React.createElement(SocialIcon)}
            </Motion.a>
          ))}
        </div>
        <p className="text-gray-300 italic">
          The most difficult thing is the decision to act; the rest is merely
          tenacity.
        </p>
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Zuber Ahmed
        </p>
      </Motion.div>
    </footer>
  );
};

export default Footer;
