/* =========================================================
   RoyalClue Admin Dashboard
   Shares localStorage keys with the storefront (index.html)
   so every change here is immediately visible on the site.
   ========================================================= */


const PRICE_RULES = { single: 0.50, reseller: 0.30 }; // only 2 sell rates
function roundPrice(n){ return Math.max(0, Math.round(Number(n || 0) * 100) / 100); }
function applyMarketDiscounts(product){
  const market = roundPrice(product.marketPrice || product.realPrice || (Number(product.price || 0) * 2));
  product.marketPrice = market;
  product.realPrice = market;
  product.price = roundPrice(market * PRICE_RULES.single);
  product.reseller = roundPrice(market * PRICE_RULES.reseller);
  product.bulk = product.reseller; // keep old storage key as alias, not a separate rate
  product.priceMode = 'auto-discount';
  product.priceNote = 'Single = 50% of market. Bulk/Resell = 30% of market.';
  return product;
}
function recalcOneProduct(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  applyMarketDiscounts(p);
  saveJSON(STORAGE.products, products);
  addLog(`${p.name} prices recalculated from market ${fmtMoney(p.marketPrice)}`,'pricing');
  renderAll();
  toast('Prices auto-set: single 50%, bulk/resell 30%');
}
function applyDiscountPricingAll(){
  products.forEach(applyMarketDiscounts);
  saveJSON(STORAGE.products, products);
  addLog('Applied 50% single and 70% bulk/resell discount to all products','pricing');
  renderAll();
  toast('All products repriced from market price');
}
async function syncGooglePrices(){
  const apiBase = (window.BEMADY_LOCAL_API_BASE || 'http://localhost:5000/api');
  const pwd = prompt('Enter admin backend password. Default: mind');
  if(!pwd) return;
  try{
    toast('Checking live market prices...');
    const res = await fetch(apiBase + '/sync-market-prices', {
      method:'POST',
      headers:{'Content-Type':'application/json','x-admin-password':pwd},
      body:JSON.stringify({products})
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.message || data.error || 'Price sync failed');
    const byId = new Map((data.products || []).map(p=>[String(p.id), p]));
    products = products.map(p=> byId.get(String(p.id)) || p).map(applyMarketDiscounts);
    saveJSON(STORAGE.products, products);
    addLog('Synced market prices from live search/API and applied discount rules','pricing');
    renderAll();
    toast('Live prices synced and discounted');
  }catch(err){
    alert((String(err.message||'').includes('Unauthorized') ? 'Wrong admin password. Use the same password you use to open the admin panel. Default is: mind' : 'Could not sync live prices. Add SERPAPI_KEY in backend/.env for live lookup, or manually enter Market $ then click Recalc.') + '\n\n' + err.message);
  }
}

const STORAGE = {
  products:'aurum_ai_paid_products_v1',
  orders:'aurum_ai_orders_v1',
  logs:'aurum_ai_logs_v1',
  wallets:'aurum_ai_wallets_v1',
  signups:'aurum_ai_signups_v1',
  visitors:'aurum_ai_visitor_analytics_v2',
  settings:'aurum_ai_admin_settings_v2',
  productAnalytics:'aurum_ai_product_source_analytics_v1',
  adminAuth:'aurum_ai_admin_auth_v1',
  adminPwd:'aurum_ai_admin_pwd_v1'
};

const DEFAULT_PWD = 'mind'; // legacy default — matches existing site's admin code
const COINS = ['USDT TRC20','BTC','ETH','BNB','USDC ERC20','SOL'];

/* ---------- helpers ---------- */
function loadJSON(k, fb){ try{ return JSON.parse(localStorage.getItem(k)) ?? fb }catch{ return fb } }
function saveJSON(k, v){ localStorage.setItem(k, JSON.stringify(v)) }
function $(id){ return document.getElementById(id) }
function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 2000) }
function favicon(domain){ return `https://www.google.com/s2/favicons?domain=${domain}&sz=128` }
function logoFor(p){ return p.customLogo || favicon(p.domain || p.brand) }
function randomStock(min=300,max=4000){ return Math.floor(Math.random()*(max-min+1))+min }
function fmtMoney(n){ return '$'+Number(n||0).toLocaleString(undefined,{maximumFractionDigits:2}) }
function escapeHtml(s){ return String(s??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }

/* ---------- state ---------- */
let products = loadJSON(STORAGE.products, []).map(applyMarketDiscounts);
saveJSON(STORAGE.products, products);
let orders   = loadJSON(STORAGE.orders, []);
let logs     = loadJSON(STORAGE.logs, []);
let wallets  = loadJSON(STORAGE.wallets, {});
let signups  = loadJSON(STORAGE.signups, []);
let visitors = loadJSON(STORAGE.visitors, {total:0, today:{}, sources:{}, pages:[], lastVisits:[]});
let settings = loadJSON(STORAGE.settings, {supportEmail:'support@royalclue.com', supportText:'Admin will verify payment and deliver by email.', defaultStockMin:300, defaultStockMax:4000});
let productAnalytics = loadJSON(STORAGE.productAnalytics, {products:{}, events:[]});

let salesRange = 7;
let orderStatusFilter = 'all';
let productCatFilter = 'All';
let activeTier = 'single';
let selectedProducts = new Set();
let selectedTier = { single:new Set(), reseller:new Set() };
let globalSearchText = '';

/* ---------- AUTH GATE ---------- */
async function sha256(text){
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
async function getStoredPwdHash(){
  let h = loadJSON(STORAGE.adminPwd, null);
  if(!h){
    h = await sha256(DEFAULT_PWD);
    saveJSON(STORAGE.adminPwd, h);
  }
  return h;
}
async function tryUnlock(){
  const v = $('adminPwd').value;
  const err = $('authErr');
  if(!v){ err.textContent='Enter the secret code'; return }
  const stored = await getStoredPwdHash();
  const test = await sha256(v);
  if(test === stored){
    sessionStorage.setItem(STORAGE.adminAuth, '1');
    localStorage.setItem(STORAGE.adminAuth, '1');
    err.textContent='';
    initShell();
  } else {
    err.textContent='Wrong secret. Try again.';
    $('adminPwd').value='';
    $('adminPwd').focus();
  }
}
function adminLogout(){
  sessionStorage.removeItem(STORAGE.adminAuth);
  localStorage.removeItem(STORAGE.adminAuth);
  location.reload();
}
async function changeAdminPwd(){
  const a = $('newPwd').value.trim();
  const b = $('confirmPwd').value.trim();
  if(!a){ toast('Enter a new password'); return }
  if(a.length<4){ toast('Use at least 4 characters'); return }
  if(a!==b){ toast('Passwords do not match'); return }
  const hash = await sha256(a);
  saveJSON(STORAGE.adminPwd, hash);
  $('newPwd').value=''; $('confirmPwd').value='';
  addLog('Admin password updated','admin');
  toast('Admin password updated');
}

/* ---------- INIT SHELL ---------- */
function initShell(){
  $('authGate').style.display='none';
  $('shell').style.display='grid';
  bindNav();
  renderAll();
}

function bindNav(){
  document.querySelectorAll('.nav-btn[data-section]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const id = btn.dataset.section;
      document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
      $('section-'+id).classList.add('active');
      $('pageTitle').textContent = btn.textContent.trim().replace(/\d+$/,'').trim();
      if(id==='overview') renderOverview();
      if(id==='analytics') renderAnalytics();
    });
  });
}

