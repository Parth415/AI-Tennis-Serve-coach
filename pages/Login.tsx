import React, { useState } from 'react';
import { TennisBallIcon } from '../components/icons/TennisBallIcon';

interface LoginProps {
  onLogin: (email: string, pass:string) => boolean;
  onSwitchToSignUp: () => void;
  onSwitchToReset: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignUp, onSwitchToReset }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    const success = onLogin(email, password);
    if (!success) {
        setError('Invalid email or password.');
    } else {
        setError('');
    }
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900";
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center mb-6">
            <TennisBallIcon className="h-12 w-12 text-green-500" />
            <h1 className="ml-4 text-4xl font-bold text-gray-800 tracking-tight">
                Serve <span className="text-green-600">Sensei</span>
            </h1>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Welcome Back!</h2>
            <p className="text-center text-gray-600 mb-6">Sign in to continue your training.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClasses}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                    />
                </div>
                <div>
                    <div className="flex justify-between items-baseline">
                        <label htmlFor="password"  className="block text-sm font-medium text-gray-700">Password</label>
                         <button type="button" onClick={onSwitchToReset} className="text-sm text-green-600 hover:underline focus:outline-none">
                            Forgot password?
                        </button>
                    </div>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClasses}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                    />
                </div>
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                <div>
                    <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Login
                    </button>
                </div>
            </form>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <button onClick={onSwitchToSignUp} className="font-medium text-green-600 hover:underline focus:outline-none">
                Sign up
            </button>
        </p>
      </div>
    </div>
  );
};

export default Login;