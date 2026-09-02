import React, { useState } from 'react';
import {
  Terminal,
  Code2,
  Play,
  Copy,
  Check,
  Server,
  Layers,
  Database,
  ExternalLink,
  Search,
  FileText,
} from 'lucide-react';
import { Product, Store, StoreProductListing } from '../types/grocery';

interface ApiExplorerViewProps {
  products: Product[];
  stores: Store[];
}

export const ApiExplorerView: React.FC<ApiExplorerViewProps> = ({ products, stores }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/compare/1');
  const [searchParam, setSearchParam] = useState<string>('rice');
  const [productIdParam, setProductIdParam] = useState<number>(1);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusInfo, setStatusInfo] = useState<string>('Ready to query');
  const [copied, setCopied] = useState<boolean>(false);

  const endpoints = [
    {
      path: '/api/stores',
      method: 'GET',
      description: 'List all stores with location, category, rating, and opening hours',
      sampleParams: '',
    },
    {
      path: '/api/products',
      method: 'GET',
      description: 'List all products with optional ?search= parameter (e.g. ?search=rice)',
      sampleParams: `?search=${encodeURIComponent(searchParam)}`,
    },
    {
      path: `/api/compare/${productIdParam}`,
      method: 'GET',
      description: 'Compare item prices across all stores, ordered cheapest first',
      sampleParams: '',
    },
    {
      path: `/api/cheapest/${productIdParam}`,
      method: 'GET',
      description: 'Return just the single cheapest store and price for a product',
      sampleParams: '',
    },
  ];

  const handleExecute = async () => {
    setLoading(true);
    setStatusInfo('Executing request...');

    let targetUrl = '';
    if (selectedEndpoint === '/api/stores') {
      targetUrl = '/api/stores';
    } else if (selectedEndpoint.startsWith('/api/products')) {
      targetUrl = searchParam ? `/api/products?search=${encodeURIComponent(searchParam)}` : '/api/products';
    } else if (selectedEndpoint.startsWith('/api/compare')) {
      targetUrl = `/api/compare/${productIdParam}`;
    } else if (selectedEndpoint.startsWith('/api/cheapest')) {
      targetUrl = `/api/cheapest/${productIdParam}`;
    }

    try {
      const res = await fetch(targetUrl);
      const data = await res.json();
      setApiResponse(data);
      setStatusInfo(`HTTP ${res.status} OK — ${Array.isArray(data) ? data.length + ' records' : '1 object'} returned`);
    } catch (err: any) {
      // Fallback in-browser emulation if preview iframe cannot reach same-origin API directly
      setStatusInfo('Mock fallback query executed (client-side DB view)');
      if (selectedEndpoint === '/api/stores') {
        setApiResponse(stores.map((s) => ({ store_id: s.store_id || 1, name: s.name, location: s.location || s.address })));
      } else if (selectedEndpoint.startsWith('/api/products')) {
        const q = searchParam.toLowerCase();
        const filtered = products
          .filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
          .map((p) => ({ product_id: p.product_id || 1, name: p.name, category: p.category, brand: p.brand }));
        setApiResponse(filtered);
      } else if (selectedEndpoint.startsWith('/api/compare')) {
        const prod = products.find((p) => p.product_id === productIdParam) || products[0];
        const rows = (Object.values(prod.storeListings) as StoreProductListing[])
          .filter((l) => l.stockStatus !== 'not_carried')
          .map((l) => ({ store_name: l.store_name, location: l.location, price: l.price, last_updated: l.lastVerified }))
          .sort((a, b) => a.price - b.price);
        setApiResponse({
          product: { product_id: prod.product_id, name: prod.name, category: prod.category, brand: prod.brand },
          available_at: rows.length,
          cheapest: rows[0],
          comparison: rows,
        });
      } else if (selectedEndpoint.startsWith('/api/cheapest')) {
        const prod = products.find((p) => p.product_id === productIdParam) || products[0];
        const rows = (Object.values(prod.storeListings) as StoreProductListing[])
          .filter((l) => l.stockStatus === 'in_stock')
          .map((l) => ({ store_name: l.store_name, location: l.location, price: l.price }))
          .sort((a, b) => a.price - b.price);
        setApiResponse(rows[0] || { error: 'no price data' });
      }
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (!apiResponse) return;
    navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCurlCommand = () => {
    let path = selectedEndpoint;
    if (selectedEndpoint.startsWith('/api/products') && searchParam) {
      path = `/api/products?search=${encodeURIComponent(searchParam)}`;
    } else if (selectedEndpoint.startsWith('/api/compare')) {
      path = `/api/compare/${productIdParam}`;
    } else if (selectedEndpoint.startsWith('/api/cheapest')) {
      path = `/api/cheapest/${productIdParam}`;
    }
    return `curl -X GET "http://127.0.0.1:5000${path}"`;
  };

  return (
    <div id="api-explorer-view" className="space-y-6 max-w-7xl mx-auto">
      
      {/* Overview Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Database className="w-3.5 h-3.5" />
              <span>Flask SQLite REST API Documentation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
              Grocery Comparison Backend API
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Interact directly with the project&apos;s 4 core endpoints. Query stores, search products by keyword, compare live prices sorted cheapest first, and retrieve instant price metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/90 rounded-xl px-4 py-2.5 border border-slate-700">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Database Schema</div>
              <div className="text-xs font-mono text-emerald-400 mt-0.5">Stores • Products • Prices</div>
            </div>
            <div className="bg-slate-800/90 rounded-xl px-4 py-2.5 border border-slate-700">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Dataset Scope</div>
              <div className="text-xs font-mono text-cyan-400 mt-0.5">6 Stores • 40 Products • 223 Records</div>
            </div>
            <a
              id="api-download-full-project-zip"
              href="/citygrocer-complete-project.zip"
              download="citygrocer-complete-project.zip"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-emerald-500 shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Full Project .ZIP</span>
            </a>
            <a
              id="api-download-roadmap-pdf"
              href="/citygrocer-roadmap.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-indigo-500 shadow-md shadow-indigo-950/40 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Roadmap .PDF</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Two-Column Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Endpoints & Parameter Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-600" />
                Select Endpoint
              </h3>
              <span className="text-xs text-slate-500 font-mono">Flask 3.0.3</span>
            </div>

            {/* Endpoints List */}
            <div className="space-y-2">
              {endpoints.map((ep) => {
                const isSelected =
                  (ep.path === '/api/stores' && selectedEndpoint === '/api/stores') ||
                  (ep.path.startsWith('/api/products') && selectedEndpoint.startsWith('/api/products')) ||
                  (ep.path.startsWith('/api/compare') && selectedEndpoint.startsWith('/api/compare')) ||
                  (ep.path.startsWith('/api/cheapest') && selectedEndpoint.startsWith('/api/cheapest'));

                return (
                  <button
                    key={ep.path}
                    onClick={() => {
                      setSelectedEndpoint(ep.path);
                      setApiResponse(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white">
                          {ep.method}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {ep.path}
                        </span>
                      </div>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-snug">
                      {ep.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Interactive Parameters Input */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Request Parameters
              </h4>

              {selectedEndpoint.startsWith('/api/products') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Search Query (?search=)
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchParam}
                      onChange={(e) => setSearchParam(e.target.value)}
                      placeholder="e.g. rice, milk, oil, atta, tea..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {(selectedEndpoint.startsWith('/api/compare') || selectedEndpoint.startsWith('/api/cheapest')) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Product Selector (&lt;product_id&gt;)
                  </label>
                  <select
                    value={productIdParam}
                    onChange={(e) => setProductIdParam(parseInt(e.target.value, 10))}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-medium text-slate-800"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.product_id || 1}>
                        ID {p.product_id || 1}: {p.name} ({p.brand})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* cURL Display */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  cURL Command
                </label>
                <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg text-xs font-mono break-all select-all border border-slate-800">
                  {getCurlCommand()}
                </div>
              </div>

              {/* Send Button */}
              <button
                id="execute-api-btn"
                onClick={handleExecute}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? 'Executing...' : 'Send API Request'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Response & JSON Viewer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[560px]">
            
            {/* Window Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">Response Output</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                  {statusInfo}
                </span>

                {apiResponse && (
                  <button
                    onClick={copyResponse}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* JSON Code Viewer */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs text-emerald-300 leading-relaxed bg-slate-900 selection:bg-emerald-500 selection:text-black">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <span>Executing HTTP GET request...</span>
                </div>
              ) : apiResponse ? (
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 text-center p-6">
                  <Code2 className="w-8 h-8 text-slate-600" />
                  <p className="text-slate-400">Click &ldquo;Send API Request&rdquo; to test endpoint output.</p>
                  <p className="text-[11px] text-slate-600">
                    Returns live JSON according to the Flask Python API schema.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Status Footer */}
            <div className="px-4 py-2 bg-slate-950 text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-800">
              <span>Content-Type: application/json; charset=utf-8</span>
              <span>Encoding: UTF-8</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
