'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

interface Customer {
  custcd: string;
  nama_customer: string;
  address: string;
  phone: string;
}

export default function CustomerList({ userRole }: { userRole: string }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    custcd: '',
    nama_customer: '',
    address: '',
    phone: '',
  });

  // Fetch data dengan AbortController untuk performa
  useEffect(() => {
    const abortController = new AbortController();
    fetchCustomers(abortController.signal);
    return () => abortController.abort();
  }, [currentPage]);

  // Filter customers based on search term
  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.nama_customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.custcd.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm))
    );
    setFilteredCustomers(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [searchTerm, customers]);

  const fetchCustomers = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const role = localStorage.getItem('userRole');
      const response = await axios.get(`http://localhost:8080/api/customers?page=${currentPage}&limit=100`, {
        headers: { 'X-User-Role': role || '' },
        signal,
      });
      setCustomers(response.data.data);
      setFilteredCustomers(response.data.data);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error fetching customers:', error);
        toast.error('Gagal mengambil data customer');
      }
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel dengan optimasi
  const exportToExcel = useCallback(() => {
    const exportData = filteredCustomers.map(customer => ({
      'Kode Customer': customer.custcd,
      'Nama Customer': customer.nama_customer,
      'Alamat': customer.address,
      'Telepon': customer.phone,
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    
    // Optimasi ukuran kolom
    const colWidths = [{ wch: 15 }, { wch: 30 }, { wch: 40 }, { wch: 15 }];
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, `customers_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data berhasil diexport');
  }, [filteredCustomers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const role = localStorage.getItem('userRole');
      if (editingCustomer) {
        await axios.put(`http://localhost:8080/api/customers/${editingCustomer.custcd}`, formData, {
          headers: { 'X-User-Role': role || '' }
        });
        toast.success('Customer berhasil diupdate');
      } else {
        await axios.post('http://localhost:8080/api/customers', formData, {
          headers: { 'X-User-Role': role || '' }
        });
        toast.success('Customer berhasil ditambahkan');
      }
      fetchCustomers();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Gagal menyimpan customer');
    }
  };

  const handleDelete = async (custcd: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus customer ini?')) {
      try {
        const role = localStorage.getItem('userRole');
        await axios.delete(`http://localhost:8080/api/customers/${custcd}`, {
          headers: { 'X-User-Role': role || '' }
        });
        toast.success('Customer berhasil dihapus');
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast.error('Gagal menghapus customer');
      }
    }
  };

  const resetForm = () => {
    setFormData({ custcd: '', nama_customer: '', address: '', phone: '' });
    setEditingCustomer(null);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      custcd: customer.custcd,
      nama_customer: customer.nama_customer,
      address: customer.address,
      phone: customer.phone,
    });
    setShowModal(true);
  };

  // Pagination dengan useMemo untuk performa
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCustomers.slice(start, end);
  }, [filteredCustomers, currentPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Data Customer</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          {userRole === 'admin' && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Tambah</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alamat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telepon
                </th>
                {userRole === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data customer
                  </td>
                 </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.custcd} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.custcd}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.nama_customer}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 break-words max-w-md">
                      {customer.address}
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.phone}
                     </td>
                    {userRole === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openEditModal(customer)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          aria-label="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.custcd)}
                          className="text-red-600 hover:text-red-900"
                          aria-label="Hapus"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    )}
                   </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination dengan optimasi */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal Form dengan lazy loading */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingCustomer ? 'Edit Customer' : 'Tambah Customer'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Customer
                  </label>
                  <input
                    type="text"
                    value={formData.custcd}
                    onChange={(e) => setFormData({ ...formData, custcd: e.target.value })}
                    className="input-field"
                    required
                    disabled={!!editingCustomer}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Customer
                  </label>
                  <input
                    type="text"
                    value={formData.nama_customer}
                    onChange={(e) => setFormData({ ...formData, nama_customer: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-field"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telepon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
