import { BasketItem, Product, Store, OptimizationResult, CurrencySymbol } from '../types/grocery';

export function formatPrice(num: number, currency: CurrencySymbol | string = '₹'): string {
  if (isNaN(num)) return `${currency}0.00`;
  return `${currency}${num.toFixed(2)}`;
}

export function calculateSavings(regular: number, lowest: number): { dollars: number; percent: number } {
  if (regular <= 0 || lowest <= 0 || regular <= lowest) {
    return { dollars: 0, percent: 0 };
  }
  const dollars = regular - lowest;
  const percent = Math.round((dollars / regular) * 100);
  return { dollars, percent };
}

export function getProductStoreListingsSorted(product: Product, stores: Store[]) {
  const storeMap = new Map(stores.map((s) => [s.id, s]));

  return Object.values(product.storeListings)
    .filter((l) => l.stockStatus !== 'not_carried')
    .map((listing) => {
      const store = storeMap.get(listing.storeId);
      return {
        listing,
        store: store!,
      };
    })
    .filter((item) => !!item.store)
    .sort((a, b) => {
      // In stock first, then out of stock
      const stockPriority = { in_stock: 1, low_stock: 2, out_of_stock: 3, not_carried: 4 };
      if (stockPriority[a.listing.stockStatus] !== stockPriority[b.listing.stockStatus]) {
        return stockPriority[a.listing.stockStatus] - stockPriority[b.listing.stockStatus];
      }
      return a.listing.price - b.listing.price;
    });
}

