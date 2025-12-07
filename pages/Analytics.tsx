import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCcw, DownloadCloud } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const MOCK_DATA = [
  { date: 'Oct 1', submissions: 12, shares: 5 },
  { date: 'Oct 2', submissions: 18, shares: 10 },
  { date: 'Oct 3', submissions: 25, shares: 15 },
  { date: 'Oct 4', submissions: 45, shares: 30 },
  { date: 'Oct 5', submissions: 32, shares: 25 },
  { date: 'Oct 6', submissions: 55, shares: 40 },
  { date: 'Oct 7', submissions: 60, shares: 42 },
];

export const Analytics = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="p-2.5 hover:bg-white bg-slate-100 rounded-lg transition border border-slate-200">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 stack-sans-headline">Analytics</h1>
                            <p className="text-slate-500 text-sm font-medium google-sans-flex">Web Dev Bootcamp Batch 10</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition">
                            <RefreshCcw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition shadow-sm">
                            <DownloadCloud className="w-3.5 h-3.5" /> Export CSV
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="card-solid p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Views</p>
                        <h3 className="text-3xl font-bold text-slate-900 stack-sans-headline">1,205</h3>
                        <div className="mt-2">
                            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">↑ 12%</span>
                        </div>
                    </div>
                    <div className="card-solid p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Submissions</p>
                        <h3 className="text-3xl font-bold text-slate-900 stack-sans-headline">247</h3>
                        <div className="mt-2">
                            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">↑ 8%</span>
                        </div>
                    </div>
                    <div className="card-solid p-5 bg-blue-50 border-blue-100">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Viral Shares</p>
                        <h3 className="text-3xl font-bold text-blue-600 stack-sans-headline">156</h3>
                        <p className="text-[10px] text-blue-500 font-bold mt-2">63% conversion rate</p>
                    </div>
                    <div className="card-solid p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Conversion Rate</p>
                        <h3 className="text-3xl font-bold text-slate-900 stack-sans-headline">20.5%</h3>
                        <div className="mt-2">
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">↓ 1.2%</span>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="card-solid p-6">
                        <h3 className="font-bold text-base text-slate-900 mb-6 stack-sans-headline">Growth Over Time</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={MOCK_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} />
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px', fontWeight: 'bold', fontSize: '12px'}}
                                        itemStyle={{color: '#fff'}} 
                                    />
                                    <Line type="monotone" dataKey="submissions" stroke="#0F172A" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff', stroke: '#0F172A'}} activeDot={{r: 6}} />
                                    <Line type="monotone" dataKey="shares" stroke="#2563EB" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff', stroke: '#2563EB'}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card-solid p-6">
                        <h3 className="font-bold text-base text-slate-900 mb-6 stack-sans-headline">Device Breakdown</h3>
                        <div className="h-64 w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Mobile', value: 180 },
                                    { name: 'Desktop', value: 50 },
                                    { name: 'Tablet', value: 17 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} />
                                    <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{backgroundColor: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px'}} />
                                    <Bar dataKey="value" fill="#0F172A" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="card-solid overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="font-bold text-base text-slate-900 stack-sans-headline">Recent Submissions</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Participant</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Story Shared</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-sm text-slate-900">User {i}</div>
                                            <div className="text-xs text-slate-500 font-medium">user{i}@example.com</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500">Oct 7, 2023</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                                                Confirmed
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {i % 2 === 0 ? (
                                                <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                                                    <DownloadCloud className="w-3.5 h-3.5" /> Yes
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs font-bold">No</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};