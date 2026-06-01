'use client';

import { useState, useEffect } from 'react';
import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import CustomerList from './CustomerList';
import ProductList from './ProductList';
import TransactionForm from './TransactionForm';
import TransactionHistory from './TransactionHistory';

// Props dibuat optional karena tidak akan dikirim dari page.tsx
interface DashboardProps {
  userRole?: string;
  onLogout?: () => void;
}

type MenuItem = 'dashboard' | 'customers' | 'products' | 'transaction' | 'history';

export default function Dashboard({ userRole: propUserRole, onLogout: propOnLogout }: DashboardProps) {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard');
  const [userRole, setUserRole] = useState<string>(propUserRole || 'admin');

  // Ambil userRole dari localStorage jika tidak dikirim dari props
  useEffect(() => {
    if (!propUserRole) {
      const savedRole = localStorage.getItem('userRole');
      if (savedRole) {
        setUserRole(savedRole);
      }
    }
  }, [propUserRole]);

  // Handle logout di dalam komponen jika onLogout tidak diberikan
  const handleLogout = () => {
    if (propOnLogout) {
      propOnLogout();
    } else {
      // Default logout behavior
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/';
    }
  };

  // Update title berdasarkan menu aktif
  useEffect(() => {
    const titles: Record<MenuItem, string> = {
      dashboard: 'Dashboard | Next Ritel',
      customers: 'Data Customer | Next Ritel',
      products: 'Data Produk | Next Ritel',
      transaction: 'Transaksi Baru | Next Ritel',
      history: 'Riwayat Transaksi | Next Ritel',
    };
    document.title = titles[activeMenu];
  }, [activeMenu]);

  const menuItems = [
    { id: 'dashboard' as MenuItem, name: 'Dashboard', icon: HomeIcon, roles: ['admin', 'kasir'] },
    { id: 'customers' as MenuItem, name: 'Customer', icon: UsersIcon, roles: ['admin', 'kasir'] },
    { id: 'products' as MenuItem, name: 'Produk', icon: ShoppingBagIcon, roles: ['admin'] },
    { id: 'transaction' as MenuItem, name: 'Transaksi Baru', icon: CurrencyDollarIcon, roles: ['admin', 'kasir'] },
    { id: 'history' as MenuItem, name: 'Riwayat Transaksi', icon: ClockIcon, roles: ['admin', 'kasir'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent userRole={userRole} />;
      case 'customers':
        return <CustomerList userRole={userRole} />;
      case 'products':
        return <ProductList />;
      case 'transaction':
        return <TransactionForm />;
      case 'history':
        return <TransactionHistory />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b text-center">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <img 
              src="/favicon.png" 
              alt="Logo Next Ritel" 
              className="w-12 h-12 object-contain"
            />
          </div>
          {/* Title */}
          <h1 className="text-xl font-bold text-gray-800">Next Ritel</h1>
          <p className="text-sm text-gray-600 mt-1">Role: {userRole}</p>
        </div>
        
        <nav className="p-4 space-y-2">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function DashboardContent({ userRole }: { userRole: string }) {
  const [stats, setStats] = useState({ customers: 0, products: 0, transactions: 0, revenue: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const role = localStorage.getItem('userRole');
        const customersRes = await fetch(`http://localhost:8080/api/customers?page=1&limit=1`, {
          headers: { 'X-User-Role': role || '' }
        });
        const productsRes = await fetch(`http://localhost:8080/api/produk?page=1&limit=1`, {
          headers: { 'X-User-Role': role || '' }
        });
        const transactionsRes = await fetch(`http://localhost:8080/api/transaksi?page=1&limit=100`, {
          headers: { 'X-User-Role': role || '' }
        });
        
        const customersData = await customersRes.json();
        const productsData = await productsRes.json();
        const transactionsData = await transactionsRes.json();
        
        const totalRevenue = transactionsData.data?.reduce((sum: number, t: any) => sum + t.total_harga, 0) || 0;
        
        setStats({
          customers: customersData.total || 0,
          products: productsData.total || 0,
          transactions: transactionsData.total || 0,
          revenue: totalRevenue,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Customer</p>
              <p className="text-2xl font-bold mt-1">{stats.customers}</p>
            </div>
            <UsersIcon className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Produk</p>
              <p className="text-2xl font-bold mt-1">{stats.products}</p>
            </div>
            <ShoppingBagIcon className="h-10 w-10 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Transaksi</p>
              <p className="text-2xl font-bold mt-1">{stats.transactions}</p>
            </div>
            <CurrencyDollarIcon className="h-10 w-10 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Pendapatan</p>
              <p className="text-2xl font-bold mt-1">Rp {stats.revenue.toLocaleString('id-ID')}</p>
            </div>
            <ClockIcon className="h-10 w-10 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}