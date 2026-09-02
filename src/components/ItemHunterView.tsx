import React, { useState } from 'react';
import {
  Compass,
  Search,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingDown,
  Sparkles,
  Store as StoreIcon,
  Navigation,
  Plus,
  ArrowRight,
  Filter,
  Layers,
} from 'lucide-react';
import { Product, Store, StoreProductListing } from '../types/grocery';
import { formatPrice, getProductStoreListingsSorted } from '../utils/priceCalculator';

interface ItemHunterViewProps {
  products: Product[];
  stores: Store[];
  onSelectProduct: (product: Product) => void;
  onSelectStore: (storeId: string) => void;
  onUpdateBasket: (productId: string, delta: number) => void;
  basket: Record<string, number>;
}

export const ItemHunterView: React.FC<ItemHunterViewProps> = ({
  products,
  stores,
  onSelectProduct,
  onSelectStore,
  onUpdateBasket,
  basket,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [hunterSearch, setHunterSearch] = useState<string>('');

  const matchingProducts = products.filter((p) =>
    hunterSearch ? p.name.toLowerCase().includes(hunterSearch.toLowerCase()) || p.brand.toLowerCase().includes(hunterSearch.toLowerCase()) : true
  );

  const activeProduct = products.find((p) => p.id === selectedProductId) || matchingProducts[0] || products[0];

  const sortedListings = activeProduct ? getProductStoreListingsSorted(activeProduct, stores) : [];

  return (
    <div id="item-hunter-container" className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-200 text-xs font-bold border border-white/10">
            <Compass className="w-3.5 h-3.5" />
            <span>Instant Stock & Store Finder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Where Can I Buy This in Town Right Now?
          </h1>
          <p className="text-sm text-amber-100 font-normal">
            Need rare ingredients, specific brands, or out-of-stock staples? Pick any grocery item to see live shelf availability, exact aisle numbers, and verified store prices across the city.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Item Selector, Right Store Availability Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Product Selector Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={hunterSearch}
              onChange={(e) => setHunterSearch(e.target.value)}
              placeholder="Filter items list..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Choose an Item ({matchingProducts.length})
          </div>

          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {matchingProducts.map((p) => {
              const isSelected = p.id === activeProduct?.id;
              const inStockCount = (Object.values(p.storeListings) as StoreProductListing[]).filter(
                (l) => l.stockStatus === 'in_stock' || l.stockStatus === 'low_stock'
              ).length;

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-amber-950' : 'text-slate-900'}`}>
                      {p.name}
                    </p>
                    <div className="flex items-center justify-between text-[11px] mt-0.5">
                      <span className="text-emerald-600 font-extrabold">From {formatPrice(p.lowestPrice)}</span>
                      <span className="text-slate-400">{inStockCount}/{p.totalStoresCount} Stores</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Store Availability & Live Map/Aisle Details */}
        <div className="lg:col-span-8 space-y-4">
          
          {activeProduct ? (
            <>
              {/* Active Product Overview Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  <img
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover bg-slate-100 shadow-inner shrink-0"
                  />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{activeProduct.brand}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">{activeProduct.packageSize}</span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                      {activeProduct.name}
                    </h2>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {activeProduct.description}
                    </p>

                    <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">City Price:</span>
                        <span className="text-sm font-extrabold text-emerald-600">
                          {formatPrice(activeProduct.lowestPrice)} (Cheapest)
                        </span>
                        <span className="text-xs text-slate-400">up to {formatPrice(activeProduct.highestPrice)}</span>
                      </div>

                      <button
                        onClick={() => onUpdateBasket(activeProduct.id, 1)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Basket ({basket[activeProduct.id] || 0})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stores carrying this item list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Live Store Availability & Aisle Finder
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">
                    Sorted by stock & lowest price
                  </span>
                </div>

                <div className="space-y-2.5">
                  {sortedListings.map(({ store, listing }) => {
                    const isLowest = store.id === activeProduct.cheapestStoreId;
                    const isOutOfStock = listing.stockStatus === 'out_of_stock';
                    const isLowStock = listing.stockStatus === 'low_stock';

                    return (
                      <div
                        key={store.id}
                        className={`bg-white rounded-2xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isLowest && !isOutOfStock
                            ? 'border-emerald-300 ring-1 ring-emerald-400/20 bg-emerald-50/30 shadow-xs'
                            : isOutOfStock
                            ? 'border-slate-200 opacity-60 bg-slate-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Store Info */}
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-xs"
                            style={{ backgroundColor: store.brandColor }}
                          >
                            {store.name.substring(0, 2).toUpperCase()}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-slate-900 text-sm">{store.name}</h4>
                              {isLowest && !isOutOfStock && (
                                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Cheapest
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{store.neighborhood} ({store.distanceMiles} miles away)</span>
                            </div>

                            {/* Exact Aisle Finder */}
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                              <span>📍 Find on shelf:</span>
                              <span className="font-extrabold underline">{listing.aisle}</span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                          
                          <div className="text-left sm:text-right">
                            {isOutOfStock ? (
                              <span className="text-rose-600 text-xs font-bold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Out of stock
                              </span>
                            ) : isLowStock ? (
                              <span className="text-amber-600 text-xs font-bold flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" /> Only {listing.stockCount} left
                              </span>
                            ) : (
                              <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> In stock ({listing.stockCount})
                              </span>
                            )}
                            <div className="font-black text-lg text-slate-900">
                              {formatPrice(listing.price)}
                            </div>
                          </div>

                          <button
                            onClick={() => onSelectStore(store.id)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors shrink-0"
                          >
                            Store Info
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <p className="text-slate-500 text-sm">Select an item on the left to see store availability.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