/* ---------- RENDER ALL ---------- */
function renderAll(){
  // KPI / nav counts
  $('navOrders').textContent = orders.length;
  $('navSignups').textContent = signups.length;
  $('navProducts').textContent = products.length;
  $('welcomeName').textContent = 'Admin';

  renderOverview();
  renderOrders();
  renderSignups();
  renderProducts();
  renderPricingTiers();
  renderStock();
  renderAnalytics();
  renderSources();
  renderWallets();
  renderSettings();
  renderLogs();
}

/* ---------- OVERVIEW ---------- */
function renderOverview(){
  const pending = orders.filter(o=>o.status==='Pending').length;
  const revenue = orders.filter(o=>['Approved','Delivered'].includes(o.status)).reduce((s,o)=>s+Number(o.total||0),0);
  const today = new Date().toISOString().slice(0,10);
  const newCustToday = signups.filter(s=>(s.time||'').includes(new Date().toLocaleDateString())).length;

  $('kpiRevenue').textContent = fmtMoney(revenue);
  $('kpiOrders').textContent = orders.length;
  $('kpiPending').textContent = pending;
  $('kpiCustomers').textContent = signups.length;
  $('kpiOrdersDelta').textContent = orders.filter(o=>!o.status || o.status==='Pending').length;
  $('kpiCustDelta').textContent = newCustToday;

  // Revenue delta (compare last 7 vs previous 7)
  const now = Date.now();
  const day = 24*3600*1000;
  const sumIn = (start, end) => orders.filter(o=>{
    const t = new Date(o.time||o.createdAt||0).getTime();
    return t>=start && t<end && ['Approved','Delivered'].includes(o.status);
  }).reduce((s,o)=>s+Number(o.total||0),0);
  const wk = sumIn(now-7*day, now);
  const prev = sumIn(now-14*day, now-7*day);
  const delta = prev ? Math.round((wk-prev)/prev*100) : (wk?100:0);
  $('kpiRevDelta').textContent = (delta>=0?'+':'') + delta + '%';
  document.querySelector('#kpiRevDelta').closest('.delta').classList.toggle('down', delta<0);

  drawSalesChart();
  drawSourceChart();
  drawProductChart();
  renderActivityFeed();
}

