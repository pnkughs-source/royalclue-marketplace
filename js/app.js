const categories = ['All', 'AI', 'Coding', 'Automation', 'Design', 'Video', 'Voice', 'Productivity', 'Marketing', 'Research', 'Writing'];
const STORAGE_KEY = 'aurum_ai_paid_products_v1';
const ORDERS_KEY = 'aurum_ai_orders_v1';
const LOGS_KEY = 'aurum_ai_logs_v1';
const WALLETS_KEY = 'aurum_ai_wallets_v1';
const SIGNUPS_KEY = 'aurum_ai_signups_v1';
const VISITOR_KEY = 'aurum_ai_visitor_analytics_v2';
const ADMIN_SETTINGS_KEY = 'aurum_ai_admin_settings_v2';
const PRODUCT_ANALYTICS_KEY = 'aurum_ai_product_source_analytics_v1';
const SUPPORT_CHAT_KEY = 'aurum_ai_support_chat_v1';
const ADMIN_SESSION_KEY = 'royalclue_admin_session_v1';

const PRICE_RULES = { single: 0.50, reseller: 0.30 }; // only 2 sell rates
function roundPrice(n) { return Math.max(0, Math.round(Number(n || 0) * 100) / 100); }
function applyMarketDiscounts(product) {
  const market = roundPrice(product.marketPrice || product.realPrice || (Number(product.price || 0) * 2));
  product.marketPrice = market;
  product.realPrice = market;
  product.price = roundPrice(market * PRICE_RULES.single);
  product.reseller = roundPrice(market * PRICE_RULES.reseller);
  product.bulk = product.reseller; // alias for old data only
  product.priceMode = 'auto-discount';
  product.priceNote = 'Single = 50% of market. Bulk/Resell = 30% of market.';
  return product;
}

const DEFAULT_PRODUCTS = [
  { id: 1, brand: 'OpenAI', name: 'ChatGPT Pro', domain: 'chatgpt.com', cat: 'AI', price: 59, reseller: 47, bulk: 38, sold: 15420, stock: 42, badge: 'TOP', desc: 'High-demand paid AI plan for coding, writing, research and automation.' },
  { id: 2, brand: 'Anthropic', name: 'Claude Max', domain: 'anthropic.com', cat: 'AI', price: 69, reseller: 55, bulk: 44, sold: 11880, stock: 29, badge: 'MAX', desc: 'Premium Claude plan for long context, writing, reasoning and code review.' },
  { id: 3, brand: 'Google', name: 'Gemini Advanced', domain: 'gemini.google.com', cat: 'AI', price: 45, reseller: 35, bulk: 27, sold: 7920, stock: 36, badge: 'POPULAR', desc: 'Paid Google AI plan for research, docs, productivity and creative tasks.' },
  { id: 4, brand: 'Perplexity', name: 'Perplexity Pro', domain: 'perplexity.ai', cat: 'Research', price: 39, reseller: 30, bulk: 24, sold: 9140, stock: 31, badge: 'RESEARCH', desc: 'Premium AI search and research account for freelancers and agencies.' },
  { id: 5, brand: 'xAI', name: 'Grok Premium+', domain: 'x.ai', cat: 'AI', price: 55, reseller: 43, bulk: 34, sold: 4680, stock: 18, badge: 'NEW', desc: 'Paid Grok plan for X power users, AI research and fast content workflows.' },
  { id: 6, brand: 'Cursor', name: 'Cursor Pro', domain: 'cursor.com', cat: 'Coding', price: 49, reseller: 39, bulk: 31, sold: 12860, stock: 38, badge: 'CODER', desc: 'One of the most wanted AI coding IDE subscriptions for developers.' },
  { id: 7, brand: 'GitHub', name: 'GitHub Copilot Pro', domain: 'github.com', cat: 'Coding', price: 35, reseller: 27, bulk: 21, sold: 10350, stock: 44, badge: 'DEV', desc: 'Premium coding assistant for autocomplete, coding help and repo workflows.' },
  { id: 8, brand: 'Replit', name: 'Replit Core', domain: 'replit.com', cat: 'Coding', price: 32, reseller: 25, bulk: 19, sold: 5960, stock: 22, badge: 'CLOUD', desc: 'Paid cloud coding workspace for app building and deployment.' },
  { id: 9, brand: 'Bolt.new', name: 'Bolt.new Pro', domain: 'bolt.new', cat: 'Coding', price: 42, reseller: 33, bulk: 26, sold: 6420, stock: 20, badge: 'APP', desc: 'AI app builder subscription for quick full-stack prototype generation.' },
  { id: 10, brand: 'Lovable', name: 'Lovable Pro', domain: 'lovable.dev', cat: 'Coding', price: 44, reseller: 35, bulk: 28, sold: 5710, stock: 19, badge: 'WEB', desc: 'Paid AI web app builder for founders, devs and agencies.' },
  { id: 11, brand: 'Vercel', name: 'v0 Premium', domain: 'v0.dev', cat: 'Coding', price: 40, reseller: 31, bulk: 25, sold: 4880, stock: 21, badge: 'UI', desc: 'Premium UI generation plan for React and frontend builders.' },
  { id: 12, brand: 'Zapier', name: 'Zapier AI Pro', domain: 'zapier.com', cat: 'Automation', price: 49, reseller: 39, bulk: 30, sold: 7280, stock: 25, badge: 'AUTO', desc: 'Paid automation workflow plan for business and marketing operations.' },
  { id: 13, brand: 'Make', name: 'Make.com Pro', domain: 'make.com', cat: 'Automation', price: 39, reseller: 30, bulk: 23, sold: 6950, stock: 27, badge: 'FLOW', desc: 'Visual workflow automation account for AI agencies and freelancers.' },
  { id: 14, brand: 'n8n', name: 'n8n Cloud Pro', domain: 'n8n.io', cat: 'Automation', price: 45, reseller: 35, bulk: 27, sold: 6140, stock: 20, badge: 'AGENT', desc: 'Cloud automation workflow account for AI agents and integrations.' },
  { id: 15, brand: 'Clay', name: 'Clay Pro', domain: 'clay.com', cat: 'Marketing', price: 79, reseller: 63, bulk: 49, sold: 3840, stock: 12, badge: 'LEADS', desc: 'Premium lead generation and enrichment platform for agencies.' },
  { id: 16, brand: 'Lindy', name: 'Lindy AI Pro', domain: 'lindy.ai', cat: 'Automation', price: 69, reseller: 55, bulk: 43, sold: 2710, stock: 11, badge: 'ASSIST', desc: 'AI assistant automation plan for workflow and business tasks.' },
  { id: 17, brand: 'Canva', name: 'Canva Pro', domain: 'canva.com', cat: 'Design', price: 29, reseller: 22, bulk: 16, sold: 16200, stock: 58, badge: 'DESIGN', desc: 'Highly demanded design plan for marketers, freelancers and creators.' },
  { id: 18, brand: 'Figma', name: 'Figma Professional', domain: 'figma.com', cat: 'Design', price: 39, reseller: 30, bulk: 23, sold: 6840, stock: 26, badge: 'UIUX', desc: 'Paid UI/UX collaboration plan for designers and product teams.' },
  { id: 19, brand: 'Adobe', name: 'Adobe Creative Cloud', domain: 'adobe.com', cat: 'Design', price: 119, reseller: 96, bulk: 78, sold: 4210, stock: 14, badge: 'PREMIUM', desc: 'Premium creative plan for Photoshop, Premiere, Illustrator and more.' },
  { id: 20, brand: 'Freepik', name: 'Freepik Premium', domain: 'freepik.com', cat: 'Design', price: 35, reseller: 26, bulk: 19, sold: 7280, stock: 33, badge: 'ASSETS', desc: 'Premium vectors, PSD, icons and creative assets for designers.' },
  { id: 21, brand: 'Envato', name: 'Envato Elements', domain: 'elements.envato.com', cat: 'Design', price: 49, reseller: 38, bulk: 29, sold: 5960, stock: 28, badge: 'ASSETS', desc: 'Premium digital assets, templates, graphics and creative resources.' },
  { id: 22, brand: 'Runway', name: 'Runway Pro', domain: 'runwayml.com', cat: 'Video', price: 59, reseller: 46, bulk: 36, sold: 6890, stock: 19, badge: 'VIDEO', desc: 'Paid AI video generation plan for creators and agencies.' },
  { id: 23, brand: 'HeyGen', name: 'HeyGen Creator', domain: 'heygen.com', cat: 'Video', price: 65, reseller: 52, bulk: 41, sold: 4720, stock: 16, badge: 'AVATAR', desc: 'AI avatar video generation plan for marketers and content teams.' },
  { id: 24, brand: 'Synthesia', name: 'Synthesia Creator', domain: 'synthesia.io', cat: 'Video', price: 75, reseller: 59, bulk: 47, sold: 3180, stock: 12, badge: 'STUDIO', desc: 'Paid AI spokesperson and corporate video creation account.' },
  { id: 25, brand: 'Pika', name: 'Pika Pro', domain: 'pika.art', cat: 'Video', price: 42, reseller: 33, bulk: 26, sold: 4180, stock: 18, badge: 'GENAI', desc: 'AI video generation subscription for short creative videos.' },
  { id: 26, brand: 'Kling AI', name: 'Kling AI Pro', domain: 'klingai.com', cat: 'Video', price: 45, reseller: 35, bulk: 28, sold: 3920, stock: 15, badge: 'TREND', desc: 'Paid AI video generation plan for cinematic clips and content.' },
  { id: 27, brand: 'CapCut', name: 'CapCut Pro', domain: 'capcut.com', cat: 'Video', price: 32, reseller: 24, bulk: 18, sold: 12200, stock: 46, badge: 'EDIT', desc: 'Popular paid video editing plan for short-form creators and agencies.' },
  { id: 28, brand: 'ElevenLabs', name: 'ElevenLabs Pro', domain: 'elevenlabs.io', cat: 'Voice', price: 55, reseller: 43, bulk: 34, sold: 7840, stock: 24, badge: 'VOICE', desc: 'Premium AI voice generation and dubbing account for creators.' },
  { id: 29, brand: 'Murf AI', name: 'Murf AI Pro', domain: 'murf.ai', cat: 'Voice', price: 45, reseller: 35, bulk: 27, sold: 3120, stock: 17, badge: 'VOICE', desc: 'Paid AI voiceover generation account for video and marketing content.' },
  { id: 30, brand: 'Grammarly', name: 'Grammarly Premium', domain: 'grammarly.com', cat: 'Writing', price: 35, reseller: 26, bulk: 19, sold: 10400, stock: 41, badge: 'WRITE', desc: 'Premium writing assistant for students, marketers and professionals.' },
  { id: 31, brand: 'Jasper', name: 'Jasper Pro', domain: 'jasper.ai', cat: 'Writing', price: 59, reseller: 46, bulk: 36, sold: 3920, stock: 18, badge: 'COPY', desc: 'AI copywriting platform for marketers, agencies and content teams.' },
  { id: 32, brand: 'Copy.ai', name: 'Copy.ai Advanced', domain: 'copy.ai', cat: 'Writing', price: 49, reseller: 38, bulk: 30, sold: 3550, stock: 16, badge: 'SALES', desc: 'Paid AI writing and GTM content generation account.' },
  { id: 33, brand: 'QuillBot', name: 'QuillBot Premium', domain: 'quillbot.com', cat: 'Writing', price: 29, reseller: 21, bulk: 15, sold: 8180, stock: 33, badge: 'PARA', desc: 'Premium paraphrasing and writing account for writing workflows.' },
  { id: 34, brand: 'Writesonic', name: 'Writesonic Pro', domain: 'writesonic.com', cat: 'Writing', price: 42, reseller: 32, bulk: 25, sold: 3360, stock: 14, badge: 'SEO', desc: 'Paid AI writing tool for blogs, SEO and marketing content.' },
  { id: 35, brand: 'Notion', name: 'Notion AI Plus', domain: 'notion.so', cat: 'Productivity', price: 35, reseller: 27, bulk: 21, sold: 7560, stock: 34, badge: 'WORK', desc: 'Paid AI workspace plan for notes, docs and productivity systems.' },
  { id: 36, brand: 'Motion', name: 'Motion AI Pro', domain: 'usemotion.com', cat: 'Productivity', price: 49, reseller: 38, bulk: 30, sold: 2410, stock: 13, badge: 'TASKS', desc: 'AI calendar and task management plan for professionals.' },
  { id: 37, brand: 'Gamma', name: 'Gamma Pro', domain: 'gamma.app', cat: 'Productivity', price: 39, reseller: 30, bulk: 23, sold: 6420, stock: 29, badge: 'PITCH', desc: 'Premium AI presentation builder for students, agencies and teams.' },
  { id: 38, brand: 'DeepL', name: 'DeepL Pro', domain: 'deepl.com', cat: 'Writing', price: 35, reseller: 27, bulk: 20, sold: 2810, stock: 15, badge: 'TRANS', desc: 'Paid translation and writing plan for global business users.' },
  { id: 39, brand: 'Leonardo AI', name: 'Leonardo AI Pro', domain: 'leonardo.ai', cat: 'Design', price: 42, reseller: 33, bulk: 26, sold: 4640, stock: 18, badge: 'IMAGE', desc: 'Premium AI image generation tool for designers and creators.' },
  { id: 40, brand: 'Mistral', name: 'Mistral Le Chat Pro', domain: 'mistral.ai', cat: 'AI', price: 35, reseller: 27, bulk: 21, sold: 2350, stock: 12, badge: 'AI', desc: 'Paid AI assistant plan for research, writing and productivity.' },
  { id: 41, brand: 'DeepSeek', name: 'DeepSeek Pro Access', domain: 'deepseek.com', cat: 'AI', price: 35, reseller: 27, bulk: 21, sold: 5210, stock: 20, badge: 'LOGIC', desc: 'Paid AI access for coding, reasoning and research users.' },
  { id: 42, brand: 'Manus', name: 'Manus AI Pro', domain: 'manus.im', cat: 'Automation', price: 79, reseller: 63, bulk: 49, sold: 1850, stock: 8, badge: 'AGENT', desc: 'Premium AI agent access for task automation and workflows.' },
  { id: 43, brand: 'Devin', name: 'Devin AI Access', domain: 'cognition.ai', cat: 'Coding', price: 99, reseller: 79, bulk: 64, sold: 1680, stock: 7, badge: 'AGENT', desc: 'AI software engineering agent access for advanced coding workflows.' },
  { id: 44, brand: 'Phind', name: 'Phind Pro', domain: 'phind.com', cat: 'Coding', price: 35, reseller: 27, bulk: 21, sold: 3620, stock: 18, badge: 'DEV', desc: 'AI search and coding assistant plan for developers.' },
  { id: 45, brand: 'SEMrush', name: 'Semrush AI Toolkit', domain: 'semrush.com', cat: 'Marketing', price: 89, reseller: 71, bulk: 56, sold: 2310, stock: 10, badge: 'SEO', desc: 'Premium SEO and marketing toolkit used by agencies.' },
  { id: 46, brand: 'Surfer', name: 'Surfer SEO Pro', domain: 'surferseo.com', cat: 'Marketing', price: 69, reseller: 54, bulk: 42, sold: 2740, stock: 11, badge: 'SEO', desc: 'Paid SEO content optimization account for content agencies.' },
  { id: 47, brand: 'Framer', name: 'Framer Pro', domain: 'framer.com', cat: 'Design', price: 39, reseller: 30, bulk: 23, sold: 3240, stock: 17, badge: 'WEB', desc: 'Premium website builder plan for landing pages and portfolios.' },
  { id: 48, brand: 'Tome', name: 'Tome Pro', domain: 'tome.app', cat: 'Productivity', price: 32, reseller: 24, bulk: 18, sold: 2910, stock: 14, badge: 'DECK', desc: 'AI storytelling and presentation tool for pitch decks.' },
  { id: 49, brand: 'Fireflies', name: 'Fireflies Pro', domain: 'fireflies.ai', cat: 'Productivity', price: 35, reseller: 27, bulk: 20, sold: 3120, stock: 16, badge: 'MEET', desc: 'AI meeting notes and transcription plan for teams.' },
  { id: 50, brand: 'Descript', name: 'Descript Creator', domain: 'descript.com', cat: 'Video', price: 42, reseller: 32, bulk: 25, sold: 3840, stock: 18, badge: 'EDIT', desc: 'Paid video and podcast editing account for creators.' },
  { id: 51, brand: 'Otter', name: 'Otter AI Pro', domain: 'otter.ai', cat: 'Productivity', price: 29, reseller: 22, bulk: 16, sold: 4070, stock: 19, badge: 'NOTES', desc: 'Premium AI meeting transcription and summary account.' },
  { id: 52, brand: 'Hugging Face', name: 'Hugging Face Pro', domain: 'huggingface.co', cat: 'AI', price: 39, reseller: 30, bulk: 23, sold: 2660, stock: 13, badge: 'ML', desc: 'Paid AI/ML platform plan for model hosting and builders.' }
];

