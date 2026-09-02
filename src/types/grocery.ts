export type CurrencySymbol = '₹';

export type PriceLevel = '₹' | '₹₹' | '₹₹₹';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'not_carried';

export type ProductCategory =
  | 'All'
  | 'Produce & Fruit'
  | 'Dairy & Eggs'
  | 'Bakery & Bread'
  | 'Meat & Seafood'
  | 'Pantry & Grains'
  | 'Snacks & Drinks'
  | 'Organic & Specialty'
  | 'Household Essentials';

export interface Store {
  id: string;
  store_id?: number;
  name: string;
  location?: string;
  tagline: string;
  category: 'Discount Supercenter' | 'Organic Grocery' | 'Neighborhood Market' | 'Hypermarket' | 'Wholesale Club' | 'Corner Bodega' | 'Specialty & Spice';
  address: string;
  neighborhood: string;
  zoneId: string;
  distanceMiles: number; // calculated relative to user zone
  rating: number;
  reviewCount: number;
  priceLevel: PriceLevel;
  openingHours: string;
  isOpenNow: boolean;
  phone: string;
  brandColor: string;
  accentBg: string;
  features: string[];
  mapCoords: {
    x: number; // percentage on city grid (0 - 100)
    y: number; // percentage on city grid (0 - 100)
  };
  deliveryAvailable: boolean;
  curbsidePickup: boolean;
}

export interface StoreProductListing {
  storeId: string;
  store_name?: string;
  location?: string;
  price: number;
  originalPrice?: number;
  stockStatus: StockStatus;
  stockCount?: number;
  unit: string;
  unitPrice: string;
  aisle: string;
  lastVerified: string;
  dealTag?: string;
  isOrganic?: boolean;
}

export interface Product {
  id: string;
  product_id?: number;
  name: string;
  brand: string;
  category: ProductCategory;
  image: string;
  description: string;
  packageSize: string;
  dietaryTags: string[];
  averageCityPrice: number;
  lowestPrice: number;
  highestPrice: number;
  cheapestStoreId: string;
  bestQualityStoreId: string;
  availableStoresCount: number;
  totalStoresCount: number;
  storeListings: Record<string, StoreProductListing>;
  popularity: number;
  nutritionHighlights?: string[];
}

export interface BasketItem {
  productId: string;
  quantity: number;
  addedAt: number;
}

export interface UserLocation {
  zoneId: string;
  zoneName: string;
  label: string;
}

export interface OptimizationResult {
  strategy: 'single_store' | 'split_stores' | 'closest_store';
  stores: {
    store: Store;
    items: {
      product: Product;
      quantity: number;
      listing: StoreProductListing;
      itemTotal: number;
    }[];
    subtotal: number;
    missingItems: Product[];
  }[];
  totalCost: number;
  averageCityCost: number;
  savingsDollars: number;
  savingsPercentage: number;
  allFulfilled: boolean;
  totalItemsCount: number;
}

export interface CommunityReport {
  id: string;
  productId: string;
  productName: string;
  storeId: string;
  storeName: string;
  reportedPrice: number;
  stockStatus: StockStatus;
  timestamp: string;
  reporterName: string;
  verified: boolean;
}
