import { Metadata } from 'next';
import DashboardClient from '../components/Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | Aplikasi Ritel',
  description: 'Dashboard manajemen ritel',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
