// 試算表中文名稱與網站內部欄位的對照。前端與 GAS 使用同一套規則。
const SITE_CONTENT_KEYS = (() => {
  const labels = {
    "hero-eyebrow": "首頁小標題",
    "hero-title": "首頁主標題",
    "hero-sub": "首頁簡介",
    "story-title": "品牌故事標題",
    "products-title": "產品區標題",
    "faq-title": "常見問題區標題",
    "cta-title": "底部邀請標題",
    "order-url": "訂購網址",
    "reserve-url": "採果預約網址",
    "fb-url": "Facebook網址",
    "ig-url": "Instagram網址",
    "line-url": "LINE網址"
  };
  const rules = [
    [/^story-body-(\d+)$/, /^品牌故事內文(\d+)$/, n => "品牌故事內文" + n, n => "story-body-" + n],
    [/^stat-(\d+)-num$/, /^園區資訊(\d+)數值$/, n => "園區資訊" + n + "數值", n => "stat-" + n + "-num"],
    [/^stat-(\d+)-label$/, /^園區資訊(\d+)名稱$/, n => "園區資訊" + n + "名稱", n => "stat-" + n + "-label"],
    [/^product-(\d+)-title$/, /^產品(\d+)名稱$/, n => "產品" + n + "名稱", n => "product-" + n + "-title"],
    [/^product-(\d+)-desc$/, /^產品(\d+)說明$/, n => "產品" + n + "說明", n => "product-" + n + "-desc"],
    [/^product-(\d+)-image$/, /^產品(\d+)圖片$/, n => "產品" + n + "圖片", n => "product-" + n + "-image"],
    [/^faq-(\d+)-q$/, /^常見問題(\d+)問題$/, n => "常見問題" + n + "問題", n => "faq-" + n + "-q"],
    [/^faq-(\d+)-a$/, /^常見問題(\d+)答案$/, n => "常見問題" + n + "答案", n => "faq-" + n + "-a"],
    [/^story-image-(\d+)$/, /^果園照片(\d+)$/, n => "果園照片" + n, n => "story-image-" + n]
  ];
  const reverse = Object.fromEntries(Object.entries(labels).map(([key, label]) => [label, key]));
  function toInternalKey(key) {
    if (typeof key !== "string") throw new TypeError("參數名稱必須是文字");
    if (Object.prototype.hasOwnProperty.call(reverse, key)) return reverse[key];
    for (const [, chinesePattern, , fromChinese] of rules) {
      const match = key.match(chinesePattern);
      if (match) return fromChinese(match[1]);
    }
    return key;
  }
  function toChineseKey(key) {
    const internal = toInternalKey(key);
    if (Object.prototype.hasOwnProperty.call(labels, internal)) return labels[internal];
    for (const [englishPattern, , toChinese] of rules) {
      const match = internal.match(englishPattern);
      if (match) return toChinese(match[1]);
    }
    return key;
  }
  function normalize(values) {
    const result = Object.create(null);
    for (const [key, value] of Object.entries(values)) {
      const internal = toInternalKey(key);
      if (Object.prototype.hasOwnProperty.call(result, internal)) throw new Error("參數重複：" + key);
      result[internal] = value;
    }
    return result;
  }
  return Object.freeze({ toInternalKey, toChineseKey, normalize });
})();

