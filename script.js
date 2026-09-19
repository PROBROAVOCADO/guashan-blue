/* =========================================
   卦山藍 Guashan Blue — script.js
   ========================================= */

// 原試算表的 GAS Web App 網址；這裡使用 /exec，不是試算表共享網址。
// A 欄可使用 content-keys.js 中的中文名稱；程式仍相容既有英文欄位。
const GAS_URL = "https://script.google.com/macros/s/AKfycbxnyhzKR2JN3G1f_nosQm9M8DhsXpqKrnwFcSajrQxaNCsmSScYdek8-Ljp6Kyrcrc/exec";

// 本機預設內容：GAS 還沒接上前，網站會先顯示這裡的文字/連結
// 之後這些值都會被 Google 試算表的內容取代
const DEFAULT_CONTENT = {
  "hero-eyebrow": "八卦山｜藍莓園",
  "hero-title": "山霧養出的\n一口清甜",
  "hero-sub": "卦山藍，把八卦山的日夜溫差，種進每一顆果實裡。",
  "story-title": "在山裡，慢慢等一顆果實熟成",
  "story-body-1": "卦山藍位於八卦山區，日夜溫差與丘陵地形讓藍莓有更飽滿的甜度與香氣。我們相信好的果實需要時間，不急著催熟，也不使用不必要的化學藥劑。",
  "story-body-2": "從整地、定植到採收，每一株藍莓都經過細心照料，希望讓吃到卦山藍的人，都能嚐出這片山的味道。",
  "stat-1-num": "—", "stat-1-label": "園區面積",
  "stat-2-num": "—", "stat-2-label": "栽培品種",
  "stat-3-num": "—", "stat-3-label": "友善耕作",
  "products-title": "卦山藍的果實",
  "product-1-title": "鮮採藍莓",
  "product-1-desc": "產季限定，每週採收直送，顆顆飽滿多汁。",
  "product-2-title": "藍莓加工品",
  "product-2-desc": "果醬、果乾等加工品，延續產季外的好滋味。",
  "product-3-title": "園區採果體驗",
  "product-3-desc": "親自走進果園，體驗現採現吃的樂趣。",
  "faq-title": "FAQ",
  "faq-1-q": "藍莓的產季是什麼時候？",
  "faq-1-a": "內容準備中，實際產季將於此處公告。",
  "faq-2-q": "可以到現場採果嗎？",
  "faq-2-a": "內容準備中，開放時間與預約方式將於此處公告。",
  "faq-3-q": "鮮果如何保存？",
  "faq-3-a": "內容準備中，保存方式將於此處公告。",
  "faq-4-q": "如何訂購或預約？",
  "faq-4-a": "請點選頁面上方「立即訂購」或「預約採果」按鈕，前往專屬頁面完成訂購與預約。",
  "cta-title": "準備好嚐一口卦山藍了嗎"
};

// 本機預設連結：同樣之後會被試算表內容取代
const DEFAULT_LINKS = {
  "order-url": "#",
  "reserve-url": "#",
  "fb-url": "#",
  "ig-url": "#",
  "line-url": "#"
};

// 將文字內容套用到頁面上所有 data-content 元素
// 試算表儲存格裡如果用 Alt+Enter（Mac 用 Option+Enter）換行，
// 這裡會自動把換行符號轉成網頁上的實際換行，不用打 <br> 語法
function applyContent(content){
  document.querySelectorAll("[data-content]").forEach(el => {
    const key = el.getAttribute("data-content");
    if (content[key] !== undefined) {
      el.textContent = String(content[key]);
    }
  });
}

// 將照片套用到頁面上所有 data-image 元素（例如產品卡片照片）
// 試算表對應欄位如果有填照片網址，就把灰色預留框換成真實照片；
// 沒有填就繼續顯示「商品照片」的預留框，不會壞版。
function applyImages(content){
  document.querySelectorAll("[data-image]").forEach(el => {
    const key = el.getAttribute("data-image");
    const url = safeHttpUrl(content[key]);
    if (url){
      const img = document.createElement("img");
      img.src = url;
      img.alt = "";
      img.loading = "lazy";
      el.replaceChildren(img);
      el.classList.add("has-image");
    }
  });
}

