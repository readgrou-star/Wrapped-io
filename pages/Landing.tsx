import React from 'react';
import { ArrowRight, Sparkles, Share2, BarChart3, Layers, Zap, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl text-slate-900 stack-sans-headline">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                    <span className="text-lg font-medium">W</span>
                </div>
                WrappedForm
            </div>
            <div className="flex gap-4">
                <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition google-sans-flex">
                    Log In
                </button>
                <button onClick={() => navigate('/dashboard')} className="text-sm font-medium bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition shadow-sm hover:-translate-y-0.5 google-sans-flex">
                    Sign Up Free
                </button>
            </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center pt-32 pb-24 px-6 overflow-hidden">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 text-slate-600 text-xs font-bold mb-8 border border-slate-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-900"></span>
          </span>
          V1.0 is Live • It's Free
        </div>
        
        {/* Headline */}
        <h1 className="stack-sans-headline text-5xl md:text-7xl text-center text-slate-900 mb-6 tracking-tight leading-[1.1] max-w-4xl">
          The form that makes<br/>
          <span className="text-blue-600">your event viral.</span>
        </h1>
        
        {/* Subhead */}
        <p className="google-sans-flex text-lg text-slate-500 text-center max-w-2xl mb-10 leading-relaxed font-light">
          Don't just collect emails. Create minimalist forms that generate <span className="text-slate-900 font-medium border-b border-yellow-300">Spotify Wrapped-style</span> stories for every participant.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-20 z-10">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white text-base font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            Create Your Form
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="flex items-center justify-center gap-2 bg-white text-slate-700 text-base font-bold px-8 py-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
            See Examples
          </button>
        </div>

        {/* Bento Grid Illustration */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[200px]">
            
            {/* Card 1: The Form */}
            <div className="md:col-span-5 row-span-2 card-solid p-8 flex flex-col relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="z-10">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center mb-4 shadow-sm text-blue-600">
                        <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="stack-sans-headline text-xl mb-2">Build Forms</h3>
                    <p className="text-slate-500 google-sans-flex text-sm">Simple, clean, Typeform-style builder. Drag, drop, done.</p>
                </div>
                <div className="mt-8 flex-1 bg-slate-50 rounded-lg border border-slate-200 p-4 relative top-4">
                    <div className="h-3 w-1/3 bg-slate-200 rounded-sm mb-4"></div>
                    <div className="h-8 w-full bg-white border border-slate-200 rounded-md mb-4"></div>
                    <div className="h-3 w-1/4 bg-slate-200 rounded-sm mb-4"></div>
                    <div className="h-8 w-full bg-white border border-slate-200 rounded-md"></div>
                </div>
            </div>

            {/* Card 2: The Magic */}
            <div className="md:col-span-4 row-span-2 card-solid bg-slate-900 border-slate-900 text-white p-8 flex flex-col items-center text-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                 <div className="z-10 flex flex-col items-center h-full justify-center">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                        <Zap className="w-6 h-6 text-yellow-300" fill="currentColor" />
                    </div>
                    <h3 className="stack-sans-headline text-2xl mb-3">Instant Magic</h3>
                    <p className="text-slate-300 google-sans-flex text-sm leading-relaxed">
                        Participants fill the form -> We generate a personalized viral story instantly.
                    </p>
                 </div>
            </div>

            {/* Card 3: The Stats */}
            <div className="md:col-span-3 row-span-1 card-solid p-6 flex flex-col justify-between group hover:border-green-200 transition-colors">
                 <div className="flex justify-between items-start">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                        <Share2 className="w-4 h-4" />
                    </div>
                    <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded text-[10px]">+142%</span>
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold stack-sans-headline text-slate-900">4.2k</h3>
                    <p className="text-slate-500 text-xs font-medium">Viral Shares</p>
                 </div>
            </div>

            {/* Card 4: Branding */}
             <div className="md:col-span-3 row-span-1 card-solid p-6 flex flex-col justify-center items-center text-center group hover:border-pink-200 transition-colors">
                <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 mb-3 group-hover:scale-105 transition-transform">
                    <Heart className="w-5 h-5" fill="currentColor" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Your Brand</h3>
                <p className="text-[10px] text-slate-500 mt-1">Fully customizable</p>
            </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 text-slate-400 text-xs font-medium">
            &copy; 2024 WrappedForm. Less is more.
        </footer>
      </main>
    </div>
  );
};