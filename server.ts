import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS } from './src/data/products';
import { STORES_DATA } from './src/data/stores';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data store with loaded dataset
  let products = [...INITIAL_PRODUCTS];
  let stores = [...STORES_DATA];

  // API Route: GET /api/stores -> list all stores (matching Flask backend)
  app.get('/api/stores', (req: Request, res: Response) => {
    const storeList = stores.map((s) => ({
      store_id: s.store_id || 1,
      id: s.id,
      name: s.name,
      location: s.location || s.address,
      rating: s.rating,
      price_level: s.priceLevel,
      opening_hours: s.openingHours,
    }));
    res.json(storeList);
  });

  // API Route: GET /api/products -> list all products (optional ?search=) (matching Flask backend)
  app.get('/api/products', (req: Request, res: Response) => {
    const search = ((req.query.search as string) || '').trim().toLowerCase();
    const category = ((req.query.category as string) || '').trim().toLowerCase();

    let filtered = products;

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.brand.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search)
      );
    }

    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category);
    }

    const results = filtered.map((p) => ({
      product_id: p.product_id || parseInt(p.id.replace('prod-', ''), 10) || 1,
      id: p.id,
      name: p.name,
      category: p.category,
      brand: p.brand,
      lowest_price: p.lowestPrice,
      highest_price: p.highestPrice,
      average_price: p.averageCityPrice,
      available_at: Object.values(p.storeListings).filter(
        (l) => l.stockStatus === 'in_stock' || l.stockStatus === 'low_stock'
      ).length,
    }));

    res.json(results);
  });

  // API Route: GET /api/compare/:productId -> price comparison across stores, cheapest first
  app.get('/api/compare/:productId', (req: Request, res: Response) => {
    const rawId = req.params.productId;
    const numId = parseInt(rawId, 10);

    const product = products.find(
      (p) => p.product_id === numId || p.id === rawId || p.id === `prod-${rawId}`
    );

    if (!product) {
      return res.status(404).json({ error: 'product not found' });
    }

    const storeMap = new Map(stores.map((s) => [s.id, s]));

    const comparison = Object.values(product.storeListings)
      .filter((listing) => listing.stockStatus !== 'not_carried')
      .map((listing) => {
        const store = storeMap.get(listing.storeId);
        return {
          store_id: store?.store_id || 1,
          store_key: listing.storeId,
          store_name: store?.name || listing.store_name || 'Store',
          location: store?.location || store?.address || listing.location || 'City Center',
          price: listing.price,
          original_price: listing.originalPrice,
          stock_status: listing.stockStatus,
          stock_count: listing.stockCount,
          aisle: listing.aisle,
          unit: listing.unit,
          last_updated: listing.lastVerified,
          deal_tag: listing.dealTag,
        };
      })
      .sort((a, b) => a.price - b.price);

    const cheapest = comparison.length > 0 ? comparison[0] : null;

    res.json({
      product: {
        product_id: product.product_id || numId || 1,
        id: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        package_size: product.packageSize,
        image: product.image,
      },
      available_at: comparison.length,
      cheapest,
      comparison,
    });
  });

  // API Route: GET /api/cheapest/:productId -> single cheapest store for product
  app.get('/api/cheapest/:productId', (req: Request, res: Response) => {
    const rawId = req.params.productId;
    const numId = parseInt(rawId, 10);

    const product = products.find(
      (p) => p.product_id === numId || p.id === rawId || p.id === `prod-${rawId}`
    );

    if (!product) {
      return res.status(404).json({ error: 'no price data for this product' });
    }

    const storeMap = new Map(stores.map((s) => [s.id, s]));
    const available = Object.values(product.storeListings)
      .filter((l) => l.stockStatus === 'in_stock' || l.stockStatus === 'low_stock')
      .sort((a, b) => a.price - b.price);

    if (available.length === 0) {
      return res.status(404).json({ error: 'product currently out of stock everywhere' });
    }

    const best = available[0];
    const store = storeMap.get(best.storeId);

    res.json({
      product_name: product.name,
      brand: product.brand,
      store_name: store?.name || 'Cheapest Store',
      location: store?.location || store?.address || 'City Store',
      price: best.price,
      last_updated: best.lastVerified,
      aisle: best.aisle,
    });
  });

  // API Route: POST /api/report-price -> community price update
  app.post('/api/report-price', (req: Request, res: Response) => {
    const { productId, storeId, price, stockStatus } = req.body;
    if (!productId || !storeId || price === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const productIndex = products.findIndex((p) => p.id === productId || p.product_id === productId);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const prod = products[productIndex];
    if (prod.storeListings[storeId]) {
      prod.storeListings[storeId].price = parseFloat(price);
      if (stockStatus) prod.storeListings[storeId].stockStatus = stockStatus;
      prod.storeListings[storeId].lastVerified = 'Just now';
    }

    // Re-evaluate lowest price
    const validPrices = Object.values(prod.storeListings)
      .filter((l) => l.stockStatus === 'in_stock' || l.stockStatus === 'low_stock')
      .map((l) => l.price);

    if (validPrices.length > 0) {
      prod.lowestPrice = Math.min(...validPrices);
      prod.highestPrice = Math.max(...validPrices);
    }

    res.json({ success: true, message: 'Price updated successfully', product: prod });
  });

  // Direct route to download the full project zip bundle with all datasets
  app.get('/citygrocer-complete-project.zip', (req: Request, res: Response) => {
    const zipPath = path.join(process.cwd(), 'public', 'citygrocer-complete-project.zip');
    res.download(zipPath, 'citygrocer-complete-project.zip');
  });

  // Direct route to download/view the project workflow & architecture roadmap PDF
  app.get('/citygrocer-roadmap.pdf', (req: Request, res: Response) => {
    const pdfPath = path.join(process.cwd(), 'public', 'citygrocer-roadmap.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="citygrocer-roadmap.pdf"');
    res.sendFile(pdfPath);
  });

  // Vite integration for dev and prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Grocery Price Comparison Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
