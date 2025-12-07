import React, { useEffect, useState } from 'react';
import { Plus, Users, Share2, FileText, AlertTriangle, ArrowRight, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { StoryPreview } from '../components/StoryPreview';
import { useAuth } from '../contexts/AuthContext';
import { Form } from '../types';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, useMockMode } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
        if (!user) return;
        try {
            const data = await db.forms.list(user.id);
            setForms(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchForms();
  }, [user]);

  return (
    <div className="min-h-screen pb-20 bg-slate-50/50">
       {/* Top Nav */}
       <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
             <div className="flex items-center gap-2 font-bold text-lg text-slate-900 cursor-pointer stack-sans-headline" onClick={() => navigate('/')}>
                <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center text-white text-sm">
                    W
                </div>
                WrappedForm
            </div>
            <div className="flex items-center gap-4">
                 {useMockMode && (
                    <span className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-md font-bold border border-yellow-200 uppercase tracking-wide">
                        Demo Mode
                    </span>
                 )}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {user?.full_name ? user.full_name[0] : user?.email[0].toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
       </header>

       <main className="max-w-7xl mx-auto px-6 py-10">
            
            {useMockMode && (
                <div className="bg-white rounded-lg p-3 mb-8 flex items-start gap-3 border border-yellow-200 shadow-sm max-w-2xl">
                    <div className="p-1 bg-yellow-50 rounded text-yellow-600">
                        <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-900 stack-sans-headline">Database Not Connected</h3>
                        <p className="text-xs text-slate-500 mt-0.5 google-sans-flex">
                            You are currently in demo mode. Data is saved to your browser.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex items-end justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 stack-sans-headline">Dashboard</h1>
                    <p className="text-slate-500 text-sm font-medium google-sans-flex mt-1">Manage your forms and track performance</p>
                </div>
                <button 
                    onClick={() => navigate('/builder/create')}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition font-medium text-sm shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create New Form
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="card-solid p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Forms</p>
                            <p className="text-2xl font-bold text-slate-900 stack-sans-headline">{forms.length}</p>
                        </div>
                    </div>
                </div>
                <div className="card-solid p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center border border-green-100">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Submissions</p>
                            <p className="text-2xl font-bold text-slate-900 stack-sans-headline">
                                {forms.reduce((acc, f) => acc + f.stats.submissions, 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="card-solid p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center border border-purple-100">
                            <Share2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Viral Shares</p>
                            <p className="text-2xl font-bold text-slate-900 stack-sans-headline">
                                {forms.reduce((acc, f) => acc + f.stats.shares, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-slate-900"></div>
                </div>
            ) : forms.length === 0 ? (
                 <div className="text-center py-24 card-solid border-dashed border border-slate-300 bg-slate-50/50">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 border border-slate-200">
                        <Plus className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 stack-sans-headline">No forms yet</h3>
                    <p className="text-slate-500 mb-6 max-w-xs mx-auto text-sm google-sans-flex">Create your first form to start collecting registrations.</p>
                    <button 
                        onClick={() => navigate('/builder/create')}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm"
                    >
                        Create Form
                    </button>
                 </div>
            ) : (
                /* Forms Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map((form) => (
                        <div key={form.id} className="card-solid overflow-hidden flex flex-col group hover:border-slate-300 transition-colors">
                            <div className="h-40 bg-slate-50 relative overflow-hidden flex items-center justify-center p-6 border-b border-slate-100">
                                <div className="transform group-hover:scale-105 transition-transform duration-300 shadow-lg rounded-lg overflow-hidden">
                                    <StoryPreview config={form.storyConfig} className="w-24" />
                                </div>
                                <div className="absolute top-3 right-3">
                                     <button className="p-1.5 bg-white rounded-md shadow-sm text-slate-400 hover:text-slate-900 border border-slate-200">
                                        <MoreHorizontal className="w-4 h-4" />
                                     </button>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col bg-white">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-slate-900 truncate pr-4 stack-sans-headline">{form.title}</h3>
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                     <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${form.status === 'active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                        {form.status}
                                    </span>
                                    <span className="text-[10px] font-medium text-slate-400">
                                        {new Date(form.created_at || Date.now()).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-50 mt-auto">
                                    <div className="text-center">
                                        <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Views</span>
                                        <span className="font-bold text-sm text-slate-700">{form.stats.views}</span>
                                    </div>
                                    <div className="text-center border-l border-slate-50">
                                        <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Subs</span>
                                        <span className="font-bold text-sm text-slate-700">{form.stats.submissions}</span>
                                    </div>
                                    <div className="text-center border-l border-slate-50">
                                        <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Shares</span>
                                        <span className="font-bold text-sm text-blue-600">{form.stats.shares}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-50">
                                    <button onClick={() => navigate(`/analytics/${form.id}`)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition">
                                        Analytics
                                    </button>
                                    <button onClick={() => navigate(`/view/${form.id}`)} className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition flex items-center justify-center gap-1">
                                        View <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Create New Placeholder Card */}
                    <button 
                        onClick={() => navigate('/builder/create')}
                        className="flex flex-col items-center justify-center h-full min-h-[350px] border border-dashed border-slate-300 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all gap-3 group bg-white"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 group-hover:bg-white flex items-center justify-center text-slate-400 group-hover:text-slate-600 transition-colors">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-sm text-slate-500 group-hover:text-slate-700 stack-sans-headline">Create New Form</span>
                    </button>
                </div>
            )}
       </main>
    </div>
  );
};