let salesChart=null, sourceChart=null, productChart=null, viewsClicksChart=null, catMixChart=null;
function setRange(days, e){
  salesRange = days;
  document.querySelectorAll('#section-overview .btn-ghost.btn-small').forEach(b=>b.classList.remove('active'));
  if(e) e.target.classList.add('active');
  drawSalesChart();
}
function drawSalesChart(){
  const days = salesRange;
  const labels = [];
  const data = [];
  const now = Date.now();
  for(let i=days-1;i>=0;i--){
    const d = new Date(now - i*24*3600*1000);
    labels.push(d.toLocaleDateString(undefined, {month:'short', day:'numeric'}));
    const dateStr = d.toLocaleDateString();
    const total = orders.filter(o=>(o.time||'').includes(dateStr) && ['Approved','Delivered'].includes(o.status))
      .reduce((s,o)=>s+Number(o.total||0),0);
    data.push(total);
  }
  if(salesChart) salesChart.destroy();
  const ctx = $('salesChart').getContext('2d');
  const grad = ctx.createLinearGradient(0,0,0,260);
  grad.addColorStop(0,'rgba(245,197,66,.45)');
  grad.addColorStop(1,'rgba(245,197,66,0)');
  salesChart = new Chart(ctx, {
    type:'line',
    data:{ labels, datasets:[{ label:'Revenue ($)', data, borderColor:'#f5c542', backgroundColor:grad, fill:true, tension:.35, pointBackgroundColor:'#ffe08a', pointRadius:3 }] },
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false} },
      scales:{ x:{grid:{color:'rgba(245,197,66,.06)'}, ticks:{color:'#a39b82'}}, y:{grid:{color:'rgba(245,197,66,.06)'}, ticks:{color:'#a39b82', callback:v=>'$'+v}} }
    }
  });
}
function drawSourceChart(){
  const src = visitors.sources || {};
  const entries = Object.entries(src).sort((a,b)=>b[1]-a[1]).slice(0,6);
  if(entries.length===0) entries.push(['Direct',1]);
  if(sourceChart) sourceChart.destroy();
  sourceChart = new Chart($('sourceChart').getContext('2d'), {
    type:'doughnut',
    data:{ labels:entries.map(e=>e[0]), datasets:[{ data:entries.map(e=>e[1]), backgroundColor:['#f5c542','#ffe08a','#60a5fa','#a78bfa','#22c55e','#fb7185'], borderColor:'#0a0a06', borderWidth:2 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{position:'right', labels:{color:'#f7f2df', font:{size:11}}} }, cutout:'62%' }
  });
}
function drawProductChart(){
  const perf = productMetricsList().sort((a,b)=>b.sales-a.sales).slice(0,8);
  if(productChart) productChart.destroy();
  productChart = new Chart($('productChart').getContext('2d'), {
    type:'bar',
    data:{ labels: perf.map(p=>p.name), datasets:[
      { label:'Sales', data:perf.map(p=>p.sales), backgroundColor:'#f5c542' },
      { label:'Clicks', data:perf.map(p=>p.clicks), backgroundColor:'rgba(96,165,250,.7)' }
    ]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:'#f7f2df'}}},
      scales:{ x:{grid:{display:false}, ticks:{color:'#a39b82', font:{size:10}}}, y:{grid:{color:'rgba(245,197,66,.06)'}, ticks:{color:'#a39b82'}} }
    }
  });
}

function productMetricsList(){
  return products.map(p=>{
    const m = (productAnalytics.products && productAnalytics.products[String(p.id)]) || {};
    const sources = m.sources || {};
    const topSource = Object.entries(sources).sort((a,b)=>(b[1].views+b[1].clicks+b[1].sales)-(a[1].views+a[1].clicks+a[1].sales))[0]?.[0] || '-';
    return {
      id:p.id, name:p.name, brand:p.brand,
      views: m.views || p.views || 0,
      clicks: m.clicks || p.clicks || 0,
      sales: m.sales || 0,
      revenue: m.revenue || 0,
      sold: p.sold || 0,
      topSource
    };
  });
}

function renderActivityFeed(){
  const feed = $('activityFeed');
  const events = (logs||[]).slice(0,30);
  if(!events.length){ feed.innerHTML='<div class="empty">No activity yet.</div>'; return }
  feed.innerHTML = events.map(l=>`
    <div class="activity-item ${(l.type||'').toLowerCase()}">
      <span class="dot"></span>
      <div><p>${escapeHtml(l.details||'')}</p><small>${escapeHtml(l.time||'')} · ${escapeHtml(l.type||'')}</small></div>
    </div>
  `).join('');
}

/* ---------- ORDERS ---------- */
function filterOrders(status, e){
  orderStatusFilter = status;
  document.querySelectorAll('#orderFilters button').forEach(b=>b.classList.remove('active'));
  if(e) e.target.classList.add('active');
  renderOrders();
}
function renderOrders(){
  const tbody = $('ordersTable');
  let list = orders;
  if(orderStatusFilter!=='all') list = list.filter(o=>o.status===orderStatusFilter);
  if(globalSearchText){
    const q = globalSearchText.toLowerCase();
    list = list.filter(o => (o.id||'').toLowerCase().includes(q) || (o.buyer||'').toLowerCase().includes(q) || (o.items||[]).join(' ').toLowerCase().includes(q));
  }
  if(!list.length){ tbody.innerHTML='<tr><td colspan="10" class="empty">No orders yet.</td></tr>'; return }
  tbody.innerHTML = list.map(o=>`<tr>
    <td><span style="font-family:var(--mono);font-size:11px">${escapeHtml(o.id||'')}</span></td>
    <td>${escapeHtml(o.buyer||'-')}</td>
    <td>${escapeHtml(o.type||'-')}</td>
    <td style="max-width:220px;white-space:normal;font-size:12px;color:var(--muted)">${escapeHtml((o.items||[]).join(', '))}</td>
    <td><b>${fmtMoney(o.total)}</b></td>
    <td>${escapeHtml(o.payment||'')}</td>
    <td style="font-family:var(--mono);font-size:11px;max-width:140px;overflow:hidden;text-overflow:ellipsis">${escapeHtml(o.tx||'')}</td>
    <td>${escapeHtml(o.source||o.buyerProfile?.source||'-')}</td>
    <td><span class="status ${(o.status||'').toLowerCase()}">${escapeHtml(o.status||'Pending')}</span></td>
    <td>
      <button class="btn btn-success btn-small" onclick="setOrderStatus('${o.id}','Approved')">✓</button>
      <button class="btn btn-ghost btn-small" onclick="setOrderStatus('${o.id}','Delivered')">↑</button>
      <button class="btn btn-danger btn-small" onclick="setOrderStatus('${o.id}','Rejected')">✕</button>
    </td>
  </tr>`).join('');
}
function setOrderStatus(id, status){
  const o = orders.find(x=>x.id===id);
  if(!o) return;
  o.status = status;
  saveJSON(STORAGE.orders, orders);
  addLog(`Order ${id} marked ${status}`,'order');
  renderAll();
}
function clearOrders(){
  if(!confirm('Clear all orders?')) return;
  orders = [];
  saveJSON(STORAGE.orders, orders);
  addLog('Orders cleared','admin');
  renderAll();
}
function exportOrders(){ downloadCSV('orders.csv', orders, ['id','buyer','type','total','payment','tx','status','time','source']) }

