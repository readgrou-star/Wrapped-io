
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, Check, Share2, Download, Instagram, Linkedin, Twitter, ChevronDown, Sparkles } from 'lucide-react';
import { MOCK_FORMS } from '../constants';
import { StoryPreview } from '../components/StoryPreview';
import { Form, LandingBlock } from '../types';

export const ParticipantView = () => {
    const { id } = useParams();
    const [form, setForm] = useState<Form | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // For mobile scroll handling
    const formRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        // In real app, fetch by ID
        const found = MOCK_FORMS.find(f => f.id === id) || MOCK_FORMS[0];
        setForm(found);
    }, [id]);

    if (!form) return <div className="min-h-screen flex items-center justify-center font-bold">Loading...</div>;

    const currentField = form.fields[currentStep];
    const progress = ((currentStep) / form.fields.length) * 100;

    const handleNext = () => {
        if (currentStep < form.fields.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setIsSubmitted(true);
        }, 2000); 
    };

    const handleInputChange = (value: string) => {
        setAnswers(prev => ({...prev, [currentField.id]: value}));
    };

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // --- STORY REVEAL & SUCCESS ---
    if (isGenerating) {
        return (
            <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-8"></div>
                <h2 className="text-3xl font-bold mb-4 stack-sans-headline">Generating your story...</h2>
                <p className="opacity-90 text-lg font-medium google-sans-flex">Hold tight.</p>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <div className="max-w-5xl w-full flex flex-col md:flex-row gap-12 items-center justify-center">
                    <div className="w-full max-w-[320px] bg-slate-900 p-2 rounded-xl shadow-2xl transform rotate-1 border border-slate-800">
                        <StoryPreview config={form.storyConfig} data={answers} fields={form.fields} className="rounded-lg" />
                    </div>
                    <div className="text-white max-w-md w-full">
                        <h1 className="text-4xl font-black mb-4 stack-sans-headline">You're in! 🎉</h1>
                        <p className="text-slate-400 text-lg mb-8 google-sans-flex font-medium leading-relaxed">
                            Your spot is reserved. Share your acceptance story to let your network know you're attending.
                        </p>
                        <div className="space-y-3">
                            <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-lg flex items-center justify-center gap-3 transition shadow-lg shadow-purple-900/50">
                                <Instagram className="w-5 h-5" /> Share to Instagram Story
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition border border-slate-700">
                                    <Twitter className="w-4 h-4" /> Post to X
                                </button>
                                <button className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/50">
                                    <Linkedin className="w-4 h-4" /> LinkedIn
                                </button>
                            </div>
                            <button onClick={() => alert("Image download started!")} className="w-full bg-transparent border border-slate-700 hover:bg-slate-900 text-slate-300 font-bold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition mt-2">
                                <Download className="w-4 h-4" /> Download Image
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN SPLIT LAYOUT (70:30) ---
    
    const blocks = form.landingConfig?.blocks || [];

    return (
        <div className="h-screen bg-slate-50 font-sans flex flex-col md:flex-row overflow-hidden">
            
            {/* LEFT: 70% Content Area (Independently Scrollable) */}
            <div className="md:w-[70%] h-full overflow-y-auto no-scrollbar relative z-0">
                {/* Transparent Navbar Placeholder */}
                <div className="sticky top-0 z-20 px-8 py-6 flex items-center justify-between mix-blend-multiply pointer-events-none">
                    <div className="font-bold text-xl text-slate-900 stack-sans-headline flex items-center gap-2 pointer-events-auto">
                        <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm">W</div>
                        {form.title}
                    </div>
                </div>

                {/* Content Blocks */}
                <div className="pb-24 pt-4">
                    {blocks.length === 0 ? (
                        <div className="p-20 text-center text-slate-400">
                            <h2 className="text-2xl font-bold mb-2">Welcome</h2>
                            <p>Content will appear here.</p>
                        </div>
                    ) : blocks.map(block => (
                         <div 
                            key={block.id} 
                            className={`
                                px-8 md:px-20 last:border-0
                                ${block.style?.padding === 'sm' ? 'py-8' : block.style?.padding === 'lg' ? 'py-24' : 'py-16'}
                                ${block.style?.backgroundColor === 'bg-white' ? 'bg-slate-50' : (block.style?.backgroundColor || 'bg-slate-50')}
                                ${block.style?.textColor || 'text-slate-900'}
                                ${block.style?.textAlign === 'center' ? 'text-center' : block.style?.textAlign === 'right' ? 'text-right' : 'text-left'}
                            `}
                         >
                            {block.type === 'hero' && (
                                <div>
                                    <span className="inline-block px-3 py-1 bg-blue-100/50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 border border-blue-200">Event Registration</span>
                                    <h1 className="text-5xl md:text-8xl font-black mb-8 stack-sans-headline leading-[0.9] tracking-tight text-slate-900">{block.title}</h1>
                                    <p className="text-xl md:text-2xl opacity-70 google-sans-flex max-w-2xl leading-relaxed mb-10 mx-auto font-medium text-slate-600">{block.content}</p>
                                    <button onClick={scrollToForm} className="md:hidden inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform shadow-xl">
                                        Secure Your Spot <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {block.type === 'text' && (
                                <div className="max-w-3xl mx-auto">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-6 stack-sans-headline text-slate-900">{block.title}</h2>
                                    <p className="text-lg opacity-80 leading-relaxed google-sans-flex text-slate-700">{block.content}</p>
                                </div>
                            )}
                            {block.type === 'features' && (
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-12 stack-sans-headline text-slate-900">{block.title}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {(block.items || []).map((item, i) => (
                                            <div key={i} className="bg-white p-8 rounded-2xl text-left shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-6 font-bold text-slate-400">{i+1}</div>
                                                <h3 className="font-bold mb-3 text-xl text-slate-900 stack-sans-headline">{item.title}</h3>
                                                <p className="text-slate-500 text-sm leading-relaxed google-sans-flex">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {block.type === 'speakers' && (
                                <div className="text-center">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-12 stack-sans-headline text-slate-900">{block.title}</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="group cursor-pointer">
                                                <div className="w-full aspect-square bg-white rounded-2xl mb-4 overflow-hidden grayscale group-hover:grayscale-0 transition duration-500 shadow-sm border border-slate-100">
                                                    {/* Placeholder for speaker image */}
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                                        <span className="text-4xl">?</span>
                                                    </div>
                                                </div>
                                                <h3 className="font-bold text-slate-900">Speaker {i}</h3>
                                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wide mt-1">Company</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                         </div>
                    ))}
                    
                    {/* Minimal Footer */}
                    <div className="px-16 py-12 text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                        Powered by WrappedForm
                    </div>
                </div>
            </div>

            {/* RIGHT: 30% Sticky Area with Floating Form Card */}
            <div ref={formRef} className="md:w-[30%] h-full relative z-10 flex flex-col justify-center pointer-events-none">
                <div className="w-full px-6 md:px-8 pointer-events-auto">
                    
                    {/* Floating Form Card */}
                    <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 max-h-[85vh] overflow-y-auto no-scrollbar flex flex-col">
                        
                        {/* Progress */}
                        <div className="mb-8">
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-slate-400 font-bold uppercase tracking-wide text-[10px]">Step {currentStep + 1} of {form.fields.length}</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-900 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        <div className="mb-8 flex-1">
                             <h2 className="text-2xl font-bold text-slate-900 leading-tight stack-sans-headline mb-6">
                                {currentField.label} {currentField.required && <span className="text-blue-600">*</span>}
                            </h2>

                            {currentField.type === 'select' ? (
                                <div className="space-y-2">
                                    {currentField.options?.map((opt) => (
                                        <button 
                                            key={opt}
                                            onClick={() => handleInputChange(opt)}
                                            className={`w-full text-left p-3.5 rounded-xl border transition-all text-sm font-bold ${answers[currentField.id] === opt ? 'border-slate-900 bg-slate-900 text-white shadow-md' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                {opt}
                                                {answers[currentField.id] === opt && <Check className="w-4 h-4" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : currentField.type === 'dropdown' ? (
                                <div className="relative">
                                    <select
                                        value={answers[currentField.id] || ''}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-base font-bold text-slate-900 focus:border-slate-900 outline-none transition-colors"
                                    >
                                        <option value="" disabled>Select an option...</option>
                                        {currentField.options?.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            ) : (
                                <input
                                    autoFocus
                                    type={currentField.type}
                                    value={answers[currentField.id] || ''}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && answers[currentField.id] && handleNext()}
                                    className="w-full text-xl text-slate-900 border-b border-slate-200 focus:border-slate-900 outline-none py-2 bg-transparent placeholder-slate-300 transition-colors font-bold stack-sans-headline"
                                    placeholder="Type here..."
                                />
                            )}
                        </div>

                        {/* Navigation */}
                        <button 
                            onClick={handleNext}
                            disabled={currentField.required && !answers[currentField.id]}
                            className="w-full bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 text-white text-sm font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {currentStep === form.fields.length - 1 ? 'Complete Registration' : 'Next'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                         <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wide">Secure via WrappedForm</p>
                    </div>

                </div>
            </div>
        </div>
    );
};
