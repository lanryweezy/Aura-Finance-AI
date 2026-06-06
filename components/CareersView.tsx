
import React from 'react';
import { Briefcase, MapPin, DollarSign, ArrowRight } from 'lucide-react';

const OPEN_ROLES = [
  {
    id: 1,
    title: "Senior AI Engineer (Gemini/LLMs)",
    department: "Engineering",
    location: "Lagos / Remote",
    salary: "₦1.5M - ₦2.5M / mo",
    type: "Full-time"
  },
  {
    id: 2,
    title: "Product Designer (Fintech)",
    department: "Design",
    location: "Remote",
    salary: "₦800k - ₦1.2M / mo",
    type: "Full-time"
  },
  {
    id: 3,
    title: "Customer Success Manager",
    department: "Growth",
    location: "Abuja",
    salary: "₦500k - ₦750k / mo",
    type: "Full-time"
  }
];

export const CareersView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in duration-500">
      <div className="text-center mb-20">
        <h1 className="text-5xl font-black mb-6 text-gray-900 dark:text-white tracking-tight">Join the Future of Finance</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
          Help us build the tools that are redefining how businesses operate across the continent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="p-10 bg-brand-cyan/10 rounded-[3rem] border border-brand-cyan/20">
          <h2 className="text-2xl font-black mb-4">Why Aura?</h2>
          <ul className="space-y-4 text-gray-600 dark:text-gray-300 font-medium">
            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-brand-cyan rounded-full"></span> Competitive salaries in NGN or USD</li>
            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-brand-cyan rounded-full"></span> Full health insurance & wellness perks</li>
            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-brand-cyan rounded-full"></span> Flexible remote-first culture</li>
            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-brand-cyan rounded-full"></span> Quarterly team off-sites across Africa</li>
          </ul>
        </div>
        <div className="p-10 bg-brand-purple/10 rounded-[3rem] border border-brand-purple/20">
          <h2 className="text-2xl font-black mb-4">Our Values</h2>
          <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
            We value speed, autonomy, and radical transparency. We believe in building in the open and taking big bets on emerging technologies.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-black mb-8 text-gray-900 dark:text-white">Open Roles</h2>
        {OPEN_ROLES.map((role) => (
          <div key={role.id} className="p-8 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-brand-cyan transition-colors group cursor-pointer">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-brand-cyan transition-colors">{role.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500">
                <span className="flex items-center gap-1"><Briefcase size={14} /> {role.department}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {role.location}</span>
                <span className="flex items-center gap-1"><DollarSign size={14} /> {role.salary}</span>
              </div>
            </div>
            <button className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-black rounded-2xl group-hover:bg-brand-cyan group-hover:text-black transition-all flex items-center gap-2">
              Apply Now <ArrowRight size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