let buyer = 'single';
let filter = 'All';
let cart = [];
let products = loadProducts();
let wallets = loadWallets();
let orders = loadJSON(ORDERS_KEY, []);
let logs = loadJSON(LOGS_KEY, []);
let signups = loadJSON(SIGNUPS_KEY, []);
let currentUser = loadJSON('aurum_ai_current_user_v1', null);
let pendingBuyNowId = null;
let visitorAnalytics = loadJSON(VISITOR_KEY, { total: 0, today: {}, sources: {}, pages: [], lastVisits: [] });
let adminSettings = loadJSON(ADMIN_SETTINGS_KEY, { supportEmail: 'support@royalclue.com', supportText: 'Admin will verify payment and deliver by email.', defaultStockMin: 300, defaultStockMax: 4000 });
let productAnalytics = loadJSON(PRODUCT_ANALYTICS_KEY, { products: {}, events: [] });
let supportChat = loadJSON(SUPPORT_CHAT_KEY, []);
const viewedThisSession = new Set();

function loadJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback } }
function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)) }
function randomStock(min = 300, max = 4000) { return Math.floor(Math.random() * (max - min + 1)) + min }
function favicon(domain) { return `https://www.google.com/s2/favicons?domain=${domain}&sz=128` }
function logoFor(p) { return p.customLogo || favicon(p.domain || p.brand) }
function detectVisitorSource() {
  const params = new URLSearchParams(location.search);
  const utm = params.get('utm_source') || params.get('source') || params.get('ref');
  if (utm) return utm.trim();
  const ref = document.referrer;
  if (!ref) return 'Direct';
  try { return new URL(ref).hostname.replace(/^www\./, ''); } catch { return 'Unknown' }
}
function trackVisit() {
  const source = detectVisitorSource();
  const day = new Date().toISOString().slice(0, 10);
  visitorAnalytics.total = (visitorAnalytics.total || 0) + 1;
  visitorAnalytics.today[day] = (visitorAnalytics.today[day] || 0) + 1;
  visitorAnalytics.sources[source] = (visitorAnalytics.sources[source] || 0) + 1;
  visitorAnalytics.lastVisits.unshift({ time: new Date().toLocaleString(), source, page: location.pathname + location.search, referrer: document.referrer || 'Direct' });
  visitorAnalytics.lastVisits = visitorAnalytics.lastVisits.slice(0, 80);
  saveJSON(VISITOR_KEY, visitorAnalytics);
  addLog(`Visitor from ${source}`, 'visitor');
  if (window.RoyalClueAPI?.trackVisit) { window.RoyalClueAPI.trackVisit({ source, page: location.pathname + location.search, referrer: document.referrer || '' }).catch(() => { }); }
  return visitorAnalytics.total;
}

function ensureProductMetric(product) {
  if (!productAnalytics.products) productAnalytics.products = {};
  const key = String(product.id);
  if (!productAnalytics.products[key]) {
    productAnalytics.products[key] = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      views: 0,
      clicks: 0,
      sales: 0,
      revenue: 0,
      sources: {},
      lastEvents: []
    };
  }
  const m = productAnalytics.products[key];
  m.name = product.name;
  m.brand = product.brand;
  return m;
}
function trackProductEvent(product, type, amount = 0) {
  if (!product) return;
  const source = detectVisitorSource();
  const metric = ensureProductMetric(product);
  metric.sources[source] = metric.sources[source] || { views: 0, clicks: 0, sales: 0, revenue: 0 };
  if (type === 'view') {
    metric.views += 1;
    metric.sources[source].views += 1;
    product.views = (product.views || 0) + 1;
  }
  if (type === 'click') {
    metric.clicks += 1;
    metric.sources[source].clicks += 1;
    product.clicks = (product.clicks || 0) + 1;
  }
  if (type === 'sale') {
    metric.sales += 1;
    metric.revenue += Number(amount || 0);
    metric.sources[source].sales += 1;
    metric.sources[source].revenue += Number(amount || 0);
    product.sold = (product.sold || 0) + 1;
    product.stock = Math.max(0, (product.stock || 0) - 1);
  }
  const event = { time: new Date().toLocaleString(), product: product.name, brand: product.brand, type, source, amount: Number(amount || 0) };
  metric.lastEvents.unshift(event);
  metric.lastEvents = metric.lastEvents.slice(0, 20);
  productAnalytics.events.unshift(event);
  productAnalytics.events = productAnalytics.events.slice(0, 250);
  saveJSON(PRODUCT_ANALYTICS_KEY, productAnalytics);
  saveJSON(STORAGE_KEY, products);
  if (window.RoyalClueAPI?.trackProductEvent) { window.RoyalClueAPI.trackProductEvent({ productId: product.id, productName: product.name, brand: product.brand, type, source, amount: Number(amount || 0), page: location.pathname + location.search, referrer: document.referrer || '' }).catch(() => { }); }
}
function markProductViews(list) {
  const source = detectVisitorSource();
  list.forEach(p => {
    const key = `${p.id}|${source}|${buyer}`;
    if (!viewedThisSession.has(key)) {
      viewedThisSession.add(key);
      trackProductEvent(p, 'view');
    }
  });
}
function productMetricsList() {
  return products.map(p => {
    const m = ensureProductMetric(p);
    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      views: (m.views || p.views || 0),
      clicks: (m.clicks || p.clicks || 0),
      sales: m.sales || 0,
      revenue: m.revenue || 0,
      topSource: Object.entries(m.sources || {}).sort((a, b) => (b[1].views + b[1].clicks + b[1].sales) - (a[1].views + a[1].clicks + a[1].sales))[0]?.[0] || '-'
    };
  });
}

let visitors = trackVisit();
function loadProducts() {
  const saved = loadJSON(STORAGE_KEY, null);
  const source = (!saved || !Array.isArray(saved) || saved.length < 40) ? structuredClone(DEFAULT_PRODUCTS) : saved;
  const normalized = source.map(p => {
    const base = {
      ...p,
      stock: (Number(p.stock) >= 300 && Number(p.stock) <= 4000) ? Number(p.stock) : randomStock(300, 4000),
      customLogo: p.customLogo || ''
    };
    // Real pricing mode: keep a market price, then auto-set your selling prices from it.
    return applyMarketDiscounts(base);
  });
  saveJSON(STORAGE_KEY, normalized);
  return normalized;
}
function loadWallets() {
  return loadJSON(WALLETS_KEY, {
    'USDT TRC20': 'PASTE_YOUR_REAL_USDT_TRC20_WALLET_HERE',
    'BTC': 'PASTE_YOUR_REAL_BTC_WALLET_HERE',
    'ETH': 'PASTE_YOUR_REAL_ETH_WALLET_HERE',
    'BNB': 'PASTE_YOUR_REAL_BNB_WALLET_HERE'
  });
}
function getPrice(p) { return buyer === 'reseller' ? p.reseller : p.price }
function getPriceForQuantity(p, quantity = getCheckoutQuantity()) {
  if (!p) return 0;
  return buyer === 'reseller' ? p.reseller : p.price;
}
function getActiveCheckoutTier(quantity = getCheckoutQuantity()) {
  return buyer === 'reseller' ? 'reseller' : 'single';
}
function getTierDisplayName(tier = getActiveCheckoutTier()) {
  if (tier === 'reseller') return 'Bulk/Resell';
  return 'Single';
}
function getCartItemProduct(item) {
  return products.find(p => p.id === item.id);
}
function getCheckoutItemPrice(item, quantity = getCheckoutQuantity()) {
  const product = getCartItemProduct(item);
  return product ? getPriceForQuantity(product, quantity) : Number(item.price || 0);
}
function getCheckoutUnitTotal(quantity = getCheckoutQuantity()) {
  return cart.reduce((s, i) => s + Number(getCheckoutItemPrice(i, quantity) || 0), 0);
}

