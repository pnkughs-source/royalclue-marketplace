const express=require('express');const cors=require('cors');const fs=require('fs');const path=require('path');
const app=express();const PORT=process.env.PORT||5000;const DB=path.join(__dirname,'data','db.json');
try{const envPath=path.join(__dirname,'.env'); if(fs.existsSync(envPath)){fs.readFileSync(envPath,'utf8').split(/\r?\n/).forEach(line=>{const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if(m && !process.env[m[1]]) process.env[m[1]]=m[2].replace(/^['"]|['"]$/g,'');});}}catch{}
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'mind';
const ADMIN_PASSWORD_ALIASES=new Set([ADMIN_PASSWORD,'mind','admin123'].filter(Boolean));
app.use(cors());
app.use(express.json({limit:'10mb'}));
app.use(express.static(path.join(__dirname, '..')));
function def(){return{products:[],orders:[],wallets:{'USDT TRC20':{network:'TRC20 Network',address:'TXp9KqExampleUSDTWalletAddress123456789',note:'Use USDT TRC20 only.'},BTC:{network:'Bitcoin Network',address:'bc1qexamplebtcwalletaddress123456789',note:'Send BTC only.'},ETH:{network:'Ethereum ERC20',address:'0xExampleETHWalletAddress123456789ABCDEF',note:'ETH/ERC20 only.'},BNB:{network:'BNB Smart Chain',address:'0xExampleBNBWalletAddress123456789ABCDEF',note:'BNB/BEP20 only.'}},analytics:{visitors:0,productViews:{},productClicks:{}},logs:[]}}
function read(){if(!fs.existsSync(DB)){fs.mkdirSync(path.dirname(DB),{recursive:true});fs.writeFileSync(DB,JSON.stringify(def(),null,2))}return JSON.parse(fs.readFileSync(DB,'utf8'))}function write(db){fs.writeFileSync(DB,JSON.stringify(db,null,2))}function log(db,type,details){db.logs.unshift({id:Date.now().toString(),time:new Date().toISOString(),type,details});db.logs=db.logs.slice(0,200)}function admin(req,res,next){const given=String(req.headers['x-admin-password']||''); if(!ADMIN_PASSWORD_ALIASES.has(given))return res.status(401).json({message:'Unauthorized: use the same admin password as the panel login. Default is mind.'});next()}

function roundPrice(n){return Math.max(0,Math.round(Number(n||0)*100)/100)}
function applyDiscounts(p){const market=roundPrice(p.marketPrice||p.realPrice||Number(p.price||0)*2);return{...p,marketPrice:market,realPrice:market,price:roundPrice(market*.5),reseller:roundPrice(market*.3),bulk:roundPrice(market*.3),priceMode:'auto-discount',priceNote:'Single = 50% of market. Resell/Bulk = 30% of market.'}}
function pickPriceFromText(text){const prices=[];String(text||'').replace(/(?:US\$|USD|\$)\s*([0-9]+(?:\.[0-9]{1,2})?)/gi,(_,n)=>{const v=Number(n); if(v>0&&v<5000) prices.push(v)});return prices.length?prices[0]:0}
async function lookupMarketPrice(product){
  const key=process.env.SERPAPI_KEY||process.env.SERP_API_KEY;
  if(!key) return {marketPrice:0,source:'missing SERPAPI_KEY'};
  const q=encodeURIComponent(`${product.name} ${product.brand||''} subscription price official`);
  const url=`https://serpapi.com/search.json?engine=google&q=${q}&hl=en&gl=us&api_key=${encodeURIComponent(key)}`;
  const res=await fetch(url);
  if(!res.ok) throw new Error('SerpApi request failed: '+res.status);
  const data=await res.json();
  let market=0, source='google-search';
  const shopping=[...(data.shopping_results||[]),...(data.inline_shopping_results||[])];
  const shop=shopping.find(x=>Number(x.extracted_price)>0);
  if(shop){market=Number(shop.extracted_price);source=shop.source||'google-shopping'}
  if(!market && data.answer_box) market=pickPriceFromText(JSON.stringify(data.answer_box));
  if(!market && data.organic_results){for(const r of data.organic_results){market=pickPriceFromText(`${r.title} ${r.snippet} ${r.rich_snippet?JSON.stringify(r.rich_snippet):''}`); if(market){source=r.source||r.link||'organic';break}}}
  return {marketPrice:roundPrice(market),source};
}
app.post('/api/sync-market-prices',admin,async(req,res)=>{
  try{
    const incoming=Array.isArray(req.body.products)?req.body.products:[];
    if(!incoming.length)return res.status(400).json({message:'No products sent'});
    const out=[];
    for(const p of incoming){
      let found={marketPrice:0,source:'manual'};
      try{found=await lookupMarketPrice(p)}catch(e){found={marketPrice:0,source:e.message||'lookup failed'}}
      const market=found.marketPrice || p.marketPrice || p.realPrice || Number(p.price||0)*2;
      out.push(applyDiscounts({...p,marketPrice:market,realPrice:market,marketSource:found.source,marketSyncedAt:new Date().toISOString()}));
    }
    res.json({ok:true,products:out,rule:{single:'50% of market',reseller:'30% of market',bulk:'30% of market'},hasLiveApi:Boolean(process.env.SERPAPI_KEY||process.env.SERP_API_KEY)});
  }catch(err){res.status(500).json({message:err.message||'sync failed'})}
});

app.get('/api/health',(req,res)=>res.json({ok:true,name:'RoyalClue API',mode:'live'}));
app.get('/api/products',(req,res)=>res.json(read().products));app.post('/api/products',admin,(req,res)=>{let db=read(),p={...req.body,id:Date.now()};db.products.unshift(p);log(db,'product','Product added: '+p.name);write(db);res.status(201).json(p)});app.patch('/api/products/:id',admin,(req,res)=>{let db=read();let p=db.products.find(x=>String(x.id)===String(req.params.id));if(!p)return res.status(404).json({error:'Product not found'});Object.assign(p,req.body);log(db,'product','Product updated: '+(p.name||req.params.id));write(db);res.json(p)});app.put('/api/products/:id',admin,(req,res)=>{let db=read();let p=db.products.find(x=>String(x.id)===String(req.params.id));if(!p)return res.status(404).json({error:'Product not found'});Object.assign(p,req.body);log(db,'product','Product updated: '+(p.name||req.params.id));write(db);res.json(p)});app.delete('/api/products/:id',admin,(req,res)=>{let db=read();db.products=db.products.filter(p=>String(p.id)!==String(req.params.id));log(db,'product','Product deleted: '+req.params.id);write(db);res.json({ok:true})});
app.post('/api/orders',(req,res)=>{let db=read(),o={id:'ORD-'+Math.floor(100000+Math.random()*900000),...req.body,status:'pending',createdAt:new Date().toISOString()};db.orders.unshift(o);log(db,'order','New order submitted: '+o.id);write(db);res.status(201).json(o)});app.get('/api/orders',admin,(req,res)=>res.json(read().orders));app.patch('/api/orders/:id/status',admin,(req,res)=>{let db=read(),o=db.orders.find(x=>x.id===req.params.id);if(!o)return res.status(404).json({message:'Not found'});o.status=req.body.status;o.updatedAt=new Date().toISOString();log(db,'order',`Order ${o.id} marked ${o.status}`);write(db);res.json(o)});
app.get('/api/wallets',(req,res)=>res.json(read().wallets));app.put('/api/wallets/:coin',admin,(req,res)=>{let db=read();db.wallets[req.params.coin]=req.body;log(db,'wallet','Wallet updated: '+req.params.coin);write(db);res.json(db.wallets[req.params.coin])});
app.post('/api/analytics/view/:id',(req,res)=>{let db=read(),id=req.params.id;db.analytics.productViews[id]=(db.analytics.productViews[id]||0)+1;write(db);res.json({ok:true})});app.post('/api/analytics/click/:id',(req,res)=>{let db=read(),id=req.params.id;db.analytics.productClicks[id]=(db.analytics.productClicks[id]||0)+1;write(db);res.json({ok:true})});
app.get('/api/admin/dashboard',admin,(req,res)=>{let db=read(),revenue=db.orders.filter(o=>['approved','delivered'].includes(o.status)).reduce((s,o)=>s+Number(o.total||0),0);res.json({pendingOrders:db.orders.filter(o=>o.status==='pending').length,totalOrders:db.orders.length,revenue,wallets:Object.keys(db.wallets).length,logs:db.logs.slice(0,30),analytics:db.analytics})});
app.get('/api/logs',admin,(req,res)=>res.json(read().logs));app.post('/api/logs',admin,(req,res)=>{let db=read();log(db,req.body.type||'admin',req.body.details||'Manual log');write(db);res.status(201).json(db.logs[0])});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT,()=>console.log(`PromptStore API running on http://localhost:${PORT}`));
