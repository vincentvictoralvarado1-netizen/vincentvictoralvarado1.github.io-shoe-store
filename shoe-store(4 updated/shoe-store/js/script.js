function shoeSVG(type, main, accent) {
  var high = type === "high";
  var upper = high
    ? "M40 182 L36 62 Q38 40 62 38 L116 36 Q146 38 156 64 Q180 102 236 112 Q304 120 352 136 Q386 148 386 170 L386 182 Z"
    : "M40 182 L42 114 Q44 96 64 94 L110 90 Q140 88 160 66 L178 48 Q190 38 206 46 L240 68 Q292 102 346 116 Q384 128 386 162 L386 182 Z";
  var collar = high
    ? "M62 38 L116 36 Q146 38 156 64 L140 70 Q120 52 100 56 L60 60 Z"
    : "M110 90 Q140 88 160 66 L178 48 Q190 38 206 46 L196 62 Q176 90 140 100 L110 100 Z";
  var pts = high
    ? [[172, 74], [192, 86], [212, 97], [232, 105]]
    : [[198, 58], [216, 68], [234, 78], [252, 88]];
  var laces = pts.map(function (p) {
    return '<line x1="' + (p[0] - 8) + '" y1="' + (p[1] + 12) + '" x2="' + (p[0] + 10) + '" y2="' + (p[1] - 2) + '"/>';
  }).join("");
  return '<svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="212" cy="218" rx="168" ry="10" fill="rgba(0,0,0,.14)"/>' +
    '<path d="M32 178 H388 Q404 178 402 194 Q398 212 366 212 H66 Q36 212 32 194 Z" fill="#fff" stroke="#d9d9d9" stroke-width="2"/>' +
    '<path d="M34 184 H400" stroke="' + accent + '" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="' + upper + '" fill="' + main + '"/>' +
    '<path d="M306 182 Q308 138 352 122 Q386 132 386 164 L386 182 Z" fill="' + accent + '" opacity=".9"/>' +
    '<path d="' + collar + '" fill="#1b1b1b" opacity=".85"/>' +
    '<path d="M64 160 Q140 126 250 150" stroke="' + accent + '" stroke-width="12" stroke-linecap="round" fill="none"/>' +
    '<g stroke="#fff" stroke-width="5" stroke-linecap="round">' + laces + '</g>' +
    '</svg>';
}

var PRODUCTS = [
  { name: "AeroRun X1",    cat: "Running",    price: 2499, type: "low",  main: "#ff6a13", accent: "#14213d", rating: 5, tag: "Best Seller", img: "images/shoe1.jpg" },
  { name: "SprintLite",    cat: "Running",    price: 2199, type: "low",  main: "#2b7de9", accent: "#ffffff", rating: 4, tag: "New", img: "images/shoe2.jpg" },
  { name: "SkyCourt Pro",  cat: "Basketball", price: 3299, type: "high", main: "#d62828", accent: "#111111", rating: 5, tag: "Hot", img: "images/shoe3.jpg" },
  { name: "HoopMaster",    cat: "Basketball", price: 3599, type: "high", main: "#14213d", accent: "#ffb703", rating: 5, tag: "Pro", img: "images/shoe4.jpg" },
  { name: "UrbanKicks",    cat: "Lifestyle",  price: 1899, type: "low",  main: "#1fa35c", accent: "#ffffff", rating: 4, tag: "Trending", img: "images/shoe5.jpg" },
  { name: "StreetWalker",  cat: "Lifestyle",  price: 1699, type: "low",  main: "#6b7280", accent: "#ff6a13", rating: 4, tag: "Sale", img: "images/shoe6.jpg" },
  { name: "ScholarFit",    cat: "School",     price: 999,  type: "low",  main: "#1b1b1b", accent: "#ffffff", rating: 4, tag: "Student", img: "images/shoe7.jpg" },
  { name: "ClassMate High", cat: "School",    price: 1099, type: "high", main: "#2b2b2b", accent: "#e5e5e5", rating: 5, tag: "Student", img: "images/shoe8.jpg" }
];

function peso(n) { return "P " + n.toLocaleString("en-US"); }

function stars(n) {
  var s = "";
  for (var i = 0; i < 5; i++) { s += i < n ? "★" : "☆"; }
  return s;
}

var cartCount = 0;
try { cartCount = parseInt(localStorage.getItem("solemate_cart") || "0", 10) || 0; } catch (e) {}

function toast(message) {
  var t = document.getElementById("toast");
  if (!t) { return; }
  t.textContent = message;
  t.classList.add("show");
  setTimeout(function () { t.classList.remove("show"); }, 1800);
}

function addToCart(name, price) {
  if (window.SoleMateCart) { SoleMateCart.add(name, price); }
  cartCount++;
  try { localStorage.setItem("solemate_cart", cartCount); } catch (e) {}
  var pill = document.getElementById("cartCount");
  if (pill) { pill.textContent = cartCount; }
  toast("✔ " + name + " added to cart!");
}

function shoeImage(p) {
  var holder = document.createElement("div");
  var img = document.createElement("img");
  img.alt = p.name;
  img.onerror = function () { holder.innerHTML = shoeSVG(p.type, p.main, p.accent); };
  img.src = p.img;
  holder.appendChild(img);
  return holder;
}

function renderProducts(containerId, list) {
  var box = document.getElementById(containerId);
  if (!box) { return; }
  box.innerHTML = "";
  list.forEach(function (p) {
    var card = document.createElement("div");
    card.className = "card fade";
    card.innerHTML =
      '<div class="img"><span class="tag">' + p.tag + '</span></div>' +
      '<div class="info"><h3>' + p.name + '</h3>' +
      '<div class="stars">' + stars(p.rating) + ' <small style="color:#888">' + p.cat + '</small></div>' +
      '<div class="price">' + peso(p.price) + '</div>' +
      '<button class="btn small">Add to Cart</button></div>';
    card.querySelector(".img").appendChild(shoeImage(p));
    card.querySelector("button").onclick = function () { addToCart(p.name, p.price); };
    box.appendChild(card);
  });
}

function initHeader() {
  document.getElementById("logo").innerHTML = shoeSVG("low", "#ff6a13", "#ffffff");
  var msgs = [
    "🚚 FREE SHIPPING on orders over P2,000",
    "🔥 NEW ARRIVALS: Run season is here!",
    "🎁 Buy 2 pairs, get 10% OFF",
    "⭐ 7-day easy returns"
  ];
  var i = 0, box = document.getElementById("promo");
  setInterval(function () {
    box.style.opacity = 0;
    setTimeout(function () {
      i = (i + 1) % msgs.length;
      box.textContent = msgs[i];
      box.style.opacity = 1;
    }, 400);
  }, 3000);
}

function initNav() {
  var items = document.querySelectorAll("a.item");
  items.forEach(function (a) {
    a.addEventListener("click", function () {
      items.forEach(function (x) { x.classList.remove("active"); });
      a.classList.add("active");
    });
  });
}

function countUp(el) {
  var target = parseInt(el.getAttribute("data-target"), 10);
  var current = 0, step = Math.max(1, Math.ceil(target / 60));
  var timer = setInterval(function () {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current.toLocaleString("en-US") + "+";
  }, 25);
}

function initHome() {
  document.getElementById("heroArt").appendChild(shoeImage(PRODUCTS[0]));
  renderProducts("featured", PRODUCTS.slice(0, 4));
  document.querySelectorAll(".num").forEach(countUp);

  var quotes = [
    ["“Super comfortable and the quality is amazing. I wear them every day!”", "Maria S., Customer"],
    ["“Fast delivery and the prices are very reasonable. Will buy again.”", "John P., Customer"],
    ["“Best basketball shoes I have owned. Great grip on the court.”", "Carlo R., Customer"]
  ];
  var n = 0, q = document.getElementById("quote"), who = document.getElementById("who");
  setInterval(function () {
    q.style.opacity = 0;
    setTimeout(function () {
      n = (n + 1) % quotes.length;
      q.textContent = quotes[n][0];
      who.textContent = quotes[n][1];
      q.style.opacity = 1;
    }, 400);
  }, 4000);
}

function initProducts() {
  document.getElementById("cartCount").textContent = cartCount;
  renderProducts("all", PRODUCTS);
  var buttons = document.querySelectorAll(".filters button");
  buttons.forEach(function (b) {
    b.onclick = function () {
      buttons.forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      var cat = b.getAttribute("data-cat");
      var list = PRODUCTS.filter(function (p) { return cat === "All" || p.cat === cat; });
      renderProducts("all", list);
    };
  });
}

function initContacts() {
  var form = document.getElementById("contactForm");
  var msg = document.getElementById("formMsg");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements["name"].value.trim();
    var email = form.elements["email"].value.trim();
    var text = form.elements["message"].value.trim();
    var emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    if (name === "" || text === "") {
      msg.className = "msg err";
      msg.textContent = "Please fill in your name and message.";
    } else if (!emailOk) {
      msg.className = "msg err";
      msg.textContent = "Please enter a valid email address.";
    } else {
      msg.className = "msg ok";
      msg.textContent = "Thank you, " + name + "! We received your message and will reply soon.";
      form.reset();
    }
  });
}