// 將連結套用到頁面上所有 data-link 元素
function applyLinks(links){
  document.querySelectorAll("[data-link]").forEach(el => {
    const key = el.getAttribute("data-link");
    const url = safeHttpUrl(links[key]);
    if (url) {
      el.setAttribute("href", url);
    }
  });
}

// A 欄的「果園照片1、果園照片2…」會先對應為 story-image-1、story-image-2…，
// 依數字順序排好，回傳網址陣列給輪播使用。
// 之後要加照片，在「品牌故事」分頁 A 欄接著新增「果園照片8、果園照片9…」，
// 不用改這裡的程式碼。
function getStoryImageUrls(content){
  return Object.keys(content)
    .map(key => {
      const match = key.match(/^story-image-(\d+)$/);
      return match ? { num: parseInt(match[1], 10), url: safeHttpUrl(content[key]) } : null;
    })
    .filter(item => item && item.url)
    .sort((a, b) => a.num - b.num)
    .map(item => item.url);
}

function safeHttpUrl(value){
  if (typeof value !== "string" || !value.trim()) return "";
  try { const url = new URL(value.trim()); return ["https:", "http:"].includes(url.protocol) ? url.href : ""; }
  catch { return ""; }
}

function isEnabled(value, fallback = false){
  if (value === undefined) return fallback;
  return value === true || String(value).trim().toLowerCase() === "true";
}

function applyProductVisibility(content){
  const section = document.getElementById("products");
  if (!section) return;
  let count = 0;
  section.querySelectorAll("[data-product]").forEach(card => {
    card.hidden = !isEnabled(content["顯示產品" + card.dataset.product], true);
    if (!card.hidden) count++;
  });
  section.querySelector(".product-grid").dataset.visibleCount = String(count);
  section.hidden = !isEnabled(content["顯示產品區"], true) || count === 0;
  document.querySelectorAll("[data-products-nav]").forEach(el => { el.hidden = section.hidden; });
}

