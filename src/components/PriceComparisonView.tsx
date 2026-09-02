import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  Flame,
  CheckCircle2,
  Sparkles,
  TrendingDown,
  ShoppingBag,
  Store as StoreIcon,
  Tag,
  Percent,
} from 'lucide-react';
import { Product, ProductCategory, Store } from '../types/grocery';
import { ProductCard } from './ProductCard';
import { formatPrice } from '../utils/priceCalculator';

interface PriceComparisonViewProps {
  products: Product[];
  stores: Store[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  basket: Record<string, number>;
  onUpdateBasket: (productId: string, delta: number) => void;
  onSelectProduct: (product: Product) => void;
  onSelectStore: (storeId: string) => void;
  onOpenBasket: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'All',
  'Produce & Fruit',
  'Dairy & Eggs',
  'Bakery & Bread',
  'Meat & Seafood',
  'Pantry & Grains',
  'Snacks & Drinks',
  'Organic & Specialty',
  'Household Essentials',
];

export const PriceComparisonView: React.FC<PriceComparisonViewProps> = ({
  products,
  stores,
  searchQuery,
  setSearchQuery,
  basket,
  onUpdateBasket,
  onSelectProduct,
  onSelectStore,
  onOpenBasket,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('all');
  const [selectedDietaryFilter, setSelectedDietaryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'lowest_price' | 'highest_savings' | 'name'>('lowest_price');

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesBrand = prod.brand.toLowerCase().includes(q);
        const matchesCategory = prod.category.toLowerCase().includes(q);
        const matchesTags = prod.dietaryTags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesBrand && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All' && prod.category !== selectedCategory) {
        return false;
      }

      // Store availability filter
      if (selectedStoreFilter !== 'all') {
        const listing = prod.storeListings[selectedStoreFilter];
        if (!listing || listing.stockStatus === 'not_carried' || listing.stockStatus === 'out_of_stock') {
          return false;
        }
      }

      // Dietary filter
      if (selectedDietaryFilter !== 'all') {
        if (!prod.dietaryTags.includes(selectedDietaryFilter)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'lowest_price') {
        return a.lowestPrice - b.lowestPrice;
      }
      if (sortBy === 'highest_savings') {
        const savingsA = (a.highestPrice - a.lowestPrice) / a.highestPrice;
        const savingsB = (b.highestPrice - b.lowestPrice) / b.highestPrice;
        return savingsB - savingsA;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [products, searchQuery, selectedCategory, selectedStoreFilter, selectedDietaryFilter, sortBy]);

  const basketItemCount = (Object.values(basket) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div id="price-comparison-main-container" className="space-y-6">
      
      {/* Top Banner & Insight Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background decorative rings */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-56 h-56 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-bold border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-time City Grocery Price Intelligence (₹ INR)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Compare store prices. Find where it's <span className="text-emerald-400">cheap & in stock</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            Prices for the same item vary up to <strong className="text-emerald-300">55%</strong> across supermarkets, wholesale clubs, and neighborhood bodegas. Check live stock, compare unit rates in Rupees (₹), and optimize your cart.
          </p>

          {/* Quick stats pills */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <StoreIcon className="w-4 h-4 text-emerald-400" />
              <span>{stores.length} City Stores Monitored</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <Percent className="w-4 h-4 text-teal-300" />
              <span>Avg. 32% Savings per Basket</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Aisle & Stock Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            id={`category-btn-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Active count and store filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-bold text-slate-700">
            Showing <span className="text-emerald-600">{filteredProducts.length}</span> Products
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Filter by store */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Store:</span>
            <select
              id="filter-store-select"
              value={selectedStoreFilter}
              onChange={(e) => setSelectedStoreFilter(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Stores in City</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.priceLevel})
                </option>
              ))}
            </select>
          </div>

          {/* Dietary Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Dietary:</span>
            <select
              id="filter-dietary-select"
              value={selectedDietaryFilter}
              onChange={(e) => setSelectedDietaryFilter(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Any Dietary Type</option>
              <option value="USDA Organic">USDA Organic</option>
              <option value="Vegan">Vegan</option>
              <option value="Gluten-Free">Gluten-Free</option>
              <option value="Keto">Keto Friendly</option>
              <option value="Non-GMO">Non-GMO</option>
              <option value="Cage-Free">Cage-Free</option>
            </select>
          </div>
        </div>

        {/* Right: Sort controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <select
            id="sort-products-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-bold text-slate-800 bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="lowest_price">Lowest Price (₹)</option>
            <option value="highest_savings">Biggest City Savings (%)</option>
            <option value="name">Product Name (A-Z)</option>
          </select>
        </div>

      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div
          id="products-comparison-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              stores={stores}
              basketQuantity={basket[product.id] || 0}
              onUpdateBasket={onUpdateBasket}
              onSelectProduct={onSelectProduct}
              onSelectStore={onSelectStore}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-slate-900">No matching groceries found</h3>
            <p className="text-xs text-slate-500">
              Try searching for common staples like "Milk", "Eggs", "Bread", or reset filters.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedStoreFilter('all');
              setSelectedDietaryFilter('all');
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Floating Basket Quick Bar if user has items */}
      {basketItemCount > 0 && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-30 animate-in slide-in-from-bottom duration-300">
          <button
            id="floating-basket-quick-btn"
            onClick={onOpenBasket}
            className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-slate-900/95 hover:bg-black text-white shadow-xl shadow-slate-900/30 border border-slate-700 backdrop-blur-md transition-all hover:scale-105"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                {basketItemCount}
              </span>
            </div>
            <div className="text-left">
              <div className="text-xs font-bold leading-none">Optimize Trip</div>
              <div className="text-[10px] text-emerald-300 font-medium mt-0.5 hidden xs:block">
                Cheapest store split →
              </div>
            </div>
          </button>
        </div>
      )}

    </div>
  );
};
