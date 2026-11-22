/* SoleMate checkout: Add to Cart -> Cart -> Cash payment -> Receipt -> Home / Products
   Load it after script.js:
   <script src="js/script.js"></script>
   <script src="js/checkout.js"></script>
*/
(() => {
  // ---------- Settings (change these to match your pages) ----------
  const HOME_URL = 'index.html';
  const PRODUCTS_URL = 'products.html';
  const DISCOUNT_MIN_QTY = 2;   // "Buy 2 pairs, get 10% OFF"
  const DISCOUNT_RATE = 0.10;
  const STORE_NAME = 'SoleMate Shoes';
  const CART_KEY = 'solemate_cart_items';

  // ---------- Styles ----------
  const css = `
  #sm-overlay{position:fixed;inset:0;background:rgba(10,16,34,.65);display:none;align-items:center;justify-content:center;padding:16px;z-index:9999}
  #sm-overlay.open{display:flex}
  .sm-box{background:#fff;color:#1a2748;width:100%;max-width:440px;max-height:92vh;overflow:auto;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.35);font-family:inherit}
  .sm-head{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:#1a2748;color:#fff;border-radius:16px 16px 0 0}
  .sm-head h3{margin:0;font-size:1.05rem}
  .sm-x{background:none;border:0;color:#fff;font-size:1.4rem;cursor:pointer;line-height:1}
  .sm-body{padding:18px 20px}
  .sm-row{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #e8ebf3}
  .sm-row small{color:#6b7488}
  .sm-qty{display:flex;align-items:center;gap:8px}
  .sm-qty button{width:26px;height:26px;border-radius:50%;border:1.5px solid #1a2748;background:#fff;color:#1a2748;font-weight:700;cursor:pointer}
  .sm-remove{background:none;border:0;color:#c0392b;cursor:pointer;font-size:.8rem}
  .sm-total{display:flex;justify-content:space-between;padding:6px 0;font-size:.95rem}
  .sm-total.big{font-size:1.15rem;font-weight:800;color:#ff6b13;border-top:2px dashed #cfd5e3;margin-top:6px;padding-top:12px}
  .sm-btns{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}
  .sm-btn{flex:1;min-width:120px;padding:12px 16px;border-radius:999px;border:2px solid #1a2748;background:#fff;color:#1a2748;font-weight:700;cursor:pointer}
  .sm-btn.primary{background:#ff6b13;border-color:#ff6b13;color:#fff}
  .sm-btn:disabled{opacity:.45;cursor:not-allowed}
  .sm-method{display:flex;gap:12px;align-items:center;border:2px solid #ff6b13;background:#fff5ee;border-radius:12px;padding:12px 14px;margin:10px 0 14px}
  .sm-method b{display:block}
  .sm-method small{color:#6b7488}
  .sm-label{display:block;font-weight:700;margin:12px 0 6px;font-size:.9rem}
  .sm-input{width:100%;box-sizing:border-box;padding:12px 14px;border:2px solid #cfd5e3;border-radius:10px;font-size:1rem}
  .sm-input:focus{outline:none;border-color:#ff6b13}
  .sm-msg{margin-top:8px;font-size:.88rem;min-height:1.2em}
  .sm-msg.err{color:#c0392b}.sm-msg.ok{color:#1e8449}
  .sm-empty{text-align:center;color:#6b7488;padding:24px 0}
  .sm-receipt{font-family:"Courier New",monospace;font-size:.88rem}
  .sm-receipt .center{text-align:center}
  .sm-receipt hr{border:0;border-top:1px dashed #1a2748;margin:10px 0}
  .sm-receipt .line{display:flex;justify-content:space-between;gap:8px;padding:2px 0}
  .sm-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a2748;color:#fff;padding:10px 18px;border-radius:999px;font-size:.9rem;z-index:10000;box-shadow:0 8px 20px rgba(0,0,0,.3)}
  @media print{
    body *{visibility:hidden}
    #sm-print, #sm-print *{visibility:visible}
    #sm-print{position:absolute;left:0;top:0;width:100%}
    .sm-btns{display:none!important}
  }`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- State ----------
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }
  if (!Array.isArray(cart)) cart = [];
  const save = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} };
  // the old script.js counter used this key; clear it so it can never bring back an old number
  const clearOldCounter = () => { try { localStorage.removeItem('solemate_cart'); } catch (e) {} };
  clearOldCounter();

  const peso = n => 'P ' + Number(n).toLocaleString('en-PH');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function totals() {
    const qty = cart.reduce((s, i) => s + i.qty, 0);
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const discount = qty >= DISCOUNT_MIN_QTY ? Math.round(subtotal * DISCOUNT_RATE) : 0;
    return { qty, subtotal, discount, total: subtotal - discount };
  }

  // ---------- Overlay ----------
  const overlay = document.createElement('div');
  overlay.id = 'sm-overlay';
  document.body.appendChild(overlay);
  const open = html => { overlay.innerHTML = html; overlay.classList.add('open'); };
  const close = () => overlay.classList.remove('open');

  function toast(text) {
    const t = document.createElement('div');
    t.className = 'sm-toast';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1800);
  }

  // ---------- Cart badge ----------
  let cartWrapper = null;
  function findCartWrapper() {
    const matches = [...document.querySelectorAll('body *')].filter(
      e => !e.closest('#sm-overlay') && /Cart:\s*\d+\s*$/.test(e.textContent.trim())
    );
    return matches.pop() || null; // deepest match
  }
  function updateBadge() {
    const n = cart.reduce((s, i) => s + i.qty, 0);
    const explicit = document.querySelector('#cartCount, #cart-count, .cart-count, .cart-badge');
    if (explicit) { explicit.textContent = n; return; }
    if (!cartWrapper) return;
    const badge = [...cartWrapper.querySelectorAll('*')].find(e => !e.children.length && /^\d+$/.test(e.textContent.trim()));
    if (badge) badge.textContent = n;
  }

  // ---------- Views ----------
  function cartView() {
    if (!cart.length) {
      open(`<div class="sm-box"><div class="sm-head"><h3>Your cart</h3><button class="sm-x" data-a="close">&times;</button></div>
        <div class="sm-body"><div class="sm-empty">Your cart is empty.<br>Add a pair to get started.</div>
        <div class="sm-btns"><button class="sm-btn primary" data-a="close">Browse shoes</button></div></div></div>`);
      return;
    }
    const t = totals();
    const rows = cart.map((i, idx) => `
      <div class="sm-row">
        <div><b>${esc(i.name)}</b><br><small>${peso(i.price)}</small></div>
        <div class="sm-qty">
          <button data-a="dec" data-i="${idx}" aria-label="Decrease">&minus;</button>
          <span>${i.qty}</span>
          <button data-a="inc" data-i="${idx}" aria-label="Increase">+</button>
        </div>
        <button class="sm-remove" data-a="rm" data-i="${idx}">Remove</button>
      </div>`).join('');
    open(`<div class="sm-box"><div class="sm-head"><h3>Your cart</h3><button class="sm-x" data-a="close">&times;</button></div>
      <div class="sm-body">${rows}
        <div class="sm-total" style="margin-top:10px"><span>Subtotal</span><span>${peso(t.subtotal)}</span></div>
        ${t.discount ? `<div class="sm-total"><span>Discount (10% off 2+ pairs)</span><span>- ${peso(t.discount)}</span></div>` : ''}
        <div class="sm-total big"><span>Total</span><span>${peso(t.total)}</span></div>
        <div class="sm-btns">
          <button class="sm-btn" data-a="close">Keep shopping</button>
          <button class="sm-btn primary" data-a="checkout">Checkout</button>
        </div></div></div>`);
  }

  function paymentView() {
    const t = totals();
    open(`<div class="sm-box"><div class="sm-head"><h3>Payment</h3><button class="sm-x" data-a="close">&times;</button></div>
      <div class="sm-body">
        <div class="sm-total big" style="border:0;margin:0;padding:0"><span>Amount to pay</span><span>${peso(t.total)}</span></div>
        <span class="sm-label">Payment method</span>
        <div class="sm-method"><span style="font-size:1.6rem">&#128181;</span><div><b>Cash</b><small>Cash is the only payment method for now.</small></div></div>
        <label class="sm-label" for="sm-cash">Cash received</label>
        <input id="sm-cash" class="sm-input" type="number" min="0" step="1" inputmode="numeric" placeholder="Enter amount">
        <div class="sm-msg" id="sm-msg"></div>
        <div class="sm-btns">
          <button class="sm-btn" data-a="back">Back</button>
          <button class="sm-btn" data-a="exact">Exact amount</button>
          <button class="sm-btn primary" id="sm-pay" data-a="pay" disabled>Pay cash</button>
        </div></div></div>`);
    const input = overlay.querySelector('#sm-cash');
    input.addEventListener('input', checkCash);
    input.focus();
  }

  function checkCash() {
    const t = totals();
    const val = Number(overlay.querySelector('#sm-cash').value);
    const msg = overlay.querySelector('#sm-msg');
    const pay = overlay.querySelector('#sm-pay');
    if (!val) { msg.textContent = ''; msg.className = 'sm-msg'; pay.disabled = true; return; }
    if (val < t.total) {
      msg.textContent = `Short by ${peso(t.total - val)}.`;
      msg.className = 'sm-msg err';
      pay.disabled = true;
    } else {
      msg.textContent = `Change: ${peso(val - t.total)}`;
      msg.className = 'sm-msg ok';
      pay.disabled = false;
    }
  }

  function receiptView(r) {
    const lines = r.items.map(i => `
      <div class="line"><span>${esc(i.name)} x${i.qty}</span><span>${peso(i.price * i.qty)}</span></div>`).join('');
    open(`<div class="sm-box"><div class="sm-head"><h3>Payment successful</h3></div>
      <div class="sm-body">
        <div id="sm-print" class="sm-receipt">
          <div class="center"><b style="font-size:1.1rem">${esc(STORE_NAME)}</b><br>Official receipt</div>
          <hr>
          <div class="line"><span>Receipt no.</span><span>${r.no}</span></div>
          <div class="line"><span>Date</span><span>${esc(r.date)}</span></div>
          <div class="line"><span>Payment</span><span>Cash</span></div>
          <hr>${lines}<hr>
          <div class="line"><span>Subtotal</span><span>${peso(r.subtotal)}</span></div>
          ${r.discount ? `<div class="line"><span>Discount (10%)</span><span>- ${peso(r.discount)}</span></div>` : ''}
          <div class="line"><b>TOTAL</b><b>${peso(r.total)}</b></div>
          <div class="line"><span>Cash received</span><span>${peso(r.cash)}</span></div>
          <div class="line"><span>Change</span><span>${peso(r.change)}</span></div>
          <hr><div class="center">Thank you for shopping!<br>7-day returns. Keep this receipt.</div>
        </div>
        <div class="sm-btns">
          <button class="sm-btn" data-a="print">Print</button>
          <button class="sm-btn" data-a="products">Back to Products</button>
          <button class="sm-btn primary" data-a="home">Go to Home</button>
        </div></div></div>`);
  }

  // ---------- Actions ----------
  function findLink(label, fallback) {
    const a = [...document.querySelectorAll('a[href]')].find(x => x.textContent.trim().toUpperCase().endsWith(label));
    return a ? a.getAttribute('href') : fallback;
  }

  function pay() {
    const t = totals();
    const cash = Number(overlay.querySelector('#sm-cash').value);
    if (!cart.length || cash < t.total) return;
    const receipt = {
      no: 'SM-' + Date.now().toString().slice(-8),
      date: new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }),
      items: cart.map(i => ({ ...i })),
      subtotal: t.subtotal, discount: t.discount, total: t.total,
      cash, change: cash - t.total
    };
    cart = [];
    save();
    clearOldCounter();
    updateBadge();
    receiptView(receipt);
  }

  overlay.addEventListener('click', e => {
    if (e.target === overlay) { close(); return; }
    const el = e.target.closest('[data-a]');
    if (!el) return;
    const idx = Number(el.dataset.i);
    switch (el.dataset.a) {
      case 'close': close(); break;
      case 'inc': cart[idx].qty++; save(); updateBadge(); cartView(); break;
      case 'dec': cart[idx].qty = Math.max(1, cart[idx].qty - 1); save(); updateBadge(); cartView(); break;
      case 'rm': cart.splice(idx, 1); save(); updateBadge(); cartView(); break;
      case 'checkout': paymentView(); break;
      case 'back': cartView(); break;
      case 'exact': overlay.querySelector('#sm-cash').value = totals().total; checkCash(); break;
      case 'pay': pay(); break;
      case 'print': window.print(); break;
      case 'home': window.location.href = findLink('HOME', HOME_URL); break;
      case 'products': window.location.href = findLink('PRODUCTS', PRODUCTS_URL); break;
    }
  });

  // ---------- Public API (called from script.js) ----------
  window.SoleMateCart = {
    add(name, price) {
      const found = cart.find(i => i.name === name);
      if (found) found.qty++; else cart.push({ name, price: Number(price) || 0, qty: 1 });
      save();
      updateBadge();
      (typeof window.toast === 'function' ? window.toast : toast)('\u2714 ' + name + ' added to cart!');
    },
    open: cartView
  };

  // ---------- Init ----------
  function init() {
    cartWrapper = findCartWrapper();
    if (cartWrapper) {
      cartWrapper.style.cursor = 'pointer';
      cartWrapper.title = 'View cart';
      cartWrapper.addEventListener('click', cartView);
    }
    updateBadge();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();