/* ---------- SIGNUPS ---------- */
function renderSignups(){
  const tbody = $('signupsTable');
  let list = signups;
  if(globalSearchText){
    const q = globalSearchText.toLowerCase();
    list = list.filter(s => (s.name||'').toLowerCase().includes(q) || (s.email||'').toLowerCase().includes(q));
  }
  if(!list.length){ tbody.innerHTML='<tr><td colspan="8" class="empty">No customers yet.</td></tr>'; return }
  tbody.innerHTML = list.map(u=>`<tr>
    <td><b>${escapeHtml(u.name||'-')}</b></td>
    <td>${escapeHtml(u.email||'-')}</td>
    <td>${escapeHtml(u.role||'-')}</td>
    <td style="max-width:240px;white-space:normal;font-size:12px">${escapeHtml(u.looking||'')}<br><small style="color:var(--muted)">${escapeHtml(u.note||'')}</small></td>
    <td>${escapeHtml(u.budget||'-')}</td>
    <td>${escapeHtml(u.source||'-')}</td>
    <td>${escapeHtml(u.contact||'-')}</td>
    <td><small>${escapeHtml(u.time||'-')}</small></td>
  </tr>`).join('');
}
function clearSignups(){
  if(!confirm('Clear all customers?')) return;
  signups = [];
  saveJSON(STORAGE.signups, signups);
  addLog('Customers cleared','admin');
  renderAll();
}
function exportSignups(){ downloadCSV('customers.csv', signups, ['name','email','role','looking','budget','source','contact','time']) }

