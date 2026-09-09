// ── ADMIN AUTH GATE ──
// שער כניסה לעמודי הניהול. חייב להיטען מיד אחרי js/firebase-config.js,
// ולפני הסקריפט של העמוד עצמו.
//
// למה דווקא שם: יצירת firebase.auth() לפני הקריאות הראשונות ל-database
// גורמת ל-SDK של Realtime Database להמתין לטוקן ההזדהות לפני שהוא שולח
// בקשות. אם הקובץ ייטען אחרי הסקריפט של העמוד, הקריאות הראשונות ייצאו
// בלי טוקן ויחזרו permission_denied גם כשהמשתמש מחובר.
//
// חשוב להבין: השכבה הזאת היא נוחות, לא אבטחה. ההגנה האמיתית על המידע
// היא ב-Database Rules בקונסולת Firebase — הן אלה שחוסמות קריאה של
// לידים ועריכת כתבות למי שלא מחובר. אפשר תמיד לעקוף את המסך הזה
// ב-DevTools, אבל בלי משתמש מחובר השרת פשוט לא יחזיר מידע.

(function () {
  if (typeof firebase === 'undefined' || typeof firebase.auth !== 'function') {
    console.error('❌ admin-auth.js: firebase-auth-compat.js חסר בעמוד הזה');
    return;
  }

  // חייב לרוץ עכשיו, לא בתוך callback — ראה ההסבר למעלה.
  var auth = firebase.auth();

  var STYLE = ''
    + '#admin-auth-gate{position:fixed;inset:0;z-index:99999;background:#f7f7f8;'
    + 'display:flex;align-items:center;justify-content:center;font-family:Heebo,Arial,sans-serif;direction:rtl}'
    + '#admin-auth-box{background:#fff;border:1px solid #e3e3e6;border-radius:10px;padding:34px 30px;'
    + 'width:min(370px,90vw);box-shadow:0 12px 40px rgba(0,0,0,.10);text-align:center}'
    + '#admin-auth-box h1{font-size:1.25rem;margin:0 0 6px;font-weight:900}'
    + '#admin-auth-box p{font-size:.85rem;color:#777;margin:0 0 22px}'
    + '#admin-auth-box input{width:100%;box-sizing:border-box;padding:11px 13px;margin-bottom:11px;'
    + 'border:1px solid #d9d9de;border-radius:6px;font-size:.95rem;font-family:inherit;direction:ltr;text-align:left}'
    + '#admin-auth-box input:focus{outline:none;border-color:#c8352a}'
    + '#admin-auth-box button{width:100%;padding:12px;background:#c8352a;color:#fff;border:0;border-radius:6px;'
    + 'font-size:.95rem;font-weight:700;font-family:inherit;cursor:pointer}'
    + '#admin-auth-box button:disabled{opacity:.55;cursor:default}'
    + '#admin-auth-err{color:#c8352a;font-size:.82rem;min-height:18px;margin-top:11px}'
    + '#admin-auth-signout{position:fixed;bottom:14px;left:14px;z-index:9999;background:#fff;'
    + 'border:1px solid #d9d9de;border-radius:20px;padding:7px 15px;font-size:.78rem;'
    + 'font-family:Heebo,Arial,sans-serif;cursor:pointer;color:#555;box-shadow:0 2px 8px rgba(0,0,0,.07)}';

  var style = document.createElement('style');
  style.textContent = STYLE;
  (document.head || document.documentElement).appendChild(style);

  // המסך נבנה מיד — עוד לפני שידוע אם יש משתמש מחובר — כדי שתוכן הניהול
  // לא יהבהב על המסך לרגע בכל טעינה.
  var gate = document.createElement('div');
  gate.id = 'admin-auth-gate';
  gate.innerHTML = ''
    + '<div id="admin-auth-box">'
    + '  <h1>ניהול האתר</h1>'
    + '  <p>נדרשת התחברות כדי להמשיך</p>'
    + '  <form id="admin-auth-form" hidden>'
    + '    <input type="email" id="admin-auth-email" placeholder="אימייל" autocomplete="username" required>'
    + '    <input type="password" id="admin-auth-pass" placeholder="סיסמה" autocomplete="current-password" required>'
    + '    <button type="submit" id="admin-auth-btn">כניסה</button>'
    + '    <div id="admin-auth-err"></div>'
    + '  </form>'
    + '</div>';

  function mountGate() {
    if (!document.body.contains(gate)) document.body.appendChild(gate);
  }
  if (document.body) mountGate();
  else document.addEventListener('DOMContentLoaded', mountGate);

  function showSignOutButton(user) {
    if (document.getElementById('admin-auth-signout')) return;
    var b = document.createElement('button');
    b.id = 'admin-auth-signout';
    b.textContent = '🚪 יציאה (' + (user.email || '') + ')';
    b.onclick = function () { auth.signOut().then(function () { location.reload(); }); };
    document.body.appendChild(b);
  }

  auth.onAuthStateChanged(function (user) {
    if (user) {
      if (gate.parentNode) gate.parentNode.removeChild(gate);
      if (document.body) showSignOutButton(user);
      else document.addEventListener('DOMContentLoaded', function () { showSignOutButton(user); });
      return;
    }
    // לא מחובר — חושפים את טופס ההתחברות בתוך המסך שכבר מוצג.
    mountGate();
    var form = document.getElementById('admin-auth-form');
    if (form) form.hidden = false;
  });

  document.addEventListener('submit', function (e) {
    if (!e.target || e.target.id !== 'admin-auth-form') return;
    e.preventDefault();
    var btn = document.getElementById('admin-auth-btn');
    var err = document.getElementById('admin-auth-err');
    var email = document.getElementById('admin-auth-email').value.trim();
    var pass = document.getElementById('admin-auth-pass').value;
    btn.disabled = true;
    err.textContent = '';
    auth.signInWithEmailAndPassword(email, pass)
      // רענון אחרי כניסה מוצלחת: קוד האתחול של עמוד הניהול כבר רץ (ונכשל)
      // כשעוד לא היה משתמש מחובר, אז הדרך הבטוחה להריץ אותו מחדש עם
      // ההרשאות הנכונות היא פשוט לטעון את העמוד שוב.
      .then(function () { location.reload(); })
      .catch(function (e2) {
        btn.disabled = false;
        err.textContent = (e2 && (e2.code === 'auth/invalid-credential' || e2.code === 'auth/wrong-password' || e2.code === 'auth/user-not-found'))
          ? 'אימייל או סיסמה שגויים'
          : 'שגיאת התחברות: ' + (e2 && e2.code ? e2.code : e2);
      });
  });
})();
