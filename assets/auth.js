
(function(){
  const log=(...a)=>console.log("[XTR-Auth]",...a);

  function pickLang(){
    const I = window.I18N || {};
    const pref = localStorage.getItem('lang');
    const nav  = (navigator.language || 'en').toLowerCase();
    const html = (document.documentElement && document.documentElement.lang || 'en').toLowerCase();
    if (pref && I[pref]) return pref;
    if (I[nav]) return nav;
    const base=(nav.split('-')[0]||'en'); if(I[base]) return base;
    if (I[html]) return html;
    const baseHtml=(html.split('-')[0]||'en'); if(I[baseHtml]) return baseHtml;
    return 'en';
  }

  const L=window.AUTH_I18N || {};
  function TA(k,lang){ const LL=L[lang]||L['en']; return (LL&&LL[k])||(L['en']&&L['en'][k])||k; }

  function localizeAuthUI(lang){
    const map=[
      ["#auth-box h3","title"],["#auth-status","status_out"],
      ["label[for='auth-first']","first"],["label[for='auth-last']","last"],
      ["label[for='auth-email']","email"],["label[for='auth-phone']","phone"],
      ["label[for='auth-password']","password"],
      ["#btn-register","register"],["#btn-login","login"],["#btn-logout","logout"],
      ["#auth-missing-cfg","missing_cfg"]
    ];
    map.forEach(([sel,key])=>{ const el=document.querySelector(sel); if(el) el.textContent=TA(key,lang); });
  }

  function ready(fn){ if(document.readyState!=="loading"){ fn(); } else { document.addEventListener("DOMContentLoaded", fn); } }

  let firebaseAvailable=false, app, auth, db;
  function hasCfg(){
    try{
      if (typeof window.XTRADER_FIREBASE_CONFIG !== "object") return false;
      const c = window.XTRADER_FIREBASE_CONFIG||{};
      const required = ["apiKey","authDomain","projectId","appId"];
      for (var k of required){ if(!c[k] || /YOUR_/i.test(String(c[k])) ) return false; }
      return true;
    }catch(e){ return false; }
  }
  function initFirebase(){
    try{
      if(!hasCfg()) return;
      if(!window.firebase||!firebase.app) return;
      app=firebase.initializeApp(window.XTRADER_FIREBASE_CONFIG);
      auth=firebase.auth();
      db=firebase.firestore();
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});
      firebaseAvailable=true;
      log("Firebase initialized.");
    }catch(e){ log("Firebase init error",e); firebaseAvailable=false; }
  }

  async function ensureUserDoc(user, extra){
    if(!firebaseAvailable||!user) return;
    try{
      const ref=db.collection("users").doc(user.uid);
      const base={
        uid:user.uid,
        email:user.email||null,
        displayName: extra?.displayName || user.displayName || null,
        firstName: extra?.firstName || null,
        lastName: extra?.lastName || null,
        phone: extra?.phone || null,
        provider: (user.providerData&&user.providerData[0]&&user.providerData[0].providerId)||"password",
        emailVerified: !!user.emailVerified,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      const snap=await ref.get();
      if(!snap.exists){ await ref.set(base); }
      else{
        await ref.set({
          displayName: base.displayName,
          firstName: base.firstName,
          lastName: base.lastName,
          phone: base.phone,
          lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
          emailVerified: !!user.emailVerified
        }, {merge:true});
      }
    }catch(e){ log("ensureUserDoc error",e); }
  }

  async function ensureNewsletter(user){
    const cb=document.getElementById("auth-newsletter");
    if(!firebaseAvailable||!user||!cb||!cb.checked) return;
    try{
      await db.collection("newsletter").doc(user.uid).set({
        email:user.email||null,
        subscribed:true,
        ts:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
    }catch(e){ log("Newsletter error",e); }
  }

  function showConfigError(){
      var el = document.getElementById("auth-missing-cfg");
      if(el){ el.style.display="block"; el.style.color="#f87171"; el.style.fontWeight="600"; }
    }
    function ui(){
    const lang=pickLang();
    localizeAuthUI(lang);

    const status=document.getElementById("auth-status");
    const missing=document.getElementById("auth-missing-cfg");
    const first=document.getElementById("auth-first");
    const last=document.getElementById("auth-last");
    const phone=document.getElementById("auth-phone");
    const email=document.getElementById("auth-email");
    const password=document.getElementById("auth-password");
    const btnReg=document.getElementById("btn-register");
    const btnLogin=document.getElementById("btn-login");
    const btnLogout=document.getElementById("btn-logout");

    function setEnabled(enabled){
      [first,last,phone,email,password,btnReg,btnLogin,btnLogout].forEach(el=>{ if(el) el.disabled=!enabled; });
      const cb=document.getElementById("auth-newsletter"); if(cb) cb.disabled=!enabled;
    }

    initFirebase();
    if(!firebaseAvailable){ showConfigError(); setEnabled(false); }
    else { missing&&(missing.style.display="none"); setEnabled(true); }

    function setStatus(inOut){ if(status) status.textContent = inOut ? TA("status_in",lang) : TA("status_out",lang); }

    if(firebaseAvailable){
      auth.onAuthStateChanged(async (user)=>{
        setStatus(!!user);
      });
    }else{
      setStatus(false);
    }

    // Registration (name, surname, email, phone, password)
    btnReg && btnReg.addEventListener("click", async ()=>{
      try{
        if(!firebaseAvailable) throw new Error("Firebase not configured");
        const fn=(first&&first.value||"").trim();
        const ln=(last&&last.value||"").trim();
        const ph=(phone&&phone.value||"").trim();
        const em=(email&&email.value||"").trim();
        const pw=(password&&password.value||"").trim();
        if(!fn || !ln || !em || !pw){
          alert(TA("need_fields",lang)); return;
        }
        const {user} = await auth.createUserWithEmailAndPassword(em, pw);
        const displayName = (fn+" "+ln).trim();
        try{ await user.updateProfile({displayName}); }catch(_){}
        try{ await user.sendEmailVerification(); }catch(_){}
        await ensureUserDoc(user, {displayName, firstName: fn, lastName: ln, phone: ph});
        await ensureNewsletter(user);
        alert(TA("registration_ok",lang));
      }catch(e){
        alert(e.message || String(e));
      }
    });

    // Login (email + password)
    btnLogin && btnLogin.addEventListener("click", async ()=>{
      try{
        if(!firebaseAvailable) throw new Error("Firebase not configured");
        const em=(email&&email.value||"").trim();
        const pw=(password&&password.value||"").trim();
        const {user} = await auth.signInWithEmailAndPassword(em, pw);
        await ensureUserDoc(user, {}); // ensure lastLoginAt updated
        await ensureNewsletter(user);
        alert(TA("login_ok",lang));
      }catch(e){
        alert(e.message || String(e));
      }
    });

    // Logout
    btnLogout && btnLogout.addEventListener("click", async ()=>{
      try{
        if(!firebaseAvailable) throw new Error("Firebase not configured");
        await auth.signOut();
        alert(TA("signout_ok",lang));
      }catch(e){ alert(e.message || String(e)); }
    });

    // Language changes
    window.addEventListener('xtr:langchange', function(e){
      try{ localizeAuthUI((e && e.detail && e.detail.lang) || lang); }catch(_){}
    });
  }

  // Expose localization dictionary
  window.AUTH_I18N = {'en': {'title': 'Account & Newsletter', 'first': 'First name', 'last': 'Last name', 'email': 'Email', 'phone': 'Phone number', 'password': 'Password', 'register': 'Register', 'login': 'Login', 'logout': 'Sign out', 'newsletter': 'Subscribe to newsletter', 'status_in': '✅ Logged in', 'status_out': '🚪 Not logged in', 'missing_cfg': 'Firebase config missing. Add window.XTRADER_FIREBASE_CONFIG to enable.', 'registration_ok': 'Registration successful! Verification email sent.', 'login_ok': 'Logged in!', 'signout_ok': 'Signed out.', 'need_fields': 'Please fill first name, last name, email, and password.'}, 'it': {'title': 'Account & Newsletter', 'first': 'Nome', 'last': 'Cognome', 'email': 'Email', 'phone': 'Numero di telefono', 'password': 'Password', 'register': 'Registrati', 'login': 'Accedi', 'logout': 'Esci', 'newsletter': 'Iscrivimi alla newsletter', 'status_in': '✅ Loggato', 'status_out': '🚪 Non loggato', 'missing_cfg': 'Configurazione Firebase mancante. Aggiungi window.XTRADER_FIREBASE_CONFIG.', 'registration_ok': 'Registrazione completata! Email di verifica inviata.', 'login_ok': 'Accesso eseguito!', 'signout_ok': 'Disconnessione eseguita.', 'need_fields': 'Compila nome, cognome, email e password.'}, 'es': {'title': 'Cuenta y Newsletter', 'first': 'Nombre', 'last': 'Apellido', 'email': 'Correo', 'phone': 'Número de teléfono', 'password': 'Contraseña', 'register': 'Registrarse', 'login': 'Iniciar sesión', 'logout': 'Cerrar sesión', 'newsletter': 'Suscribirme al newsletter', 'status_in': '✅ Conectado', 'status_out': '🚪 No conectado', 'missing_cfg': 'Falta configuración de Firebase. Añade window.XTRADER_FIREBASE_CONFIG.', 'registration_ok': '¡Registro exitoso! Correo de verificación enviado.', 'login_ok': '¡Inicio de sesión correcto!', 'signout_ok': 'Sesión cerrada.', 'need_fields': 'Rellena nombre, apellido, email y contraseña.'}, 'fr': {'title': 'Compte & Newsletter', 'first': 'Prénom', 'last': 'Nom', 'email': 'Email', 'phone': 'Numéro de téléphone', 'password': 'Mot de passe', 'register': 'S’inscrire', 'login': 'Se connecter', 'logout': 'Se déconnecter', 'newsletter': 'S’abonner à la newsletter', 'status_in': '✅ Connecté', 'status_out': '🚪 Non connecté', 'missing_cfg': 'Configuration Firebase manquante. Ajoutez window.XTRADER_FIREBASE_CONFIG.', 'registration_ok': 'Inscription réussie ! E‑mail de vérification envoyé.', 'login_ok': 'Connexion réussie !', 'signout_ok': 'Déconnexion effectuée.', 'need_fields': 'Renseignez prénom, nom, email et mot de passe.'}, 'de': {'title': 'Konto & Newsletter', 'first': 'Vorname', 'last': 'Nachname', 'email': 'E‑Mail', 'phone': 'Telefonnummer', 'password': 'Passwort', 'register': 'Registrieren', 'login': 'Anmelden', 'logout': 'Abmelden', 'newsletter': 'Newsletter abonnieren', 'status_in': '✅ Angemeldet', 'status_out': '🚪 Nicht angemeldet', 'missing_cfg': 'Firebase‑Konfiguration fehlt. Fügen Sie window.XTRADER_FIREBASE_CONFIG hinzu.', 'registration_ok': 'Registrierung erfolgreich! Bestätigungs‑E‑Mail gesendet.', 'login_ok': 'Anmeldung erfolgreich!', 'signout_ok': 'Abgemeldet.', 'need_fields': 'Bitte Vorname, Nachname, E‑Mail und Passwort ausfüllen.'}, 'pt': {'title': 'Conta & Newsletter', 'first': 'Nome', 'last': 'Sobrenome', 'email': 'Email', 'phone': 'Número de telefone', 'password': 'Senha', 'register': 'Registrar', 'login': 'Entrar', 'logout': 'Sair', 'newsletter': 'Inscrever‑me na newsletter', 'status_in': '✅ Conectado', 'status_out': '🚪 Desconectado', 'missing_cfg': 'Configuração do Firebase ausente. Adicione window.XTRADER_FIREBASE_CONFIG.', 'registration_ok': 'Registro concluído! Email de verificação enviado.', 'login_ok': 'Login concluído!', 'signout_ok': 'Sessão encerrada.', 'need_fields': 'Preencha nome, sobrenome, email e senha.'}, 'ru': {'title': 'Аккаунт и рассылка', 'first': 'Имя', 'last': 'Фамилия', 'email': 'Email', 'phone': 'Номер телефона', 'password': 'Пароль', 'register': 'Регистрация', 'login': 'Войти', 'logout': 'Выйти', 'newsletter': 'Подписаться на рассылку', 'status_in': '✅ В системе', 'status_out': '🚪 Не в системе', 'missing_cfg': 'Отсутствует конфигурация Firebase. Добавьте window.XTRADER_FIREBASE_CONFIG.', 'registration_ok': 'Регистрация успешна! Письмо с подтверждением отправлено.', 'login_ok': 'Вход выполнен!', 'signout_ok': 'Вы вышли из системы.', 'need_fields': 'Заполните имя, фамилию, email и пароль.'}, 'ja': {'title': 'アカウント＆ニュースレター', 'first': '名', 'last': '姓', 'email': 'メール', 'phone': '電話番号', 'password': 'パスワード', 'register': '登録', 'login': 'ログイン', 'logout': 'ログアウト', 'newsletter': 'ニュースレターを購読する', 'status_in': '✅ ログイン中', 'status_out': '🚪 未ログイン', 'missing_cfg': 'Firebase設定がありません。window.XTRADER_FIREBASE_CONFIG を追加してください。', 'registration_ok': '登録に成功！確認メールを送信しました。', 'login_ok': 'ログインしました！', 'signout_ok': 'ログアウトしました。', 'need_fields': '名・姓・メール・パスワードを入力してください。'}, 'zh': {'title': '账户与订阅', 'first': '名', 'last': '姓', 'email': '邮箱', 'phone': '手机号', 'password': '密码', 'register': '注册', 'login': '登录', 'logout': '退出登录', 'newsletter': '订阅新闻简报', 'status_in': '✅ 已登录', 'status_out': '🚪 未登录', 'missing_cfg': '缺少 Firebase 配置。请添加 window.XTRADER_FIREBASE_CONFIG。', 'registration_ok': '注册成功！已发送验证邮件。', 'login_ok': '登录成功！', 'signout_ok': '已退出登录。', 'need_fields': '请填写姓名、姓氏、邮箱和密码。'}, 'ar': {'title': 'الحساب والنشرة البريدية', 'first': 'الاسم', 'last': 'الكنية', 'email': 'البريد الإلكتروني', 'phone': 'رقم الهاتف', 'password': 'كلمة المرور', 'register': 'تسجيل', 'login': 'تسجيل الدخول', 'logout': 'تسجيل الخروج', 'newsletter': 'اشترك في النشرة', 'status_in': '✅ مسجل الدخول', 'status_out': '🚪 غير مسجل الدخول', 'missing_cfg': 'إعداد Firebase مفقود. أضف window.XTRADER_FIREBASE_CONFIG.', 'registration_ok': 'تم التسجيل بنجاح! تم إرسال بريد التحقق.', 'login_ok': 'تم تسجيل الدخول!', 'signout_ok': 'تم تسجيل الخروج.', 'need_fields': 'يرجى إدخال الاسم والكنية والبريد وكلمة المرور.'}, 'tr': {'title': 'Hesap & Bülten', 'first': 'Ad', 'last': 'Soyad', 'email': 'E‑posta', 'phone': 'Telefon numarası', 'password': 'Şifre', 'register': 'Kayıt ol', 'login': 'Giriş yap', 'logout': 'Çıkış', 'newsletter': 'Bültene abone ol', 'status_in': '✅ Giriş yapıldı', 'status_out': '🚪 Giriş yapılmadı', 'missing_cfg': 'Firebase yapılandırması eksik. window.XTRADER_FIREBASE_CONFIG ekleyin.', 'registration_ok': 'Kayıt başarılı! Doğrulama e‑postası gönderildi.', 'login_ok': 'Giriş başarılı!', 'signout_ok': 'Çıkış yapıldı.', 'need_fields': 'Ad, soyad, e‑posta ve şifreyi doldurun.'}, 'nl': {'title': 'Account & Nieuwsbrief', 'first': 'Voornaam', 'last': 'Achternaam', 'email': 'E‑mail', 'phone': 'Telefoonnummer', 'password': 'Wachtwoord', 'register': 'Registreren', 'login': 'Inloggen', 'logout': 'Uitloggen', 'newsletter': 'Inschrijven voor nieuwsbrief', 'status_in': '✅ Aangemeld', 'status_out': '🚪 Niet aangemeld', 'missing_cfg': 'Firebase‑configuratie ontbreekt. Voeg window.XTRADER_FIREBASE_CONFIG toe.', 'registration_ok': 'Registratie gelukt! Verificatiemail verzonden.', 'login_ok': 'Inloggen gelukt!', 'signout_ok': 'Uitgelogd.', 'need_fields': 'Voornaam, achternaam, e‑mail en wachtwoord invullen.'}, 'pl': {'title': 'Konto i newsletter', 'first': 'Imię', 'last': 'Nazwisko', 'email': 'Email', 'phone': 'Numer telefonu', 'password': 'Hasło', 'register': 'Zarejestruj się', 'login': 'Zaloguj się', 'logout': 'Wyloguj', 'newsletter': 'Zapisz mnie do newslettera', 'status_in': '✅ Zalogowano', 'status_out': '🚪 Wylogowano', 'missing_cfg': 'Brak konfiguracji Firebase. Dodaj window.XTRADER_FIREBASE_CONFIG.', 'registration_ok': 'Rejestracja zakończona! Wysłano e‑mail weryfikacyjny.', 'login_ok': 'Zalogowano!', 'signout_ok': 'Wylogowano.', 'need_fields': 'Uzupełnij imię, nazwisko, email i hasło.'}, 'uk': {'title': 'Обліковий запис і розсилка', 'first': 'Ім’я', 'last': 'Прізвище', 'email': 'Email', 'phone': 'Номер телефону', 'password': 'Пароль', 'register': 'Зареєструватися', 'login': 'Увійти', 'logout': 'Вийти', 'newsletter': 'Підписатися на розсилку', 'status_in': '✅ Увійшли', 'status_out': '🚪 Не ввійшли', 'missing_cfg': 'Відсутня конфігурація Firebase. Додайте window.XTRADER_FIREBASE_CONFIG.', 'registration_ok': 'Реєстрація успішна! Лист підтвердження надіслано.', 'login_ok': 'Вхід успішний!', 'signout_ok': 'Вийшли з системи.', 'need_fields': 'Заповніть ім’я, прізвище, email і пароль.'}, 'vi': {'title': 'Tài khoản & Bản tin', 'first': 'Tên', 'last': 'Họ', 'email': 'Email', 'phone': 'Số điện thoại', 'password': 'Mật khẩu', 'register': 'Đăng ký', 'login': 'Đăng nhập', 'logout': 'Đăng xuất', 'newsletter': 'Đăng ký nhận bản tin', 'status_in': '✅ Đã đăng nhập', 'status_out': '🚪 Chưa đăng nhập', 'missing_cfg': 'Thiếu cấu hình Firebase. Thêm window.XTRADER_FIREBASE_CONFIG.', 'registration_ok': 'Đăng ký thành công! Đã gửi email xác minh.', 'login_ok': 'Đăng nhập thành công!', 'signout_ok': 'Đã đăng xuất.', 'need_fields': 'Vui lòng điền tên, họ, email và mật khẩu.'}, 'id': {'title': 'Akun & Newsletter', 'first': 'Nama depan', 'last': 'Nama belakang', 'email': 'Email', 'phone': 'Nomor telepon', 'password': 'Kata sandi', 'register': 'Daftar', 'login': 'Masuk', 'logout': 'Keluar', 'newsletter': 'Langganan newsletter', 'status_in': '✅ Masuk', 'status_out': '🚪 Belum masuk', 'missing_cfg': 'Konfigurasi Firebase hilang. Tambahkan window.XTRADER_FIREBASE_CONFIG.', 'registration_ok': 'Pendaftaran berhasil! Email verifikasi dikirim.', 'login_ok': 'Berhasil masuk!', 'signout_ok': 'Berhasil keluar.', 'need_fields': 'Isi nama depan, nama belakang, email dan kata sandi.'}, 'hi': {'title': 'खाता और न्यूज़लेटर', 'first': 'पहला नाम', 'last': 'उपनाम', 'email': 'ईमेल', 'phone': 'फोन नंबर', 'password': 'पासवर्ड', 'register': 'रजिस्टर', 'login': 'लॉगिन', 'logout': 'लॉगआउट', 'newsletter': 'न्यूज़लेटर की सदस्यता लें', 'status_in': '✅ लॉग इन', 'status_out': '🚪 लॉग इन नहीं', 'missing_cfg': 'Firebase कॉन्फ़िग गायब है। window.XTRADER_FIREBASE_CONFIG जोड़ें।', 'registration_ok': 'पंजीकरण सफल! सत्यापन ईमेल भेजा गया।', 'login_ok': 'लॉगिन सफल!', 'signout_ok': 'लॉगआउट हो गया।', 'need_fields': 'कृपया नाम, उपनाम, ईमेल और पासवर्ड भरें।'}, 'ko': {'title': '계정 & 뉴스레터', 'first': '이름', 'last': '성', 'email': '이메일', 'phone': '전화번호', 'password': '비밀번호', 'register': '회원가입', 'login': '로그인', 'logout': '로그아웃', 'newsletter': '뉴스레터 구독', 'status_in': '✅ 로그인됨', 'status_out': '🚪 로그아웃됨', 'missing_cfg': 'Firebase 설정이 없습니다. window.XTRADER_FIREBASE_CONFIG를 추가하세요.', 'registration_ok': '가입 성공! 확인 이메일 전송됨.', 'login_ok': '로그인 성공!', 'signout_ok': '로그아웃되었습니다.', 'need_fields': '이름, 성, 이메일과 비밀번호를 입력하세요.'}};

  ready(ui);
})();
