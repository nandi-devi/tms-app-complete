import React, { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface LoginProps {
  onLogin: (password: string) => void;
  error?: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
                 <div className="bg-red-600 text-white font-bold text-4xl w-12 h-12 flex items-center justify-center transform -skew-x-12 shadow-md">A</div>
                 <h1 className="ml-3 text-2xl font-bold text-gray-800 tracking-wide">ALL INDIA LOGISTICS</h1>
            </div>
            <h2 className="text-xl text-gray-600">Portal Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            error={error}
          />
          <Button type="submit" className="w-full !py-3">Login</Button>
        </form>
      </div>
    </div>
  );
};