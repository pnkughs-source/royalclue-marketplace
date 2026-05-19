/* =========================================================
   AurumAI Live Sync (optional)
   Drop this into index.html with:
     <script src="live-sync.js"></script>
   placed AFTER your existing <script src="js/app.js"></script>.

   What it does: when admin.html (or any other tab) edits prices,
   products, wallets or settings in localStorage, the storefront
   re-renders instantly — no page reload needed.
   ========================================================= */
(function(){
  const KEYS = {
    products: 'aurum_ai_paid_products_v1',
    wallets:  'aurum_ai_wallets_v1',
    settings: 'aurum_ai_admin_settings_v2',
    orders:   'aurum_ai_orders_v1'
  };
  function safeJSON(s, fb){ try{ return JSON.parse(s) ?? fb }catch{ return fb } }

  window.addEventListener('storage', function(ev){
    if(!ev.key) return;

    // Products updated → refresh in-memory copy + re-render grid/filters
    if(ev.key === KEYS.products){
      try{
        const fresh = safeJSON(ev.newValue, []);
        if(Array.isArray(fresh) && typeof products !== 'undefined'){
          // Replace contents in place so other references stay valid
          products.length = 0;
          fresh.forEach(p => products.push(p));
          if(typeof renderFilters === 'function') renderFilters();
          if(typeof renderProducts === 'function') renderProducts();
          if(typeof renderCart === 'function') renderCart();
          showSyncBadge('Prices updated live');
        }
      }catch(err){ /* ignore */ }
    }

    // Wallet addresses updated → refresh payment page wallet box
    if(ev.key === KEYS.wallets){
      try{
        const fresh = safeJSON(ev.newValue, {});
        if(fresh && typeof wallets !== 'undefined'){
          Object.keys(wallets).forEach(k => delete wallets[k]);
          Object.assign(wallets, fresh);
          if(typeof renderPaymentInfo === 'function') renderPaymentInfo();
          showSyncBadge('Wallets updated');
        }
      }catch(err){ /* ignore */ }
    }

    // Settings (support email / payment notice) updated
    if(ev.key === KEYS.settings){
      try{
        const fresh = safeJSON(ev.newValue, {});
        if(fresh && typeof adminSettings !== 'undefined'){
          Object.keys(adminSettings).forEach(k => delete adminSettings[k]);
          Object.assign(adminSettings, fresh);
          if(typeof renderPaymentInfo === 'function') renderPaymentInfo();
          showSyncBadge('Settings updated');
        }
      }catch(err){ /* ignore */ }
    }

    // Orders updated (admin approves/rejects) → refresh live ticker
    if(ev.key === KEYS.orders){
      try{
        const fresh = safeJSON(ev.newValue, []);
        if(Array.isArray(fresh) && typeof orders !== 'undefined'){
          orders.length = 0;
          fresh.forEach(o => orders.push(o));
          if(typeof updateLiveTicker === 'function') updateLiveTicker();
        }
      }catch(err){ /* ignore */ }
    }
  });

  /* Small floating badge so the user knows live sync happened */
  function showSyncBadge(text){
    let el = document.getElementById('liveSyncBadge');
    if(!el){
      el = document.createElement('div');
      el.id = 'liveSyncBadge';
      el.style.cssText = 'position:fixed;right:20px;top:20px;z-index:9999;background:linear-gradient(135deg,#ffe08a,#f5c542);color:#080804;padding:10px 14px;border-radius:999px;font:800 12px Inter,sans-serif;box-shadow:0 12px 30px rgba(245,197,66,.35);transform:translateY(-100px);transition:.35s;display:flex;align-items:center;gap:7px';
      el.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#080804;display:inline-block;animation:pulse 1s infinite"></span><span class="lst-text"></span>';
      document.body.appendChild(el);
    }
    el.querySelector('.lst-text').textContent = text;
    requestAnimationFrame(()=> el.style.transform = 'translateY(0)');
    clearTimeout(el._t);
    el._t = setTimeout(()=> el.style.transform = 'translateY(-100px)', 2400);
  }

  console.log('[AurumAI live-sync] ready — listening for admin changes.');
})();