// 新增位置欄位直接使用中文名稱。現有 GAS 會原樣回傳，無須更換部署。
// 地址是唯一來源：地圖、可點擊地址和導航按鈕都由同一個值產生。
function getLocationConfig(content){
  const address = typeof content["園區地址"] === "string" ? content["園區地址"].trim() : "";
  const enabled = content["顯示位置資訊"];
  const visible = address !== "" && isEnabled(enabled);
  const label = typeof content["導航按鈕文字"] === "string" ? content["導航按鈕文字"].trim() : "";
  if (!visible) return { visible: false };
  const directions = new URL("https://www.google.com/maps/dir/");
  directions.search = new URLSearchParams({ api: "1", destination: address, travelmode: "driving", dir_action: "navigate" }).toString();
  // 直接使用 Google 回傳的嵌入格式，避免一般 maps 搜尋網址的跨頁轉址。
  const utf8 = encodeURIComponent(address).replace(/%([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  const encodedAddress = btoa(utf8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const map = new URL("https://www.google.com/maps/embed");
  map.search = new URLSearchParams({ pb: "!1m3!2m1!1z" + encodedAddress + "!6i16!3m1!1szh-TW!5m1!1szh-TW" }).toString();
  const search = new URL("https://www.google.com/maps/search/");
  search.search = new URLSearchParams({ api:"1", query:address }).toString();
  return { visible: true, address, label: label || "開啟 Google Maps 導航", directionsUrl: directions.href, mapUrl: map.href, searchUrl:search.href };
}

let cleanupLocationMap = () => {};
function applyLocation(content){
  cleanupLocationMap();
  const section = document.getElementById("location");
  if (!section) return;
  const config = getLocationConfig(content);
  const frame = document.getElementById("locationMap");
  const address = document.getElementById("locationAddress");
  const directions = document.getElementById("locationDirections");
  const external = document.getElementById("locationMapLink");
  const status = document.getElementById("mapStatus");
  section.hidden = !config.visible;
  document.querySelectorAll("[data-location-nav]").forEach(el => { el.hidden = !config.visible; });
  if (!config.visible){
    frame.removeAttribute("src");
    address.removeAttribute("href");
    directions.removeAttribute("href");
    external.removeAttribute("href");
    address.textContent = "";
    return;
  }
  address.textContent = config.address;
  address.href = config.directionsUrl;
  directions.textContent = config.label;
  directions.href = config.directionsUrl;
  external.href = config.searchUrl;
  status.hidden = false;
  status.textContent = "正在載入 Google 地圖…若未顯示，請點下方開啟地圖。";
  frame.title = "卦山藍園區位置：" + config.address;
  // iframe 的跨來源內容無法可靠判斷成功；保留獨立地圖連結，不以 load 事件宣稱成功。
  const timer = setTimeout(() => { status.textContent = "地圖未顯示？可直接開啟 Google Maps 查看位置。"; }, 12000);
  cleanupLocationMap = () => clearTimeout(timer);
  frame.src = config.mapUrl;
}

// 讀取試算表內容（透過 GAS Web App 回傳的 JSON）
// 預期格式：{ content: {...同 DEFAULT_CONTENT 的 key}, links: {...同 DEFAULT_LINKS 的 key} }
async function loadSiteContent(){
  // 先套用本機預設內容，確保沒接 GAS 前頁面也完整可看
  applyContent(DEFAULT_CONTENT);
  applyLinks(DEFAULT_LINKS);

  if (!GAS_URL){ setupCarousel(); return; }

  let urls = [];
  try{
    const data = await fetchSiteData();
    if (data.content) {
      const content = SITE_CONTENT_KEYS.normalize(data.content);
      applyLocation(content);
      applyProductVisibility(content);
      applyContent(content);
      applyImages(content);
      urls = getStoryImageUrls(content);
    }
    if (data.links) applyLinks(SITE_CONTENT_KEYS.normalize(data.links));
  }catch(err){
    console.warn("讀取 Google 試算表內容失敗，改用預設內容：", err);
  }finally{
    setupCarousel(urls); // 資料讀完才初始化一次；預設畫面不另啟動輪播。
  }
}

async function fetchSiteData(){
  // 避免快取舊的 GAS 轉址，並限制等待時間；失敗最多重試一次。
  for (let attempt = 0; attempt < 2; attempt++){
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    try{
      const endpoint = new URL(GAS_URL);
      endpoint.searchParams.set("v", Date.now() + "-" + attempt);
      const response = await fetch(endpoint.href, { signal:controller.signal, cache:"no-store" });
      if (!response.ok) throw new Error("內容服務回應 " + response.status);
      const data = await response.json();
      if (!data || !data.content || typeof data.content !== "object" || Array.isArray(data.content)) throw new Error("內容格式不正確");
      return data;
    }catch(error){ if (attempt === 1) throw error; }
    finally { clearTimeout(timeout); }
  }
}

// 果園照片輪播
// 試算表「品牌故事」分頁填寫「果園照片1、果園照片2…」（每列一張），
// 會自動把預留位置換成真實照片；沒有填就繼續顯示灰色預留框。
let cleanupCarousel = () => {};
function setupCarousel(imageUrls){
  cleanupCarousel();
  cleanupCarousel = () => {};
  const carousel = document.getElementById("storyCarousel");
  if (!carousel) return;

  const track = document.getElementById("storyCarouselTrack");
  const dotsWrap = document.getElementById("storyDots");
  const prevBtn = document.getElementById("storyPrev");
  const nextBtn = document.getElementById("storyNext");
  const pauseBtn = document.getElementById("storyPause");
  const events = new AbortController();
  const listen = (el, type, handler) => el.addEventListener(type, handler, { signal:events.signal });

  // 如果有從試算表帶入的照片網址，就用真實照片取代預留框
  const urls = (imageUrls || []).map(safeHttpUrl).filter(Boolean);
  if (Array.isArray(imageUrls)){
    const children = urls.map((url, i) => {
      const slide = document.createElement("div"); slide.className = "carousel-slide";
      const img = document.createElement("img"); img.src = url;
      img.alt = "卦山藍果園照片 " + (i + 1); img.loading = i === 0 ? "eager" : "lazy";
      slide.appendChild(img); return slide;
    });
    if (children.length === 0){
      const slide = document.createElement("div"); slide.className = "carousel-slide";
      const placeholder = document.createElement("div"); placeholder.className = "image-placeholder";
      placeholder.textContent = "果園照片準備中"; slide.appendChild(placeholder); children.push(slide);
    }
    track.replaceChildren(...children);
  }

  const slides = track.querySelectorAll(".carousel-slide");
  const total = slides.length;
  if (total === 0) return;

  let current = 0;
  let timer = null;
  let paused = false;
  let hovered = false;
  let focused = false;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canAutoplay = urls.length > 1;
  prevBtn.hidden = nextBtn.hidden = total <= 1;
  dotsWrap.hidden = total <= 1;
  pauseBtn.hidden = !canAutoplay;

  dotsWrap.innerHTML = Array.from({ length: total }, (_, i) =>
    `<button aria-label="第 ${i + 1} 張" class="${i === 0 ? "active" : ""}"></button>`
  ).join("");
  const dots = dotsWrap.querySelectorAll("button");

  function goTo(index){
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  function startAutoplay(){
    stopAutoplay();
    if (!canAutoplay || paused || hovered || focused || document.hidden || motion.matches) return;
    timer = setInterval(() => goTo(current + 1), 5000);
  }
  function stopAutoplay(){
    clearInterval(timer);
    timer = null;
  }

  listen(prevBtn, "click", () => { goTo(current - 1); startAutoplay(); });
  listen(nextBtn, "click", () => { goTo(current + 1); startAutoplay(); });
  dots.forEach((dot, i) => listen(dot, "click", () => { goTo(i); startAutoplay(); }));
  listen(carousel, "mouseenter", () => { hovered = true; stopAutoplay(); });
  listen(carousel, "mouseleave", () => { hovered = false; startAutoplay(); });
  listen(carousel, "focusin", () => { focused = true; stopAutoplay(); });
  listen(carousel, "focusout", event => { focused = carousel.contains(event.relatedTarget); startAutoplay(); });
  listen(document, "visibilitychange", startAutoplay);
  listen(motion, "change", startAutoplay);
  listen(pauseBtn, "click", () => {
    paused = !paused;
    pauseBtn.textContent = paused ? "播放" : "暫停";
    pauseBtn.setAttribute("aria-label", paused ? "播放照片輪播" : "暫停照片輪播");
    startAutoplay();
  });
  pauseBtn.textContent = "暫停";
  pauseBtn.setAttribute("aria-label", "暫停照片輪播");
  cleanupCarousel = () => { stopAutoplay(); events.abort(); };

  goTo(0);
  startAutoplay();
}

// FAQ 手風琴效果
function setupFAQ(){
  document.querySelectorAll(".faq-item").forEach(item => {
    const btn = item.querySelector(".faq-q");
    const answer = item.querySelector(".faq-a");
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(openItem => {
        openItem.classList.remove("open");
        openItem.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen){
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
}

// 手機版選單開關
function setupNavToggle(){
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  const setOpen = open => { nav.classList.toggle("open", open); toggle.setAttribute("aria-expanded", String(open)); toggle.setAttribute("aria-label", open ? "關閉選單" : "開啟選單"); };
  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", event => { if (event.key === "Escape" && nav.classList.contains("open")){ setOpen(false); toggle.focus(); } });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  loadSiteContent();
  setupFAQ();
  setupNavToggle();
});
