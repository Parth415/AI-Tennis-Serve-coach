
import React, { useState } from 'react';
import { TennisBallIcon } from '../components/icons/TennisBallIcon';

interface SignUpProps {
  onSignUp: (email: string, pass: string) => boolean;
  onSwitchToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill out all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    const success = onSignUp(email, password);
    if (!success) {
      setError('An account with this email already exists.');
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
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Create Your Account</h2>
          <p className="text-center text-gray-600 mb-6">Start your journey to a better serve.</p>
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>
             <div>
              <label htmlFor="confirmPassword"  className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClasses}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="font-medium text-green-600 hover:underline focus:outline-none">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
