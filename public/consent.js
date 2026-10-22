(() => {
  const KEY='kap-consent-v1', DENY='kap-analytics-denied', MARK='|kap-analytics-denied|', ID='G-HXM22WWPKP';
  function denied(){
    if(window.__kapDenied)return true;
    try{if(sessionStorage.getItem(DENY)==='1')return true;}catch{return true;}
    try{return window.name.includes(MARK);}catch{return true;}
  }
  function markDeny(){
    window.__kapDenied=true;window['ga-disable-'+ID]=true;
    let retained=false;
    try{sessionStorage.setItem(DENY,'1');retained=sessionStorage.getItem(DENY)==='1';}catch{}
    try{window.name=window.name.split(MARK).join('')+MARK;retained=window.name.includes(MARK)||retained;}catch{}
    return retained;
  }
  function clearDeny(){
    // Verify a tab-local refusal can be cleared before publishing a shared grant.
    sessionStorage.removeItem(DENY);
    if(sessionStorage.getItem(DENY)==='1')throw Error('Session refusal remains');
    window.name=window.name.split(MARK).join('');
    if(window.name.includes(MARK))throw Error('Tab refusal remains');
  }
  function read(){
    if(denied())return null;
    try{
      const saved=JSON.parse(localStorage.getItem(KEY)||'null');
      localStorage.setItem(KEY+'-write-check','1');localStorage.removeItem(KEY+'-write-check');
      return saved&&typeof saved.analytics==='boolean'?saved:null;
    }catch{return null;}
  }
  let active=false,retainedDenial=false;
  function apply(grant){
    active=grant===true;window['ga-disable-'+ID]=!active;
    if(!active){window.gtag?.('consent','update',{analytics_storage:'denied'});return;}
    window.dataLayer=window.dataLayer||[];
    window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
    if(document.getElementById('kap-ga4')){window.gtag('consent','update',{analytics_storage:'granted'});return;}
    window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('consent','update',{analytics_storage:'granted'});
    const script=document.createElement('script');script.id='kap-ga4';script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.appendChild(script);
    window.gtag('js',new Date());window.gtag('config',ID,{allow_google_signals:false,allow_ad_personalization_signals:false});
  }
  function save(analytics){
    analytics=analytics===true;
    if(!analytics){retainedDenial=markDeny();apply(false);}
    try{
      if(analytics){clearDeny();localStorage.getItem(KEY);localStorage.setItem(KEY+'-write-check','1');localStorage.removeItem(KEY+'-write-check');}
      localStorage.setItem(KEY,JSON.stringify({necessary:true,analytics,preferences:false,marketing:false}));
      if(analytics)window.__kapDenied=false;
      if(analytics&&read()?.analytics!==true)throw Error('Grant could not be confirmed');
      apply(analytics);return true;
    }catch{
      // A failed grant must not leave a shared allow value for a healthy second tab.
      try{localStorage.setItem(KEY,JSON.stringify({necessary:true,analytics:false,preferences:false,marketing:false}));}catch{}
      retainedDenial=markDeny();apply(false);return false;
    }
  }
  window.kapConsent={read,save};
  apply(read()?.analytics===true);
  const checkbox=document.getElementById('analytics'),status=document.getElementById('consent-status');
  const stateText=()=>active?'Google Analytics مفعّل في هذه التبويبة.':'Google Analytics متوقف في هذه التبويبة.';
  if(checkbox)checkbox.checked=active;
  function choose(value){
    const stored=save(value);if(checkbox)checkbox.checked=active;
    if(status)status.textContent=stored
      ?'حُفظ الاختيار. '+stateText()+(value&&!active?' تعذر تأكيد التخزين.':'')
      :retainedDenial?'Google Analytics متوقف في هذه التبويبة، ويستمر الرفض عند التنقل أو إعادة التحميل فيها. تعذر حفظ اختيار دائم؛ قد تبقى موافقة قديمة في تبويبات أخرى. لحذفها، امسح بيانات الموقع من إعدادات المتصفح.'
      :'Google Analytics متوقف في هذه الصفحة. تعذر حفظ الاختيار؛ امسح بيانات الموقع قبل التنقل أو إعادة التحميل.';
  }
  checkbox?.addEventListener('change',()=>{if(status)status.textContent='';});
  document.getElementById('consent-form')?.addEventListener('submit',event=>{event.preventDefault();choose(checkbox?.checked===true);});
  document.getElementById('reject-all')?.addEventListener('click',()=>choose(false));
  window.addEventListener('storage',event=>{
    if(event.key!==KEY&&event.key!==null)return;
    let grant=false;try{grant=JSON.parse(event.newValue||'null')?.analytics===true;}catch{}
    if(!grant)markDeny();apply(read()?.analytics===true);
    if(checkbox)checkbox.checked=active;if(status)status.textContent=stateText();
  });
})();
