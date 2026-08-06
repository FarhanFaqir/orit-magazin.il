const SHEETS_CONFIG = {
  sheetsUrl: localStorage.getItem('sheets-api-url') || '',
  successMessage: '✅ תודה! הטופס נשלח בהצלחה',
  errorMessage: '❌ שגיאה בשליחה. נסה שנית.'
};

document.addEventListener('DOMContentLoaded', function() {
  const forms = document.querySelectorAll('.sheets-form');
  forms.forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (!SHEETS_CONFIG.sheetsUrl) {
        alert('צריך להגדיר Google Sheets URL בפנל הניהול');
        return;
      }
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      try {
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => { data[key] = value; });
        data['Timestamp'] = new Date().toLocaleString('he-IL');
        await fetch(SHEETS_CONFIG.sheetsUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: new URLSearchParams(data)
        });
        alert('✅ הטופס נשלח!');
        form.reset();
        if (submitBtn) submitBtn.disabled = false;
      } catch(e) {
        alert('❌ שגיאה');
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
});
