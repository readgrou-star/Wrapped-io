import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, useMockMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        let result;
        if (isLogin) {
            result = await signIn(email, password);
        } else {
            result = await signUp(email, password, fullName);
        }

        if (result.error) {
            setError(result.error.message || 'Authentication failed');
        } else {
            navigate('/dashboard');
        }
    } catch (err) {
        setError('An unexpected error occurred');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full card-solid overflow-hidden shadow-sm">
        <div className="p-8 text-center bg-white border-b border-slate-100">
             <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                 <span className="text-white text-xl font-bold stack-sans-headline">W</span>
             </div>
             <h1 className="text-xl font-bold text-slate-900 stack-sans-headline">Welcome Back</h1>
             <p className="text-slate-500 mt-1 text-sm google-sans-flex">Enter your details to access your dashboard</p>
        </div>

        <div className="p-8 bg-white">
            {useMockMode && (
                <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-yellow-800 font-medium">
                        <strong>Demo Mode:</strong> Login with any email. No password check.
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                        <input 
                            type="text" 
                            required 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-slate-900 outline-none transition font-medium text-slate-900 placeholder:text-slate-300 text-sm"
                            placeholder="Alex Chen"
                        />
                    </div>
                )}
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-slate-900 outline-none transition font-medium text-slate-900 placeholder:text-slate-300 text-sm"
                        placeholder="alex@example.com"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
                    <input 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-slate-900 outline-none transition font-medium text-slate-900 placeholder:text-slate-300 text-sm"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <div className="text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-100 font-medium">
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-sm hover:translate-y-px mt-2 text-sm"
                >
                    {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        {isLogin ? 'Sign Up Free' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};