function initAbout() {
  var img = document.getElementById("ceoPhoto");
  img.onerror = function () {
    img.onerror = null;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
      '<rect width="200" height="200" fill="#e8ecf5"/>' +
      '<circle cx="100" cy="78" r="38" fill="#9aa6c4"/>' +
      '<path d="M30 200 Q30 128 100 128 Q170 128 170 200 Z" fill="#9aa6c4"/></svg>';
    img.src = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  };
  img.src = "images/alvarado.webp";
}

function initFooter() {
  document.getElementById("year").textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", function () {
  var page = document.body.getAttribute("data-page");
  if (page === "header") { initHeader(); }
  if (page === "nav") { initNav(); }
  if (page === "home") { initHome(); }
  if (page === "products") { initProducts(); }
  if (page === "contacts") { initContacts(); }
  if (page === "about") { initAbout(); }
  if (page === "footer") { initFooter(); }
});

// ===== PORTFOLIO =====
const pfGrid = document.getElementById("pfGrid");

if (pfGrid) {
  // Add or edit your work here
  const pfItems = [
  // Exercises
  { title: "Exercise 1",  type: "Exercise", link: "work/exercise/EXE1_ALVARADO.html" },
  { title: "Exercise 2",  type: "Exercise", link: "work/exercise/EXE2_ALVARDO.html" },
  { title: "Exercise 3",  type: "Exercise", link: "work/exercise/EXE3_ALVARADO.html" },
  { title: "Exercise 4",  type: "Exercise", link: "work/exercise/EXE4_ALVARADO.html" },
  { title: "Exercise 5",  type: "Exercise", link: "work/exercise/EXE5_ALVARADO(1).html" },
  { title: "Exercise 6",  type: "Exercise", link: "work/exercise/EXE6_ALVARADO.html" },
  { title: "Exercise 7",  type: "Exercise", link: "work/exercise/EXE7_ALVARADO.html" },
  { title: "Exercise 8",  type: "Exercise", link: "work/exercise/EXE8_ALVARDO.html" },
  { title: "Exercise 9",  type: "Exercise", link: "work/exercise/EXE9_ALVARADO(1).html" },
  { title: "Exercise 10", type: "Exercise", link: "work/exercise/EXE10_ALVARADO.html" },
  { title: "Exercise 11", type: "Exercise", link: "work/exercise/EXE11_ALVARADO (1).html" },
  { title: "Exercise 12", type: "Exercise", link: "work/exercise/EXE12_ALVARADO.html" },

  // Activities
  { title: "Activity 1", type: "Activity", link: "work/activities/ACT1_ALVARADO.html" },
  { title: "Activity 2", type: "Activity", link: "work/activities/ACT2_ALVARADO.html" },
  { title: "Activity 3", type: "Activity", link: "work/activities/ACT3_ALVARADO.html" },
  { title: "Activity 4", type: "Activity", link: "work/activities/ACT4_ALVARADO.html" },
  { title: "Activity 5", type: "Activity", link: "work/activities/ACT5_ALVARADO.html" }
];

  // Change this to the tools you really used
  const pfSkills = ["HTML", "CSS", "JavaScript"];

  // Counters
  document.getElementById("pfTotal").textContent = pfItems.length;
  document.getElementById("pfEx").textContent =
    pfItems.filter(i => i.type === "Exercise").length;
  document.getElementById("pfAct").textContent =
    pfItems.filter(i => i.type === "Activity").length;

  // Skills chips
  document.getElementById("pfSkills").innerHTML =
    pfSkills.map(s => `<span class="chip">${s}</span>`).join("");

  // Show the cards (filtered by type)
  function showItems(type) {
    const list = type === "All" ? pfItems : pfItems.filter(i => i.type === type);
    pfGrid.innerHTML = list.map(i => `
      <a class="pf-card" href="${i.link}" target="_blank">
        <h3>${i.title}</h3>
        <span>${i.type}</span>
      </a>
    `).join("");
  }

  // Filter buttons
  const pfButtons = document.querySelectorAll("#pfFilters button");
  pfButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      pfButtons.forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
      showItems(btn.dataset.type);
    });
  });

  showItems("All");
}

function showItems(type) {
  const list = type === "All" ? pfItems : pfItems.filter(i => i.type === type);
  pfGrid.innerHTML = list.map((i, n) => `
    <a class="pf-card ${i.type.toLowerCase()}" href="${encodeURI(i.link)}" target="_blank"
       style="animation-delay:${n * 40}ms">
      <div class="pf-icon">${i.type === "Exercise" ? "💻" : "📁"}</div>
      <h3>${i.title}</h3>
      <span class="pf-tag">${i.type}</span>
      <span class="pf-open">Open →</span>
    </a>
  `).join("");
}