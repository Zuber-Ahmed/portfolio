import { motion as Motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

const About = () => {
  const stats = [
    { label: 'Experience', value: '6+ Years' },
    { label: 'Specility', value: 'Front-End' },
    { label: 'Focus', value: 'Performance & UX' },
  ];
  const grlows = [
    '-top-10 -left-10 w-[360px] h-[360px] opacity-20 blur-[120px]',
    'bottom-0 -right-10 w-[420px] h-[420px] opacity-20 blur-[160px] delay-300',
    'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] opacity-10',
  ];
  return (
    <section
      id="about"
      className="min-h-screen w-full flex items-center justify-center relative bg-black text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {grlows.map((c, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-linear-to-r from-[#302b63] via-[#00bf8f] to-[#1cd8d2] animate-pulse ${c}`}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 lg:px-12 py-20 flex flex-col gap-12">
        <Motion.div
          className="flex flex-col  md:flex-row items-center md:items-stretch  gap-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.4 }}>
          <Motion.div
            className="relative w-40 h-40 md:w-50 md:h-50 overflow-hidden rounded-2xl shadow-2xl bf:gradient-to-r from-[#302b63] via-[#00bf8f] to-[#1cd8d2] border  border-[#1cd8d2]/25
          "
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
            <div className="relative inset-0">
              <Image src="/p2.jpeg" alt="Zuber Ahmed" fill />
            </div>
          </Motion.div>

          <div className="flex-1 flex flex-col justify-center text-center md:text-left">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#1cd8d2] via-[#00bf8f] to-[#1cd8d2]">
              Zuber Ahmed
            </h2>
            <p className="mt-2 text-lg sm:text-xl text-white/90 font-semibold">
              Full Stack Developer
            </p>
            <p className="mt-4 text-gray-300 leading-relaxed text-base sm:text-lg max-w-2xl md:max-w-3xl">
              I build scalable, modern applications with a strong focus on
              performance and user experience. My expertise spans fullstack
              frontend development, allowing me to create seamless and reliable
              application.
            </p>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap:3 sm:gap-3 max-w-xl">
              {stats.map((stat, index) => (
                <Motion.div
                  key={index}
                  className="flex flex-col rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.4 }}
                  viewport={{ once: true, amount: 0.4 }}>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                  <div className="text-base font-semibold">{stat.value}</div>
                </Motion.div>
              ))}
              <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                <a
                  href="#project"
                  className="inline-flex items-center justify-center rounded-lg bg-white text-black font-semibold py-3 px-5 hover:bg-gray-200 transition">
                  View Project
                </a>
                <a
                  href="#contact"
                  className="inline-flex item-center justify-center border border-white/20 bg-white/10 text-white px-5 py-3 hover:bg-white/20 transition ">
                  Get in Touch
                </a>
              </div>
            </div>
          </div>
        </Motion.div>
        <Motion.div
          className="text-center md:text-left"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            About Me
          </h3>
          <p className="text-gray-300 leading-relaxed text-base sm:text-lg">
            I am a versatile and highly adaptable Full-stack Developer with
            expertise in various technologies, including ReactJS, JavaScript,
            TypeScript, NodeJS, NextJS, ExpressJS and AWS. With a passion for
            problem-solving, I thrive on delivering robust solutions and am
            actively involved in all stages of the software development life
            cycle mostly contributed in Banking Financial Domain.
          </p>
          <p className="mt-4 text-gray-400 text-base sm:text-lg">
            I love turning ideas into scable, user-friendly products that make
            an impact.
          </p>
        </Motion.div>
      </div>
    </section>
  );
};

export default About;