const ROLE_RECOMMENDATIONS = {
  'Developer': ['Coding', 'AI', 'Research', 'Automation'],
  'Coder': ['Coding', 'AI', 'Research', 'Automation'],
  'Freelancer': ['AI', 'Design', 'Writing', 'Productivity', 'Coding'],
  'Marketer': ['Marketing', 'Writing', 'Design', 'Video', 'Automation'],
  'Agency Owner': ['Marketing', 'Automation', 'Design', 'Video', 'Productivity', 'AI'],
  'Automation Agency': ['Automation', 'AI', 'Marketing', 'Coding', 'Productivity'],
  'Creator': ['Video', 'Voice', 'Design', 'Writing', 'AI'],
  'AI Startup': ['AI', 'Coding', 'Automation', 'Research', 'Productivity'],
  'Student': ['Writing', 'Research', 'AI', 'Productivity', 'Design'],
  'Exam Writer': ['Writing', 'Research', 'AI', 'Productivity'],
  'Content Writer': ['Writing', 'Marketing', 'Research', 'AI', 'Productivity'],
  'Designer': ['Design', 'Video', 'AI', 'Productivity'],
  'Video Editor': ['Video', 'Voice', 'Design', 'AI'],
  'Other': ['AI', 'Productivity', 'Writing', 'Research']
};

const LOOKING_RECOMMENDATIONS = [
  { match: ['coding', 'cursor', 'copilot', 'replit', 'v0', 'developer'], cats: ['Coding', 'AI', 'Research'] },
  { match: ['automation', 'zapier', 'make', 'n8n', 'clay', 'agent'], cats: ['Automation', 'AI', 'Marketing'] },
  { match: ['design', 'canva', 'figma', 'adobe', 'freepik'], cats: ['Design', 'AI', 'Productivity'] },
  { match: ['video', 'runway', 'heygen', 'capcut', 'kling', 'synthesia'], cats: ['Video', 'Voice', 'Design'] },
  { match: ['voice', 'elevenlabs', 'murf'], cats: ['Voice', 'Video', 'AI'] },
  { match: ['writing', 'marketing', 'grammarly', 'jasper', 'copy', 'seo', 'exam'], cats: ['Writing', 'Research', 'Marketing', 'AI'] },
  { match: ['chatgpt', 'claude', 'gemini', 'ai plans'], cats: ['AI', 'Research', 'Writing'] },
  { match: ['bulk', 'reselling', 'reseller'], cats: ['AI', 'Coding', 'Design', 'Video', 'Automation'] }
];

function getRecommendedCats() {
  const cats = [];
  if (currentUser?.role && ROLE_RECOMMENDATIONS[currentUser.role]) cats.push(...ROLE_RECOMMENDATIONS[currentUser.role]);
  const looking = (currentUser?.looking || '').toLowerCase();
  LOOKING_RECOMMENDATIONS.forEach(rule => {
    if (rule.match.some(word => looking.includes(word))) cats.push(...rule.cats);
  });
  return [...new Set(cats)];
}

function recommendationScore(product) {
  const cats = getRecommendedCats();
  let score = 0;
  if (cats.includes(product.cat)) score += 100;
  const text = `${product.name} ${product.brand} ${product.cat} ${product.desc}`.toLowerCase();
  const looking = (currentUser?.looking || '').toLowerCase();
  looking.split(/[^a-z0-9+]+/i).filter(w => w.length > 2).forEach(w => {
    if (text.includes(w)) score += 12;
  });
  score += Math.min(product.sold || 0, 20000) / 1000;
  return score;
}

function sortedForCurrentUser(list) {
  // Personalized marketplace banner/sorting removed — keep marketplace simple and consistent.
  return [...list].sort((a, b) => (b.sold || 0) - (a.sold || 0));
}

function getRecommendationTitle() {
  if (!currentUser) return '';
  const cats = getRecommendedCats().slice(0, 4).join(', ');
  return `Recommended first for ${currentUser.role}: ${cats || 'Popular AI plans'}`;
}

