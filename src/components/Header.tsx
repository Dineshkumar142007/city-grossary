import React from 'react';
import {
  ShoppingBag,
  Store as StoreIcon,
  Sparkles,
  MapPin,
  Search,
  SlidersHorizontal,
  Flame,
  ArrowUpDown,
  Compass,
  Code2,
  Share2,
} from 'lucide-react';
import { CITY_ZONES } from '../data/cityZones';
import { CurrencySymbol } from '../types/grocery';

interface HeaderProps {
  activeTab: 'compare' | 'basket' | 'map' | 'deals' | 'item-hunter' | 'api-docs';
  setActiveTab: (tab: 'compare' | 'basket' | 'map' | 'deals' | 'item-hunter' | 'api-docs') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedZoneId: string;
  setSelectedZoneId: (zoneId: string) => void;
  basketCount: number;
  currency: CurrencySymbol;
  setCurrency: (currency: CurrencySymbol) => void;
  onOpenBasket: () => void;
  onOpenReportModal: () => void;
  onOpenShareModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedZoneId,
  setSelectedZoneId,
  basketCount,
  currency,
  setCurrency,
  onOpenBasket,
  onOpenReportModal,
  onOpenShareModal,
}) => {
  const currentZone = CITY_ZONES.find((z) => z.id === selectedZoneId) || CITY_ZONES[0];

  return (
    <header id="main-app-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              id="brand-home-btn"
              onClick={() => setActiveTab('compare')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                <StoreIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
                    City<span className="text-emerald-600">Grocer</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Live Rates
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  City-Wide Price Comparison & Item Finder
                </p>
              </div>
            </button>
          </div>

          {/* Center Search Input */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="global-header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milk, avocados, eggs, olive oil, coffee, stores..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Currency Indicator */}
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200/80 text-xs font-bold text-emerald-800 shadow-2xs shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>₹ INR</span>
            </div>

            {/* Zone Selector Dropdown - Responsive for Desktop & Tablet */}
            <div className="relative hidden sm:flex items-center bg-slate-100/90 rounded-xl px-2.5 py-1.5 border border-slate-200 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider leading-none">Zone</span>
                <select
                  id="user-city-zone-select"
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="text-xs font-semibold text-slate-700 bg-transparent border-none p-0 pr-3 focus:ring-0 focus:outline-hidden cursor-pointer"
                >
                  {CITY_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Report Price Button */}
            <button
              id="report-price-btn"
              onClick={onOpenReportModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors border border-slate-200/80 shrink-0"
              title="Report or update a price you noticed in-store"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Update Price</span>
            </button>

            {/* Share Public Website Button */}
            {onOpenShareModal && (
              <button
                id="header-share-app-btn"
                onClick={onOpenShareModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-xl transition-all border border-emerald-300 shadow-2xs hover:shadow-xs shrink-0"
                title="Share this public website link"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden xs:inline">Share</span>
              </button>
            )}

            {/* Shopping Basket Button with Badge */}
            <button
              id="header-basket-btn"
              onClick={onOpenBasket}
              className={`relative flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 ${
                basketCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 ring-2 ring-emerald-500/20'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden md:inline">Basket Optimizer</span>
              {basketCount > 0 && (
                <span
                  id="header-basket-counter-badge"
                  className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white text-emerald-700 font-extrabold text-[11px]"
                >
                  {basketCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar & Zone Quick Row */}
        <div className="pb-3 md:hidden space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="mobile-header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items or stores..."
                className="w-full pl-10 pr-9 py-2 bg-slate-100 text-xs font-medium text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile Zone Selector */}
            <div className="flex sm:hidden items-center bg-slate-100 rounded-xl px-2 py-2 border border-slate-200 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
              <select
                id="mobile-user-city-zone-select"
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none p-0 pr-2 focus:ring-0 focus:outline-hidden cursor-pointer max-w-[90px] truncate"
              >
                {CITY_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav id="header-navigation-tabs" className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none text-xs font-semibold">
          
          <button
            id="nav-tab-compare"
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'compare'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Price Comparison & Products</span>
          </button>

          <button
            id="nav-tab-item-hunter"
            onClick={() => setActiveTab('item-hunter')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'item-hunter'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>Where To Buy Direct</span>
          </button>

          <button
            id="nav-tab-deals"
            onClick={() => setActiveTab('deals')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'deals'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>City Deals & Price Gaps</span>
          </button>

          <button
            id="nav-tab-map"
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'map'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span>Store Map & Catalogs</span>
          </button>

          <button
            id="nav-tab-basket"
            onClick={() => setActiveTab('basket')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'basket'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trip Optimizer {basketCount > 0 ? `(${basketCount})` : ''}</span>
          </button>

          <button
            id="nav-tab-api-docs"
            onClick={() => setActiveTab('api-docs')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'api-docs'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Flask REST API</span>
          </button>
        </nav>

      </div>
    </header>
  );
};