export function optimizeBasket(
  basket: BasketItem[],
  products: Product[],
  stores: Store[],
  strategy: 'single_store' | 'split_stores' | 'closest_store'
): OptimizationResult {
  const productMap = new Map(products.map((p) => [p.id, p]));
  const storeMap = new Map(stores.map((s) => [s.id, s]));

  const validBasketItems = basket
    .map((b) => ({
      product: productMap.get(b.productId),
      quantity: b.quantity,
    }))
    .filter((item): item is { product: Product; quantity: number } => !!item.product && item.quantity > 0);

  const totalItemsCount = validBasketItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // Compute average city cost for this basket
  const averageCityCost = validBasketItems.reduce((sum, item) => {
    return sum + item.product.averageCityPrice * item.quantity;
  }, 0);

  if (validBasketItems.length === 0) {
    return {
      strategy,
      stores: [],
      totalCost: 0,
      averageCityCost: 0,
      savingsDollars: 0,
      savingsPercentage: 0,
      allFulfilled: true,
      totalItemsCount: 0,
    };
  }

  if (strategy === 'split_stores') {
    // Pick the cheapest in-stock store for every single item
    const storeGrouping: Record<
      string,
      {
        store: Store;
        items: {
          product: Product;
          quantity: number;
          listing: any;
          itemTotal: number;
        }[];
        subtotal: number;
        missingItems: Product[];
      }
    > = {};

    let totalCost = 0;
    let allFulfilled = true;

    validBasketItems.forEach(({ product, quantity }) => {
      // Find cheapest in_stock or low_stock listing
      const availableListings = Object.values(product.storeListings).filter(
        (l) => l.stockStatus === 'in_stock' || l.stockStatus === 'low_stock'
      );

      if (availableListings.length === 0) {
        allFulfilled = false;
        return;
      }

      availableListings.sort((a, b) => a.price - b.price);
      const bestListing = availableListings[0];
      const store = storeMap.get(bestListing.storeId);

      if (!store) return;

      if (!storeGrouping[store.id]) {
        storeGrouping[store.id] = {
          store,
          items: [],
          subtotal: 0,
          missingItems: [],
        };
      }

      const itemTotal = bestListing.price * quantity;
      storeGrouping[store.id].items.push({
        product,
        quantity,
        listing: bestListing,
        itemTotal,
      });
      storeGrouping[store.id].subtotal += itemTotal;
      totalCost += itemTotal;
    });

    const storeResults = Object.values(storeGrouping);
    const savingsDollars = Math.max(0, averageCityCost - totalCost);
    const savingsPercentage = averageCityCost > 0 ? Math.round((savingsDollars / averageCityCost) * 100) : 0;

    return {
      strategy: 'split_stores',
      stores: storeResults,
      totalCost,
      averageCityCost,
      savingsDollars,
      savingsPercentage,
      allFulfilled,
      totalItemsCount,
    };
  }

  if (strategy === 'closest_store') {
    // Sort stores by distance
    const sortedStores = [...stores].sort((a, b) => a.distanceMiles - b.distanceMiles);

    for (const store of sortedStores) {
      const items: any[] = [];
      const missingItems: Product[] = [];
      let subtotal = 0;

      validBasketItems.forEach(({ product, quantity }) => {
        const listing = product.storeListings[store.id];
        if (listing && (listing.stockStatus === 'in_stock' || listing.stockStatus === 'low_stock')) {
          const itemTotal = listing.price * quantity;
          items.push({
            product,
            quantity,
            listing,
            itemTotal,
          });
          subtotal += itemTotal;
        } else {
          missingItems.push(product);
        }
      });

      // Prefer a store that has at least 50% fulfillment
      if (items.length > 0) {
        const savingsDollars = Math.max(0, averageCityCost - subtotal);
        const savingsPercentage = averageCityCost > 0 ? Math.round((savingsDollars / averageCityCost) * 100) : 0;

        return {
          strategy: 'closest_store',
          stores: [
            {
              store,
              items,
              subtotal,
              missingItems,
            },
          ],
          totalCost: subtotal,
          averageCityCost,
          savingsDollars,
          savingsPercentage,
          allFulfilled: missingItems.length === 0,
          totalItemsCount,
        };
      }
    }
  }

  // Strategy: 'single_store' - Find the single store with lowest cart total and highest fulfillment
  let bestStorePlan: {
    store: Store;
    items: any[];
    subtotal: number;
    missingItems: Product[];
  } | null = null;

  let bestStoreCost = Infinity;
  let leastMissingCount = Infinity;

  stores.forEach((store) => {
    const items: any[] = [];
    const missingItems: Product[] = [];
    let subtotal = 0;

    validBasketItems.forEach(({ product, quantity }) => {
      const listing = product.storeListings[store.id];
      if (listing && (listing.stockStatus === 'in_stock' || listing.stockStatus === 'low_stock')) {
        const itemTotal = listing.price * quantity;
        items.push({
          product,
          quantity,
          listing,
          itemTotal,
        });
        subtotal += itemTotal;
      } else {
        missingItems.push(product);
      }
    });

    if (items.length === 0) return;

    // We rank by: fewest missing items first, then lowest subtotal
    if (
      missingItems.length < leastMissingCount ||
      (missingItems.length === leastMissingCount && subtotal < bestStoreCost)
    ) {
      leastMissingCount = missingItems.length;
      bestStoreCost = subtotal;
      bestStorePlan = {
        store,
        items,
        subtotal,
        missingItems,
      };
    }
  });

  if (!bestStorePlan) {
    return {
      strategy: 'single_store',
      stores: [],
      totalCost: 0,
      averageCityCost,
      savingsDollars: 0,
      savingsPercentage: 0,
      allFulfilled: false,
      totalItemsCount,
    };
  }

  const finalPlan = bestStorePlan as {
    store: Store;
    items: any[];
    subtotal: number;
    missingItems: Product[];
  };

  const savingsDollars = Math.max(0, averageCityCost - finalPlan.subtotal);
  const savingsPercentage = averageCityCost > 0 ? Math.round((savingsDollars / averageCityCost) * 100) : 0;

  return {
    strategy: 'single_store',
    stores: [finalPlan],
    totalCost: finalPlan.subtotal,
    averageCityCost,
    savingsDollars,
    savingsPercentage,
    allFulfilled: finalPlan.missingItems.length === 0,
    totalItemsCount,
  };
}
