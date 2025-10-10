
import React, { useState } from 'react';
import { TennisBallIcon } from '../components/icons/TennisBallIcon';

interface ResetPasswordProps {
  onSwitchToLogin: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would trigger a backend service to send an email.
    // Here, we just simulate the success message.
    if(email.trim()) {
        setSubmitted(true);
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
          {submitted ? (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
                <p className="text-gray-600">
                    If an account exists for <span className="font-medium">{email}</span>, you will receive an email with instructions on how to reset your password.
                </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Reset Your Password</h2>
              <p className="text-center text-gray-600 mb-6">Enter your email and we'll send you a link to get back into your account.</p>
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
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          <button onClick={onSwitchToLogin} className="font-medium text-green-600 hover:underline focus:outline-none">
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
