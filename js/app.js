// ============================================================
// चावडी — फ्रंटएंड लॉजिक
// Reads content/news.json (written by the admin panel at /admin)
// and renders it. No backend/server needed — this is why it works
// on plain GitHub Pages.
// ============================================================

const CATEGORY_LABELS = {
  sampadkiya: "संपादकीय",
  kalaaanisanskruti: "कला आणि संस्कृती",
  krida: "क्रीडा",
  rajkaran: "राजकारण",
  arthavyavastha: "अर्थव्यवस्था",
  sthanik: "स्थानिक",
  arogya: "आरोग्य",
  aantararashtriya: "आंतरराष्ट्रीय"
};

function categoryLabel(cat) {
  return CATEGORY_LABELS[cat] || cat || "";
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString("mr-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  } catch (e) {
    return d;
  }
}

async function fetchNews() {
  const res = await fetch("content/news.json", { cache: "no-store" });
  if (!res.ok) throw new Error("बातम्या लोड करता आल्या नाहीत");
  const data = await res.json();
  const items = Array.isArray(data.items) ? data.items.slice() : [];
  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  return items;
}

function newsCardHTML(item) {
  const img = item.image
    ? `<img src="${item.image}" alt="${item.title}" loading="lazy">`
    : "";
  return `
    <a class="news-card" href="article.html?id=${encodeURIComponent(item.id)}">
      ${img}
      <div class="news-card-body">
        <span class="news-category">${categoryLabel(item.category)}</span>
        <h3>${item.title}</h3>
        <p>${item.excerpt || ""}</p>
        <span class="news-date">${formatDate(item.date)}</span>
      </div>
    </a>
  `;
}

async function renderNewsGrid(targetId, filterCategory) {
  const grid = document.getElementById(targetId);
  if (!grid) return;
  try {
    let items = await fetchNews();
    if (filterCategory) {
      items = items.filter((i) => i.category === filterCategory);
    }
    if (!items.length) {
      grid.innerHTML = `<p class="no-news">लवकरच बातम्या येथे दिसतील...</p>`;
      return;
    }
    grid.innerHTML = items.map(newsCardHTML).join("");
  } catch (e) {
    grid.innerHTML = `<p class="no-news">बातम्या लोड करताना अडचण आली.</p>`;
    console.error(e);
  }
}

function textToParagraphs(text) {
  return (text || "")
    .split(/\n\s*\n/)
    .filter((p) => p.trim())
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

async function renderArticle(targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  try {
    const items = await fetchNews();
    const item = items.find((i) => i.id === id);
    if (!item) {
      container.innerHTML = `<p class="no-news">बातमी सापडली नाही.</p>`;
      return;
    }
    document.title = item.title + " — चावडी न्यूज";

    const img = item.image
      ? `<img class="article-image" src="${item.image}" alt="${item.title}">`
      : "";

    // Subtitle — bold, shown right under the title
    const subtitleHtml = item.subtitle
      ? `<p class="article-subtitle">${item.subtitle}</p>`
      : "";

    // Body Part 1 (normal color) and Body Part 2 (distinct color, separated)
    const bodyHtml = textToParagraphs(item.body);
    const body2Html = item.body2
      ? `<div class="article-body-2">${textToParagraphs(item.body2)}</div>`
      : "";

    // Extra images (image2, image3, image4)
    const extraImages = [item.image2, item.image3, item.image4].filter(Boolean);
    const extraImagesHtml = extraImages.length
      ? `<div class="article-extra-images">${extraImages
          .map((src) => `<img src="${src}" alt="${item.title}" loading="lazy">`)
          .join("")}</div>`
      : "";

    container.innerHTML = `
      <span class="news-category">${categoryLabel(item.category)}</span>
      <h1>${item.title}</h1>
      ${subtitleHtml}
      <div class="article-meta">
        <span>${item.author || ""}</span>
        <span>•</span>
        <span>${formatDate(item.date)}</span>
      </div>
      ${img}
      <div class="article-body">${bodyHtml}</div>
      ${body2Html}
      ${extraImagesHtml}
      <a class="back-link" href="index.html">← मुख्यपृष्ठावर परत जा</a>
    `;
  } catch (e) {
    container.innerHTML = `<p class="no-news">बातमी लोड करताना अडचण आली.</p>`;
    console.error(e);
  }
}