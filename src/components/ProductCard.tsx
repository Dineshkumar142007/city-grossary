import React from 'react';
import {
  TrendingDown,
  Store as StoreIcon,
  Plus,
  Minus,
  Check,
  Info,
  Layers,
  Sparkles,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { Product, Store, StoreProductListing } from '../types/grocery';
import { formatPrice, calculateSavings } from '../utils/priceCalculator';

interface ProductCardProps {
  product: Product;
  stores: Store[];
  basketQuantity: number;
  onUpdateBasket: (productId: string, delta: number) => void;
  onSelectProduct: (product: Product) => void;
  onSelectStore?: (storeId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  stores,
  basketQuantity,
  onUpdateBasket,
  onSelectProduct,
}) => {
  const storeMap = new Map<string, Store>(stores.map((s) => [s.id, s]));
  const cheapestStore: Store | undefined = storeMap.get(product.cheapestStoreId);
  const bestQualityStore: Store | undefined = storeMap.get(product.bestQualityStoreId);
  const savings = calculateSavings(product.highestPrice, product.lowestPrice);

  const cheapestListing = product.storeListings[product.cheapestStoreId];

  // Count active stock
  const inStockStoresCount = (Object.values(product.storeListings) as StoreProductListing[]).filter(
    (l) => l.stockStatus === 'in_stock' || l.stockStatus === 'low_stock'
  ).length;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Media & Tags */}
      <div>
        <div className="relative aspect-4/3 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onSelectProduct(product)}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Top Floating Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1.5 pointer-events-none">
            <div className="flex flex-col gap-1">
              {savings.percent >= 25 && (
                <span className="inline-flex items-center gap-1 bg-emerald-600/95 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  <TrendingDown className="w-3 h-3" />
                  Save {savings.percent}%
                </span>
              )}
              {product.dietaryTags.slice(0, 1).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-slate-700 px-2 py-0.5 rounded-full shadow-xs border border-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* In stock badge */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs shadow-xs ${
                inStockStoresCount > 0
                  ? 'bg-slate-900/80 text-white'
                  : 'bg-rose-600/90 text-white'
              }`}
            >
              {inStockStoresCount > 0 ? `${inStockStoresCount}/${product.totalStoresCount} Stores Stocked` : 'City-Wide Out of Stock'}
            </span>
          </div>

          {/* Bottom gradient on image */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-medium">
            <span>{product.brand}</span>
            <span>{product.packageSize}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4">
          
          <h3
            id={`product-title-${product.id}`}
            onClick={() => onSelectProduct(product)}
            className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-emerald-700 transition-colors cursor-pointer mb-2"
          >
            {product.name}
          </h3>

          {/* Primary Price Comparison Box */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3 space-y-2">
            
            {/* Lowest price row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                  Cheapest
                </span>
                <span className="text-xs text-slate-600 font-medium truncate max-w-[130px]" title={cheapestStore?.name}>
                  {cheapestStore?.name || 'Local Store'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-base text-emerald-600 tracking-tight">
                  {formatPrice(product.lowestPrice)}
                </span>
                {cheapestListing && (
                  <span className="text-[10px] text-slate-400 block -mt-1 font-medium">
                    {cheapestListing.unitPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Price spread comparison */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>City Range:</span>
              <span className="font-semibold text-slate-700">
                {formatPrice(product.lowestPrice)} – {formatPrice(product.highestPrice)}
              </span>
            </div>

            {/* Best Quality / Organic option if different from cheapest */}
            {bestQualityStore && bestQualityStore.id !== cheapestStore?.id && (
              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600">
                <span className="flex items-center gap-1 text-slate-500">
                  <Award className="w-3 h-3 text-amber-500" />
                  Gourmet/Organic:
                </span>
                <span className="font-medium text-slate-700">
                  {formatPrice(product.storeListings[bestQualityStore.id]?.price || product.highestPrice)} @ {bestQualityStore.name.split(' ')[0]}
                </span>
              </div>
            )}
          </div>

          {/* Quick Store Availability Pills */}
          <div className="flex items-center gap-1 flex-wrap mb-1">
            {stores.map((store) => {
              const listing = product.storeListings[store.id];
              if (!listing || listing.stockStatus === 'not_carried') return null;

              const isLowest = store.id === product.cheapestStoreId;
              const isOut = listing.stockStatus === 'out_of_stock';
              const isLow = listing.stockStatus === 'low_stock';

              return (
                <span
                  key={store.id}
                  title={`${store.name}: ${isOut ? 'Out of stock' : formatPrice(listing.price)} (${listing.stockStatus})`}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-1 transition-all ${
                    isLowest
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold'
                      : isOut
                      ? 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                      : isLow
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: store.brandColor }}
                  />
                  <span>{store.name.split(' ')[0]}</span>
                  {!isOut && <span className="text-[9px] text-slate-500">{formatPrice(listing.price)}</span>}
                </span>
              );
            })}
          </div>

        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
        <button
          id={`view-compare-btn-${product.id}`}
          onClick={() => onSelectProduct(product)}
          className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center justify-center gap-1.5"
        >
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Compare Stores</span>
        </button>

        {/* Add to Basket Control */}
        {basketQuantity > 0 ? (
          <div className="flex items-center bg-emerald-50 border border-emerald-300 rounded-xl overflow-hidden shadow-xs">
            <button
              id={`decrement-basket-${product.id}`}
              onClick={() => onUpdateBasket(product.id, -1)}
              className="p-2 text-emerald-700 hover:bg-emerald-100 transition-colors"
              title="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span
              id={`basket-qty-display-${product.id}`}
              className="px-2 text-xs font-extrabold text-emerald-900"
            >
              {basketQuantity}
            </span>
            <button
              id={`increment-basket-${product.id}`}
              onClick={() => onUpdateBasket(product.id, 1)}
              className="p-2 text-emerald-700 hover:bg-emerald-100 transition-colors"
              title="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            id={`add-basket-btn-${product.id}`}
            onClick={() => onUpdateBasket(product.id, 1)}
            className="py-2 px-3.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 hover:shadow-emerald-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
};
