
import React, { useState } from 'react';
import { Mail, MessageSquare, Phone, Send, MapPin } from 'lucide-react';
import { useToast } from './ui/Toast';

export const ContactView: React.FC = () => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      showToast("Message sent! We'll get back to you within 24 hours.", "success");
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4 text-gray-900 dark:text-white tracking-tight">Get in Touch</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">Have questions? Our team is here to help you scale.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div>
          <div className="space-y-12">
            <div className="flex gap-6">
              <div className="w-14 h-14 bg-brand-cyan/20 rounded-2xl flex items-center justify-center shrink-0">
                <Mail className="text-brand-cyan" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Us</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Support: hello@aura.ai</p>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Sales: sales@aura.ai</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-14 h-14 bg-brand-purple/20 rounded-2xl flex items-center justify-center shrink-0">
                <Phone className="text-brand-purple" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Call Us</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">+234 (0) 800-AURA-FIN</p>
                <p className="text-sm text-gray-400 font-medium mt-2">Mon-Fri, 9am-6pm WAT</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-14 h-14 bg-brand-pink/20 rounded-2xl flex items-center justify-center shrink-0">
                <MapPin className="text-brand-pink" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Visit Our Office</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No. 12, Admiralty Way,</p>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Lekki Phase 1, Lagos, Nigeria.</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[3rem] space-y-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Full Name</label>
              <input required type="text" className="w-full bg-gray-50 dark:bg-dark-primary border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-sm focus:border-brand-cyan outline-none transition-colors" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email Address</label>
              <input required type="email" className="w-full bg-gray-50 dark:bg-dark-primary border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-sm focus:border-brand-cyan outline-none transition-colors" placeholder="john@company.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Subject</label>
            <select className="w-full bg-gray-50 dark:bg-dark-primary border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-sm focus:border-brand-cyan outline-none transition-colors appearance-none">
              <option>General Inquiry</option>
              <option>Sales & Demo</option>
              <option>Technical Support</option>
              <option>Partnership</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Message</label>
            <textarea required rows={4} className="w-full bg-gray-50 dark:bg-dark-primary border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-sm focus:border-brand-cyan outline-none transition-colors resize-none" placeholder="How can we help?"></textarea>
          </div>
          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full py-5 bg-brand-cyan text-black font-black text-lg rounded-2xl hover:bg-brand-cyan/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
            {!isSubmitting && <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};
