/* =========================================
   卦山藍 Guashan Blue — script.js
   ========================================= */

// ⚠️ 之後架好 GAS Web App 後，把網址貼在這裡即可自動生效
// 範例：const GAS_URL = "https://script.google.com/macros/s/xxxxx/exec";
const GAS_URL = "https://script.google.com/macros/s/AKfycbxnyhzKR2JN3G1f_nosQm9M8DhsXpqKrnwFcSajrQxaNCsmSScYdek8-Ljp6Kyrcrc/exec"; // 尚未設定，先留空

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
      el.innerHTML = content[key].replace(/\n/g, "<br>");
    }
  });
}

// 將連結套用到頁面上所有 data-link 元素
function applyLinks(links){
  document.querySelectorAll("[data-link]").forEach(el => {
    const key = el.getAttribute("data-link");
    if (links[key] !== undefined && links[key] !== "#") {
      el.setAttribute("href", links[key]);
    }
  });
}

// 讀取試算表內容（透過 GAS Web App 回傳的 JSON）
// 預期格式：{ content: {...同 DEFAULT_CONTENT 的 key}, links: {...同 DEFAULT_LINKS 的 key} }
async function loadSiteContent(){
  // 先套用本機預設內容，確保沒接 GAS 前頁面也完整可看
  applyContent(DEFAULT_CONTENT);
  applyLinks(DEFAULT_LINKS);

  if (!GAS_URL) return; // 尚未設定 GAS_URL，就使用預設內容

  try{
    const res = await fetch(GAS_URL);
    const data = await res.json();
    if (data.content) {
      applyContent(data.content);
      if (data.content["story-images"]) {
        const urls = data.content["story-images"].split(",").map(s => s.trim()).filter(Boolean);
        if (urls.length > 0) setupCarousel(urls);
      }
    }
    if (data.links) applyLinks(data.links);
  }catch(err){
    console.warn("讀取 Google 試算表內容失敗，改用預設內容：", err);
  }
}

// 果園照片輪播
// 之後若試算表的 story-images 欄位有填照片網址(用逗號分隔多張)，
// 會自動把預留位置換成真實照片；沒有填就繼續顯示灰色預留框。
function setupCarousel(imageUrls){
  const carousel = document.getElementById("storyCarousel");
  if (!carousel) return;

  const track = document.getElementById("storyCarouselTrack");
  const dotsWrap = document.getElementById("storyDots");
  const prevBtn = document.getElementById("storyPrev");
  const nextBtn = document.getElementById("storyNext");

  // 如果有從試算表帶入的照片網址，就用真實照片取代預留框
  if (imageUrls && imageUrls.length > 0){
    track.innerHTML = imageUrls.map((url, i) =>
      `<div class="carousel-slide"><img src="${url}" alt="卦山藍果園照片 ${i + 1}" loading="lazy"></div>`
    ).join("");
  }

  const slides = track.querySelectorAll(".carousel-slide");
  const total = slides.length;
  if (total === 0) return;

  let current = 0;
  let timer = null;

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
    timer = setInterval(() => goTo(current + 1), 5000);
  }
  function stopAutoplay(){
    clearInterval(timer);
  }

  prevBtn.addEventListener("click", () => { goTo(current - 1); stopAutoplay(); startAutoplay(); });
  nextBtn.addEventListener("click", () => { goTo(current + 1); stopAutoplay(); startAutoplay(); });
  dots.forEach((dot, i) => dot.addEventListener("click", () => { goTo(i); stopAutoplay(); startAutoplay(); }));

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);

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
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  setupCarousel(); // 先用預留框啟動輪播，確保沒接照片前也能看到輪播效果
  loadSiteContent();
  setupFAQ();
  setupNavToggle();
});
