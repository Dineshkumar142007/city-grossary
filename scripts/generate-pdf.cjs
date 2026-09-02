const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

function generateRoadmapPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function checkPageBreak(spaceNeeded = 20) {
    if (y + spaceNeeded > pageHeight - 15) {
      doc.addPage();
      y = margin + 5;
    }
  }

  function addHeaderBanner() {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('CityGrocer - Project Roadmap & Architecture Workflow', margin, 5.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Confidential & Complete Specification', pageWidth - margin - 55, 5.5);
  }

  function drawSectionTitle(title, subtitle = '') {
    checkPageBreak(18);
    y += 4;
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.roundedRect(margin, y, 3.5, 9, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin + 6, y + 6.5);

    y += 11;
    if (subtitle) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(subtitle, margin + 6, y);
      y += 5;
    }
  }

  function drawParagraph(text, color = [51, 65, 85], fontSize = 8.5) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      checkPageBreak(6);
      doc.text(line, margin, y);
      y += 4.2;
    }
    y += 1.5;
  }

  function drawBullet(label, desc, bulletColor = [16, 185, 129]) {
    checkPageBreak(9);
    doc.setFillColor(bulletColor[0], bulletColor[1], bulletColor[2]);
    doc.circle(margin + 2, y - 1, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(label + ': ', margin + 6, y);

    const labelWidth = doc.getTextWidth(label + ': ');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);

    const descLines = doc.splitTextToSize(desc, contentWidth - 6);
    if (descLines.length === 1) {
      doc.text(desc, margin + 6 + labelWidth, y);
      y += 4.5;
    } else {
      doc.text(descLines[0], margin + 6 + labelWidth, y);
      y += 4.2;
      for (let i = 1; i < descLines.length; i++) {
        checkPageBreak(5);
        doc.text(descLines[i], margin + 6, y);
        y += 4.2;
      }
      y += 1;
    }
  }

  function drawCard(title, items, bgColor = [248, 250, 252], borderColor = [226, 232, 240]) {
    const startY = y;
    let tempY = y + 7;
    for (const it of items) {
      const textLines = doc.splitTextToSize(`• ${it}`, contentWidth - 8);
      tempY += textLines.length * 4.2;
    }
    const cardHeight = tempY - startY + 3;
    checkPageBreak(cardHeight + 4);

    const actualStartY = y;
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, actualStartY, contentWidth, cardHeight, 2, 2, 'FD');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin + 4, actualStartY + 5.5);

    y = actualStartY + 10;
    for (const it of items) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const textLines = doc.splitTextToSize(`• ${it}`, contentWidth - 8);
      for (const line of textLines) {
        doc.text(line, margin + 4, y);
        y += 4.2;
      }
    }
    y += 3.5;
  }

  // ==================== COVER / HEADER ====================
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text('CityGrocer Web Application', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(209, 250, 229);
  doc.text('Complete End-to-End Architectural Blueprint, Component Workflow & Development Roadmap', margin, 19);

  y = 34;

  // Metadata Card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PROJECT METADATA & COMPONENT SPECIFICATION', margin + 4, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('• Target Platforms: Mobile Phone (iOS/Android), Tablet & Laptop', margin + 4, y + 9);
  doc.text('• Tech Stack: React 18, TypeScript, Tailwind CSS, Express / Flask REST API', margin + 4, y + 13);
  doc.text('• Currency: Indian Rupee (₹ INR)', margin + 110, y + 9);
  doc.text('• Architecture: In-Memory Multi-Store Matrix & Heuristic Optimizer', margin + 110, y + 13);

  y += 21;

  // ==================== SECTION 1: EXECUTIVE SUMMARY ====================
  drawSectionTitle('1. Project Vision & Core Objectives', 'High-level goals and problem statement addressed');
  drawParagraph(
    'CityGrocer is a responsive hyper-local grocery intelligence platform designed to eliminate overpaying for household necessities. It tracks and indexes daily prices across 6 major competing grocery supermarket chains in real time, empowering consumers and small businesses to compare unit prices, find exact store aisles, and optimize multi-stop shopping carts for maximum savings.'
  );

  drawCard('Core Value Propositions & Differentiators', [
    'Cross-Store Price Transparency: Real-time price disparity tracking across 40 staple commodities and 223+ verified in-store price points.',
    'Multi-Store Trip Optimizer: Combinatorial cart splitter computing maximum cash savings against travel effort for single vs multi-store trips.',
    'Hyper-Local Zone Filter: City neighborhood targeting across Central, T. Nagar, Anna Nagar, Adyar, Velachery & Porur.',
    'Direct Item Hunting & Aisle Locator: Pinpoints exact physical aisle numbers (e.g. Aisle 3 - Dairy, Aisle 2 - Grains).',
    'Crowdsourced Verification: User price submission pipeline with confidence scoring and timestamp badges.'
  ]);

  // ==================== SECTION 2: SYSTEM ARCHITECTURE ====================
  drawSectionTitle('2. System Architecture & Tech Stack Checklist', 'Layered component structure and dependencies');

  drawCard('Frontend Client Tier (Single Page Application & Mobile Viewport)', [
    'Framework & Language: React 18 with strict TypeScript type models.',
    'Build Tool: Vite with tree-shaking and production bundling.',
    'Design System: Tailwind CSS with responsive mobile-first grid and custom color palettes.',
    'Iconography: Lucide-React vector icons for all actions and badges.',
    'Interactive Visuals: Custom SVG Cartographer map with pinpoint store radar & coordinate projection.'
  ]);

  drawCard('Backend API & Serving Tier (Express / Flask REST API)', [
    'Runtime: Node.js 22 LTS with Express.js REST API middleware & CORS support.',
    'Core Endpoints: /api/stores, /api/products, /api/compare/:id, /api/cheapest/:id, /api/report-price.',
    'File Distribution: Direct static bundle download (/citygrocer-complete-project.zip) and PDF download (/citygrocer-roadmap.pdf).'
  ]);

  // ==================== SECTION 3: COMPONENT HIERARCHY ====================
  drawSectionTitle('3. Required Frontend Components & Roles', 'Full breakdown of all 11 core UI components');

  drawBullet('Header (Header.tsx)', 'Top branding, zone selector dropdown, live currency badge (₹ INR), global search input, quick price update trigger, share modal button, and desktop cart counter badge.');
  drawBullet('PriceComparisonView (PriceComparisonView.tsx)', 'Primary dashboard featuring category filters (Produce, Dairy, Grains, Oils, Spices), search query parsing, store selector tags, sorting matrix (Price Low->High, Highest Savings, Most Verified), and floating quick-trip action bar.');
  drawBullet('ProductCard (ProductCard.tsx)', 'Compact item cards rendering store badges, lowest vs highest price delta, aisle location tag, stock availability pill, unit price calculations, and 1-click cart addition.');
  drawBullet('ProductDetailModal (ProductDetailModal.tsx)', 'Deep-dive drawer displaying store-by-store comparison tables, price history trends, aisle navigation guides, and crowdsourced audit timestamps.');
  drawBullet('BasketOptimizerModal (BasketOptimizerModal.tsx)', 'Combinatorial trip calculation engine. Compares: Option A (Single Cheapest Store) vs Option B (Multi-Store Split). Outputs item-by-item shopping checklists and net ₹ savings.');
  drawBullet('CityMapView (CityMapView.tsx)', 'Interactive SVG vector map plotting all 6 retail locations with live distance rings, store details, inventory preview, and driving distance approximations.');
  drawBullet('DealsRadarView (DealsRadarView.tsx)', 'Analytics engine highlighting items with extreme price variances (e.g. >₹30 price gaps) and flash discounts.');
  drawBullet('ItemHunterView (ItemHunterView.tsx)', 'Direct buyer catalog enabling filtering by store chain, item classification, and instant buy routing.');
  drawBullet('PriceReportModal (PriceReportModal.tsx)', 'Community submission form for updating in-store shelf prices, attaching store tags, and submitting aisle corrections.');
  drawBullet('ShareAppModal (ShareAppModal.tsx)', '1-click link copying, WhatsApp/Telegram/Email sharing, instant QR code generator for phone cameras, and complete source ZIP/PDF downloads.');
  drawBullet('ApiExplorerView (ApiExplorerView.tsx)', 'Developer documentation workbench with live cURL examples, schema tables, and interactive endpoint test runners.');

  // ==================== SECTION 4: DATA MODEL & SCHEMAS ====================
  drawSectionTitle('4. Data Schemas & Dataset Engineering', 'Structured TypeScript models and relationships');

  drawCard('Product & StorePrice Schema (/src/types/grocery.ts)', [
    'Product { id, name, tamilName, category, unit, marketAvgPrice, prices: Record<StoreId, StorePrice> }',
    'StorePrice { currentPrice: number, stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK", aisleLocation: string, verifiedDate: string, discountPercent?: number }',
    'Store { id: string, name: string, type: "Supermarket" | "Hypermarket" | "Wholesale", address: string, zoneId: string, coordinates: { lat, lng }, rating: number, priceTier: "Budget" | "Moderate" | "Premium" }',
    'CityZone { id: string, name: string, pincode: string, coordinates: { lat, lng } }'
  ]);

  // ==================== SECTION 5: 7-PHASE ROADMAP ====================
  drawSectionTitle('5. Chronological 7-Phase Development Roadmap', 'Step-by-step roadmap from inception to deployment');

  drawCard('Phase 1: Requirements Gathering & UX Wireframing', [
    'Step 1.1: Define target user personas (Budget shoppers, meal planners, small business owners).',
    'Step 1.2: Map out user flow: Search Item -> Compare Stores -> Inspect Aisle -> Optimize Basket -> Share/Print.',
    'Step 1.3: Build wireframes for smartphone (375px), tablet (768px), and desktop (1280px+).'
  ]);

  drawCard('Phase 2: Data Schema Design & Mock Catalog Seeding', [
    'Step 2.1: Establish TypeScript models for products, stores, city zones, and price reports.',
    'Step 2.2: Seed 40 essential commodities with realistic Indian supermarket prices across 6 chains.',
    'Step 2.3: Define spatial coordinates and neighborhood zones for hyper-local filtering.'
  ]);

  drawCard('Phase 3: Core Algorithmic Engines Development', [
    'Step 3.1: Build Multi-Store Greedy Optimizer: Calculate total trip cost across N stores vs single-store baseline.',
    'Step 3.2: Implement Deals Radar Analyzer: Compute price spread variance and markdowns.',
    'Step 3.3: Build Search & Sorting Index: Tokenize keywords, filter by price/category/zone.'
  ]);

  drawCard('Phase 4: Responsive UI Component Assembly', [
    'Step 4.1: Assemble Header, PriceComparisonView, ProductCard, and ProductDetailModal.',
    'Step 4.2: Implement touch-optimized mobile navigation dock with bottom safe-area padding.',
    'Step 4.3: Build the SVG City Cartographer map with interactive store pin overlays.'
  ]);

  drawCard('Phase 5: Backend REST API & Express Server Integration', [
    'Step 5.1: Implement Express / Flask endpoints (/api/stores, /api/products, /api/compare/:id).',
    'Step 5.2: Connect Price Update submission pipeline with server-side validation.',
    'Step 5.3: Mount Vite development middleware and production static fallback routes.'
  ]);

  drawCard('Phase 6: Multi-Device Optimization & Accessibility Audit', [
    'Step 6.1: Validate touch targets (min 44px) on mobile iOS and Android browsers.',
    'Step 6.2: Check color contrast ratios (WCAG AA standard) for emerald, slate, and amber elements.',
    'Step 6.3: Ensure modals handle background scroll locking and escape-key dismissal smoothly.'
  ]);

  drawCard('Phase 7: Packaging, Public Sharing & Cloud Deployment', [
    'Step 7.1: Generate public sharable URLs with dynamic origin resolution.',
    'Step 7.2: Build automated ZIP archiver bundling all source code, datasets, and server assets.',
    'Step 7.3: Generate official PDF Architecture & Workflow roadmap for stakeholders and developer teams.'
  ]);

  // ==================== SECTION 6: API REFERENCE ====================
  drawSectionTitle('6. REST API Endpoint Reference', 'Standard HTTP REST endpoints for client integrations');

  drawBullet('GET /api/stores', 'Returns complete list of 6 supermarket chains with ratings, price tiers, and coordinates.');
  drawBullet('GET /api/products', 'Accepts ?category=X&zone=Y&search=Z queries. Returns filtered and ranked grocery catalogue.');
  drawBullet('GET /api/compare/:id', 'Returns detailed store-by-store price breakdown, savings delta, and aisle information for a given item.');
  drawBullet('GET /api/cheapest/:id', 'Returns the single lowest price store and unit rate for rapid 1-click buy lookups.');
  drawBullet('POST /api/report-price', 'Payload { productId, storeId, reportedPrice, aisleLocation }. Updates database with new crowd price report.');
  drawBullet('GET /citygrocer-complete-project.zip', 'Streams and downloads the full project ZIP bundle containing all files and datasets.');
  drawBullet('GET /citygrocer-roadmap.pdf', 'Streams and downloads this formal Architecture & Roadmap PDF document.');

  // ==================== FINAL PAGE FOOTER & SIGN-OFF ====================
  checkPageBreak(25);
  y += 4;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(52, 211, 153);
  doc.text('CityGrocer Technical Roadmap - Verified Architecture Specification', margin + 6, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text('This PDF contains the full workflow, technical architecture, and component checklist for the', margin + 6, y + 12);
  doc.text('CityGrocer cross-device responsive grocery comparison and basket optimization application.', margin + 6, y + 16);

  // Add footers to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) {
      addHeaderBanner();
    }
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('CityGrocer Web App Architecture & Development Roadmap', margin, pageHeight - 6);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 6);
  }

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  fs.mkdirSync('public', { recursive: true });
  fs.writeFileSync('public/citygrocer-roadmap.pdf', pdfBuffer);
  console.log('Roadmap PDF generated successfully! Size:', pdfBuffer.length, 'bytes');
}

generateRoadmapPDF();
