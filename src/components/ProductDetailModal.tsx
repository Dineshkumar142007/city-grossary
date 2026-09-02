import React from 'react';
import {
  X,
  Sparkles,
  MapPin,
  Clock,
  TrendingDown,
  Award,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Minus,
  Navigation,
  Tag,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { Product, Store } from '../types/grocery';
import { formatPrice, calculateSavings, getProductStoreListingsSorted } from '../utils/priceCalculator';

interface ProductDetailModalProps {
  product: Product | null;
  stores: Store[];
  onClose: () => void;
  basketQuantity: number;
  onUpdateBasket: (productId: string, delta: number) => void;
  onSelectStore: (storeId: string) => void;
  onOpenReportModalForProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  stores,
  onClose,
  basketQuantity,
  onUpdateBasket,
  onSelectStore,
  onOpenReportModalForProduct,
}) => {
  if (!product) return null;

  const sortedListings = getProductStoreListingsSorted(product, stores);
  const storeMap = new Map<string, Store>(stores.map((s) => [s.id, s]));

  const cheapestStore = storeMap.get(product.cheapestStoreId);
  const bestQualityStore = storeMap.get(product.bestQualityStoreId);
  const maxSavings = calculateSavings(product.highestPrice, product.lowestPrice);

  return (
    <div
      id="product-detail-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="product-detail-modal-content"
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {product.category}
            </span>
            <span className="text-xs text-slate-500 font-medium">Product Comparison</span>
          </div>

          <button
            id="close-product-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors focus:outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Top Product Hero Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Image */}
            <div className="md:col-span-4 rounded-2xl overflow-hidden bg-slate-100 aspect-4/3 md:aspect-square relative shadow-inner border border-slate-200">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium py-1 px-2.5 rounded-lg flex items-center justify-between">
                <span>{product.brand}</span>
                <span>{product.packageSize}</span>
              </div>
            </div>

            {/* Product Meta & Highlights */}
            <div className="md:col-span-8 space-y-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{product.brand}</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {product.name}
                </h2>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Badges & Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.dietaryTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Nutrition Highlights */}
              {product.nutritionHighlights && (
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex flex-wrap gap-3 text-xs text-emerald-900 font-medium">
                  {product.nutritionHighlights.map((n) => (
                    <div key={n} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{n}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Big Savings Callout Banner */}
              {maxSavings.dollars > 0 && (
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Save {formatPrice(maxSavings.dollars)} ({maxSavings.percent}%) Across City Stores!
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Cheapest at <strong>{cheapestStore?.name}</strong> ({formatPrice(product.lowestPrice)}) vs {formatPrice(product.highestPrice)} elsewhere.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenReportModalForProduct(product)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline shrink-0 hidden sm:block"
                  >
                    Report Price
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section: Live Store Pricing Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Where to Buy in Your City
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Ranked by best price and stock availability
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                {sortedListings.length} Stores Carried
              </span>
            </div>

            {/* Listings Table / Cards */}
            <div className="space-y-2.5">
              {sortedListings.map(({ store, listing }, index) => {
                const isLowest = store.id === product.cheapestStoreId;
                const isBestQuality = store.id === product.bestQualityStoreId;
                const isOutOfStock = listing.stockStatus === 'out_of_stock';
                const isLowStock = listing.stockStatus === 'low_stock';

                return (
                  <div
                    key={store.id}
                    id={`store-listing-row-${store.id}`}
                    className={`rounded-2xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isLowest && !isOutOfStock
                        ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/20'
                        : isOutOfStock
                        ? 'bg-slate-50/80 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Store info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 font-extrabold text-sm shadow-xs"
                        style={{ backgroundColor: store.brandColor }}
                      >
                        {store.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => onSelectStore(store.id)}
                            className="font-bold text-slate-900 hover:text-emerald-700 text-sm transition-colors text-left"
                          >
                            {store.name}
                          </button>

                          {isLowest && !isOutOfStock && (
                            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              <Sparkles className="w-2.5 h-2.5" />
                              Cheapest Price
                            </span>
                          )}

                          {isBestQuality && (
                            <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              <Award className="w-2.5 h-2.5" />
                              Premium Quality
                            </span>
                          )}

                          {listing.dealTag && (
                            <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                              <Tag className="w-2.5 h-2.5" />
                              {listing.dealTag}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {store.neighborhood} ({store.distanceMiles} mi)
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>{listing.aisle}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400">Verified {listing.lastVerified}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Stock & Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      
                      {/* Stock indicator */}
                      <div className="text-left sm:text-right">
                        {isOutOfStock ? (
                          <div className="flex items-center gap-1 text-rose-600 text-xs font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Out of Stock</span>
                          </div>
                        ) : isLowStock ? (
                          <div className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Only {listing.stockCount} left</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>In Stock ({listing.stockCount} available)</span>
                          </div>
                        )}
                        <span className="text-[11px] text-slate-400 block font-medium">
                          {listing.unitPrice}
                        </span>
                      </div>

                      {/* Price display */}
                      <div className="text-right min-w-[70px]">
                        <div className="font-black text-lg text-slate-900 tracking-tight">
                          {formatPrice(listing.price)}
                        </div>
                        {listing.originalPrice && listing.originalPrice > listing.price && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(listing.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Store Visit action */}
                      <button
                        onClick={() => onSelectStore(store.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="View Store Catalog"
                      >
                        <Building2 className="w-4 h-4" />
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">In your basket:</span>
            <span className="text-sm font-extrabold text-slate-900">{basketQuantity} item(s)</span>
          </div>

          <div className="flex items-center gap-3">
            {basketQuantity > 0 ? (
              <div className="flex items-center bg-emerald-50 border border-emerald-300 rounded-xl overflow-hidden">
                <button
                  id="modal-basket-decrement"
                  onClick={() => onUpdateBasket(product.id, -1)}
                  className="p-2.5 text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-bold text-emerald-900">{basketQuantity}</span>
                <button
                  id="modal-basket-increment"
                  onClick={() => onUpdateBasket(product.id, 1)}
                  className="p-2.5 text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="modal-add-basket-btn"
                onClick={() => onUpdateBasket(product.id, 1)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Basket</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
