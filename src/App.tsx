import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_PRODUCTS } from './data/products';
import { STORES_DATA } from './data/stores';
import { CITY_ZONES } from './data/cityZones';
import { Product, Store, StockStatus, CurrencySymbol } from './types/grocery';
import { Header } from './components/Header';
import { PriceComparisonView } from './components/PriceComparisonView';
import { BasketOptimizerModal } from './components/BasketOptimizerModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ItemHunterView } from './components/ItemHunterView';
import { DealsRadarView } from './components/DealsRadarView';
import { CityMapView } from './components/CityMapView';
import { PriceReportModal } from './components/PriceReportModal';
import { ApiExplorerView } from './components/ApiExplorerView';
import { ShareAppModal } from './components/ShareAppModal';
import {
  CheckCircle2,
  Store as StoreIcon,
  ShoppingBag,
  Sparkles,
  MapPin,
  Flame,
  Compass,
  ArrowUpDown,
  ShieldCheck,
  Share2,
  FileText,
} from 'lucide-react';

export default function App() {
  // Application State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('citygrocer_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [currency, setCurrency] = useState<CurrencySymbol>('₹');

  const [selectedZoneId, setSelectedZoneId] = useState<string>(() => {
    return localStorage.getItem('citygrocer_zone') || 'downtown';
  });

  const [basket, setBasket] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('citygrocer_basket');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {
      'prod-1': 1,
      'prod-2': 2,
      'prod-3': 1,
    };
  });

  const [activeTab, setActiveTab] = useState<'compare' | 'basket' | 'map' | 'deals' | 'item-hunter' | 'api-docs'>('compare');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isBasketModalOpen, setIsBasketModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [reportModalProduct, setReportModalProduct] = useState<Product | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('store-valuemart');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('citygrocer_basket', JSON.stringify(basket));
  }, [basket]);

  useEffect(() => {
    localStorage.setItem('citygrocer_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('citygrocer_zone', selectedZoneId);
  }, [selectedZoneId]);

  useEffect(() => {
    localStorage.setItem('citygrocer_products', JSON.stringify(products));
  }, [products]);

  // Recalculate store distances dynamically relative to chosen city zone
  const storesWithDynamicDistance: Store[] = useMemo(() => {
    const userZone = CITY_ZONES.find((z) => z.id === selectedZoneId) || CITY_ZONES[0];

    return STORES_DATA.map((store) => {
      // Euclidean distance on grid map
      const dx = store.mapCoords.x - userZone.coords.x;
      const dy = store.mapCoords.y - userZone.coords.y;
      const dist = Math.max(0.3, Math.sqrt(dx * dx + dy * dy) * 0.055);
      return {
        ...store,
        distanceMiles: parseFloat(dist.toFixed(1)),
      };
    });
  }, [selectedZoneId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleUpdateBasket = (productId: string, delta: number) => {
    setBasket((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      const product = products.find((p) => p.id === productId);

      if (delta > 0 && product) {
        showToast(`Added ${product.name.split(' ')[0]} ${product.name.split(' ')[1]} to basket`);
      }

      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const handleClearBasket = () => {
    setBasket({});
    showToast('Shopping basket cleared');
  };

  const handleSelectStore = (storeId: string) => {
    setSelectedStoreId(storeId);
    setActiveTab('map');
    // Close modals if open
    setSelectedProductForModal(null);
    setIsBasketModalOpen(false);
  };

  // Community price / stock update handler
  const handleSaveReport = (report: {
    productId: string;
    storeId: string;
    newPrice: number;
    stockStatus: StockStatus;
    dealTag?: string;
  }) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== report.productId) return prod;

        const currentListing = prod.storeListings[report.storeId] || {
          storeId: report.storeId,
          price: report.newPrice,
          unit: '1 item',
          unitPrice: `$${report.newPrice.toFixed(2)}`,
          aisle: 'Main Shelf',
          lastVerified: 'Just now',
        };

        const updatedListing = {
          ...currentListing,
          price: report.newPrice,
          stockStatus: report.stockStatus,
          lastVerified: 'Just now (Community Verified)',
          dealTag: report.dealTag || currentListing.dealTag,
        };

        const updatedListings: Record<string, typeof updatedListing> = {
          ...prod.storeListings,
          [report.storeId]: updatedListing,
        };

        // Recalculate lowest and highest price
        const validListings = Object.values(updatedListings).filter(
          (l) => l.stockStatus !== 'not_carried' && l.price > 0
        );

        const lowest = Math.min(...validListings.map((l) => l.price));
        const highest = Math.max(...validListings.map((l) => l.price));
        const cheapestListing = validListings.find((l) => l.price === lowest);

        return {
          ...prod,
          storeListings: updatedListings,
          lowestPrice: lowest,
          highestPrice: highest,
          cheapestStoreId: cheapestListing ? cheapestListing.storeId : prod.cheapestStoreId,
        };
      })
    );

    showToast('Price update saved & verified for this city store!');
  };

  const basketCount = (Object.values(basket) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedZoneId={selectedZoneId}
        setSelectedZoneId={setSelectedZoneId}
        basketCount={basketCount}
        currency={currency}
        setCurrency={setCurrency}
        onOpenBasket={() => setIsBasketModalOpen(true)}
        onOpenReportModal={() => {
          setReportModalProduct(null);
          setIsReportModalOpen(true);
        }}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Main Page Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        {activeTab === 'compare' && (
          <PriceComparisonView
            products={products}
            stores={storesWithDynamicDistance}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            basket={basket}
            onUpdateBasket={handleUpdateBasket}
            onSelectProduct={(p) => setSelectedProductForModal(p)}
            onSelectStore={handleSelectStore}
            onOpenBasket={() => setIsBasketModalOpen(true)}
          />
        )}

        {activeTab === 'api-docs' && (
          <ApiExplorerView
            products={products}
            stores={storesWithDynamicDistance}
          />
        )}

        {activeTab === 'item-hunter' && (
          <ItemHunterView
            products={products}
            stores={storesWithDynamicDistance}
            onSelectProduct={(p) => setSelectedProductForModal(p)}
            onSelectStore={handleSelectStore}
            onUpdateBasket={handleUpdateBasket}
            basket={basket}
          />
        )}

        {activeTab === 'deals' && (
          <DealsRadarView
            products={products}
            stores={storesWithDynamicDistance}
            onSelectProduct={(p) => setSelectedProductForModal(p)}
            onSelectStore={handleSelectStore}
            onUpdateBasket={handleUpdateBasket}
          />
        )}

        {activeTab === 'map' && (
          <CityMapView
            stores={storesWithDynamicDistance}
            products={products}
            selectedZoneId={selectedZoneId}
            setSelectedZoneId={setSelectedZoneId}
            onSelectProduct={(p) => setSelectedProductForModal(p)}
            onUpdateBasket={handleUpdateBasket}
            basket={basket}
            selectedStoreId={selectedStoreId}
            onSelectStore={(sId) => setSelectedStoreId(sId)}
          />
        )}

        {activeTab === 'basket' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="text-center max-w-md mx-auto py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900">Grocery Trip & Basket Optimizer</h2>
                <p className="text-xs text-slate-500">
                  Open the full screen multi-store optimizer to calculate exact item totals and split-trip savings.
                </p>
              </div>
              <button
                onClick={() => setIsBasketModalOpen(true)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all"
              >
                Launch Optimizer Modal ({basketCount} items)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProductForModal}
        stores={storesWithDynamicDistance}
        onClose={() => setSelectedProductForModal(null)}
        basketQuantity={selectedProductForModal ? basket[selectedProductForModal.id] || 0 : 0}
        onUpdateBasket={handleUpdateBasket}
        onSelectStore={handleSelectStore}
        onOpenReportModalForProduct={(p) => {
          setReportModalProduct(p);
          setIsReportModalOpen(true);
        }}
      />

      <BasketOptimizerModal
        isOpen={isBasketModalOpen || activeTab === 'basket'}
        onClose={() => {
          setIsBasketModalOpen(false);
          if (activeTab === 'basket') setActiveTab('compare');
        }}
        basket={basket}
        products={products}
        stores={storesWithDynamicDistance}
        onUpdateBasket={handleUpdateBasket}
        onClearBasket={handleClearBasket}
        onSelectStore={handleSelectStore}
        onSelectProduct={(p) => setSelectedProductForModal(p)}
      />

      <PriceReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportModalProduct(null);
        }}
        products={products}
        stores={storesWithDynamicDistance}
        preselectedProduct={reportModalProduct}
        onSaveReport={handleSaveReport}
      />

      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShowToast={(msg) => showToast(msg)}
      />

      {/* Mobile Bottom Floating Navigation Bar (Smartphones & Small Tablets) */}
      <div
        id="mobile-bottom-nav-bar"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 shadow-lg safe-area-bottom"
      >
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          <button
            id="mobile-nav-tab-compare"
            onClick={() => setActiveTab('compare')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[44px] ${
              activeTab === 'compare'
                ? 'text-emerald-700 font-extrabold bg-emerald-50/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowUpDown className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight">Compare</span>
          </button>

          <button
            id="mobile-nav-tab-hunter"
            onClick={() => setActiveTab('item-hunter')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[44px] ${
              activeTab === 'item-hunter'
                ? 'text-amber-700 font-extrabold bg-amber-50/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight">Buy Direct</span>
          </button>

          <button
            id="mobile-nav-tab-deals"
            onClick={() => setActiveTab('deals')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[44px] ${
              activeTab === 'deals'
                ? 'text-rose-700 font-extrabold bg-rose-50/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flame className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight">Deals</span>
          </button>

          <button
            id="mobile-nav-tab-map"
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[44px] ${
              activeTab === 'map'
                ? 'text-teal-700 font-extrabold bg-teal-50/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight">Map</span>
          </button>

          <button
            id="mobile-nav-tab-basket"
            onClick={() => setIsBasketModalOpen(true)}
            className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[44px] ${
              basketCount > 0
                ? 'text-emerald-700 font-extrabold bg-emerald-100/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 mb-0.5" />
              {basketCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-0.5 bg-emerald-600 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                  {basketCount}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-tight">Basket</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 pb-24 md:pb-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              CG
            </div>
            <span className="font-extrabold text-slate-800">CityGrocer</span>
            <span>— Real-time Grocery Price Comparison & Item Finder</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] font-medium text-slate-400">
            <span>Live Stock & Aisle Tracking</span>
            <span>•</span>
            <a
              id="footer-roadmap-pdf-btn"
              href="/citygrocer-roadmap.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold underline underline-offset-2 cursor-pointer"
            >
              <FileText className="w-3 h-3" />
              <span>Roadmap (PDF)</span>
            </a>
            <span>•</span>
            <button
              id="footer-share-link-btn"
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-2 cursor-pointer"
            >
              <Share2 className="w-3 h-3" />
              <span>Share & Export</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
