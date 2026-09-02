import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  ShoppingBag,
  TrendingDown,
  Store as StoreIcon,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Printer,
  Share2,
  Navigation,
  Layers,
  Clock,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { BasketItem, Product, Store } from '../types/grocery';
import { formatPrice, optimizeBasket } from '../utils/priceCalculator';

interface BasketOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  basket: Record<string, number>;
  products: Product[];
  stores: Store[];
  onUpdateBasket: (productId: string, delta: number) => void;
  onClearBasket: () => void;
  onSelectStore: (storeId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const BasketOptimizerModal: React.FC<BasketOptimizerModalProps> = ({
  isOpen,
  onClose,
  basket,
  products,
  stores,
  onUpdateBasket,
  onClearBasket,
  onSelectStore,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const [strategy, setStrategy] = useState<'split_stores' | 'single_store' | 'closest_store'>('split_stores');
  const [checkedInStoreItems, setCheckedInStoreItems] = useState<Record<string, boolean>>({});

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const basketItemsList: BasketItem[] = useMemo(() => {
    return (Object.entries(basket) as [string, number][])
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([productId, quantity]) => ({
        productId,
        quantity: Number(quantity),
        addedAt: Date.now(),
      }));
  }, [basket]);

  const optimization = useMemo(() => {
    return optimizeBasket(basketItemsList, products, stores, strategy);
  }, [basketItemsList, products, stores, strategy]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  const toggleItemChecked = (storeId: string, prodId: string) => {
    const key = `${storeId}-${prodId}`;
    setCheckedInStoreItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      id="basket-optimizer-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="basket-optimizer-modal-content"
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                Smart Grocery Basket Optimizer
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Find where your entire list is cheapest, fastest, or highest quality
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {basketItemsList.length > 0 && (
              <button
                id="clear-basket-btn"
                onClick={onClearBasket}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 border border-transparent hover:border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}

            <button
              id="close-basket-modal-btn"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors focus:outline-hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {basketItemsList.length === 0 ? (
            <div className="text-center py-12 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Your basket is currently empty</h3>
                <p className="text-xs text-slate-500">
                  Add items from the grocery catalog to compare stores and calculate the maximum savings.
                </p>
              </div>

              {/* Quick staple add buttons */}
              <div className="pt-3">
                <span className="text-xs font-semibold text-slate-400 block mb-2">Quickly add essentials:</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {products.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onUpdateBasket(p.id, 1)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3 text-emerald-600" />
                      <span>{p.name.split(' ')[0]} {p.name.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                Browse Grocery Catalog
              </button>
            </div>
          ) : (
            <>
              {/* Basket Items Summary Chips */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Your Shopping Items ({optimization.totalItemsCount} units)
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    City Average Est: {formatPrice(optimization.averageCityCost)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {basketItemsList.map(({ productId, quantity }) => {
                    const product = productMap.get(productId);
                    if (!product) return null;

                    return (
                      <div
                        key={productId}
                        className="bg-white rounded-xl p-2.5 border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div
                          className="flex items-center gap-2 min-w-0 cursor-pointer"
                          onClick={() => onSelectProduct(product)}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate" title={product.name}>
                              {product.name}
                            </p>
                            <span className="text-[10px] text-emerald-600 font-semibold block">
                              From {formatPrice(product.lowestPrice)}
                            </span>
                          </div>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 shrink-0">
                          <button
                            onClick={() => onUpdateBasket(productId, -1)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800">{quantity}</span>
                          <button
                            onClick={() => onUpdateBasket(productId, 1)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optimization Strategy Selector */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Choose Trip Strategy:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Strategy 1: Split Stores */}
                  <button
                    id="strategy-split-stores-btn"
                    onClick={() => {
                      setStrategy('split_stores');
                      triggerConfetti();
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      strategy === 'split_stores'
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        Max Savings
                      </span>
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">Multi-Store Split</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      Split items across cheapest stores for absolute lowest price
                    </p>
                  </button>

                  {/* Strategy 2: Single Best Store */}
                  <button
                    id="strategy-single-store-btn"
                    onClick={() => setStrategy('single_store')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      strategy === 'single_store'
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
                        Single Stop
                      </span>
                      <StoreIcon className="w-4 h-4 text-slate-700" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">Best 1-Store Trip</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      Cheapest single supermarket with all (or most) items in stock
                    </p>
                  </button>

                  {/* Strategy 3: Closest Store */}
                  <button
                    id="strategy-closest-store-btn"
                    onClick={() => setStrategy('closest_store')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      strategy === 'closest_store'
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white">
                        Convenience
                      </span>
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">Closest Store</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      Shortest transit distance from your selected city neighborhood
                    </p>
                  </button>

                </div>
              </div>

              {/* Grand Total & Savings Calculation Box */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                    Calculated Grocery Total
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight">
                      {formatPrice(optimization.totalCost)}
                    </span>
                    <span className="text-sm text-emerald-100 line-through">
                      City Avg: {formatPrice(optimization.averageCityCost)}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100">
                    {strategy === 'split_stores'
                      ? `Shopping across ${optimization.stores.length} stores saves you ${formatPrice(optimization.savingsDollars)}!`
                      : `Shopping at ${optimization.stores[0]?.store.name || 'store'}`}
                  </p>
                </div>

                {optimization.savingsDollars > 0 && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-200 mb-0.5">
                      <TrendingDown className="w-4 h-4" />
                      <span>Total Savings</span>
                    </div>
                    <div className="text-2xl font-black text-white">
                      {formatPrice(optimization.savingsDollars)}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-200">
                      ({optimization.savingsPercentage}% off city avg)
                    </div>
                  </div>
                )}
              </div>

              {/* Action breakdown per store */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Trip Itinerary & In-Store Aisle Guide
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">
                    {optimization.stores.length} Stop(s)
                  </span>
                </div>

                <div className="space-y-4">
                  {optimization.stores.map(({ store, items, subtotal, missingItems }, sIndex) => (
                    <div
                      key={store.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
                    >
                      {/* Store Header */}
                      <div
                        className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        style={{ backgroundColor: store.accentBg }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs"
                            style={{ backgroundColor: store.brandColor }}
                          >
                            {sIndex + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-slate-900 text-sm">{store.name}</h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                                {store.neighborhood} • {store.distanceMiles} mi
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">{store.address}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <div className="text-right">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                              Store Subtotal
                            </span>
                            <span className="text-base font-extrabold text-slate-900">
                              {formatPrice(subtotal)}
                            </span>
                          </div>

                          <button
                            onClick={() => onSelectStore(store.id)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors"
                          >
                            View Store
                          </button>
                        </div>
                      </div>

                      {/* Items to buy at this store */}
                      <div className="p-4 space-y-2">
                        <div className="text-xs font-bold text-slate-600 mb-2">
                          Buy these {items.length} items at {store.name}:
                        </div>

                        <div className="divide-y divide-slate-100">
                          {items.map(({ product, quantity, listing, itemTotal }) => {
                            const isChecked = checkedInStoreItems[`${store.id}-${product.id}`];

                            return (
                              <div
                                key={product.id}
                                className={`py-2.5 flex items-center justify-between gap-3 transition-colors ${
                                  isChecked ? 'opacity-40 line-through' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={!!isChecked}
                                    onChange={() => toggleItemChecked(store.id, product.id)}
                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-900">{product.name}</span>
                                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                        Qty: {quantity}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                      <span className="font-semibold text-emerald-700">{listing.aisle}</span>
                                      <span>•</span>
                                      <span>{formatPrice(listing.price)} each</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-xs font-extrabold text-slate-900">
                                    {formatPrice(itemTotal)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Missing items warning if single store didn't have all */}
                        {missingItems && missingItems.length > 0 && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>{missingItems.length} item(s) not in stock at this store:</span>
                            </div>
                            <div className="pl-5 text-[11px] text-amber-800">
                              {missingItems.map((m) => m.name).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Shopping Route</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
