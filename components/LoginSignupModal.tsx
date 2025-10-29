import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CloseIcon } from './icons/CloseIcon';
import { GoogleIcon } from './icons/GoogleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

type AuthView = 'login' | 'signup';

const LoginSignupModal: React.FC = () => {
  const { login, signup, googleSignIn, closeAuthModal } = useAuth();
  const [view, setView] = useState<AuthView>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }

    setError('');
    setIsLoading(true);

    try {
      if (view === 'login') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err: any) {
      // Basic error handling for Firebase auth errors
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please log in.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error("Firebase Auth Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await googleSignIn();
    } catch (err) {
      setError('Could not sign in with Google. Please try again.');
      console.error("Google Sign-In Error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="relative w-full max-w-sm bg-indigo-950 rounded-2xl border border-indigo-700 p-8 shadow-2xl flex flex-col">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-indigo-800 hover:text-white transition-colors"
          aria-label="Close"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="w-full">
            <h2 className="text-2xl font-bold text-center text-purple-300 mb-2">
                {view === 'signup' ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-center text-sm text-gray-400 mb-6">
                {view === 'signup' ? 'to save your readings and history.' : 'to access your readings.'}
            </p>

            <div className="flex border-b border-indigo-800/70 mb-6">
                <button 
                    onClick={() => setView('signup')}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${view === 'signup' ? 'text-purple-300 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}>
                    Sign Up
                </button>
                <button 
                    onClick={() => setView('login')}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${view === 'login' ? 'text-purple-300 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}>
                    Login
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-indigo-900 border border-indigo-700 rounded-lg p-2.5 text-white focus:ring-purple-500 focus:border-purple-500 transition-shadow"
                    required
                />
                <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-indigo-900 border border-indigo-700 rounded-lg p-2.5 text-white focus:ring-purple-500 focus:border-purple-500 transition-shadow"
                    required
                />
                {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-60 flex items-center justify-center"
                >
                    {isLoading ? <SpinnerIcon className="w-6 h-6 animate-spin"/> : `Continue with Email`}
                </button>
            </form>

            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-indigo-800/70"></div>
                <span className="flex-shrink mx-4 text-xs text-gray-500">OR</span>
                <div className="flex-grow border-t border-indigo-800/70"></div>
            </div>

            <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-indigo-900/80 border border-indigo-700 hover:bg-indigo-800 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-60"
            >
                <GoogleIcon className="w-5 h-5"/>
                Continue with Google
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupModal;
