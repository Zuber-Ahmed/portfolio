import emailjs from '@emailjs/browser';
import { motion as Motion } from 'framer-motion';
import React from 'react';

import Astra from '@/app/assets/Astra.png';
import ParticlesBackground from '@/app/components/ParticlesBackground/ParticlesBackground';
import { PUBLIC_KEY, SERVICE_ID, TEMPLATE_ID } from '@/app/config/env';

const Contact = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
  });

  const [error, setError] = React.useState({});
  const [status, setStatus] = React.useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (error[name]) setError(p => ({ ...p, [name]: '' }));
  };

  const validateForm = () => {
    const required = ['name', 'email', 'phone'];
    const newErrors = {};

    required.forEach(
      f =>
        !formData[f].trim() && (newErrors[f] = 'Opps! You missed this field.'),
    );
    setError(newErrors);
    return !Object.keys(newErrors).length;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    setStatus('sending');
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          ...formData,
          from_name: formData.name,
          replay_to: formData.email,
        },
        PUBLIC_KEY,
      );
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
      });
    } catch (error) {
      console.error('EmailJs Error', error);
      setStatus('error');
    }
  };
  React.useEffect(() => {
    const id = setTimeout(() => {
      if (status) setStatus('');
    }, 5000);

    return () => clearTimeout(id);
  }, [status]);
  return (
    <section
      id="contact"
      className="w-full min-h-screen relative bg-black overflow-hidden text-white py-20 px-6 md:px-20 flex flex-col
    md:flex-row items-center gap-10">
      <ParticlesBackground />

      <div className="relative z-10 w-full flex flex-col md:flex-row items-center gap-10">
        <Motion.div
          className="w-full md:w-1/2 flex justify-center"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}>
          <Motion.img
            src={Astra}
            alt="Contact"
            className="w-72 md:w-140 rounded-2xl shadow-lg object-cover"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </Motion.div>

        <Motion.div
          className="w-full md:w-1/2 bg-white/5 p-8 rounded-2xl shadow-lg border border-white/10"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}>
          <h2 className="text-3xl font-black mb-6">{"Let's Connect 🙂"}</h2>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label className="mb-1">
                Your Name <span className="text-red-500"></span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                placeholder="Enter your name..."
                className={`p-3 rounded-md bg-white/10 border ${
                  error.name ? 'border-red-500' : 'border-gray-500'
                } text-white focus:outline-none focus:border-blue-500`}
                onChange={handleChange}
              />
              {error.name && (
                <p className="text-red-500 text-sm">{error.name}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="mb-1">
                Your Email <span className="text-red-500"></span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="Enter your email..."
                className={`p-3 rounded-md bg-white/10 border ${
                  error.email ? 'border-red-500' : 'border-gray-500'
                } text-white focus:outline-none focus:border-blue-500`}
                onChange={handleChange}
              />
              {error.email && (
                <p className="text-red-500 text-sm">{error.email}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="mb-1">
                Your Contact Number <span className="text-red-500"></span>
              </label>
              <input
                type="number"
                name="phone"
                value={formData.phone}
                placeholder="Enter your contact number..."
                className={`p-3 rounded-md bg-white/10 border ${
                  error.phone ? 'border-red-500' : 'border-gray-500'
                } text-white focus:outline-none focus:border-blue-500`}
                onChange={handleChange}
              />
              {error.phone && (
                <p className="text-red-500 text-sm">{error.phone}</p>
              )}
            </div>
            {status && (
              <p
                className={`text-sm ${
                  status === 'success'
                    ? 'text-green-400'
                    : status === 'error'
                      ? 'text-red-500'
                      : 'text-yellow-400'
                }`}>
                {status === 'sending'
                  ? `Sending...`
                  : status === `success`
                    ? 'Message sent successfully ✅'
                    : 'Something went wrong ❌'}
              </p>
            )}

            <Motion.button
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded font-semibold transition"
              whileInView={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={status === 'sending'}
              type="submit">
              {status === 'sending' ? 'sending...' : 'Send message'}
            </Motion.button>
          </form>
        </Motion.div>
      </div>
    </section>
  );
};

export default Contact;
