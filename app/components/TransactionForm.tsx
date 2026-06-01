'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { TrashIcon, PlusIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface Product {
  id_produk: number;
  nama_produk: string;
  stok_produk: number;
}

interface Customer {
  custcd: string;
  nama_customer: string;
}

interface Price {
  id_produk: number;
  harga_produk: number;
  jenis_harga: string;
}

interface CartItem {
  id_produk: number;
  nama_produk: string;
  qty: number;
  harga_satuan: number;
  jenis_harga: string;
  subtotal: number;
}

export default function TransactionForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPriceType, setSelectedPriceType] = useState('R');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const role = localStorage.getItem('userRole');
    try {
      const [productsRes, customersRes, pricesRes] = await Promise.all([
        axios.get('http://localhost:8080/api/produk?page=1&limit=100', { headers: { 'X-User-Role': role } }),
        axios.get('http://localhost:8080/api/customers?page=1&limit=100', { headers: { 'X-User-Role': role } }),
        axios.get('http://localhost:8080/api/harga', { headers: { 'X-User-Role': role } }),
      ]);
      setProducts(productsRes.data.data);
      setCustomers(customersRes.data.data);
      setPrices(pricesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal mengambil data');
    }
  };

  // Get price with correct discount
  const getProductPrice = useCallback((productId: number, priceType: string) => {
    const price = prices.find(
      p => p.id_produk === productId && p.jenis_harga === priceType
    );
    return price ? price.harga_produk : 0;
  }, [prices]);

  const getProductStock = useCallback((productId: number) => {
    const product = products.find(p => p.id_produk === productId);
    return product ? product.stok_produk : 0;
  }, [products]);

  const getProductName = useCallback((productId: number) => {
    const product = products.find(p => p.id_produk === productId);
    return product ? product.nama_produk : '';
  }, [products]);

  const getMaxStock = useCallback(() => {
    if (!selectedProduct) return 0;
    const stock = getProductStock(parseInt(selectedProduct));
    const existingItem = cart.find(item => item.id_produk === parseInt(selectedProduct) && item.jenis_harga === selectedPriceType);
    return stock - (existingItem?.qty || 0);
  }, [selectedProduct, selectedPriceType, cart, getProductStock]);

  const addToCart = useCallback(() => {
    if (!selectedProduct) {
      toast.error('Pilih produk terlebih dahulu');
      return;
    }

    const productId = parseInt(selectedProduct);
    const price = getProductPrice(productId, selectedPriceType);
    const maxStock = getMaxStock();

    if (quantity < 1) {
      toast.error('Quantity minimal 1');
      return;
    }

    if (quantity > maxStock) {
      toast.error(`Stok tidak mencukupi. Tersisa ${maxStock} unit`);
      return;
    }

    if (price === 0) {
      toast.error('Harga produk tidak tersedia');
      return;
    }

    const existingIndex = cart.findIndex(
      item => item.id_produk === productId && item.jenis_harga === selectedPriceType
    );

    if (existingIndex !== -1) {
      const updatedCart = [...cart];
      const newQty = updatedCart[existingIndex].qty + quantity;
      if (newQty > getProductStock(productId)) {
        toast.error('Total quantity melebihi stok');
        return;
      }
      updatedCart[existingIndex].qty = newQty;
      updatedCart[existingIndex].subtotal = newQty * updatedCart[existingIndex].harga_satuan;
      setCart(updatedCart);
    } else {
      const newItem: CartItem = {
        id_produk: productId,
        nama_produk: getProductName(productId),
        qty: quantity,
        harga_satuan: price,
        jenis_harga: selectedPriceType,
        subtotal: price * quantity,
      };
      setCart([...cart, newItem]);
    }

    setSelectedProduct('');
    setSelectedPriceType('R');
    setQuantity(1);
    toast.success('Produk ditambahkan ke keranjang');
  }, [selectedProduct, selectedPriceType, quantity, cart, getProductPrice, getMaxStock, getProductName, getProductStock]);

  const removeFromCart = useCallback((index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
    toast.success('Produk dihapus dari keranjang');
  }, []);

  const updateCartQuantity = useCallback((index: number, newQty: number) => {
    const item = cart[index];
    const maxStock = getProductStock(item.id_produk);
    
    if (newQty < 1) {
      toast.error('Quantity minimal 1');
      return;
    }
    
    if (newQty > maxStock) {
      toast.error(`Stok tidak mencukupi. Maksimal ${maxStock} unit`);
      return;
    }
    
    setCart(prev => {
      const updated = [...prev];
      updated[index].qty = newQty;
      updated[index].subtotal = newQty * updated[index].harga_satuan;
      return updated;
    });
  }, [cart, getProductStock]);

  const totalHarga = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      toast.error('Pilih customer terlebih dahulu');
      return;
    }

    if (cart.length === 0) {
      toast.error('Tambahkan produk ke keranjang terlebih dahulu');
      return;
    }

    setLoading(true);
    const role = localStorage.getItem('userRole');
    
    try {
      for (const item of cart) {
        await axios.post(
          'http://localhost:8080/api/transaksi',
          {
            id_produk: item.id_produk,
            qty: item.qty,
            custcd: selectedCustomer,
            metode_pembayaran: paymentMethod,
            jenis_harga: item.jenis_harga,
          },
          { headers: { 'X-User-Role': role } }
        );
      }
      
      toast.success(`Transaksi berhasil! Total: Rp ${totalHarga.toLocaleString('id-ID')}`);
      
      setCart([]);
      setSelectedCustomer('');
      setPaymentMethod('cash');
      fetchData();
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast.error(error.response?.data?.error || 'Gagal melakukan transaksi');
    } finally {
      setLoading(false);
    }
  };

  const getPriceTypeLabel = (type: string) => {
    switch(type) {
      case 'R': return 'Regular';
      case 'SW': return 'Special Weekday (25% off)';
      case 'D': return 'Discount (35% off)';
      default: return type;
    }
  };

  const getPriceTypeColor = (type: string) => {
    switch(type) {
      case 'R': return 'text-gray-600';
      case 'SW': return 'text-green-600';
      case 'D': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Transaksi Baru</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Informasi Transaksi</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Customer
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.custcd} value={customer.custcd}>
                      {customer.nama_customer} ({customer.custcd})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="qris">QRIS</option>
                  <option value="transfer">Transfer Bank</option>
                </select>
              </div>
            </div>

            <div className="border-t mt-6 pt-6">
              <h3 className="text-lg font-semibold mb-4">Tambah Produk</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Produk
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Produk</option>
                    {products.map((product) => (
                      <option key={product.id_produk} value={product.id_produk}>
                        {product.nama_produk} (Stok: {product.stok_produk})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Harga
                  </label>
                  <select
                    value={selectedPriceType}
                    onChange={(e) => setSelectedPriceType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="R">Regular</option>
                    <option value="SW">Special Weekday (Diskon 25%)</option>
                    <option value="D">Discount (Diskon 35%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addToCart}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Tambah ke Keranjang</span>
                  </button>
                </div>
              </div>

              {selectedProduct && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    Harga: <span className="font-bold">Rp {getProductPrice(parseInt(selectedProduct), selectedPriceType).toLocaleString('id-ID')}</span> / unit
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    Stok tersedia: {getMaxStock()} unit
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Keranjang Belanja</h3>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada produk</p>
            ) : (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={index} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.nama_produk}</p>
                          <p className={`text-xs ${getPriceTypeColor(item.jenis_harga)}`}>
                            {getPriceTypeLabel(item.jenis_harga)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600">
                              Rp {item.harga_satuan.toLocaleString('id-ID')}
                            </span>
                            <span className="text-gray-400">x</span>
                            <input
                              type="number"
                              value={item.qty}
                              onChange={(e) => updateCartQuantity(index, parseInt(e.target.value) || 1)}
                              className="w-16 px-1 py-0 border border-gray-300 rounded text-center"
                              min="1"
                            />
                            <span className="text-gray-400">=</span>
                            <span className="text-sm font-semibold text-blue-600">
                              Rp {item.subtotal.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          aria-label="Hapus"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      Rp {totalHarga.toLocaleString('id-ID')}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={loading || cart.length === 0 || !selectedCustomer}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Memproses...</span>
                      </div>
                    ) : (
                      `Bayar Rp ${totalHarga.toLocaleString('id-ID')}`
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
