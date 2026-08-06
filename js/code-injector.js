// ── CODE INJECTOR ──
// Loads codes from localStorage and injects them into the page

function injectSavedCodes() {
  // Google Tag Manager
  const gtmId = localStorage.getItem('code_gtm');
  if (gtmId) {
    injectGTM(gtmId);
  }
  
  // Facebook Pixel
  const fbId = localStorage.getItem('code_fb');
  if (fbId) {
    injectFacebookPixel(fbId);
  }
  
  // Google Analytics 4
  const gaId = localStorage.getItem('code_ga');
  if (gaId) {
    injectGA4(gaId);
  }
  
  // Hotjar
  const hjId = localStorage.getItem('code_hj');
  if (hjId) {
    injectHotjar(hjId);
  }
  
  // Taboola
  const tbCode = localStorage.getItem('code_tb');
  if (tbCode) {
    injectCustomCode(tbCode);
  }
  
  // Outbrain
  const obCode = localStorage.getItem('code_ob');
  if (obCode) {
    injectCustomCode(obCode);
  }
  
  // Custom Code
  const customCode = localStorage.getItem('code_custom');
  if (customCode) {
    injectCustomCode(customCode);
  }
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
