import React, { useState } from 'react';
import {
  X,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Store as StoreIcon,
  DollarSign,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { Product, Store, StockStatus } from '../types/grocery';

interface PriceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  stores: Store[];
  preselectedProduct?: Product | null;
  onSaveReport: (report: {
    productId: string;
    storeId: string;
    newPrice: number;
    stockStatus: StockStatus;
    dealTag?: string;
  }) => void;
}

export const PriceReportModal: React.FC<PriceReportModalProps> = ({
  isOpen,
  onClose,
  products,
  stores,
  preselectedProduct,
  onSaveReport,
}) => {
  if (!isOpen) return null;

  const [productId, setProductId] = useState<string>(preselectedProduct?.id || products[0]?.id || '');
  const [storeId, setStoreId] = useState<string>(stores[0]?.id || '');
  const [newPrice, setNewPrice] = useState<string>('');
  const [stockStatus, setStockStatus] = useState<StockStatus>('in_stock');
  const [dealTag, setDealTag] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const selectedProduct = products.find((p) => p.id === productId) || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    onSaveReport({
      productId,
      storeId,
      newPrice: priceNum,
      stockStatus,
      dealTag: dealTag.trim() || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      id="price-report-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="price-report-modal-content"
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Community Price & Stock Update</h3>
              <p className="text-xs text-slate-500 font-medium">Keep city grocery prices accurate & verified</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">Price Updated Successfully!</h4>
            <p className="text-xs text-slate-500">
              Thank you for helping fellow city shoppers find the best grocery bargains.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            
            {/* Product selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Select Grocery Item:</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.brand})
                  </option>
                ))}
              </select>
            </div>

            {/* Store selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Supermarket / Grocery Store:</label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.neighborhood})
                  </option>
                ))}
              </select>
            </div>

            {/* Price input */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Observed Shelf Price (₹ INR):</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full pl-7 pr-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Stock status */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Stock Status on Shelf:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStockStatus('in_stock')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    stockStatus === 'in_stock'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  In Stock
                </button>
                <button
                  type="button"
                  onClick={() => setStockStatus('low_stock')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    stockStatus === 'low_stock'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Low Stock
                </button>
                <button
                  type="button"
                  onClick={() => setStockStatus('out_of_stock')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    stockStatus === 'out_of_stock'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Out of Stock
                </button>
              </div>
            </div>

            {/* Deal tag or promo notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Optional Promo Tag / Special Note:</label>
              <input
                type="text"
                value={dealTag}
                onChange={(e) => setDealTag(e.target.value)}
                placeholder="e.g. Buy 1 Get 1 Free, Weekly Ad Special, Member ₹25 Off"
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all"
              >
                Submit Community Verification
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
