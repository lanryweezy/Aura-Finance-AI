
import React from 'react';
import { BookOpen, Calendar, Clock, User } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 1,
    title: "How AI is Transforming SMB Accounting in Nigeria",
    excerpt: "Discover how autonomous agents are reducing manual data entry by 90% for Lagos-based startups.",
    author: "Tunde Oladapo",
    date: "Feb 10, 2025",
    readTime: "5 min read",
    category: "AI & Finance",
    image: ""
  },
  {
    id: 2,
    title: "Understanding the 2025 Finance Act: What SMEs Need to Know",
    excerpt: "A deep dive into the latest tax changes from FIRS and how they impact your company income tax.",
    author: "Amaka Eze",
    date: "Feb 05, 2025",
    readTime: "8 min read",
    category: "Compliance",
    image: ""
  },
  {
    id: 3,
    title: "Scaling Your E-commerce Business with Smart Inventory",
    excerpt: "Why manual stock-taking is killing your margins and how to automate it across multiple warehouses.",
    author: "Ibrahim Musa",
    date: "Jan 28, 2025",
    readTime: "6 min read",
    category: "Inventory",
    image: ""
  }
];

export const BlogView: React.FC = () => {

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4 text-gray-900 dark:text-white tracking-tight">Aura Blog</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
          Insights, guides, and news on autonomous finance and business growth in Africa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {BLOG_POSTS.map((post) => (
          <article key={post.id} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden hover:shadow-xl transition-all group">
            <div className="aspect-video relative overflow-hidden bg-gray-200 dark:bg-gray-800">
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <BookOpen size={48} />
              </div>
              <div className="absolute top-4 left-4 px-3 py-1 bg-brand-cyan text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                {post.category}
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-4">
                <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-brand-cyan transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 font-medium leading-relaxed">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{post.author}</span>
                </div>
                <button className="text-brand-cyan font-black text-sm flex items-center gap-1 group/btn">
                  Read More <BookOpen size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
