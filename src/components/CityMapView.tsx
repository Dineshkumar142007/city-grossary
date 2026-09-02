import React, { useState } from 'react';
import {
  MapPin,
  Store as StoreIcon,
  Navigation,
  Clock,
  Phone,
  Star,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Layers,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { Product, Store } from '../types/grocery';
import { CITY_ZONES } from '../data/cityZones';
import { formatPrice } from '../utils/priceCalculator';

interface CityMapViewProps {
  stores: Store[];
  products: Product[];
  selectedZoneId: string;
  setSelectedZoneId: (zoneId: string) => void;
  onSelectProduct: (product: Product) => void;
  onUpdateBasket: (productId: string, delta: number) => void;
  basket: Record<string, number>;
  selectedStoreId?: string;
  onSelectStore: (storeId: string) => void;
}

export const CityMapView: React.FC<CityMapViewProps> = ({
  stores,
  products,
  selectedZoneId,
  setSelectedZoneId,
  onSelectProduct,
  onUpdateBasket,
  basket,
  selectedStoreId,
  onSelectStore,
}) => {
  const [activeStoreId, setActiveStoreId] = useState<string>(selectedStoreId || stores[0]?.id || '');
  const [storeSearch, setStoreSearch] = useState<string>('');
  const [filterPriceLevel, setFilterPriceLevel] = useState<string>('all');

  const currentStore = stores.find((s) => s.id === activeStoreId) || stores[0];

  // Filter stores
  const filteredStores = stores.filter((s) => {
    if (storeSearch && !s.name.toLowerCase().includes(storeSearch.toLowerCase()) && !s.neighborhood.toLowerCase().includes(storeSearch.toLowerCase())) {
      return false;
    }
    if (filterPriceLevel !== 'all' && s.priceLevel !== filterPriceLevel) {
      return false;
    }
    return true;
  });

  // Get products carried at the currently active store
  const storeCatalog = products.map((p) => {
    const listing = p.storeListings[currentStore.id];
    return {
      product: p,
      listing,
    };
  }).filter((item) => item.listing && item.listing.stockStatus !== 'not_carried');

  return (
    <div id="city-map-container" className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-300 text-xs font-bold border border-white/10">
            <MapPin className="w-3.5 h-3.5" />
            <span>Interactive City Grocery Map & Store Catalogs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Explore Stores Across Your City
          </h1>
          <p className="text-sm text-teal-100 font-normal">
            Click on any store to view its complete on-shelf inventory, live verified prices, exact aisle directions, and store amenities.
          </p>
        </div>
      </div>

      {/* Main Layout: Map Canvas + Store List & Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 5 Cols: Visual City Map & Stores Directory */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Interactive SVG City Grid Map */}
          <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Metro City Grid Map
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Click pins to inspect</span>
            </div>

            {/* SVG Visual Map */}
            <div className="relative w-full aspect-4/3 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
              
              {/* City Grid Road Lines */}
              <svg className="w-full h-full opacity-30 absolute inset-0">
                <defs>
                  <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#city-grid)" />
                {/* Major River Curve */}
                <path
                  d="M 0 160 Q 150 180 250 80 T 400 40"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="14"
                  strokeOpacity="0.4"
                />
              </svg>

              {/* Neighborhood Zone Labels */}
              {CITY_ZONES.map((zone) => (
                <div
                  key={zone.id}
                  style={{ left: `${zone.coords.x}%`, top: `${zone.coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-2 py-0.5 rounded bg-slate-950/60 backdrop-blur-xs border border-slate-800/40">
                    {zone.name.split(' ')[0]}
                  </span>
                </div>
              ))}

              {/* Store Interactive Pins */}
              {stores.map((store) => {
                const isActive = store.id === activeStoreId;

                return (
                  <button
                    key={store.id}
                    onClick={() => {
                      setActiveStoreId(store.id);
                      onSelectStore(store.id);
                    }}
                    style={{ left: `${store.mapCoords.x}%`, top: `${store.mapCoords.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-hidden transition-all duration-200 z-20 ${
                      isActive ? 'scale-125 z-30' : 'hover:scale-110'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg ring-2 transition-all ${
                        isActive
                          ? 'ring-white ring-offset-2 ring-offset-slate-900'
                          : 'ring-slate-900'
                      }`}
                      style={{ backgroundColor: store.brandColor }}
                    >
                      <StoreIcon className="w-3.5 h-3.5" />
                    </div>

                    {/* Tooltip on pin */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-40">
                      <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-700 shadow-md">
                        {store.name} ({store.priceLevel})
                      </span>
                    </div>
                  </button>
                );
              })}

            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                All 7 stores active & online
              </span>
              <span>Select store from list below ▾</span>
            </div>
          </div>

          {/* Store List Controls */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            
            {/* Search & Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  placeholder="Filter store name..."
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-100 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={filterPriceLevel}
                onChange={(e) => setFilterPriceLevel(e.target.value)}
                className="text-xs font-bold bg-slate-100 rounded-xl px-2 py-1.5 border border-slate-200 cursor-pointer"
              >
                <option value="all">All Prices</option>
                <option value="₹">₹ Budget</option>
                <option value="₹₹">₹₹ Standard</option>
                <option value="₹₹₹">₹₹₹ Premium</option>
              </select>
            </div>

            {/* Stores List Cards */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredStores.map((store) => {
                const isActive = store.id === activeStoreId;

                return (
                  <div
                    key={store.id}
                    onClick={() => {
                      setActiveStoreId(store.id);
                      onSelectStore(store.id);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/30'
                        : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs"
                        style={{ backgroundColor: store.brandColor }}
                      >
                        {store.priceLevel}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs truncate">{store.name}</h4>
                        <p className={`text-[11px] truncate ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                          {store.neighborhood} • {store.distanceMiles} mi
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        ★ {store.rating}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Right 7 Cols: Selected Store Details & Live In-Stock Catalog */}
        <div className="lg:col-span-7 space-y-5">
          
          {currentStore && (
            <>
              {/* Store Profile Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md"
                      style={{ backgroundColor: currentStore.brandColor }}
                    >
                      <StoreIcon className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900">{currentStore.name}</h2>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {currentStore.priceLevel} Price Tier
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{currentStore.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-xl">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {currentStore.rating} ({currentStore.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{currentStore.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{currentStore.openingHours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{currentStore.phone}</span>
                  </div>
                </div>

                {/* Features & Amenities Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentStore.features.map((f) => (
                    <span
                      key={f}
                      className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-lg"
                    >
                      ✓ {f}
                    </span>
                  ))}
                  {currentStore.curbsidePickup && (
                    <span className="text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                      Curbside Pickup
                    </span>
                  )}
                  {currentStore.deliveryAvailable && (
                    <span className="text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-lg">
                      Delivery Available
                    </span>
                  )}
                </div>

              </div>

              {/* Store Shelf Inventory Catalog */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      Live Catalog at {currentStore.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Showing {storeCatalog.length} products currently carried on shelf
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Real-time Prices
                  </span>
                </div>

                {/* Product List for this store */}
                <div className="divide-y divide-slate-100">
                  {storeCatalog.map(({ product, listing }) => {
                    const isLowestInCity = product.cheapestStoreId === currentStore.id;
                    const isOutOfStock = listing.stockStatus === 'out_of_stock';
                    const isLowStock = listing.stockStatus === 'low_stock';

                    return (
                      <div
                        key={product.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                      >
                        <div
                          className="flex items-center gap-3 cursor-pointer min-w-0"
                          onClick={() => onSelectProduct(product)}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900 truncate" title={product.name}>
                                {product.name}
                              </h4>
                              {isLowestInCity && !isOutOfStock && (
                                <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                                  Lowest in City
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="font-semibold text-emerald-700">{listing.aisle}</span>
                              <span>•</span>
                              <span>{listing.unitPrice}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto shrink-0">
                          
                          {/* Stock status */}
                          <div className="text-left sm:text-right">
                            {isOutOfStock ? (
                              <span className="text-rose-600 text-[11px] font-bold">Out of stock</span>
                            ) : isLowStock ? (
                              <span className="text-amber-600 text-[11px] font-bold">Low ({listing.stockCount})</span>
                            ) : (
                              <span className="text-emerald-600 text-[11px] font-bold">In stock</span>
                            )}
                            <div className="text-sm font-extrabold text-slate-900">
                              {formatPrice(listing.price)}
                            </div>
                          </div>

                          {/* Add to Basket action */}
                          <button
                            onClick={() => onUpdateBasket(product.id, 1)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 transition-all"
                            title="Add to Shopping Basket"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
};
