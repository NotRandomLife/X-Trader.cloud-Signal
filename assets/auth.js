
(function(){
  const log=(...a)=>console.log("[XTR-Auth]",...a);

  // Language selection aligned with trade-ui.js
  function pickLang(){
    const I = window.I18N || {};
    const pref = localStorage.getItem('lang');
    const nav  = (navigator.language || 'en').toLowerCase();
    const html = (document.documentElement && document.documentElement.lang || 'en').toLowerCase();
    // Same priority: stored preference -> exact navigator -> base navigator -> html lang -> 'en'
    if (pref) return pref;
    if (I[nav]) return nav;
    const base = (nav.split('-')[0]||'en');
    if (I[base]) return base;
    if (I[html]) return html;
    const baseHtml = (html.split('-')[0]||'en');
    if (I[baseHtml]) return baseHtml;
    return (base || baseHtml || 'en');
  }

  const AUTH_I18N = {
    "en": {"title":"Account & Newsletter","email":"Email","password":"Password","register":"Register","login":"Login","google":"Continue with Google","newsletter":"Subscribe to newsletter","logout":"Sign out","status_in":"✅ Logged in","status_out":"🚪 Not logged in","missing_cfg":"Firebase config missing. Add window.XTRADER_FIREBASE_CONFIG to enable.","registration_ok":"Registration successful!","login_ok":"Logged in!","google_ok":"Google sign-in successful!","signout_ok":"Signed out."},
    "it": {"title":"Account & Newsletter","email":"Email","password":"Password","register":"Registrati","login":"Accedi","google":"Accedi con Google","newsletter":"Iscrivimi alla newsletter","logout":"Esci","status_in":"✅ Loggato","status_out":"🚪 Non loggato","missing_cfg":"Configurazione Firebase mancante. Aggiungi window.XTRADER_FIREBASE_CONFIG per abilitare.","registration_ok":"Registrazione completata!","login_ok":"Accesso eseguito!","google_ok":"Accesso Google riuscito!","signout_ok":"Disconnessione eseguita."},
    "es": {"title":"Cuenta y Newsletter","email":"Correo","password":"Contraseña","register":"Registrarse","login":"Iniciar sesión","google":"Continuar con Google","newsletter":"Suscribirme al newsletter","logout":"Cerrar sesión","status_in":"✅ Conectado","status_out":"🚪 No conectado","missing_cfg":"Falta configuración de Firebase. Añade window.XTRADER_FIREBASE_CONFIG.","registration_ok":"¡Registro exitoso!","login_ok":"¡Inicio de sesión correcto!","google_ok":"¡Acceso con Google correcto!","signout_ok":"Sesión cerrada."},
    "fr": {"title":"Compte & Newsletter","email":"Email","password":"Mot de passe","register":"S’inscrire","login":"Se connecter","google":"Continuer avec Google","newsletter":"S’abonner à la newsletter","logout":"Se déconnecter","status_in":"✅ Connecté","status_out":"🚪 Non connecté","missing_cfg":"Configuration Firebase manquante. Ajoutez window.XTRADER_FIREBASE_CONFIG.","registration_ok":"Inscription réussie !","login_ok":"Connexion réussie !","google_ok":"Connexion Google réussie !","signout_ok":"Déconnexion effectuée."},
    "de": {"title":"Konto & Newsletter","email":"E-Mail","password":"Passwort","register":"Registrieren","login":"Anmelden","google":"Mit Google fortfahren","newsletter":"Newsletter abonnieren","logout":"Abmelden","status_in":"✅ Angemeldet","status_out":"🚪 Nicht angemeldet","missing_cfg":"Firebase-Konfiguration fehlt. Fügen Sie window.XTRADER_FIREBASE_CONFIG hinzu.","registration_ok":"Registrierung erfolgreich!","login_ok":"Anmeldung erfolgreich!","google_ok":"Google-Anmeldung erfolgreich!","signout_ok":"Abgemeldet."},
    "pt": {"title":"Conta & Newsletter","email":"Email","password":"Senha","register":"Registrar","login":"Entrar","google":"Continuar com Google","newsletter":"Inscrever-me na newsletter","logout":"Sair","status_in":"✅ Conectado","status_out":"🚪 Desconectado","missing_cfg":"Configuração do Firebase ausente. Adicione window.XTRADER_FIREBASE_CONFIG.","registration_ok":"Registro concluído!","login_ok":"Login concluído!","google_ok":"Login com Google concluído!","signout_ok":"Sessão encerrada."},
    "ru": {"title":"Аккаунт и рассылка","email":"Email","password":"Пароль","register":"Регистрация","login":"Войти","google":"Войти через Google","newsletter":"Подписаться на рассылку","logout":"Выйти","status_in":"✅ В системе","status_out":"🚪 Не в системе","missing_cfg":"Отсутствует конфигурация Firebase. Добавьте window.XTRADER_FIREBASE_CONFIG.","registration_ok":"Регистрация успешна!","login_ok":"Вход выполнен!","google_ok":"Вход через Google выполнен!","signout_ok":"Вы вышли из системы."},
    "ja": {"title":"アカウント＆ニュースレター","email":"メール","password":"パスワード","register":"登録","login":"ログイン","google":"Googleで続行","newsletter":"ニュースレターを購読する","logout":"ログアウト","status_in":"✅ ログイン中","status_out":"🚪 未ログイン","missing_cfg":"Firebase設定がありません。window.XTRADER_FIREBASE_CONFIG を追加してください。","registration_ok":"登録に成功しました！","login_ok":"ログインしました！","google_ok":"Googleでのログインに成功！","signout_ok":"ログアウトしました。"},
    "zh": {"title":"账户与订阅","email":"邮箱","password":"密码","register":"注册","login":"登录","google":"使用 Google 登录","newsletter":"订阅新闻简报","logout":"退出登录","status_in":"✅ 已登录","status_out":"🚪 未登录","missing_cfg":"缺少 Firebase 配置。请添加 window.XTRADER_FIREBASE_CONFIG。","registration_ok":"注册成功！","login_ok":"登录成功！","google_ok":"Google 登录成功！","signout_ok":"已退出登录。"},
    "ar": {"title":"الحساب والنشرة البريدية","email":"البريد الإلكتروني","password":"كلمة المرور","register":"تسجيل","login":"تسجيل الدخول","google":"المتابعة باستخدام Google","newsletter":"اشترك في النشرة","logout":"تسجيل الخروج","status_in":"✅ مسجل الدخول","status_out":"🚪 غير مسجل الدخول","missing_cfg":"إعداد Firebase مفقود. أضف window.XTRADER_FIREBASE_CONFIG.","registration_ok":"تم التسجيل بنجاح!","login_ok":"تم تسجيل الدخول!","google_ok":"تم تسجيل الدخول عبر Google!","signout_ok":"تم تسجيل الخروج."},
    "tr": {"title":"Hesap & Bülten","email":"E-posta","password":"Şifre","register":"Kayıt ol","login":"Giriş yap","google":"Google ile devam et","newsletter":"Bültene abone ol","logout":"Çıkış","status_in":"✅ Giriş yapıldı","status_out":"🚪 Giriş yapılmadı","missing_cfg":"Firebase yapılandırması eksik. window.XTRADER_FIREBASE_CONFIG ekleyin.","registration_ok":"Kayıt başarılı!","login_ok":"Giriş başarılı!","google_ok":"Google ile giriş başarılı!","signout_ok":"Çıkış yapıldı."},
    "nl": {"title":"Account & Nieuwsbrief","email":"E-mail","password":"Wachtwoord","register":"Registreren","login":"Inloggen","google":"Doorgaan met Google","newsletter":"Inschrijven voor nieuwsbrief","logout":"Uitloggen","status_in":"✅ Aangemeld","status_out":"🚪 Niet aangemeld","missing_cfg":"Firebase-configuratie ontbreekt. Voeg window.XTRADER_FIREBASE_CONFIG toe.","registration_ok":"Registratie gelukt!","login_ok":"Inloggen gelukt!","google_ok":"Google-inloggen gelukt!","signout_ok":"Uitgelogd."},
    "pl": {"title":"Konto i newsletter","email":"Email","password":"Hasło","register":"Zarejestruj się","login":"Zaloguj się","google":"Kontynuuj z Google","newsletter":"Zapisz mnie do newslettera","logout":"Wyloguj","status_in":"✅ Zalogowano","status_out":"🚪 Wylogowano","missing_cfg":"Brak konfiguracji Firebase. Dodaj window.XTRADER_FIREBASE_CONFIG.","registration_ok":"Rejestracja zakończona sukcesem!","login_ok":"Zalogowano!","google_ok":"Logowanie przez Google udane!","signout_ok":"Wylogowano."},
    "uk": {"title":"Обліковий запис і розсилка","email":"Email","password":"Пароль","register":"Зареєструватися","login":"Увійти","google":"Продовжити з Google","newsletter":"Підписатися на розсилку","logout":"Вийти","status_in":"✅ Увійшли","status_out":"🚪 Не ввійшли","missing_cfg":"Відсутня конфігурація Firebase. Додайте window.XTRADER_FIREBASE_CONFIG.","registration_ok":"Реєстрація успішна!","login_ok":"Вхід успішний!","google_ok":"Вхід через Google успішний!","signout_ok":"Вийшли з системи."},
    "vi": {"title":"Tài khoản & Bản tin","email":"Email","password":"Mật khẩu","register":"Đăng ký","login":"Đăng nhập","google":"Tiếp tục với Google","newsletter":"Đăng ký nhận bản tin","logout":"Đăng xuất","status_in":"✅ Đã đăng nhập","status_out":"🚪 Chưa đăng nhập","missing_cfg":"Thiếu cấu hình Firebase. Thêm window.XTRADER_FIREBASE_CONFIG.","registration_ok":"Đăng ký thành công!","login_ok":"Đăng nhập thành công!","google_ok":"Đăng nhập Google thành công!","signout_ok":"Đã đăng xuất."},
    "id": {"title":"Akun & Newsletter","email":"Email","password":"Kata sandi","register":"Daftar","login":"Masuk","google":"Lanjut dengan Google","newsletter":"Langganan newsletter","logout":"Keluar","status_in":"✅ Masuk","status_out":"🚪 Belum masuk","missing_cfg":"Konfigurasi Firebase hilang. Tambahkan window.XTRADER_FIREBASE_CONFIG.","registration_ok":"Pendaftaran berhasil!","login_ok":"Berhasil masuk!","google_ok":"Masuk Google berhasil!","signout_ok":"Berhasil keluar."},
    "hi": {"title":"खाता और न्यूज़लेटर","email":"ईमेल","password":"पासवर्ड","register":"रजिस्टर","login":"लॉगिन","google":"Google से जारी रखें","newsletter":"न्यूज़लेटर की सदस्यता लें","logout":"लॉगआउट","status_in":"✅ लॉग इन","status_out":"🚪 लॉग इन नहीं","missing_cfg":"Firebase कॉन्फ़िग गायब है। window.XTRADER_FIREBASE_CONFIG जोड़ें।","registration_ok":"पंजीकरण सफल!","login_ok":"लॉगिन सफल!","google_ok":"Google लॉगिन सफल!","signout_ok":"लॉगआउट हो गया।"},
    "ko": {"title":"계정 & 뉴스레터","email":"이메일","password":"비밀번호","register":"회원가입","login":"로그인","google":"Google로 계속","newsletter":"뉴스레터 구독","logout":"로그아웃","status_in":"✅ 로그인됨","status_out":"🚪 로그아웃됨","missing_cfg":"Firebase 설정이 없습니다. window.XTRADER_FIREBASE_CONFIG를 추가하세요.","registration_ok":"가입 성공!","login_ok":"로그인 성공!","google_ok":"Google 로그인 성공!","signout_ok":"로그아웃되었습니다."}
  };

  function TA(k, lang){
    const L = AUTH_I18N[lang] || AUTH_I18N['en'];
    return (L && L[k]) || AUTH_I18N['en'][k] || k;
  }

  function localizeAuthUI(lang){
    const h3 = document.querySelector("#auth-box h3");
    const st = document.getElementById("auth-status");
    const le = document.querySelector("label[for='auth-email']");
    const lp = document.querySelector("label[for='auth-password']");
    const cb = document.querySelector("label[for='auth-newsletter']");
    const bReg = document.getElementById("btn-register");
    const bLog = document.getElementById("btn-login");
    const bGoo = document.getElementById("btn-google");
    const bOut = document.getElementById("btn-logout");
    const miss = document.getElementById("auth-missing-cfg");
    if(h3) h3.textContent = TA("title", lang);
    if(st) st.textContent = TA("status_out", lang);
    if(le) le.textContent = TA("email", lang);
    if(lp) lp.textContent = TA("password", lang);
    if(cb) cb.textContent = TA("newsletter", lang);
    if(bReg) bReg.textContent = TA("register", lang);
    if(bLog) bLog.textContent = TA("login", lang);
    if(bGoo) bGoo.textContent = TA("google", lang);
    if(bOut) bOut.textContent = TA("logout", lang);
    if(miss) miss.textContent = TA("missing_cfg", lang);
  }

  function ready(fn){ if(document.readyState!=="loading"){ fn(); } else { document.addEventListener("DOMContentLoaded", fn); } }

  let firebaseAvailable=false, app, auth, db;
  function hasFirebaseConfig(){
    return typeof window.XTRADER_FIREBASE_CONFIG === "object" && !!window.XTRADER_FIREBASE_CONFIG.apiKey;
  }
  function initFirebaseIfPossible(){
    try{
      if(!hasFirebaseConfig()){ return; }
      if(!window.firebase || !firebase.app){ return; }
      app = firebase.initializeApp(window.XTRADER_FIREBASE_CONFIG);
      auth = firebase.auth();
      db = firebase.firestore();
      firebaseAvailable = true;
      log("Firebase initialized.");
    }catch(e){
      log("Firebase init error:", e);
      firebaseAvailable = false;
    }
  }

  function ui(){
    const lang = pickLang();
    localizeAuthUI(lang);

    const status = document.getElementById("auth-status");
    const missing = document.getElementById("auth-missing-cfg");
    const email = document.getElementById("auth-email");
    const password = document.getElementById("auth-password");
    const cbNews = document.getElementById("auth-newsletter");
    const btnReg = document.getElementById("btn-register");
    const btnLogin = document.getElementById("btn-login");
    const btnGoogle = document.getElementById("btn-google");
    const btnLogout = document.getElementById("btn-logout");

    function setEnabled(enabled){
      [email, password, cbNews, btnReg, btnLogin, btnGoogle, btnLogout].forEach(el=>{
        if(el) el.disabled = !enabled;
      });
    }

    initFirebaseIfPossible();

    if(!firebaseAvailable){
      missing && (missing.style.display = "block");
      setEnabled(false);
    }else{
      missing && (missing.style.display = "none");
      setEnabled(true);
    }

    function setStatusSignedIn(inOut){
      if(status) status.textContent = inOut ? TA("status_in", lang) : TA("status_out", lang);
    }

    if(firebaseAvailable){
      auth.onAuthStateChanged(async (user)=>{
        setStatusSignedIn(!!user);
      });
    }else{
      setStatusSignedIn(false);
    }

    async function ensureNewsletter(user){
      if(!cbNews || !cbNews.checked || !user || !firebaseAvailable) return;
      try{
        await db.collection("newsletter").doc(user.uid).set({
          email: user.email || null,
          subscribed: true,
          ts: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }catch(e){ log("Newsletter write error:", e); }
    }

    btnReg && btnReg.addEventListener("click", async ()=>{
      try{
        if(!firebaseAvailable) throw new Error("Firebase not configured");
        const {user} = await auth.createUserWithEmailAndPassword(email.value.trim(), password.value);
        await ensureNewsletter(user);
        alert(TA("registration_ok", lang));
      }catch(e){
        alert(e.message || String(e));
      }
    });

    btnLogin && btnLogin.addEventListener("click", async ()=>{
      try{
        if(!firebaseAvailable) throw new Error("Firebase not configured");
        const {user} = await auth.signInWithEmailAndPassword(email.value.trim(), password.value);
        await ensureNewsletter(user);
        alert(TA("login_ok", lang));
      }catch(e){
        alert(e.message || String(e));
      }
    });

    btnGoogle && btnGoogle.addEventListener("click", async ()=>{
      try{
        if(!firebaseAvailable) throw new Error("Firebase not configured");
        const provider = new firebase.auth.GoogleAuthProvider();
        const {user} = await auth.signInWithPopup(provider);
        await ensureNewsletter(user);
        alert(TA("google_ok", lang));
      }catch(e){
        alert(e.message || String(e));
      }
    });

    btnLogout && btnLogout.addEventListener("click", async ()=>{
      try{
        if(!firebaseAvailable) throw new Error("Firebase not configured");
        await auth.signOut();
        alert(TA("signout_ok", lang));
      }catch(e){
        alert(e.message || String(e));
      }
    });
  }

  window.addEventListener('xtr:langchange', function(e){ try{ localizeAuthUI(e && e.detail && e.detail.lang); }catch(err){} });
  ready(ui);
})();
