import React, { useState } from 'react';
import {
  Flame,
  TrendingDown,
  Percent,
  Sparkles,
  ArrowRight,
  Store as StoreIcon,
  Tag,
  Award,
  AlertCircle,
  Plus,
  Layers,
} from 'lucide-react';
import { Product, Store, StoreProductListing } from '../types/grocery';
import { formatPrice, calculateSavings } from '../utils/priceCalculator';

interface DealsRadarViewProps {
  products: Product[];
  stores: Store[];
  onSelectProduct: (product: Product) => void;
  onSelectStore: (storeId: string) => void;
  onUpdateBasket: (productId: string, delta: number) => void;
}

export const DealsRadarView: React.FC<DealsRadarViewProps> = ({
  products,
  stores,
  onSelectProduct,
  onSelectStore,
  onUpdateBasket,
}) => {
  const [storeAId, setStoreAId] = useState<string>('store-valuemart');
  const [storeBId, setStoreBId] = useState<string>('store-greenleaf');

  const storeMap = new Map<string, Store>(stores.map((s) => [s.id, s]));

  // Products with biggest percentage price disparity
  const disparityProducts = [...products]
    .map((p) => {
      const savings = calculateSavings(p.highestPrice, p.lowestPrice);
      return {
        product: p,
        savings,
        diff: p.highestPrice - p.lowestPrice,
      };
    })
    .sort((a, b) => b.savings.percent - a.savings.percent);

  // Products currently with active promo deals / rollbacks
  const activePromoProducts = products.filter((p) =>
    (Object.values(p.storeListings) as StoreProductListing[]).some(
      (l) => !!l.dealTag || (l.originalPrice !== undefined && l.originalPrice > l.price)
    )
  );

  // Head-to-Head store comparator calculation
  const storeA = storeMap.get(storeAId);
  const storeB = storeMap.get(storeBId);

  const headToHeadComparison = products.map((prod) => {
    const listA = prod.storeListings[storeAId];
    const listB = prod.storeListings[storeBId];
    return {
      product: prod,
      listA,
      listB,
      priceA: listA?.price || 0,
      priceB: listB?.price || 0,
      stockA: listA?.stockStatus || 'not_carried',
      stockB: listB?.stockStatus || 'not_carried',
    };
  }).filter((item) => item.priceA > 0 && item.priceB > 0);

  const totalA = headToHeadComparison.reduce((sum, item) => sum + item.priceA, 0);
  const totalB = headToHeadComparison.reduce((sum, item) => sum + item.priceB, 0);
  const diffAB = Math.abs(totalA - totalB);
  const cheaperStore = totalA < totalB ? storeA : storeB;

  return (
    <div id="deals-radar-container" className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-pink-200 text-xs font-bold border border-white/20">
            <Flame className="w-3.5 h-3.5" />
            <span>City Grocery Price Disparity Radar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Biggest City Price Gaps & Active Bargains
          </h1>
          <p className="text-sm text-pink-100 font-normal">
            We track price differences across all grocery retailers in real-time. Discover which staples have huge markups at convenience stores and where to score maximum savings.
          </p>
        </div>
      </div>

      {/* Top Disparities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Percent className="w-5 h-5 text-rose-500" />
              <span>Highest Price Disparities in Town</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Same exact products with the widest gap between the cheapest & most expensive stores
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {disparityProducts.slice(0, 6).map(({ product, savings, diff }) => {
            const cheapStore = storeMap.get(product.cheapestStoreId);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1 border border-rose-200">
                        <TrendingDown className="w-3 h-3" />
                        Save {savings.percent}% ({formatPrice(diff)})
                      </div>
                      <h4
                        onClick={() => onSelectProduct(product)}
                        className="font-bold text-slate-900 text-xs line-clamp-2 hover:text-emerald-700 cursor-pointer"
                      >
                        {product.name}
                      </h4>
                    </div>
                  </div>

                  {/* Price Comparison Bar */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700 font-bold">Cheapest: {cheapStore?.name.split(' ')[0]}</span>
                      <span className="font-extrabold text-emerald-600">{formatPrice(product.lowestPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Highest city price:</span>
                      <span className="line-through font-semibold">{formatPrice(product.highestPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="text-xs font-bold text-slate-700 hover:text-emerald-700"
                  >
                    View All Stores →
                  </button>
                  <button
                    onClick={() => onUpdateBasket(product.id, 1)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Head-to-Head Store Comparator */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Store vs Store Showdown</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Compare Any Two Supermarkets Head-to-Head
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            See price differences item-by-item across two selected city grocers
          </p>
        </div>

        {/* Store selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Store 1:</label>
            <select
              value={storeAId}
              onChange={(e) => setStoreAId(e.target.value)}
              className="w-full text-xs font-bold text-slate-900 bg-white rounded-xl p-2.5 border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id} disabled={s.id === storeBId}>
                  {s.name} ({s.priceLevel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Store 2:</label>
            <select
              value={storeBId}
              onChange={(e) => setStoreBId(e.target.value)}
              className="w-full text-xs font-bold text-slate-900 bg-white rounded-xl p-2.5 border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id} disabled={s.id === storeAId}>
                  {s.name} ({s.priceLevel})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Head to head summary outcome */}
        {cheaperStore && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-950">
            <div>
              <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{cheaperStore.name} is {formatPrice(diffAB)} cheaper overall for these items!</span>
              </h4>
              <p className="text-xs text-emerald-800">
                Cart of {headToHeadComparison.length} shared staple items costs {formatPrice(totalA)} at {storeA?.name} vs {formatPrice(totalB)} at {storeB?.name}.
              </p>
            </div>
            <div className="text-xs font-bold px-3 py-1.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
              {Math.round((diffAB / Math.max(totalA, totalB)) * 100)}% Difference
            </div>
          </div>
        )}

        {/* Item-by-item table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Product</th>
                <th className="pb-3 text-right">{storeA?.name}</th>
                <th className="pb-3 text-right">{storeB?.name}</th>
                <th className="pb-3 text-right">Price Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {headToHeadComparison.map(({ product, priceA, priceB }) => {
                const diff = priceA - priceB;
                const aIsCheaper = diff < 0;

                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-2">
                      <div className="font-bold text-slate-900">{product.name}</div>
                      <div className="text-[10px] text-slate-400">{product.packageSize}</div>
                    </td>
                    <td className={`py-3 text-right font-extrabold ${aIsCheaper ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {formatPrice(priceA)}
                    </td>
                    <td className={`py-3 text-right font-extrabold ${!aIsCheaper ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {formatPrice(priceB)}
                    </td>
                    <td className="py-3 text-right">
                      {diff === 0 ? (
                        <span className="text-slate-400">Same</span>
                      ) : (
                        <span className={`font-bold ${aIsCheaper ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {aIsCheaper ? `Save ${formatPrice(Math.abs(diff))}` : `+${formatPrice(diff)}`}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