function page(el) { document.querySelectorAll('.page').forEach(p => p.classList.remove('active')); document.getElementById('storefront').style.display = 'none'; document.getElementById(el).classList.add('active'); closeCart() }
function showStore() { document.querySelectorAll('.page').forEach(p => p.classList.remove('active')); document.getElementById('storefront').style.display = 'block'; updateSignupUI() }
function openSignupPage() {
  if (currentUser && currentUser.email) {
    toast('You are already signed up');
    showStore();
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  hideSignupOrderNotice();
  page('signupPage');
}

function hideSignupOrderNotice() {
  const notice = document.getElementById('signupOrderNotice');
  if (notice) notice.hidden = true;
}

function showSignupOrderNotice(productId) {
  const notice = document.getElementById('signupOrderNotice');
  const text = document.getElementById('signupOrderNoticeText');
  const p = products.find(x => x.id === productId);
  if (!notice) return;
  if (text) {
    text.textContent = p
      ? `Create your buyer account first. After signup, ${p.name} will open automatically in checkout.`
      : 'Create your buyer account first. After signup, checkout will continue automatically.';
  }
  notice.hidden = false;
  notice.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function openLoginPage() {
  if (currentUser && currentUser.email) {
    toast('You are already logged in');
    showStore();
    return;
  }
  const emailField = document.getElementById('loginEmail');
  const contactField = document.getElementById('loginContact');
  if (emailField) emailField.value = '';
  if (contactField) contactField.value = '';
  page('loginPage');
}

function updateSignupUI() {
  const isSigned = !!(currentUser && currentUser.email);
  const signupPage = document.getElementById('signupPage');
  const loginPage = document.getElementById('loginPage');

  document.querySelectorAll('[onclick="openSignupPage()"]').forEach(el => {
    const li = el.closest('li');
    const target = li || el;
    target.style.display = isSigned ? 'none' : '';
  });
  document.querySelectorAll('[onclick="openLoginPage()"]').forEach(el => {
    const li = el.closest('li');
    const target = li || el;
    target.style.display = isSigned ? 'none' : '';
  });

  if (signupPage) signupPage.style.display = isSigned ? 'none' : '';
  if (loginPage) loginPage.style.display = isSigned ? 'none' : '';

  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  let badge = document.getElementById('accountBadge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'accountBadge';
    badge.className = 'account-badge';
    navActions.insertBefore(badge, navActions.firstChild);
  }

  if (isSigned) {
    const name = (currentUser.name || currentUser.email || 'Buyer').split(' ')[0];
    const role = currentUser.role || 'Buyer';
    badge.style.display = 'flex';
    badge.innerHTML = `<span class="account-dot">✓</span><div><b>${name}</b><small>${role}</small></div><button type="button" onclick="logoutBuyer(event)">Logout</button>`;
  } else {
    badge.style.display = 'none';
    badge.innerHTML = '';
  }
}

function submitLogin() {
  const email = document.getElementById('loginEmail')?.value.trim().toLowerCase();
  const contact = document.getElementById('loginContact')?.value.trim();
  if (!email) { toast('Please enter your email'); document.getElementById('loginEmail')?.focus(); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Please enter a valid email address'); document.getElementById('loginEmail')?.focus(); return; }
  const found = signups.find(x => (x.email || '').trim().toLowerCase() === email);
  if (!found) {
    toast('Account not found. Please create one first.');
    setTimeout(() => openSignupPage(), 600);
    return;
  }
  currentUser = { ...found };
  if (contact) currentUser.contact = contact;
  saveJSON('aurum_ai_current_user_v1', currentUser);
  updateSignupUI();
  renderProducts();
  ensureSupportWelcome();
  renderSupportMessages();
  if (document.getElementById('payEmail')) document.getElementById('payEmail').value = currentUser.email || '';
  if (document.getElementById('payContact')) document.getElementById('payContact').value = currentUser.contact || '';
  addLog(`Buyer login: ${currentUser.email}`, 'login');
  toast('Login success');
  window.location.href = 'index.html#products';
}

function logoutBuyer(e) {
  if (e) e.stopPropagation();
  localStorage.removeItem('aurum_ai_current_user_v1');
  currentUser = null;
  pendingBuyNowId = null;
  updateSignupUI();
  renderProducts();
  toast('Signed out');
}

function clearPersonalization() {
  localStorage.removeItem('aurum_ai_current_user_v1');
  currentUser = null;
  updateSignupUI();
  renderProducts();
  toast('Personalization cleared');
}

function submitSignup(e) {
  e.preventDefault();
  const nameEl = document.getElementById('signupName');
  const emailEl = document.getElementById('signupEmail');
  const roleEl = document.getElementById('signupRole');
  const lookingEl = document.getElementById('signupLooking');

  const name = nameEl?.value.trim() || '';
  const email = emailEl?.value.trim().toLowerCase() || '';
  const role = roleEl?.value || '';
  const looking = lookingEl?.value || '';

  if (!name) { toast('Name is required'); nameEl?.focus(); return; }
  if (!email) { toast('Email is required'); emailEl?.focus(); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Please enter a valid email'); emailEl?.focus(); return; }
  if (!role) { toast('Please select your role'); roleEl?.focus(); return; }
  if (!looking) { toast('Please tell us what you are looking for'); lookingEl?.focus(); return; }

  const user = {
    id: 'USR-' + Date.now(),
    name,
    email,
    contact: document.getElementById('signupContact').value.trim(),
    role,
    looking,
    buyerType: document.getElementById('signupBuyerType').value,
    budget: document.getElementById('signupBudget').value,
    source: document.getElementById('signupSource').value || detectVisitorSource(),
    note: document.getElementById('signupNote').value.trim(),
    time: new Date().toLocaleString()
  };
  signups = signups.filter(x => x.email.toLowerCase() !== email);
  signups.unshift(user);
  currentUser = user;
  saveJSON(SIGNUPS_KEY, signups);
  saveJSON('aurum_ai_current_user_v1', currentUser);
  updateSignupUI();
  ensureSupportWelcome();
  renderSupportMessages();
  document.getElementById('payEmail') && (document.getElementById('payEmail').value = user.email);
  addLog(`New signup: ${user.name} (${user.role}) wants ${user.looking}`, 'signup');
  renderAdmin();
  toast('Signup saved. You can order now');

  if (pendingBuyNowId) {
    const nextId = pendingBuyNowId;
    pendingBuyNowId = null;
    buyNow(nextId);
    return;
  }

  window.location.href = 'http://127.0.0.1:5500/index.html?signup=success';
}
function clearSignups() { if (confirm('Clear all signups?')) { signups = []; saveJSON(SIGNUPS_KEY, signups); addLog('Signups cleared', 'admin'); renderAdmin() } }
function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200) }
function showBuyerRequirementModal(type) {
  const modal = document.getElementById('buyerRequirementModal');
  const title = document.getElementById('buyerRequirementTitle');
  const text = document.getElementById('buyerRequirementText');
  const minimum = document.getElementById('buyerRequirementMinimum');
  const kicker = document.getElementById('buyerRequirementKicker');
  const icon = document.getElementById('buyerRequirementIcon');
  if (!modal || !title || !text) return;

  if (type === 'reseller' || type === 'bulk') {
    title.textContent = 'Resell / Bulk offer';
    text.textContent = 'You can compare discounted prices now. Checkout starts at 5 accounts and uses one Bulk/Resell rate.';
    if (minimum) minimum.textContent = '5+ accounts';
    if (kicker) kicker.textContent = 'RoyalClue account discount notice';
    if (icon) icon.textContent = '5+';
  } else {
    return;
  }

  modal.classList.add('active');
}
function closeBuyerRequirementModal() {
  document.getElementById('buyerRequirementModal')?.classList.remove('active');
}
function setBuyer(type) {
  buyer = type === 'bulk' ? 'reseller' : type;
  document.querySelectorAll('.marketplace-buyer-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('marketplace-' + buyer)?.classList.add('active');
  document.querySelectorAll('.buyer-tabs button').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + buyer)?.classList.add('active');
  document.querySelectorAll('.buyer-choice-cards article').forEach(c => c.classList.remove('active-choice'));
  document.getElementById('choice-' + buyer)?.classList.add('active-choice');
  document.getElementById('pageTitle').innerHTML = buyer === 'single' ? 'Single <em>Plans</em>' : 'Resell / <em>Bulk</em>';
  document.getElementById('pageSub').textContent = buyer === 'single' ? 'Retail pricing for normal buyers.' : 'Discounted pricing: 5+ accounts use one Bulk/Resell rate.';
  renderProducts();
  renderCart();
  showStore();
  if (buyer === 'reseller') showBuyerRequirementModal('reseller');
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}
function renderFilters() {
  const wrap = document.getElementById('filters');
  if (!wrap) return;
  const buttons = categories.map(c => {
    const count = c === 'All' ? products.length : products.filter(p => p.cat === c).length;
    return `<button class="cat-btn ${filter === c ? 'active' : ''}" onclick="selectCategory('${c}')">${c} <span>${count}</span></button>`;
  }).join('');
  wrap.innerHTML = `
    <button class="cat-arrow" aria-label="Scroll categories left" onclick="scrollCats(-1)">‹</button>
    <div class="category-track live-category-slider" id="categoryTrack" onmouseenter="pauseCategorySlider()" onmouseleave="resumeCategorySlider()">${buttons}</div>
    <button class="cat-arrow" aria-label="Scroll categories right" onclick="scrollCats(1)">›</button>
  `;
  startAutoCategorySlider();
}
function selectCategory(category) {
  filter = category;
  renderFilters();
  renderProducts();
}
function scrollCats(direction) {
  const track = document.getElementById('categoryTrack');
  if (!track) return;
  pauseCategorySlider();
  track.scrollBy({ left: direction * 260, behavior: 'smooth' });
  setTimeout(resumeCategorySlider, 1600);
}

let categorySliderRafId = null;
let categorySliderPaused = false;
let categorySliderLastTime = 0;
const CAT_SCROLL_SPEED = 0.8; // px per frame at 60fps

function startAutoCategorySlider() {
  const track = document.getElementById('categoryTrack');
  if (!track) return;
  stopAutoCategorySlider();
  categorySliderPaused = false;
  categorySliderLastTime = 0;
  function step(time) {
    const liveTrack = document.getElementById('categoryTrack');
    if (!liveTrack || categorySliderPaused) {
      categorySliderRafId = requestAnimationFrame(step);
      return;
    }
    if (categorySliderLastTime) {
      const maxScroll = liveTrack.scrollWidth - liveTrack.clientWidth;
      if (maxScroll <= 0) { categorySliderRafId = requestAnimationFrame(step); return; }
      if (liveTrack.scrollLeft >= maxScroll - 6) {
        liveTrack.scrollTo({ left: 0, behavior: 'auto' });
      } else {
        liveTrack.scrollBy({ left: CAT_SCROLL_SPEED, behavior: 'auto' });
      }
    }
    categorySliderLastTime = time;
    categorySliderRafId = requestAnimationFrame(step);
  }
  categorySliderRafId = requestAnimationFrame(step);
}

function stopAutoCategorySlider() {
  if (categorySliderRafId) {
    cancelAnimationFrame(categorySliderRafId);
    categorySliderRafId = null;
  }
  categorySliderLastTime = 0;
}

function pauseCategorySlider() {
  categorySliderPaused = true;
}

function resumeCategorySlider() {
  categorySliderPaused = false;
}

function performMarketplaceSearch() {
  renderProducts();
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleMarketplaceSearchEnter(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    performMarketplaceSearch();
  }
}

function renderProducts() {
  const grid = document.getElementById('grid');
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const keywords = q ? q.split(/\s+/).filter(Boolean) : [];
  const baseList = products.filter(p => {
    if (filter !== 'All' && p.cat !== filter) return false;
    const haystack = `${p.name} ${p.brand} ${p.cat} ${p.desc}`.toLowerCase();
    if (!keywords.length) return true;
    return keywords.every(word => haystack.includes(word));
  });
  const list = sortedForCurrentUser(baseList);
  markProductViews(list);
  grid.innerHTML = (list.map(p => {
    const activePrice = getPrice(p);
    const old = Math.round(Number(p.marketPrice || activePrice * 2));
    const resellerLine = buyer === 'reseller' ? `<div class="tier-price-line"><span>Bulk/Resell: $${p.reseller}</span></div>` : '';
    return `<article class="card">
      <div class="card-top"><div class="brand"><div class="logo-img"><img src="${logoFor(p)}" alt="${p.brand}" onerror="this.style.display='none';this.parentElement.textContent='${p.brand[0]}'"></div><div><div class="brand-name">${p.brand}</div><div class="card-title">${p.name}</div></div></div><span class="discount">${p.badge}</span></div>
      <p class="card-desc">${p.desc}</p>
      <div class="card-meta"><span>${p.cat}</span><span class="sold">${p.sold.toLocaleString()} sold</span><span class="${p.stock < 12 ? 'stock-low' : ''}">${p.stock} stock</span></div>
      <div class="card-footer"><div><span class="price-old">Market $${old}</span><div class="price-new"><span>$</span>${activePrice}</div>${resellerLine}</div><button class="btn-view" onclick="buyNow(${p.id})">Buy Now</button></div>
    </article>`
  }).join('') || `<div class="panel"><h2>No products found</h2><p>Try another category or search term.</p></div>`);
}

function buyNow(id) {
  if (!currentUser || !currentUser.email) {
    pendingBuyNowId = id;
    openSignupPage();
    showSignupOrderNotice(id);
    return;
  }

  const p = products.find(x => x.id === id);
  if (!p) return;
  trackProductEvent(p, 'click');
  cart = [{ id: p.id, name: p.name, brand: p.brand, cat: p.cat, price: getPrice(p), domain: p.domain }];
  addLog(`${p.name} buy now clicked`, 'buy-now');
  renderCart();
  renderAdmin();
  const qtyEl = document.getElementById('payQuantity');
  if (qtyEl) qtyEl.value = String(getMinimumBuyerQuantity());
  openPaymentPage();
}

function addToCart(id) { const p = products.find(x => x.id === id); if (!p) return; trackProductEvent(p, 'click'); cart.push({ id: p.id, name: p.name, brand: p.brand, cat: p.cat, price: getPrice(p), domain: p.domain }); addLog(`${p.name} added to cart`, 'cart'); renderCart(); renderAdmin(); toast('Added to cart') }
function removeFromCart(i) { cart.splice(i, 1); renderCart() }
function renderCart() {
  const wrap = document.getElementById('cartItems');
  const countEl = document.getElementById('cartCount');
  const countTopEl = document.getElementById('cartCountTop');
  const subtotalEl = document.getElementById('cartSubtotal');
  const typeEl = document.getElementById('cartBuyerType');
  const total = cart.reduce((s, i) => s + Number(i.price || 0), 0);
  if (countEl) countEl.textContent = cart.length;
  if (countTopEl) countTopEl.textContent = cart.length;
  if (subtotalEl) subtotalEl.textContent = '$' + total.toFixed(2);
  if (typeEl) typeEl.textContent = buyer === 'reseller' ? 'Resell/Bulk' : 'Single';
  if (wrap) wrap.innerHTML = cart.length ? cart.map((i, idx) => `<div class="cart-item"><div class="cart-info"><div class="logo-img"><img src="${logoFor(i)}" alt="${i.brand}"></div><div><b>${i.name}</b><small>${i.cat} · $${Number(i.price || 0).toFixed(2)}</small></div></div><button class="icon-btn" onclick="removeFromCart(${idx})">×</button></div>`).join('') : '<div class="box"><p>Your cart is empty.</p></div>';
}
function openCart() { document.getElementById('cartDrawer').classList.add('active') }
function closeCart() { document.getElementById('cartDrawer').classList.remove('active') }

function getMinimumBuyerQuantity(type = buyer) {
  if (type === 'reseller' || type === 'bulk') return 5;
  return 1;
}

function getCheckoutQuantity() {
  const qtyEl = document.getElementById('payQuantity');
  const raw = Number(qtyEl?.value || 1);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
}

function ensureCheckoutQuantityMinimum() {
  const qtyEl = document.getElementById('payQuantity');
  if (!qtyEl) return;
  const minimum = getMinimumBuyerQuantity();
  qtyEl.min = String(minimum);
  const current = getCheckoutQuantity();
  if (current < minimum) qtyEl.value = String(minimum);
}

function renderCheckoutMinimumNotice() {
  const notice = document.getElementById('checkoutMinimumBox');
  if (!notice) return;
  const minimum = getMinimumBuyerQuantity();
  if (minimum <= 1) {
    notice.style.display = 'none';
    notice.innerHTML = '';
    return;
  }
  notice.style.display = 'block';
  notice.innerHTML = `<b>Bulk/Resell minimum: 5 accounts</b><span>All Bulk/Resell orders use one discounted rate.</span>`;
}

function getCheckoutTotal() {
  const quantity = getCheckoutQuantity();
  return getCheckoutUnitTotal(quantity) * quantity;
}

function openPaymentPage() {
  if (!currentUser || !currentUser.email) {
    openSignupPage();
    showSignupOrderNotice(pendingBuyNowId);
    return;
  }
  if (!cart || !cart.length) {
    toast('Select a product first');
    return;
  }
  page('paymentPage');
  ensureCheckoutQuantityMinimum();
  renderCheckoutMinimumNotice();
  renderPaymentSummary();
  renderPaymentInfo();
  if (currentUser?.email) document.getElementById('payEmail').value = currentUser.email;
  if (currentUser?.contact) document.getElementById('payContact').value = currentUser.contact;
}
function renderPaymentSummary() {
  renderCheckoutMinimumNotice();
  const quantity = getCheckoutQuantity();
  const unitTotal = getCheckoutUnitTotal(quantity);
  const total = getCheckoutTotal();
  const minimum = getMinimumBuyerQuantity();
  const activeTier = getActiveCheckoutTier(quantity);
  const typeLabel = buyer === 'reseller' ? 'Bulk/Resell rate' : 'Single';
  document.getElementById('payOrderType').textContent = typeLabel;
  const minimumLine = minimum > 1 ? `<div class="summary-row minimum-row"><span>Discount rule</span><b>5+ Bulk/Resell</b></div>` : '';
  document.getElementById('paymentSummary').innerHTML = cart.map(i => `<div class="summary-row"><span>${i.name}</span><b>$${Number(getCheckoutItemPrice(i, quantity) || 0).toFixed(2)} each</b></div>`).join('') + `${minimumLine}<div class="summary-row"><span>Quantity</span><b>${quantity} account${quantity > 1 ? 's' : ''}</b></div><div class="summary-row"><span>Subtotal per account</span><b>$${unitTotal.toFixed(2)}</b></div><hr style="border-color:rgba(205,155,43,.18);margin:12px 0"><div class="summary-row"><span>Total</span><b>$${total.toFixed(2)}</b></div>`
}
function renderPaymentInfo() {
  const coin = document.getElementById('payCoin')?.value || 'USDT TRC20';
  const total = getCheckoutTotal();
  const walletAddr = wallets[coin] || 'Wallet address not configured. Please contact admin.';
  document.getElementById('walletBox').innerHTML = `<div class="wallet-box"><p><span>Network</span><b>${coin}</b></p><p><span>Amount</span><b>$${total.toFixed(2)}</b></p><div class="wallet-address" id="walletAddress">${walletAddr}</div><button class="btn btn-ghost full" onclick="copyWallet()" type="button">Copy Wallet Address</button><small>${adminSettings.supportText || ''}</small></div>`
}
function copyWallet() { navigator.clipboard?.writeText(document.getElementById('walletAddress').textContent); toast('Wallet copied') }
function submitOrder(e) {
  if (e) e.preventDefault();
  if (!cart || !cart.length) { toast('Cart is empty'); return; }
  const emailEl = document.getElementById('payEmail');
  const txEl = document.getElementById('payTx');
  const email = emailEl?.value.trim() || '';
  const tx = txEl?.value.trim() || '';
  if (!email) { toast('Email is required'); emailEl?.focus(); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Invalid email'); emailEl?.focus(); return; }
  if (!tx) { toast('Transaction ID is required'); txEl?.focus(); return; }
  const quantity = getCheckoutQuantity();
  const minimum = getMinimumBuyerQuantity();
  if (quantity < minimum) {
    toast(`Resell/Bulk orders require at least ${minimum} accounts`);
    const qtyEl = document.getElementById('payQuantity');
    qtyEl?.focus();
    return;
  }
  const total = getCheckoutTotal();
  const source = detectVisitorSource();
  const order = {
    id: 'ORD-' + Date.now(),
    buyer: email,
    type: buyer === 'reseller' ? 'resell-bulk' : buyer,
    activeRate: getActiveCheckoutTier(quantity),
    quantity,
    minimumRequired: minimum,
    total,
    payment: document.getElementById('payCoin')?.value || 'USDT TRC20',
    tx,
    contact: document.getElementById('payContact')?.value.trim() || '',
    status: 'Pending',
    items: cart.map(x => x.name),
    itemDetails: cart.map(x => ({ id: x.id, name: x.name, brand: x.brand, unitPrice: Number(getCheckoutItemPrice(x, quantity) || 0), quantity, cat: x.cat })),
    buyerProfile: currentUser ? { name: currentUser.name, role: currentUser.role, looking: currentUser.looking, source: currentUser.source, budget: currentUser.budget } : null,
    source,
    time: new Date().toLocaleString()
  };
  cart.forEach(item => {
    const p = products.find(x => x.id === item.id || x.name === item.name);
    if (p) trackProductEvent(p, 'sale', Number(getCheckoutItemPrice(item, quantity) || 0) * quantity);
  });
  orders.unshift(order);
  saveJSON(ORDERS_KEY, orders);
  addLog(`New order ${order.id} submitted from ${source}: ${order.items.join(', ')}`, 'order');
  cart = [];
  renderCart();
  renderAdmin();
  updateLiveTicker();
  toast('Order submitted');
  showStore();
}

function openAdminLogin() {
  toast('Admin opens in a private owner page');
  window.open('admin.html', '_blank', 'noopener');
}
function isAdminUnlocked() { return localStorage.getItem(ADMIN_SESSION_KEY) === 'unlocked' }
function openAdminPanel() {
  if (!isAdminUnlocked()) {
    openAdminLogin();
    toast('Type villain, then mind within 5 seconds to unlock owner page');
    return;
  }
  localStorage.setItem('aurum_ai_admin_auth_v1', '1');
  startAdminMusic();
  window.open('admin.html#owner-unlocked', '_blank', 'noopener');
  toast('Owner dashboard opened in a separate page');
}
function adminLogout() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem('aurum_ai_admin_auth_v1');
  stopAdminMusic();
  showStore();
  toast('Admin locked');
}
function unlockAdminDashboard() {
  localStorage.setItem(ADMIN_SESSION_KEY, 'unlocked');
  localStorage.setItem('aurum_ai_admin_auth_v1', '1');
  openAdminPanel();
}
function adminLogin() {
  const value = (document.getElementById('adminPasswordInput')?.value || '').trim().toLowerCase();
  if (value === 'mind') unlockAdminDashboard();
  else toast('Wrong unlock word');
}
function renderAdmin() { renderDashboard(); renderOrders(); renderSignups(); renderAdminProducts(); renderProductSalesAnalytics(); renderWalletAdmin(); renderVisitorSources(); renderAdminSettings(); renderLogs() }
function renderDashboard() { const pending = orders.filter(o => o.status === 'Pending').length; const revenue = orders.filter(o => o.status === 'Delivered' || o.status === 'Approved').reduce((s, o) => s + o.total, 0); const views = products.reduce((s, p) => s + (p.views || 0), 0); const today = new Date().toISOString().slice(0, 10); document.getElementById('adminPending').textContent = pending; document.getElementById('adminRevenue').textContent = '$' + revenue; document.getElementById('adminVisitors').textContent = visitorAnalytics.total || visitors; document.getElementById('adminViews').textContent = views; const su = document.getElementById('adminSignups'); if (su) su.textContent = signups.length; const tv = document.getElementById('adminTodayVisitors'); if (tv) tv.textContent = visitorAnalytics.today?.[today] || 0; const ts = document.getElementById('adminTopSource'); if (ts) { const top = Object.entries(visitorAnalytics.sources || {}).sort((a, b) => b[1] - a[1])[0]; ts.textContent = top ? `${top[0]} (${top[1]})` : 'Direct'; } }
function renderSignups() {
  const table = document.getElementById('signupsTable');
  if (!table) return;
  table.innerHTML = signups.map(u => `<tr><td><b>${u.name}</b></td><td>${u.email}</td><td>${u.role}</td><td>${u.looking}<br><small>${u.note || ''}</small></td><td>${u.budget}</td><td>${u.source}</td><td>${u.contact || '-'}</td><td>${u.time}</td></tr>`).join('') || '<tr><td colspan="8">No signups yet.</td></tr>';
}
function renderOrders() { document.getElementById('ordersTable').innerHTML = orders.map(o => `<tr><td>${o.id}</td><td>${o.buyer}</td><td>${o.type}</td><td>$${o.total}</td><td>${o.payment}</td><td>${o.tx}</td><td>${o.source || o.buyerProfile?.source || '-'}</td><td><span class="status ${o.status.toLowerCase()}">${o.status}</span></td><td><button class="btn btn-small btn-ghost" onclick="setOrderStatus('${o.id}','Approved')">Approve</button> <button class="btn btn-small btn-ghost" onclick="setOrderStatus('${o.id}','Delivered')">Deliver</button> <button class="btn btn-small btn-danger" onclick="setOrderStatus('${o.id}','Rejected')">Reject</button></td></tr>`).join('') || '<tr><td colspan="9">No orders yet.</td></tr>' }
function setOrderStatus(id, status) { const o = orders.find(x => x.id === id); if (!o) return; o.status = status; saveJSON(ORDERS_KEY, orders); addLog(`${id} marked ${status}`, 'admin'); renderAdmin() }
function clearOrders() { if (confirm('Clear all orders?')) { orders = []; saveJSON(ORDERS_KEY, orders); addLog('Orders cleared', 'admin'); renderAdmin() } }
function renderAdminProducts() {
  const tbody = document.getElementById('adminProducts');
  if (!tbody) return;
  tbody.innerHTML = products.map((p, idx) => `<tr>
    <td><b>#${idx + 1}</b><br><small>ID ${p.id}</small></td>
    <td><div class="owner-product-name"><div class="logo-img"><img src="${logoFor(p)}" alt="${escapeHtml(p.brand)}"></div><div><input value="${escapeHtml(p.name)}" oninput="updateProductField(${p.id},'name',this.value)"><small>${escapeHtml(p.brand || p.cat || 'Product')}</small></div></div></td>
    <td><label class="price-cell"><span>$</span><input type="number" value="${p.price}" oninput="updateProductField(${p.id},'price',Number(this.value))"></label></td>
    <td><label class="price-cell"><span>$</span><input type="number" value="${p.reseller}" oninput="updateProductField(${p.id},'reseller',Number(this.value))"></label></td>
    <td><input class="stock-mini" type="number" value="${p.stock}" oninput="updateProductField(${p.id},'stock',Number(this.value))"></td>
    <td><span class="live-pill">Synced</span></td>
    <td><button class="btn btn-small btn-ghost" onclick="randomizeProductStock(${p.id})">Stock</button><button class="btn btn-small btn-danger" onclick="deleteProduct(${p.id})">Delete</button></td>
  </tr>`).join('');
  renderQuickProductOptions();
}
function renderQuickProductOptions() {
  const select = document.getElementById('quickProductSelect');
  if (!select) return;
  const current = select.value;
  select.innerHTML = products.map((p, idx) => `<option value="${p.id}">#${idx + 1} · ${escapeHtml(p.name)}</option>`).join('');
  if (current && products.some(p => String(p.id) === String(current))) select.value = current;
  loadQuickProductEditor();
}
function loadQuickProductEditor() {
  const select = document.getElementById('quickProductSelect');
  if (!select) return;
  const p = products.find(x => String(x.id) === String(select.value)) || products[0];
  if (!p) return;
  select.value = p.id;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
  set('quickProductId', p.id);
  set('quickProductName', p.name);
  set('quickProductSingle', p.price);
  set('quickProductReseller', p.reseller);

  updateQuickProductPreview(p);
}
function updateQuickProductPreview(p) {
  const preview = document.getElementById('quickProductPreview');
  if (preview) {
    preview.innerHTML = `<div class="quick-product-card owner-preview-card"><div class="logo-img"><img src="${logoFor(p)}" alt="${escapeHtml(p.brand)}"></div><div><b>${escapeHtml(p.name)}</b><small>ID ${p.id} · ${escapeHtml(p.brand || p.cat || 'RoyalClue')}</small></div><div><span>Single</span><strong>$${p.price}</strong></div><div><span>Bulk/Resell</span><strong>$${p.reseller}</strong></div></div>`;
  }
}
let quickProductSaveTimer = null;
function quickProductLiveUpdate(field, value) {
  const id = document.getElementById('quickProductSelect')?.value;
  const p = products.find(x => String(x.id) === String(id));
  if (!p) return;
  if (field === 'name') p.name = String(value || '').trim() || p.name;
  else { p[field] = Number(value) || 0; if (field === 'reseller') p.bulk = p.reseller; if (field === 'bulk') p.reseller = p.bulk; }
  saveJSON(STORAGE_KEY, products);
  renderProducts();
  updateQuickProductPreview(p);
  const st = document.getElementById('quickProductStatus');
  if (st) { st.textContent = 'Saving live update...'; clearTimeout(quickProductSaveTimer); quickProductSaveTimer = setTimeout(() => { st.textContent = 'Live update saved to the main store.' }, 450); }
}
function saveQuickProductEditor(silent = false) {
  const id = document.getElementById('quickProductSelect')?.value;
  const p = products.find(x => String(x.id) === String(id));
  if (!p) { toast('Select a product first'); return; }
  p.name = document.getElementById('quickProductName').value.trim() || p.name;
  p.price = Number(document.getElementById('quickProductSingle').value) || 0;
  p.reseller = Number(document.getElementById('quickProductReseller').value) || 0;
  p.bulk = p.reseller;
  saveJSON(STORAGE_KEY, products);
  renderProducts();
  renderAdminProducts();
  addLog(`${p.name} price console update saved`, 'product');
  if (!silent) toast('Live price updated on store');
}
function updateProductField(id, field, value) { const p = products.find(x => x.id === id); if (!p) return; p[field] = value; if (field === 'reseller') p.bulk = value; if (field === 'bulk') p.reseller = value; if (field === 'brand' && !p.domain) p.domain = value.toLowerCase().replace(/\s+/g, '') + '.com'; saveJSON(STORAGE_KEY, products); renderFilters(); renderProducts(); const st = document.getElementById('quickProductStatus'); if (st) st.textContent = 'Table update synced to main store.'; addLog(`${p.name} ${field} updated`, 'product') }
function randomizeProductStock(id) { const p = products.find(x => x.id === id); if (!p) return; p.stock = randomStock(300, 4000); saveJSON(STORAGE_KEY, products); renderProducts(); renderAdmin(); addLog(`${p.name} stock randomized to ${p.stock}`, 'stock') }
function randomizeAllStock() { products = products.map(p => ({ ...p, stock: randomStock(300, 4000) })); saveJSON(STORAGE_KEY, products); renderProducts(); renderAdmin(); addLog('All product stock randomized 300-4000', 'stock') }
function deleteProduct(id) { products = products.filter(p => p.id !== id); saveJSON(STORAGE_KEY, products); renderFilters(); renderProducts(); renderAdmin(); addLog('Product deleted', 'admin') }
function openAddProductForm() { document.getElementById('productModal').classList.add('active') }
function closeProductModal() { document.getElementById('productModal').classList.remove('active') }
function saveNewProduct() {
  const name = document.getElementById('newProductName').value.trim();
  const brand = document.getElementById('newProductBrand').value.trim() || name;
  const cat = document.getElementById('newProductCat').value;
  const price = Number(document.getElementById('newProductSingle').value);
  const reseller = Number(document.getElementById('newProductReseller').value) || Math.round(price * .30 * 100) / 100;
  const bulk = reseller;
  const stock = Number(document.getElementById('newProductStock').value) || randomStock(300, 4000);
  const domain = document.getElementById('newProductDomain').value.trim() || brand.toLowerCase().replace(/\s+/g, '') + '.com';
  const customLogo = document.getElementById('newProductLogo').value.trim();
  if (!name || !price) { toast('Name and price required'); return }
  products.unshift({ id: Date.now(), brand, name, domain, customLogo, cat, price, reseller, bulk, sold: 0, stock, badge: 'NEW', desc: 'Premium paid plan added by admin.' });
  saveJSON(STORAGE_KEY, products); closeProductModal(); renderFilters(); renderProducts(); renderAdmin(); addLog(`${name} added`, 'admin')
}

function renderProductSalesAnalytics() {
  const salesBody = document.getElementById('productSalesTable');
  const sourceBody = document.getElementById('productSourceTable');
  const eventsBody = document.getElementById('productEventsTable');
  const performance = productMetricsList().sort((a, b) => (b.sales - a.sales) || (b.clicks - a.clicks) || (b.views - a.views));
  if (salesBody) {
    salesBody.innerHTML = performance.slice(0, 80).map(p => `<tr><td><b>${p.name}</b><br><small>${p.brand}</small></td><td>${p.sales}</td><td>$${p.revenue}</td><td>${p.clicks}</td><td>${p.views}</td><td>${p.topSource}</td></tr>`).join('') || '<tr><td colspan="6">No product analytics yet.</td></tr>';
  }
  if (sourceBody) {
    const rows = [];
    Object.values(productAnalytics.products || {}).forEach(m => {
      Object.entries(m.sources || {}).forEach(([source, v]) => rows.push({ name: m.name, brand: m.brand, source, views: v.views || 0, clicks: v.clicks || 0, sales: v.sales || 0, revenue: v.revenue || 0 }));
    });
    rows.sort((a, b) => (b.sales - a.sales) || (b.clicks - a.clicks) || (b.views - a.views));
    sourceBody.innerHTML = rows.slice(0, 120).map(r => `<tr><td><b>${r.name}</b><br><small>${r.brand}</small></td><td>${r.source}</td><td>${r.sales}</td><td>$${r.revenue}</td><td>${r.clicks}</td><td>${r.views}</td></tr>`).join('') || '<tr><td colspan="6">No source-wise product data yet.</td></tr>';
  }
  if (eventsBody) {
    eventsBody.innerHTML = (productAnalytics.events || []).slice(0, 120).map(e => `<tr><td>${e.time}</td><td>${e.type}</td><td>${e.product}</td><td>${e.source}</td><td>$${e.amount || 0}</td></tr>`).join('') || '<tr><td colspan="5">No product events yet.</td></tr>';
  }
}
function clearProductAnalytics() {
  if (!confirm('Clear product sales/click/view analytics?')) return;
  productAnalytics = { products: {}, events: [] };
  products = products.map(p => ({ ...p, views: 0, clicks: 0 }));
  saveJSON(PRODUCT_ANALYTICS_KEY, productAnalytics);
  saveJSON(STORAGE_KEY, products);
  addLog('Product analytics cleared', 'analytics');
  renderProducts(); renderAdmin();
}

function renderWalletAdmin() {
  const coins = ['USDT TRC20', 'BTC', 'ETH', 'BNB', 'USDC ERC20', 'SOL'];
  document.getElementById('walletAdmin').innerHTML = coins.map(k => `<div class="box"><b>${k}</b><input value="${wallets[k] || ''}" placeholder="Paste ${k} wallet address" onchange="wallets['${k}']=this.value;saveJSON(WALLETS_KEY,wallets);renderPaymentInfo?.();addLog('${k} wallet updated','wallet')"></div>`).join('')
}
function renderVisitorSources() {
  const sourceBody = document.getElementById('sourceTable');
  if (sourceBody) {
    sourceBody.innerHTML = Object.entries(visitorAnalytics.sources || {}).sort((a, b) => b[1] - a[1]).map(([source, count]) => `<tr><td>${source}</td><td>${count}</td></tr>`).join('') || '<tr><td colspan="2">No source data yet.</td></tr>';
  }
  const visitBody = document.getElementById('visitTable');
  if (visitBody) {
    visitBody.innerHTML = (visitorAnalytics.lastVisits || []).map(v => `<tr><td>${v.time}</td><td>${v.source}</td><td>${v.page}</td><td>${v.referrer}</td></tr>`).join('') || '<tr><td colspan="4">No visits yet.</td></tr>';
  }
}
function renderAdminSettings() {
  const email = document.getElementById('adminSupportEmail');
  const text = document.getElementById('adminSupportText');
  if (email) email.value = adminSettings.supportEmail || '';
  if (text) text.value = adminSettings.supportText || '';
}
function saveAdminSettings() {
  adminSettings.supportEmail = document.getElementById('adminSupportEmail').value.trim();
  adminSettings.supportText = document.getElementById('adminSupportText').value.trim();
  saveJSON(ADMIN_SETTINGS_KEY, adminSettings);
  addLog('Mail/support website text updated', 'settings');
  toast('Settings saved');
}
function addLog(details, type = 'system') { logs.unshift({ time: new Date().toLocaleString(), type, details }); logs = logs.slice(0, 300); saveJSON(LOGS_KEY, logs); renderLogs() }
function renderLogs() { document.getElementById('logsTable').innerHTML = logs.map(l => `<tr><td>${l.time}</td><td>${l.type}</td><td>${l.details}</td></tr>`).join('') || '<tr><td colspan="3">No logs yet.</td></tr>' }
function clearLogs() { logs = []; saveJSON(LOGS_KEY, logs); renderLogs() }
function exportLogs() { const blob = new Blob([JSON.stringify({ logs, visitorAnalytics, productAnalytics, orders, signups, products }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'royalclue-admin-export.json'; a.click() }
function scrollAdminPanel(id) { document.getElementById(id).scrollIntoView({ behavior: 'smooth' }) }
function randomSaleTime() {
  const minMinutes = 10;
  const maxMinutes = 7 * 24 * 60;
  const minutesAgo = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
  if (minutesAgo < 60) return `${minutesAgo} min ago`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo <= 6) return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
  return new Date(Date.now() - minutesAgo * 60000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function renderLive() { const names = ['Sahil M.', 'Riya K.', 'Ahmed K.', 'Tanvir R.', 'Maya S.', 'Jason P.', 'Agency Pro']; const list = products.slice(0, 9); document.getElementById('liveFeed').innerHTML = list.slice(0, 6).map((p, i) => `<div class="live-item"><div class="live-avatar">${names[i][0]}</div><div><b>${names[i]}</b><p>bought ${p.name}</p></div><span class="live-time">${randomSaleTime()}</span></div>`).join(''); updateLiveTicker() }
function updateLiveTicker() { const ticker = document.getElementById('liveTickerTrack'); if (!ticker) return; const tickerHTML = orders.slice(0, 10).map(o => { const name = o.buyer.split('@')[0]; const item = (o.items || [])[0] || 'Account'; return `<div class="live-ticker-item"><span class="ticker-dot"></span><span class="ticker-name">${name}</span><span class="ticker-product">→ ${item}</span><span class="ticker-time">now</span></div>`; }).join('') + orders.slice(0, 10).map(o => { const name = o.buyer.split('@')[0]; const item = (o.items || [])[0] || 'Account'; return `<div class="live-ticker-item"><span class="ticker-dot"></span><span class="ticker-name">${name}</span><span class="ticker-product">→ ${item}</span><span class="ticker-time">now</span></div>`; }).join(''); ticker.innerHTML = tickerHTML }
function salePop() { const p = products[Math.floor(Math.random() * products.length)]; const names = ['Ahmed K.', 'Priya S.', 'Rafi H.', 'Neil D.', 'Sara A.']; document.getElementById('popupName').textContent = names[Math.floor(Math.random() * names.length)]; document.getElementById('popupItem').textContent = 'just bought ' + p.name; document.getElementById('popupIcon').textContent = p.brand[0]; document.getElementById('popupTime').textContent = randomSaleTime() + ' · Bangladesh'; document.getElementById('salePopup').classList.add('show'); setTimeout(() => document.getElementById('salePopup').classList.remove('show'), 4200) }
let adminSecretBuffer = '';
let villainWindowTimer = null;
let villainWindowOpen = false;
let adminAudioCtx = null;
let adminMusicTimer = null;
let adminMusicOn = false;
function playAdminTone(freq = 440, duration = .12) {
  try {
    adminAudioCtx = adminAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = adminAudioCtx.createOscillator();
    const gain = adminAudioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(.0001, adminAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.045, adminAudioCtx.currentTime + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, adminAudioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(adminAudioCtx.destination);
    osc.start(); osc.stop(adminAudioCtx.currentTime + duration + .03);
  } catch (err) { }
}
function startAdminMusic() {
  const frame = document.getElementById('ownerMusicFrame');
  if (frame && !frame.src) { frame.src = 'https://www.youtube.com/embed/nFBIezdPy6o?autoplay=1&loop=1&playlist=nFBIezdPy6o&controls=0&modestbranding=1'; }
  if (adminMusicOn) return;
  adminMusicOn = true;
  const notes = [392, 494, 587, 659, 587, 494, 440, 523];
  let i = 0;
  playAdminTone(392, .18);
  adminMusicTimer = setInterval(() => { if (!adminMusicOn) return; playAdminTone(notes[i++ % notes.length], .16); }, 520);
}
function stopAdminMusic() {
  const frame = document.getElementById('ownerMusicFrame');
  if (frame) frame.src = '';
  adminMusicOn = false;
  if (adminMusicTimer) { clearInterval(adminMusicTimer); adminMusicTimer = null; }
}
function openVillainUnlockWindow() {
  villainWindowOpen = true;
  clearTimeout(villainWindowTimer);
  startAdminMusic();
  openAdminLogin();
  const hint = document.getElementById('adminUnlockHint');
  if (hint) hint.textContent = 'First word accepted. Type “mind” within 5 seconds or the gate locks again.';
  toast('Admin gate opened: type mind in 5 seconds');
  villainWindowTimer = setTimeout(() => {
    villainWindowOpen = false;
    adminSecretBuffer = '';
    const hint = document.getElementById('adminUnlockHint');
    if (hint) hint.textContent = 'Gate closed. Type villain again to restart.';
    if (!isAdminUnlocked()) stopAdminMusic();
  }, 5000);
}
document.addEventListener('keydown', function (e) {
  if (e.key.length !== 1) return;
  adminSecretBuffer = (adminSecretBuffer + e.key.toLowerCase()).slice(-7);
  if (adminSecretBuffer.endsWith('villain')) {
    adminSecretBuffer = '';
    openVillainUnlockWindow();
    return;
  }
  if (villainWindowOpen && adminSecretBuffer.endsWith('mind')) {
    clearTimeout(villainWindowTimer);
    villainWindowOpen = false;
    adminSecretBuffer = '';
    unlockAdminDashboard();
  }
});
window.addEventListener('load', function () {
  if (location.hash === '#2026' || location.hash === '#villain') openAdminLogin();
});

function formatSupportTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function saveSupportChat() {
  saveJSON(SUPPORT_CHAT_KEY, supportChat);
}
function renderSupportMessages() {
  const box = document.getElementById('supportMessages');
  if (!box) return;
  box.innerHTML = supportChat.map(m => `<div class="support-msg ${m.sender}">${m.text}<small>${m.sender === 'bot' ? 'Support' : 'You'} · ${m.time}</small></div>`).join('');
  box.scrollTop = box.scrollHeight;
}
function addSupportMessage(text, sender = 'bot') {
  supportChat.push({ text, sender, time: formatSupportTime() });
  supportChat = supportChat.slice(-80);
  saveSupportChat();
  renderSupportMessages();
}
function ensureSupportWelcome() {
  if (!supportChat.length) {
    const name = currentUser?.name ? currentUser.name.split(' ')[0] : 'there';
    addSupportMessage(`Hi ${name}! Welcome to RoyalClue support. Ask about price, stock, payment, delivery or login.`, 'bot');
  }
}
function toggleSupportChat() {
  const panel = document.getElementById('supportPanel');
  if (!panel) return;
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    ensureSupportWelcome();
    renderSupportMessages();
    setTimeout(() => document.getElementById('supportInput')?.focus(), 80);
  }
}
function closeSupportChat() {
  document.getElementById('supportPanel')?.classList.remove('open');
}
function sendQuickSupport(topic) {
  const map = {
    price: 'What is the current price?',
    stock: 'Is this product in stock?',
    payment: 'How can I pay?',
    delivery: 'How long is delivery?'
  };
  const input = document.getElementById('supportInput');
  if (input) input.value = map[topic] || topic;
  sendSupportMessage();
}
function detectTopProduct() {
  return [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0))[0] || products[0];
}
function getSupportReply(message) {
  const text = (message || '').toLowerCase();
  const top = detectTopProduct();
  const supportEmail = adminSettings.supportEmail || 'support@royalclue.com';
  const deliveryText = adminSettings.supportText || 'Admin verifies payment and sends delivery update by email.';
  if (/hello|hi|hey|assalamu|support/.test(text)) return `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! How can I help you today?`;
  if (/price|cost|rate|discount/.test(text)) return `You can choose Single or Resell/Bulk pricing from the product cards. Right now one of the top selling products is ${top?.name || 'our premium plan'} starting from $${top?.price || '-'} for single buyers.`;
  if (/stock|available|availability/.test(text)) return `${top?.name || 'Most popular product'} is currently showing ${top?.stock || 'live'} stock on the website. Stock updates live from admin dashboard.`;
  if (/payment|pay|crypto|wallet|usdt|btc|eth|trx|binance/.test(text)) return `We accept crypto payments like USDT, BTC, ETH and BNB. Open any order/payment page and you will see the live wallet address. For help contact ${supportEmail}.`;
  if (/delivery|deliver|time|when|how long/.test(text)) return `Standard delivery time is usually 1–6 hours after payment verification. ${deliveryText}`;
  if (/login|sign up|signup|account/.test(text)) return `Use Sign Up first to create your buyer account. After that you can log in with your signup email from the Login page.`;
  if (/source|referral|where/.test(text)) return `We also track visitor sources for admin analytics, so campaigns from Facebook, Telegram, Google or direct visits can be monitored.`;
  if (/human|agent|real person|manual/.test(text)) return `This is auto support right now. You can still leave your message and the admin can follow up using the contact details from your signup/order.`;
  return `Thanks for your message. For quick help, ask me about price, stock, payment, delivery or login. You can also place your order and admin will review it.`;
}
function sendSupportMessage() {
  const input = document.getElementById('supportInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  addSupportMessage(text, 'user');
  input.value = '';
  addLog(`Support chat message: ${text}`, 'support');
  const reply = getSupportReply(text);
  setTimeout(() => addSupportMessage(reply, 'bot'), 650);
}

function openCatalogMenu() {
  const mega = document.getElementById('catalogMega');
  const btn = document.querySelector('.catalog-nav-btn');
  if (!mega) return;
  showStore();
  mega.classList.add('show');
  btn?.classList.add('active');
}
function closeCatalogMenu() {
  document.getElementById('catalogMega')?.classList.remove('show');
  document.querySelector('.catalog-nav-btn')?.classList.remove('active');
}
function toggleCatalogMenu(event) {
  if (event) event.stopPropagation();
  const mega = document.getElementById('catalogMega');
  if (!mega) return;
  if (mega.classList.contains('show')) closeCatalogMenu();
  else openCatalogMenu();
}
function catalogJump(category, keyword) {
  filter = category || 'All';
  const input = document.getElementById('searchInput');
  if (input) input.value = keyword || '';
  closeCatalogMenu();
  showStore();
  renderFilters();
  renderProducts();
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  toast(`Showing ${category} catalog`);
}
function scrollCatalogResources() {
  closeCatalogMenu();
  document.getElementById('siteFooter')?.scrollIntoView({ behavior: 'smooth' });
}
document.addEventListener('click', function (e) {
  const mega = document.getElementById('catalogMega');
  if (!mega || !mega.classList.contains('show')) return;
  if (!mega.contains(e.target) && !e.target.closest('.catalog-nav-btn')) {
    closeCatalogMenu();
  }
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeCatalogMenu();
});

function openCoddyCatalog(tab = 'catalog') {
  const catalog = document.getElementById('coddyCatalog');
  if (!catalog) return;
  catalog.classList.add('show');
  document.body.classList.add('catalog-open');
  const tabs = document.querySelectorAll('.coddy-tab');
  tabs.forEach(t => t.classList.remove('active'));
  if (tab === 'resources') tabs[1]?.classList.add('active');
  else tabs[0]?.classList.add('active');
  const navBtns = document.querySelectorAll('.nav-catalog-btn');
  navBtns.forEach(b => b.classList.remove('active'));
  if (tab === 'resources') navBtns[1]?.classList.add('active');
  else navBtns[0]?.classList.add('active');
  updateCatalogToggleSymbol();
}
function closeCoddyCatalog() {
  const catalog = document.getElementById('coddyCatalog');
  if (catalog) catalog.classList.remove('show');
  document.body.classList.remove('catalog-open');
  document.querySelectorAll('.nav-catalog-btn').forEach(b => b.classList.remove('active'));
  updateCatalogToggleSymbol();
}
function toggleCoddyCatalog(event, tab = 'catalog') {
  if (event) event.stopPropagation();
  const catalog = document.getElementById('coddyCatalog');
  if (!catalog) return;
  const isOpen = catalog.classList.contains('show');
  const activeTab = document.querySelector('.coddy-tab.active');
  const wantResources = tab === 'resources';
  const activeIsResources = activeTab && activeTab.textContent.toLowerCase().includes('resources');
  if (isOpen && (wantResources === activeIsResources)) {
    closeCoddyCatalog();
  } else {
    showStore();
    openCoddyCatalog(tab);
  }
}
function scrollToCoddyCatalog() {
  showStore();
  openCoddyCatalog('catalog');
}
function scrollToCatalogResources() {
  showStore();
  openCoddyCatalog('resources');
}
function coddyPick(category, keyword, label) {
  filter = category || 'All';
  const input = document.getElementById('searchInput');
  if (input) input.value = keyword || '';
  showStore();
  closeCoddyCatalog();
  if (typeof renderFilters === 'function') renderFilters();
  if (typeof renderProducts === 'function') renderProducts();
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (typeof toast === 'function') toast('Showing ' + (label || category || 'catalog'));
}

document.addEventListener('click', function (e) {
  const catalog = document.getElementById('coddyCatalog');
  if (!catalog || !catalog.classList.contains('show')) return;
  if (!catalog.contains(e.target) && !e.target.closest('.nav-catalog-btn') && !e.target.closest('.hero-catalog-btn')) {
    closeCoddyCatalog();
  }
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeCoddyCatalog();
})

const LANGUAGE_PLAYGROUND_DATA = {
  python: { name: 'Python', file: 'main.py', icon: 'https://www.python.org/static/community_logos/python-logo-master-v3-TM.png', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', input: 'Alice\n30', code: 'name = input()\nage = int(input())\nprint(f"Hello, {name}! You are {age} years old.")', output: 'Hello, Alice! You are 30 years old.', docs: 'Run Python online in your browser', text: 'Python is simple for beginners. Learn variables, input, conditions, loops, functions and data structures using small examples.', lessons: ['Variables and input', 'If/else conditions', 'Loops and functions'] },
  javascript: { name: 'JavaScript', file: 'main.js', icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', input: '', code: 'const name = "Alice";\nconst age = 30;\nconsole.log(`Hello, ${name}! You are ${age} years old.`);', output: 'Hello, Alice! You are 30 years old.', docs: 'Learn JavaScript basics', text: 'JavaScript powers interactive websites. Start with variables, functions, arrays, objects and DOM events.', lessons: ['let, const and variables', 'Functions and arrays', 'DOM click events'] },
  java: { name: 'Java', file: 'Main.java', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original-wordmark.svg', input: '', code: 'public class Main {\n  public static void main(String[] args) {\n    String name = "Alice";\n    int age = 30;\n    System.out.println("Hello, " + name + "! You are " + age + " years old.");\n  }\n}', output: 'Hello, Alice! You are 30 years old.', docs: 'Learn Java basics', text: 'Java is used for backend, Android and enterprise apps. Begin with classes, methods, variables and loops.', lessons: ['Class and main method', 'Data types', 'Loops and methods'] },
  cpp: { name: 'C++', file: 'main.cpp', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-line.svg', input: 'Alice\n30', code: '#include <iostream>\nusing namespace std;\n\nint main() {\n  string name;\n  int age;\n  cin >> name >> age;\n  cout << "Hello, " << name << "! You are " << age << " years old.";\n  return 0;\n}', output: 'Hello, Alice! You are 30 years old.', docs: 'Learn C++ basics', text: 'C++ is powerful for DSA, competitive programming and system-level development.', lessons: ['cin and cout', 'If/else and loops', 'Arrays and functions'] },
  typescript: { name: 'TypeScript', file: 'main.ts', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-plain.svg', input: '', code: 'const name: string = "Alice";\nconst age: number = 30;\nconsole.log(`Hello, ${name}! You are ${age} years old.`);', output: 'Hello, Alice! You are 30 years old.', docs: 'Learn TypeScript basics', text: 'TypeScript adds types to JavaScript, helping you write safer frontend and backend code.', lessons: ['Basic types', 'Interfaces', 'Typed functions'] },
  c: { name: 'C', file: 'main.c', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-line.svg', input: '', code: '#include <stdio.h>\n\nint main() {\n  char name[] = "Alice";\n  int age = 30;\n  printf("Hello, %s! You are %d years old.", name, age);\n  return 0;\n}', output: 'Hello, Alice! You are 30 years old.', docs: 'Learn C basics', text: 'C teaches programming fundamentals like memory, pointers, arrays and functions.', lessons: ['printf and variables', 'Loops', 'Arrays and pointers'] },
  csharp: { name: 'C#', file: 'Program.cs', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-line.svg', input: '', code: 'string name = "Alice";\nint age = 30;\nConsole.WriteLine($"Hello, {name}! You are {age} years old.");', output: 'Hello, Alice! You are 30 years old.', docs: 'Learn C# basics', text: 'C# is popular for .NET apps, backend services, games and desktop software.', lessons: ['Variables', 'Classes', 'Methods'] },
  go: { name: 'Go', file: 'main.go', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg', input: '', code: 'package main\n\nimport "fmt"\n\nfunc main() {\n  name := "Alice"\n  age := 30\n  fmt.Printf("Hello, %s! You are %d years old.", name, age)\n}', output: 'Hello, Alice! You are 30 years old.', docs: 'Learn Go basics', text: 'Go is clean and fast for backend APIs, CLIs and cloud services.', lessons: ['fmt package', 'Functions', 'Structs'] },
  ruby: { name: 'Ruby', file: 'main.rb', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-plain.svg', input: '', code: 'name = "Alice"\nage = 30\nputs "Hello, #{name}! You are #{age} years old."', output: 'Hello, Alice! You are 30 years old.', docs: 'Learn Ruby basics', text: 'Ruby is readable and friendly, often used with Rails for web development.', lessons: ['Variables', 'Blocks', 'Methods'] },
  rust: { name: 'Rust', file: 'main.rs', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg', input: '', code: 'fn main() {\n  let name = "Alice";\n  let age = 30;\n  println!("Hello, {}! You are {} years old.", name, age);\n}', output: 'Hello, Alice! You are 30 years old.', docs: 'Learn Rust basics', text: 'Rust focuses on memory safety and performance without a garbage collector.', lessons: ['let and mut', 'Ownership idea', 'Functions'] },
  php: { name: 'PHP', file: 'index.php', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-plain.svg', input: '', code: '<?php\n$name = "Alice";\n$age = 30;\necho "Hello, $name! You are $age years old.";\n?>', output: 'Hello, Alice! You are 30 years old.', docs: 'Learn PHP basics', text: 'PHP is widely used for server-side websites and WordPress development.', lessons: ['Variables', 'Echo output', 'Forms'] },
  dart: { name: 'Dart', file: 'main.dart', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-plain.svg', input: '', code: 'void main() {\n  String name = "Alice";\n  int age = 30;\n  print("Hello, $name! You are $age years old.");\n}', output: 'Hello, Alice! You are 30 years old.', docs: 'Learn Dart basics', text: 'Dart is used with Flutter to build mobile, web and desktop apps.', lessons: ['Variables', 'Functions', 'Classes'] },
  lua: { name: 'Lua', file: 'main.lua', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/lua/lua-original.svg', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/lua/lua-plain.svg', input: '', code: 'local name = "Alice"\nlocal age = 30\nprint("Hello, " .. name .. "! You are " .. age .. " years old.")', output: 'Hello, Alice! You are 30 years old.', docs: 'Learn Lua basics', text: 'Lua is lightweight and often used in games, scripting and embedded systems.', lessons: ['Variables', 'Tables', 'Functions'] },
  swift: { name: 'Swift', file: 'main.swift', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-plain.svg', input: '', code: 'let name = "Alice"\nlet age = 30\nprint("Hello, \\(name)! You are \\(age) years old.")', output: 'Hello, Alice! You are 30 years old.', docs: 'Learn Swift basics', text: 'Swift is used for iOS, macOS and Apple ecosystem development.', lessons: ['let and var', 'Functions', 'Structs'] },
  web: { name: 'Web', file: 'index.html', icon: 'https://www.w3.org/html/logo/downloads/HTML5_Logo_512.png', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', input: '', code: '<h1>Hello, Alice!</h1>\n<p>You are learning HTML + CSS.</p>\n<style>\n  h1 { color: #1d91c5; }\n</style>', output: 'Preview: Hello, Alice! You are learning HTML + CSS.', docs: 'Learn Web basics', text: 'Web development starts with HTML structure, CSS styling and JavaScript interaction.', lessons: ['HTML tags', 'CSS selectors', 'Simple layout'] },
  sql: { name: 'SQL', file: 'query.sql', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg', input: '', code: 'CREATE TABLE users (name TEXT, age INT);\nINSERT INTO users VALUES ("Alice", 30);\nSELECT * FROM users;', output: 'name   age\nAlice  30', docs: 'Learn SQL basics', text: 'SQL is used to create, read, update and analyze data in databases.', lessons: ['SELECT queries', 'WHERE filter', 'GROUP BY'] },
  r: { name: 'R', file: 'main.r', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/r/r-original.svg', fallbackIcon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/r/r-plain.svg', input: '', code: 'name <- "Alice"\nage <- 30\ncat("Hello,", name, "! You are", age, "years old.")', output: 'Hello, Alice ! You are 30 years old.', docs: 'Learn R basics', text: 'R is strong for statistics, data analysis and visualization.', lessons: ['Vectors', 'Data frames', 'Plots'] },
  terminal: { name: 'Terminal', file: 'commands.sh', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg', fallbackIcon: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Terminal_icon.svg', input: '', code: 'echo "Hello, Alice!"\npwd\nls', output: 'Hello, Alice!\n/home/user\nmain.py  notes.txt', docs: 'Learn Terminal basics', text: 'Terminal commands help you navigate folders, run tools and manage projects.', lessons: ['pwd and ls', 'cd command', 'Running scripts'] },
  verilog: { name: 'Verilog', file: 'main.v', icon: 'assets/logos/verilog.svg', fallbackIcon: 'assets/logos/verilog.svg', input: '', code: 'module hello;\n  initial begin\n    $display("Hello, Verilog learner!");\n  end\nendmodule', output: 'Hello, Verilog learner!', docs: 'Learn Verilog basics', text: 'Verilog is used to describe digital circuits and hardware behavior.', lessons: ['Modules', 'initial block', 'Signals'] },
};

const LANGUAGE_ORDER = ['python', 'javascript', 'java', 'cpp', 'typescript', 'c', 'csharp', 'go', 'ruby', 'rust', 'php', 'dart', 'lua', 'swift', 'web', 'sql', 'r', 'terminal', 'verilog'];

function toggleLanguageSidebar() {
  const sidebar = document.getElementById('languageSidebar');
  const btn = sidebar?.querySelector('.sidebar-toggle');
  if (!sidebar) return;
  sidebar.classList.toggle('collapsed');
  if (btn) btn.textContent = sidebar.classList.contains('collapsed') ? '+' : '−';
}

function renderLanguageList(active = 'python') {
  const list = document.getElementById('languageList');
  if (!list) return;
  list.innerHTML = LANGUAGE_ORDER.map(key => {
    const item = LANGUAGE_PLAYGROUND_DATA[key];
    const fallback = item.fallbackIcon || item.icon;
    return `<button class="lang-row ${key === active ? 'active' : ''}" onclick="openLanguagePlayground('${key}')"><img src="${item.icon}" alt="${item.name}" onerror="this.onerror=null;this.src='${fallback}'"><span>${item.name}</span></button>`;
  }).join('');
}

let activeLanguageKey = 'python';

function updateCodeLines() {
  const code = document.getElementById('playgroundCode');
  const lines = document.getElementById('playgroundLines');
  if (!code || !lines) return;
  const count = code.value.split('\n').length || 1;
  lines.textContent = Array.from({ length: count }, (_, i) => i + 1).join('\n');
}

function openLanguagePlayground(key = 'python') {
  const data = LANGUAGE_PLAYGROUND_DATA[key] || LANGUAGE_PLAYGROUND_DATA.python;
  activeLanguageKey = key;
  closeCoddyCatalog?.();
  showStore();
  document.getElementById('languagePlayground')?.classList.add('show');
  renderLanguageList(key);
  document.getElementById('playgroundTitle').textContent = data.name + ' Playground';
  document.getElementById('playgroundSubtitle').textContent = 'Write, run, and learn basic code snippets — no setup required.';
  document.getElementById('playgroundFile').textContent = data.file;
  document.getElementById('playgroundInput').value = data.input || '';
  document.getElementById('playgroundCode').value = data.code;
  document.getElementById('playgroundOutput').textContent = 'Click Run to see the output here.';
  document.getElementById('docsTitle').textContent = data.docs;
  document.getElementById('docsText').textContent = data.text;
  document.getElementById('lessonCards').innerHTML = data.lessons.map((lesson, i) => `<div class="lesson-card"><b>${String(i + 1).padStart(2, '0')} ${lesson}</b><span>Start with this concept, edit the sample code, then press Run to understand the flow.</span></div>`).join('');
  updateCodeLines();
  document.getElementById('languagePlayground')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function runPlaygroundCode() {
  const data = LANGUAGE_PLAYGROUND_DATA[activeLanguageKey] || LANGUAGE_PLAYGROUND_DATA.python;
  const output = document.getElementById('playgroundOutput');
  if (!output) return;
  output.textContent = '⚙️ Running...\n\n' + data.output + '\n\n---\nFor live execution, connect your preferred code compiler API such as Replit, JDoodle or CodePen.';
}

function resetPlaygroundCode() {
  openLanguagePlayground(activeLanguageKey);
}

function copyPlaygroundCode() {
  const code = document.getElementById('playgroundCode')?.value || '';
  navigator.clipboard?.writeText(code);
  toast?.('Code copied');
}

function scrollPlaygroundDocs() {
  document.getElementById('playgroundDocs')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


function minimizeCoddyCatalog(event) {
  if (event) event.stopPropagation();
  closeCoddyCatalog?.();
}

function toggleCoddyFullPage(event) {
  if (event) event.stopPropagation();
  const catalog = document.getElementById('coddyCatalog');
  if (!catalog) return;
  catalog.classList.add('show');
  document.body.classList.add('catalog-open');
  catalog.classList.toggle('full-page');
  document.body.classList.toggle('catalog-full-page-open', catalog.classList.contains('full-page'));
  updateCatalogToggleSymbol();
  updateCoddyFullPageButton();
}

function updateCoddyFullPageButton() {
  const catalog = document.getElementById('coddyCatalog');
  const btn = document.getElementById('coddyFullPageBtn');
  if (!btn || !catalog) return;
  const isFull = catalog.classList.contains('full-page');
  btn.textContent = isFull ? 'Normal view' : 'Full page';
  btn.title = isFull ? 'Return to normal popup size' : 'Open full page';
}

function updateCatalogToggleSymbol() {
  const catalog = document.getElementById('coddyCatalog');
  const symbol = document.getElementById('catalogToggleSymbol');
  if (symbol) symbol.textContent = catalog && catalog.classList.contains('show') ? '−' : '+';
  updateCoddyFullPageButton();
}

function toggleCoddyCatalogBox(event) {
  if (event) event.stopPropagation();
  const catalog = document.getElementById('coddyCatalog');
  if (!catalog) return;
  if (catalog.classList.contains('show')) {
    closeCoddyCatalog?.();
  } else {
    openCoddyCatalog?.('catalog');
  }
  updateCatalogToggleSymbol();
}

function showCardUnavailable() {
  toast('Card payment is currently unavailable. Please use crypto checkout.');
}

function selectMethod(method) {
  document.querySelectorAll('.method-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.method === method);
  });
  const cryptoPanel = document.getElementById('cryptoMethodPanel');
  const cardPanel = document.getElementById('cardMethodPanel');
  if (cryptoPanel) cryptoPanel.style.display = method === 'crypto' ? 'block' : 'none';
  if (cardPanel) cardPanel.style.display = method === 'card' ? 'block' : 'none';
  const addressBox = document.getElementById('walletAddressBox');
  if (addressBox) addressBox.style.display = method === 'crypto' ? 'block' : 'none';
}

function init() {
  const pageParams = new URLSearchParams(location.search);
  const heroEl = document.getElementById('heroProducts');
  if (heroEl) heroEl.textContent = products.length + '+';
  renderFilters();
  setBuyer('single');
  renderCart();
  renderLive();
  renderAdmin();
  updateSignupUI();
  ensureSupportWelcome();
  renderSupportMessages();
  if (pageParams.get('signup') === 'success') {
    setTimeout(() => toast('Registration successful'), 250);
    if (history.replaceState) history.replaceState({}, '', location.pathname + location.hash);
  }
  setInterval(salePop, 9000);
  startAutoCategorySlider();
  setTimeout(() => {
    const hero = document.querySelector('section') || document.body.firstElementChild;
    if (hero) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
}
init();

function quickOpen(category, keyword, label) {
  if (typeof filter !== "undefined") {
    filter = category || "All";
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = keyword || "";
  }

  if (typeof renderFilters === "function") {
    renderFilters();
  }

  if (typeof renderProducts === "function") {
    renderProducts();
  }

  const productsSection = document.getElementById("products");
  if (productsSection) {
    productsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  if (typeof toast === "function") {
    toast("Showing " + label);
  }
}

document.getElementById('choice-single')?.classList.add('active-choice');

const copyrightYearEl = document.getElementById('copyrightYear');
if (copyrightYearEl) {
  copyrightYearEl.textContent = new Date().getFullYear();
}

document.addEventListener('input', function (e) { if (e.target && e.target.id === 'playgroundCode') updateCodeLines(); });
