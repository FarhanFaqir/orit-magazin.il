// ── FIREBASE ARTICLES MANAGER ──
// Replaces localStorage with Firebase Realtime Database

const ARTICLES_DB_PATH = 'articles';

// DEFAULT ARTICLES - will be synced to Firebase on first load
const DEFAULT_ARTICLES = [
  {
    id: '16',
    title: 'מהפכה בהסרת נקודות חן, שומות, סרחי עור ונגעי עור — בטיפול אחד בלבד, בלי כאב ובלי צלקות',
    category: 'קוסמטיקה',
    emoji: '✨',
    excerpt: 'מיליוני ישראלים בכל גיל מתמודדים עם נגעי עור לא אסתטיים ולא רצויים.',
    content: `<p>מיליוני ישראלים בכל גיל מתמודדים עם נגעי עור לא אסתטיים ולא רצויים: נקודות חן, שומות, נקודות חן אדומות, סרחי עור, כתמי גיל ונגעים בולטים או שטוחים.</p>`,
    date: '2025-08-04',
    readTime: '5',
    featured: true
  }
];

let articlesCache = [];

// ── LOAD ARTICLES FROM FIREBASE ──
function loadArticlesFromFirebase() {
  database.ref(ARTICLES_DB_PATH).on('value', (snapshot) => {
    if (snapshot.exists()) {
      articlesCache = Object.values(snapshot.val());
    } else {
      // First time - initialize with default articles
      initializeDefaultArticles();
    }
    renderHomePage();
  });
}

// ── INITIALIZE DEFAULT ARTICLES TO FIREBASE ──
function initializeDefaultArticles() {
  const articlesObj = {};
  DEFAULT_ARTICLES.forEach(article => {
    articlesObj[article.id] = article;
  });
  database.ref(ARTICLES_DB_PATH).set(articlesObj);
  articlesCache = DEFAULT_ARTICLES;
}

// ── ADD NEW ARTICLE ──
function addArticle(article) {
  if (!article.id) article.id = String(Date.now());
  database.ref(`${ARTICLES_DB_PATH}/${article.id}`).set(article)
    .then(() => {
      console.log('✅ Article added to Firebase');
    })
    .catch(err => console.error('Error adding article:', err));
}

// ── UPDATE ARTICLE ──
function updateArticle(id, updates) {
  database.ref(`${ARTICLES_DB_PATH}/${id}`).update(updates)
    .then(() => {
      console.log('✅ Article updated in Firebase');
    })
    .catch(err => console.error('Error updating article:', err));
}

// ── DELETE ARTICLE ──
function deleteArticle(id) {
  database.ref(`${ARTICLES_DB_PATH}/${id}`).remove()
    .then(() => {
      console.log('✅ Article deleted from Firebase');
    })
    .catch(err => console.error('Error deleting article:', err));
}

// ── GET ARTICLE BY ID ──
function getArticleById(id) {
  return articlesCache.find(a => a.id === id);
}

// ── GET ALL ARTICLES ──
function getAllArticles() {
  return articlesCache;
}

// ── GET FEATURED ARTICLES ──
function getFeaturedArticles() {
  return articlesCache.filter(a => a.featured);
}

// ── GET ARTICLES BY CATEGORY ──
function getArticlesByCategory(category) {
  return articlesCache.filter(a => a.category === category);
}

// ── RENDER HOME PAGE ──
function renderHomePage() {
  const container = document.querySelector('.articles-grid');
  if (!container) return;
  
  container.innerHTML = '';
  const featured = getFeaturedArticles();
  
  featured.forEach(article => {
    const card = document.createElement('article');
    card.className = 'article-card';
    card.innerHTML = `
      <a href="article.html?id=${article.id}" class="article-link">
        <div class="article-emoji">${article.emoji}</div>
        <div class="article-cat">${article.category}</div>
        <h2>${article.title}</h2>
        <p>${article.excerpt}</p>
        <div class="article-meta">
          <span>${formatDate(article.date)}</span>
          <span>${article.readTime} דקות</span>
        </div>
      </a>
    `;
    container.appendChild(card);
  });
}

// ── FORMAT DATE ──
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ── INITIALIZE ON PAGE LOAD ──
document.addEventListener('DOMContentLoaded', () => {
  loadArticlesFromFirebase();
});

console.log('✅ Firebase Articles Manager Loaded');
