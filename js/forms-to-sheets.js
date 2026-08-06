// ── FORMS → FIREBASE + GOOGLE SHEETS ──
// Every <form class="sheets-form"> on the page gets wired here.
//
// Leads are saved to Firebase (/leads) as the source of truth, and — if the
// admin has configured a Google Apps Script webhook URL — also forwarded to
// the client's Google Sheet as a convenient, human-friendly view. Either one
// succeeding counts as a successful submission; both are tried.
//
// The Sheets webhook URL itself now lives in Firebase (/settings/sheetsWebhookUrl),
// set via the admin panel's 📊 Sheets button. Falls back to the old
// localStorage key if Firebase isn't available for some reason.

document.addEventListener('DOMContentLoaded', function() {
  const forms = document.querySelectorAll('.sheets-form');
  if (!forms.length) return;

  forms.forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => { data[key] = value; });
      data['Timestamp'] = new Date().toLocaleString('he-IL');
      data['articleId'] = new URLSearchParams(location.search).get('id') || '';

      let savedAnywhere = false;

      // 1) Firebase — source of truth
      if (typeof database !== 'undefined') {
        try {
          await database.ref('leads').push(data);
          savedAnywhere = true;
        } catch (err) {
          console.error('❌ Firebase lead save failed:', err);
        }
      }

      // 2) Google Sheets — optional forward, only if a webhook URL is configured
      try {
        const sheetsUrl = await getSheetsUrl();
        if (sheetsUrl) {
          await fetch(sheetsUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: new URLSearchParams(data)
          });
          savedAnywhere = true;
        }
      } catch (err) {
        console.error('❌ Sheets forward failed:', err);
      }

      if (submitBtn) submitBtn.disabled = false;

      if (savedAnywhere) {
        alert('✅ הטופס נשלח!');
        form.reset();
      } else {
        alert('❌ שגיאה בשליחה. נסה שנית.');
      }
    });
  });
});

function getSheetsUrl() {
  if (typeof database !== 'undefined') {
    return database.ref('settings/sheetsWebhookUrl').once('value')
      .then(snap => snap.val() || '')
      .catch(() => localStorage.getItem('sheets-api-url') || '');
  }
  return Promise.resolve(localStorage.getItem('sheets-api-url') || '');
}
