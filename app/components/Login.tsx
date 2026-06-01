'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface LoginProps {
  onLogin: (role: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [namaUser, setNamaUser] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/login', {
        nama_user: namaUser,
        password: password,
      });

      if (response.data.user) {
        localStorage.setItem('token', 'dummy-token');
        localStorage.setItem('userRole', response.data.user.role_user);
        localStorage.setItem('userName', response.data.user.nama_user);
        toast.success('Login berhasil!');
        onLogin(response.data.user.role_user);
      }
    } catch (error) {
      toast.error('Login gagal! Periksa username dan password Anda.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo dan Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/favicon.png" 
              alt="Logo Next Ritel" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Next Ritel</h1>
          <p className="text-gray-600 mt-2"></p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={namaUser}
              onChange={(e) => setNamaUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        {/* Demo Account */}
   <div className="mt-6 text-center text-sm text-gray-600">
          <p className="font-semibold">Demo Account:</p>
          <p>Admin: Admin User / password123</p>
          <p>Kasir: Kasir User / password123</p>
      
        </div>
      </div>
    </div>
  );
}