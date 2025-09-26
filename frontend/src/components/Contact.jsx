import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2500);
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!message.trim()) e.message = 'Message is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      try {
        await axios.post('http://localhost:5000/api/contacts', { name, email, message });
      } catch (_) {
        await axios.post('/api/contacts', { name, email, message });
      }
      setName(''); setEmail(''); setMessage('');
      showToast('success', 'Message sent');
      setErrors({});
    } catch (e) {
      showToast('error', 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg border text-sm ${toast.type==='error'?'bg-red-50 border-red-200 text-red-700':'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left: Intro / Illustration */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 p-8 text-white shadow-xl">
            <h1 className="text-3xl font-bold">Get in touch</h1>
            <p className="mt-2 text-indigo-100">Have questions or feedback? Send us a message and we’ll get back to you shortly.</p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">📧</span>
                <div>
                  <p className="text-sm text-indigo-100">Email</p>
                  <p className="font-medium">support@prp.example</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">🏢</span>
                <div>
                  <p className="text-sm text-indigo-100">Head Office</p>
                  <p className="font-medium">Silicon Valley, CA</p>
                </div>
              </div>
            </div>

            <img alt="contact" src="/banner.png" className="mt-8 w-full rounded-xl shadow-md ring-1 ring-white/20" />
          </motion.div>

          {/* Right: Form */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
            className="bg-white rounded-2xl shadow-xl p-6 border">
            <h2 className="text-xl font-semibold text-gray-900">Send us a message</h2>
            <p className="text-sm text-gray-500 mb-4">We typically respond within 1–2 business days.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name *</label>
                <div className={`mt-1 flex items-center gap-2 rounded-md border px-3 ${errors.name ? 'border-red-300' : 'border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500'}`}>
                  <span className="text-gray-400">👤</span>
                  <input value={name} onChange={e=>setName(e.target.value)} className="w-full py-2 outline-none" placeholder="Your full name" />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Email *</label>
                <div className={`mt-1 flex items-center gap-2 rounded-md border px-3 ${errors.email ? 'border-red-300' : 'border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500'}`}>
                  <span className="text-gray-400">✉️</span>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full py-2 outline-none" placeholder="you@example.com" />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Message *</label>
                <div className={`mt-1 rounded-md border ${errors.message ? 'border-red-300' : 'border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500'}`}>
                  <textarea rows={6} value={message} onChange={e=>setMessage(e.target.value)} className="w-full px-3 py-2 outline-none rounded-md" placeholder="How can we help?" />
                </div>
                {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={()=>{ setName(''); setEmail(''); setMessage(''); setErrors({}); }} className="px-4 py-2 rounded-md border">
                  Clear
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
