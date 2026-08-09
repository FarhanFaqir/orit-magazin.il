// ── CODE INJECTOR ──
// Loads tracking codes from Firebase (/settings/codes) and injects them into
// the page. Falls back to the old per-key localStorage values if Firebase
// isn't available, so the site doesn't lose tracking if the DB is briefly down.

function injectSavedCodes() {
  // אל תפעיל פיקסלים/אנליטיקס אמיתיים בתוך ה-iframe של תצוגה מקדימה חיה
  // בעורך — זו לא צפייה אמיתית של מבקר.
  if (new URLSearchParams(location.search).get('preview') === '1') return;
  getStoredCodes().then(codes => {
    if (!codes) return;
    if (codes.gtm)    injectGTM(codes.gtm);
    if (codes.fb)     injectFacebookPixel(codes.fb);
    if (codes.ga)     injectGA4(codes.ga);
    if (codes.hj)     injectHotjar(codes.hj);
    if (codes.tb)     injectCustomCode(codes.tb);
    if (codes.ob)     injectCustomCode(codes.ob);
    if (codes.custom) injectCustomCode(codes.custom);
    // קוד המרה ייעודי לעמוד תודה (Facebook Lead event / Google Ads
    // conversion וכו') — צריך לרוץ פעם אחת, רק כשליד באמת נשלח, לא בכל
    // ביקור ישיר/רענון/שיתוף של הקישור. הטופס מסמן דגל חד-פעמי ב-
    // sessionStorage ממש לפני ההפניה; אם הדגל לא קיים, זו לא המרה
    // אמיתית ולא מזריקים את הפיקסל. הדגל מוסר מיד אחרי הבדיקה כדי
    // שרענון של העמוד לא יירה שוב.
    if (codes.thankYou && /(^|\/)thank-you\.html$/.test(location.pathname)) {
      var isRealConversion = false;
      try { isRealConversion = sessionStorage.getItem('pulsar_conversion_pending') === '1'; } catch (e) {}
      if (isRealConversion) {
        try { sessionStorage.removeItem('pulsar_conversion_pending'); } catch (e) {}
        injectCustomCode(codes.thankYou);
      }
    }
  }).catch(err => console.error('❌ Failed to load tracking codes:', err));
}

function getStoredCodes() {
  if (typeof database !== 'undefined') {
    return database.ref('settings/codes').once('value').then(snap => snap.val() || {});
  }
  // Fallback — old localStorage keys
  return Promise.resolve({
    gtm: localStorage.getItem('code_gtm'),
    fb: localStorage.getItem('code_fb'),
    ga: localStorage.getItem('code_ga'),
    hj: localStorage.getItem('code_hj'),
    tb: localStorage.getItem('code_tb'),
    ob: localStorage.getItem('code_ob'),
    custom: localStorage.getItem('code_custom'),
    thankYou: localStorage.getItem('code_thankYou')
  });
}

// ── INJECT GTM ──
function injectGTM(gtmId) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gtmId}`;
  document.head.appendChild(script);
  
  const scriptInline = document.createElement('script');
  scriptInline.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gtmId}');
  `;
  document.head.appendChild(scriptInline);
  
  console.log('✅ GTM injected:', gtmId);
}

// ── INJECT FACEBOOK PIXEL ──
function injectFacebookPixel(fbId) {
  const scriptInline = document.createElement('script');
  scriptInline.textContent = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${fbId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(scriptInline);
  
  // Noscript fallback
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${fbId}&ev=PageView&noscript=1"/>`;
  document.body.appendChild(noscript);
  
  console.log('✅ Facebook Pixel injected:', fbId);
}

// ── INJECT GOOGLE ANALYTICS 4 ──
function injectGA4(gaId) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);
  
  const scriptInline = document.createElement('script');
  scriptInline.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}');
  `;
  document.head.appendChild(scriptInline);
  
  console.log('✅ Google Analytics 4 injected:', gaId);
}

// ── INJECT HOTJAR ──
function injectHotjar(hjId) {
  const scriptInline = document.createElement('script');
  scriptInline.textContent = `
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${hjId},hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  `;
  document.head.appendChild(scriptInline);
  
  console.log('✅ Hotjar injected:', hjId);
}

// ── INJECT CUSTOM CODE ──
function injectCustomCode(code) {
  try {
    // If it's HTML/Script tag
    if (code.includes('<') && code.includes('>')) {
      const container = document.createElement('div');
      container.innerHTML = code;
      
      // Move scripts to head/body
      const scripts = container.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.textContent = script.textContent;
        newScript.src = script.src;
        newScript.async = script.async;
        document.head.appendChild(newScript);
      });
      
      // Move other elements to body
      const others = container.querySelectorAll('*:not(script)');
      others.forEach(el => {
        document.body.appendChild(el.cloneNode(true));
      });
    } else {
      // Assume it's JavaScript
      eval(code);
    }
    
    console.log('✅ Custom code injected');
  } catch (error) {
    console.error('❌ Error injecting custom code:', error);
  }
}

// ── AUTO INJECT ON PAGE LOAD ──
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectSavedCodes);
} else {
  injectSavedCodes();
}

console.log('🎯 Code Injector loaded');