/* ---------- PRODUCTS ---------- */
function renderProducts(){
  // Category filters
  const cats = ['All', ...new Set(products.map(p=>p.cat))];
  $('productCatFilters').innerHTML = cats.map(c=>{
    const count = c==='All' ? products.length : products.filter(p=>p.cat===c).length;
    return `<button class="${productCatFilter===c?'active':''}" onclick="setProductCatFilter('${c}', event)">${c} <span style="opacity:.7">${count}</span></button>`;
  }).join('');

  const tbody = $('productsTable');
  let list = products;
  if(productCatFilter!=='All') list = list.filter(p=>p.cat===productCatFilter);
  if(globalSearchText){
    const q = globalSearchText.toLowerCase();
    list = list.filter(p => (p.name||'').toLowerCase().includes(q) || (p.brand||'').toLowerCase().includes(q));
  }
  if(!list.length){ tbody.innerHTML='<tr><td colspan="11" class="empty">No products.</td></tr>'; updateSelCount(); return }

  tbody.innerHTML = list.map(p=>{
    const sales = productAnalytics.products?.[String(p.id)]?.sales || 0;
    const isSel = selectedProducts.has(p.id);
    return `<tr class="${isSel?'selected':''}">
      <td><input type="checkbox" class="checkbox" ${isSel?'checked':''} onchange="toggleProductSel(${p.id}, this.checked)"></td>
      <td><div class="logo-img"><img src="${logoFor(p)}" alt="${escapeHtml(p.brand)}" onerror="this.style.display='none'"></div></td>
      <td><input value="${escapeHtml(p.name)}" onchange="updateProduct(${p.id},'name',this.value)"><small style="color:var(--muted);display:block;margin-top:3px"><input style="padding:3px 7px;font-size:11px;color:var(--muted)" value="${escapeHtml(p.brand)}" onchange="updateProduct(${p.id},'brand',this.value)"></small></td>
      <td><select onchange="updateProduct(${p.id},'cat',this.value)">${['AI','Coding','Automation','Design','Video','Voice','Productivity','Marketing','Research','Writing'].map(c=>`<option ${p.cat===c?'selected':''}>${c}</option>`).join('')}</select></td>
      <td><div class="row-price"><span class="currency">$</span><input type="number" step="0.01" value="${p.marketPrice || p.realPrice || Number(p.price||0)*2}" onchange="updateProduct(${p.id},'marketPrice',Number(this.value))"></div><button class="btn btn-ghost btn-small" onclick="recalcOneProduct(${p.id})">Recalc</button></td>
      <td><div class="row-price"><span class="currency">$</span><input type="number" step="0.01" value="${p.price}" onchange="updateProduct(${p.id},'price',Number(this.value))"></div></td>
      <td><div class="row-price"><span class="currency">$</span><input type="number" step="0.01" value="${p.reseller}" onchange="updateProduct(${p.id},'reseller',Number(this.value))"></div></td>
      <td><input type="number" value="${p.stock}" onchange="updateProduct(${p.id},'stock',Number(this.value))" style="max-width:80px"></td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${p.views||0}</td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--green)">${sales}</td>
      <td><button class="btn btn-danger btn-small" onclick="deleteProduct(${p.id})">Delete</button></td>
    </tr>`;
  }).join('');
  updateSelCount();
}
function setProductCatFilter(c, e){
  productCatFilter = c;
  renderProducts();
}
function updateProduct(id, field, value){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  p[field] = value;
  if(field==='reseller') p.bulk = value;
  if(field==='bulk') p.reseller = value;
  if(field==='brand' && !p.domain) p.domain = value.toLowerCase().replace(/\s+/g,'')+'.com';
  saveJSON(STORAGE.products, products);
  addLog(`${p.name} → ${field} updated`,'product');
  renderProducts();
  renderPricingTiers();
  renderStock();
}
function deleteProduct(id){
  if(!confirm('Delete this product?')) return;
  const p = products.find(x=>x.id===id);
  products = products.filter(x=>x.id!==id);
  selectedProducts.delete(id);
  saveJSON(STORAGE.products, products);
  addLog(`${p?.name||id} deleted`,'admin');
  renderAll();
}
function toggleProductSel(id, on){
  if(on) selectedProducts.add(id); else selectedProducts.delete(id);
  // Mirror to tier selections
  if(on){ selectedTier.single.add(id); selectedTier.reseller.add(id); }
  else { selectedTier.single.delete(id); selectedTier.reseller.delete(id); }
  updateSelCount();
  renderPricingTiers();
}
function toggleSelectAll(on){
  if(on) products.forEach(p=>selectedProducts.add(p.id));
  else selectedProducts.clear();
  // mirror
  ['single','reseller'].forEach(t=>{
    selectedTier[t] = new Set(on ? products.map(p=>p.id) : []);
  });
  renderProducts();
  renderPricingTiers();
}
function updateSelCount(){
  const n = selectedProducts.size;
  $('selCount').textContent = n + ' selected';
}
function bulkDelete(){
  if(!selectedProducts.size){ toast('Select products first'); return }
  if(!confirm(`Delete ${selectedProducts.size} products?`)) return;
  products = products.filter(p=>!selectedProducts.has(p.id));
  saveJSON(STORAGE.products, products);
  addLog(`Bulk deleted ${selectedProducts.size} products`,'admin');
  selectedProducts.clear();
  renderAll();
}
function bulkRandomStock(all=false){
  const targets = all ? products.map(p=>p.id) : [...selectedProducts];
  if(!targets.length){ toast(all?'No products':'Select products first'); return }
  targets.forEach(id=>{ const p=products.find(x=>x.id===id); if(p) p.stock = randomStock(settings.defaultStockMin||300, settings.defaultStockMax||4000) });
  saveJSON(STORAGE.products, products);
  addLog(`Stock randomized for ${targets.length} products`,'stock');
  renderAll();
}
function resetProductsToDefault(){
  if(!confirm('This will clear local product overrides and force the storefront to repopulate defaults on next load. Continue?')) return;
  localStorage.removeItem(STORAGE.products);
  toast('Product overrides cleared. Reload the store to repopulate.');
  addLog('Product overrides reset','admin');
  products = [];
  renderAll();
}

/* ---------- ADD PRODUCT MODAL ---------- */
function openProductModal(){ $('productModal').classList.add('active') }
function closeProductModal(){ $('productModal').classList.remove('active') }
function saveNewProduct(){
  const name = $('np_name').value.trim();
  const brand = $('np_brand').value.trim() || name;
  const cat = $('np_cat').value;
  const domain = $('np_domain').value.trim() || brand.toLowerCase().replace(/\s+/g,'')+'.com';
  const price = Number($('np_single').value) || 0;
  const reseller = Number($('np_reseller').value) || Math.round(price*.30*100)/100;
  const bulk = reseller;
  const stock = Number($('np_stock').value) || randomStock(settings.defaultStockMin||300, settings.defaultStockMax||4000);
  const customLogo = $('np_logo').value.trim();
  const desc = $('np_desc').value.trim() || 'Premium paid plan added by admin.';
  if(!name || !price){ toast('Name and Single price required'); return }
  products.unshift({ id: Date.now(), name, brand, cat, domain, customLogo, price, reseller, bulk: reseller, stock, sold:0, badge:'NEW', desc });
  saveJSON(STORAGE.products, products);
  // clear modal
  ['np_name','np_brand','np_domain','np_single','np_reseller','np_stock','np_logo','np_desc'].forEach(id=>$(id).value='');
  closeProductModal();
  addLog(`${name} added`,'product');
  renderAll();
  toast('Product added');
}

/* ---------- PRICING TIERS ---------- */
function switchTier(tier, e){
  activeTier = tier;
  document.querySelectorAll('.tab-bar button').forEach(b=>b.classList.remove('active'));
  if(e) e.target.closest('button').classList.add('active');
  document.querySelectorAll('.price-tier-panel').forEach(p=>p.classList.remove('active'));
  $('tier-'+tier).classList.add('active');
}
function toggleTierSelectAll(tier, on){
  if(on) products.forEach(p=>selectedTier[tier].add(p.id));
  else selectedTier[tier].clear();
  renderPricingTiers();
}
function toggleTierItem(tier, id, on){
  if(on) selectedTier[tier].add(id); else selectedTier[tier].delete(id);
  renderPricingTiers();
}
function applyTierBulk(tier){
  const ids = [...selectedTier[tier]];
  if(!ids.length){ toast('Select products first'); return }
  const op = $(tier+'Op').value;
  const v = Number($(tier+'Val').value);
  if(isNaN(v)){ toast('Enter a numeric value'); return }
  let changed = 0;
  ids.forEach(id=>{
    const p = products.find(x=>x.id===id);
    if(!p) return;
    const cur = Number(p[tier==='single'?'price':tier])||0;
    let next = cur;
    switch(op){
      case 'set': next = v; break;
      case 'add': next = cur + v; break;
      case 'sub': next = cur - v; break;
      case 'pctUp': next = cur * (1 + v/100); break;
      case 'pctDown': next = cur * (1 - v/100); break;
      case 'pctOfSingle': next = (p.price||0) * (v/100); break;
    }
    next = Math.max(0, Math.round(next*100)/100);
    if(tier==='single') p.price = next; else { p.reseller = next; p.bulk = next; }
    changed++;
  });
  saveJSON(STORAGE.products, products);
  addLog(`Bulk ${tier} ${op} ${v} applied to ${changed} products`,'pricing');
  toast(`Updated ${changed} ${tier} prices`);
  renderAll();
}
function resyncFromSingle(){
  if(!confirm('Reset Bulk/Resell to 60% of Single for all products?')) return;
  products.forEach(p=>{ p.reseller = Math.round(p.price*.60*100)/100; p.bulk = p.reseller; });
  saveJSON(STORAGE.products, products);
  addLog('Bulk/Resell auto-resynced from Single','pricing');
  toast('Bulk/Resell price resynced');
  renderAll();
}
function renderPricingTiers(){
  ['single','reseller'].forEach(tier=>{
    const fld = tier==='single'?'price':tier;
    const vals = products.map(p=>Number(p[fld]||0));
    const avg = vals.length ? vals.reduce((s,n)=>s+n,0)/vals.length : 0;
    const min = vals.length ? Math.min(...vals) : 0;
    const max = vals.length ? Math.max(...vals) : 0;
    $('avg'+capitalize(tier)).textContent = fmtMoney(avg.toFixed(2));
    $('min'+capitalize(tier)).textContent = fmtMoney(min);
    $('max'+capitalize(tier)).textContent = fmtMoney(max);
    if(tier==='single') $('cntSingle').textContent = products.length;
    else {
      // margin vs single
      const margins = products.map(p=>{
        const s = Number(p.price)||0;
        const t = Number(p[tier])||0;
        return s ? (s-t)/s*100 : 0;
      });
      const avgM = margins.length ? margins.reduce((a,b)=>a+b,0)/margins.length : 0;
      $('margin'+capitalize(tier)).textContent = avgM.toFixed(1)+'%';
    }
    $('selCount'+capitalize(tier)).textContent = selectedTier[tier].size;
  });

  // tables
  $('tierSingleTable').innerHTML = products.map(p=>{
    const isSel = selectedTier.single.has(p.id);
    const old = Math.round((p.price||0)*1.35);
    return `<tr class="${isSel?'selected':''}">
      <td><input type="checkbox" class="checkbox" ${isSel?'checked':''} onchange="toggleTierItem('single',${p.id}, this.checked)"></td>
      <td><div class="logo-img"><img src="${logoFor(p)}" alt="" onerror="this.style.display='none'"></div></td>
      <td><b>${escapeHtml(p.name)}</b><small style="display:block;color:var(--muted)">${escapeHtml(p.brand)}</small></td>
      <td>${escapeHtml(p.cat)}</td>
      <td><div class="row-price"><span class="currency">$</span><input type="number" step="0.01" value="${p.price}" onchange="updateProduct(${p.id},'price',Number(this.value))"></div></td>
      <td style="font-family:var(--mono);color:var(--muted);text-decoration:line-through">$${old}</td>
      <td>${p.stock}</td>
      <td style="color:var(--green)">${productAnalytics.products?.[String(p.id)]?.sales||0}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="8" class="empty">No products.</td></tr>`;

  $('tierResellerTable').innerHTML = products.map(p=>{
    const isSel = selectedTier.reseller.has(p.id);
    const save = p.price ? Math.round((p.price - p.reseller)/p.price*100) : 0;
    return `<tr class="${isSel?'selected':''}">
      <td><input type="checkbox" class="checkbox" ${isSel?'checked':''} onchange="toggleTierItem('reseller',${p.id}, this.checked)"></td>
      <td><div class="logo-img"><img src="${logoFor(p)}" alt="" onerror="this.style.display='none'"></div></td>
      <td><b>${escapeHtml(p.name)}</b><small style="display:block;color:var(--muted)">${escapeHtml(p.brand)}</small></td>
      <td style="font-family:var(--mono);color:var(--muted)">$${p.price}</td>
      <td><div class="row-price"><span class="currency">$</span><input type="number" step="0.01" value="${p.reseller}" onchange="updateProduct(${p.id},'reseller',Number(this.value))"></div></td>
      <td style="color:var(--green);font-weight:800">${save}%</td>
      <td>${p.stock}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="7" class="empty">No products.</td></tr>`;
}
function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1) }

/* ---------- STOCK ---------- */
function renderStock(){
  const tbody = $('stockTable');
  if(!products.length){ tbody.innerHTML='<tr><td colspan="7" class="empty">No products.</td></tr>'; return }
  tbody.innerHTML = products.map(p=>{
    const status = p.stock < 12 ? '<span class="status rejected">LOW</span>' : p.stock < 50 ? '<span class="status pending">MED</span>' : '<span class="status approved">OK</span>';
    return `<tr>
      <td><div class="logo-img"><img src="${logoFor(p)}" alt="" onerror="this.style.display='none'"></div></td>
      <td><b>${escapeHtml(p.name)}</b><small style="color:var(--muted);display:block">${escapeHtml(p.brand)}</small></td>
      <td>${escapeHtml(p.cat)}</td>
      <td><input type="number" value="${p.stock}" onchange="updateProduct(${p.id},'stock',Number(this.value))" style="max-width:120px"></td>
      <td>${status}</td>
      <td>${p.sold||0}</td>
      <td><button class="btn btn-ghost btn-small" onclick="updateProduct(${p.id},'stock',${randomStock(settings.defaultStockMin||300, settings.defaultStockMax||4000)})">Random</button></td>
    </tr>`;
  }).join('');
}

/* ---------- ANALYTICS ---------- */
function renderAnalytics(){
  // top performers table
  const perf = productMetricsList().sort((a,b)=>b.sales-a.sales || b.clicks-a.clicks);
  $('perfTable').innerHTML = perf.map(p=>{
    const ctr = p.views ? (p.clicks/p.views*100).toFixed(1)+'%' : '-';
    return `<tr>
      <td><b>${escapeHtml(p.name)}</b><small style="color:var(--muted);display:block">${escapeHtml(p.brand)}</small></td>
      <td>${p.sales}</td><td>${fmtMoney(p.revenue)}</td><td>${p.clicks}</td><td>${p.views}</td><td>${ctr}</td><td>${escapeHtml(p.topSource)}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" class="empty">No analytics yet.</td></tr>';

  $('eventsTable').innerHTML = (productAnalytics.events||[]).slice(0,80).map(e=>`<tr>
    <td><small>${escapeHtml(e.time||'')}</small></td>
    <td>${escapeHtml(e.type||'')}</td>
    <td>${escapeHtml(e.product||'')}</td>
    <td>${escapeHtml(e.source||'-')}</td>
    <td>${fmtMoney(e.amount||0)}</td>
  </tr>`).join('') || '<tr><td colspan="5" class="empty">No events yet.</td></tr>';

  // charts
  const top = perf.slice(0,8);
  if(viewsClicksChart) viewsClicksChart.destroy();
  viewsClicksChart = new Chart($('viewsClicksChart').getContext('2d'), {
    type:'bar',
    data:{ labels:top.map(p=>p.name), datasets:[
      { label:'Views', data:top.map(p=>p.views), backgroundColor:'rgba(96,165,250,.7)'},
      { label:'Clicks', data:top.map(p=>p.clicks), backgroundColor:'#f5c542'}
    ]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:'#f7f2df'}}},
      scales:{ x:{ticks:{color:'#a39b82',font:{size:10}}, grid:{display:false}}, y:{ticks:{color:'#a39b82'}, grid:{color:'rgba(245,197,66,.06)'}} }
    }
  });

  const cats = {};
  products.forEach(p=>cats[p.cat] = (cats[p.cat]||0)+1);
  const catEntries = Object.entries(cats);
  if(catMixChart) catMixChart.destroy();
  catMixChart = new Chart($('catMixChart').getContext('2d'), {
    type:'pie',
    data:{ labels:catEntries.map(e=>e[0]), datasets:[{ data:catEntries.map(e=>e[1]), backgroundColor:['#f5c542','#ffe08a','#60a5fa','#a78bfa','#22c55e','#fb7185','#facc15','#d49a13','#94a3b8','#34d399'], borderColor:'#0a0a06', borderWidth:2 }]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'right', labels:{color:'#f7f2df',font:{size:10}}}} }
  });
}
function clearProductAnalytics(){
  if(!confirm('Clear product analytics?')) return;
  productAnalytics = {products:{}, events:[]};
  products = products.map(p=>({...p, views:0, clicks:0}));
  saveJSON(STORAGE.productAnalytics, productAnalytics);
  saveJSON(STORAGE.products, products);
  addLog('Product analytics cleared','analytics');
  renderAll();
}

/* ---------- SOURCES ---------- */
function renderSources(){
  const src = visitors.sources || {};
  const total = Object.values(src).reduce((a,b)=>a+b,0) || 1;
  $('sourceTable').innerHTML = Object.entries(src).sort((a,b)=>b[1]-a[1]).map(([s,c])=>{
    const pct = (c/total*100).toFixed(1);
    return `<tr><td>${escapeHtml(s)}</td><td>${c}</td><td style="font-family:var(--mono);color:var(--gold)">${pct}%</td></tr>`;
  }).join('') || '<tr><td colspan="3" class="empty">No traffic yet.</td></tr>';

  $('visitTable').innerHTML = (visitors.lastVisits||[]).slice(0,80).map(v=>`<tr>
    <td><small>${escapeHtml(v.time||'')}</small></td>
    <td>${escapeHtml(v.source||'-')}</td>
    <td style="font-family:var(--mono);font-size:11px">${escapeHtml(v.page||'-')}</td>
    <td style="color:var(--muted);font-size:11px">${escapeHtml(v.referrer||'-')}</td>
  </tr>`).join('') || '<tr><td colspan="4" class="empty">No visits yet.</td></tr>';
}

/* ---------- WALLETS ---------- */
function renderWallets(){
  $('walletsPanel').innerHTML = `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px">${COINS.map(c=>`
    <div style="background:rgba(255,255,255,.02);border:1px solid var(--line);border-radius:14px;padding:14px">
      <b style="font-family:var(--mono);font-size:11px;color:var(--gold);letter-spacing:.8px">${c}</b>
      <input style="margin-top:8px" value="${escapeHtml(typeof wallets[c]==='string'?wallets[c]:(wallets[c]?.address||''))}" placeholder="Paste ${c} wallet address" onchange="setWallet('${c}', this.value)">
    </div>`).join('')}</div>`;
}
function setWallet(coin, value){
  wallets[coin] = value;
  saveJSON(STORAGE.wallets, wallets);
  addLog(`${coin} wallet updated`,'wallet');
  toast('Wallet saved');
}

/* ---------- SETTINGS ---------- */
function renderSettings(){
  $('setEmail').value = settings.supportEmail || '';
  $('setNotice').value = settings.supportText || '';
  $('setStockMin').value = settings.defaultStockMin || 300;
  $('setStockMax').value = settings.defaultStockMax || 4000;
}
function saveSettings(){
  settings.supportEmail = $('setEmail').value.trim();
  settings.supportText = $('setNotice').value.trim();
  settings.defaultStockMin = Number($('setStockMin').value) || 300;
  settings.defaultStockMax = Number($('setStockMax').value) || 4000;
  saveJSON(STORAGE.settings, settings);
  addLog('Site settings updated','settings');
  toast('Settings saved');
}

/* ---------- LOGS ---------- */
function addLog(details, type='admin'){
  logs.unshift({ time:new Date().toLocaleString(), type, details });
  logs = logs.slice(0,400);
  saveJSON(STORAGE.logs, logs);
}
function renderLogs(){
  $('logsTable').innerHTML = (logs||[]).slice(0,200).map(l=>`<tr>
    <td><small>${escapeHtml(l.time||'')}</small></td>
    <td>${escapeHtml(l.type||'')}</td>
    <td>${escapeHtml(l.details||'')}</td>
  </tr>`).join('') || '<tr><td colspan="3" class="empty">No logs yet.</td></tr>';
}
function clearLogs(){
  if(!confirm('Clear logs?')) return;
  logs = [];
  saveJSON(STORAGE.logs, logs);
  renderLogs();
}
function exportLogs(){
  const blob = new Blob([JSON.stringify({logs, orders, signups, products, productAnalytics, visitors, settings, wallets}, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'aurum-admin-export.json';
  a.click();
}
function exportAll(){ exportLogs() }

/* ---------- CSV ---------- */
function downloadCSV(filename, rows, fields){
  if(!rows.length){ toast('Nothing to export'); return }
  const header = fields.join(',');
  const body = rows.map(r => fields.map(f => `"${String(r[f]??'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([header+'\n'+body], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

/* ---------- GLOBAL SEARCH ---------- */
function handleGlobalSearch(e){
  globalSearchText = e.target.value.trim();
  renderProducts();
  renderOrders();
  renderSignups();
}

/* ---------- DEMO DATA ---------- */
function seedTestOrders(){
  if(!products.length){ toast('Add products first'); return }
  const names = ['ahmed@example.com','priya@example.com','rafi@example.com','sara@example.com','jane@example.com'];
  const statuses = ['Pending','Approved','Delivered','Approved','Delivered','Rejected'];
  const sources = ['Direct','facebook','google.com','telegram','reddit','linkedin'];
  for(let i=0;i<8;i++){
    const p = products[Math.floor(Math.random()*products.length)];
    const status = statuses[Math.floor(Math.random()*statuses.length)];
    const time = new Date(Date.now() - Math.floor(Math.random()*14*24*3600*1000));
    orders.unshift({
      id:'ORD-'+Date.now()+'-'+i, buyer:names[Math.floor(Math.random()*names.length)],
      type:['single','reseller'][Math.floor(Math.random()*2)],
      total:p.price, payment:'USDT TRC20', tx:'test'+Math.floor(Math.random()*1e8),
      status, items:[p.name], itemDetails:[{id:p.id,name:p.name,brand:p.brand,price:p.price,cat:p.cat}],
      source: sources[Math.floor(Math.random()*sources.length)],
      time: time.toLocaleString()
    });
  }
  saveJSON(STORAGE.orders, orders);
  addLog('Added 8 test orders','admin');
  renderAll();
  toast('Test orders added');
}

/* ---------- BOOT ---------- */
if(sessionStorage.getItem(STORAGE.adminAuth) === '1' || localStorage.getItem(STORAGE.adminAuth) === '1'){
  sessionStorage.setItem(STORAGE.adminAuth, '1');
  initShell();
}
