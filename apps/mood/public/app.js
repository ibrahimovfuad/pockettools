(()=>{var Sf=()=>{};var Cf=function(n){let e=[],t=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},Jy=function(n){let e=[],t=0,r=0;for(;t<n.length;){let i=n[t++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){let s=n[t++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){let s=n[t++],o=n[t++],c=n[t++],u=((i&7)<<18|(s&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{let s=n[t++],o=n[t++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},kf={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();let t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){let s=n[i],o=i+1<n.length,c=o?n[i+1]:0,u=i+2<n.length,h=u?n[i+2]:0,f=s>>2,m=(s&3)<<4|c>>4,_=(c&15)<<2|h>>6,S=h&63;u||(S=64,o||(_=64)),r.push(t[f],t[m],t[_],t[S])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Cf(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Jy(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();let t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){let s=t[n.charAt(i++)],c=i<n.length?t[n.charAt(i)]:0;++i;let h=i<n.length?t[n.charAt(i)]:64;++i;let m=i<n.length?t[n.charAt(i)]:64;if(++i,s==null||c==null||h==null||m==null)throw new Nc;let _=s<<2|c>>4;if(r.push(_),h!==64){let S=c<<4&240|h>>2;if(r.push(S),m!==64){let C=h<<6&192|m;r.push(C)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}},Nc=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},Xy=function(n){let e=Cf(n);return kf.encodeByteArray(e,!0)},Ii=function(n){return Xy(n).replace(/\./g,"")},Ks=function(n){try{return kf.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};function Vc(){if(typeof self!="undefined")return self;if(typeof window!="undefined")return window;if(typeof global!="undefined")return global;throw new Error("Unable to locate global object.")}var Zy=()=>Vc().__FIREBASE_DEFAULTS__,ev=()=>{if(typeof process=="undefined"||typeof process.env=="undefined")return;let n=process.env.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},tv=()=>{if(typeof document=="undefined")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let e=n&&Ks(n[1]);return e&&JSON.parse(e)},Hs=()=>{try{return Sf()||Zy()||ev()||tv()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Df=n=>{var e,t;return(t=(e=Hs())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},Nf=n=>{let e=Df(n);if(!e)return;let t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);let r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},xc=()=>{var n;return(n=Hs())===null||n===void 0?void 0:n.config},Of=n=>{var e;return(e=Hs())===null||e===void 0?void 0:e[`_${n}`]};var Ws=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}};function Mt(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Qs(n){return(await fetch(n,{credentials:"include"})).ok}function Vf(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');let t={alg:"none",type:"JWT"},r=e||"demo-project",i=n.iat||0,s=n.sub||n.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");let o=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}}},n);return[Ii(JSON.stringify(t)),Ii(JSON.stringify(o)),""].join(".")}var vi={};function nv(){let n={prod:[],emulator:[]};for(let e of Object.keys(vi))vi[e]?n.emulator.push(e):n.prod.push(e);return n}function rv(n){let e=document.getElementById(n),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",n),t=!0),{created:t,element:e}}var Rf=!1;function Lc(n,e){if(typeof window=="undefined"||typeof document=="undefined"||!Mt(window.location.host)||vi[n]===e||vi[n]||Rf)return;vi[n]=e;function t(_){return`__firebase__banner__${_}`}let r="__firebase__banner",s=nv().prod.length>0;function o(){let _=document.getElementById(r);_&&_.remove()}function c(_){_.style.display="flex",_.style.background="#7faaf0",_.style.position="fixed",_.style.bottom="5px",_.style.left="5px",_.style.padding=".5em",_.style.borderRadius="5px",_.style.alignItems="center"}function u(_,S){_.setAttribute("width","24"),_.setAttribute("id",S),_.setAttribute("height","24"),_.setAttribute("viewBox","0 0 24 24"),_.setAttribute("fill","none"),_.style.marginLeft="-6px"}function h(){let _=document.createElement("span");return _.style.cursor="pointer",_.style.marginLeft="16px",_.style.fontSize="24px",_.innerHTML=" &times;",_.onclick=()=>{Rf=!0,o()},_}function f(_,S){_.setAttribute("id",S),_.innerText="Learn more",_.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",_.setAttribute("target","__blank"),_.style.paddingLeft="5px",_.style.textDecoration="underline"}function m(){let _=rv(r),S=t("text"),C=document.getElementById(S)||document.createElement("span"),N=t("learnmore"),k=document.getElementById(N)||document.createElement("a"),$=t("preprendIcon"),B=document.getElementById($)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(_.created){let M=_.element;c(M),f(k,N);let H=h();u(B,$),M.append(B,C,k,H),document.body.appendChild(M)}s?(C.innerText="Preview backend disconnected.",B.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(B.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,C.innerText="Preview backend running in this workspace."),C.setAttribute("id",S)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",m):m()}function ue(){return typeof navigator!="undefined"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function xf(){return typeof window!="undefined"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ue())}function Lf(){var n;let e=(n=Hs())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Mf(){return typeof navigator!="undefined"&&navigator.userAgent==="Cloudflare-Workers"}function Ff(){let n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Uf(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Bf(){let n=ue();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Mc(){return!Lf()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Fc(){return!Lf()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function Ys(){try{return typeof indexedDB=="object"}catch{return!1}}function qf(){return new Promise((n,e)=>{try{let t=!0,r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var s;e(((s=i.error)===null||s===void 0?void 0:s.message)||"")}}catch(t){e(t)}})}var iv="FirebaseError",Ue=class n extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=iv,Object.setPrototypeOf(this,n.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,yt.prototype.create)}},yt=class{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){let r=t[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?sv(s,r):"Error",c=`${this.serviceName}: ${o} (${i}).`;return new Ue(i,c,r)}};function sv(n,e){return n.replace(ov,(t,r)=>{let i=e[r];return i!=null?String(i):`<${r}?>`})}var ov=/\{\$([^}]+)}/g;function jf(n){for(let e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function vt(n,e){if(n===e)return!0;let t=Object.keys(n),r=Object.keys(e);for(let i of t){if(!r.includes(i))return!1;let s=n[i],o=e[i];if(Pf(s)&&Pf(o)){if(!vt(s,o))return!1}else if(s!==o)return!1}for(let i of r)if(!t.includes(i))return!1;return!0}function Pf(n){return n!==null&&typeof n=="object"}function cr(n){let e=[];for(let[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function ur(n){let e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){let[i,s]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(s)}}),e}function lr(n){let e=n.indexOf("?");if(!e)return"";let t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function zf(n,e){let t=new Oc(n,e);return t.subscribe.bind(t)}var Oc=class{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");av(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:r},i.next===void 0&&(i.next=Dc),i.error===void 0&&(i.error=Dc),i.complete===void 0&&(i.complete=Dc);let s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console!="undefined"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}};function av(n,e){if(typeof n!="object"||n===null)return!1;for(let t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Dc(){}var Db=4*60*60*1e3;function Ne(n){return n&&n._delegate?n._delegate:n}var We=class{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};var yn="[DEFAULT]";var Uc=class{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){let t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){let r=new Ws;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{let i=this.getOrInitializeService({instanceIdentifier:t});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;let r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(uv(e))try{this.getOrInitializeService({instanceIdentifier:yn})}catch{}for(let[t,r]of this.instancesDeferred.entries()){let i=this.normalizeInstanceIdentifier(t);try{let s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=yn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){let e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=yn){return this.instances.has(e)}getOptions(e=yn){return this.instancesOptions.get(e)||{}}initialize(e={}){let{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(let[s,o]of this.instancesDeferred.entries()){let c=this.normalizeInstanceIdentifier(s);r===c&&o.resolve(i)}return i}onInit(e,t){var r;let i=this.normalizeInstanceIdentifier(t),s=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;s.add(e),this.onInitCallbacks.set(i,s);let o=this.instances.get(i);return o&&e(o,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){let r=this.onInitCallbacks.get(t);if(r)for(let i of r)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:cv(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=yn){return this.component?this.component.multipleInstances?e:yn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function cv(n){return n===yn?void 0:n}function uv(n){return n.instantiationMode==="EAGER"}var Js=class{constructor(e){this.name=e,this.providers=new Map}addComponent(e){let t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);let t=new Uc(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}};var lv=[],Y;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(Y||(Y={}));var hv={debug:Y.DEBUG,verbose:Y.VERBOSE,info:Y.INFO,warn:Y.WARN,error:Y.ERROR,silent:Y.SILENT},dv=Y.INFO,fv={[Y.DEBUG]:"log",[Y.VERBOSE]:"log",[Y.INFO]:"info",[Y.WARN]:"warn",[Y.ERROR]:"error"},pv=(n,e,...t)=>{if(e<n.logLevel)return;let r=new Date().toISOString(),i=fv[e];if(i)console[i](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)},Ft=class{constructor(e){this.name=e,this._logLevel=dv,this._logHandler=pv,this._userLogHandler=null,lv.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Y))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?hv[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Y.DEBUG,...e),this._logHandler(this,Y.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Y.VERBOSE,...e),this._logHandler(this,Y.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Y.INFO,...e),this._logHandler(this,Y.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Y.WARN,...e),this._logHandler(this,Y.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Y.ERROR,...e),this._logHandler(this,Y.ERROR,...e)}};var mv=(n,e)=>e.some(t=>n instanceof t),$f,Gf;function gv(){return $f||($f=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function _v(){return Gf||(Gf=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var Wf=new WeakMap,qc=new WeakMap,Kf=new WeakMap,Bc=new WeakMap,zc=new WeakMap;function yv(n){let e=new Promise((t,r)=>{let i=()=>{n.removeEventListener("success",s),n.removeEventListener("error",o)},s=()=>{t(st(n.result)),i()},o=()=>{r(n.error),i()};n.addEventListener("success",s),n.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&Wf.set(t,n)}).catch(()=>{}),zc.set(e,n),e}function vv(n){if(qc.has(n))return;let e=new Promise((t,r)=>{let i=()=>{n.removeEventListener("complete",s),n.removeEventListener("error",o),n.removeEventListener("abort",o)},s=()=>{t(),i()},o=()=>{r(n.error||new DOMException("AbortError","AbortError")),i()};n.addEventListener("complete",s),n.addEventListener("error",o),n.addEventListener("abort",o)});qc.set(n,e)}var jc={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return qc.get(n);if(e==="objectStoreNames")return n.objectStoreNames||Kf.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return st(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function Hf(n){jc=n(jc)}function Iv(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){let r=n.call(Xs(this),e,...t);return Kf.set(r,e.sort?e.sort():[e]),st(r)}:_v().includes(n)?function(...e){return n.apply(Xs(this),e),st(Wf.get(this))}:function(...e){return st(n.apply(Xs(this),e))}}function wv(n){return typeof n=="function"?Iv(n):(n instanceof IDBTransaction&&vv(n),mv(n,gv())?new Proxy(n,jc):n)}function st(n){if(n instanceof IDBRequest)return yv(n);if(Bc.has(n))return Bc.get(n);let e=wv(n);return e!==n&&(Bc.set(n,e),zc.set(e,n)),e}var Xs=n=>zc.get(n);function Yf(n,e,{blocked:t,upgrade:r,blocking:i,terminated:s}={}){let o=indexedDB.open(n,e),c=st(o);return r&&o.addEventListener("upgradeneeded",u=>{r(st(o.result),u.oldVersion,u.newVersion,st(o.transaction),u)}),t&&o.addEventListener("blocked",u=>t(u.oldVersion,u.newVersion,u)),c.then(u=>{s&&u.addEventListener("close",()=>s()),i&&u.addEventListener("versionchange",h=>i(h.oldVersion,h.newVersion,h))}).catch(()=>{}),c}var Ev=["get","getKey","getAll","getAllKeys","count"],Tv=["put","add","delete","clear"],$c=new Map;function Qf(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if($c.get(e))return $c.get(e);let t=e.replace(/FromIndex$/,""),r=e!==t,i=Tv.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(i||Ev.includes(t)))return;let s=async function(o,...c){let u=this.transaction(o,i?"readwrite":"readonly"),h=u.store;return r&&(h=h.index(c.shift())),(await Promise.all([h[t](...c),i&&u.done]))[0]};return $c.set(e,s),s}Hf(n=>({...n,get:(e,t,r)=>Qf(e,t)||n.get(e,t,r),has:(e,t)=>!!Qf(e,t)||n.has(e,t)}));var Wc=class{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(bv(t)){let r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}};function bv(n){let e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}var Kc="@firebase/app",Jf="0.13.2";var It=new Ft("@firebase/app"),Av="@firebase/app-compat",Sv="@firebase/analytics-compat",Rv="@firebase/analytics",Pv="@firebase/app-check-compat",Cv="@firebase/app-check",kv="@firebase/auth",Dv="@firebase/auth-compat",Nv="@firebase/database",Ov="@firebase/data-connect",Vv="@firebase/database-compat",xv="@firebase/functions",Lv="@firebase/functions-compat",Mv="@firebase/installations",Fv="@firebase/installations-compat",Uv="@firebase/messaging",Bv="@firebase/messaging-compat",qv="@firebase/performance",jv="@firebase/performance-compat",zv="@firebase/remote-config",$v="@firebase/remote-config-compat",Gv="@firebase/storage",Wv="@firebase/storage-compat",Kv="@firebase/firestore",Hv="@firebase/ai",Qv="@firebase/firestore-compat",Yv="firebase",Jv="11.10.0";var Hc="[DEFAULT]",Xv={[Kc]:"fire-core",[Av]:"fire-core-compat",[Rv]:"fire-analytics",[Sv]:"fire-analytics-compat",[Cv]:"fire-app-check",[Pv]:"fire-app-check-compat",[kv]:"fire-auth",[Dv]:"fire-auth-compat",[Nv]:"fire-rtdb",[Ov]:"fire-data-connect",[Vv]:"fire-rtdb-compat",[xv]:"fire-fn",[Lv]:"fire-fn-compat",[Mv]:"fire-iid",[Fv]:"fire-iid-compat",[Uv]:"fire-fcm",[Bv]:"fire-fcm-compat",[qv]:"fire-perf",[jv]:"fire-perf-compat",[zv]:"fire-rc",[$v]:"fire-rc-compat",[Gv]:"fire-gcs",[Wv]:"fire-gcs-compat",[Kv]:"fire-fst",[Qv]:"fire-fst-compat",[Hv]:"fire-vertex","fire-js":"fire-js",[Yv]:"fire-js-all"};var Zs=new Map,Zv=new Map,Qc=new Map;function Xf(n,e){try{n.container.addComponent(e)}catch(t){It.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Bt(n){let e=n.name;if(Qc.has(e))return It.debug(`There were multiple attempts to register component ${e}.`),!1;Qc.set(e,n);for(let t of Zs.values())Xf(t,n);for(let t of Zv.values())Xf(t,n);return!0}function Ei(n,e){let t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function Be(n){return n==null?!1:n.settings!==void 0}var eI={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Ut=new yt("app","Firebase",eI);var Yc=class{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new We("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Ut.create("app-deleted",{appName:this._name})}};var qt=Jv;function Zc(n,e={}){let t=n;typeof e!="object"&&(e={name:e});let r=Object.assign({name:Hc,automaticDataCollectionEnabled:!0},e),i=r.name;if(typeof i!="string"||!i)throw Ut.create("bad-app-name",{appName:String(i)});if(t||(t=xc()),!t)throw Ut.create("no-options");let s=Zs.get(i);if(s){if(vt(t,s.options)&&vt(r,s.config))return s;throw Ut.create("duplicate-app",{appName:i})}let o=new Js(i);for(let u of Qc.values())o.addComponent(u);let c=new Yc(t,r,o);return Zs.set(i,c),c}function eu(n=Hc){let e=Zs.get(n);if(!e&&n===Hc&&xc())return Zc();if(!e)throw Ut.create("no-app",{appName:n});return e}function Ze(n,e,t){var r;let i=(r=Xv[n])!==null&&r!==void 0?r:n;t&&(i+=`-${t}`);let s=i.match(/\s|\//),o=e.match(/\s|\//);if(s||o){let c=[`Unable to register library "${i}" with version "${e}":`];s&&c.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&o&&c.push("and"),o&&c.push(`version name "${e}" contains illegal characters (whitespace or "/")`),It.warn(c.join(" "));return}Bt(new We(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}var tI="firebase-heartbeat-database",nI=1,wi="firebase-heartbeat-store",Gc=null;function np(){return Gc||(Gc=Yf(tI,nI,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(wi)}catch(t){console.warn(t)}}}}).catch(n=>{throw Ut.create("idb-open",{originalErrorMessage:n.message})})),Gc}async function rI(n){try{let t=(await np()).transaction(wi),r=await t.objectStore(wi).get(rp(n));return await t.done,r}catch(e){if(e instanceof Ue)It.warn(e.message);else{let t=Ut.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});It.warn(t.message)}}}async function Zf(n,e){try{let r=(await np()).transaction(wi,"readwrite");await r.objectStore(wi).put(e,rp(n)),await r.done}catch(t){if(t instanceof Ue)It.warn(t.message);else{let r=Ut.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});It.warn(r.message)}}}function rp(n){return`${n.name}!${n.options.appId}`}var iI=1024,sI=30,Jc=class{constructor(e){this.container=e,this._heartbeatsCache=null;let t=this.container.getProvider("app").getImmediate();this._storage=new Xc(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{let i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=ep();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>sI){let o=aI(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){It.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";let t=ep(),{heartbeatsToSend:r,unsentEntries:i}=oI(this._heartbeatsCache.heartbeats),s=Ii(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(t){return It.warn(t),""}}};function ep(){return new Date().toISOString().substring(0,10)}function oI(n,e=iI){let t=[],r=n.slice();for(let i of n){let s=t.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),tp(t)>e){s.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),tp(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}var Xc=class{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ys()?qf().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let t=await rI(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){let i=await this.read();return Zf(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){let i=await this.read();return Zf(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}};function tp(n){return Ii(JSON.stringify({version:2,heartbeats:n})).length}function aI(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}function cI(n){Bt(new We("platform-logger",e=>new Wc(e),"PRIVATE")),Bt(new We("heartbeat",e=>new Jc(e),"PRIVATE")),Ze(Kc,Jf,n),Ze(Kc,Jf,"esm2017"),Ze("fire-js","")}cI("");var uI="firebase",lI="11.10.0";Ze(uI,lI,"app");function eo(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,r=Object.getOwnPropertySymbols(n);i<r.length;i++)e.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(n,r[i])&&(t[r[i]]=n[r[i]]);return t}function Ip(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}var wp=Ip,Ep=new yt("auth","Firebase",Ip());var ao=new Ft("@firebase/auth");function hI(n,...e){ao.logLevel<=Y.WARN&&ao.warn(`Auth (${qt}): ${n}`,...e)}function no(n,...e){ao.logLevel<=Y.ERROR&&ao.error(`Auth (${qt}): ${n}`,...e)}function Ke(n,...e){throw Su(n,...e)}function at(n,...e){return Su(n,...e)}function Au(n,e,t){let r=Object.assign(Object.assign({},wp()),{[e]:t});return new yt("auth","Firebase",r).create(e,{appName:n.name})}function $t(n){return Au(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function dI(n,e,t){let r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&Ke(n,"argument-error"),Au(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Su(n,...e){if(typeof n!="string"){let t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Ep.create(n,...e)}function z(n,e,...t){if(!n)throw Su(e,...t)}function ot(n){let e="INTERNAL ASSERTION FAILED: "+n;throw no(e),new Error(e)}function Et(n,e){n||ot(e)}function ou(){var n;return typeof self!="undefined"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function fI(){return ip()==="http:"||ip()==="https:"}function ip(){var n;return typeof self!="undefined"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}function pI(){return typeof navigator!="undefined"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(fI()||Ff()||"connection"in navigator)?navigator.onLine:!0}function mI(){if(typeof navigator=="undefined")return null;let n=navigator;return n.languages&&n.languages[0]||n.language||null}var vn=class{constructor(e,t){this.shortDelay=e,this.longDelay=t,Et(t>e,"Short delay should be less than long delay!"),this.isMobile=xf()||Uf()}get(){return pI()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}};function Ru(n,e){Et(n.emulator,"Emulator should always be set here");let{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}var co=class{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self!="undefined"&&"fetch"in self)return self.fetch;if(typeof globalThis!="undefined"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch!="undefined")return fetch;ot("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self!="undefined"&&"Headers"in self)return self.Headers;if(typeof globalThis!="undefined"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers!="undefined")return Headers;ot("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self!="undefined"&&"Response"in self)return self.Response;if(typeof globalThis!="undefined"&&globalThis.Response)return globalThis.Response;if(typeof Response!="undefined")return Response;ot("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}};var gI={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};var _I=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],yI=new vn(3e4,6e4);function ye(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function Se(n,e,t,r,i={}){return Tp(n,i,async()=>{let s={},o={};r&&(e==="GET"?o=r:s={body:JSON.stringify(r)});let c=cr(Object.assign({key:n.config.apiKey},o)).slice(1),u=await n._getAdditionalHeaders();u["Content-Type"]="application/json",n.languageCode&&(u["X-Firebase-Locale"]=n.languageCode);let h=Object.assign({method:e,headers:u},s);return Mf()||(h.referrerPolicy="no-referrer"),n.emulatorConfig&&Mt(n.emulatorConfig.host)&&(h.credentials="include"),co.fetch()(await bp(n,n.config.apiHost,t,c),h)})}async function Tp(n,e,t){n._canInitEmulator=!1;let r=Object.assign(Object.assign({},gI),e);try{let i=new au(n),s=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();let o=await s.json();if("needConfirmation"in o)throw bi(n,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{let c=s.ok?o.errorMessage:o.error.message,[u,h]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw bi(n,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw bi(n,"email-already-in-use",o);if(u==="USER_DISABLED")throw bi(n,"user-disabled",o);let f=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw Au(n,f,h);Ke(n,f)}}catch(i){if(i instanceof Ue)throw i;Ke(n,"network-request-failed",{message:String(i)})}}async function An(n,e,t,r,i={}){let s=await Se(n,e,t,r,i);return"mfaPendingCredential"in s&&Ke(n,"multi-factor-auth-required",{_serverResponse:s}),s}async function bp(n,e,t,r){let i=`${e}${t}?${r}`,s=n,o=s.config.emulator?Ru(n.config,i):`${n.config.apiScheme}://${i}`;return _I.includes(t)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}function vI(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}var au=class{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(at(this.auth,"network-request-failed")),yI.get())})}};function bi(n,e,t){let r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);let i=at(n,e,r);return i.customData._tokenResponse=t,i}function sp(n){return n!==void 0&&n.enterprise!==void 0}var uo=class{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(let t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return vI(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}};async function Ap(n,e){return Se(n,"GET","/v2/recaptchaConfig",ye(n,e))}async function II(n,e){return Se(n,"POST","/v1/accounts:delete",e)}async function lo(n,e){return Se(n,"POST","/v1/accounts:lookup",e)}function Ai(n){if(n)try{let e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Sp(n,e=!1){let t=Ne(n),r=await t.getIdToken(e),i=Pu(r);z(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");let s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:Ai(tu(i.auth_time)),issuedAtTime:Ai(tu(i.iat)),expirationTime:Ai(tu(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function tu(n){return Number(n)*1e3}function Pu(n){let[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return no("JWT malformed, contained fewer than 3 sections"),null;try{let i=Ks(t);return i?JSON.parse(i):(no("Failed to decode base64 JWT payload"),null)}catch(i){return no("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function op(n){let e=Pu(n);return z(e,"internal-error"),z(typeof e.exp!="undefined","internal-error"),z(typeof e.iat!="undefined","internal-error"),Number(e.exp)-Number(e.iat)}async function Ci(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof Ue&&wI(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function wI({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}var cu=class{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){let r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;let i=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;let t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}};var ki=class{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Ai(this.lastLoginAt),this.creationTime=Ai(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}};async function ho(n){var e;let t=n.auth,r=await n.getIdToken(),i=await Ci(n,lo(t,{idToken:r}));z(i==null?void 0:i.users.length,t,"internal-error");let s=i.users[0];n._notifyReloadListener(s);let o=!((e=s.providerUserInfo)===null||e===void 0)&&e.length?Pp(s.providerUserInfo):[],c=EI(n.providerData,o),u=n.isAnonymous,h=!(n.email&&s.passwordHash)&&!(c!=null&&c.length),f=u?h:!1,m={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:c,metadata:new ki(s.createdAt,s.lastLoginAt),isAnonymous:f};Object.assign(n,m)}async function Rp(n){let e=Ne(n);await ho(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function EI(n,e){return[...n.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function Pp(n){return n.map(e=>{var{providerId:t}=e,r=eo(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}async function TI(n,e){let t=await Tp(n,{},async()=>{let r=cr({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=n.config,o=await bp(n,i,"/v1/token",`key=${s}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";let u={method:"POST",headers:c,body:r};return n.emulatorConfig&&Mt(n.emulatorConfig.host)&&(u.credentials="include"),co.fetch()(o,u)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function bI(n,e){return Se(n,"POST","/v2/accounts:revokeToken",ye(n,e))}var Si=class n{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){z(e.idToken,"internal-error"),z(typeof e.idToken!="undefined","internal-error"),z(typeof e.refreshToken!="undefined","internal-error");let t="expiresIn"in e&&typeof e.expiresIn!="undefined"?Number(e.expiresIn):op(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){z(e.length!==0,"internal-error");let t=op(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(z(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){let{accessToken:r,refreshToken:i,expiresIn:s}=await TI(e,t);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){let{refreshToken:r,accessToken:i,expirationTime:s}=t,o=new n;return r&&(z(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(z(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(z(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new n,this.toJSON())}_performRefresh(){return ot("not implemented")}};function jt(n,e){z(typeof n=="string"||typeof n=="undefined","internal-error",{appName:e})}var zt=class n{constructor(e){var{uid:t,auth:r,stsTokenManager:i}=e,s=eo(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new cu(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new ki(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){let t=await Ci(this,this.stsTokenManager.getToken(this.auth,e));return z(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return Sp(this,e)}reload(){return Rp(this)}_assign(e){this!==e&&(z(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){let t=new n(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){z(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await ho(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Be(this.auth.app))return Promise.reject($t(this.auth));let e=await this.getIdToken();return await Ci(this,II(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,i,s,o,c,u,h,f;let m=(r=t.displayName)!==null&&r!==void 0?r:void 0,_=(i=t.email)!==null&&i!==void 0?i:void 0,S=(s=t.phoneNumber)!==null&&s!==void 0?s:void 0,C=(o=t.photoURL)!==null&&o!==void 0?o:void 0,N=(c=t.tenantId)!==null&&c!==void 0?c:void 0,k=(u=t._redirectEventId)!==null&&u!==void 0?u:void 0,$=(h=t.createdAt)!==null&&h!==void 0?h:void 0,B=(f=t.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:M,emailVerified:H,isAnonymous:q,providerData:U,stsTokenManager:I}=t;z(M&&I,e,"internal-error");let g=Si.fromJSON(this.name,I);z(typeof M=="string",e,"internal-error"),jt(m,e.name),jt(_,e.name),z(typeof H=="boolean",e,"internal-error"),z(typeof q=="boolean",e,"internal-error"),jt(S,e.name),jt(C,e.name),jt(N,e.name),jt(k,e.name),jt($,e.name),jt(B,e.name);let y=new n({uid:M,auth:e,email:_,emailVerified:H,displayName:m,isAnonymous:q,photoURL:C,phoneNumber:S,tenantId:N,stsTokenManager:g,createdAt:$,lastLoginAt:B});return U&&Array.isArray(U)&&(y.providerData=U.map(w=>Object.assign({},w))),k&&(y._redirectEventId=k),y}static async _fromIdTokenResponse(e,t,r=!1){let i=new Si;i.updateFromServerResponse(t);let s=new n({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await ho(s),s}static async _fromGetAccountInfoResponse(e,t,r){let i=t.users[0];z(i.localId!==void 0,"internal-error");let s=i.providerUserInfo!==void 0?Pp(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),c=new Si;c.updateFromIdToken(r);let u=new n({uid:i.localId,auth:e,stsTokenManager:c,isAnonymous:o}),h={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new ki(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(u,h),u}};var ap=new Map;function wt(n){Et(n instanceof Function,"Expected a class definition");let e=ap.get(n);return e?(Et(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,ap.set(n,e),e)}var fo=class{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){let t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}};fo.type="NONE";var uu=fo;function ro(n,e,t){return`firebase:${n}:${e}:${t}`}var po=class n{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;let{config:i,name:s}=this.auth;this.fullUserKey=ro(this.userKey,i.apiKey,s),this.fullPersistenceKey=ro("persistence",i.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){let e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){let t=await lo(this.auth,{idToken:e}).catch(()=>{});return t?zt._fromGetAccountInfoResponse(this.auth,t,e):null}return zt._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;let t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new n(wt(uu),e,r);let i=(await Promise.all(t.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h),s=i[0]||wt(uu),o=ro(r,e.config.apiKey,e.name),c=null;for(let h of t)try{let f=await h._get(o);if(f){let m;if(typeof f=="string"){let _=await lo(e,{idToken:f}).catch(()=>{});if(!_)break;m=await zt._fromGetAccountInfoResponse(e,_,f)}else m=zt._fromJSON(e,f);h!==s&&(c=m),s=h;break}}catch{}let u=i.filter(h=>h._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new n(s,e,r):(s=u[0],c&&await s._set(o,c.toJSON()),await Promise.all(t.map(async h=>{if(h!==s)try{await h._remove(o)}catch{}})),new n(s,e,r))}};function cp(n){let e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Np(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Cp(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Vp(e))return"Blackberry";if(xp(e))return"Webos";if(kp(e))return"Safari";if((e.includes("chrome/")||Dp(e))&&!e.includes("edge/"))return"Chrome";if(Op(e))return"Android";{let t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Cp(n=ue()){return/firefox\//i.test(n)}function kp(n=ue()){let e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Dp(n=ue()){return/crios\//i.test(n)}function Np(n=ue()){return/iemobile/i.test(n)}function Op(n=ue()){return/android/i.test(n)}function Vp(n=ue()){return/blackberry/i.test(n)}function xp(n=ue()){return/webos/i.test(n)}function Cu(n=ue()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function AI(n=ue()){var e;return Cu(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function SI(){return Bf()&&document.documentMode===10}function Lp(n=ue()){return Cu(n)||Op(n)||xp(n)||Vp(n)||/windows phone/i.test(n)||Np(n)}function Mp(n,e=[]){let t;switch(n){case"Browser":t=cp(ue());break;case"Worker":t=`${cp(ue())}-${n}`;break;default:t=n}let r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${qt}/${r}`}var lu=class{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){let r=s=>new Promise((o,c)=>{try{let u=e(s);o(u)}catch(u){c(u)}});r.onAbort=t,this.queue.push(r);let i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;let t=[];try{for(let r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(let i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}};async function RI(n,e={}){return Se(n,"GET","/v2/passwordPolicy",ye(n,e))}var PI=6,hu=class{constructor(e){var t,r,i,s;let o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=o.minPasswordLength)!==null&&t!==void 0?t:PI,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(s=e.forceUpgradeOnSignin)!==null&&s!==void 0?s:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,i,s,o,c;let u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(t=u.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),u.isValid&&(u.isValid=(r=u.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),u.isValid&&(u.isValid=(i=u.containsLowercaseLetter)!==null&&i!==void 0?i:!0),u.isValid&&(u.isValid=(s=u.containsUppercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(o=u.containsNumericCharacter)!==null&&o!==void 0?o:!0),u.isValid&&(u.isValid=(c=u.containsNonAlphanumericCharacter)!==null&&c!==void 0?c:!0),u}validatePasswordLengthOptions(e,t){let r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}};var du=class{constructor(e,t,r,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new mo(this),this.idTokenSubscription=new mo(this),this.beforeStateQueue=new lu(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Ep,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=wt(t)),this._initializationPromise=this.queue(async()=>{var r,i,s;if(!this._deleted&&(this.persistenceManager=await po.create(this,e),(r=this._resolvePersistenceManagerAvailable)===null||r===void 0||r.call(this),!this._deleted)){if(!((i=this._popupRedirectResolver)===null||i===void 0)&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;let e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{let t=await lo(this,{idToken:e}),r=await zt._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(Be(this.app)){let o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}let r=await this.assertedPersistence.getCurrentUser(),i=r,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();let o=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,c=i==null?void 0:i._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===c)&&(u!=null&&u.user)&&(i=u.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return z(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await ho(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=mI()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Be(this.app))return Promise.reject($t(this));let t=e?Ne(e):null;return t&&z(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&z(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Be(this.app)?Promise.reject($t(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Be(this.app)?Promise.reject($t(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(wt(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();let t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){let e=await RI(this),t=new hu(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new yt("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{let r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){let t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await bI(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){let r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){let t=e&&wt(e)||this._popupRedirectResolver;z(t,this,"argument-error"),this.redirectPersistenceManager=await po.create(this,[wt(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);let r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,i){if(this._deleted)return()=>{};let s=typeof t=="function"?t:t.next.bind(t),o=!1,c=this._isInitialized?Promise.resolve():this._initializationPromise;if(z(c,this,"internal-error"),c.then(()=>{o||s(this.currentUser)}),typeof t=="function"){let u=e.addObserver(t,r,i);return()=>{o=!0,u()}}else{let u=e.addObserver(t);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return z(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Mp(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;let t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);let r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);let i=await this._getAppCheckToken();return i&&(t["X-Firebase-AppCheck"]=i),t}async _getAppCheckToken(){var e;if(Be(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&hI(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}};function Sn(n){return Ne(n)}var mo=class{constructor(e){this.auth=e,this.observer=null,this.addObserver=zf(t=>this.observer=t)}get next(){return z(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}};var No={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function CI(n){No=n}function Fp(n){return No.loadJS(n)}function kI(){return No.recaptchaEnterpriseScript}function DI(){return No.gapiScript}function Up(n){return`__${n}${Math.floor(Math.random()*1e6)}`}var fu=class{constructor(){this.enterprise=new pu}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}},pu=class{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}};var NI="recaptcha-enterprise",Ri="NO_RECAPTCHA",go=class{constructor(e){this.type=NI,this.auth=Sn(e)}async verify(e="verify",t=!1){async function r(s){if(!t){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(o,c)=>{Ap(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)c(new Error("recaptcha Enterprise site key undefined"));else{let h=new uo(u);return s.tenantId==null?s._agentRecaptchaConfig=h:s._tenantRecaptchaConfigs[s.tenantId]=h,o(h.siteKey)}}).catch(u=>{c(u)})})}function i(s,o,c){let u=window.grecaptcha;sp(u)?u.enterprise.ready(()=>{u.enterprise.execute(s,{action:e}).then(h=>{o(h)}).catch(()=>{o(Ri)})}):c(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new fu().execute("siteKey",{action:"verify"}):new Promise((s,o)=>{r(this.auth).then(c=>{if(!t&&sp(window.grecaptcha))i(c,s,o);else{if(typeof window=="undefined"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let u=kI();u.length!==0&&(u+=c),Fp(u).then(()=>{i(c,s,o)}).catch(h=>{o(h)})}}).catch(c=>{o(c)})})}};async function Ti(n,e,t,r=!1,i=!1){let s=new go(n),o;if(i)o=Ri;else try{o=await s.verify(t)}catch{o=await s.verify(t,!0)}let c=Object.assign({},e);if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in c){let u=c.phoneEnrollmentInfo.phoneNumber,h=c.phoneEnrollmentInfo.recaptchaToken;Object.assign(c,{phoneEnrollmentInfo:{phoneNumber:u,recaptchaToken:h,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in c){let u=c.phoneSignInInfo.recaptchaToken;Object.assign(c,{phoneSignInInfo:{recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return c}return r?Object.assign(c,{captchaResp:o}):Object.assign(c,{captchaResponse:o}),Object.assign(c,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(c,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),c}async function Pi(n,e,t,r,i){var s,o;if(i==="EMAIL_PASSWORD_PROVIDER")if(!((s=n._getRecaptchaConfig())===null||s===void 0)&&s.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){let c=await Ti(n,e,t,t==="getOobCode");return r(n,c)}else return r(n,e).catch(async c=>{if(c.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);let u=await Ti(n,e,t,t==="getOobCode");return r(n,u)}else return Promise.reject(c)});else if(i==="PHONE_PROVIDER")if(!((o=n._getRecaptchaConfig())===null||o===void 0)&&o.isProviderEnabled("PHONE_PROVIDER")){let c=await Ti(n,e,t);return r(n,c).catch(async u=>{var h;if(((h=n._getRecaptchaConfig())===null||h===void 0?void 0:h.getProviderEnforcementState("PHONE_PROVIDER"))==="AUDIT"&&(u.code==="auth/missing-recaptcha-token"||u.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${t} flow.`);let f=await Ti(n,e,t,!1,!0);return r(n,f)}return Promise.reject(u)})}else{let c=await Ti(n,e,t,!1,!0);return r(n,c)}else return Promise.reject(i+" provider is not supported.")}async function OI(n){let e=Sn(n),t=await Ap(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),r=new uo(t);e.tenantId==null?e._agentRecaptchaConfig=r:e._tenantRecaptchaConfigs[e.tenantId]=r,r.isAnyProviderEnabled()&&new go(e).verify()}function ku(n,e){let t=Ei(n,"auth");if(t.isInitialized()){let i=t.getImmediate(),s=t.getOptions();if(vt(s,e!=null?e:{}))return i;Ke(i,"already-initialized")}return t.initialize({options:e})}function VI(n,e){let t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(wt);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}var In=class{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return ot("not implemented")}_getIdTokenResponse(e){return ot("not implemented")}_linkToIdToken(e,t){return ot("not implemented")}_getReauthenticationResolver(e){return ot("not implemented")}};async function xI(n,e){return Se(n,"POST","/v1/accounts:signUp",e)}async function LI(n,e){return An(n,"POST","/v1/accounts:signInWithPassword",ye(n,e))}async function MI(n,e){return An(n,"POST","/v1/accounts:signInWithEmailLink",ye(n,e))}async function FI(n,e){return An(n,"POST","/v1/accounts:signInWithEmailLink",ye(n,e))}var Di=class n extends In{constructor(e,t,r,i=null){super("password",r),this._email=e,this._password=t,this._tenantId=i}static _fromEmailAndPassword(e,t){return new n(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new n(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){let t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":let t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Pi(e,t,"signInWithPassword",LI,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return MI(e,{email:this._email,oobCode:this._password});default:Ke(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":let r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Pi(e,r,"signUpPassword",xI,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return FI(e,{idToken:t,email:this._email,oobCode:this._password});default:Ke(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}};async function hr(n,e){return An(n,"POST","/v1/accounts:signInWithIdp",ye(n,e))}var UI="http://localhost",wn=class n extends In{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){let t=new n(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Ke("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){let t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i}=t,s=eo(t,["providerId","signInMethod"]);if(!r||!i)return null;let o=new n(r,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){let t=this.buildRequest();return hr(e,t)}_linkToIdToken(e,t){let r=this.buildRequest();return r.idToken=t,hr(e,r)}_getReauthenticationResolver(e){let t=this.buildRequest();return t.autoCreate=!1,hr(e,t)}buildRequest(){let e={requestUri:UI,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{let t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=cr(t)}return e}};async function up(n,e){return Se(n,"POST","/v1/accounts:sendVerificationCode",ye(n,e))}async function BI(n,e){return An(n,"POST","/v1/accounts:signInWithPhoneNumber",ye(n,e))}async function qI(n,e){let t=await An(n,"POST","/v1/accounts:signInWithPhoneNumber",ye(n,e));if(t.temporaryProof)throw bi(n,"account-exists-with-different-credential",t);return t}var jI={USER_NOT_FOUND:"user-not-found"};async function zI(n,e){let t=Object.assign(Object.assign({},e),{operation:"REAUTH"});return An(n,"POST","/v1/accounts:signInWithPhoneNumber",ye(n,t),jI)}var Ni=class n extends In{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,t){return new n({verificationId:e,verificationCode:t})}static _fromTokenResponse(e,t){return new n({phoneNumber:e,temporaryProof:t})}_getIdTokenResponse(e){return BI(e,this._makeVerificationRequest())}_linkToIdToken(e,t){return qI(e,Object.assign({idToken:t},this._makeVerificationRequest()))}_getReauthenticationResolver(e){return zI(e,this._makeVerificationRequest())}_makeVerificationRequest(){let{temporaryProof:e,phoneNumber:t,verificationId:r,verificationCode:i}=this.params;return e&&t?{temporaryProof:e,phoneNumber:t}:{sessionInfo:r,code:i}}toJSON(){let e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));let{verificationId:t,verificationCode:r,phoneNumber:i,temporaryProof:s}=e;return!r&&!t&&!i&&!s?null:new n({verificationId:t,verificationCode:r,phoneNumber:i,temporaryProof:s})}};function $I(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function GI(n){let e=ur(lr(n)).link,t=e?ur(lr(e)).deep_link_id:null,r=ur(lr(n)).deep_link_id;return(r?ur(lr(r)).link:null)||r||t||e||n}var _o=class n{constructor(e){var t,r,i,s,o,c;let u=ur(lr(e)),h=(t=u.apiKey)!==null&&t!==void 0?t:null,f=(r=u.oobCode)!==null&&r!==void 0?r:null,m=$I((i=u.mode)!==null&&i!==void 0?i:null);z(h&&f&&m,"argument-error"),this.apiKey=h,this.operation=m,this.code=f,this.continueUrl=(s=u.continueUrl)!==null&&s!==void 0?s:null,this.languageCode=(o=u.lang)!==null&&o!==void 0?o:null,this.tenantId=(c=u.tenantId)!==null&&c!==void 0?c:null}static parseLink(e){let t=GI(e);try{return new n(t)}catch{return null}}};var dr=class n{constructor(){this.providerId=n.PROVIDER_ID}static credential(e,t){return Di._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){let r=_o.parseLink(t);return z(r,"argument-error"),Di._fromEmailAndCode(e,r.code,r.tenantId)}};dr.PROVIDER_ID="password";dr.EMAIL_PASSWORD_SIGN_IN_METHOD="password";dr.EMAIL_LINK_SIGN_IN_METHOD="emailLink";var Oi=class{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}};var En=class extends Oi{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}};var Vi=class n extends En{constructor(){super("facebook.com")}static credential(e){return wn._fromParams({providerId:n.PROVIDER_ID,signInMethod:n.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return n.credentialFromTaggedObject(e)}static credentialFromError(e){return n.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return n.credential(e.oauthAccessToken)}catch{return null}}};Vi.FACEBOOK_SIGN_IN_METHOD="facebook.com";Vi.PROVIDER_ID="facebook.com";var Tn=class n extends En{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return wn._fromParams({providerId:n.PROVIDER_ID,signInMethod:n.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return n.credentialFromTaggedObject(e)}static credentialFromError(e){return n.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return n.credential(t,r)}catch{return null}}};Tn.GOOGLE_SIGN_IN_METHOD="google.com";Tn.PROVIDER_ID="google.com";var xi=class n extends En{constructor(){super("github.com")}static credential(e){return wn._fromParams({providerId:n.PROVIDER_ID,signInMethod:n.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return n.credentialFromTaggedObject(e)}static credentialFromError(e){return n.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return n.credential(e.oauthAccessToken)}catch{return null}}};xi.GITHUB_SIGN_IN_METHOD="github.com";xi.PROVIDER_ID="github.com";var Li=class n extends En{constructor(){super("twitter.com")}static credential(e,t){return wn._fromParams({providerId:n.PROVIDER_ID,signInMethod:n.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return n.credentialFromTaggedObject(e)}static credentialFromError(e){return n.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return n.credential(t,r)}catch{return null}}};Li.TWITTER_SIGN_IN_METHOD="twitter.com";Li.PROVIDER_ID="twitter.com";var Mi=class n{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,i=!1){let s=await zt._fromIdTokenResponse(e,r,i),o=lp(r);return new n({user:s,providerId:o,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);let i=lp(r);return new n({user:e,providerId:i,_tokenResponse:r,operationType:t})}};function lp(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}var mu=class n extends Ue{constructor(e,t,r,i){var s;super(t.code,t.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,n.prototype),this.customData={appName:e.name,tenantId:(s=e.tenantId)!==null&&s!==void 0?s:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,i){return new n(e,t,r,i)}};function Bp(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?mu._fromErrorAndOperation(n,s,e,r):s})}async function WI(n,e,t=!1){let r=await Ci(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Mi._forOperation(n,"link",r)}async function KI(n,e,t=!1){let{auth:r}=n;if(Be(r.app))return Promise.reject($t(r));let i="reauthenticate";try{let s=await Ci(n,Bp(r,i,e,n),t);z(s.idToken,r,"internal-error");let o=Pu(s.idToken);z(o,r,"internal-error");let{sub:c}=o;return z(n.uid===c,r,"user-mismatch"),Mi._forOperation(n,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&Ke(r,"user-mismatch"),s}}async function HI(n,e,t=!1){if(Be(n.app))return Promise.reject($t(n));let r="signIn",i=await Bp(n,r,e),s=await Mi._fromIdTokenResponse(n,r,i);return t||await n._updateCurrentUser(s.user),s}function Du(n,e,t,r){return Ne(n).onAuthStateChanged(e,t,r)}function Nu(n){return Ne(n).signOut()}function hp(n,e){return Se(n,"POST","/v2/accounts/mfaEnrollment:start",ye(n,e))}function QI(n,e){return Se(n,"POST","/v2/accounts/mfaEnrollment:finalize",ye(n,e))}function YI(n,e){return Se(n,"POST","/v2/accounts/mfaEnrollment:start",ye(n,e))}function JI(n,e){return Se(n,"POST","/v2/accounts/mfaEnrollment:finalize",ye(n,e))}var yo="__sak";var vo=class{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(yo,"1"),this.storage.removeItem(yo),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){let t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}};var XI=1e3,ZI=10,Io=class extends vo{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Lp(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(let t of Object.keys(this.listeners)){let r=this.storage.getItem(t),i=this.localCache[t];r!==i&&e(t,i,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,c,u)=>{this.notifyListeners(o,u)});return}let r=e.key;t?this.detachListener():this.stopPolling();let i=()=>{let o=this.storage.getItem(r);!t&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);SI()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,ZI):i()}notifyListeners(e,t){this.localCache[e]=t;let r=this.listeners[e];if(r)for(let i of Array.from(r))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},XI)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){let t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}};Io.type="LOCAL";var Ou=Io;var ew=1e3;function nu(n){var e,t;let r=n.replace(/[\\^$.*+?()[\]{}|]/g,"\\$&"),i=RegExp(`${r}=([^;]+)`);return(t=(e=document.cookie.match(i))===null||e===void 0?void 0:e[1])!==null&&t!==void 0?t:null}function ru(n){return`${window.location.protocol==="http:"?"__dev_":"__HOST-"}FIREBASE_${n.split(":")[3]}`}var gu=class{constructor(){this.type="COOKIE",this.listenerUnsubscribes=new Map}_getFinalTarget(e){if(typeof window===void 0)return e;let t=new URL(`${window.location.origin}/__cookies__`);return t.searchParams.set("finalTarget",e),t}async _isAvailable(){var e;return typeof isSecureContext=="boolean"&&!isSecureContext||typeof navigator=="undefined"||typeof document=="undefined"?!1:(e=navigator.cookieEnabled)!==null&&e!==void 0?e:!0}async _set(e,t){}async _get(e){if(!this._isAvailable())return null;let t=ru(e);if(window.cookieStore){let r=await window.cookieStore.get(t);return r==null?void 0:r.value}return nu(t)}async _remove(e){if(!this._isAvailable()||!await this._get(e))return;let r=ru(e);document.cookie=`${r}=;Max-Age=34560000;Partitioned;Secure;SameSite=Strict;Path=/;Priority=High`,await fetch("/__cookies__",{method:"DELETE"}).catch(()=>{})}_addListener(e,t){if(!this._isAvailable())return;let r=ru(e);if(window.cookieStore){let c=h=>{let f=h.changed.find(_=>_.name===r);f&&t(f.value),h.deleted.find(_=>_.name===r)&&t(null)},u=()=>window.cookieStore.removeEventListener("change",c);return this.listenerUnsubscribes.set(t,u),window.cookieStore.addEventListener("change",c)}let i=nu(r),s=setInterval(()=>{let c=nu(r);c!==i&&(t(c),i=c)},ew),o=()=>clearInterval(s);this.listenerUnsubscribes.set(t,o)}_removeListener(e,t){let r=this.listenerUnsubscribes.get(t);r&&(r(),this.listenerUnsubscribes.delete(t))}};gu.type="COOKIE";var wo=class extends vo{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}};wo.type="SESSION";var qp=wo;function tw(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}var Eo=class n{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){let t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;let r=new n(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){let t=e,{eventId:r,eventType:i,data:s}=t.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:i});let c=Array.from(o).map(async h=>h(t.origin,s)),u=await tw(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:u})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}};Eo.receivers=[];function Vu(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}var _u=class{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){let i=typeof MessageChannel!="undefined"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((c,u)=>{let h=Vu("",20);i.port1.start();let f=setTimeout(()=>{u(new Error("unsupported_event"))},r);o={messageChannel:i,onMessage(m){let _=m;if(_.data.eventId===h)switch(_.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),c(_.data.response);break;default:clearTimeout(f),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:h,data:t},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}};function ct(){return window}function nw(n){ct().location.href=n}function jp(){return typeof ct().WorkerGlobalScope!="undefined"&&typeof ct().importScripts=="function"}async function rw(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function iw(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function sw(){return jp()?self:null}var zp="firebaseLocalStorageDb",ow=1,To="firebaseLocalStorage",$p="fbase_key",bn=class{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}};function Oo(n,e){return n.transaction([To],e?"readwrite":"readonly").objectStore(To)}function aw(){let n=indexedDB.deleteDatabase(zp);return new bn(n).toPromise()}function yu(){let n=indexedDB.open(zp,ow);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{let r=n.result;try{r.createObjectStore(To,{keyPath:$p})}catch(i){t(i)}}),n.addEventListener("success",async()=>{let r=n.result;r.objectStoreNames.contains(To)?e(r):(r.close(),await aw(),e(await yu()))})})}async function dp(n,e,t){let r=Oo(n,!0).put({[$p]:e,value:t});return new bn(r).toPromise()}async function cw(n,e){let t=Oo(n,!1).get(e),r=await new bn(t).toPromise();return r===void 0?null:r.value}function fp(n,e){let t=Oo(n,!0).delete(e);return new bn(t).toPromise()}var uw=800,lw=3,bo=class{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await yu(),this.db)}async _withRetries(e){let t=0;for(;;)try{let r=await this._openDb();return await e(r)}catch(r){if(t++>lw)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return jp()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Eo._getInstance(sw()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await rw(),!this.activeServiceWorker)return;this.sender=new _u(this.activeServiceWorker);let r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||iw()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;let e=await yu();return await dp(e,yo,"1"),await fp(e,yo),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>dp(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){let t=await this._withRetries(r=>cw(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>fp(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){let e=await this._withRetries(i=>{let s=Oo(i,!1).getAll();return new bn(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];let t=[],r=new Set;if(e.length!==0)for(let{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),t.push(i));for(let i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}notifyListeners(e,t){this.localCache[e]=t;let r=this.listeners[e];if(r)for(let i of Array.from(r))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),uw)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}};bo.type="LOCAL";var xu=bo;function pp(n,e){return Se(n,"POST","/v2/accounts/mfaSignIn:start",ye(n,e))}function hw(n,e){return Se(n,"POST","/v2/accounts/mfaSignIn:finalize",ye(n,e))}function dw(n,e){return Se(n,"POST","/v2/accounts/mfaSignIn:finalize",ye(n,e))}var sA=Up("rcb"),oA=new vn(3e4,6e4);var io="recaptcha";async function fw(n,e,t){var r;if(!n._getRecaptchaConfig())try{await OI(n)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let i;if(typeof e=="string"?i={phoneNumber:e}:i=e,"session"in i){let s=i.session;if("phoneNumber"in i){z(s.type==="enroll",n,"internal-error");let o={idToken:s.credential,phoneEnrollmentInfo:{phoneNumber:i.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await Pi(n,o,"mfaSmsEnrollment",async(f,m)=>{if(m.phoneEnrollmentInfo.captchaResponse===Ri){z((t==null?void 0:t.type)===io,f,"argument-error");let _=await iu(f,m,t);return hp(f,_)}return hp(f,m)},"PHONE_PROVIDER").catch(f=>Promise.reject(f))).phoneSessionInfo.sessionInfo}else{z(s.type==="signin",n,"internal-error");let o=((r=i.multiFactorHint)===null||r===void 0?void 0:r.uid)||i.multiFactorUid;z(o,n,"missing-multi-factor-info");let c={mfaPendingCredential:s.credential,mfaEnrollmentId:o,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await Pi(n,c,"mfaSmsSignIn",async(m,_)=>{if(_.phoneSignInInfo.captchaResponse===Ri){z((t==null?void 0:t.type)===io,m,"argument-error");let S=await iu(m,_,t);return pp(m,S)}return pp(m,_)},"PHONE_PROVIDER").catch(m=>Promise.reject(m))).phoneResponseInfo.sessionInfo}}else{let s={phoneNumber:i.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await Pi(n,s,"sendVerificationCode",async(h,f)=>{if(f.captchaResponse===Ri){z((t==null?void 0:t.type)===io,h,"argument-error");let m=await iu(h,f,t);return up(h,m)}return up(h,f)},"PHONE_PROVIDER").catch(h=>Promise.reject(h))).sessionInfo}}finally{t==null||t._reset()}}async function iu(n,e,t){z(t.type===io,n,"argument-error");let r=await t.verify();z(typeof r=="string",n,"argument-error");let i=Object.assign({},e);if("phoneEnrollmentInfo"in i){let s=i.phoneEnrollmentInfo.phoneNumber,o=i.phoneEnrollmentInfo.captchaResponse,c=i.phoneEnrollmentInfo.clientType,u=i.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(i,{phoneEnrollmentInfo:{phoneNumber:s,recaptchaToken:r,captchaResponse:o,clientType:c,recaptchaVersion:u}}),i}else if("phoneSignInInfo"in i){let s=i.phoneSignInInfo.captchaResponse,o=i.phoneSignInInfo.clientType,c=i.phoneSignInInfo.recaptchaVersion;return Object.assign(i,{phoneSignInInfo:{recaptchaToken:r,captchaResponse:s,clientType:o,recaptchaVersion:c}}),i}else return Object.assign(i,{recaptchaToken:r}),i}var Fi=class n{constructor(e){this.providerId=n.PROVIDER_ID,this.auth=Sn(e)}verifyPhoneNumber(e,t){return fw(this.auth,e,Ne(t))}static credential(e,t){return Ni._fromVerification(e,t)}static credentialFromResult(e){let t=e;return n.credentialFromTaggedObject(t)}static credentialFromError(e){return n.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{phoneNumber:t,temporaryProof:r}=e;return t&&r?Ni._fromTokenResponse(t,r):null}};Fi.PROVIDER_ID="phone";Fi.PHONE_SIGN_IN_METHOD="phone";function Gp(n,e){return e?wt(e):(z(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}var Ui=class extends In{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return hr(e,this._buildIdpRequest())}_linkToIdToken(e,t){return hr(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return hr(e,this._buildIdpRequest())}_buildIdpRequest(e){let t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}};function pw(n){return HI(n.auth,new Ui(n),n.bypassAuthState)}function mw(n){let{auth:e,user:t}=n;return z(t,e,"internal-error"),KI(t,new Ui(n),n.bypassAuthState)}async function gw(n){let{auth:e,user:t}=n;return z(t,e,"internal-error"),WI(t,new Ui(n),n.bypassAuthState)}var Ao=class{constructor(e,t,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){let{urlResponse:t,sessionId:r,postBody:i,tenantId:s,error:o,type:c}=e;if(o){this.reject(o);return}let u={auth:this.auth,requestUri:t,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return pw;case"linkViaPopup":case"linkViaRedirect":return gw;case"reauthViaPopup":case"reauthViaRedirect":return mw;default:Ke(this.auth,"internal-error")}}resolve(e){Et(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Et(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}};var _w=new vn(2e3,1e4);var vu=class n extends Ao{constructor(e,t,r,i,s){super(e,t,i,s),this.provider=r,this.authWindow=null,this.pollId=null,n.currentPopupAction&&n.currentPopupAction.cancel(),n.currentPopupAction=this}async executeNotNull(){let e=await this.execute();return z(e,this.auth,"internal-error"),e}async onExecution(){Et(this.filter.length===1,"Popup operations only handle one event");let e=Vu();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(at(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(at(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,n.currentPopupAction=null}pollUserCancellation(){let e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(at(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,_w.get())};e()}};vu.currentPopupAction=null;var yw="pendingRedirect",so=new Map,Iu=class extends Ao{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=so.get(this.auth._key());if(!e){try{let r=await vw(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}so.set(this.auth._key(),e)}return this.bypassAuthState||so.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){let t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}};async function vw(n,e){let t=Kp(e),r=Wp(n);if(!await r._isAvailable())return!1;let i=await r._get(t)==="true";return await r._remove(t),i}async function Iw(n,e){return Wp(n)._set(Kp(e),"true")}function ww(n,e){so.set(n._key(),e)}function Wp(n){return wt(n._redirectPersistence)}function Kp(n){return ro(yw,n.config.apiKey,n.name)}function Lu(n,e,t){return Ew(n,e,t)}async function Ew(n,e,t){if(Be(n.app))return Promise.reject($t(n));let r=Sn(n);dI(n,e,Oi),await r._initializationPromise;let i=Gp(r,t);return await Iw(i,r),i._openRedirect(r,e,"signInViaRedirect")}async function Mu(n,e){return await Sn(n)._initializationPromise,Hp(n,e,!1)}async function Hp(n,e,t=!1){if(Be(n.app))return Promise.reject($t(n));let r=Sn(n),i=Gp(r,e),o=await new Iu(r,i,t).execute();return o&&!t&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}var Tw=10*60*1e3,wu=class{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!bw(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Qp(e)){let i=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(at(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){let r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Tw&&this.cachedEventUids.clear(),this.cachedEventUids.has(mp(e))}saveEventToCache(e){this.cachedEventUids.add(mp(e)),this.lastProcessedEventTime=Date.now()}};function mp(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Qp({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function bw(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Qp(n);default:return!1}}async function Aw(n,e={}){return Se(n,"GET","/v1/projects",e)}var Sw=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Rw=/^https?/;async function Pw(n){if(n.config.emulator)return;let{authorizedDomains:e}=await Aw(n);for(let t of e)try{if(Cw(t))return}catch{}Ke(n,"unauthorized-domain")}function Cw(n){let e=ou(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){let o=new URL(n);return o.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===r}if(!Rw.test(t))return!1;if(Sw.test(n))return r===n;let i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}var kw=new vn(3e4,6e4);function gp(){let n=ct().___jsl;if(n!=null&&n.H){for(let e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function Dw(n){return new Promise((e,t)=>{var r,i,s;function o(){gp(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{gp(),t(at(n,"network-request-failed"))},timeout:kw.get()})}if(!((i=(r=ct().gapi)===null||r===void 0?void 0:r.iframes)===null||i===void 0)&&i.Iframe)e(gapi.iframes.getContext());else if(!((s=ct().gapi)===null||s===void 0)&&s.load)o();else{let c=Up("iframefcb");return ct()[c]=()=>{gapi.load?o():t(at(n,"network-request-failed"))},Fp(`${DI()}?onload=${c}`).catch(u=>t(u))}}).catch(e=>{throw oo=null,e})}var oo=null;function Nw(n){return oo=oo||Dw(n),oo}var Ow=new vn(5e3,15e3),Vw="__/auth/iframe",xw="emulator/auth/iframe",Lw={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Mw=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Fw(n){let e=n.config;z(e.authDomain,n,"auth-domain-config-required");let t=e.emulator?Ru(e,xw):`https://${n.config.authDomain}/${Vw}`,r={apiKey:e.apiKey,appName:n.name,v:qt},i=Mw.get(n.config.apiHost);i&&(r.eid=i);let s=n._getFrameworks();return s.length&&(r.fw=s.join(",")),`${t}?${cr(r).slice(1)}`}async function Uw(n){let e=await Nw(n),t=ct().gapi;return z(t,n,"internal-error"),e.open({where:document.body,url:Fw(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Lw,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});let o=at(n,"network-request-failed"),c=ct().setTimeout(()=>{s(o)},Ow.get());function u(){ct().clearTimeout(c),i(r)}r.ping(u).then(u,()=>{s(o)})}))}var Bw={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},qw=500,jw=600,zw="_blank",$w="http://localhost",So=class{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}};function Gw(n,e,t,r=qw,i=jw){let s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString(),c="",u=Object.assign(Object.assign({},Bw),{width:r.toString(),height:i.toString(),top:s,left:o}),h=ue().toLowerCase();t&&(c=Dp(h)?zw:t),Cp(h)&&(e=e||$w,u.scrollbars="yes");let f=Object.entries(u).reduce((_,[S,C])=>`${_}${S}=${C},`,"");if(AI(h)&&c!=="_self")return Ww(e||"",c),new So(null);let m=window.open(e||"",c,f);z(m,n,"popup-blocked");try{m.focus()}catch{}return new So(m)}function Ww(n,e){let t=document.createElement("a");t.href=n,t.target=e;let r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}var Kw="__/auth/handler",Hw="emulator/auth/handler",Qw=encodeURIComponent("fac");async function _p(n,e,t,r,i,s){z(n.config.authDomain,n,"auth-domain-config-required"),z(n.config.apiKey,n,"invalid-api-key");let o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:qt,eventId:i};if(e instanceof Oi){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",jf(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(let[f,m]of Object.entries(s||{}))o[f]=m}if(e instanceof En){let f=e.getScopes().filter(m=>m!=="");f.length>0&&(o.scopes=f.join(","))}n.tenantId&&(o.tid=n.tenantId);let c=o;for(let f of Object.keys(c))c[f]===void 0&&delete c[f];let u=await n._getAppCheckToken(),h=u?`#${Qw}=${encodeURIComponent(u)}`:"";return`${Yw(n)}?${cr(c).slice(1)}${h}`}function Yw({config:n}){return n.emulator?Ru(n,Hw):`https://${n.authDomain}/${Kw}`}var su="webStorageSupport",Eu=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=qp,this._completeRedirectFn=Hp,this._overrideRedirectResult=ww}async _openPopup(e,t,r,i){var s;Et((s=this.eventManagers[e._key()])===null||s===void 0?void 0:s.manager,"_initialize() not called before _openPopup()");let o=await _p(e,t,r,ou(),i);return Gw(e,o,Vu())}async _openRedirect(e,t,r,i){await this._originValidation(e);let s=await _p(e,t,r,ou(),i);return nw(s),new Promise(()=>{})}_initialize(e){let t=e._key();if(this.eventManagers[t]){let{manager:i,promise:s}=this.eventManagers[t];return i?Promise.resolve(i):(Et(s,"If manager is not set, promise should be"),s)}let r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){let t=await Uw(e),r=new wu(e);return t.register("authEvent",i=>(z(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(su,{type:su},i=>{var s;let o=(s=i==null?void 0:i[0])===null||s===void 0?void 0:s[su];o!==void 0&&t(!!o),Ke(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){let t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=Pw(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Lp()||kp()||Cu()}},Fu=Eu,Ro=class{constructor(e){this.factorId=e}_process(e,t,r){switch(t.type){case"enroll":return this._finalizeEnroll(e,t.credential,r);case"signin":return this._finalizeSignIn(e,t.credential);default:return ot("unexpected MultiFactorSessionType")}}},Tu=class n extends Ro{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new n(e)}_finalizeEnroll(e,t,r){return QI(e,{idToken:t,displayName:r,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,t){return hw(e,{mfaPendingCredential:t,phoneVerificationInfo:this.credential._makeVerificationRequest()})}},Po=class{constructor(){}static assertion(e){return Tu._fromCredential(e)}};Po.FACTOR_ID="phone";var Co=class{static assertionForEnrollment(e,t){return ko._fromSecret(e,t)}static assertionForSignIn(e,t){return ko._fromEnrollmentId(e,t)}static async generateSecret(e){var t;let r=e;z(typeof((t=r.user)===null||t===void 0?void 0:t.auth)!="undefined","internal-error");let i=await YI(r.user.auth,{idToken:r.credential,totpEnrollmentInfo:{}});return Do._fromStartTotpMfaEnrollmentResponse(i,r.user.auth)}};Co.FACTOR_ID="totp";var ko=class n extends Ro{constructor(e,t,r){super("totp"),this.otp=e,this.enrollmentId=t,this.secret=r}static _fromSecret(e,t){return new n(t,void 0,e)}static _fromEnrollmentId(e,t){return new n(t,e)}async _finalizeEnroll(e,t,r){return z(typeof this.secret!="undefined",e,"argument-error"),JI(e,{idToken:t,displayName:r,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,t){z(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");let r={verificationCode:this.otp};return dw(e,{mfaPendingCredential:t,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:r})}},Do=class n{constructor(e,t,r,i,s,o,c){this.sessionInfo=o,this.auth=c,this.secretKey=e,this.hashingAlgorithm=t,this.codeLength=r,this.codeIntervalSeconds=i,this.enrollmentCompletionDeadline=s}static _fromStartTotpMfaEnrollmentResponse(e,t){return new n(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,t)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,t){var r;let i=!1;return(to(e)||to(t))&&(i=!0),i&&(to(e)&&(e=((r=this.auth.currentUser)===null||r===void 0?void 0:r.email)||"unknownuser"),to(t)&&(t=this.auth.name)),`otpauth://totp/${t}:${e}?secret=${this.secretKey}&issuer=${t}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}};function to(n){return typeof n=="undefined"||(n==null?void 0:n.length)===0}var yp="@firebase/auth",vp="1.10.8";var bu=class{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;let t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();let t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){z(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}};function Jw(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Xw(n){Bt(new We("auth",(e,{options:t})=>{let r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=r.options;z(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});let u={apiKey:o,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Mp(n)},h=new du(r,i,s,u);return VI(h,t),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Bt(new We("auth-internal",e=>{let t=Sn(e.getProvider("auth").getImmediate());return(r=>new bu(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Ze(yp,vp,Jw(n)),Ze(yp,vp,"esm2017")}var Zw=5*60,aA=Of("authIdTokenMaxAge")||Zw;function eE(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}CI({loadJS(n){return new Promise((e,t)=>{let r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=i=>{let s=at("internal-error");s.customData=i,t(s)},r.type="text/javascript",r.charset="UTF-8",eE().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Xw("Browser");var Yp=typeof globalThis!="undefined"?globalThis:typeof window!="undefined"?window:typeof global!="undefined"?global:typeof self!="undefined"?self:{},Jp={};var Tt,Uu;(function(){var n;function e(I,g){function y(){}y.prototype=g.prototype,I.D=g.prototype,I.prototype=new y,I.prototype.constructor=I,I.C=function(w,E,b){for(var v=Array(arguments.length-2),Ge=2;Ge<arguments.length;Ge++)v[Ge-2]=arguments[Ge];return g.prototype[E].apply(w,v)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(I,g,y){y||(y=0);var w=Array(16);if(typeof g=="string")for(var E=0;16>E;++E)w[E]=g.charCodeAt(y++)|g.charCodeAt(y++)<<8|g.charCodeAt(y++)<<16|g.charCodeAt(y++)<<24;else for(E=0;16>E;++E)w[E]=g[y++]|g[y++]<<8|g[y++]<<16|g[y++]<<24;g=I.g[0],y=I.g[1],E=I.g[2];var b=I.g[3],v=g+(b^y&(E^b))+w[0]+3614090360&4294967295;g=y+(v<<7&4294967295|v>>>25),v=b+(E^g&(y^E))+w[1]+3905402710&4294967295,b=g+(v<<12&4294967295|v>>>20),v=E+(y^b&(g^y))+w[2]+606105819&4294967295,E=b+(v<<17&4294967295|v>>>15),v=y+(g^E&(b^g))+w[3]+3250441966&4294967295,y=E+(v<<22&4294967295|v>>>10),v=g+(b^y&(E^b))+w[4]+4118548399&4294967295,g=y+(v<<7&4294967295|v>>>25),v=b+(E^g&(y^E))+w[5]+1200080426&4294967295,b=g+(v<<12&4294967295|v>>>20),v=E+(y^b&(g^y))+w[6]+2821735955&4294967295,E=b+(v<<17&4294967295|v>>>15),v=y+(g^E&(b^g))+w[7]+4249261313&4294967295,y=E+(v<<22&4294967295|v>>>10),v=g+(b^y&(E^b))+w[8]+1770035416&4294967295,g=y+(v<<7&4294967295|v>>>25),v=b+(E^g&(y^E))+w[9]+2336552879&4294967295,b=g+(v<<12&4294967295|v>>>20),v=E+(y^b&(g^y))+w[10]+4294925233&4294967295,E=b+(v<<17&4294967295|v>>>15),v=y+(g^E&(b^g))+w[11]+2304563134&4294967295,y=E+(v<<22&4294967295|v>>>10),v=g+(b^y&(E^b))+w[12]+1804603682&4294967295,g=y+(v<<7&4294967295|v>>>25),v=b+(E^g&(y^E))+w[13]+4254626195&4294967295,b=g+(v<<12&4294967295|v>>>20),v=E+(y^b&(g^y))+w[14]+2792965006&4294967295,E=b+(v<<17&4294967295|v>>>15),v=y+(g^E&(b^g))+w[15]+1236535329&4294967295,y=E+(v<<22&4294967295|v>>>10),v=g+(E^b&(y^E))+w[1]+4129170786&4294967295,g=y+(v<<5&4294967295|v>>>27),v=b+(y^E&(g^y))+w[6]+3225465664&4294967295,b=g+(v<<9&4294967295|v>>>23),v=E+(g^y&(b^g))+w[11]+643717713&4294967295,E=b+(v<<14&4294967295|v>>>18),v=y+(b^g&(E^b))+w[0]+3921069994&4294967295,y=E+(v<<20&4294967295|v>>>12),v=g+(E^b&(y^E))+w[5]+3593408605&4294967295,g=y+(v<<5&4294967295|v>>>27),v=b+(y^E&(g^y))+w[10]+38016083&4294967295,b=g+(v<<9&4294967295|v>>>23),v=E+(g^y&(b^g))+w[15]+3634488961&4294967295,E=b+(v<<14&4294967295|v>>>18),v=y+(b^g&(E^b))+w[4]+3889429448&4294967295,y=E+(v<<20&4294967295|v>>>12),v=g+(E^b&(y^E))+w[9]+568446438&4294967295,g=y+(v<<5&4294967295|v>>>27),v=b+(y^E&(g^y))+w[14]+3275163606&4294967295,b=g+(v<<9&4294967295|v>>>23),v=E+(g^y&(b^g))+w[3]+4107603335&4294967295,E=b+(v<<14&4294967295|v>>>18),v=y+(b^g&(E^b))+w[8]+1163531501&4294967295,y=E+(v<<20&4294967295|v>>>12),v=g+(E^b&(y^E))+w[13]+2850285829&4294967295,g=y+(v<<5&4294967295|v>>>27),v=b+(y^E&(g^y))+w[2]+4243563512&4294967295,b=g+(v<<9&4294967295|v>>>23),v=E+(g^y&(b^g))+w[7]+1735328473&4294967295,E=b+(v<<14&4294967295|v>>>18),v=y+(b^g&(E^b))+w[12]+2368359562&4294967295,y=E+(v<<20&4294967295|v>>>12),v=g+(y^E^b)+w[5]+4294588738&4294967295,g=y+(v<<4&4294967295|v>>>28),v=b+(g^y^E)+w[8]+2272392833&4294967295,b=g+(v<<11&4294967295|v>>>21),v=E+(b^g^y)+w[11]+1839030562&4294967295,E=b+(v<<16&4294967295|v>>>16),v=y+(E^b^g)+w[14]+4259657740&4294967295,y=E+(v<<23&4294967295|v>>>9),v=g+(y^E^b)+w[1]+2763975236&4294967295,g=y+(v<<4&4294967295|v>>>28),v=b+(g^y^E)+w[4]+1272893353&4294967295,b=g+(v<<11&4294967295|v>>>21),v=E+(b^g^y)+w[7]+4139469664&4294967295,E=b+(v<<16&4294967295|v>>>16),v=y+(E^b^g)+w[10]+3200236656&4294967295,y=E+(v<<23&4294967295|v>>>9),v=g+(y^E^b)+w[13]+681279174&4294967295,g=y+(v<<4&4294967295|v>>>28),v=b+(g^y^E)+w[0]+3936430074&4294967295,b=g+(v<<11&4294967295|v>>>21),v=E+(b^g^y)+w[3]+3572445317&4294967295,E=b+(v<<16&4294967295|v>>>16),v=y+(E^b^g)+w[6]+76029189&4294967295,y=E+(v<<23&4294967295|v>>>9),v=g+(y^E^b)+w[9]+3654602809&4294967295,g=y+(v<<4&4294967295|v>>>28),v=b+(g^y^E)+w[12]+3873151461&4294967295,b=g+(v<<11&4294967295|v>>>21),v=E+(b^g^y)+w[15]+530742520&4294967295,E=b+(v<<16&4294967295|v>>>16),v=y+(E^b^g)+w[2]+3299628645&4294967295,y=E+(v<<23&4294967295|v>>>9),v=g+(E^(y|~b))+w[0]+4096336452&4294967295,g=y+(v<<6&4294967295|v>>>26),v=b+(y^(g|~E))+w[7]+1126891415&4294967295,b=g+(v<<10&4294967295|v>>>22),v=E+(g^(b|~y))+w[14]+2878612391&4294967295,E=b+(v<<15&4294967295|v>>>17),v=y+(b^(E|~g))+w[5]+4237533241&4294967295,y=E+(v<<21&4294967295|v>>>11),v=g+(E^(y|~b))+w[12]+1700485571&4294967295,g=y+(v<<6&4294967295|v>>>26),v=b+(y^(g|~E))+w[3]+2399980690&4294967295,b=g+(v<<10&4294967295|v>>>22),v=E+(g^(b|~y))+w[10]+4293915773&4294967295,E=b+(v<<15&4294967295|v>>>17),v=y+(b^(E|~g))+w[1]+2240044497&4294967295,y=E+(v<<21&4294967295|v>>>11),v=g+(E^(y|~b))+w[8]+1873313359&4294967295,g=y+(v<<6&4294967295|v>>>26),v=b+(y^(g|~E))+w[15]+4264355552&4294967295,b=g+(v<<10&4294967295|v>>>22),v=E+(g^(b|~y))+w[6]+2734768916&4294967295,E=b+(v<<15&4294967295|v>>>17),v=y+(b^(E|~g))+w[13]+1309151649&4294967295,y=E+(v<<21&4294967295|v>>>11),v=g+(E^(y|~b))+w[4]+4149444226&4294967295,g=y+(v<<6&4294967295|v>>>26),v=b+(y^(g|~E))+w[11]+3174756917&4294967295,b=g+(v<<10&4294967295|v>>>22),v=E+(g^(b|~y))+w[2]+718787259&4294967295,E=b+(v<<15&4294967295|v>>>17),v=y+(b^(E|~g))+w[9]+3951481745&4294967295,I.g[0]=I.g[0]+g&4294967295,I.g[1]=I.g[1]+(E+(v<<21&4294967295|v>>>11))&4294967295,I.g[2]=I.g[2]+E&4294967295,I.g[3]=I.g[3]+b&4294967295}r.prototype.u=function(I,g){g===void 0&&(g=I.length);for(var y=g-this.blockSize,w=this.B,E=this.h,b=0;b<g;){if(E==0)for(;b<=y;)i(this,I,b),b+=this.blockSize;if(typeof I=="string"){for(;b<g;)if(w[E++]=I.charCodeAt(b++),E==this.blockSize){i(this,w),E=0;break}}else for(;b<g;)if(w[E++]=I[b++],E==this.blockSize){i(this,w),E=0;break}}this.h=E,this.o+=g},r.prototype.v=function(){var I=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);I[0]=128;for(var g=1;g<I.length-8;++g)I[g]=0;var y=8*this.o;for(g=I.length-8;g<I.length;++g)I[g]=y&255,y/=256;for(this.u(I),I=Array(16),g=y=0;4>g;++g)for(var w=0;32>w;w+=8)I[y++]=this.g[g]>>>w&255;return I};function s(I,g){var y=c;return Object.prototype.hasOwnProperty.call(y,I)?y[I]:y[I]=g(I)}function o(I,g){this.h=g;for(var y=[],w=!0,E=I.length-1;0<=E;E--){var b=I[E]|0;w&&b==g||(y[E]=b,w=!1)}this.g=y}var c={};function u(I){return-128<=I&&128>I?s(I,function(g){return new o([g|0],0>g?-1:0)}):new o([I|0],0>I?-1:0)}function h(I){if(isNaN(I)||!isFinite(I))return m;if(0>I)return k(h(-I));for(var g=[],y=1,w=0;I>=y;w++)g[w]=I/y|0,y*=4294967296;return new o(g,0)}function f(I,g){if(I.length==0)throw Error("number format error: empty string");if(g=g||10,2>g||36<g)throw Error("radix out of range: "+g);if(I.charAt(0)=="-")return k(f(I.substring(1),g));if(0<=I.indexOf("-"))throw Error('number format error: interior "-" character');for(var y=h(Math.pow(g,8)),w=m,E=0;E<I.length;E+=8){var b=Math.min(8,I.length-E),v=parseInt(I.substring(E,E+b),g);8>b?(b=h(Math.pow(g,b)),w=w.j(b).add(h(v))):(w=w.j(y),w=w.add(h(v)))}return w}var m=u(0),_=u(1),S=u(16777216);n=o.prototype,n.m=function(){if(N(this))return-k(this).m();for(var I=0,g=1,y=0;y<this.g.length;y++){var w=this.i(y);I+=(0<=w?w:4294967296+w)*g,g*=4294967296}return I},n.toString=function(I){if(I=I||10,2>I||36<I)throw Error("radix out of range: "+I);if(C(this))return"0";if(N(this))return"-"+k(this).toString(I);for(var g=h(Math.pow(I,6)),y=this,w="";;){var E=H(y,g).g;y=$(y,E.j(g));var b=((0<y.g.length?y.g[0]:y.h)>>>0).toString(I);if(y=E,C(y))return b+w;for(;6>b.length;)b="0"+b;w=b+w}},n.i=function(I){return 0>I?0:I<this.g.length?this.g[I]:this.h};function C(I){if(I.h!=0)return!1;for(var g=0;g<I.g.length;g++)if(I.g[g]!=0)return!1;return!0}function N(I){return I.h==-1}n.l=function(I){return I=$(this,I),N(I)?-1:C(I)?0:1};function k(I){for(var g=I.g.length,y=[],w=0;w<g;w++)y[w]=~I.g[w];return new o(y,~I.h).add(_)}n.abs=function(){return N(this)?k(this):this},n.add=function(I){for(var g=Math.max(this.g.length,I.g.length),y=[],w=0,E=0;E<=g;E++){var b=w+(this.i(E)&65535)+(I.i(E)&65535),v=(b>>>16)+(this.i(E)>>>16)+(I.i(E)>>>16);w=v>>>16,b&=65535,v&=65535,y[E]=v<<16|b}return new o(y,y[y.length-1]&-2147483648?-1:0)};function $(I,g){return I.add(k(g))}n.j=function(I){if(C(this)||C(I))return m;if(N(this))return N(I)?k(this).j(k(I)):k(k(this).j(I));if(N(I))return k(this.j(k(I)));if(0>this.l(S)&&0>I.l(S))return h(this.m()*I.m());for(var g=this.g.length+I.g.length,y=[],w=0;w<2*g;w++)y[w]=0;for(w=0;w<this.g.length;w++)for(var E=0;E<I.g.length;E++){var b=this.i(w)>>>16,v=this.i(w)&65535,Ge=I.i(E)>>>16,fn=I.i(E)&65535;y[2*w+2*E]+=v*fn,B(y,2*w+2*E),y[2*w+2*E+1]+=b*fn,B(y,2*w+2*E+1),y[2*w+2*E+1]+=v*Ge,B(y,2*w+2*E+1),y[2*w+2*E+2]+=b*Ge,B(y,2*w+2*E+2)}for(w=0;w<g;w++)y[w]=y[2*w+1]<<16|y[2*w];for(w=g;w<2*g;w++)y[w]=0;return new o(y,0)};function B(I,g){for(;(I[g]&65535)!=I[g];)I[g+1]+=I[g]>>>16,I[g]&=65535,g++}function M(I,g){this.g=I,this.h=g}function H(I,g){if(C(g))throw Error("division by zero");if(C(I))return new M(m,m);if(N(I))return g=H(k(I),g),new M(k(g.g),k(g.h));if(N(g))return g=H(I,k(g)),new M(k(g.g),g.h);if(30<I.g.length){if(N(I)||N(g))throw Error("slowDivide_ only works with positive integers.");for(var y=_,w=g;0>=w.l(I);)y=q(y),w=q(w);var E=U(y,1),b=U(w,1);for(w=U(w,2),y=U(y,2);!C(w);){var v=b.add(w);0>=v.l(I)&&(E=E.add(y),b=v),w=U(w,1),y=U(y,1)}return g=$(I,E.j(g)),new M(E,g)}for(E=m;0<=I.l(g);){for(y=Math.max(1,Math.floor(I.m()/g.m())),w=Math.ceil(Math.log(y)/Math.LN2),w=48>=w?1:Math.pow(2,w-48),b=h(y),v=b.j(g);N(v)||0<v.l(I);)y-=w,b=h(y),v=b.j(g);C(b)&&(b=_),E=E.add(b),I=$(I,v)}return new M(E,I)}n.A=function(I){return H(this,I).h},n.and=function(I){for(var g=Math.max(this.g.length,I.g.length),y=[],w=0;w<g;w++)y[w]=this.i(w)&I.i(w);return new o(y,this.h&I.h)},n.or=function(I){for(var g=Math.max(this.g.length,I.g.length),y=[],w=0;w<g;w++)y[w]=this.i(w)|I.i(w);return new o(y,this.h|I.h)},n.xor=function(I){for(var g=Math.max(this.g.length,I.g.length),y=[],w=0;w<g;w++)y[w]=this.i(w)^I.i(w);return new o(y,this.h^I.h)};function q(I){for(var g=I.g.length+1,y=[],w=0;w<g;w++)y[w]=I.i(w)<<1|I.i(w-1)>>>31;return new o(y,I.h)}function U(I,g){var y=g>>5;g%=32;for(var w=I.g.length-y,E=[],b=0;b<w;b++)E[b]=0<g?I.i(b+y)>>>g|I.i(b+y+1)<<32-g:I.i(b+y);return new o(E,I.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,Uu=Jp.Md5=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.A,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=h,o.fromString=f,Tt=Jp.Integer=o}).apply(typeof Yp!="undefined"?Yp:typeof self!="undefined"?self:typeof window!="undefined"?window:{});var Vo=typeof globalThis!="undefined"?globalThis:typeof window!="undefined"?window:typeof global!="undefined"?global:typeof self!="undefined"?self:{},bt={};var Bu,tE,fr,qu,Bi,xo,ju,zu,$u;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,l,d){return a==Array.prototype||a==Object.prototype||(a[l]=d.value),a};function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Vo=="object"&&Vo];for(var l=0;l<a.length;++l){var d=a[l];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var r=t(this);function i(a,l){if(l)e:{var d=r;a=a.split(".");for(var p=0;p<a.length-1;p++){var T=a[p];if(!(T in d))break e;d=d[T]}a=a[a.length-1],p=d[a],l=l(p),l!=p&&l!=null&&e(d,a,{configurable:!0,writable:!0,value:l})}}function s(a,l){a instanceof String&&(a+="");var d=0,p=!1,T={next:function(){if(!p&&d<a.length){var R=d++;return{value:l(R,a[R]),done:!1}}return p=!0,{done:!0,value:void 0}}};return T[Symbol.iterator]=function(){return T},T}i("Array.prototype.values",function(a){return a||function(){return s(this,function(l,d){return d})}});var o=o||{},c=this||self;function u(a){var l=typeof a;return l=l!="object"?l:a?Array.isArray(a)?"array":l:"null",l=="array"||l=="object"&&typeof a.length=="number"}function h(a){var l=typeof a;return l=="object"&&a!=null||l=="function"}function f(a,l,d){return a.call.apply(a.bind,arguments)}function m(a,l,d){if(!a)throw Error();if(2<arguments.length){var p=Array.prototype.slice.call(arguments,2);return function(){var T=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(T,p),a.apply(l,T)}}return function(){return a.apply(l,arguments)}}function _(a,l,d){return _=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:m,_.apply(null,arguments)}function S(a,l){var d=Array.prototype.slice.call(arguments,1);return function(){var p=d.slice();return p.push.apply(p,arguments),a.apply(this,p)}}function C(a,l){function d(){}d.prototype=l.prototype,a.aa=l.prototype,a.prototype=new d,a.prototype.constructor=a,a.Qb=function(p,T,R){for(var V=Array(arguments.length-2),re=2;re<arguments.length;re++)V[re-2]=arguments[re];return l.prototype[T].apply(p,V)}}function N(a){let l=a.length;if(0<l){let d=Array(l);for(let p=0;p<l;p++)d[p]=a[p];return d}return[]}function k(a,l){for(let d=1;d<arguments.length;d++){let p=arguments[d];if(u(p)){let T=a.length||0,R=p.length||0;a.length=T+R;for(let V=0;V<R;V++)a[T+V]=p[V]}else a.push(p)}}class ${constructor(l,d){this.i=l,this.j=d,this.h=0,this.g=null}get(){let l;return 0<this.h?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function B(a){return/^[\s\xa0]*$/.test(a)}function M(){var a=c.navigator;return a&&(a=a.userAgent)?a:""}function H(a){return H[" "](a),a}H[" "]=function(){};var q=M().indexOf("Gecko")!=-1&&!(M().toLowerCase().indexOf("webkit")!=-1&&M().indexOf("Edge")==-1)&&!(M().indexOf("Trident")!=-1||M().indexOf("MSIE")!=-1)&&M().indexOf("Edge")==-1;function U(a,l,d){for(let p in a)l.call(d,a[p],p,a)}function I(a,l){for(let d in a)l.call(void 0,a[d],d,a)}function g(a){let l={};for(let d in a)l[d]=a[d];return l}let y="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function w(a,l){let d,p;for(let T=1;T<arguments.length;T++){p=arguments[T];for(d in p)a[d]=p[d];for(let R=0;R<y.length;R++)d=y[R],Object.prototype.hasOwnProperty.call(p,d)&&(a[d]=p[d])}}function E(a){var l=1;a=a.split(":");let d=[];for(;0<l&&a.length;)d.push(a.shift()),l--;return a.length&&d.push(a.join(":")),d}function b(a){c.setTimeout(()=>{throw a},0)}function v(){var a=oc;let l=null;return a.g&&(l=a.g,a.g=a.g.next,a.g||(a.h=null),l.next=null),l}class Ge{constructor(){this.h=this.g=null}add(l,d){let p=fn.get();p.set(l,d),this.h?this.h.next=p:this.g=p,this.h=p}}var fn=new $(()=>new _y,a=>a.reset());class _y{constructor(){this.next=this.g=this.h=null}set(l,d){this.h=l,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let ti,ni=!1,oc=new Ge,bd=()=>{let a=c.Promise.resolve(void 0);ti=()=>{a.then(yy)}};var yy=()=>{for(var a;a=v();){try{a.h.call(a.g)}catch(d){b(d)}var l=fn;l.j(a),100>l.h&&(l.h++,a.next=l.g,l.g=a)}ni=!1};function Ot(){this.s=this.s,this.C=this.C}Ot.prototype.s=!1,Ot.prototype.ma=function(){this.s||(this.s=!0,this.N())},Ot.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function Ee(a,l){this.type=a,this.g=this.target=l,this.defaultPrevented=!1}Ee.prototype.h=function(){this.defaultPrevented=!0};var vy=function(){if(!c.addEventListener||!Object.defineProperty)return!1;var a=!1,l=Object.defineProperty({},"passive",{get:function(){a=!0}});try{let d=()=>{};c.addEventListener("test",d,l),c.removeEventListener("test",d,l)}catch{}return a}();function ri(a,l){if(Ee.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a){var d=this.type=a.type,p=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;if(this.target=a.target||a.srcElement,this.g=l,l=a.relatedTarget){if(q){e:{try{H(l.nodeName);var T=!0;break e}catch{}T=!1}T||(l=null)}}else d=="mouseover"?l=a.fromElement:d=="mouseout"&&(l=a.toElement);this.relatedTarget=l,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=typeof a.pointerType=="string"?a.pointerType:Iy[a.pointerType]||"",this.state=a.state,this.i=a,a.defaultPrevented&&ri.aa.h.call(this)}}C(ri,Ee);var Iy={2:"touch",3:"pen",4:"mouse"};ri.prototype.h=function(){ri.aa.h.call(this);var a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var ii="closure_listenable_"+(1e6*Math.random()|0),wy=0;function Ey(a,l,d,p,T){this.listener=a,this.proxy=null,this.src=l,this.type=d,this.capture=!!p,this.ha=T,this.key=++wy,this.da=this.fa=!1}function Cs(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function ks(a){this.src=a,this.g={},this.h=0}ks.prototype.add=function(a,l,d,p,T){var R=a.toString();a=this.g[R],a||(a=this.g[R]=[],this.h++);var V=cc(a,l,p,T);return-1<V?(l=a[V],d||(l.fa=!1)):(l=new Ey(l,this.src,R,!!p,T),l.fa=d,a.push(l)),l};function ac(a,l){var d=l.type;if(d in a.g){var p=a.g[d],T=Array.prototype.indexOf.call(p,l,void 0),R;(R=0<=T)&&Array.prototype.splice.call(p,T,1),R&&(Cs(l),a.g[d].length==0&&(delete a.g[d],a.h--))}}function cc(a,l,d,p){for(var T=0;T<a.length;++T){var R=a[T];if(!R.da&&R.listener==l&&R.capture==!!d&&R.ha==p)return T}return-1}var uc="closure_lm_"+(1e6*Math.random()|0),lc={};function Ad(a,l,d,p,T){if(p&&p.once)return Rd(a,l,d,p,T);if(Array.isArray(l)){for(var R=0;R<l.length;R++)Ad(a,l[R],d,p,T);return null}return d=pc(d),a&&a[ii]?a.K(l,d,h(p)?!!p.capture:!!p,T):Sd(a,l,d,!1,p,T)}function Sd(a,l,d,p,T,R){if(!l)throw Error("Invalid event type");var V=h(T)?!!T.capture:!!T,re=dc(a);if(re||(a[uc]=re=new ks(a)),d=re.add(l,d,p,V,R),d.proxy)return d;if(p=Ty(),d.proxy=p,p.src=a,p.listener=d,a.addEventListener)vy||(T=V),T===void 0&&(T=!1),a.addEventListener(l.toString(),p,T);else if(a.attachEvent)a.attachEvent(Cd(l.toString()),p);else if(a.addListener&&a.removeListener)a.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return d}function Ty(){function a(d){return l.call(a.src,a.listener,d)}let l=by;return a}function Rd(a,l,d,p,T){if(Array.isArray(l)){for(var R=0;R<l.length;R++)Rd(a,l[R],d,p,T);return null}return d=pc(d),a&&a[ii]?a.L(l,d,h(p)?!!p.capture:!!p,T):Sd(a,l,d,!0,p,T)}function Pd(a,l,d,p,T){if(Array.isArray(l))for(var R=0;R<l.length;R++)Pd(a,l[R],d,p,T);else p=h(p)?!!p.capture:!!p,d=pc(d),a&&a[ii]?(a=a.i,l=String(l).toString(),l in a.g&&(R=a.g[l],d=cc(R,d,p,T),-1<d&&(Cs(R[d]),Array.prototype.splice.call(R,d,1),R.length==0&&(delete a.g[l],a.h--)))):a&&(a=dc(a))&&(l=a.g[l.toString()],a=-1,l&&(a=cc(l,d,p,T)),(d=-1<a?l[a]:null)&&hc(d))}function hc(a){if(typeof a!="number"&&a&&!a.da){var l=a.src;if(l&&l[ii])ac(l.i,a);else{var d=a.type,p=a.proxy;l.removeEventListener?l.removeEventListener(d,p,a.capture):l.detachEvent?l.detachEvent(Cd(d),p):l.addListener&&l.removeListener&&l.removeListener(p),(d=dc(l))?(ac(d,a),d.h==0&&(d.src=null,l[uc]=null)):Cs(a)}}}function Cd(a){return a in lc?lc[a]:lc[a]="on"+a}function by(a,l){if(a.da)a=!0;else{l=new ri(l,this);var d=a.listener,p=a.ha||a.src;a.fa&&hc(a),a=d.call(p,l)}return a}function dc(a){return a=a[uc],a instanceof ks?a:null}var fc="__closure_events_fn_"+(1e9*Math.random()>>>0);function pc(a){return typeof a=="function"?a:(a[fc]||(a[fc]=function(l){return a.handleEvent(l)}),a[fc])}function Te(){Ot.call(this),this.i=new ks(this),this.M=this,this.F=null}C(Te,Ot),Te.prototype[ii]=!0,Te.prototype.removeEventListener=function(a,l,d,p){Pd(this,a,l,d,p)};function ke(a,l){var d,p=a.F;if(p)for(d=[];p;p=p.F)d.push(p);if(a=a.M,p=l.type||l,typeof l=="string")l=new Ee(l,a);else if(l instanceof Ee)l.target=l.target||a;else{var T=l;l=new Ee(p,a),w(l,T)}if(T=!0,d)for(var R=d.length-1;0<=R;R--){var V=l.g=d[R];T=Ds(V,p,!0,l)&&T}if(V=l.g=a,T=Ds(V,p,!0,l)&&T,T=Ds(V,p,!1,l)&&T,d)for(R=0;R<d.length;R++)V=l.g=d[R],T=Ds(V,p,!1,l)&&T}Te.prototype.N=function(){if(Te.aa.N.call(this),this.i){var a=this.i,l;for(l in a.g){for(var d=a.g[l],p=0;p<d.length;p++)Cs(d[p]);delete a.g[l],a.h--}}this.F=null},Te.prototype.K=function(a,l,d,p){return this.i.add(String(a),l,!1,d,p)},Te.prototype.L=function(a,l,d,p){return this.i.add(String(a),l,!0,d,p)};function Ds(a,l,d,p){if(l=a.i.g[String(l)],!l)return!0;l=l.concat();for(var T=!0,R=0;R<l.length;++R){var V=l[R];if(V&&!V.da&&V.capture==d){var re=V.listener,ve=V.ha||V.src;V.fa&&ac(a.i,V),T=re.call(ve,p)!==!1&&T}}return T&&!p.defaultPrevented}function kd(a,l,d){if(typeof a=="function")d&&(a=_(a,d));else if(a&&typeof a.handleEvent=="function")a=_(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(l)?-1:c.setTimeout(a,l||0)}function Dd(a){a.g=kd(()=>{a.g=null,a.i&&(a.i=!1,Dd(a))},a.l);let l=a.h;a.h=null,a.m.apply(null,l)}class Ay extends Ot{constructor(l,d){super(),this.m=l,this.l=d,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:Dd(this)}N(){super.N(),this.g&&(c.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function si(a){Ot.call(this),this.h=a,this.g={}}C(si,Ot);var Nd=[];function Od(a){U(a.g,function(l,d){this.g.hasOwnProperty(d)&&hc(l)},a),a.g={}}si.prototype.N=function(){si.aa.N.call(this),Od(this)},si.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var mc=c.JSON.stringify,Sy=c.JSON.parse,Ry=class{stringify(a){return c.JSON.stringify(a,void 0)}parse(a){return c.JSON.parse(a,void 0)}};function gc(){}gc.prototype.h=null;function Vd(a){return a.h||(a.h=a.i())}function xd(){}var oi={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function _c(){Ee.call(this,"d")}C(_c,Ee);function yc(){Ee.call(this,"c")}C(yc,Ee);var pn={},Ld=null;function Ns(){return Ld=Ld||new Te}pn.La="serverreachability";function Md(a){Ee.call(this,pn.La,a)}C(Md,Ee);function ai(a){let l=Ns();ke(l,new Md(l))}pn.STAT_EVENT="statevent";function Fd(a,l){Ee.call(this,pn.STAT_EVENT,a),this.stat=l}C(Fd,Ee);function De(a){let l=Ns();ke(l,new Fd(l,a))}pn.Ma="timingevent";function Ud(a,l){Ee.call(this,pn.Ma,a),this.size=l}C(Ud,Ee);function ci(a,l){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return c.setTimeout(function(){a()},l)}function ui(){this.g=!0}ui.prototype.xa=function(){this.g=!1};function Py(a,l,d,p,T,R){a.info(function(){if(a.g)if(R)for(var V="",re=R.split("&"),ve=0;ve<re.length;ve++){var Z=re[ve].split("=");if(1<Z.length){var be=Z[0];Z=Z[1];var Ae=be.split("_");V=2<=Ae.length&&Ae[1]=="type"?V+(be+"="+Z+"&"):V+(be+"=redacted&")}}else V=null;else V=R;return"XMLHTTP REQ ("+p+") [attempt "+T+"]: "+l+`
`+d+`
`+V})}function Cy(a,l,d,p,T,R,V){a.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+T+"]: "+l+`
`+d+`
`+R+" "+V})}function ir(a,l,d,p){a.info(function(){return"XMLHTTP TEXT ("+l+"): "+Dy(a,d)+(p?" "+p:"")})}function ky(a,l){a.info(function(){return"TIMEOUT: "+l})}ui.prototype.info=function(){};function Dy(a,l){if(!a.g)return l;if(!l)return null;try{var d=JSON.parse(l);if(d){for(a=0;a<d.length;a++)if(Array.isArray(d[a])){var p=d[a];if(!(2>p.length)){var T=p[1];if(Array.isArray(T)&&!(1>T.length)){var R=T[0];if(R!="noop"&&R!="stop"&&R!="close")for(var V=1;V<T.length;V++)T[V]=""}}}}return mc(d)}catch{return l}}var Os={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Bd={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},vc;function Vs(){}C(Vs,gc),Vs.prototype.g=function(){return new XMLHttpRequest},Vs.prototype.i=function(){return{}},vc=new Vs;function Vt(a,l,d,p){this.j=a,this.i=l,this.l=d,this.R=p||1,this.U=new si(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new qd}function qd(){this.i=null,this.g="",this.h=!1}var jd={},Ic={};function wc(a,l,d){a.L=1,a.v=Fs(gt(l)),a.m=d,a.P=!0,zd(a,null)}function zd(a,l){a.F=Date.now(),xs(a),a.A=gt(a.v);var d=a.A,p=a.R;Array.isArray(p)||(p=[String(p)]),rf(d.i,"t",p),a.C=0,d=a.j.J,a.h=new qd,a.g=Ef(a.j,d?l:null,!a.m),0<a.O&&(a.M=new Ay(_(a.Y,a,a.g),a.O)),l=a.U,d=a.g,p=a.ca;var T="readystatechange";Array.isArray(T)||(T&&(Nd[0]=T.toString()),T=Nd);for(var R=0;R<T.length;R++){var V=Ad(d,T[R],p||l.handleEvent,!1,l.h||l);if(!V)break;l.g[V.key]=V}l=a.H?g(a.H):{},a.m?(a.u||(a.u="POST"),l["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.A,a.u,a.m,l)):(a.u="GET",a.g.ea(a.A,a.u,null,l)),ai(),Py(a.i,a.u,a.A,a.l,a.R,a.m)}Vt.prototype.ca=function(a){a=a.target;let l=this.M;l&&_t(a)==3?l.j():this.Y(a)},Vt.prototype.Y=function(a){try{if(a==this.g)e:{let Ae=_t(this.g);var l=this.g.Ba();let ar=this.g.Z();if(!(3>Ae)&&(Ae!=3||this.g&&(this.h.h||this.g.oa()||hf(this.g)))){this.J||Ae!=4||l==7||(l==8||0>=ar?ai(3):ai(2)),Ec(this);var d=this.g.Z();this.X=d;t:if($d(this)){var p=hf(this.g);a="";var T=p.length,R=_t(this.g)==4;if(!this.h.i){if(typeof TextDecoder=="undefined"){mn(this),li(this);var V="";break t}this.h.i=new c.TextDecoder}for(l=0;l<T;l++)this.h.h=!0,a+=this.h.i.decode(p[l],{stream:!(R&&l==T-1)});p.length=0,this.h.g+=a,this.C=0,V=this.h.g}else V=this.g.oa();if(this.o=d==200,Cy(this.i,this.u,this.A,this.l,this.R,Ae,d),this.o){if(this.T&&!this.K){t:{if(this.g){var re,ve=this.g;if((re=ve.g?ve.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!B(re)){var Z=re;break t}}Z=null}if(d=Z)ir(this.i,this.l,d,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Tc(this,d);else{this.o=!1,this.s=3,De(12),mn(this),li(this);break e}}if(this.P){d=!0;let Xe;for(;!this.J&&this.C<V.length;)if(Xe=Ny(this,V),Xe==Ic){Ae==4&&(this.s=4,De(14),d=!1),ir(this.i,this.l,null,"[Incomplete Response]");break}else if(Xe==jd){this.s=4,De(15),ir(this.i,this.l,V,"[Invalid Chunk]"),d=!1;break}else ir(this.i,this.l,Xe,null),Tc(this,Xe);if($d(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Ae!=4||V.length!=0||this.h.h||(this.s=1,De(16),d=!1),this.o=this.o&&d,!d)ir(this.i,this.l,V,"[Invalid Chunked Response]"),mn(this),li(this);else if(0<V.length&&!this.W){this.W=!0;var be=this.j;be.g==this&&be.ba&&!be.M&&(be.j.info("Great, no buffering proxy detected. Bytes received: "+V.length),Cc(be),be.M=!0,De(11))}}else ir(this.i,this.l,V,null),Tc(this,V);Ae==4&&mn(this),this.o&&!this.J&&(Ae==4?yf(this.j,this):(this.o=!1,xs(this)))}else Qy(this.g),d==400&&0<V.indexOf("Unknown SID")?(this.s=3,De(12)):(this.s=0,De(13)),mn(this),li(this)}}}catch{}finally{}};function $d(a){return a.g?a.u=="GET"&&a.L!=2&&a.j.Ca:!1}function Ny(a,l){var d=a.C,p=l.indexOf(`
`,d);return p==-1?Ic:(d=Number(l.substring(d,p)),isNaN(d)?jd:(p+=1,p+d>l.length?Ic:(l=l.slice(p,p+d),a.C=p+d,l)))}Vt.prototype.cancel=function(){this.J=!0,mn(this)};function xs(a){a.S=Date.now()+a.I,Gd(a,a.I)}function Gd(a,l){if(a.B!=null)throw Error("WatchDog timer not null");a.B=ci(_(a.ba,a),l)}function Ec(a){a.B&&(c.clearTimeout(a.B),a.B=null)}Vt.prototype.ba=function(){this.B=null;let a=Date.now();0<=a-this.S?(ky(this.i,this.A),this.L!=2&&(ai(),De(17)),mn(this),this.s=2,li(this)):Gd(this,this.S-a)};function li(a){a.j.G==0||a.J||yf(a.j,a)}function mn(a){Ec(a);var l=a.M;l&&typeof l.ma=="function"&&l.ma(),a.M=null,Od(a.U),a.g&&(l=a.g,a.g=null,l.abort(),l.ma())}function Tc(a,l){try{var d=a.j;if(d.G!=0&&(d.g==a||bc(d.h,a))){if(!a.K&&bc(d.h,a)&&d.G==3){try{var p=d.Da.g.parse(l)}catch{p=null}if(Array.isArray(p)&&p.length==3){var T=p;if(T[0]==0){e:if(!d.u){if(d.g)if(d.g.F+3e3<a.F)zs(d),qs(d);else break e;Pc(d),De(18)}}else d.za=T[1],0<d.za-d.T&&37500>T[2]&&d.F&&d.v==0&&!d.C&&(d.C=ci(_(d.Za,d),6e3));if(1>=Hd(d.h)&&d.ca){try{d.ca()}catch{}d.ca=void 0}}else _n(d,11)}else if((a.K||d.g==a)&&zs(d),!B(l))for(T=d.Da.g.parse(l),l=0;l<T.length;l++){let Z=T[l];if(d.T=Z[0],Z=Z[1],d.G==2)if(Z[0]=="c"){d.K=Z[1],d.ia=Z[2];let be=Z[3];be!=null&&(d.la=be,d.j.info("VER="+d.la));let Ae=Z[4];Ae!=null&&(d.Aa=Ae,d.j.info("SVER="+d.Aa));let ar=Z[5];ar!=null&&typeof ar=="number"&&0<ar&&(p=1.5*ar,d.L=p,d.j.info("backChannelRequestTimeoutMs_="+p)),p=d;let Xe=a.g;if(Xe){let Gs=Xe.g?Xe.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Gs){var R=p.h;R.g||Gs.indexOf("spdy")==-1&&Gs.indexOf("quic")==-1&&Gs.indexOf("h2")==-1||(R.j=R.l,R.g=new Set,R.h&&(Ac(R,R.h),R.h=null))}if(p.D){let kc=Xe.g?Xe.g.getResponseHeader("X-HTTP-Session-Id"):null;kc&&(p.ya=kc,ie(p.I,p.D,kc))}}d.G=3,d.l&&d.l.ua(),d.ba&&(d.R=Date.now()-a.F,d.j.info("Handshake RTT: "+d.R+"ms")),p=d;var V=a;if(p.qa=wf(p,p.J?p.ia:null,p.W),V.K){Qd(p.h,V);var re=V,ve=p.L;ve&&(re.I=ve),re.B&&(Ec(re),xs(re)),p.g=V}else gf(p);0<d.i.length&&js(d)}else Z[0]!="stop"&&Z[0]!="close"||_n(d,7);else d.G==3&&(Z[0]=="stop"||Z[0]=="close"?Z[0]=="stop"?_n(d,7):Rc(d):Z[0]!="noop"&&d.l&&d.l.ta(Z),d.v=0)}}ai(4)}catch{}}var Oy=class{constructor(a,l){this.g=a,this.map=l}};function Wd(a){this.l=a||10,c.PerformanceNavigationTiming?(a=c.performance.getEntriesByType("navigation"),a=0<a.length&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(c.chrome&&c.chrome.loadTimes&&c.chrome.loadTimes()&&c.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Kd(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Hd(a){return a.h?1:a.g?a.g.size:0}function bc(a,l){return a.h?a.h==l:a.g?a.g.has(l):!1}function Ac(a,l){a.g?a.g.add(l):a.h=l}function Qd(a,l){a.h&&a.h==l?a.h=null:a.g&&a.g.has(l)&&a.g.delete(l)}Wd.prototype.cancel=function(){if(this.i=Yd(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(let a of this.g.values())a.cancel();this.g.clear()}};function Yd(a){if(a.h!=null)return a.i.concat(a.h.D);if(a.g!=null&&a.g.size!==0){let l=a.i;for(let d of a.g.values())l=l.concat(d.D);return l}return N(a.i)}function Vy(a){if(a.V&&typeof a.V=="function")return a.V();if(typeof Map!="undefined"&&a instanceof Map||typeof Set!="undefined"&&a instanceof Set)return Array.from(a.values());if(typeof a=="string")return a.split("");if(u(a)){for(var l=[],d=a.length,p=0;p<d;p++)l.push(a[p]);return l}l=[],d=0;for(p in a)l[d++]=a[p];return l}function xy(a){if(a.na&&typeof a.na=="function")return a.na();if(!a.V||typeof a.V!="function"){if(typeof Map!="undefined"&&a instanceof Map)return Array.from(a.keys());if(!(typeof Set!="undefined"&&a instanceof Set)){if(u(a)||typeof a=="string"){var l=[];a=a.length;for(var d=0;d<a;d++)l.push(d);return l}l=[],d=0;for(let p in a)l[d++]=p;return l}}}function Jd(a,l){if(a.forEach&&typeof a.forEach=="function")a.forEach(l,void 0);else if(u(a)||typeof a=="string")Array.prototype.forEach.call(a,l,void 0);else for(var d=xy(a),p=Vy(a),T=p.length,R=0;R<T;R++)l.call(void 0,p[R],d&&d[R],a)}var Xd=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Ly(a,l){if(a){a=a.split("&");for(var d=0;d<a.length;d++){var p=a[d].indexOf("="),T=null;if(0<=p){var R=a[d].substring(0,p);T=a[d].substring(p+1)}else R=a[d];l(R,T?decodeURIComponent(T.replace(/\+/g," ")):"")}}}function gn(a){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,a instanceof gn){this.h=a.h,Ls(this,a.j),this.o=a.o,this.g=a.g,Ms(this,a.s),this.l=a.l;var l=a.i,d=new fi;d.i=l.i,l.g&&(d.g=new Map(l.g),d.h=l.h),Zd(this,d),this.m=a.m}else a&&(l=String(a).match(Xd))?(this.h=!1,Ls(this,l[1]||"",!0),this.o=hi(l[2]||""),this.g=hi(l[3]||"",!0),Ms(this,l[4]),this.l=hi(l[5]||"",!0),Zd(this,l[6]||"",!0),this.m=hi(l[7]||"")):(this.h=!1,this.i=new fi(null,this.h))}gn.prototype.toString=function(){var a=[],l=this.j;l&&a.push(di(l,ef,!0),":");var d=this.g;return(d||l=="file")&&(a.push("//"),(l=this.o)&&a.push(di(l,ef,!0),"@"),a.push(encodeURIComponent(String(d)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.s,d!=null&&a.push(":",String(d))),(d=this.l)&&(this.g&&d.charAt(0)!="/"&&a.push("/"),a.push(di(d,d.charAt(0)=="/"?Uy:Fy,!0))),(d=this.i.toString())&&a.push("?",d),(d=this.m)&&a.push("#",di(d,qy)),a.join("")};function gt(a){return new gn(a)}function Ls(a,l,d){a.j=d?hi(l,!0):l,a.j&&(a.j=a.j.replace(/:$/,""))}function Ms(a,l){if(l){if(l=Number(l),isNaN(l)||0>l)throw Error("Bad port number "+l);a.s=l}else a.s=null}function Zd(a,l,d){l instanceof fi?(a.i=l,jy(a.i,a.h)):(d||(l=di(l,By)),a.i=new fi(l,a.h))}function ie(a,l,d){a.i.set(l,d)}function Fs(a){return ie(a,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),a}function hi(a,l){return a?l?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function di(a,l,d){return typeof a=="string"?(a=encodeURI(a).replace(l,My),d&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function My(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var ef=/[#\/\?@]/g,Fy=/[#\?:]/g,Uy=/[#\?]/g,By=/[#\?@]/g,qy=/#/g;function fi(a,l){this.h=this.g=null,this.i=a||null,this.j=!!l}function xt(a){a.g||(a.g=new Map,a.h=0,a.i&&Ly(a.i,function(l,d){a.add(decodeURIComponent(l.replace(/\+/g," ")),d)}))}n=fi.prototype,n.add=function(a,l){xt(this),this.i=null,a=sr(this,a);var d=this.g.get(a);return d||this.g.set(a,d=[]),d.push(l),this.h+=1,this};function tf(a,l){xt(a),l=sr(a,l),a.g.has(l)&&(a.i=null,a.h-=a.g.get(l).length,a.g.delete(l))}function nf(a,l){return xt(a),l=sr(a,l),a.g.has(l)}n.forEach=function(a,l){xt(this),this.g.forEach(function(d,p){d.forEach(function(T){a.call(l,T,p,this)},this)},this)},n.na=function(){xt(this);let a=Array.from(this.g.values()),l=Array.from(this.g.keys()),d=[];for(let p=0;p<l.length;p++){let T=a[p];for(let R=0;R<T.length;R++)d.push(l[p])}return d},n.V=function(a){xt(this);let l=[];if(typeof a=="string")nf(this,a)&&(l=l.concat(this.g.get(sr(this,a))));else{a=Array.from(this.g.values());for(let d=0;d<a.length;d++)l=l.concat(a[d])}return l},n.set=function(a,l){return xt(this),this.i=null,a=sr(this,a),nf(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[l]),this.h+=1,this},n.get=function(a,l){return a?(a=this.V(a),0<a.length?String(a[0]):l):l};function rf(a,l,d){tf(a,l),0<d.length&&(a.i=null,a.g.set(sr(a,l),N(d)),a.h+=d.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";let a=[],l=Array.from(this.g.keys());for(var d=0;d<l.length;d++){var p=l[d];let R=encodeURIComponent(String(p)),V=this.V(p);for(p=0;p<V.length;p++){var T=R;V[p]!==""&&(T+="="+encodeURIComponent(String(V[p]))),a.push(T)}}return this.i=a.join("&")};function sr(a,l){return l=String(l),a.j&&(l=l.toLowerCase()),l}function jy(a,l){l&&!a.j&&(xt(a),a.i=null,a.g.forEach(function(d,p){var T=p.toLowerCase();p!=T&&(tf(this,p),rf(this,T,d))},a)),a.j=l}function zy(a,l){let d=new ui;if(c.Image){let p=new Image;p.onload=S(Lt,d,"TestLoadImage: loaded",!0,l,p),p.onerror=S(Lt,d,"TestLoadImage: error",!1,l,p),p.onabort=S(Lt,d,"TestLoadImage: abort",!1,l,p),p.ontimeout=S(Lt,d,"TestLoadImage: timeout",!1,l,p),c.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=a}else l(!1)}function $y(a,l){let d=new ui,p=new AbortController,T=setTimeout(()=>{p.abort(),Lt(d,"TestPingServer: timeout",!1,l)},1e4);fetch(a,{signal:p.signal}).then(R=>{clearTimeout(T),R.ok?Lt(d,"TestPingServer: ok",!0,l):Lt(d,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(T),Lt(d,"TestPingServer: error",!1,l)})}function Lt(a,l,d,p,T){try{T&&(T.onload=null,T.onerror=null,T.onabort=null,T.ontimeout=null),p(d)}catch{}}function Gy(){this.g=new Ry}function Wy(a,l,d){let p=d||"";try{Jd(a,function(T,R){let V=T;h(T)&&(V=mc(T)),l.push(p+R+"="+encodeURIComponent(V))})}catch(T){throw l.push(p+"type="+encodeURIComponent("_badmap")),T}}function pi(a){this.l=a.Ub||null,this.j=a.eb||!1}C(pi,gc),pi.prototype.g=function(){return new Us(this.l,this.j)},pi.prototype.i=function(a){return function(){return a}}({});function Us(a,l){Te.call(this),this.D=a,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}C(Us,Te),n=Us.prototype,n.open=function(a,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=a,this.A=l,this.readyState=1,gi(this)},n.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;let l={headers:this.u,method:this.B,credentials:this.m,cache:void 0};a&&(l.body=a),(this.D||c).fetch(new Request(this.A,l)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,mi(this)),this.readyState=0},n.Sa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,gi(this)),this.g&&(this.readyState=3,gi(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof c.ReadableStream!="undefined"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;sf(this)}else a.text().then(this.Ra.bind(this),this.ga.bind(this))};function sf(a){a.j.read().then(a.Pa.bind(a)).catch(a.ga.bind(a))}n.Pa=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var l=a.value?a.value:new Uint8Array(0);(l=this.v.decode(l,{stream:!a.done}))&&(this.response=this.responseText+=l)}a.done?mi(this):gi(this),this.readyState==3&&sf(this)}},n.Ra=function(a){this.g&&(this.response=this.responseText=a,mi(this))},n.Qa=function(a){this.g&&(this.response=a,mi(this))},n.ga=function(){this.g&&mi(this)};function mi(a){a.readyState=4,a.l=null,a.j=null,a.v=null,gi(a)}n.setRequestHeader=function(a,l){this.u.append(a,l)},n.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";let a=[],l=this.h.entries();for(var d=l.next();!d.done;)d=d.value,a.push(d[0]+": "+d[1]),d=l.next();return a.join(`\r
`)};function gi(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(Us.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function of(a){let l="";return U(a,function(d,p){l+=p,l+=":",l+=d,l+=`\r
`}),l}function Sc(a,l,d){e:{for(p in d){var p=!1;break e}p=!0}p||(d=of(d),typeof a=="string"?d!=null&&encodeURIComponent(String(d)):ie(a,l,d))}function ce(a){Te.call(this),this.headers=new Map,this.o=a||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}C(ce,Te);var Ky=/^https?$/i,Hy=["POST","PUT"];n=ce.prototype,n.Ha=function(a){this.J=a},n.ea=function(a,l,d,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);l=l?l.toUpperCase():"GET",this.D=a,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():vc.g(),this.v=this.o?Vd(this.o):Vd(vc),this.g.onreadystatechange=_(this.Ea,this);try{this.B=!0,this.g.open(l,String(a),!0),this.B=!1}catch(R){af(this,R);return}if(a=d||"",d=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var T in p)d.set(T,p[T]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(let R of p.keys())d.set(R,p.get(R));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(d.keys()).find(R=>R.toLowerCase()=="content-type"),T=c.FormData&&a instanceof c.FormData,!(0<=Array.prototype.indexOf.call(Hy,l,void 0))||p||T||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(let[R,V]of d)this.g.setRequestHeader(R,V);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{lf(this),this.u=!0,this.g.send(a),this.u=!1}catch(R){af(this,R)}};function af(a,l){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=l,a.m=5,cf(a),Bs(a)}function cf(a){a.A||(a.A=!0,ke(a,"complete"),ke(a,"error"))}n.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=a||7,ke(this,"complete"),ke(this,"abort"),Bs(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Bs(this,!0)),ce.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?uf(this):this.bb())},n.bb=function(){uf(this)};function uf(a){if(a.h&&typeof o!="undefined"&&(!a.v[1]||_t(a)!=4||a.Z()!=2)){if(a.u&&_t(a)==4)kd(a.Ea,0,a);else if(ke(a,"readystatechange"),_t(a)==4){a.h=!1;try{let V=a.Z();e:switch(V){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var d;if(!(d=l)){var p;if(p=V===0){var T=String(a.D).match(Xd)[1]||null;!T&&c.self&&c.self.location&&(T=c.self.location.protocol.slice(0,-1)),p=!Ky.test(T?T.toLowerCase():"")}d=p}if(d)ke(a,"complete"),ke(a,"success");else{a.m=6;try{var R=2<_t(a)?a.g.statusText:""}catch{R=""}a.l=R+" ["+a.Z()+"]",cf(a)}}finally{Bs(a)}}}}function Bs(a,l){if(a.g){lf(a);let d=a.g,p=a.v[0]?()=>{}:null;a.g=null,a.v=null,l||ke(a,"ready");try{d.onreadystatechange=p}catch{}}}function lf(a){a.I&&(c.clearTimeout(a.I),a.I=null)}n.isActive=function(){return!!this.g};function _t(a){return a.g?a.g.readyState:0}n.Z=function(){try{return 2<_t(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(a){if(this.g){var l=this.g.responseText;return a&&l.indexOf(a)==0&&(l=l.substring(a.length)),Sy(l)}};function hf(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.H){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function Qy(a){let l={};a=(a.g&&2<=_t(a)&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<a.length;p++){if(B(a[p]))continue;var d=E(a[p]);let T=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();let R=l[T]||[];l[T]=R,R.push(d)}I(l,function(p){return p.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function _i(a,l,d){return d&&d.internalChannelParams&&d.internalChannelParams[a]||l}function df(a){this.Aa=0,this.i=[],this.j=new ui,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=_i("failFast",!1,a),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=_i("baseRetryDelayMs",5e3,a),this.cb=_i("retryDelaySeedMs",1e4,a),this.Wa=_i("forwardChannelMaxRetries",2,a),this.wa=_i("forwardChannelRequestTimeoutMs",2e4,a),this.pa=a&&a.xmlHttpFactory||void 0,this.Xa=a&&a.Tb||void 0,this.Ca=a&&a.useFetchStreams||!1,this.L=void 0,this.J=a&&a.supportsCrossDomainXhr||!1,this.K="",this.h=new Wd(a&&a.concurrentRequestLimit),this.Da=new Gy,this.P=a&&a.fastHandshake||!1,this.O=a&&a.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=a&&a.Rb||!1,a&&a.xa&&this.j.xa(),a&&a.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&a&&a.detectBufferingProxy||!1,this.ja=void 0,a&&a.longPollingTimeout&&0<a.longPollingTimeout&&(this.ja=a.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=df.prototype,n.la=8,n.G=1,n.connect=function(a,l,d,p){De(0),this.W=a,this.H=l||{},d&&p!==void 0&&(this.H.OSID=d,this.H.OAID=p),this.F=this.X,this.I=wf(this,null,this.W),js(this)};function Rc(a){if(ff(a),a.G==3){var l=a.U++,d=gt(a.I);if(ie(d,"SID",a.K),ie(d,"RID",l),ie(d,"TYPE","terminate"),yi(a,d),l=new Vt(a,a.j,l),l.L=2,l.v=Fs(gt(d)),d=!1,c.navigator&&c.navigator.sendBeacon)try{d=c.navigator.sendBeacon(l.v.toString(),"")}catch{}!d&&c.Image&&(new Image().src=l.v,d=!0),d||(l.g=Ef(l.j,null),l.g.ea(l.v)),l.F=Date.now(),xs(l)}If(a)}function qs(a){a.g&&(Cc(a),a.g.cancel(),a.g=null)}function ff(a){qs(a),a.u&&(c.clearTimeout(a.u),a.u=null),zs(a),a.h.cancel(),a.s&&(typeof a.s=="number"&&c.clearTimeout(a.s),a.s=null)}function js(a){if(!Kd(a.h)&&!a.s){a.s=!0;var l=a.Ga;ti||bd(),ni||(ti(),ni=!0),oc.add(l,a),a.B=0}}function Yy(a,l){return Hd(a.h)>=a.h.j-(a.s?1:0)?!1:a.s?(a.i=l.D.concat(a.i),!0):a.G==1||a.G==2||a.B>=(a.Va?0:a.Wa)?!1:(a.s=ci(_(a.Ga,a,l),vf(a,a.B)),a.B++,!0)}n.Ga=function(a){if(this.s)if(this.s=null,this.G==1){if(!a){this.U=Math.floor(1e5*Math.random()),a=this.U++;let T=new Vt(this,this.j,a),R=this.o;if(this.S&&(R?(R=g(R),w(R,this.S)):R=this.S),this.m!==null||this.O||(T.H=R,R=null),this.P)e:{for(var l=0,d=0;d<this.i.length;d++){t:{var p=this.i[d];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(l+=p,4096<l){l=d;break e}if(l===4096||d===this.i.length-1){l=d+1;break e}}l=1e3}else l=1e3;l=mf(this,T,l),d=gt(this.I),ie(d,"RID",a),ie(d,"CVER",22),this.D&&ie(d,"X-HTTP-Session-Id",this.D),yi(this,d),R&&(this.O?l="headers="+encodeURIComponent(String(of(R)))+"&"+l:this.m&&Sc(d,this.m,R)),Ac(this.h,T),this.Ua&&ie(d,"TYPE","init"),this.P?(ie(d,"$req",l),ie(d,"SID","null"),T.T=!0,wc(T,d,null)):wc(T,d,l),this.G=2}}else this.G==3&&(a?pf(this,a):this.i.length==0||Kd(this.h)||pf(this))};function pf(a,l){var d;l?d=l.l:d=a.U++;let p=gt(a.I);ie(p,"SID",a.K),ie(p,"RID",d),ie(p,"AID",a.T),yi(a,p),a.m&&a.o&&Sc(p,a.m,a.o),d=new Vt(a,a.j,d,a.B+1),a.m===null&&(d.H=a.o),l&&(a.i=l.D.concat(a.i)),l=mf(a,d,1e3),d.I=Math.round(.5*a.wa)+Math.round(.5*a.wa*Math.random()),Ac(a.h,d),wc(d,p,l)}function yi(a,l){a.H&&U(a.H,function(d,p){ie(l,p,d)}),a.l&&Jd({},function(d,p){ie(l,p,d)})}function mf(a,l,d){d=Math.min(a.i.length,d);var p=a.l?_(a.l.Na,a.l,a):null;e:{var T=a.i;let R=-1;for(;;){let V=["count="+d];R==-1?0<d?(R=T[0].g,V.push("ofs="+R)):R=0:V.push("ofs="+R);let re=!0;for(let ve=0;ve<d;ve++){let Z=T[ve].g,be=T[ve].map;if(Z-=R,0>Z)R=Math.max(0,T[ve].g-100),re=!1;else try{Wy(be,V,"req"+Z+"_")}catch{p&&p(be)}}if(re){p=V.join("&");break e}}}return a=a.i.splice(0,d),l.D=a,p}function gf(a){if(!a.g&&!a.u){a.Y=1;var l=a.Fa;ti||bd(),ni||(ti(),ni=!0),oc.add(l,a),a.v=0}}function Pc(a){return a.g||a.u||3<=a.v?!1:(a.Y++,a.u=ci(_(a.Fa,a),vf(a,a.v)),a.v++,!0)}n.Fa=function(){if(this.u=null,_f(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var a=2*this.R;this.j.info("BP detection timer enabled: "+a),this.A=ci(_(this.ab,this),a)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,De(10),qs(this),_f(this))};function Cc(a){a.A!=null&&(c.clearTimeout(a.A),a.A=null)}function _f(a){a.g=new Vt(a,a.j,"rpc",a.Y),a.m===null&&(a.g.H=a.o),a.g.O=0;var l=gt(a.qa);ie(l,"RID","rpc"),ie(l,"SID",a.K),ie(l,"AID",a.T),ie(l,"CI",a.F?"0":"1"),!a.F&&a.ja&&ie(l,"TO",a.ja),ie(l,"TYPE","xmlhttp"),yi(a,l),a.m&&a.o&&Sc(l,a.m,a.o),a.L&&(a.g.I=a.L);var d=a.g;a=a.ia,d.L=1,d.v=Fs(gt(l)),d.m=null,d.P=!0,zd(d,a)}n.Za=function(){this.C!=null&&(this.C=null,qs(this),Pc(this),De(19))};function zs(a){a.C!=null&&(c.clearTimeout(a.C),a.C=null)}function yf(a,l){var d=null;if(a.g==l){zs(a),Cc(a),a.g=null;var p=2}else if(bc(a.h,l))d=l.D,Qd(a.h,l),p=1;else return;if(a.G!=0){if(l.o)if(p==1){d=l.m?l.m.length:0,l=Date.now()-l.F;var T=a.B;p=Ns(),ke(p,new Ud(p,d)),js(a)}else gf(a);else if(T=l.s,T==3||T==0&&0<l.X||!(p==1&&Yy(a,l)||p==2&&Pc(a)))switch(d&&0<d.length&&(l=a.h,l.i=l.i.concat(d)),T){case 1:_n(a,5);break;case 4:_n(a,10);break;case 3:_n(a,6);break;default:_n(a,2)}}}function vf(a,l){let d=a.Ta+Math.floor(Math.random()*a.cb);return a.isActive()||(d*=2),d*l}function _n(a,l){if(a.j.info("Error code "+l),l==2){var d=_(a.fb,a),p=a.Xa;let T=!p;p=new gn(p||"//www.google.com/images/cleardot.gif"),c.location&&c.location.protocol=="http"||Ls(p,"https"),Fs(p),T?zy(p.toString(),d):$y(p.toString(),d)}else De(2);a.G=0,a.l&&a.l.sa(l),If(a),ff(a)}n.fb=function(a){a?(this.j.info("Successfully pinged google.com"),De(2)):(this.j.info("Failed to ping google.com"),De(1))};function If(a){if(a.G=0,a.ka=[],a.l){let l=Yd(a.h);(l.length!=0||a.i.length!=0)&&(k(a.ka,l),k(a.ka,a.i),a.h.i.length=0,N(a.i),a.i.length=0),a.l.ra()}}function wf(a,l,d){var p=d instanceof gn?gt(d):new gn(d);if(p.g!="")l&&(p.g=l+"."+p.g),Ms(p,p.s);else{var T=c.location;p=T.protocol,l=l?l+"."+T.hostname:T.hostname,T=+T.port;var R=new gn(null);p&&Ls(R,p),l&&(R.g=l),T&&Ms(R,T),d&&(R.l=d),p=R}return d=a.D,l=a.ya,d&&l&&ie(p,d,l),ie(p,"VER",a.la),yi(a,p),p}function Ef(a,l,d){if(l&&!a.J)throw Error("Can't create secondary domain capable XhrIo object.");return l=a.Ca&&!a.pa?new ce(new pi({eb:d})):new ce(a.pa),l.Ha(a.J),l}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Tf(){}n=Tf.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function $s(){}$s.prototype.g=function(a,l){return new Fe(a,l)};function Fe(a,l){Te.call(this),this.g=new df(l),this.l=a,this.h=l&&l.messageUrlParams||null,a=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(a?a["X-WebChannel-Content-Type"]=l.messageContentType:a={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.va&&(a?a["X-WebChannel-Client-Profile"]=l.va:a={"X-WebChannel-Client-Profile":l.va}),this.g.S=a,(a=l&&l.Sb)&&!B(a)&&(this.g.m=a),this.v=l&&l.supportsCrossDomainXhr||!1,this.u=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!B(l)&&(this.g.D=l,a=this.h,a!==null&&l in a&&(a=this.h,l in a&&delete a[l])),this.j=new or(this)}C(Fe,Te),Fe.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Fe.prototype.close=function(){Rc(this.g)},Fe.prototype.o=function(a){var l=this.g;if(typeof a=="string"){var d={};d.__data__=a,a=d}else this.u&&(d={},d.__data__=mc(a),a=d);l.i.push(new Oy(l.Ya++,a)),l.G==3&&js(l)},Fe.prototype.N=function(){this.g.l=null,delete this.j,Rc(this.g),delete this.g,Fe.aa.N.call(this)};function bf(a){_c.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var l=a.__sm__;if(l){e:{for(let d in l){a=d;break e}a=void 0}(this.i=a)&&(a=this.i,l=l!==null&&a in l?l[a]:void 0),this.data=l}else this.data=a}C(bf,_c);function Af(){yc.call(this),this.status=1}C(Af,yc);function or(a){this.g=a}C(or,Tf),or.prototype.ua=function(){ke(this.g,"a")},or.prototype.ta=function(a){ke(this.g,new bf(a))},or.prototype.sa=function(a){ke(this.g,new Af)},or.prototype.ra=function(){ke(this.g,"b")},$s.prototype.createWebChannel=$s.prototype.g,Fe.prototype.send=Fe.prototype.o,Fe.prototype.open=Fe.prototype.m,Fe.prototype.close=Fe.prototype.close,$u=bt.createWebChannelTransport=function(){return new $s},zu=bt.getStatEventTarget=function(){return Ns()},ju=bt.Event=pn,xo=bt.Stat={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Os.NO_ERROR=0,Os.TIMEOUT=8,Os.HTTP_ERROR=6,Bi=bt.ErrorCode=Os,Bd.COMPLETE="complete",qu=bt.EventType=Bd,xd.EventType=oi,oi.OPEN="a",oi.CLOSE="b",oi.ERROR="c",oi.MESSAGE="d",Te.prototype.listen=Te.prototype.K,fr=bt.WebChannel=xd,tE=bt.FetchXmlHttpFactory=pi,ce.prototype.listenOnce=ce.prototype.L,ce.prototype.getLastError=ce.prototype.Ka,ce.prototype.getLastErrorCode=ce.prototype.Ba,ce.prototype.getStatus=ce.prototype.Z,ce.prototype.getResponseJson=ce.prototype.Oa,ce.prototype.getResponseText=ce.prototype.oa,ce.prototype.send=ce.prototype.ea,ce.prototype.setWithCredentials=ce.prototype.Ha,Bu=bt.XhrIo=ce}).apply(typeof Vo!="undefined"?Vo:typeof self!="undefined"?self:typeof window!="undefined"?window:{});var Xp="@firebase/firestore",Zp="4.8.0";var pe=class{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}};pe.UNAUTHENTICATED=new pe(null),pe.GOOGLE_CREDENTIALS=new pe("google-credentials-uid"),pe.FIRST_PARTY=new pe("first-party-uid"),pe.MOCK_USER=new pe("mock-user");var Xr="11.10.0";var zn=new Ft("@firebase/firestore");function Ir(){return zn.logLevel}function D(n,...e){if(zn.logLevel<=Y.DEBUG){let t=e.map(Wh);zn.debug(`Firestore (${Xr}): ${n}`,...t)}}function Oe(n,...e){if(zn.logLevel<=Y.ERROR){let t=e.map(Wh);zn.error(`Firestore (${Xr}): ${n}`,...t)}}function St(n,...e){if(zn.logLevel<=Y.WARN){let t=e.map(Wh);zn.warn(`Firestore (${Xr}): ${n}`,...t)}}function Wh(n){if(typeof n=="string")return n;try{return function(t){return JSON.stringify(t)}(n)}catch{return n}}function F(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,dg(n,r,t)}function dg(n,e,t){let r=`FIRESTORE (${Xr}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw Oe(r),new Error(r)}function j(n,e,t,r){let i="Unexpected state";typeof t=="string"?i=t:r=t,n||dg(e,i,r)}function K(n,e){return n}var P={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"},x=class extends Ue{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}};var ht=class{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}};var Qo=class{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}},Ju=class{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(pe.UNAUTHENTICATED))}shutdown(){}},Xu=class{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}},Zu=class{constructor(e){this.t=e,this.currentUser=pe.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){j(this.o===void 0,42304);let r=this.i,i=u=>this.i!==r?(r=this.i,t(u)):Promise.resolve(),s=new ht;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new ht,e.enqueueRetryable(()=>i(this.currentUser))};let o=()=>{let u=s;e.enqueueRetryable(async()=>{await u.promise,await i(this.currentUser)})},c=u=>{D("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(u=>c(u)),setTimeout(()=>{if(!this.auth){let u=this.t.getImmediate({optional:!0});u?c(u):(D("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new ht)}},0),o()}getToken(){let e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(D("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(j(typeof r.accessToken=="string",31837,{l:r}),new Qo(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){let e=this.auth&&this.auth.getUid();return j(e===null||typeof e=="string",2055,{h:e}),new pe(e)}},el=class{constructor(e,t,r){this.P=e,this.T=t,this.I=r,this.type="FirstParty",this.user=pe.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);let e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}},tl=class{constructor(e,t,r){this.P=e,this.T=t,this.I=r}getToken(){return Promise.resolve(new el(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable(()=>t(pe.FIRST_PARTY))}shutdown(){}invalidateToken(){}},Yo=class{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}},nl=class{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Be(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){j(this.o===void 0,3512);let r=s=>{s.error!=null&&D("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);let o=s.token!==this.m;return this.m=s.token,D("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>r(s))};let i=s=>{D("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>i(s)),setTimeout(()=>{if(!this.appCheck){let s=this.V.getImmediate({optional:!0});s?i(s):D("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Yo(this.p));let e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(j(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new Yo(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}};function nE(n){let e=typeof self!="undefined"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}function fg(){return new TextEncoder}var es=class{static newId(){let e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516),r="";for(;r.length<20;){let i=nE(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<t&&(r+=e.charAt(i[s]%62))}return r}};function W(n,e){return n<e?-1:n>e?1:0}function rl(n,e){let t=0;for(;t<n.length&&t<e.length;){let r=n.codePointAt(t),i=e.codePointAt(t);if(r!==i){if(r<128&&i<128)return W(r,i);{let s=fg(),o=rE(s.encode(em(n,t)),s.encode(em(e,t)));return o!==0?o:W(r,i)}}t+=r>65535?2:1}return W(n.length,e.length)}function em(n,e){return n.codePointAt(e)>65535?n.substring(e,e+2):n.substring(e,e+1)}function rE(n,e){for(let t=0;t<n.length&&t<e.length;++t)if(n[t]!==e[t])return W(n[t],e[t]);return W(n.length,e.length)}function kr(n,e,t){return n.length===e.length&&n.every((r,i)=>t(r,e[i]))}function pg(n){return n+"\0"}var tm="__name__",Jo=class n{constructor(e,t,r){t===void 0?t=0:t>e.length&&F(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&F(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return n.comparator(this,e)===0}child(e){let t=this.segments.slice(this.offset,this.limit());return e instanceof n?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){let r=Math.min(e.length,t.length);for(let i=0;i<r;i++){let s=n.compareSegments(e.get(i),t.get(i));if(s!==0)return s}return W(e.length,t.length)}static compareSegments(e,t){let r=n.isNumericId(e),i=n.isNumericId(t);return r&&!i?-1:!r&&i?1:r&&i?n.extractNumericId(e).compare(n.extractNumericId(t)):rl(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Tt.fromString(e.substring(4,e.length-2))}},ee=class n extends Jo{construct(e,t,r){return new n(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){let t=[];for(let r of e){if(r.indexOf("//")>=0)throw new x(P.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(i=>i.length>0))}return new n(t)}static emptyPath(){return new n([])}},iE=/^[_a-zA-Z][_a-zA-Z0-9]*$/,me=class n extends Jo{construct(e,t,r){return new n(e,t,r)}static isValidIdentifier(e){return iE.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),n.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===tm}static keyField(){return new n([tm])}static fromServerFormat(e){let t=[],r="",i=0,s=()=>{if(r.length===0)throw new x(P.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""},o=!1;for(;i<e.length;){let c=e[i];if(c==="\\"){if(i+1===e.length)throw new x(P.INVALID_ARGUMENT,"Path has trailing escape character: "+e);let u=e[i+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new x(P.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,i+=2}else c==="`"?(o=!o,i++):c!=="."||o?(r+=c,i++):(s(),i++)}if(s(),o)throw new x(P.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new n(t)}static emptyPath(){return new n([])}};var L=class n{constructor(e){this.path=e}static fromPath(e){return new n(ee.fromString(e))}static fromName(e){return new n(ee.fromString(e).popFirst(5))}static empty(){return new n(ee.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ee.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return ee.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new n(new ee(e.slice()))}};function mg(n,e,t){if(!t)throw new x(P.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function sE(n,e,t,r){if(e===!0&&r===!0)throw new x(P.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function nm(n){if(!L.isDocumentKey(n))throw new x(P.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function rm(n){if(L.isDocumentKey(n))throw new x(P.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function gg(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Kh(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{let e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":F(12329,{type:typeof n})}function Mn(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new x(P.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{let t=Kh(n);throw new x(P.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}function de(n,e){let t={typeString:n};return e&&(t.value=e),t}function Is(n,e){if(!gg(n))throw new x(P.INVALID_ARGUMENT,"JSON must be an object");let t;for(let r in e)if(e[r]){let i=e[r].typeString,s="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}let o=n[r];if(i&&typeof o!==i){t=`JSON field '${r}' must be a ${i}.`;break}if(s!==void 0&&o!==s.value){t=`Expected '${r}' field to equal '${s.value}'`;break}}if(t)throw new x(P.INVALID_ARGUMENT,t);return!0}var im=-62135596800,sm=1e6,oe=class n{static now(){return n.fromMillis(Date.now())}static fromDate(e){return n.fromMillis(e.getTime())}static fromMillis(e){let t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*sm);return new n(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new x(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new x(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<im)throw new x(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new x(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/sm}_compareTo(e){return this.seconds===e.seconds?W(this.nanoseconds,e.nanoseconds):W(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:n._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Is(e,n._jsonSchema))return new n(e.seconds,e.nanoseconds)}valueOf(){let e=this.seconds-im;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}};oe._jsonSchemaVersion="firestore/timestamp/1.0",oe._jsonSchema={type:de("string",oe._jsonSchemaVersion),seconds:de("number"),nanoseconds:de("number")};var G=class n{static fromTimestamp(e){return new n(e)}static min(){return new n(new oe(0,0))}static max(){return new n(new oe(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}};var ts=-1,Dr=class{constructor(e,t,r,i){this.indexId=e,this.collectionGroup=t,this.fields=r,this.indexState=i}};function il(n){return n.fields.find(e=>e.kind===2)}function Pn(n){return n.fields.filter(e=>e.kind!==2)}Dr.UNKNOWN_ID=-1;var Sr=class{constructor(e,t){this.fieldPath=e,this.kind=t}};var ns=class n{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new n(0,Ye.min())}};function oE(n,e){let t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,i=G.fromTimestamp(r===1e9?new oe(t+1,0):new oe(t,r));return new Ye(i,L.empty(),e)}function _g(n){return new Ye(n.readTime,n.key,ts)}var Ye=class n{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new n(G.min(),L.empty(),ts)}static max(){return new n(G.max(),L.empty(),ts)}};function Hh(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=L.comparator(n.documentKey,e.documentKey),t!==0?t:W(n.largestBatchId,e.largestBatchId))}var yg="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.",Xo=class{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}};async function Jn(n){if(n.code!==P.FAILED_PRECONDITION||n.message!==yg)throw n;D("LocalStore","Unexpectedly lost primary lease")}var A=class n{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&F(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new n((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(t,s).next(r,i)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{let t=e();return t instanceof n?t:n.resolve(t)}catch(t){return n.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):n.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):n.reject(t)}static resolve(e){return new n((t,r)=>{t(e)})}static reject(e){return new n((t,r)=>{r(e)})}static waitFor(e){return new n((t,r)=>{let i=0,s=0,o=!1;e.forEach(c=>{++i,c.next(()=>{++s,o&&s===i&&t()},u=>r(u))}),o=!0,s===i&&t()})}static or(e){let t=n.resolve(!1);for(let r of e)t=t.next(i=>i?n.resolve(i):r());return t}static forEach(e,t){let r=[];return e.forEach((i,s)=>{r.push(t.call(this,i,s))}),this.waitFor(r)}static mapArray(e,t){return new n((r,i)=>{let s=e.length,o=new Array(s),c=0;for(let u=0;u<s;u++){let h=u;t(e[h]).next(f=>{o[h]=f,++c,c===s&&r(o)},f=>i(f))}})}static doWhile(e,t){return new n((r,i)=>{let s=()=>{e()===!0?t().next(()=>{s()},i):r()};s()})}};var qe="SimpleDb",Zo=class n{static open(e,t,r,i){try{return new n(t,e.transaction(i,r))}catch(s){throw new Fn(t,s)}}constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.S=new ht,this.transaction.oncomplete=()=>{this.S.resolve()},this.transaction.onabort=()=>{t.error?this.S.reject(new Fn(e,t.error)):this.S.resolve()},this.transaction.onerror=r=>{let i=Qh(r.target.error);this.S.reject(new Fn(e,i))}}get D(){return this.S.promise}abort(e){e&&this.S.reject(e),this.aborted||(D(qe,"Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}v(){let e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){let t=this.transaction.objectStore(e);return new ol(t)}},Nr=class n{static delete(e){return D(qe,"Removing database:",e),kn(Vc().indexedDB.deleteDatabase(e)).toPromise()}static C(){if(!Ys())return!1;if(n.F())return!0;let e=ue(),t=n.M(e),r=0<t&&t<10,i=vg(e),s=0<i&&i<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||r||s)}static F(){var e;return typeof process!="undefined"&&((e=process.__PRIVATE_env)===null||e===void 0?void 0:e.O)==="YES"}static N(e,t){return e.store(t)}static M(e){let t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),r=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(r)}constructor(e,t,r){this.name=e,this.version=t,this.B=r,this.L=null,n.M(ue())===12.2&&Oe("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}async k(e){return this.db||(D(qe,"Opening database:",this.name),this.db=await new Promise((t,r)=>{let i=indexedDB.open(this.name,this.version);i.onsuccess=s=>{let o=s.target.result;t(o)},i.onblocked=()=>{r(new Fn(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},i.onerror=s=>{let o=s.target.error;o.name==="VersionError"?r(new x(P.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?r(new x(P.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):r(new Fn(e,o))},i.onupgradeneeded=s=>{D(qe,'Database "'+this.name+'" requires upgrade from version:',s.oldVersion);let o=s.target.result;if(this.L!==null&&this.L!==s.oldVersion)throw new Error(`refusing to open IndexedDB database due to potential corruption of the IndexedDB database data; this corruption could be caused by clicking the "clear site data" button in a web browser; try reloading the web page to re-initialize the IndexedDB database: lastClosedDbVersion=${this.L}, event.oldVersion=${s.oldVersion}, event.newVersion=${s.newVersion}, db.version=${o.version}`);this.B.q(o,i.transaction,s.oldVersion,this.version).next(()=>{D(qe,"Database upgrade to version "+this.version+" complete")})}}),this.db.addEventListener("close",t=>{let r=t.target;this.L=r.version},{passive:!0})),this.db.addEventListener("versionchange",t=>{var r;t.newVersion===null&&(St('Received "versionchange" event with newVersion===null; notifying the registered DatabaseDeletedListener, if any'),(r=this.databaseDeletedListener)===null||r===void 0||r.call(this))},{passive:!0}),this.db}setDatabaseDeletedListener(e){if(this.databaseDeletedListener)throw new Error("setDatabaseDeletedListener() may only be called once, and it has already been called");this.databaseDeletedListener=e}async runTransaction(e,t,r,i){let s=t==="readonly",o=0;for(;;){++o;try{this.db=await this.k(e);let c=Zo.open(this.db,e,s?"readonly":"readwrite",r),u=i(c).next(h=>(c.v(),h)).catch(h=>(c.abort(h),A.reject(h))).toPromise();return u.catch(()=>{}),await c.D,u}catch(c){let u=c,h=u.name!=="FirebaseError"&&o<3;if(D(qe,"Transaction failed with error:",u.message,"Retrying:",h),this.close(),!h)return Promise.reject(u)}}}close(){this.db&&this.db.close(),this.db=void 0}};function vg(n){let e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}var sl=class{constructor(e){this.$=e,this.U=!1,this.K=null}get isDone(){return this.U}get W(){return this.K}set cursor(e){this.$=e}done(){this.U=!0}G(e){this.K=e}delete(){return kn(this.$.delete())}},Fn=class extends x{constructor(e,t){super(P.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}};function ln(n){return n.name==="IndexedDbTransactionError"}var ol=class{constructor(e){this.store=e}put(e,t){let r;return t!==void 0?(D(qe,"PUT",this.store.name,e,t),r=this.store.put(t,e)):(D(qe,"PUT",this.store.name,"<auto-key>",e),r=this.store.put(e)),kn(r)}add(e){return D(qe,"ADD",this.store.name,e,e),kn(this.store.add(e))}get(e){return kn(this.store.get(e)).next(t=>(t===void 0&&(t=null),D(qe,"GET",this.store.name,e,t),t))}delete(e){return D(qe,"DELETE",this.store.name,e),kn(this.store.delete(e))}count(){return D(qe,"COUNT",this.store.name),kn(this.store.count())}j(e,t){let r=this.options(e,t),i=r.index?this.store.index(r.index):this.store;if(typeof i.getAll=="function"){let s=i.getAll(r.range);return new A((o,c)=>{s.onerror=u=>{c(u.target.error)},s.onsuccess=u=>{o(u.target.result)}})}{let s=this.cursor(r),o=[];return this.J(s,(c,u)=>{o.push(u)}).next(()=>o)}}H(e,t){let r=this.store.getAll(e,t===null?void 0:t);return new A((i,s)=>{r.onerror=o=>{s(o.target.error)},r.onsuccess=o=>{i(o.target.result)}})}Y(e,t){D(qe,"DELETE ALL",this.store.name);let r=this.options(e,t);r.Z=!1;let i=this.cursor(r);return this.J(i,(s,o,c)=>c.delete())}X(e,t){let r;t?r=e:(r={},t=e);let i=this.cursor(r);return this.J(i,t)}ee(e){let t=this.cursor({});return new A((r,i)=>{t.onerror=s=>{let o=Qh(s.target.error);i(o)},t.onsuccess=s=>{let o=s.target.result;o?e(o.primaryKey,o.value).next(c=>{c?o.continue():r()}):r()}})}J(e,t){let r=[];return new A((i,s)=>{e.onerror=o=>{s(o.target.error)},e.onsuccess=o=>{let c=o.target.result;if(!c)return void i();let u=new sl(c),h=t(c.primaryKey,c.value,u);if(h instanceof A){let f=h.catch(m=>(u.done(),A.reject(m)));r.push(f)}u.isDone?i():u.W===null?c.continue():c.continue(u.W)}}).next(()=>A.waitFor(r))}options(e,t){let r;return e!==void 0&&(typeof e=="string"?r=e:t=e),{index:r,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){let r=this.store.index(e.index);return e.Z?r.openKeyCursor(e.range,t):r.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}};function kn(n){return new A((e,t)=>{n.onsuccess=r=>{let i=r.target.result;e(i)},n.onerror=r=>{let i=Qh(r.target.error);t(i)}})}var om=!1;function Qh(n){let e=Nr.M(ue());if(e>=12.2&&e<13){let t="An internal error was encountered in the Indexed Database server";if(n.message.indexOf(t)>=0){let r=new x("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return om||(om=!0,setTimeout(()=>{throw r},0)),r}}return n}var Ki="IndexBackfiller",al=class{constructor(e,t){this.asyncQueue=e,this.te=t,this.task=null}start(){this.ne(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}ne(e){D(Ki,`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,async()=>{this.task=null;try{let t=await this.te.re();D(Ki,`Documents written: ${t}`)}catch(t){ln(t)?D(Ki,"Ignoring IndexedDB error during index backfill: ",t):await Jn(t)}await this.ne(6e4)})}},cl=class{constructor(e,t){this.localStore=e,this.persistence=t}async re(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",t=>this.ie(t,e))}ie(e,t){let r=new Set,i=t,s=!0;return A.doWhile(()=>s===!0&&i>0,()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next(o=>{if(o!==null&&!r.has(o))return D(Ki,`Processing collection: ${o}`),this.se(e,o,i).next(c=>{i-=c,r.add(o)});s=!1})).next(()=>t-i)}se(e,t,r){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next(i=>this.localStore.localDocuments.getNextDocuments(e,t,i,r).next(s=>{let o=s.changes;return this.localStore.indexManager.updateIndexEntries(e,o).next(()=>this.oe(i,s)).next(c=>(D(Ki,`Updating offset: ${c}`),this.localStore.indexManager.updateCollectionGroup(e,t,c))).next(()=>o.size)}))}oe(e,t){let r=e;return t.changes.forEach((i,s)=>{let o=_g(s);Hh(o,r)>0&&(r=o)}),new Ye(r.readTime,r.documentKey,Math.max(t.batchId,e.largestBatchId))}};var Me=class{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this._e(r),this.ae=r=>t.writeSequenceNumber(r))}_e(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){let e=++this.previousValue;return this.ae&&this.ae(e),e}};Me.ue=-1;var Un=-1;function Wa(n){return n==null}function rs(n){return n===0&&1/n==-1/0}function aE(n){return typeof n=="number"&&Number.isInteger(n)&&!rs(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}var ea="";function Pe(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=am(e)),e=cE(n.get(t),e);return am(e)}function cE(n,e){let t=e,r=n.length;for(let i=0;i<r;i++){let s=n.charAt(i);switch(s){case"\0":t+="";break;case ea:t+="";break;default:t+=s}}return t}function am(n){return n+ea+""}function ut(n){let e=n.length;if(j(e>=2,64408,{path:n}),e===2)return j(n.charAt(0)===ea&&n.charAt(1)==="",56145,{path:n}),ee.emptyPath();let t=e-2,r=[],i="";for(let s=0;s<e;){let o=n.indexOf(ea,s);switch((o<0||o>t)&&F(50515,{path:n}),n.charAt(o+1)){case"":let c=n.substring(s,o),u;i.length===0?u=c:(i+=c,u=i,i=""),r.push(u);break;case"":i+=n.substring(s,o),i+="\0";break;case"":i+=n.substring(s,o+1);break;default:F(61167,{path:n})}s=o+2}return new ee(r)}var Cn="remoteDocuments",ws="owner",pr="owner",is="mutationQueues",uE="userId",et="mutations",cm="batchId",Vn="userMutationsIndex",um=["userId","batchId"];function qo(n,e){return[n,Pe(e)]}function Ig(n,e,t){return[n,Pe(e),t]}var lE={},Or="documentMutations",ta="remoteDocumentsV14",hE=["prefixPath","collectionGroup","readTime","documentId"],jo="documentKeyIndex",dE=["prefixPath","collectionGroup","documentId"],wg="collectionGroupIndex",fE=["collectionGroup","readTime","prefixPath","documentId"],ss="remoteDocumentGlobal",ul="remoteDocumentGlobalKey",Vr="targets",Eg="queryTargetsIndex",pE=["canonicalId","targetId"],xr="targetDocuments",mE=["targetId","path"],Yh="documentTargetsIndex",gE=["path","targetId"],na="targetGlobalKey",Bn="targetGlobal",os="collectionParents",_E=["collectionId","parent"],Lr="clientMetadata",yE="clientId",Ka="bundles",vE="bundleId",Ha="namedQueries",IE="name",Jh="indexConfiguration",wE="indexId",ll="collectionGroupIndex",EE="collectionGroup",Hi="indexState",TE=["indexId","uid"],Tg="sequenceNumberIndex",bE=["uid","sequenceNumber"],Qi="indexEntries",AE=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],bg="documentKeyIndex",SE=["indexId","uid","orderedDocumentKey"],Qa="documentOverlays",RE=["userId","collectionPath","documentId"],hl="collectionPathOverlayIndex",PE=["userId","collectionPath","largestBatchId"],Ag="collectionGroupOverlayIndex",CE=["userId","collectionGroup","largestBatchId"],Xh="globals",kE="name",Sg=[is,et,Or,Cn,Vr,ws,Bn,xr,Lr,ss,os,Ka,Ha],DE=[...Sg,Qa],Rg=[is,et,Or,ta,Vr,ws,Bn,xr,Lr,ss,os,Ka,Ha,Qa],Pg=Rg,Zh=[...Pg,Jh,Hi,Qi],NE=Zh,Cg=[...Zh,Xh],OE=Cg;var as=class extends Xo{constructor(e,t){super(),this.ce=e,this.currentSequenceNumber=t}};function _e(n,e){let t=K(n);return Nr.N(t.ce,e)}function lm(n){let e=0;for(let t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function Xn(n,e){for(let t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function kg(n){for(let e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}var ae=class n{constructor(e,t){this.comparator=e,this.root=t||dt.EMPTY}insert(e,t){return new n(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,dt.BLACK,null,null))}remove(e){return new n(this.comparator,this.root.remove(e,this.comparator).copy(null,null,dt.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){let r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){let i=this.comparator(e,r.key);if(i===0)return t+r.left.size;i<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){let e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Ar(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Ar(this.root,e,this.comparator,!1)}getReverseIterator(){return new Ar(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Ar(this.root,e,this.comparator,!0)}},Ar=class{constructor(e,t,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?r(e.key,t):1,t&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop(),t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;let e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},dt=class n{constructor(e,t,r,i,s){this.key=e,this.value=t,this.color=r!=null?r:n.RED,this.left=i!=null?i:n.EMPTY,this.right=s!=null?s:n.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,i,s){return new n(e!=null?e:this.key,t!=null?t:this.value,r!=null?r:this.color,i!=null?i:this.left,s!=null?s:this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let i=this,s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,t,r),null):s===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return n.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return n.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){let e=this.copy(null,null,n.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){let e=this.copy(null,null,n.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){let e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){let e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw F(43730,{key:this.key,value:this.value});if(this.right.isRed())throw F(14113,{key:this.key,value:this.value});let e=this.left.check();if(e!==this.right.check())throw F(27949);return e+(this.isRed()?0:1)}};dt.EMPTY=null,dt.RED=!0,dt.BLACK=!1;dt.EMPTY=new class{constructor(){this.size=0}get key(){throw F(57766)}get value(){throw F(16141)}get color(){throw F(16727)}get left(){throw F(29726)}get right(){throw F(36894)}copy(e,t,r,i,s){return this}insert(e,t,r){return new dt(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};var ne=class n{constructor(e){this.comparator=e,this.data=new ae(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){let r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){let i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){let t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new ra(this.data.getIterator())}getIteratorFrom(e){return new ra(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof n)||this.size!==e.size)return!1;let t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){let i=t.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){let e=[];return this.forEach(t=>{e.push(t)}),e}toString(){let e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){let t=new n(this.comparator);return t.data=e,t}},ra=class{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}};function mr(n){return n.hasNext()?n.getNext():void 0}var tt=class n{constructor(e){this.fields=e,e.sort(me.comparator)}static empty(){return new n([])}unionWith(e){let t=new ne(me.comparator);for(let r of this.fields)t=t.add(r);for(let r of e)t=t.add(r);return new n(t.toArray())}covers(e){for(let t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return kr(this.fields,e.fields,(t,r)=>t.isEqual(r))}};var ia=class extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}};var ge=class n{constructor(e){this.binaryString=e}static fromBase64String(e){let t=function(i){try{return atob(i)}catch(s){throw typeof DOMException!="undefined"&&s instanceof DOMException?new ia("Invalid base64 string: "+s):s}}(e);return new n(t)}static fromUint8Array(e){let t=function(i){let s="";for(let o=0;o<i.length;++o)s+=String.fromCharCode(i[o]);return s}(e);return new n(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){let r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return W(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}};ge.EMPTY_BYTE_STRING=new ge("");var VE=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Rt(n){if(j(!!n,39018),typeof n=="string"){let e=0,t=VE.exec(n);if(j(!!t,46558,{timestamp:n}),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}let r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:se(n.seconds),nanos:se(n.nanos)}}function se(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Pt(n){return typeof n=="string"?ge.fromBase64String(n):ge.fromUint8Array(n)}var Dg="server_timestamp",Ng="__type__",Og="__previous_value__",Vg="__local_write_time__";function ed(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{})[Ng])===null||t===void 0?void 0:t.stringValue)===Dg}function Ya(n){let e=n.mapValue.fields[Og];return ed(e)?Ya(e):e}function cs(n){let e=Rt(n.mapValue.fields[Vg].timestampValue);return new oe(e.seconds,e.nanos)}var dl=class{constructor(e,t,r,i,s,o,c,u,h,f){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=o,this.autoDetectLongPolling=c,this.longPollingOptions=u,this.useFetchStreams=h,this.isUsingEmulator=f}},us="(default)",Mr=class n{constructor(e,t){this.projectId=e,this.database=t||us}static empty(){return new n("","")}get isDefaultDatabase(){return this.database===us}isEqual(e){return e instanceof n&&e.projectId===this.projectId&&e.database===this.database}};var td="__type__",xg="__max__",Qt={mapValue:{fields:{__type__:{stringValue:xg}}}},nd="__vector__",Fr="value",zo={nullValue:"NULL_VALUE"};function en(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?ed(n)?4:Lg(n)?9007199254740991:Ja(n)?10:11:F(28295,{value:n})}function ft(n,e){if(n===e)return!0;let t=en(n);if(t!==en(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return cs(n).isEqual(cs(e));case 3:return function(i,s){if(typeof i.timestampValue=="string"&&typeof s.timestampValue=="string"&&i.timestampValue.length===s.timestampValue.length)return i.timestampValue===s.timestampValue;let o=Rt(i.timestampValue),c=Rt(s.timestampValue);return o.seconds===c.seconds&&o.nanos===c.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(i,s){return Pt(i.bytesValue).isEqual(Pt(s.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(i,s){return se(i.geoPointValue.latitude)===se(s.geoPointValue.latitude)&&se(i.geoPointValue.longitude)===se(s.geoPointValue.longitude)}(n,e);case 2:return function(i,s){if("integerValue"in i&&"integerValue"in s)return se(i.integerValue)===se(s.integerValue);if("doubleValue"in i&&"doubleValue"in s){let o=se(i.doubleValue),c=se(s.doubleValue);return o===c?rs(o)===rs(c):isNaN(o)&&isNaN(c)}return!1}(n,e);case 9:return kr(n.arrayValue.values||[],e.arrayValue.values||[],ft);case 10:case 11:return function(i,s){let o=i.mapValue.fields||{},c=s.mapValue.fields||{};if(lm(o)!==lm(c))return!1;for(let u in o)if(o.hasOwnProperty(u)&&(c[u]===void 0||!ft(o[u],c[u])))return!1;return!0}(n,e);default:return F(52216,{left:n})}}function ls(n,e){return(n.values||[]).find(t=>ft(t,e))!==void 0}function tn(n,e){if(n===e)return 0;let t=en(n),r=en(e);if(t!==r)return W(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return W(n.booleanValue,e.booleanValue);case 2:return function(s,o){let c=se(s.integerValue||s.doubleValue),u=se(o.integerValue||o.doubleValue);return c<u?-1:c>u?1:c===u?0:isNaN(c)?isNaN(u)?0:-1:1}(n,e);case 3:return hm(n.timestampValue,e.timestampValue);case 4:return hm(cs(n),cs(e));case 5:return rl(n.stringValue,e.stringValue);case 6:return function(s,o){let c=Pt(s),u=Pt(o);return c.compareTo(u)}(n.bytesValue,e.bytesValue);case 7:return function(s,o){let c=s.split("/"),u=o.split("/");for(let h=0;h<c.length&&h<u.length;h++){let f=W(c[h],u[h]);if(f!==0)return f}return W(c.length,u.length)}(n.referenceValue,e.referenceValue);case 8:return function(s,o){let c=W(se(s.latitude),se(o.latitude));return c!==0?c:W(se(s.longitude),se(o.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return dm(n.arrayValue,e.arrayValue);case 10:return function(s,o){var c,u,h,f;let m=s.fields||{},_=o.fields||{},S=(c=m[Fr])===null||c===void 0?void 0:c.arrayValue,C=(u=_[Fr])===null||u===void 0?void 0:u.arrayValue,N=W(((h=S==null?void 0:S.values)===null||h===void 0?void 0:h.length)||0,((f=C==null?void 0:C.values)===null||f===void 0?void 0:f.length)||0);return N!==0?N:dm(S,C)}(n.mapValue,e.mapValue);case 11:return function(s,o){if(s===Qt.mapValue&&o===Qt.mapValue)return 0;if(s===Qt.mapValue)return 1;if(o===Qt.mapValue)return-1;let c=s.fields||{},u=Object.keys(c),h=o.fields||{},f=Object.keys(h);u.sort(),f.sort();for(let m=0;m<u.length&&m<f.length;++m){let _=rl(u[m],f[m]);if(_!==0)return _;let S=tn(c[u[m]],h[f[m]]);if(S!==0)return S}return W(u.length,f.length)}(n.mapValue,e.mapValue);default:throw F(23264,{le:t})}}function hm(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return W(n,e);let t=Rt(n),r=Rt(e),i=W(t.seconds,r.seconds);return i!==0?i:W(t.nanos,r.nanos)}function dm(n,e){let t=n.values||[],r=e.values||[];for(let i=0;i<t.length&&i<r.length;++i){let s=tn(t[i],r[i]);if(s)return s}return W(t.length,r.length)}function Ur(n){return fl(n)}function fl(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){let r=Rt(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return Pt(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return L.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",i=!0;for(let s of t.values||[])i?i=!1:r+=",",r+=fl(s);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){let r=Object.keys(t.fields||{}).sort(),i="{",s=!0;for(let o of r)s?s=!1:i+=",",i+=`${o}:${fl(t.fields[o])}`;return i+"}"}(n.mapValue):F(61005,{value:n})}function $o(n){switch(en(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:let e=Ya(n);return e?16+$o(e):16;case 5:return 2*n.stringValue.length;case 6:return Pt(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((i,s)=>i+$o(s),0)}(n.arrayValue);case 10:case 11:return function(r){let i=0;return Xn(r.fields,(s,o)=>{i+=s.length+$o(o)}),i}(n.mapValue);default:throw F(13486,{value:n})}}function rd(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function pl(n){return!!n&&"integerValue"in n}function hs(n){return!!n&&"arrayValue"in n}function fm(n){return!!n&&"nullValue"in n}function pm(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Go(n){return!!n&&"mapValue"in n}function Ja(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{})[td])===null||t===void 0?void 0:t.stringValue)===nd}function Yi(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){let e={mapValue:{fields:{}}};return Xn(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=Yi(r)),e}if(n.arrayValue){let e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Yi(n.arrayValue.values[t]);return e}return Object.assign({},n)}function Lg(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===xg}var Mg={mapValue:{fields:{[td]:{stringValue:nd},[Fr]:{arrayValue:{}}}}};function xE(n){return"nullValue"in n?zo:"booleanValue"in n?{booleanValue:!1}:"integerValue"in n||"doubleValue"in n?{doubleValue:NaN}:"timestampValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in n?{stringValue:""}:"bytesValue"in n?{bytesValue:""}:"referenceValue"in n?rd(Mr.empty(),L.empty()):"geoPointValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in n?{arrayValue:{}}:"mapValue"in n?Ja(n)?Mg:{mapValue:{}}:F(35942,{value:n})}function LE(n){return"nullValue"in n?{booleanValue:!1}:"booleanValue"in n?{doubleValue:NaN}:"integerValue"in n||"doubleValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in n?{stringValue:""}:"stringValue"in n?{bytesValue:""}:"bytesValue"in n?rd(Mr.empty(),L.empty()):"referenceValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in n?{arrayValue:{}}:"arrayValue"in n?Mg:"mapValue"in n?Ja(n)?{mapValue:{}}:Qt:F(61959,{value:n})}function mm(n,e){let t=tn(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?-1:!n.inclusive&&e.inclusive?1:0}function gm(n,e){let t=tn(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?1:!n.inclusive&&e.inclusive?-1:0}var je=class n{constructor(e){this.value=e}static empty(){return new n({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Go(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Yi(t)}setAll(e){let t=me.emptyPath(),r={},i=[];e.forEach((o,c)=>{if(!t.isImmediateParentOf(c)){let u=this.getFieldsMap(t);this.applyChanges(u,r,i),r={},i=[],t=c.popLast()}o?r[c.lastSegment()]=Yi(o):i.push(c.lastSegment())});let s=this.getFieldsMap(t);this.applyChanges(s,r,i)}delete(e){let t=this.field(e.popLast());Go(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return ft(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=t.mapValue.fields[e.get(r)];Go(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,r){Xn(t,(i,s)=>e[i]=s);for(let i of r)delete e[i]}clone(){return new n(Yi(this.value))}};function Fg(n){let e=[];return Xn(n.fields,(t,r)=>{let i=new me([t]);if(Go(r)){let s=Fg(r.mapValue).fields;if(s.length===0)e.push(i);else for(let o of s)e.push(i.child(o))}else e.push(i)}),new tt(e)}var Ie=class n{constructor(e,t,r,i,s,o,c){this.key=e,this.documentType=t,this.version=r,this.readTime=i,this.createTime=s,this.data=o,this.documentState=c}static newInvalidDocument(e){return new n(e,0,G.min(),G.min(),G.min(),je.empty(),0)}static newFoundDocument(e,t,r,i){return new n(e,1,t,G.min(),r,i,0)}static newNoDocument(e,t){return new n(e,2,t,G.min(),G.min(),je.empty(),0)}static newUnknownDocument(e,t){return new n(e,3,t,G.min(),G.min(),je.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(G.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=je.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=je.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=G.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof n&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new n(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}};var nn=class{constructor(e,t){this.position=e,this.inclusive=t}};function _m(n,e,t){let r=0;for(let i=0;i<n.position.length;i++){let s=e[i],o=n.position[i];if(s.field.isKeyField()?r=L.comparator(L.fromName(o.referenceValue),t.key):r=tn(o,t.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function ym(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!ft(n.position[t],e.position[t]))return!1;return!0}var Br=class{constructor(e,t="asc"){this.field=e,this.dir=t}};function ME(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}var sa=class{},J=class n extends sa{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new _l(e,t,r):t==="array-contains"?new Il(e,r):t==="in"?new oa(e,r):t==="not-in"?new wl(e,r):t==="array-contains-any"?new El(e,r):new n(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new yl(e,r):new vl(e,r)}matches(e){let t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(tn(t,this.value)):t!==null&&en(this.value)===en(t)&&this.matchesComparison(tn(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return F(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}},te=class n extends sa{constructor(e,t){super(),this.filters=e,this.op=t,this.he=null}static create(e,t){return new n(e,t)}matches(e){return qr(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.he!==null||(this.he=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.he}getFilters(){return Object.assign([],this.filters)}};function qr(n){return n.op==="and"}function ml(n){return n.op==="or"}function id(n){return Ug(n)&&qr(n)}function Ug(n){for(let e of n.filters)if(e instanceof te)return!1;return!0}function gl(n){if(n instanceof J)return n.field.canonicalString()+n.op.toString()+Ur(n.value);if(id(n))return n.filters.map(e=>gl(e)).join(",");{let e=n.filters.map(t=>gl(t)).join(",");return`${n.op}(${e})`}}function Bg(n,e){return n instanceof J?function(r,i){return i instanceof J&&r.op===i.op&&r.field.isEqual(i.field)&&ft(r.value,i.value)}(n,e):n instanceof te?function(r,i){return i instanceof te&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((s,o,c)=>s&&Bg(o,i.filters[c]),!0):!1}(n,e):void F(19439)}function qg(n,e){let t=n.filters.concat(e);return te.create(t,n.op)}function jg(n){return n instanceof J?function(t){return`${t.field.canonicalString()} ${t.op} ${Ur(t.value)}`}(n):n instanceof te?function(t){return t.op.toString()+" {"+t.getFilters().map(jg).join(" ,")+"}"}(n):"Filter"}var _l=class extends J{constructor(e,t,r){super(e,t,r),this.key=L.fromName(r.referenceValue)}matches(e){let t=L.comparator(e.key,this.key);return this.matchesComparison(t)}},yl=class extends J{constructor(e,t){super(e,"in",t),this.keys=zg("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}},vl=class extends J{constructor(e,t){super(e,"not-in",t),this.keys=zg("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}};function zg(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>L.fromName(r.referenceValue))}var Il=class extends J{constructor(e,t){super(e,"array-contains",t)}matches(e){let t=e.data.field(this.field);return hs(t)&&ls(t.arrayValue,this.value)}},oa=class extends J{constructor(e,t){super(e,"in",t)}matches(e){let t=e.data.field(this.field);return t!==null&&ls(this.value.arrayValue,t)}},wl=class extends J{constructor(e,t){super(e,"not-in",t)}matches(e){if(ls(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;let t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!ls(this.value.arrayValue,t)}},El=class extends J{constructor(e,t){super(e,"array-contains-any",t)}matches(e){let t=e.data.field(this.field);return!(!hs(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>ls(this.value.arrayValue,r))}};var Tl=class{constructor(e,t=null,r=[],i=[],s=null,o=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=o,this.endAt=c,this.Pe=null}};function bl(n,e=null,t=[],r=[],i=null,s=null,o=null){return new Tl(n,e,t,r,i,s,o)}function $n(n){let e=K(n);if(e.Pe===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>gl(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(s){return s.field.canonicalString()+s.dir}(r)).join(","),Wa(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>Ur(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>Ur(r)).join(",")),e.Pe=t}return e.Pe}function Es(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!ME(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Bg(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!ym(n.startAt,e.startAt)&&ym(n.endAt,e.endAt)}function aa(n){return L.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function ca(n,e){return n.filters.filter(t=>t instanceof J&&t.field.isEqual(e))}function vm(n,e,t){let r=zo,i=!0;for(let s of ca(n,e)){let o=zo,c=!0;switch(s.op){case"<":case"<=":o=xE(s.value);break;case"==":case"in":case">=":o=s.value;break;case">":o=s.value,c=!1;break;case"!=":case"not-in":o=zo}mm({value:r,inclusive:i},{value:o,inclusive:c})<0&&(r=o,i=c)}if(t!==null){for(let s=0;s<n.orderBy.length;++s)if(n.orderBy[s].field.isEqual(e)){let o=t.position[s];mm({value:r,inclusive:i},{value:o,inclusive:t.inclusive})<0&&(r=o,i=t.inclusive);break}}return{value:r,inclusive:i}}function Im(n,e,t){let r=Qt,i=!0;for(let s of ca(n,e)){let o=Qt,c=!0;switch(s.op){case">=":case">":o=LE(s.value),c=!1;break;case"==":case"in":case"<=":o=s.value;break;case"<":o=s.value,c=!1;break;case"!=":case"not-in":o=Qt}gm({value:r,inclusive:i},{value:o,inclusive:c})>0&&(r=o,i=c)}if(t!==null){for(let s=0;s<n.orderBy.length;++s)if(n.orderBy[s].field.isEqual(e)){let o=t.position[s];gm({value:r,inclusive:i},{value:o,inclusive:t.inclusive})>0&&(r=o,i=t.inclusive);break}}return{value:r,inclusive:i}}var jr=class{constructor(e,t=null,r=[],i=[],s=null,o="F",c=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=o,this.startAt=c,this.endAt=u,this.Te=null,this.Ie=null,this.de=null,this.startAt,this.endAt}};function FE(n,e,t,r,i,s,o,c){return new jr(n,e,t,r,i,s,o,c)}function Xa(n){return new jr(n)}function wm(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function UE(n){return n.collectionGroup!==null}function Ji(n){let e=K(n);if(e.Te===null){e.Te=[];let t=new Set;for(let s of e.explicitOrderBy)e.Te.push(s),t.add(s.field.canonicalString());let r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let c=new ne(me.comparator);return o.filters.forEach(u=>{u.getFlattenedFilters().forEach(h=>{h.isInequality()&&(c=c.add(h.field))})}),c})(e).forEach(s=>{t.has(s.canonicalString())||s.isKeyField()||e.Te.push(new Br(s,r))}),t.has(me.keyField().canonicalString())||e.Te.push(new Br(me.keyField(),r))}return e.Te}function Qe(n){let e=K(n);return e.Ie||(e.Ie=BE(e,Ji(n))),e.Ie}function BE(n,e){if(n.limitType==="F")return bl(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(i=>{let s=i.dir==="desc"?"asc":"desc";return new Br(i.field,s)});let t=n.endAt?new nn(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new nn(n.startAt.position,n.startAt.inclusive):null;return bl(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function Al(n,e,t){return new jr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Za(n,e){return Es(Qe(n),Qe(e))&&n.limitType===e.limitType}function $g(n){return`${$n(Qe(n))}|lt:${n.limitType}`}function wr(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(i=>jg(i)).join(", ")}]`),Wa(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(i=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(i)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(i=>Ur(i)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(i=>Ur(i)).join(",")),`Target(${r})`}(Qe(n))}; limitType=${n.limitType})`}function Ts(n,e){return e.isFoundDocument()&&function(r,i){let s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):L.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)}(n,e)&&function(r,i){for(let s of Ji(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0}(n,e)&&function(r,i){for(let s of r.filters)if(!s.matches(i))return!1;return!0}(n,e)&&function(r,i){return!(r.startAt&&!function(o,c,u){let h=_m(o,c,u);return o.inclusive?h<=0:h<0}(r.startAt,Ji(r),i)||r.endAt&&!function(o,c,u){let h=_m(o,c,u);return o.inclusive?h>=0:h>0}(r.endAt,Ji(r),i))}(n,e)}function qE(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function Gg(n){return(e,t)=>{let r=!1;for(let i of Ji(n)){let s=jE(i,e,t);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function jE(n,e,t){let r=n.field.isKeyField()?L.comparator(e.key,t.key):function(s,o,c){let u=o.data.field(s),h=c.data.field(s);return u!==null&&h!==null?tn(u,h):F(42886)}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return F(19790,{direction:n.dir})}}var nt=class{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){let t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(let[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,t){let r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){let t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[t]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){Xn(this.inner,(t,r)=>{for(let[i,s]of r)e(i,s)})}isEmpty(){return kg(this.inner)}size(){return this.innerSize}};var zE=new ae(L.comparator);function ze(){return zE}var Wg=new ae(L.comparator);function Gi(...n){let e=Wg;for(let t of n)e=e.insert(t.key,t);return e}function Kg(n){let e=Wg;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function lt(){return Xi()}function Hg(){return Xi()}function Xi(){return new nt(n=>n.toString(),(n,e)=>n.isEqual(e))}var $E=new ae(L.comparator),GE=new ne(L.comparator);function Q(...n){let e=GE;for(let t of n)e=e.add(t);return e}var WE=new ne(W);function KE(){return WE}function sd(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:rs(e)?"-0":e}}function Qg(n){return{integerValue:""+n}}function HE(n,e){return aE(e)?Qg(e):sd(n,e)}var zr=class{constructor(){this._=void 0}};function QE(n,e,t){return n instanceof rn?function(i,s){let o={fields:{[Ng]:{stringValue:Dg},[Vg]:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&ed(s)&&(s=Ya(s)),s&&(o.fields[Og]=s),{mapValue:o}}(t,e):n instanceof sn?Jg(n,e):n instanceof on?Xg(n,e):function(i,s){let o=Yg(i,s),c=Em(o)+Em(i.Ee);return pl(o)&&pl(i.Ee)?Qg(c):sd(i.serializer,c)}(n,e)}function YE(n,e,t){return n instanceof sn?Jg(n,e):n instanceof on?Xg(n,e):t}function Yg(n,e){return n instanceof Gn?function(r){return pl(r)||function(s){return!!s&&"doubleValue"in s}(r)}(e)?e:{integerValue:0}:null}var rn=class extends zr{},sn=class extends zr{constructor(e){super(),this.elements=e}};function Jg(n,e){let t=Zg(e);for(let r of n.elements)t.some(i=>ft(i,r))||t.push(r);return{arrayValue:{values:t}}}var on=class extends zr{constructor(e){super(),this.elements=e}};function Xg(n,e){let t=Zg(e);for(let r of n.elements)t=t.filter(i=>!ft(i,r));return{arrayValue:{values:t}}}var Gn=class extends zr{constructor(e,t){super(),this.serializer=e,this.Ee=t}};function Em(n){return se(n.integerValue||n.doubleValue)}function Zg(n){return hs(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}var ua=class{constructor(e,t){this.field=e,this.transform=t}};function JE(n,e){return n.field.isEqual(e.field)&&function(r,i){return r instanceof sn&&i instanceof sn||r instanceof on&&i instanceof on?kr(r.elements,i.elements,ft):r instanceof Gn&&i instanceof Gn?ft(r.Ee,i.Ee):r instanceof rn&&i instanceof rn}(n.transform,e.transform)}var Sl=class{constructor(e,t){this.version=e,this.transformResults=t}},He=class n{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new n}static exists(e){return new n(void 0,e)}static updateTime(e){return new n(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}};function Wo(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}var $r=class{};function e_(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new Gr(n.key,He.none()):new an(n.key,n.data,He.none());{let t=n.data,r=je.empty(),i=new ne(me.comparator);for(let s of e.fields)if(!i.has(s)){let o=t.field(s);o===null&&s.length>1&&(s=s.popLast(),o=t.field(s)),o===null?r.delete(s):r.set(s,o),i=i.add(s)}return new pt(n.key,r,new tt(i.toArray()),He.none())}}function XE(n,e,t){n instanceof an?function(i,s,o){let c=i.value.clone(),u=bm(i.fieldTransforms,s,o.transformResults);c.setAll(u),s.convertToFoundDocument(o.version,c).setHasCommittedMutations()}(n,e,t):n instanceof pt?function(i,s,o){if(!Wo(i.precondition,s))return void s.convertToUnknownDocument(o.version);let c=bm(i.fieldTransforms,s,o.transformResults),u=s.data;u.setAll(t_(i)),u.setAll(c),s.convertToFoundDocument(o.version,u).setHasCommittedMutations()}(n,e,t):function(i,s,o){s.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,t)}function Zi(n,e,t,r){return n instanceof an?function(s,o,c,u){if(!Wo(s.precondition,o))return c;let h=s.value.clone(),f=Am(s.fieldTransforms,u,o);return h.setAll(f),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),null}(n,e,t,r):n instanceof pt?function(s,o,c,u){if(!Wo(s.precondition,o))return c;let h=Am(s.fieldTransforms,u,o),f=o.data;return f.setAll(t_(s)),f.setAll(h),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),c===null?null:c.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(m=>m.field))}(n,e,t,r):function(s,o,c){return Wo(s.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):c}(n,e,t)}function ZE(n,e){let t=null;for(let r of n.fieldTransforms){let i=e.data.field(r.field),s=Yg(r.transform,i||null);s!=null&&(t===null&&(t=je.empty()),t.set(r.field,s))}return t||null}function Tm(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&kr(r,i,(s,o)=>JE(s,o))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}var an=class extends $r{constructor(e,t,r,i=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}},pt=class extends $r{constructor(e,t,r,i,s=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}};function t_(n){let e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){let r=n.data.field(t);e.set(t,r)}}),e}function bm(n,e,t){let r=new Map;j(n.length===t.length,32656,{Ae:t.length,Re:n.length});for(let i=0;i<t.length;i++){let s=n[i],o=s.transform,c=e.data.field(s.field);r.set(s.field,YE(o,c,t[i]))}return r}function Am(n,e,t){let r=new Map;for(let i of n){let s=i.transform,o=t.data.field(i.field);r.set(i.field,QE(s,o,e))}return r}var Gr=class extends $r{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}},la=class extends $r{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}};var ds=class{constructor(e,t,r,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,t){let r=t.mutationResults;for(let i=0;i<this.mutations.length;i++){let s=this.mutations[i];s.key.isEqual(e.key)&&XE(s,e,r[i])}}applyToLocalView(e,t){for(let r of this.baseMutations)r.key.isEqual(e.key)&&(t=Zi(r,e,t,this.localWriteTime));for(let r of this.mutations)r.key.isEqual(e.key)&&(t=Zi(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){let r=Hg();return this.mutations.forEach(i=>{let s=e.get(i.key),o=s.overlayedDocument,c=this.applyToLocalView(o,s.mutatedFields);c=t.has(i.key)?null:c;let u=e_(o,c);u!==null&&r.set(i.key,u),o.isValidDocument()||o.convertToNoDocument(G.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),Q())}isEqual(e){return this.batchId===e.batchId&&kr(this.mutations,e.mutations,(t,r)=>Tm(t,r))&&kr(this.baseMutations,e.baseMutations,(t,r)=>Tm(t,r))}},Rl=class n{constructor(e,t,r,i){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=i}static from(e,t,r){j(e.mutations.length===r.length,58842,{Ve:e.mutations.length,me:r.length});let i=function(){return $E}(),s=e.mutations;for(let o=0;o<s.length;o++)i=i.insert(s[o].key,r[o].version);return new n(e,t,r,i)}};var fs=class{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}};var Pl=class{constructor(e,t){this.count=e,this.unchangedNames=t}};var le,X;function eT(n){switch(n){case P.OK:return F(64938);case P.CANCELLED:case P.UNKNOWN:case P.DEADLINE_EXCEEDED:case P.RESOURCE_EXHAUSTED:case P.INTERNAL:case P.UNAVAILABLE:case P.UNAUTHENTICATED:return!1;case P.INVALID_ARGUMENT:case P.NOT_FOUND:case P.ALREADY_EXISTS:case P.PERMISSION_DENIED:case P.FAILED_PRECONDITION:case P.ABORTED:case P.OUT_OF_RANGE:case P.UNIMPLEMENTED:case P.DATA_LOSS:return!0;default:return F(15467,{code:n})}}function n_(n){if(n===void 0)return Oe("GRPC error has no .code"),P.UNKNOWN;switch(n){case le.OK:return P.OK;case le.CANCELLED:return P.CANCELLED;case le.UNKNOWN:return P.UNKNOWN;case le.DEADLINE_EXCEEDED:return P.DEADLINE_EXCEEDED;case le.RESOURCE_EXHAUSTED:return P.RESOURCE_EXHAUSTED;case le.INTERNAL:return P.INTERNAL;case le.UNAVAILABLE:return P.UNAVAILABLE;case le.UNAUTHENTICATED:return P.UNAUTHENTICATED;case le.INVALID_ARGUMENT:return P.INVALID_ARGUMENT;case le.NOT_FOUND:return P.NOT_FOUND;case le.ALREADY_EXISTS:return P.ALREADY_EXISTS;case le.PERMISSION_DENIED:return P.PERMISSION_DENIED;case le.FAILED_PRECONDITION:return P.FAILED_PRECONDITION;case le.ABORTED:return P.ABORTED;case le.OUT_OF_RANGE:return P.OUT_OF_RANGE;case le.UNIMPLEMENTED:return P.UNIMPLEMENTED;case le.DATA_LOSS:return P.DATA_LOSS;default:return F(39323,{code:n})}}(X=le||(le={}))[X.OK=0]="OK",X[X.CANCELLED=1]="CANCELLED",X[X.UNKNOWN=2]="UNKNOWN",X[X.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",X[X.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",X[X.NOT_FOUND=5]="NOT_FOUND",X[X.ALREADY_EXISTS=6]="ALREADY_EXISTS",X[X.PERMISSION_DENIED=7]="PERMISSION_DENIED",X[X.UNAUTHENTICATED=16]="UNAUTHENTICATED",X[X.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",X[X.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",X[X.ABORTED=10]="ABORTED",X[X.OUT_OF_RANGE=11]="OUT_OF_RANGE",X[X.UNIMPLEMENTED=12]="UNIMPLEMENTED",X[X.INTERNAL=13]="INTERNAL",X[X.UNAVAILABLE=14]="UNAVAILABLE",X[X.DATA_LOSS=15]="DATA_LOSS";var Sm=null;var tT=new Tt([4294967295,4294967295],0);function Rm(n){let e=fg().encode(n),t=new Uu;return t.update(e),new Uint8Array(t.digest())}function Pm(n){let e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new Tt([t,r],0),new Tt([i,s],0)]}var Cl=class n{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new xn(`Invalid padding: ${t}`);if(r<0)throw new xn(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new xn(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new xn(`Invalid padding when bitmap length is 0: ${t}`);this.fe=8*e.length-t,this.ge=Tt.fromNumber(this.fe)}pe(e,t,r){let i=e.add(t.multiply(Tt.fromNumber(r)));return i.compare(tT)===1&&(i=new Tt([i.getBits(0),i.getBits(1)],0)),i.modulo(this.ge).toNumber()}ye(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.fe===0)return!1;let t=Rm(e),[r,i]=Pm(t);for(let s=0;s<this.hashCount;s++){let o=this.pe(r,i,s);if(!this.ye(o))return!1}return!0}static create(e,t,r){let i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),o=new n(s,i,t);return r.forEach(c=>o.insert(c)),o}insert(e){if(this.fe===0)return;let t=Rm(e),[r,i]=Pm(t);for(let s=0;s<this.hashCount;s++){let o=this.pe(r,i,s);this.we(o)}}we(e){let t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}},xn=class extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}};var ha=class n{constructor(e,t,r,i,s){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,t,r){let i=new Map;return i.set(e,ps.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new n(G.min(),i,new ae(W),ze(),Q())}},ps=class n{constructor(e,t,r,i,s){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new n(r,t,Q(),Q(),Q())}};var Rr=class{constructor(e,t,r,i){this.Se=e,this.removedTargetIds=t,this.key=r,this.be=i}},da=class{constructor(e,t){this.targetId=e,this.De=t}},fa=class{constructor(e,t,r=ge.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=i}},pa=class{constructor(){this.ve=0,this.Ce=Cm(),this.Fe=ge.EMPTY_BYTE_STRING,this.Me=!1,this.xe=!0}get current(){return this.Me}get resumeToken(){return this.Fe}get Oe(){return this.ve!==0}get Ne(){return this.xe}Be(e){e.approximateByteSize()>0&&(this.xe=!0,this.Fe=e)}Le(){let e=Q(),t=Q(),r=Q();return this.Ce.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:t=t.add(i);break;case 1:r=r.add(i);break;default:F(38017,{changeType:s})}}),new ps(this.Fe,this.Me,e,t,r)}ke(){this.xe=!1,this.Ce=Cm()}qe(e,t){this.xe=!0,this.Ce=this.Ce.insert(e,t)}Qe(e){this.xe=!0,this.Ce=this.Ce.remove(e)}$e(){this.ve+=1}Ue(){this.ve-=1,j(this.ve>=0,3241,{ve:this.ve})}Ke(){this.xe=!0,this.Me=!0}},kl=class{constructor(e){this.We=e,this.Ge=new Map,this.ze=ze(),this.je=Lo(),this.Je=Lo(),this.He=new ae(W)}Ye(e){for(let t of e.Se)e.be&&e.be.isFoundDocument()?this.Ze(t,e.be):this.Xe(t,e.key,e.be);for(let t of e.removedTargetIds)this.Xe(t,e.key,e.be)}et(e){this.forEachTarget(e,t=>{let r=this.tt(t);switch(e.state){case 0:this.nt(t)&&r.Be(e.resumeToken);break;case 1:r.Ue(),r.Oe||r.ke(),r.Be(e.resumeToken);break;case 2:r.Ue(),r.Oe||this.removeTarget(t);break;case 3:this.nt(t)&&(r.Ke(),r.Be(e.resumeToken));break;case 4:this.nt(t)&&(this.rt(t),r.Be(e.resumeToken));break;default:F(56790,{state:e.state})}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Ge.forEach((r,i)=>{this.nt(i)&&t(i)})}it(e){let t=e.targetId,r=e.De.count,i=this.st(t);if(i){let s=i.target;if(aa(s))if(r===0){let o=new L(s.path);this.Xe(t,o,Ie.newNoDocument(o,G.min()))}else j(r===1,20013,{expectedCount:r});else{let o=this.ot(t);if(o!==r){let c=this._t(e),u=c?this.ut(c,e,o):1;if(u!==0){this.rt(t);let h=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.He=this.He.insert(t,h)}Sm==null||Sm.ct(function(f,m,_,S,C){var N,k,$,B,M,H;let q={localCacheCount:f,existenceFilterCount:m.count,databaseId:_.database,projectId:_.projectId},U=m.unchangedNames;return U&&(q.bloomFilter={applied:C===0,hashCount:(N=U==null?void 0:U.hashCount)!==null&&N!==void 0?N:0,bitmapLength:(B=($=(k=U==null?void 0:U.bits)===null||k===void 0?void 0:k.bitmap)===null||$===void 0?void 0:$.length)!==null&&B!==void 0?B:0,padding:(H=(M=U==null?void 0:U.bits)===null||M===void 0?void 0:M.padding)!==null&&H!==void 0?H:0,mightContain:I=>{var g;return(g=S==null?void 0:S.mightContain(I))!==null&&g!==void 0&&g}}),q}(o,e.De,this.We.lt(),c,u))}}}}_t(e){let t=e.De.unchangedNames;if(!t||!t.bits)return null;let{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=t,o,c;try{o=Pt(r).toUint8Array()}catch(u){if(u instanceof ia)return St("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{c=new Cl(o,i,s)}catch(u){return St(u instanceof xn?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return c.fe===0?null:c}ut(e,t,r){return t.De.count===r-this.ht(e,t.targetId)?0:2}ht(e,t){let r=this.We.getRemoteKeysForTarget(t),i=0;return r.forEach(s=>{let o=this.We.lt(),c=`projects/${o.projectId}/databases/${o.database}/documents/${s.path.canonicalString()}`;e.mightContain(c)||(this.Xe(t,s,null),i++)}),i}Pt(e){let t=new Map;this.Ge.forEach((s,o)=>{let c=this.st(o);if(c){if(s.current&&aa(c.target)){let u=new L(c.target.path);this.Tt(u).has(o)||this.It(o,u)||this.Xe(o,u,Ie.newNoDocument(u,e))}s.Ne&&(t.set(o,s.Le()),s.ke())}});let r=Q();this.Je.forEach((s,o)=>{let c=!0;o.forEachWhile(u=>{let h=this.st(u);return!h||h.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(r=r.add(s))}),this.ze.forEach((s,o)=>o.setReadTime(e));let i=new ha(e,t,this.He,this.ze,r);return this.ze=ze(),this.je=Lo(),this.Je=Lo(),this.He=new ae(W),i}Ze(e,t){if(!this.nt(e))return;let r=this.It(e,t.key)?2:0;this.tt(e).qe(t.key,r),this.ze=this.ze.insert(t.key,t),this.je=this.je.insert(t.key,this.Tt(t.key).add(e)),this.Je=this.Je.insert(t.key,this.dt(t.key).add(e))}Xe(e,t,r){if(!this.nt(e))return;let i=this.tt(e);this.It(e,t)?i.qe(t,1):i.Qe(t),this.Je=this.Je.insert(t,this.dt(t).delete(e)),this.Je=this.Je.insert(t,this.dt(t).add(e)),r&&(this.ze=this.ze.insert(t,r))}removeTarget(e){this.Ge.delete(e)}ot(e){let t=this.tt(e).Le();return this.We.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}$e(e){this.tt(e).$e()}tt(e){let t=this.Ge.get(e);return t||(t=new pa,this.Ge.set(e,t)),t}dt(e){let t=this.Je.get(e);return t||(t=new ne(W),this.Je=this.Je.insert(e,t)),t}Tt(e){let t=this.je.get(e);return t||(t=new ne(W),this.je=this.je.insert(e,t)),t}nt(e){let t=this.st(e)!==null;return t||D("WatchChangeAggregator","Detected inactive target",e),t}st(e){let t=this.Ge.get(e);return t&&t.Oe?null:this.We.Et(e)}rt(e){this.Ge.set(e,new pa),this.We.getRemoteKeysForTarget(e).forEach(t=>{this.Xe(e,t,null)})}It(e,t){return this.We.getRemoteKeysForTarget(e).has(t)}};function Lo(){return new ae(L.comparator)}function Cm(){return new ae(L.comparator)}var nT={asc:"ASCENDING",desc:"DESCENDING"},rT={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},iT={and:"AND",or:"OR"},Dl=class{constructor(e,t){this.databaseId=e,this.useProto3Json=t}};function Nl(n,e){return n.useProto3Json||Wa(e)?e:{value:e}}function Wr(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function r_(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function sT(n,e){return Wr(n,e.toTimestamp())}function Ve(n){return j(!!n,49232),G.fromTimestamp(function(t){let r=Rt(t);return new oe(r.seconds,r.nanos)}(n))}function od(n,e){return Ol(n,e).canonicalString()}function Ol(n,e){let t=function(i){return new ee(["projects",i.projectId,"databases",i.database])}(n).child("documents");return e===void 0?t:t.child(e)}function i_(n){let e=ee.fromString(n);return j(f_(e),10190,{key:e.toString()}),e}function ma(n,e){return od(n.databaseId,e.path)}function qn(n,e){let t=i_(e);if(t.get(1)!==n.databaseId.projectId)throw new x(P.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new x(P.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new L(a_(t))}function s_(n,e){return od(n.databaseId,e)}function o_(n){let e=i_(n);return e.length===4?ee.emptyPath():a_(e)}function Vl(n){return new ee(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function a_(n){return j(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function km(n,e,t){return{name:ma(n,e),fields:t.value.mapValue.fields}}function oT(n,e,t){let r=qn(n,e.name),i=Ve(e.updateTime),s=e.createTime?Ve(e.createTime):G.min(),o=new je({mapValue:{fields:e.fields}}),c=Ie.newFoundDocument(r,i,s,o);return t&&c.setHasCommittedMutations(),t?c.setHasCommittedMutations():c}function aT(n,e){let t;if("targetChange"in e){e.targetChange;let r=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:F(39313,{state:h})}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(h,f){return h.useProto3Json?(j(f===void 0||typeof f=="string",58123),ge.fromBase64String(f||"")):(j(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),ge.fromUint8Array(f||new Uint8Array))}(n,e.targetChange.resumeToken),o=e.targetChange.cause,c=o&&function(h){let f=h.code===void 0?P.UNKNOWN:n_(h.code);return new x(f,h.message||"")}(o);t=new fa(r,i,s,c||null)}else if("documentChange"in e){e.documentChange;let r=e.documentChange;r.document,r.document.name,r.document.updateTime;let i=qn(n,r.document.name),s=Ve(r.document.updateTime),o=r.document.createTime?Ve(r.document.createTime):G.min(),c=new je({mapValue:{fields:r.document.fields}}),u=Ie.newFoundDocument(i,s,o,c),h=r.targetIds||[],f=r.removedTargetIds||[];t=new Rr(h,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;let r=e.documentDelete;r.document;let i=qn(n,r.document),s=r.readTime?Ve(r.readTime):G.min(),o=Ie.newNoDocument(i,s),c=r.removedTargetIds||[];t=new Rr([],c,o.key,o)}else if("documentRemove"in e){e.documentRemove;let r=e.documentRemove;r.document;let i=qn(n,r.document),s=r.removedTargetIds||[];t=new Rr([],s,i,null)}else{if(!("filter"in e))return F(11601,{At:e});{e.filter;let r=e.filter;r.targetId;let{count:i=0,unchangedNames:s}=r,o=new Pl(i,s),c=r.targetId;t=new da(c,o)}}return t}function ga(n,e){let t;if(e instanceof an)t={update:km(n,e.key,e.value)};else if(e instanceof Gr)t={delete:ma(n,e.key)};else if(e instanceof pt)t={update:km(n,e.key,e.data),updateMask:fT(e.fieldMask)};else{if(!(e instanceof la))return F(16599,{Rt:e.type});t={verify:ma(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(s,o){let c=o.transform;if(c instanceof rn)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof sn)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof on)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof Gn)return{fieldPath:o.field.canonicalString(),increment:c.Ee};throw F(20930,{transform:o.transform})}(0,r))),e.precondition.isNone||(t.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:sT(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:F(27497)}(n,e.precondition)),t}function xl(n,e){let t=e.currentDocument?function(s){return s.updateTime!==void 0?He.updateTime(Ve(s.updateTime)):s.exists!==void 0?He.exists(s.exists):He.none()}(e.currentDocument):He.none(),r=e.updateTransforms?e.updateTransforms.map(i=>function(o,c){let u=null;if("setToServerValue"in c)j(c.setToServerValue==="REQUEST_TIME",16630,{proto:c}),u=new rn;else if("appendMissingElements"in c){let f=c.appendMissingElements.values||[];u=new sn(f)}else if("removeAllFromArray"in c){let f=c.removeAllFromArray.values||[];u=new on(f)}else"increment"in c?u=new Gn(o,c.increment):F(16584,{proto:c});let h=me.fromServerFormat(c.fieldPath);return new ua(h,u)}(n,i)):[];if(e.update){e.update.name;let i=qn(n,e.update.name),s=new je({mapValue:{fields:e.update.fields}});if(e.updateMask){let o=function(u){let h=u.fieldPaths||[];return new tt(h.map(f=>me.fromServerFormat(f)))}(e.updateMask);return new pt(i,s,o,t,r)}return new an(i,s,t,r)}if(e.delete){let i=qn(n,e.delete);return new Gr(i,t)}if(e.verify){let i=qn(n,e.verify);return new la(i,t)}return F(1463,{proto:e})}function cT(n,e){return n&&n.length>0?(j(e!==void 0,14353),n.map(t=>function(i,s){let o=i.updateTime?Ve(i.updateTime):Ve(s);return o.isEqual(G.min())&&(o=Ve(s)),new Sl(o,i.transformResults||[])}(t,e))):[]}function c_(n,e){return{documents:[s_(n,e.path)]}}function u_(n,e){let t={structuredQuery:{}},r=e.path,i;e.collectionGroup!==null?(i=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=s_(n,i);let s=function(h){if(h.length!==0)return d_(te.create(h,"and"))}(e.filters);s&&(t.structuredQuery.where=s);let o=function(h){if(h.length!==0)return h.map(f=>function(_){return{field:Er(_.field),direction:lT(_.dir)}}(f))}(e.orderBy);o&&(t.structuredQuery.orderBy=o);let c=Nl(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{Vt:t,parent:i}}function l_(n){let e=o_(n.parent),t=n.structuredQuery,r=t.from?t.from.length:0,i=null;if(r>0){j(r===1,65062);let f=t.from[0];f.allDescendants?i=f.collectionId:e=e.child(f.collectionId)}let s=[];t.where&&(s=function(m){let _=h_(m);return _ instanceof te&&id(_)?_.getFilters():[_]}(t.where));let o=[];t.orderBy&&(o=function(m){return m.map(_=>function(C){return new Br(Tr(C.field),function(k){switch(k){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(C.direction))}(_))}(t.orderBy));let c=null;t.limit&&(c=function(m){let _;return _=typeof m=="object"?m.value:m,Wa(_)?null:_}(t.limit));let u=null;t.startAt&&(u=function(m){let _=!!m.before,S=m.values||[];return new nn(S,_)}(t.startAt));let h=null;return t.endAt&&(h=function(m){let _=!m.before,S=m.values||[];return new nn(S,_)}(t.endAt)),FE(e,i,o,s,c,"F",u,h)}function uT(n,e){let t=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return F(28987,{purpose:i})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function h_(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":let r=Tr(t.unaryFilter.field);return J.create(r,"==",{doubleValue:NaN});case"IS_NULL":let i=Tr(t.unaryFilter.field);return J.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":let s=Tr(t.unaryFilter.field);return J.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":let o=Tr(t.unaryFilter.field);return J.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return F(61313);default:return F(60726)}}(n):n.fieldFilter!==void 0?function(t){return J.create(Tr(t.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return F(58110);default:return F(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return te.create(t.compositeFilter.filters.map(r=>h_(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return F(1026)}}(t.compositeFilter.op))}(n):F(30097,{filter:n})}function lT(n){return nT[n]}function hT(n){return rT[n]}function dT(n){return iT[n]}function Er(n){return{fieldPath:n.canonicalString()}}function Tr(n){return me.fromServerFormat(n.fieldPath)}function d_(n){return n instanceof J?function(t){if(t.op==="=="){if(pm(t.value))return{unaryFilter:{field:Er(t.field),op:"IS_NAN"}};if(fm(t.value))return{unaryFilter:{field:Er(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(pm(t.value))return{unaryFilter:{field:Er(t.field),op:"IS_NOT_NAN"}};if(fm(t.value))return{unaryFilter:{field:Er(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Er(t.field),op:hT(t.op),value:t.value}}}(n):n instanceof te?function(t){let r=t.getFilters().map(i=>d_(i));return r.length===1?r[0]:{compositeFilter:{op:dT(t.op),filters:r}}}(n):F(54877,{filter:n})}function fT(n){let e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function f_(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}var Kr=class n{constructor(e,t,r,i,s=G.min(),o=G.min(),c=ge.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=c,this.expectedCount=u}withSequenceNumber(e){return new n(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new n(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new n(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new n(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}};var _a=class{constructor(e){this.gt=e}};function pT(n,e){let t;if(e.document)t=oT(n.gt,e.document,!!e.hasCommittedMutations);else if(e.noDocument){let r=L.fromSegments(e.noDocument.path),i=Kn(e.noDocument.readTime);t=Ie.newNoDocument(r,i),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return F(56709);{let r=L.fromSegments(e.unknownDocument.path),i=Kn(e.unknownDocument.version);t=Ie.newUnknownDocument(r,i)}}return e.readTime&&t.setReadTime(function(i){let s=new oe(i[0],i[1]);return G.fromTimestamp(s)}(e.readTime)),t}function Dm(n,e){let t=e.key,r={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:ya(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())r.document=function(s,o){return{name:ma(s,o.key),fields:o.data.value.mapValue.fields,updateTime:Wr(s,o.version.toTimestamp()),createTime:Wr(s,o.createTime.toTimestamp())}}(n.gt,e);else if(e.isNoDocument())r.noDocument={path:t.path.toArray(),readTime:Wn(e.version)};else{if(!e.isUnknownDocument())return F(57904,{document:e});r.unknownDocument={path:t.path.toArray(),version:Wn(e.version)}}return r}function ya(n){let e=n.toTimestamp();return[e.seconds,e.nanoseconds]}function Wn(n){let e=n.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function Kn(n){let e=new oe(n.seconds,n.nanoseconds);return G.fromTimestamp(e)}function Dn(n,e){let t=(e.baseMutations||[]).map(s=>xl(n.gt,s));for(let s=0;s<e.mutations.length-1;++s){let o=e.mutations[s];if(s+1<e.mutations.length&&e.mutations[s+1].transform!==void 0){let c=e.mutations[s+1];o.updateTransforms=c.transform.fieldTransforms,e.mutations.splice(s+1,1),++s}}let r=e.mutations.map(s=>xl(n.gt,s)),i=oe.fromMillis(e.localWriteTimeMs);return new ds(e.batchId,i,t,r)}function Wi(n){let e=Kn(n.readTime),t=n.lastLimboFreeSnapshotVersion!==void 0?Kn(n.lastLimboFreeSnapshotVersion):G.min(),r;return r=function(s){return s.documents!==void 0}(n.query)?function(s){let o=s.documents.length;return j(o===1,1966,{count:o}),Qe(Xa(o_(s.documents[0])))}(n.query):function(s){return Qe(l_(s))}(n.query),new Kr(r,n.targetId,"TargetPurposeListen",n.lastListenSequenceNumber,e,t,ge.fromBase64String(n.resumeToken))}function p_(n,e){let t=Wn(e.snapshotVersion),r=Wn(e.lastLimboFreeSnapshotVersion),i;i=aa(e.target)?c_(n.gt,e.target):u_(n.gt,e.target).Vt;let s=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:$n(e.target),readTime:t,resumeToken:s,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:r,query:i}}function m_(n){let e=l_({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Al(e,e.limit,"L"):e}function Gu(n,e){return new fs(e.largestBatchId,xl(n.gt,e.overlayMutation))}function Nm(n,e){let t=e.path.lastSegment();return[n,Pe(e.path.popLast()),t]}function Om(n,e,t,r){return{indexId:n,uid:e,sequenceNumber:t,readTime:Wn(r.readTime),documentKey:Pe(r.documentKey.path),largestBatchId:r.largestBatchId}}var Ll=class{getBundleMetadata(e,t){return Vm(e).get(t).next(r=>{if(r)return function(s){return{id:s.bundleId,createTime:Kn(s.createTime),version:s.version}}(r)})}saveBundleMetadata(e,t){return Vm(e).put(function(i){return{bundleId:i.id,createTime:Wn(Ve(i.createTime)),version:i.version}}(t))}getNamedQuery(e,t){return xm(e).get(t).next(r=>{if(r)return function(s){return{name:s.name,query:m_(s.bundledQuery),readTime:Kn(s.readTime)}}(r)})}saveNamedQuery(e,t){return xm(e).put(function(i){return{name:i.name,readTime:Wn(Ve(i.readTime)),bundledQuery:i.bundledQuery}}(t))}};function Vm(n){return _e(n,Ka)}function xm(n){return _e(n,Ha)}var va=class n{constructor(e,t){this.serializer=e,this.userId=t}static yt(e,t){let r=t.uid||"";return new n(e,r)}getOverlay(e,t){return qi(e).get(Nm(this.userId,t)).next(r=>r?Gu(this.serializer,r):null)}getOverlays(e,t){let r=lt();return A.forEach(t,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}saveOverlays(e,t,r){let i=[];return r.forEach((s,o)=>{let c=new fs(t,o);i.push(this.wt(e,c))}),A.waitFor(i)}removeOverlaysForBatchId(e,t,r){let i=new Set;t.forEach(o=>i.add(Pe(o.getCollectionPath())));let s=[];return i.forEach(o=>{let c=IDBKeyRange.bound([this.userId,o,r],[this.userId,o,r+1],!1,!0);s.push(qi(e).Y(hl,c))}),A.waitFor(s)}getOverlaysForCollection(e,t,r){let i=lt(),s=Pe(t),o=IDBKeyRange.bound([this.userId,s,r],[this.userId,s,Number.POSITIVE_INFINITY],!0);return qi(e).j(hl,o).next(c=>{for(let u of c){let h=Gu(this.serializer,u);i.set(h.getKey(),h)}return i})}getOverlaysForCollectionGroup(e,t,r,i){let s=lt(),o,c=IDBKeyRange.bound([this.userId,t,r],[this.userId,t,Number.POSITIVE_INFINITY],!0);return qi(e).X({index:Ag,range:c},(u,h,f)=>{let m=Gu(this.serializer,h);s.size()<i||m.largestBatchId===o?(s.set(m.getKey(),m),o=m.largestBatchId):f.done()}).next(()=>s)}wt(e,t){return qi(e).put(function(i,s,o){let[c,u,h]=Nm(s,o.mutation.key);return{userId:s,collectionPath:u,documentId:h,collectionGroup:o.mutation.key.getCollectionGroup(),largestBatchId:o.largestBatchId,overlayMutation:ga(i.gt,o.mutation)}}(this.serializer,this.userId,t))}};function qi(n){return _e(n,Qa)}var Ml=class{St(e){return _e(e,Xh)}getSessionToken(e){return this.St(e).get("sessionToken").next(t=>{let r=t==null?void 0:t.value;return r?ge.fromUint8Array(r):ge.EMPTY_BYTE_STRING})}setSessionToken(e,t){return this.St(e).put({name:"sessionToken",value:t.toUint8Array()})}};var At=class{constructor(){}bt(e,t){this.Dt(e,t),t.vt()}Dt(e,t){if("nullValue"in e)this.Ct(t,5);else if("booleanValue"in e)this.Ct(t,10),t.Ft(e.booleanValue?1:0);else if("integerValue"in e)this.Ct(t,15),t.Ft(se(e.integerValue));else if("doubleValue"in e){let r=se(e.doubleValue);isNaN(r)?this.Ct(t,13):(this.Ct(t,15),rs(r)?t.Ft(0):t.Ft(r))}else if("timestampValue"in e){let r=e.timestampValue;this.Ct(t,20),typeof r=="string"&&(r=Rt(r)),t.Mt(`${r.seconds||""}`),t.Ft(r.nanos||0)}else if("stringValue"in e)this.xt(e.stringValue,t),this.Ot(t);else if("bytesValue"in e)this.Ct(t,30),t.Nt(Pt(e.bytesValue)),this.Ot(t);else if("referenceValue"in e)this.Bt(e.referenceValue,t);else if("geoPointValue"in e){let r=e.geoPointValue;this.Ct(t,45),t.Ft(r.latitude||0),t.Ft(r.longitude||0)}else"mapValue"in e?Lg(e)?this.Ct(t,Number.MAX_SAFE_INTEGER):Ja(e)?this.Lt(e.mapValue,t):(this.kt(e.mapValue,t),this.Ot(t)):"arrayValue"in e?(this.qt(e.arrayValue,t),this.Ot(t)):F(19022,{Qt:e})}xt(e,t){this.Ct(t,25),this.$t(e,t)}$t(e,t){t.Mt(e)}kt(e,t){let r=e.fields||{};this.Ct(t,55);for(let i of Object.keys(r))this.xt(i,t),this.Dt(r[i],t)}Lt(e,t){var r,i;let s=e.fields||{};this.Ct(t,53);let o=Fr,c=((i=(r=s[o].arrayValue)===null||r===void 0?void 0:r.values)===null||i===void 0?void 0:i.length)||0;this.Ct(t,15),t.Ft(se(c)),this.xt(o,t),this.Dt(s[o],t)}qt(e,t){let r=e.values||[];this.Ct(t,50);for(let i of r)this.Dt(i,t)}Bt(e,t){this.Ct(t,37),L.fromName(e).path.forEach(r=>{this.Ct(t,60),this.$t(r,t)})}Ct(e,t){e.Ft(t)}Ot(e){e.Ft(2)}};At.Ut=new At;var gr=255;function mT(n){if(n===0)return 8;let e=0;return n>>4||(e+=4,n<<=4),n>>6||(e+=2,n<<=2),n>>7||(e+=1),e}function Lm(n){let e=64-function(r){let i=0;for(let s=0;s<8;++s){let o=mT(255&r[s]);if(i+=o,o!==8)break}return i}(n);return Math.ceil(e/8)}var Fl=class{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Kt(e){let t=e[Symbol.iterator](),r=t.next();for(;!r.done;)this.Wt(r.value),r=t.next();this.Gt()}zt(e){let t=e[Symbol.iterator](),r=t.next();for(;!r.done;)this.jt(r.value),r=t.next();this.Jt()}Ht(e){for(let t of e){let r=t.charCodeAt(0);if(r<128)this.Wt(r);else if(r<2048)this.Wt(960|r>>>6),this.Wt(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.Wt(480|r>>>12),this.Wt(128|63&r>>>6),this.Wt(128|63&r);else{let i=t.codePointAt(0);this.Wt(240|i>>>18),this.Wt(128|63&i>>>12),this.Wt(128|63&i>>>6),this.Wt(128|63&i)}}this.Gt()}Yt(e){for(let t of e){let r=t.charCodeAt(0);if(r<128)this.jt(r);else if(r<2048)this.jt(960|r>>>6),this.jt(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.jt(480|r>>>12),this.jt(128|63&r>>>6),this.jt(128|63&r);else{let i=t.codePointAt(0);this.jt(240|i>>>18),this.jt(128|63&i>>>12),this.jt(128|63&i>>>6),this.jt(128|63&i)}}this.Jt()}Zt(e){let t=this.Xt(e),r=Lm(t);this.en(1+r),this.buffer[this.position++]=255&r;for(let i=t.length-r;i<t.length;++i)this.buffer[this.position++]=255&t[i]}tn(e){let t=this.Xt(e),r=Lm(t);this.en(1+r),this.buffer[this.position++]=~(255&r);for(let i=t.length-r;i<t.length;++i)this.buffer[this.position++]=~(255&t[i])}nn(){this.rn(gr),this.rn(255)}sn(){this._n(gr),this._n(255)}reset(){this.position=0}seed(e){this.en(e.length),this.buffer.set(e,this.position),this.position+=e.length}an(){return this.buffer.slice(0,this.position)}Xt(e){let t=function(s){let o=new DataView(new ArrayBuffer(8));return o.setFloat64(0,s,!1),new Uint8Array(o.buffer)}(e),r=!!(128&t[0]);t[0]^=r?255:128;for(let i=1;i<t.length;++i)t[i]^=r?255:0;return t}Wt(e){let t=255&e;t===0?(this.rn(0),this.rn(255)):t===gr?(this.rn(gr),this.rn(0)):this.rn(t)}jt(e){let t=255&e;t===0?(this._n(0),this._n(255)):t===gr?(this._n(gr),this._n(0)):this._n(e)}Gt(){this.rn(0),this.rn(1)}Jt(){this._n(0),this._n(1)}rn(e){this.en(1),this.buffer[this.position++]=e}_n(e){this.en(1),this.buffer[this.position++]=~e}en(e){let t=e+this.position;if(t<=this.buffer.length)return;let r=2*this.buffer.length;r<t&&(r=t);let i=new Uint8Array(r);i.set(this.buffer),this.buffer=i}},Ul=class{constructor(e){this.un=e}Nt(e){this.un.Kt(e)}Mt(e){this.un.Ht(e)}Ft(e){this.un.Zt(e)}vt(){this.un.nn()}},Bl=class{constructor(e){this.un=e}Nt(e){this.un.zt(e)}Mt(e){this.un.Yt(e)}Ft(e){this.un.tn(e)}vt(){this.un.sn()}},Nn=class{constructor(){this.un=new Fl,this.cn=new Ul(this.un),this.ln=new Bl(this.un)}seed(e){this.un.seed(e)}hn(e){return e===0?this.cn:this.ln}an(){return this.un.an()}reset(){this.un.reset()}};var On=class n{constructor(e,t,r,i){this.Pn=e,this.Tn=t,this.In=r,this.dn=i}En(){let e=this.dn.length,t=e===0||this.dn[e-1]===255?e+1:e,r=new Uint8Array(t);return r.set(this.dn,0),t!==e?r.set([0],this.dn.length):++r[r.length-1],new n(this.Pn,this.Tn,this.In,r)}An(e,t,r){return{indexId:this.Pn,uid:e,arrayValue:Ko(this.In),directionalValue:Ko(this.dn),orderedDocumentKey:Ko(t),documentKey:r.path.toArray()}}Rn(e,t,r){let i=this.An(e,t,r);return[i.indexId,i.uid,i.arrayValue,i.directionalValue,i.orderedDocumentKey,i.documentKey]}};function Gt(n,e){let t=n.Pn-e.Pn;return t!==0?t:(t=Mm(n.In,e.In),t!==0?t:(t=Mm(n.dn,e.dn),t!==0?t:L.comparator(n.Tn,e.Tn)))}function Mm(n,e){for(let t=0;t<n.length&&t<e.length;++t){let r=n[t]-e[t];if(r!==0)return r}return n.length-e.length}function Ko(n){return Fc()?function(t){let r="";for(let i=0;i<t.length;i++)r+=String.fromCharCode(t[i]);return r}(n):n}function Fm(n){return typeof n!="string"?n:function(t){let r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r}(n)}var Ia=class{constructor(e){this.Vn=new ne((t,r)=>me.comparator(t.field,r.field)),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.mn=e.orderBy,this.fn=[];for(let t of e.filters){let r=t;r.isInequality()?this.Vn=this.Vn.add(r):this.fn.push(r)}}get gn(){return this.Vn.size>1}pn(e){if(j(e.collectionGroup===this.collectionId,49279),this.gn)return!1;let t=il(e);if(t!==void 0&&!this.yn(t))return!1;let r=Pn(e),i=new Set,s=0,o=0;for(;s<r.length&&this.yn(r[s]);++s)i=i.add(r[s].fieldPath.canonicalString());if(s===r.length)return!0;if(this.Vn.size>0){let c=this.Vn.getIterator().getNext();if(!i.has(c.field.canonicalString())){let u=r[s];if(!this.wn(c,u)||!this.Sn(this.mn[o++],u))return!1}++s}for(;s<r.length;++s){let c=r[s];if(o>=this.mn.length||!this.Sn(this.mn[o++],c))return!1}return!0}bn(){if(this.gn)return null;let e=new ne(me.comparator),t=[];for(let r of this.fn)if(!r.field.isKeyField())if(r.op==="array-contains"||r.op==="array-contains-any")t.push(new Sr(r.field,2));else{if(e.has(r.field))continue;e=e.add(r.field),t.push(new Sr(r.field,0))}for(let r of this.mn)r.field.isKeyField()||e.has(r.field)||(e=e.add(r.field),t.push(new Sr(r.field,r.dir==="asc"?0:1)));return new Dr(Dr.UNKNOWN_ID,this.collectionId,t,ns.empty())}yn(e){for(let t of this.fn)if(this.wn(t,e))return!0;return!1}wn(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;let r=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===r}Sn(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}};function g_(n){var e,t;if(j(n instanceof J||n instanceof te,20012),n instanceof J){if(n instanceof oa){let i=((t=(e=n.value.arrayValue)===null||e===void 0?void 0:e.values)===null||t===void 0?void 0:t.map(s=>J.create(n.field,"==",s)))||[];return te.create(i,"or")}return n}let r=n.filters.map(i=>g_(i));return te.create(r,n.op)}function gT(n){if(n.getFilters().length===0)return[];let e=zl(g_(n));return j(__(e),7391),ql(e)||jl(e)?[e]:e.getFilters()}function ql(n){return n instanceof J}function jl(n){return n instanceof te&&id(n)}function __(n){return ql(n)||jl(n)||function(t){if(t instanceof te&&ml(t)){for(let r of t.getFilters())if(!ql(r)&&!jl(r))return!1;return!0}return!1}(n)}function zl(n){if(j(n instanceof J||n instanceof te,34018),n instanceof J)return n;if(n.filters.length===1)return zl(n.filters[0]);let e=n.filters.map(r=>zl(r)),t=te.create(e,n.op);return t=wa(t),__(t)?t:(j(t instanceof te,64498),j(qr(t),40251),j(t.filters.length>1,57927),t.filters.reduce((r,i)=>ad(r,i)))}function ad(n,e){let t;return j(n instanceof J||n instanceof te,38388),j(e instanceof J||e instanceof te,25473),t=n instanceof J?e instanceof J?function(i,s){return te.create([i,s],"and")}(n,e):Um(n,e):e instanceof J?Um(e,n):function(i,s){if(j(i.filters.length>0&&s.filters.length>0,48005),qr(i)&&qr(s))return qg(i,s.getFilters());let o=ml(i)?i:s,c=ml(i)?s:i,u=o.filters.map(h=>ad(h,c));return te.create(u,"or")}(n,e),wa(t)}function Um(n,e){if(qr(e))return qg(e,n.getFilters());{let t=e.filters.map(r=>ad(n,r));return te.create(t,"or")}}function wa(n){if(j(n instanceof J||n instanceof te,11850),n instanceof J)return n;let e=n.getFilters();if(e.length===1)return wa(e[0]);if(Ug(n))return n;let t=e.map(i=>wa(i)),r=[];return t.forEach(i=>{i instanceof J?r.push(i):i instanceof te&&(i.op===n.op?r.push(...i.filters):r.push(i))}),r.length===1?r[0]:te.create(r,n.op)}var $l=class{constructor(){this.Dn=new ms}addToCollectionParentIndex(e,t){return this.Dn.add(t),A.resolve()}getCollectionParents(e,t){return A.resolve(this.Dn.getEntries(t))}addFieldIndex(e,t){return A.resolve()}deleteFieldIndex(e,t){return A.resolve()}deleteAllFieldIndexes(e){return A.resolve()}createTargetIndexes(e,t){return A.resolve()}getDocumentsMatchingTarget(e,t){return A.resolve(null)}getIndexType(e,t){return A.resolve(0)}getFieldIndexes(e,t){return A.resolve([])}getNextCollectionGroupToUpdate(e){return A.resolve(null)}getMinOffset(e,t){return A.resolve(Ye.min())}getMinOffsetFromCollectionGroup(e,t){return A.resolve(Ye.min())}updateCollectionGroup(e,t,r){return A.resolve()}updateIndexEntries(e,t){return A.resolve()}},ms=class{constructor(){this.index={}}add(e){let t=e.lastSegment(),r=e.popLast(),i=this.index[t]||new ne(ee.comparator),s=!i.has(r);return this.index[t]=i.add(r),s}has(e){let t=e.lastSegment(),r=e.popLast(),i=this.index[t];return i&&i.has(r)}getEntries(e){return(this.index[e]||new ne(ee.comparator)).toArray()}};var Bm="IndexedDbIndexManager",Mo=new Uint8Array(0),Gl=class{constructor(e,t){this.databaseId=t,this.vn=new ms,this.Cn=new nt(r=>$n(r),(r,i)=>Es(r,i)),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.vn.has(t)){let r=t.lastSegment(),i=t.popLast();e.addOnCommittedListener(()=>{this.vn.add(t)});let s={collectionId:r,parent:Pe(i)};return qm(e).put(s)}return A.resolve()}getCollectionParents(e,t){let r=[],i=IDBKeyRange.bound([t,""],[pg(t),""],!1,!0);return qm(e).j(i).next(s=>{for(let o of s){if(o.collectionId!==t)break;r.push(ut(o.parent))}return r})}addFieldIndex(e,t){let r=ji(e),i=function(c){return{indexId:c.indexId,collectionGroup:c.collectionGroup,fields:c.fields.map(u=>[u.fieldPath.canonicalString(),u.kind])}}(t);delete i.indexId;let s=r.add(i);if(t.indexState){let o=yr(e);return s.next(c=>{o.put(Om(c,this.uid,t.indexState.sequenceNumber,t.indexState.offset))})}return s.next()}deleteFieldIndex(e,t){let r=ji(e),i=yr(e),s=_r(e);return r.delete(t.indexId).next(()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))).next(()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))}deleteAllFieldIndexes(e){let t=ji(e),r=_r(e),i=yr(e);return t.Y().next(()=>r.Y()).next(()=>i.Y())}createTargetIndexes(e,t){return A.forEach(this.Fn(t),r=>this.getIndexType(e,r).next(i=>{if(i===0||i===1){let s=new Ia(r).bn();if(s!=null)return this.addFieldIndex(e,s)}}))}getDocumentsMatchingTarget(e,t){let r=_r(e),i=!0,s=new Map;return A.forEach(this.Fn(t),o=>this.Mn(e,o).next(c=>{i&&(i=!!c),s.set(o,c)})).next(()=>{if(i){let o=Q(),c=[];return A.forEach(s,(u,h)=>{D(Bm,`Using index ${function(M){return`id=${M.indexId}|cg=${M.collectionGroup}|f=${M.fields.map(H=>`${H.fieldPath}:${H.kind}`).join(",")}`}(u)} to execute ${$n(t)}`);let f=function(M,H){let q=il(H);if(q===void 0)return null;for(let U of ca(M,q.fieldPath))switch(U.op){case"array-contains-any":return U.value.arrayValue.values||[];case"array-contains":return[U.value]}return null}(h,u),m=function(M,H){let q=new Map;for(let U of Pn(H))for(let I of ca(M,U.fieldPath))switch(I.op){case"==":case"in":q.set(U.fieldPath.canonicalString(),I.value);break;case"not-in":case"!=":return q.set(U.fieldPath.canonicalString(),I.value),Array.from(q.values())}return null}(h,u),_=function(M,H){let q=[],U=!0;for(let I of Pn(H)){let g=I.kind===0?vm(M,I.fieldPath,M.startAt):Im(M,I.fieldPath,M.startAt);q.push(g.value),U&&(U=g.inclusive)}return new nn(q,U)}(h,u),S=function(M,H){let q=[],U=!0;for(let I of Pn(H)){let g=I.kind===0?Im(M,I.fieldPath,M.endAt):vm(M,I.fieldPath,M.endAt);q.push(g.value),U&&(U=g.inclusive)}return new nn(q,U)}(h,u),C=this.xn(u,h,_),N=this.xn(u,h,S),k=this.On(u,h,m),$=this.Nn(u.indexId,f,C,_.inclusive,N,S.inclusive,k);return A.forEach($,B=>r.H(B,t.limit).next(M=>{M.forEach(H=>{let q=L.fromSegments(H.documentKey);o.has(q)||(o=o.add(q),c.push(q))})}))}).next(()=>c)}return A.resolve(null)})}Fn(e){let t=this.Cn.get(e);return t||(e.filters.length===0?t=[e]:t=gT(te.create(e.filters,"and")).map(r=>bl(e.path,e.collectionGroup,e.orderBy,r.getFilters(),e.limit,e.startAt,e.endAt)),this.Cn.set(e,t),t)}Nn(e,t,r,i,s,o,c){let u=(t!=null?t.length:1)*Math.max(r.length,s.length),h=u/(t!=null?t.length:1),f=[];for(let m=0;m<u;++m){let _=t?this.Bn(t[m/h]):Mo,S=this.Ln(e,_,r[m%h],i),C=this.kn(e,_,s[m%h],o),N=c.map(k=>this.Ln(e,_,k,!0));f.push(...this.createRange(S,C,N))}return f}Ln(e,t,r,i){let s=new On(e,L.empty(),t,r);return i?s:s.En()}kn(e,t,r,i){let s=new On(e,L.empty(),t,r);return i?s.En():s}Mn(e,t){let r=new Ia(t),i=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,i).next(s=>{let o=null;for(let c of s)r.pn(c)&&(!o||c.fields.length>o.fields.length)&&(o=c);return o})}getIndexType(e,t){let r=2,i=this.Fn(t);return A.forEach(i,s=>this.Mn(e,s).next(o=>{o?r!==0&&o.fields.length<function(u){let h=new ne(me.comparator),f=!1;for(let m of u.filters)for(let _ of m.getFlattenedFilters())_.field.isKeyField()||(_.op==="array-contains"||_.op==="array-contains-any"?f=!0:h=h.add(_.field));for(let m of u.orderBy)m.field.isKeyField()||(h=h.add(m.field));return h.size+(f?1:0)}(s)&&(r=1):r=0})).next(()=>function(o){return o.limit!==null}(t)&&i.length>1&&r===2?1:r)}qn(e,t){let r=new Nn;for(let i of Pn(e)){let s=t.data.field(i.fieldPath);if(s==null)return null;let o=r.hn(i.kind);At.Ut.bt(s,o)}return r.an()}Bn(e){let t=new Nn;return At.Ut.bt(e,t.hn(0)),t.an()}Qn(e,t){let r=new Nn;return At.Ut.bt(rd(this.databaseId,t),r.hn(function(s){let o=Pn(s);return o.length===0?0:o[o.length-1].kind}(e))),r.an()}On(e,t,r){if(r===null)return[];let i=[];i.push(new Nn);let s=0;for(let o of Pn(e)){let c=r[s++];for(let u of i)if(this.$n(t,o.fieldPath)&&hs(c))i=this.Un(i,o,c);else{let h=u.hn(o.kind);At.Ut.bt(c,h)}}return this.Kn(i)}xn(e,t,r){return this.On(e,t,r.position)}Kn(e){let t=[];for(let r=0;r<e.length;++r)t[r]=e[r].an();return t}Un(e,t,r){let i=[...e],s=[];for(let o of r.arrayValue.values||[])for(let c of i){let u=new Nn;u.seed(c.an()),At.Ut.bt(o,u.hn(t.kind)),s.push(u)}return s}$n(e,t){return!!e.filters.find(r=>r instanceof J&&r.field.isEqual(t)&&(r.op==="in"||r.op==="not-in"))}getFieldIndexes(e,t){let r=ji(e),i=yr(e);return(t?r.j(ll,IDBKeyRange.bound(t,t)):r.j()).next(s=>{let o=[];return A.forEach(s,c=>i.get([c.indexId,this.uid]).next(u=>{o.push(function(f,m){let _=m?new ns(m.sequenceNumber,new Ye(Kn(m.readTime),new L(ut(m.documentKey)),m.largestBatchId)):ns.empty(),S=f.fields.map(([C,N])=>new Sr(me.fromServerFormat(C),N));return new Dr(f.indexId,f.collectionGroup,S,_)}(c,u))})).next(()=>o)})}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next(t=>t.length===0?null:(t.sort((r,i)=>{let s=r.indexState.sequenceNumber-i.indexState.sequenceNumber;return s!==0?s:W(r.collectionGroup,i.collectionGroup)}),t[0].collectionGroup))}updateCollectionGroup(e,t,r){let i=ji(e),s=yr(e);return this.Wn(e).next(o=>i.j(ll,IDBKeyRange.bound(t,t)).next(c=>A.forEach(c,u=>s.put(Om(u.indexId,this.uid,o,r)))))}updateIndexEntries(e,t){let r=new Map;return A.forEach(t,(i,s)=>{let o=r.get(i.collectionGroup);return(o?A.resolve(o):this.getFieldIndexes(e,i.collectionGroup)).next(c=>(r.set(i.collectionGroup,c),A.forEach(c,u=>this.Gn(e,i,u).next(h=>{let f=this.zn(s,u);return h.isEqual(f)?A.resolve():this.jn(e,s,u,h,f)}))))})}Jn(e,t,r,i){return _r(e).put(i.An(this.uid,this.Qn(r,t.key),t.key))}Hn(e,t,r,i){return _r(e).delete(i.Rn(this.uid,this.Qn(r,t.key),t.key))}Gn(e,t,r){let i=_r(e),s=new ne(Gt);return i.X({index:bg,range:IDBKeyRange.only([r.indexId,this.uid,Ko(this.Qn(r,t))])},(o,c)=>{s=s.add(new On(r.indexId,t,Fm(c.arrayValue),Fm(c.directionalValue)))}).next(()=>s)}zn(e,t){let r=new ne(Gt),i=this.qn(t,e);if(i==null)return r;let s=il(t);if(s!=null){let o=e.data.field(s.fieldPath);if(hs(o))for(let c of o.arrayValue.values||[])r=r.add(new On(t.indexId,e.key,this.Bn(c),i))}else r=r.add(new On(t.indexId,e.key,Mo,i));return r}jn(e,t,r,i,s){D(Bm,"Updating index entries for document '%s'",t.key);let o=[];return function(u,h,f,m,_){let S=u.getIterator(),C=h.getIterator(),N=mr(S),k=mr(C);for(;N||k;){let $=!1,B=!1;if(N&&k){let M=f(N,k);M<0?B=!0:M>0&&($=!0)}else N!=null?B=!0:$=!0;$?(m(k),k=mr(C)):B?(_(N),N=mr(S)):(N=mr(S),k=mr(C))}}(i,s,Gt,c=>{o.push(this.Jn(e,t,r,c))},c=>{o.push(this.Hn(e,t,r,c))}),A.waitFor(o)}Wn(e){let t=1;return yr(e).X({index:Tg,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},(r,i,s)=>{s.done(),t=i.sequenceNumber+1}).next(()=>t)}createRange(e,t,r){r=r.sort((o,c)=>Gt(o,c)).filter((o,c,u)=>!c||Gt(o,u[c-1])!==0);let i=[];i.push(e);for(let o of r){let c=Gt(o,e),u=Gt(o,t);if(c===0)i[0]=e.En();else if(c>0&&u<0)i.push(o),i.push(o.En());else if(u>0)break}i.push(t);let s=[];for(let o=0;o<i.length;o+=2){if(this.Yn(i[o],i[o+1]))return[];let c=i[o].Rn(this.uid,Mo,L.empty()),u=i[o+1].Rn(this.uid,Mo,L.empty());s.push(IDBKeyRange.bound(c,u))}return s}Yn(e,t){return Gt(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(jm)}getMinOffset(e,t){return A.mapArray(this.Fn(t),r=>this.Mn(e,r).next(i=>i||F(44426))).next(jm)}};function qm(n){return _e(n,os)}function _r(n){return _e(n,Qi)}function ji(n){return _e(n,Jh)}function yr(n){return _e(n,Hi)}function jm(n){j(n.length!==0,28825);let e=n[0].indexState.offset,t=e.largestBatchId;for(let r=1;r<n.length;r++){let i=n[r].indexState.offset;Hh(i,e)<0&&(e=i),t<i.largestBatchId&&(t=i.largestBatchId)}return new Ye(e.readTime,e.documentKey,t)}var zm={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},y_=41943040,Le=class n{static withCacheSize(e){return new n(e,n.DEFAULT_COLLECTION_PERCENTILE,n.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}};function v_(n,e,t){let r=n.store(et),i=n.store(Or),s=[],o=IDBKeyRange.only(t.batchId),c=0,u=r.X({range:o},(f,m,_)=>(c++,_.delete()));s.push(u.next(()=>{j(c===1,47070,{batchId:t.batchId})}));let h=[];for(let f of t.mutations){let m=Ig(e,f.key.path,t.batchId);s.push(i.delete(m)),h.push(f.key)}return A.waitFor(s).next(()=>h)}function Ea(n){if(!n)return 0;let e;if(n.document)e=n.document;else if(n.unknownDocument)e=n.unknownDocument;else{if(!n.noDocument)throw F(14731);e=n.noDocument}return JSON.stringify(e).length}Le.DEFAULT_COLLECTION_PERCENTILE=10,Le.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Le.DEFAULT=new Le(y_,Le.DEFAULT_COLLECTION_PERCENTILE,Le.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Le.DISABLED=new Le(-1,0,0);var Ta=class n{constructor(e,t,r,i){this.userId=e,this.serializer=t,this.indexManager=r,this.referenceDelegate=i,this.Zn={}}static yt(e,t,r,i){j(e.uid!=="",64387);let s=e.isAuthenticated()?e.uid:"";return new n(s,t,r,i)}checkEmpty(e){let t=!0,r=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return Wt(e).X({index:Vn,range:r},(i,s,o)=>{t=!1,o.done()}).next(()=>t)}addMutationBatch(e,t,r,i){let s=br(e),o=Wt(e);return o.add({}).next(c=>{j(typeof c=="number",49019);let u=new ds(c,t,r,i),h=function(S,C,N){let k=N.baseMutations.map(B=>ga(S.gt,B)),$=N.mutations.map(B=>ga(S.gt,B));return{userId:C,batchId:N.batchId,localWriteTimeMs:N.localWriteTime.toMillis(),baseMutations:k,mutations:$}}(this.serializer,this.userId,u),f=[],m=new ne((_,S)=>W(_.canonicalString(),S.canonicalString()));for(let _ of i){let S=Ig(this.userId,_.key.path,c);m=m.add(_.key.path.popLast()),f.push(o.put(h)),f.push(s.put(S,lE))}return m.forEach(_=>{f.push(this.indexManager.addToCollectionParentIndex(e,_))}),e.addOnCommittedListener(()=>{this.Zn[c]=u.keys()}),A.waitFor(f).next(()=>u)})}lookupMutationBatch(e,t){return Wt(e).get(t).next(r=>r?(j(r.userId===this.userId,48,"Unexpected user for mutation batch",{userId:r.userId,batchId:t}),Dn(this.serializer,r)):null)}Xn(e,t){return this.Zn[t]?A.resolve(this.Zn[t]):this.lookupMutationBatch(e,t).next(r=>{if(r){let i=r.keys();return this.Zn[t]=i,i}return null})}getNextMutationBatchAfterBatchId(e,t){let r=t+1,i=IDBKeyRange.lowerBound([this.userId,r]),s=null;return Wt(e).X({index:Vn,range:i},(o,c,u)=>{c.userId===this.userId&&(j(c.batchId>=r,47524,{er:r}),s=Dn(this.serializer,c)),u.done()}).next(()=>s)}getHighestUnacknowledgedBatchId(e){let t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]),r=Un;return Wt(e).X({index:Vn,range:t,reverse:!0},(i,s,o)=>{r=s.batchId,o.done()}).next(()=>r)}getAllMutationBatches(e){let t=IDBKeyRange.bound([this.userId,Un],[this.userId,Number.POSITIVE_INFINITY]);return Wt(e).j(Vn,t).next(r=>r.map(i=>Dn(this.serializer,i)))}getAllMutationBatchesAffectingDocumentKey(e,t){let r=qo(this.userId,t.path),i=IDBKeyRange.lowerBound(r),s=[];return br(e).X({range:i},(o,c,u)=>{let[h,f,m]=o,_=ut(f);if(h===this.userId&&t.path.isEqual(_))return Wt(e).get(m).next(S=>{if(!S)throw F(61480,{tr:o,batchId:m});j(S.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:S.userId,batchId:m}),s.push(Dn(this.serializer,S))});u.done()}).next(()=>s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ne(W),i=[];return t.forEach(s=>{let o=qo(this.userId,s.path),c=IDBKeyRange.lowerBound(o),u=br(e).X({range:c},(h,f,m)=>{let[_,S,C]=h,N=ut(S);_===this.userId&&s.path.isEqual(N)?r=r.add(C):m.done()});i.push(u)}),A.waitFor(i).next(()=>this.nr(e,r))}getAllMutationBatchesAffectingQuery(e,t){let r=t.path,i=r.length+1,s=qo(this.userId,r),o=IDBKeyRange.lowerBound(s),c=new ne(W);return br(e).X({range:o},(u,h,f)=>{let[m,_,S]=u,C=ut(_);m===this.userId&&r.isPrefixOf(C)?C.length===i&&(c=c.add(S)):f.done()}).next(()=>this.nr(e,c))}nr(e,t){let r=[],i=[];return t.forEach(s=>{i.push(Wt(e).get(s).next(o=>{if(o===null)throw F(35274,{batchId:s});j(o.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:o.userId,batchId:s}),r.push(Dn(this.serializer,o))}))}),A.waitFor(i).next(()=>r)}removeMutationBatch(e,t){return v_(e.ce,this.userId,t).next(r=>(e.addOnCommittedListener(()=>{this.rr(t.batchId)}),A.forEach(r,i=>this.referenceDelegate.markPotentiallyOrphaned(e,i))))}rr(e){delete this.Zn[e]}performConsistencyCheck(e){return this.checkEmpty(e).next(t=>{if(!t)return A.resolve();let r=IDBKeyRange.lowerBound(function(o){return[o]}(this.userId)),i=[];return br(e).X({range:r},(s,o,c)=>{if(s[0]===this.userId){let u=ut(s[1]);i.push(u)}else c.done()}).next(()=>{j(i.length===0,56720,{ir:i.map(s=>s.canonicalString())})})})}containsKey(e,t){return I_(e,this.userId,t)}sr(e){return w_(e).get(this.userId).next(t=>t||{userId:this.userId,lastAcknowledgedBatchId:Un,lastStreamToken:""})}};function I_(n,e,t){let r=qo(e,t.path),i=r[1],s=IDBKeyRange.lowerBound(r),o=!1;return br(n).X({range:s,Z:!0},(c,u,h)=>{let[f,m,_]=c;f===e&&m===i&&(o=!0),h.done()}).next(()=>o)}function Wt(n){return _e(n,et)}function br(n){return _e(n,Or)}function w_(n){return _e(n,is)}var Hr=class n{constructor(e){this._r=e}next(){return this._r+=2,this._r}static ar(){return new n(0)}static ur(){return new n(-1)}};var Wl=class{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.cr(e).next(t=>{let r=new Hr(t.highestTargetId);return t.highestTargetId=r.next(),this.lr(e,t).next(()=>t.highestTargetId)})}getLastRemoteSnapshotVersion(e){return this.cr(e).next(t=>G.fromTimestamp(new oe(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds)))}getHighestSequenceNumber(e){return this.cr(e).next(t=>t.highestListenSequenceNumber)}setTargetsMetadata(e,t,r){return this.cr(e).next(i=>(i.highestListenSequenceNumber=t,r&&(i.lastRemoteSnapshotVersion=r.toTimestamp()),t>i.highestListenSequenceNumber&&(i.highestListenSequenceNumber=t),this.lr(e,i)))}addTargetData(e,t){return this.hr(e,t).next(()=>this.cr(e).next(r=>(r.targetCount+=1,this.Pr(t,r),this.lr(e,r))))}updateTargetData(e,t){return this.hr(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next(()=>vr(e).delete(t.targetId)).next(()=>this.cr(e)).next(r=>(j(r.targetCount>0,8065),r.targetCount-=1,this.lr(e,r)))}removeTargets(e,t,r){let i=0,s=[];return vr(e).X((o,c)=>{let u=Wi(c);u.sequenceNumber<=t&&r.get(u.targetId)===null&&(i++,s.push(this.removeTargetData(e,u)))}).next(()=>A.waitFor(s)).next(()=>i)}forEachTarget(e,t){return vr(e).X((r,i)=>{let s=Wi(i);t(s)})}cr(e){return $m(e).get(na).next(t=>(j(t!==null,2888),t))}lr(e,t){return $m(e).put(na,t)}hr(e,t){return vr(e).put(p_(this.serializer,t))}Pr(e,t){let r=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,r=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,r=!0),r}getTargetCount(e){return this.cr(e).next(t=>t.targetCount)}getTargetData(e,t){let r=$n(t),i=IDBKeyRange.bound([r,Number.NEGATIVE_INFINITY],[r,Number.POSITIVE_INFINITY]),s=null;return vr(e).X({range:i,index:Eg},(o,c,u)=>{let h=Wi(c);Es(t,h.target)&&(s=h,u.done())}).next(()=>s)}addMatchingKeys(e,t,r){let i=[],s=Ht(e);return t.forEach(o=>{let c=Pe(o.path);i.push(s.put({targetId:r,path:c})),i.push(this.referenceDelegate.addReference(e,r,o))}),A.waitFor(i)}removeMatchingKeys(e,t,r){let i=Ht(e);return A.forEach(t,s=>{let o=Pe(s.path);return A.waitFor([i.delete([r,o]),this.referenceDelegate.removeReference(e,r,s)])})}removeMatchingKeysForTargetId(e,t){let r=Ht(e),i=IDBKeyRange.bound([t],[t+1],!1,!0);return r.delete(i)}getMatchingKeysForTargetId(e,t){let r=IDBKeyRange.bound([t],[t+1],!1,!0),i=Ht(e),s=Q();return i.X({range:r,Z:!0},(o,c,u)=>{let h=ut(o[1]),f=new L(h);s=s.add(f)}).next(()=>s)}containsKey(e,t){let r=Pe(t.path),i=IDBKeyRange.bound([r],[pg(r)],!1,!0),s=0;return Ht(e).X({index:Yh,Z:!0,range:i},([o,c],u,h)=>{o!==0&&(s++,h.done())}).next(()=>s>0)}Et(e,t){return vr(e).get(t).next(r=>r?Wi(r):null)}};function vr(n){return _e(n,Vr)}function $m(n){return _e(n,Bn)}function Ht(n){return _e(n,xr)}var Gm="LruGarbageCollector",E_=1048576;function Wm([n,e],[t,r]){let i=W(n,t);return i===0?W(e,r):i}var Kl=class{constructor(e){this.Tr=e,this.buffer=new ne(Wm),this.Ir=0}dr(){return++this.Ir}Er(e){let t=[e,this.dr()];if(this.buffer.size<this.Tr)this.buffer=this.buffer.add(t);else{let r=this.buffer.last();Wm(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}},ba=class{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.Ar=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Rr(6e4)}stop(){this.Ar&&(this.Ar.cancel(),this.Ar=null)}get started(){return this.Ar!==null}Rr(e){D(Gm,`Garbage collection scheduled in ${e}ms`),this.Ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){ln(t)?D(Gm,"Ignoring IndexedDB error during garbage collection: ",t):await Jn(t)}await this.Rr(3e5)})}},Hl=class{constructor(e,t){this.Vr=e,this.params=t}calculateTargetCount(e,t){return this.Vr.mr(e).next(r=>Math.floor(t/100*r))}nthSequenceNumber(e,t){if(t===0)return A.resolve(Me.ue);let r=new Kl(t);return this.Vr.forEachTarget(e,i=>r.Er(i.sequenceNumber)).next(()=>this.Vr.gr(e,i=>r.Er(i))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.Vr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.Vr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(D("LruGarbageCollector","Garbage collection skipped; disabled"),A.resolve(zm)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(D("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),zm):this.pr(e,t))}getCacheSize(e){return this.Vr.getCacheSize(e)}pr(e,t){let r,i,s,o,c,u,h,f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(m=>(m>this.params.maximumSequenceNumbersToCollect?(D("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${m}`),i=this.params.maximumSequenceNumbersToCollect):i=m,o=Date.now(),this.nthSequenceNumber(e,i))).next(m=>(r=m,c=Date.now(),this.removeTargets(e,r,t))).next(m=>(s=m,u=Date.now(),this.removeOrphanedDocuments(e,r))).next(m=>(h=Date.now(),Ir()<=Y.DEBUG&&D("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-f}ms
	Determined least recently used ${i} in `+(c-o)+`ms
	Removed ${s} targets in `+(u-c)+`ms
	Removed ${m} documents in `+(h-u)+`ms
Total Duration: ${h-f}ms`),A.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:s,documentsRemoved:m})))}};function T_(n,e){return new Hl(n,e)}var Ql=class{constructor(e,t){this.db=e,this.garbageCollector=T_(this,t)}mr(e){let t=this.yr(e);return this.db.getTargetCache().getTargetCount(e).next(r=>t.next(i=>r+i))}yr(e){let t=0;return this.gr(e,r=>{t++}).next(()=>t)}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}gr(e,t){return this.wr(e,(r,i)=>t(i))}addReference(e,t,r){return Fo(e,r)}removeReference(e,t,r){return Fo(e,r)}removeTargets(e,t,r){return this.db.getTargetCache().removeTargets(e,t,r)}markPotentiallyOrphaned(e,t){return Fo(e,t)}Sr(e,t){return function(i,s){let o=!1;return w_(i).ee(c=>I_(i,c,s).next(u=>(u&&(o=!0),A.resolve(!u)))).next(()=>o)}(e,t)}removeOrphanedDocuments(e,t){let r=this.db.getRemoteDocumentCache().newChangeBuffer(),i=[],s=0;return this.wr(e,(o,c)=>{if(c<=t){let u=this.Sr(e,o).next(h=>{if(!h)return s++,r.getEntry(e,o).next(()=>(r.removeEntry(o,G.min()),Ht(e).delete(function(m){return[0,Pe(m.path)]}(o))))});i.push(u)}}).next(()=>A.waitFor(i)).next(()=>r.apply(e)).next(()=>s)}removeTarget(e,t){let r=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,r)}updateLimboDocument(e,t){return Fo(e,t)}wr(e,t){let r=Ht(e),i,s=Me.ue;return r.X({index:Yh},([o,c],{path:u,sequenceNumber:h})=>{o===0?(s!==Me.ue&&t(new L(ut(i)),s),s=h,i=u):s=Me.ue}).next(()=>{s!==Me.ue&&t(new L(ut(i)),s)})}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}};function Fo(n,e){return Ht(n).put(function(r,i){return{targetId:0,path:Pe(r.path),sequenceNumber:i}}(e,n.currentSequenceNumber))}var Aa=class{constructor(){this.changes=new nt(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Ie.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();let r=this.changes.get(t);return r!==void 0?A.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}};var Yl=class{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,r){return Rn(e).put(r)}removeEntry(e,t,r){return Rn(e).delete(function(s,o){let c=s.path.toArray();return[c.slice(0,c.length-2),c[c.length-2],ya(o),c[c.length-1]]}(t,r))}updateMetadata(e,t){return this.getMetadata(e).next(r=>(r.byteSize+=t,this.br(e,r)))}getEntry(e,t){let r=Ie.newInvalidDocument(t);return Rn(e).X({index:jo,range:IDBKeyRange.only(zi(t))},(i,s)=>{r=this.Dr(t,s)}).next(()=>r)}vr(e,t){let r={size:0,document:Ie.newInvalidDocument(t)};return Rn(e).X({index:jo,range:IDBKeyRange.only(zi(t))},(i,s)=>{r={document:this.Dr(t,s),size:Ea(s)}}).next(()=>r)}getEntries(e,t){let r=ze();return this.Cr(e,t,(i,s)=>{let o=this.Dr(i,s);r=r.insert(i,o)}).next(()=>r)}Fr(e,t){let r=ze(),i=new ae(L.comparator);return this.Cr(e,t,(s,o)=>{let c=this.Dr(s,o);r=r.insert(s,c),i=i.insert(s,Ea(o))}).next(()=>({documents:r,Mr:i}))}Cr(e,t,r){if(t.isEmpty())return A.resolve();let i=new ne(Qm);t.forEach(u=>i=i.add(u));let s=IDBKeyRange.bound(zi(i.first()),zi(i.last())),o=i.getIterator(),c=o.getNext();return Rn(e).X({index:jo,range:s},(u,h,f)=>{let m=L.fromSegments([...h.prefixPath,h.collectionGroup,h.documentId]);for(;c&&Qm(c,m)<0;)r(c,null),c=o.getNext();c&&c.isEqual(m)&&(r(c,h),c=o.hasNext()?o.getNext():null),c?f.G(zi(c)):f.done()}).next(()=>{for(;c;)r(c,null),c=o.hasNext()?o.getNext():null})}getDocumentsMatchingQuery(e,t,r,i,s){let o=t.path,c=[o.popLast().toArray(),o.lastSegment(),ya(r.readTime),r.documentKey.path.isEmpty()?"":r.documentKey.path.lastSegment()],u=[o.popLast().toArray(),o.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return Rn(e).j(IDBKeyRange.bound(c,u,!0)).next(h=>{s==null||s.incrementDocumentReadCount(h.length);let f=ze();for(let m of h){let _=this.Dr(L.fromSegments(m.prefixPath.concat(m.collectionGroup,m.documentId)),m);_.isFoundDocument()&&(Ts(t,_)||i.has(_.key))&&(f=f.insert(_.key,_))}return f})}getAllFromCollectionGroup(e,t,r,i){let s=ze(),o=Hm(t,r),c=Hm(t,Ye.max());return Rn(e).X({index:wg,range:IDBKeyRange.bound(o,c,!0)},(u,h,f)=>{let m=this.Dr(L.fromSegments(h.prefixPath.concat(h.collectionGroup,h.documentId)),h);s=s.insert(m.key,m),s.size===i&&f.done()}).next(()=>s)}newChangeBuffer(e){return new Jl(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next(t=>t.byteSize)}getMetadata(e){return Km(e).get(ul).next(t=>(j(!!t,20021),t))}br(e,t){return Km(e).put(ul,t)}Dr(e,t){if(t){let r=pT(this.serializer,t);if(!(r.isNoDocument()&&r.version.isEqual(G.min())))return r}return Ie.newInvalidDocument(e)}};function b_(n){return new Yl(n)}var Jl=class extends Aa{constructor(e,t){super(),this.Or=e,this.trackRemovals=t,this.Nr=new nt(r=>r.toString(),(r,i)=>r.isEqual(i))}applyChanges(e){let t=[],r=0,i=new ne((s,o)=>W(s.canonicalString(),o.canonicalString()));return this.changes.forEach((s,o)=>{let c=this.Nr.get(s);if(t.push(this.Or.removeEntry(e,s,c.readTime)),o.isValidDocument()){let u=Dm(this.Or.serializer,o);i=i.add(s.path.popLast());let h=Ea(u);r+=h-c.size,t.push(this.Or.addEntry(e,s,u))}else if(r-=c.size,this.trackRemovals){let u=Dm(this.Or.serializer,o.convertToNoDocument(G.min()));t.push(this.Or.addEntry(e,s,u))}}),i.forEach(s=>{t.push(this.Or.indexManager.addToCollectionParentIndex(e,s))}),t.push(this.Or.updateMetadata(e,r)),A.waitFor(t)}getFromCache(e,t){return this.Or.vr(e,t).next(r=>(this.Nr.set(t,{size:r.size,readTime:r.document.readTime}),r.document))}getAllFromCache(e,t){return this.Or.Fr(e,t).next(({documents:r,Mr:i})=>(i.forEach((s,o)=>{this.Nr.set(s,{size:o,readTime:r.get(s).readTime})}),r))}};function Km(n){return _e(n,ss)}function Rn(n){return _e(n,ta)}function zi(n){let e=n.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function Hm(n,e){let t=e.documentKey.path.toArray();return[n,ya(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function Qm(n,e){let t=n.path.toArray(),r=e.path.toArray(),i=0;for(let s=0;s<t.length-2&&s<r.length-2;++s)if(i=W(t[s],r[s]),i)return i;return i=W(t.length,r.length),i||(i=W(t[t.length-2],r[r.length-2]),i||W(t[t.length-1],r[r.length-1]))}var Xl=class{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}};var Sa=class{constructor(e,t,r,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,t))).next(i=>(r!==null&&Zi(r.mutation,i,tt.empty(),oe.now()),i))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,Q()).next(()=>r))}getLocalViewOfDocuments(e,t,r=Q()){let i=lt();return this.populateOverlays(e,i,t).next(()=>this.computeViews(e,t,i,r).next(s=>{let o=Gi();return s.forEach((c,u)=>{o=o.insert(c,u.overlayedDocument)}),o}))}getOverlayedDocuments(e,t){let r=lt();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,Q()))}populateOverlays(e,t,r){let i=[];return r.forEach(s=>{t.has(s)||i.push(s)}),this.documentOverlayCache.getOverlays(e,i).next(s=>{s.forEach((o,c)=>{t.set(o,c)})})}computeViews(e,t,r,i){let s=ze(),o=Xi(),c=function(){return Xi()}();return t.forEach((u,h)=>{let f=r.get(h.key);i.has(h.key)&&(f===void 0||f.mutation instanceof pt)?s=s.insert(h.key,h):f!==void 0?(o.set(h.key,f.mutation.getFieldMask()),Zi(f.mutation,h,f.mutation.getFieldMask(),oe.now())):o.set(h.key,tt.empty())}),this.recalculateAndSaveOverlays(e,s).next(u=>(u.forEach((h,f)=>o.set(h,f)),t.forEach((h,f)=>{var m;return c.set(h,new Xl(f,(m=o.get(h))!==null&&m!==void 0?m:null))}),c))}recalculateAndSaveOverlays(e,t){let r=Xi(),i=new ae((o,c)=>o-c),s=Q();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(o=>{for(let c of o)c.keys().forEach(u=>{let h=t.get(u);if(h===null)return;let f=r.get(u)||tt.empty();f=c.applyToLocalView(h,f),r.set(u,f);let m=(i.get(c.batchId)||Q()).add(u);i=i.insert(c.batchId,m)})}).next(()=>{let o=[],c=i.getReverseIterator();for(;c.hasNext();){let u=c.getNext(),h=u.key,f=u.value,m=Hg();f.forEach(_=>{if(!s.has(_)){let S=e_(t.get(_),r.get(_));S!==null&&m.set(_,S),s=s.add(_)}}),o.push(this.documentOverlayCache.saveOverlays(e,h,m))}return A.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,i){return function(o){return L.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):UE(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,i):this.getDocumentsMatchingCollectionQuery(e,t,r,i)}getNextDocuments(e,t,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,i).next(s=>{let o=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,i-s.size):A.resolve(lt()),c=ts,u=s;return o.next(h=>A.forEach(h,(f,m)=>(c<m.largestBatchId&&(c=m.largestBatchId),s.get(f)?A.resolve():this.remoteDocumentCache.getEntry(e,f).next(_=>{u=u.insert(f,_)}))).next(()=>this.populateOverlays(e,h,s)).next(()=>this.computeViews(e,u,h,Q())).next(f=>({batchId:c,changes:Kg(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new L(t)).next(r=>{let i=Gi();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,t,r,i){let s=t.collectionGroup,o=Gi();return this.indexManager.getCollectionParents(e,s).next(c=>A.forEach(c,u=>{let h=function(m,_){return new jr(_,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(t,u.child(s));return this.getDocumentsMatchingCollectionQuery(e,h,r,i).next(f=>{f.forEach((m,_)=>{o=o.insert(m,_)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,t,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(o=>(s=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,i))).next(o=>{s.forEach((u,h)=>{let f=h.getKey();o.get(f)===null&&(o=o.insert(f,Ie.newInvalidDocument(f)))});let c=Gi();return o.forEach((u,h)=>{let f=s.get(u);f!==void 0&&Zi(f.mutation,h,tt.empty(),oe.now()),Ts(t,h)&&(c=c.insert(u,h))}),c})}};var Zl=class{constructor(e){this.serializer=e,this.Br=new Map,this.Lr=new Map}getBundleMetadata(e,t){return A.resolve(this.Br.get(t))}saveBundleMetadata(e,t){return this.Br.set(t.id,function(i){return{id:i.id,version:i.version,createTime:Ve(i.createTime)}}(t)),A.resolve()}getNamedQuery(e,t){return A.resolve(this.Lr.get(t))}saveNamedQuery(e,t){return this.Lr.set(t.name,function(i){return{name:i.name,query:m_(i.bundledQuery),readTime:Ve(i.readTime)}}(t)),A.resolve()}};var eh=class{constructor(){this.overlays=new ae(L.comparator),this.kr=new Map}getOverlay(e,t){return A.resolve(this.overlays.get(t))}getOverlays(e,t){let r=lt();return A.forEach(t,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((i,s)=>{this.wt(e,t,s)}),A.resolve()}removeOverlaysForBatchId(e,t,r){let i=this.kr.get(r);return i!==void 0&&(i.forEach(s=>this.overlays=this.overlays.remove(s)),this.kr.delete(r)),A.resolve()}getOverlaysForCollection(e,t,r){let i=lt(),s=t.length+1,o=new L(t.child("")),c=this.overlays.getIteratorFrom(o);for(;c.hasNext();){let u=c.getNext().value,h=u.getKey();if(!t.isPrefixOf(h.path))break;h.path.length===s&&u.largestBatchId>r&&i.set(u.getKey(),u)}return A.resolve(i)}getOverlaysForCollectionGroup(e,t,r,i){let s=new ae((h,f)=>h-f),o=this.overlays.getIterator();for(;o.hasNext();){let h=o.getNext().value;if(h.getKey().getCollectionGroup()===t&&h.largestBatchId>r){let f=s.get(h.largestBatchId);f===null&&(f=lt(),s=s.insert(h.largestBatchId,f)),f.set(h.getKey(),h)}}let c=lt(),u=s.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((h,f)=>c.set(h,f)),!(c.size()>=i)););return A.resolve(c)}wt(e,t,r){let i=this.overlays.get(r.key);if(i!==null){let o=this.kr.get(i.largestBatchId).delete(r.key);this.kr.set(i.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new fs(t,r));let s=this.kr.get(t);s===void 0&&(s=Q(),this.kr.set(t,s)),this.kr.set(t,s.add(r.key))}};var th=class{constructor(){this.sessionToken=ge.EMPTY_BYTE_STRING}getSessionToken(e){return A.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,A.resolve()}};var gs=class{constructor(){this.qr=new ne(he.Qr),this.$r=new ne(he.Ur)}isEmpty(){return this.qr.isEmpty()}addReference(e,t){let r=new he(e,t);this.qr=this.qr.add(r),this.$r=this.$r.add(r)}Kr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Wr(new he(e,t))}Gr(e,t){e.forEach(r=>this.removeReference(r,t))}zr(e){let t=new L(new ee([])),r=new he(t,e),i=new he(t,e+1),s=[];return this.$r.forEachInRange([r,i],o=>{this.Wr(o),s.push(o.key)}),s}jr(){this.qr.forEach(e=>this.Wr(e))}Wr(e){this.qr=this.qr.delete(e),this.$r=this.$r.delete(e)}Jr(e){let t=new L(new ee([])),r=new he(t,e),i=new he(t,e+1),s=Q();return this.$r.forEachInRange([r,i],o=>{s=s.add(o.key)}),s}containsKey(e){let t=new he(e,0),r=this.qr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}},he=class{constructor(e,t){this.key=e,this.Hr=t}static Qr(e,t){return L.comparator(e.key,t.key)||W(e.Hr,t.Hr)}static Ur(e,t){return W(e.Hr,t.Hr)||L.comparator(e.key,t.key)}};var nh=class{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.er=1,this.Yr=new ne(he.Qr)}checkEmpty(e){return A.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,i){let s=this.er;this.er++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];let o=new ds(s,t,r,i);this.mutationQueue.push(o);for(let c of i)this.Yr=this.Yr.add(new he(c.key,s)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return A.resolve(o)}lookupMutationBatch(e,t){return A.resolve(this.Zr(t))}getNextMutationBatchAfterBatchId(e,t){let r=t+1,i=this.Xr(r),s=i<0?0:i;return A.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return A.resolve(this.mutationQueue.length===0?Un:this.er-1)}getAllMutationBatches(e){return A.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){let r=new he(t,0),i=new he(t,Number.POSITIVE_INFINITY),s=[];return this.Yr.forEachInRange([r,i],o=>{let c=this.Zr(o.Hr);s.push(c)}),A.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ne(W);return t.forEach(i=>{let s=new he(i,0),o=new he(i,Number.POSITIVE_INFINITY);this.Yr.forEachInRange([s,o],c=>{r=r.add(c.Hr)})}),A.resolve(this.ei(r))}getAllMutationBatchesAffectingQuery(e,t){let r=t.path,i=r.length+1,s=r;L.isDocumentKey(s)||(s=s.child(""));let o=new he(new L(s),0),c=new ne(W);return this.Yr.forEachWhile(u=>{let h=u.key.path;return!!r.isPrefixOf(h)&&(h.length===i&&(c=c.add(u.Hr)),!0)},o),A.resolve(this.ei(c))}ei(e){let t=[];return e.forEach(r=>{let i=this.Zr(r);i!==null&&t.push(i)}),t}removeMutationBatch(e,t){j(this.ti(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Yr;return A.forEach(t.mutations,i=>{let s=new he(i.key,t.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.Yr=r})}rr(e){}containsKey(e,t){let r=new he(t,0),i=this.Yr.firstAfterOrEqual(r);return A.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,A.resolve()}ti(e,t){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){let t=this.Xr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}};var rh=class{constructor(e){this.ni=e,this.docs=function(){return new ae(L.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){let r=t.key,i=this.docs.get(r),s=i?i.size:0,o=this.ni(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:o}),this.size+=o-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){let t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){let r=this.docs.get(t);return A.resolve(r?r.document.mutableCopy():Ie.newInvalidDocument(t))}getEntries(e,t){let r=ze();return t.forEach(i=>{let s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():Ie.newInvalidDocument(i))}),A.resolve(r)}getDocumentsMatchingQuery(e,t,r,i){let s=ze(),o=t.path,c=new L(o.child("__id-9223372036854775808__")),u=this.docs.getIteratorFrom(c);for(;u.hasNext();){let{key:h,value:{document:f}}=u.getNext();if(!o.isPrefixOf(h.path))break;h.path.length>o.length+1||Hh(_g(f),r)<=0||(i.has(f.key)||Ts(t,f))&&(s=s.insert(f.key,f.mutableCopy()))}return A.resolve(s)}getAllFromCollectionGroup(e,t,r,i){F(9500)}ri(e,t){return A.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new ih(this)}getSize(e){return A.resolve(this.size)}},ih=class extends Aa{constructor(e){super(),this.Or=e}applyChanges(e){let t=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?t.push(this.Or.addEntry(e,i)):this.Or.removeEntry(r)}),A.waitFor(t)}getFromCache(e,t){return this.Or.getEntry(e,t)}getAllFromCache(e,t){return this.Or.getEntries(e,t)}};var sh=class{constructor(e){this.persistence=e,this.ii=new nt(t=>$n(t),Es),this.lastRemoteSnapshotVersion=G.min(),this.highestTargetId=0,this.si=0,this.oi=new gs,this.targetCount=0,this._i=Hr.ar()}forEachTarget(e,t){return this.ii.forEach((r,i)=>t(i)),A.resolve()}getLastRemoteSnapshotVersion(e){return A.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return A.resolve(this.si)}allocateTargetId(e){return this.highestTargetId=this._i.next(),A.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.si&&(this.si=t),A.resolve()}hr(e){this.ii.set(e.target,e);let t=e.targetId;t>this.highestTargetId&&(this._i=new Hr(t),this.highestTargetId=t),e.sequenceNumber>this.si&&(this.si=e.sequenceNumber)}addTargetData(e,t){return this.hr(t),this.targetCount+=1,A.resolve()}updateTargetData(e,t){return this.hr(t),A.resolve()}removeTargetData(e,t){return this.ii.delete(t.target),this.oi.zr(t.targetId),this.targetCount-=1,A.resolve()}removeTargets(e,t,r){let i=0,s=[];return this.ii.forEach((o,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.ii.delete(o),s.push(this.removeMatchingKeysForTargetId(e,c.targetId)),i++)}),A.waitFor(s).next(()=>i)}getTargetCount(e){return A.resolve(this.targetCount)}getTargetData(e,t){let r=this.ii.get(t)||null;return A.resolve(r)}addMatchingKeys(e,t,r){return this.oi.Kr(t,r),A.resolve()}removeMatchingKeys(e,t,r){this.oi.Gr(t,r);let i=this.persistence.referenceDelegate,s=[];return i&&t.forEach(o=>{s.push(i.markPotentiallyOrphaned(e,o))}),A.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.oi.zr(t),A.resolve()}getMatchingKeysForTargetId(e,t){let r=this.oi.Jr(t);return A.resolve(r)}containsKey(e,t){return A.resolve(this.oi.containsKey(t))}};var _s=class{constructor(e,t){this.ai={},this.overlays={},this.ui=new Me(0),this.ci=!1,this.ci=!0,this.li=new th,this.referenceDelegate=e(this),this.hi=new sh(this),this.indexManager=new $l,this.remoteDocumentCache=function(i){return new rh(i)}(r=>this.referenceDelegate.Pi(r)),this.serializer=new _a(t),this.Ti=new Zl(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ci=!1,Promise.resolve()}get started(){return this.ci}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new eh,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.ai[e.toKey()];return r||(r=new nh(t,this.referenceDelegate),this.ai[e.toKey()]=r),r}getGlobalsCache(){return this.li}getTargetCache(){return this.hi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ti}runTransaction(e,t,r){D("MemoryPersistence","Starting transaction:",e);let i=new oh(this.ui.next());return this.referenceDelegate.Ii(),r(i).next(s=>this.referenceDelegate.di(i).next(()=>s)).toPromise().then(s=>(i.raiseOnCommittedEvent(),s))}Ei(e,t){return A.or(Object.values(this.ai).map(r=>()=>r.containsKey(e,t)))}},oh=class extends Xo{constructor(e){super(),this.currentSequenceNumber=e}},Ra=class n{constructor(e){this.persistence=e,this.Ai=new gs,this.Ri=null}static Vi(e){return new n(e)}get mi(){if(this.Ri)return this.Ri;throw F(60996)}addReference(e,t,r){return this.Ai.addReference(r,t),this.mi.delete(r.toString()),A.resolve()}removeReference(e,t,r){return this.Ai.removeReference(r,t),this.mi.add(r.toString()),A.resolve()}markPotentiallyOrphaned(e,t){return this.mi.add(t.toString()),A.resolve()}removeTarget(e,t){this.Ai.zr(t.targetId).forEach(i=>this.mi.add(i.toString()));let r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(i=>{i.forEach(s=>this.mi.add(s.toString()))}).next(()=>r.removeTargetData(e,t))}Ii(){this.Ri=new Set}di(e){let t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return A.forEach(this.mi,r=>{let i=L.fromPath(r);return this.fi(e,i).next(s=>{s||t.removeEntry(i,G.min())})}).next(()=>(this.Ri=null,t.apply(e)))}updateLimboDocument(e,t){return this.fi(e,t).next(r=>{r?this.mi.delete(t.toString()):this.mi.add(t.toString())})}Pi(e){return 0}fi(e,t){return A.or([()=>A.resolve(this.Ai.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ei(e,t)])}},Pa=class n{constructor(e,t){this.persistence=e,this.gi=new nt(r=>Pe(r.path),(r,i)=>r.isEqual(i)),this.garbageCollector=T_(this,t)}static Vi(e,t){return new n(e,t)}Ii(){}di(e){return A.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}mr(e){let t=this.yr(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>t.next(i=>r+i))}yr(e){let t=0;return this.gr(e,r=>{t++}).next(()=>t)}gr(e,t){return A.forEach(this.gi,(r,i)=>this.Sr(e,r,i).next(s=>s?A.resolve():t(i)))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0,i=this.persistence.getRemoteDocumentCache(),s=i.newChangeBuffer();return i.ri(e,o=>this.Sr(e,o,t).next(c=>{c||(r++,s.removeEntry(o,G.min()))})).next(()=>s.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,t){return this.gi.set(t,e.currentSequenceNumber),A.resolve()}removeTarget(e,t){let r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.gi.set(r,e.currentSequenceNumber),A.resolve()}removeReference(e,t,r){return this.gi.set(r,e.currentSequenceNumber),A.resolve()}updateLimboDocument(e,t){return this.gi.set(t,e.currentSequenceNumber),A.resolve()}Pi(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=$o(e.data.value)),t}Sr(e,t,r){return A.or([()=>this.persistence.Ei(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{let i=this.gi.get(t);return A.resolve(i!==void 0&&i>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}};var ah=class{constructor(e){this.serializer=e}q(e,t,r,i){let s=new Zo("createOrUpgrade",t);r<1&&i>=1&&(function(u){u.createObjectStore(ws)}(e),function(u){u.createObjectStore(is,{keyPath:uE}),u.createObjectStore(et,{keyPath:cm,autoIncrement:!0}).createIndex(Vn,um,{unique:!0}),u.createObjectStore(Or)}(e),Ym(e),function(u){u.createObjectStore(Cn)}(e));let o=A.resolve();return r<3&&i>=3&&(r!==0&&(function(u){u.deleteObjectStore(xr),u.deleteObjectStore(Vr),u.deleteObjectStore(Bn)}(e),Ym(e)),o=o.next(()=>function(u){let h=u.store(Bn),f={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:G.min().toTimestamp(),targetCount:0};return h.put(na,f)}(s))),r<4&&i>=4&&(r!==0&&(o=o.next(()=>function(u,h){return h.store(et).j().next(m=>{u.deleteObjectStore(et),u.createObjectStore(et,{keyPath:cm,autoIncrement:!0}).createIndex(Vn,um,{unique:!0});let _=h.store(et),S=m.map(C=>_.put(C));return A.waitFor(S)})}(e,s))),o=o.next(()=>{(function(u){u.createObjectStore(Lr,{keyPath:yE})})(e)})),r<5&&i>=5&&(o=o.next(()=>this.pi(s))),r<6&&i>=6&&(o=o.next(()=>(function(u){u.createObjectStore(ss)}(e),this.yi(s)))),r<7&&i>=7&&(o=o.next(()=>this.wi(s))),r<8&&i>=8&&(o=o.next(()=>this.Si(e,s))),r<9&&i>=9&&(o=o.next(()=>{(function(u){u.objectStoreNames.contains("remoteDocumentChanges")&&u.deleteObjectStore("remoteDocumentChanges")})(e)})),r<10&&i>=10&&(o=o.next(()=>this.bi(s))),r<11&&i>=11&&(o=o.next(()=>{(function(u){u.createObjectStore(Ka,{keyPath:vE})})(e),function(u){u.createObjectStore(Ha,{keyPath:IE})}(e)})),r<12&&i>=12&&(o=o.next(()=>{(function(u){let h=u.createObjectStore(Qa,{keyPath:RE});h.createIndex(hl,PE,{unique:!1}),h.createIndex(Ag,CE,{unique:!1})})(e)})),r<13&&i>=13&&(o=o.next(()=>function(u){let h=u.createObjectStore(ta,{keyPath:hE});h.createIndex(jo,dE),h.createIndex(wg,fE)}(e)).next(()=>this.Di(e,s)).next(()=>e.deleteObjectStore(Cn))),r<14&&i>=14&&(o=o.next(()=>this.Ci(e,s))),r<15&&i>=15&&(o=o.next(()=>function(u){u.createObjectStore(Jh,{keyPath:wE,autoIncrement:!0}).createIndex(ll,EE,{unique:!1}),u.createObjectStore(Hi,{keyPath:TE}).createIndex(Tg,bE,{unique:!1}),u.createObjectStore(Qi,{keyPath:AE}).createIndex(bg,SE,{unique:!1})}(e))),r<16&&i>=16&&(o=o.next(()=>{t.objectStore(Hi).clear()}).next(()=>{t.objectStore(Qi).clear()})),r<17&&i>=17&&(o=o.next(()=>{(function(u){u.createObjectStore(Xh,{keyPath:kE})})(e)})),r<18&&i>=18&&Fc()&&(o=o.next(()=>{t.objectStore(Hi).clear()}).next(()=>{t.objectStore(Qi).clear()})),o}yi(e){let t=0;return e.store(Cn).X((r,i)=>{t+=Ea(i)}).next(()=>{let r={byteSize:t};return e.store(ss).put(ul,r)})}pi(e){let t=e.store(is),r=e.store(et);return t.j().next(i=>A.forEach(i,s=>{let o=IDBKeyRange.bound([s.userId,Un],[s.userId,s.lastAcknowledgedBatchId]);return r.j(Vn,o).next(c=>A.forEach(c,u=>{j(u.userId===s.userId,18650,"Cannot process batch from unexpected user",{batchId:u.batchId});let h=Dn(this.serializer,u);return v_(e,s.userId,h).next(()=>{})}))}))}wi(e){let t=e.store(xr),r=e.store(Cn);return e.store(Bn).get(na).next(i=>{let s=[];return r.X((o,c)=>{let u=new ee(o),h=function(m){return[0,Pe(m)]}(u);s.push(t.get(h).next(f=>f?A.resolve():(m=>t.put({targetId:0,path:Pe(m),sequenceNumber:i.highestListenSequenceNumber}))(u)))}).next(()=>A.waitFor(s))})}Si(e,t){e.createObjectStore(os,{keyPath:_E});let r=t.store(os),i=new ms,s=o=>{if(i.add(o)){let c=o.lastSegment(),u=o.popLast();return r.put({collectionId:c,parent:Pe(u)})}};return t.store(Cn).X({Z:!0},(o,c)=>{let u=new ee(o);return s(u.popLast())}).next(()=>t.store(Or).X({Z:!0},([o,c,u],h)=>{let f=ut(c);return s(f.popLast())}))}bi(e){let t=e.store(Vr);return t.X((r,i)=>{let s=Wi(i),o=p_(this.serializer,s);return t.put(o)})}Di(e,t){let r=t.store(Cn),i=[];return r.X((s,o)=>{let c=t.store(ta),u=function(m){return m.document?new L(ee.fromString(m.document.name).popFirst(5)):m.noDocument?L.fromSegments(m.noDocument.path):m.unknownDocument?L.fromSegments(m.unknownDocument.path):F(36783)}(o).path.toArray(),h={prefixPath:u.slice(0,u.length-2),collectionGroup:u[u.length-2],documentId:u[u.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};i.push(c.put(h))}).next(()=>A.waitFor(i))}Ci(e,t){let r=t.store(et),i=b_(this.serializer),s=new _s(Ra.Vi,this.serializer.gt);return r.j().next(o=>{let c=new Map;return o.forEach(u=>{var h;let f=(h=c.get(u.userId))!==null&&h!==void 0?h:Q();Dn(this.serializer,u).keys().forEach(m=>f=f.add(m)),c.set(u.userId,f)}),A.forEach(c,(u,h)=>{let f=new pe(h),m=va.yt(this.serializer,f),_=s.getIndexManager(f),S=Ta.yt(f,this.serializer,_,s.referenceDelegate);return new Sa(i,S,m,_).recalculateAndSaveOverlaysForDocumentKeys(new as(t,Me.ue),u).next()})})}};function Ym(n){n.createObjectStore(xr,{keyPath:mE}).createIndex(Yh,gE,{unique:!0}),n.createObjectStore(Vr,{keyPath:"targetId"}).createIndex(Eg,pE,{unique:!0}),n.createObjectStore(Bn)}var Kt="IndexedDbPersistence",Wu=18e5,Ku=5e3,Hu="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",_T="main",ch=class n{constructor(e,t,r,i,s,o,c,u,h,f,m=18){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=r,this.Fi=s,this.window=o,this.document=c,this.Mi=h,this.xi=f,this.Oi=m,this.ui=null,this.ci=!1,this.isPrimary=!1,this.networkEnabled=!0,this.Ni=null,this.inForeground=!1,this.Bi=null,this.Li=null,this.ki=Number.NEGATIVE_INFINITY,this.qi=_=>Promise.resolve(),!n.C())throw new x(P.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new Ql(this,i),this.Qi=t+_T,this.serializer=new _a(u),this.$i=new Nr(this.Qi,this.Oi,new ah(this.serializer)),this.li=new Ml,this.hi=new Wl(this.referenceDelegate,this.serializer),this.remoteDocumentCache=b_(this.serializer),this.Ti=new Ll,this.window&&this.window.localStorage?this.Ui=this.window.localStorage:(this.Ui=null,f===!1&&Oe(Kt,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.Ki().then(()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new x(P.FAILED_PRECONDITION,Hu);return this.Wi(),this.Gi(),this.zi(),this.runTransaction("getHighestListenSequenceNumber","readonly",e=>this.hi.getHighestSequenceNumber(e))}).then(e=>{this.ui=new Me(e,this.Mi)}).then(()=>{this.ci=!0}).catch(e=>(this.$i&&this.$i.close(),Promise.reject(e)))}ji(e){return this.qi=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.$i.setDatabaseDeletedListener(e)}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.Fi.enqueueAndForget(async()=>{this.started&&await this.Ki()}))}Ki(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",e=>Uo(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next(()=>{if(this.isPrimary)return this.Ji(e).next(t=>{t||(this.isPrimary=!1,this.Fi.enqueueRetryable(()=>this.qi(!1)))})}).next(()=>this.Hi(e)).next(t=>this.isPrimary&&!t?this.Yi(e).next(()=>!1):!!t&&this.Zi(e).next(()=>!0))).catch(e=>{if(ln(e))return D(Kt,"Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return D(Kt,"Releasing owner lease after error during lease refresh",e),!1}).then(e=>{this.isPrimary!==e&&this.Fi.enqueueRetryable(()=>this.qi(e)),this.isPrimary=e})}Ji(e){return $i(e).get(pr).next(t=>A.resolve(this.Xi(t)))}es(e){return Uo(e).delete(this.clientId)}async ts(){if(this.isPrimary&&!this.ns(this.ki,Wu)){this.ki=Date.now();let e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",t=>{let r=_e(t,Lr);return r.j().next(i=>{let s=this.rs(i,Wu),o=i.filter(c=>s.indexOf(c)===-1);return A.forEach(o,c=>r.delete(c.clientId)).next(()=>o)})}).catch(()=>[]);if(this.Ui)for(let t of e)this.Ui.removeItem(this.ss(t.clientId))}}zi(){this.Li=this.Fi.enqueueAfterDelay("client_metadata_refresh",4e3,()=>this.Ki().then(()=>this.ts()).then(()=>this.zi()))}Xi(e){return!!e&&e.ownerId===this.clientId}Hi(e){return this.xi?A.resolve(!0):$i(e).get(pr).next(t=>{if(t!==null&&this.ns(t.leaseTimestampMs,Ku)&&!this._s(t.ownerId)){if(this.Xi(t)&&this.networkEnabled)return!0;if(!this.Xi(t)){if(!t.allowTabSynchronization)throw new x(P.FAILED_PRECONDITION,Hu);return!1}}return!(!this.networkEnabled||!this.inForeground)||Uo(e).j().next(r=>this.rs(r,Ku).find(i=>{if(this.clientId!==i.clientId){let s=!this.networkEnabled&&i.networkEnabled,o=!this.inForeground&&i.inForeground,c=this.networkEnabled===i.networkEnabled;if(s||o&&c)return!0}return!1})===void 0)}).next(t=>(this.isPrimary!==t&&D(Kt,`Client ${t?"is":"is not"} eligible for a primary lease.`),t))}async shutdown(){this.ci=!1,this.us(),this.Li&&(this.Li.cancel(),this.Li=null),this.cs(),this.ls(),await this.$i.runTransaction("shutdown","readwrite",[ws,Lr],e=>{let t=new as(e,Me.ue);return this.Yi(t).next(()=>this.es(t))}),this.$i.close(),this.hs()}rs(e,t){return e.filter(r=>this.ns(r.updateTimeMs,t)&&!this._s(r.clientId))}Ps(){return this.runTransaction("getActiveClients","readonly",e=>Uo(e).j().next(t=>this.rs(t,Wu).map(r=>r.clientId)))}get started(){return this.ci}getGlobalsCache(){return this.li}getMutationQueue(e,t){return Ta.yt(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.hi}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new Gl(e,this.serializer.gt.databaseId)}getDocumentOverlayCache(e){return va.yt(this.serializer,e)}getBundleCache(){return this.Ti}runTransaction(e,t,r){D(Kt,"Starting transaction:",e);let i=t==="readonly"?"readonly":"readwrite",s=function(u){return u===18?OE:u===17?Cg:u===16?NE:u===15?Zh:u===14?Pg:u===13?Rg:u===12?DE:u===11?Sg:void F(60245)}(this.Oi),o;return this.$i.runTransaction(e,i,s,c=>(o=new as(c,this.ui?this.ui.next():Me.ue),t==="readwrite-primary"?this.Ji(o).next(u=>!!u||this.Hi(o)).next(u=>{if(!u)throw Oe(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.Fi.enqueueRetryable(()=>this.qi(!1)),new x(P.FAILED_PRECONDITION,yg);return r(o)}).next(u=>this.Zi(o).next(()=>u)):this.Ts(o).next(()=>r(o)))).then(c=>(o.raiseOnCommittedEvent(),c))}Ts(e){return $i(e).get(pr).next(t=>{if(t!==null&&this.ns(t.leaseTimestampMs,Ku)&&!this._s(t.ownerId)&&!this.Xi(t)&&!(this.xi||this.allowTabSynchronization&&t.allowTabSynchronization))throw new x(P.FAILED_PRECONDITION,Hu)})}Zi(e){let t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return $i(e).put(pr,t)}static C(){return Nr.C()}Yi(e){let t=$i(e);return t.get(pr).next(r=>this.Xi(r)?(D(Kt,"Releasing primary lease."),t.delete(pr)):A.resolve())}ns(e,t){let r=Date.now();return!(e<r-t)&&(!(e>r)||(Oe(`Detected an update time that is in the future: ${e} > ${r}`),!1))}Wi(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.Bi=()=>{this.Fi.enqueueAndForget(()=>(this.inForeground=this.document.visibilityState==="visible",this.Ki()))},this.document.addEventListener("visibilitychange",this.Bi),this.inForeground=this.document.visibilityState==="visible")}cs(){this.Bi&&(this.document.removeEventListener("visibilitychange",this.Bi),this.Bi=null)}Gi(){var e;typeof((e=this.window)===null||e===void 0?void 0:e.addEventListener)=="function"&&(this.Ni=()=>{this.us();let t=/(?:Version|Mobile)\/1[456]/;Mc()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.Fi.enterRestrictedMode(!0),this.Fi.enqueueAndForget(()=>this.shutdown())},this.window.addEventListener("pagehide",this.Ni))}ls(){this.Ni&&(this.window.removeEventListener("pagehide",this.Ni),this.Ni=null)}_s(e){var t;try{let r=((t=this.Ui)===null||t===void 0?void 0:t.getItem(this.ss(e)))!==null;return D(Kt,`Client '${e}' ${r?"is":"is not"} zombied in LocalStorage`),r}catch(r){return Oe(Kt,"Failed to get zombied client id.",r),!1}}us(){if(this.Ui)try{this.Ui.setItem(this.ss(this.clientId),String(Date.now()))}catch(e){Oe("Failed to set zombie client id.",e)}}hs(){if(this.Ui)try{this.Ui.removeItem(this.ss(this.clientId))}catch{}}ss(e){return`firestore_zombie_${this.persistenceKey}_${e}`}};function $i(n){return _e(n,ws)}function Uo(n){return _e(n,Lr)}function yT(n,e){let t=n.projectId;return n.isDefaultDatabase||(t+="."+n.database),"firestore/"+e+"/"+t+"/"}var uh=class n{constructor(e,t,r,i){this.targetId=e,this.fromCache=t,this.Is=r,this.ds=i}static Es(e,t){let r=Q(),i=Q();for(let s of t.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new n(e,t.fromCache,r,i)}};var lh=class{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}};var Ca=class{constructor(){this.As=!1,this.Rs=!1,this.Vs=100,this.fs=function(){return Mc()?8:vg(ue())>0?6:4}()}initialize(e,t){this.gs=e,this.indexManager=t,this.As=!0}getDocumentsMatchingQuery(e,t,r,i){let s={result:null};return this.ps(e,t).next(o=>{s.result=o}).next(()=>{if(!s.result)return this.ys(e,t,i,r).next(o=>{s.result=o})}).next(()=>{if(s.result)return;let o=new lh;return this.ws(e,t,o).next(c=>{if(s.result=c,this.Rs)return this.Ss(e,t,o,c.size)})}).next(()=>s.result)}Ss(e,t,r,i){return r.documentReadCount<this.Vs?(Ir()<=Y.DEBUG&&D("QueryEngine","SDK will not create cache indexes for query:",wr(t),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),A.resolve()):(Ir()<=Y.DEBUG&&D("QueryEngine","Query:",wr(t),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.fs*i?(Ir()<=Y.DEBUG&&D("QueryEngine","The SDK decides to create cache indexes for query:",wr(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Qe(t))):A.resolve())}ps(e,t){if(wm(t))return A.resolve(null);let r=Qe(t);return this.indexManager.getIndexType(e,r).next(i=>i===0?null:(t.limit!==null&&i===1&&(t=Al(t,null,"F"),r=Qe(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(s=>{let o=Q(...s);return this.gs.getDocuments(e,o).next(c=>this.indexManager.getMinOffset(e,r).next(u=>{let h=this.bs(t,c);return this.Ds(t,h,o,u.readTime)?this.ps(e,Al(t,null,"F")):this.vs(e,h,t,u)}))})))}ys(e,t,r,i){return wm(t)||i.isEqual(G.min())?A.resolve(null):this.gs.getDocuments(e,r).next(s=>{let o=this.bs(t,s);return this.Ds(t,o,r,i)?A.resolve(null):(Ir()<=Y.DEBUG&&D("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),wr(t)),this.vs(e,o,t,oE(i,ts)).next(c=>c))})}bs(e,t){let r=new ne(Gg(e));return t.forEach((i,s)=>{Ts(e,s)&&(r=r.add(s))}),r}Ds(e,t,r,i){if(e.limit===null)return!1;if(r.size!==t.size)return!0;let s=e.limitType==="F"?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}ws(e,t,r){return Ir()<=Y.DEBUG&&D("QueryEngine","Using full collection scan to execute query:",wr(t)),this.gs.getDocumentsMatchingQuery(e,t,Ye.min(),r)}vs(e,t,r,i){return this.gs.getDocumentsMatchingQuery(e,r,i).next(s=>(t.forEach(o=>{s=s.insert(o.key,o)}),s))}};var cd="LocalStore",vT=3e8,hh=class{constructor(e,t,r,i){this.persistence=e,this.Cs=t,this.serializer=i,this.Fs=new ae(W),this.Ms=new nt(s=>$n(s),Es),this.xs=new Map,this.Os=e.getRemoteDocumentCache(),this.hi=e.getTargetCache(),this.Ti=e.getBundleCache(),this.Ns(r)}Ns(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Sa(this.Os,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Os.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.Fs))}};function A_(n,e,t,r){return new hh(n,e,t,r)}async function S_(n,e){let t=K(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let i;return t.mutationQueue.getAllMutationBatches(r).next(s=>(i=s,t.Ns(e),t.mutationQueue.getAllMutationBatches(r))).next(s=>{let o=[],c=[],u=Q();for(let h of i){o.push(h.batchId);for(let f of h.mutations)u=u.add(f.key)}for(let h of s){c.push(h.batchId);for(let f of h.mutations)u=u.add(f.key)}return t.localDocuments.getDocuments(r,u).next(h=>({Bs:h,removedBatchIds:o,addedBatchIds:c}))})})}function IT(n,e){let t=K(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{let i=e.batch.keys(),s=t.Os.newChangeBuffer({trackRemovals:!0});return function(c,u,h,f){let m=h.batch,_=m.keys(),S=A.resolve();return _.forEach(C=>{S=S.next(()=>f.getEntry(u,C)).next(N=>{let k=h.docVersions.get(C);j(k!==null,48541),N.version.compareTo(k)<0&&(m.applyToRemoteDocument(N,h),N.isValidDocument()&&(N.setReadTime(h.commitVersion),f.addEntry(N)))})}),S.next(()=>c.mutationQueue.removeMutationBatch(u,m))}(t,r,e,s).next(()=>s.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(c){let u=Q();for(let h=0;h<c.mutationResults.length;++h)c.mutationResults[h].transformResults.length>0&&(u=u.add(c.batch.mutations[h].key));return u}(e))).next(()=>t.localDocuments.getDocuments(r,i))})}function R_(n){let e=K(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.hi.getLastRemoteSnapshotVersion(t))}function wT(n,e){let t=K(n),r=e.snapshotVersion,i=t.Fs;return t.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{let o=t.Os.newChangeBuffer({trackRemovals:!0});i=t.Fs;let c=[];e.targetChanges.forEach((f,m)=>{let _=i.get(m);if(!_)return;c.push(t.hi.removeMatchingKeys(s,f.removedDocuments,m).next(()=>t.hi.addMatchingKeys(s,f.addedDocuments,m)));let S=_.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(m)!==null?S=S.withResumeToken(ge.EMPTY_BYTE_STRING,G.min()).withLastLimboFreeSnapshotVersion(G.min()):f.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(f.resumeToken,r)),i=i.insert(m,S),function(N,k,$){return N.resumeToken.approximateByteSize()===0||k.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=vT?!0:$.addedDocuments.size+$.modifiedDocuments.size+$.removedDocuments.size>0}(_,S,f)&&c.push(t.hi.updateTargetData(s,S))});let u=ze(),h=Q();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(s,f))}),c.push(ET(s,o,e.documentUpdates).next(f=>{u=f.Ls,h=f.ks})),!r.isEqual(G.min())){let f=t.hi.getLastRemoteSnapshotVersion(s).next(m=>t.hi.setTargetsMetadata(s,s.currentSequenceNumber,r));c.push(f)}return A.waitFor(c).next(()=>o.apply(s)).next(()=>t.localDocuments.getLocalViewOfDocuments(s,u,h)).next(()=>u)}).then(s=>(t.Fs=i,s))}function ET(n,e,t){let r=Q(),i=Q();return t.forEach(s=>r=r.add(s)),e.getEntries(n,r).next(s=>{let o=ze();return t.forEach((c,u)=>{let h=s.get(c);u.isFoundDocument()!==h.isFoundDocument()&&(i=i.add(c)),u.isNoDocument()&&u.version.isEqual(G.min())?(e.removeEntry(c,u.readTime),o=o.insert(c,u)):!h.isValidDocument()||u.version.compareTo(h.version)>0||u.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(u),o=o.insert(c,u)):D(cd,"Ignoring outdated watch update for ",c,". Current version:",h.version," Watch version:",u.version)}),{Ls:o,ks:i}})}function TT(n,e){let t=K(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=Un),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function bT(n,e){let t=K(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return t.hi.getTargetData(r,e).next(s=>s?(i=s,A.resolve(i)):t.hi.allocateTargetId(r).next(o=>(i=new Kr(e,o,"TargetPurposeListen",r.currentSequenceNumber),t.hi.addTargetData(r,i).next(()=>i))))}).then(r=>{let i=t.Fs.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(t.Fs=t.Fs.insert(r.targetId,r),t.Ms.set(e,r.targetId)),r})}async function dh(n,e,t){let r=K(n),i=r.Fs.get(e),s=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",s,o=>r.persistence.referenceDelegate.removeTarget(o,i))}catch(o){if(!ln(o))throw o;D(cd,`Failed to update sequence numbers for target ${e}: ${o}`)}r.Fs=r.Fs.remove(e),r.Ms.delete(i.target)}function Jm(n,e,t){let r=K(n),i=G.min(),s=Q();return r.persistence.runTransaction("Execute query","readwrite",o=>function(u,h,f){let m=K(u),_=m.Ms.get(f);return _!==void 0?A.resolve(m.Fs.get(_)):m.hi.getTargetData(h,f)}(r,o,Qe(e)).next(c=>{if(c)return i=c.lastLimboFreeSnapshotVersion,r.hi.getMatchingKeysForTargetId(o,c.targetId).next(u=>{s=u})}).next(()=>r.Cs.getDocumentsMatchingQuery(o,e,t?i:G.min(),t?s:Q())).next(c=>(AT(r,qE(e),c),{documents:c,qs:s})))}function AT(n,e,t){let r=n.xs.get(e)||G.min();t.forEach((i,s)=>{s.readTime.compareTo(r)>0&&(r=s.readTime)}),n.xs.set(e,r)}var ka=class{constructor(){this.activeTargetIds=KE()}Gs(e){this.activeTargetIds=this.activeTargetIds.add(e)}zs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){let e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}};var Da=class{constructor(){this.Fo=new ka,this.Mo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.Fo.Gs(e),this.Mo[e]||"not-current"}updateQueryState(e,t,r){this.Mo[e]=t}removeLocalQueryTarget(e){this.Fo.zs(e)}isLocalQueryTarget(e){return this.Fo.activeTargetIds.has(e)}clearQueryState(e){delete this.Mo[e]}getAllActiveQueryTargets(){return this.Fo.activeTargetIds}isActiveQueryTarget(e){return this.Fo.activeTargetIds.has(e)}start(){return this.Fo=new ka,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}};var fh=class{xo(e){}shutdown(){}};var Xm="ConnectivityMonitor",Na=class{constructor(){this.Oo=()=>this.No(),this.Bo=()=>this.Lo(),this.ko=[],this.qo()}xo(e){this.ko.push(e)}shutdown(){window.removeEventListener("online",this.Oo),window.removeEventListener("offline",this.Bo)}qo(){window.addEventListener("online",this.Oo),window.addEventListener("offline",this.Bo)}No(){D(Xm,"Network connectivity changed: AVAILABLE");for(let e of this.ko)e(0)}Lo(){D(Xm,"Network connectivity changed: UNAVAILABLE");for(let e of this.ko)e(1)}static C(){return typeof window!="undefined"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}};var Bo=null;function ph(){return Bo===null?Bo=function(){return 268435456+Math.round(2147483648*Math.random())}():Bo++,"0x"+Bo.toString(16)}var Qu="RestConnection",ST={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"},mh=class{get Qo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;let t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.$o=t+"://"+e.host,this.Uo=`projects/${r}/databases/${i}`,this.Ko=this.databaseId.database===us?`project_id=${r}`:`project_id=${r}&database_id=${i}`}Wo(e,t,r,i,s){let o=ph(),c=this.Go(e,t.toUriEncodedString());D(Qu,`Sending RPC '${e}' ${o}:`,c,r);let u={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.Ko};this.zo(u,i,s);let{host:h}=new URL(c),f=Mt(h);return this.jo(e,c,u,r,f).then(m=>(D(Qu,`Received RPC '${e}' ${o}: `,m),m),m=>{throw St(Qu,`RPC '${e}' ${o} failed with error: `,m,"url: ",c,"request:",r),m})}Jo(e,t,r,i,s,o){return this.Wo(e,t,r,i,s)}zo(e,t,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Xr}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((i,s)=>e[s]=i),r&&r.headers.forEach((i,s)=>e[s]=i)}Go(e,t){let r=ST[e];return`${this.$o}/v1/${t}:${r}`}terminate(){}};var gh=class{constructor(e){this.Ho=e.Ho,this.Yo=e.Yo}Zo(e){this.Xo=e}e_(e){this.t_=e}n_(e){this.r_=e}onMessage(e){this.i_=e}close(){this.Yo()}send(e){this.Ho(e)}s_(){this.Xo()}o_(){this.t_()}__(e){this.r_(e)}a_(e){this.i_(e)}};var Re="WebChannelConnection",_h=class extends mh{constructor(e){super(e),this.u_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}jo(e,t,r,i,s){let o=ph();return new Promise((c,u)=>{let h=new Bu;h.setWithCredentials(!0),h.listenOnce(qu.COMPLETE,()=>{try{switch(h.getLastErrorCode()){case Bi.NO_ERROR:let m=h.getResponseJson();D(Re,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(m)),c(m);break;case Bi.TIMEOUT:D(Re,`RPC '${e}' ${o} timed out`),u(new x(P.DEADLINE_EXCEEDED,"Request time out"));break;case Bi.HTTP_ERROR:let _=h.getStatus();if(D(Re,`RPC '${e}' ${o} failed with status:`,_,"response text:",h.getResponseText()),_>0){let S=h.getResponseJson();Array.isArray(S)&&(S=S[0]);let C=S==null?void 0:S.error;if(C&&C.status&&C.message){let N=function($){let B=$.toLowerCase().replace(/_/g,"-");return Object.values(P).indexOf(B)>=0?B:P.UNKNOWN}(C.status);u(new x(N,C.message))}else u(new x(P.UNKNOWN,"Server responded with status "+h.getStatus()))}else u(new x(P.UNAVAILABLE,"Connection failed."));break;default:F(9055,{c_:e,streamId:o,l_:h.getLastErrorCode(),h_:h.getLastError()})}}finally{D(Re,`RPC '${e}' ${o} completed.`)}});let f=JSON.stringify(i);D(Re,`RPC '${e}' ${o} sending request:`,i),h.send(t,"POST",f,r,15)})}P_(e,t,r){let i=ph(),s=[this.$o,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=$u(),c=zu(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(u.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(u.useFetchStreams=!0),this.zo(u.initMessageHeaders,t,r),u.encodeInitMessageHeaders=!0;let f=s.join("");D(Re,`Creating RPC '${e}' stream ${i}: ${f}`,u);let m=o.createWebChannel(f,u);this.T_(m);let _=!1,S=!1,C=new gh({Ho:k=>{S?D(Re,`Not sending because RPC '${e}' stream ${i} is closed:`,k):(_||(D(Re,`Opening RPC '${e}' stream ${i} transport.`),m.open(),_=!0),D(Re,`RPC '${e}' stream ${i} sending:`,k),m.send(k))},Yo:()=>m.close()}),N=(k,$,B)=>{k.listen($,M=>{try{B(M)}catch(H){setTimeout(()=>{throw H},0)}})};return N(m,fr.EventType.OPEN,()=>{S||(D(Re,`RPC '${e}' stream ${i} transport opened.`),C.s_())}),N(m,fr.EventType.CLOSE,()=>{S||(S=!0,D(Re,`RPC '${e}' stream ${i} transport closed`),C.__(),this.I_(m))}),N(m,fr.EventType.ERROR,k=>{S||(S=!0,St(Re,`RPC '${e}' stream ${i} transport errored. Name:`,k.name,"Message:",k.message),C.__(new x(P.UNAVAILABLE,"The operation could not be completed")))}),N(m,fr.EventType.MESSAGE,k=>{var $;if(!S){let B=k.data[0];j(!!B,16349);let M=B,H=(M==null?void 0:M.error)||(($=M[0])===null||$===void 0?void 0:$.error);if(H){D(Re,`RPC '${e}' stream ${i} received error:`,H);let q=H.status,U=function(y){let w=le[y];if(w!==void 0)return n_(w)}(q),I=H.message;U===void 0&&(U=P.INTERNAL,I="Unknown error status: "+q+" with message "+H.message),S=!0,C.__(new x(U,I)),m.close()}else D(Re,`RPC '${e}' stream ${i} received:`,B),C.a_(B)}}),N(c,ju.STAT_EVENT,k=>{k.stat===xo.PROXY?D(Re,`RPC '${e}' stream ${i} detected buffering proxy`):k.stat===xo.NOPROXY&&D(Re,`RPC '${e}' stream ${i} detected no buffering proxy`)}),setTimeout(()=>{C.o_()},0),C}terminate(){this.u_.forEach(e=>e.close()),this.u_=[]}T_(e){this.u_.push(e)}I_(e){this.u_=this.u_.filter(t=>t===e)}};function RT(){return typeof window!="undefined"?window:null}function Ho(){return typeof document!="undefined"?document:null}function ec(n){return new Dl(n,!0)}var Oa=class{constructor(e,t,r=1e3,i=1.5,s=6e4){this.Fi=e,this.timerId=t,this.d_=r,this.E_=i,this.A_=s,this.R_=0,this.V_=null,this.m_=Date.now(),this.reset()}reset(){this.R_=0}f_(){this.R_=this.A_}g_(e){this.cancel();let t=Math.floor(this.R_+this.p_()),r=Math.max(0,Date.now()-this.m_),i=Math.max(0,t-r);i>0&&D("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.R_} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.V_=this.Fi.enqueueAfterDelay(this.timerId,i,()=>(this.m_=Date.now(),e())),this.R_*=this.E_,this.R_<this.d_&&(this.R_=this.d_),this.R_>this.A_&&(this.R_=this.A_)}y_(){this.V_!==null&&(this.V_.skipDelay(),this.V_=null)}cancel(){this.V_!==null&&(this.V_.cancel(),this.V_=null)}p_(){return(Math.random()-.5)*this.R_}};var Zm="PersistentStream",Va=class{constructor(e,t,r,i,s,o,c,u){this.Fi=e,this.w_=r,this.S_=i,this.connection=s,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=c,this.listener=u,this.state=0,this.b_=0,this.D_=null,this.v_=null,this.stream=null,this.C_=0,this.F_=new Oa(e,t)}M_(){return this.state===1||this.state===5||this.x_()}x_(){return this.state===2||this.state===3}start(){this.C_=0,this.state!==4?this.auth():this.O_()}async stop(){this.M_()&&await this.close(0)}N_(){this.state=0,this.F_.reset()}B_(){this.x_()&&this.D_===null&&(this.D_=this.Fi.enqueueAfterDelay(this.w_,6e4,()=>this.L_()))}k_(e){this.q_(),this.stream.send(e)}async L_(){if(this.x_())return this.close(0)}q_(){this.D_&&(this.D_.cancel(),this.D_=null)}Q_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.q_(),this.Q_(),this.F_.cancel(),this.b_++,e!==4?this.F_.reset():t&&t.code===P.RESOURCE_EXHAUSTED?(Oe(t.toString()),Oe("Using maximum backoff delay to prevent overloading the backend."),this.F_.f_()):t&&t.code===P.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.U_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.n_(t)}U_(){}auth(){this.state=1;let e=this.K_(this.b_),t=this.b_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.b_===t&&this.W_(r,i)},r=>{e(()=>{let i=new x(P.UNKNOWN,"Fetching auth token failed: "+r.message);return this.G_(i)})})}W_(e,t){let r=this.K_(this.b_);this.stream=this.z_(e,t),this.stream.Zo(()=>{r(()=>this.listener.Zo())}),this.stream.e_(()=>{r(()=>(this.state=2,this.v_=this.Fi.enqueueAfterDelay(this.S_,1e4,()=>(this.x_()&&(this.state=3),Promise.resolve())),this.listener.e_()))}),this.stream.n_(i=>{r(()=>this.G_(i))}),this.stream.onMessage(i=>{r(()=>++this.C_==1?this.j_(i):this.onNext(i))})}O_(){this.state=5,this.F_.g_(async()=>{this.state=0,this.start()})}G_(e){return D(Zm,`close with error: ${e}`),this.stream=null,this.close(4,e)}K_(e){return t=>{this.Fi.enqueueAndForget(()=>this.b_===e?t():(D(Zm,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}},yh=class extends Va{constructor(e,t,r,i,s,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,i,o),this.serializer=s}z_(e,t){return this.connection.P_("Listen",e,t)}j_(e){return this.onNext(e)}onNext(e){this.F_.reset();let t=aT(this.serializer,e),r=function(s){if(!("targetChange"in s))return G.min();let o=s.targetChange;return o.targetIds&&o.targetIds.length?G.min():o.readTime?Ve(o.readTime):G.min()}(e);return this.listener.J_(t,r)}H_(e){let t={};t.database=Vl(this.serializer),t.addTarget=function(s,o){let c,u=o.target;if(c=aa(u)?{documents:c_(s,u)}:{query:u_(s,u).Vt},c.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){c.resumeToken=r_(s,o.resumeToken);let h=Nl(s,o.expectedCount);h!==null&&(c.expectedCount=h)}else if(o.snapshotVersion.compareTo(G.min())>0){c.readTime=Wr(s,o.snapshotVersion.toTimestamp());let h=Nl(s,o.expectedCount);h!==null&&(c.expectedCount=h)}return c}(this.serializer,e);let r=uT(this.serializer,e);r&&(t.labels=r),this.k_(t)}Y_(e){let t={};t.database=Vl(this.serializer),t.removeTarget=e,this.k_(t)}},vh=class extends Va{constructor(e,t,r,i,s,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,i,o),this.serializer=s}get Z_(){return this.C_>0}start(){this.lastStreamToken=void 0,super.start()}U_(){this.Z_&&this.X_([])}z_(e,t){return this.connection.P_("Write",e,t)}j_(e){return j(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,j(!e.writeResults||e.writeResults.length===0,55816),this.listener.ea()}onNext(e){j(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.F_.reset();let t=cT(e.writeResults,e.commitTime),r=Ve(e.commitTime);return this.listener.ta(r,t)}na(){let e={};e.database=Vl(this.serializer),this.k_(e)}X_(e){let t={streamToken:this.lastStreamToken,writes:e.map(r=>ga(this.serializer,r))};this.k_(t)}};var Ih=class{},wh=class extends Ih{constructor(e,t,r,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=i,this.ra=!1}ia(){if(this.ra)throw new x(P.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,t,r,i){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,o])=>this.connection.Wo(e,Ol(t,r),i,s,o)).catch(s=>{throw s.name==="FirebaseError"?(s.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new x(P.UNKNOWN,s.toString())})}Jo(e,t,r,i,s){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,c])=>this.connection.Jo(e,Ol(t,r),i,o,c,s)).catch(o=>{throw o.name==="FirebaseError"?(o.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new x(P.UNKNOWN,o.toString())})}terminate(){this.ra=!0,this.connection.terminate()}},Eh=class{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.sa=0,this.oa=null,this._a=!0}aa(){this.sa===0&&(this.ua("Unknown"),this.oa=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.oa=null,this.ca("Backend didn't respond within 10 seconds."),this.ua("Offline"),Promise.resolve())))}la(e){this.state==="Online"?this.ua("Unknown"):(this.sa++,this.sa>=1&&(this.ha(),this.ca(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ua("Offline")))}set(e){this.ha(),this.sa=0,e==="Online"&&(this._a=!1),this.ua(e)}ua(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ca(e){let t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this._a?(Oe(t),this._a=!1):D("OnlineStateTracker",t)}ha(){this.oa!==null&&(this.oa.cancel(),this.oa=null)}};var Hn="RemoteStore",Th=class{constructor(e,t,r,i,s){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.Pa=[],this.Ta=new Map,this.Ia=new Set,this.da=[],this.Ea=s,this.Ea.xo(o=>{r.enqueueAndForget(async()=>{Zn(this)&&(D(Hn,"Restarting streams for network reachability change."),await async function(u){let h=K(u);h.Ia.add(4),await bs(h),h.Aa.set("Unknown"),h.Ia.delete(4),await tc(h)}(this))})}),this.Aa=new Eh(r,i)}};async function tc(n){if(Zn(n))for(let e of n.da)await e(!0)}async function bs(n){for(let e of n.da)await e(!1)}function P_(n,e){let t=K(n);t.Ta.has(e.targetId)||(t.Ta.set(e.targetId,e),dd(t)?hd(t):Zr(t).x_()&&ld(t,e))}function ud(n,e){let t=K(n),r=Zr(t);t.Ta.delete(e),r.x_()&&C_(t,e),t.Ta.size===0&&(r.x_()?r.B_():Zn(t)&&t.Aa.set("Unknown"))}function ld(n,e){if(n.Ra.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(G.min())>0){let t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}Zr(n).H_(e)}function C_(n,e){n.Ra.$e(e),Zr(n).Y_(e)}function hd(n){n.Ra=new kl({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),Et:e=>n.Ta.get(e)||null,lt:()=>n.datastore.serializer.databaseId}),Zr(n).start(),n.Aa.aa()}function dd(n){return Zn(n)&&!Zr(n).M_()&&n.Ta.size>0}function Zn(n){return K(n).Ia.size===0}function k_(n){n.Ra=void 0}async function PT(n){n.Aa.set("Online")}async function CT(n){n.Ta.forEach((e,t)=>{ld(n,e)})}async function kT(n,e){k_(n),dd(n)?(n.Aa.la(e),hd(n)):n.Aa.set("Unknown")}async function DT(n,e,t){if(n.Aa.set("Online"),e instanceof fa&&e.state===2&&e.cause)try{await async function(i,s){let o=s.cause;for(let c of s.targetIds)i.Ta.has(c)&&(await i.remoteSyncer.rejectListen(c,o),i.Ta.delete(c),i.Ra.removeTarget(c))}(n,e)}catch(r){D(Hn,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await xa(n,r)}else if(e instanceof Rr?n.Ra.Ye(e):e instanceof da?n.Ra.it(e):n.Ra.et(e),!t.isEqual(G.min()))try{let r=await R_(n.localStore);t.compareTo(r)>=0&&await function(s,o){let c=s.Ra.Pt(o);return c.targetChanges.forEach((u,h)=>{if(u.resumeToken.approximateByteSize()>0){let f=s.Ta.get(h);f&&s.Ta.set(h,f.withResumeToken(u.resumeToken,o))}}),c.targetMismatches.forEach((u,h)=>{let f=s.Ta.get(u);if(!f)return;s.Ta.set(u,f.withResumeToken(ge.EMPTY_BYTE_STRING,f.snapshotVersion)),C_(s,u);let m=new Kr(f.target,u,h,f.sequenceNumber);ld(s,m)}),s.remoteSyncer.applyRemoteEvent(c)}(n,t)}catch(r){D(Hn,"Failed to raise snapshot:",r),await xa(n,r)}}async function xa(n,e,t){if(!ln(e))throw e;n.Ia.add(1),await bs(n),n.Aa.set("Offline"),t||(t=()=>R_(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{D(Hn,"Retrying IndexedDB access"),await t(),n.Ia.delete(1),await tc(n)})}function D_(n,e){return e().catch(t=>xa(n,t,e))}async function As(n){let e=K(n),t=cn(e),r=e.Pa.length>0?e.Pa[e.Pa.length-1].batchId:Un;for(;NT(e);)try{let i=await TT(e.localStore,r);if(i===null){e.Pa.length===0&&t.B_();break}r=i.batchId,OT(e,i)}catch(i){await xa(e,i)}N_(e)&&O_(e)}function NT(n){return Zn(n)&&n.Pa.length<10}function OT(n,e){n.Pa.push(e);let t=cn(n);t.x_()&&t.Z_&&t.X_(e.mutations)}function N_(n){return Zn(n)&&!cn(n).M_()&&n.Pa.length>0}function O_(n){cn(n).start()}async function VT(n){cn(n).na()}async function xT(n){let e=cn(n);for(let t of n.Pa)e.X_(t.mutations)}async function LT(n,e,t){let r=n.Pa.shift(),i=Rl.from(r,e,t);await D_(n,()=>n.remoteSyncer.applySuccessfulWrite(i)),await As(n)}async function MT(n,e){e&&cn(n).Z_&&await async function(r,i){if(function(o){return eT(o)&&o!==P.ABORTED}(i.code)){let s=r.Pa.shift();cn(r).N_(),await D_(r,()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i)),await As(r)}}(n,e),N_(n)&&O_(n)}async function eg(n,e){let t=K(n);t.asyncQueue.verifyOperationInProgress(),D(Hn,"RemoteStore received new credentials");let r=Zn(t);t.Ia.add(3),await bs(t),r&&t.Aa.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.Ia.delete(3),await tc(t)}async function FT(n,e){let t=K(n);e?(t.Ia.delete(2),await tc(t)):e||(t.Ia.add(2),await bs(t),t.Aa.set("Unknown"))}function Zr(n){return n.Va||(n.Va=function(t,r,i){let s=K(t);return s.ia(),new yh(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(n.datastore,n.asyncQueue,{Zo:PT.bind(null,n),e_:CT.bind(null,n),n_:kT.bind(null,n),J_:DT.bind(null,n)}),n.da.push(async e=>{e?(n.Va.N_(),dd(n)?hd(n):n.Aa.set("Unknown")):(await n.Va.stop(),k_(n))})),n.Va}function cn(n){return n.ma||(n.ma=function(t,r,i){let s=K(t);return s.ia(),new vh(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(n.datastore,n.asyncQueue,{Zo:()=>Promise.resolve(),e_:VT.bind(null,n),n_:MT.bind(null,n),ea:xT.bind(null,n),ta:LT.bind(null,n)}),n.da.push(async e=>{e?(n.ma.N_(),await As(n)):(await n.ma.stop(),n.Pa.length>0&&(D(Hn,`Stopping write stream with ${n.Pa.length} pending writes`),n.Pa=[]))})),n.ma}var bh=class n{constructor(e,t,r,i,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new ht,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,i,s){let o=Date.now()+r,c=new n(e,t,o,i,s);return c.start(r),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new x(P.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}};function fd(n,e){if(Oe("AsyncQueue",`${e}: ${n}`),ln(n))return new x(P.UNAVAILABLE,`${e}: ${n}`);throw n}var La=class n{static emptySet(e){return new n(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||L.comparator(t.key,r.key):(t,r)=>L.comparator(t.key,r.key),this.keyedMap=Gi(),this.sortedSet=new ae(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){let t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){let t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){let t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof n)||this.size!==e.size)return!1;let t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){let i=t.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){let e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){let r=new n;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}};var Ma=class{constructor(){this.fa=new ae(L.comparator)}track(e){let t=e.doc.key,r=this.fa.get(t);r?e.type!==0&&r.type===3?this.fa=this.fa.insert(t,e):e.type===3&&r.type!==1?this.fa=this.fa.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.fa=this.fa.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.fa=this.fa.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.fa=this.fa.remove(t):e.type===1&&r.type===2?this.fa=this.fa.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.fa=this.fa.insert(t,{type:2,doc:e.doc}):F(63341,{At:e,ga:r}):this.fa=this.fa.insert(t,e)}pa(){let e=[];return this.fa.inorderTraversal((t,r)=>{e.push(r)}),e}},Qr=class n{constructor(e,t,r,i,s,o,c,u,h){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=o,this.syncStateChanged=c,this.excludesMetadataChanges=u,this.hasCachedResults=h}static fromInitialDocuments(e,t,r,i,s){let o=[];return t.forEach(c=>{o.push({type:0,doc:c})}),new n(e,t,La.emptySet(t),o,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Za(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;let t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let i=0;i<t.length;i++)if(t[i].type!==r[i].type||!t[i].doc.isEqual(r[i].doc))return!1;return!0}};var Ah=class{constructor(){this.ya=void 0,this.wa=[]}Sa(){return this.wa.some(e=>e.ba())}},Sh=class{constructor(){this.queries=tg(),this.onlineState="Unknown",this.Da=new Set}terminate(){(function(t,r){let i=K(t),s=i.queries;i.queries=tg(),s.forEach((o,c)=>{for(let u of c.wa)u.onError(r)})})(this,new x(P.ABORTED,"Firestore shutting down"))}};function tg(){return new nt(n=>$g(n),Za)}async function UT(n,e){let t=K(n),r=3,i=e.query,s=t.queries.get(i);s?!s.Sa()&&e.ba()&&(r=2):(s=new Ah,r=e.ba()?0:1);try{switch(r){case 0:s.ya=await t.onListen(i,!0);break;case 1:s.ya=await t.onListen(i,!1);break;case 2:await t.onFirstRemoteStoreListen(i)}}catch(o){let c=fd(o,`Initialization of query '${wr(e.query)}' failed`);return void e.onError(c)}t.queries.set(i,s),s.wa.push(e),e.va(t.onlineState),s.ya&&e.Ca(s.ya)&&pd(t)}async function BT(n,e){let t=K(n),r=e.query,i=3,s=t.queries.get(r);if(s){let o=s.wa.indexOf(e);o>=0&&(s.wa.splice(o,1),s.wa.length===0?i=e.ba()?0:1:!s.Sa()&&e.ba()&&(i=2))}switch(i){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function qT(n,e){let t=K(n),r=!1;for(let i of e){let s=i.query,o=t.queries.get(s);if(o){for(let c of o.wa)c.Ca(i)&&(r=!0);o.ya=i}}r&&pd(t)}function jT(n,e,t){let r=K(n),i=r.queries.get(e);if(i)for(let s of i.wa)s.onError(t);r.queries.delete(e)}function pd(n){n.Da.forEach(e=>{e.next()})}var Rh,ng;(ng=Rh||(Rh={})).Fa="default",ng.Cache="cache";var Ph=class{constructor(e,t,r){this.query=e,this.Ma=t,this.xa=!1,this.Oa=null,this.onlineState="Unknown",this.options=r||{}}Ca(e){if(!this.options.includeMetadataChanges){let r=[];for(let i of e.docChanges)i.type!==3&&r.push(i);e=new Qr(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.xa?this.Na(e)&&(this.Ma.next(e),t=!0):this.Ba(e,this.onlineState)&&(this.La(e),t=!0),this.Oa=e,t}onError(e){this.Ma.error(e)}va(e){this.onlineState=e;let t=!1;return this.Oa&&!this.xa&&this.Ba(this.Oa,e)&&(this.La(this.Oa),t=!0),t}Ba(e,t){if(!e.fromCache||!this.ba())return!0;let r=t!=="Offline";return(!this.options.ka||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Na(e){if(e.docChanges.length>0)return!0;let t=this.Oa&&this.Oa.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}La(e){e=Qr.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.xa=!0,this.Ma.next(e)}ba(){return this.options.source!==Rh.Cache}};var Fa=class{constructor(e){this.key=e}},Ua=class{constructor(e){this.key=e}},Ch=class{constructor(e,t){this.query=e,this.Ha=t,this.Ya=null,this.hasCachedResults=!1,this.current=!1,this.Za=Q(),this.mutatedKeys=Q(),this.Xa=Gg(e),this.eu=new La(this.Xa)}get tu(){return this.Ha}nu(e,t){let r=t?t.ru:new Ma,i=t?t.eu:this.eu,s=t?t.mutatedKeys:this.mutatedKeys,o=i,c=!1,u=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,h=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((f,m)=>{let _=i.get(f),S=Ts(this.query,m)?m:null,C=!!_&&this.mutatedKeys.has(_.key),N=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations),k=!1;_&&S?_.data.isEqual(S.data)?C!==N&&(r.track({type:3,doc:S}),k=!0):this.iu(_,S)||(r.track({type:2,doc:S}),k=!0,(u&&this.Xa(S,u)>0||h&&this.Xa(S,h)<0)&&(c=!0)):!_&&S?(r.track({type:0,doc:S}),k=!0):_&&!S&&(r.track({type:1,doc:_}),k=!0,(u||h)&&(c=!0)),k&&(S?(o=o.add(S),s=N?s.add(f):s.delete(f)):(o=o.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;o.size>this.query.limit;){let f=this.query.limitType==="F"?o.last():o.first();o=o.delete(f.key),s=s.delete(f.key),r.track({type:1,doc:f})}return{eu:o,ru:r,Ds:c,mutatedKeys:s}}iu(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,i){let s=this.eu;this.eu=e.eu,this.mutatedKeys=e.mutatedKeys;let o=e.ru.pa();o.sort((f,m)=>function(S,C){let N=k=>{switch(k){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return F(20277,{At:k})}};return N(S)-N(C)}(f.type,m.type)||this.Xa(f.doc,m.doc)),this.su(r),i=i!=null&&i;let c=t&&!i?this.ou():[],u=this.Za.size===0&&this.current&&!i?1:0,h=u!==this.Ya;return this.Ya=u,o.length!==0||h?{snapshot:new Qr(this.query,e.eu,s,o,e.mutatedKeys,u===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),_u:c}:{_u:c}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({eu:this.eu,ru:new Ma,mutatedKeys:this.mutatedKeys,Ds:!1},!1)):{_u:[]}}au(e){return!this.Ha.has(e)&&!!this.eu.has(e)&&!this.eu.get(e).hasLocalMutations}su(e){e&&(e.addedDocuments.forEach(t=>this.Ha=this.Ha.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ha=this.Ha.delete(t)),this.current=e.current)}ou(){if(!this.current)return[];let e=this.Za;this.Za=Q(),this.eu.forEach(r=>{this.au(r.key)&&(this.Za=this.Za.add(r.key))});let t=[];return e.forEach(r=>{this.Za.has(r)||t.push(new Ua(r))}),this.Za.forEach(r=>{e.has(r)||t.push(new Fa(r))}),t}uu(e){this.Ha=e.qs,this.Za=Q();let t=this.nu(e.documents);return this.applyChanges(t,!0)}cu(){return Qr.fromInitialDocuments(this.query,this.eu,this.mutatedKeys,this.Ya===0,this.hasCachedResults)}},md="SyncEngine",kh=class{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}},Dh=class{constructor(e){this.key=e,this.lu=!1}},Nh=class{constructor(e,t,r,i,s,o){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=o,this.hu={},this.Pu=new nt(c=>$g(c),Za),this.Tu=new Map,this.Iu=new Set,this.du=new ae(L.comparator),this.Eu=new Map,this.Au=new gs,this.Ru={},this.Vu=new Map,this.mu=Hr.ur(),this.onlineState="Unknown",this.fu=void 0}get isPrimaryClient(){return this.fu===!0}};async function zT(n,e,t=!0){let r=U_(n),i,s=r.Pu.get(e);return s?(r.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.cu()):i=await V_(r,e,t,!0),i}async function $T(n,e){let t=U_(n);await V_(t,e,!0,!1)}async function V_(n,e,t,r){let i=await bT(n.localStore,Qe(e)),s=i.targetId,o=n.sharedClientState.addLocalQueryTarget(s,t),c;return r&&(c=await GT(n,e,s,o==="current",i.resumeToken)),n.isPrimaryClient&&t&&P_(n.remoteStore,i),c}async function GT(n,e,t,r,i){n.gu=(m,_,S)=>async function(N,k,$,B){let M=k.view.nu($);M.Ds&&(M=await Jm(N.localStore,k.query,!1).then(({documents:I})=>k.view.nu(I,M)));let H=B&&B.targetChanges.get(k.targetId),q=B&&B.targetMismatches.get(k.targetId)!=null,U=k.view.applyChanges(M,N.isPrimaryClient,H,q);return ig(N,k.targetId,U._u),U.snapshot}(n,m,_,S);let s=await Jm(n.localStore,e,!0),o=new Ch(e,s.qs),c=o.nu(s.documents),u=ps.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",i),h=o.applyChanges(c,n.isPrimaryClient,u);ig(n,t,h._u);let f=new kh(e,t,o);return n.Pu.set(e,f),n.Tu.has(t)?n.Tu.get(t).push(e):n.Tu.set(t,[e]),h.snapshot}async function WT(n,e,t){let r=K(n),i=r.Pu.get(e),s=r.Tu.get(i.targetId);if(s.length>1)return r.Tu.set(i.targetId,s.filter(o=>!Za(o,e))),void r.Pu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await dh(r.localStore,i.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(i.targetId),t&&ud(r.remoteStore,i.targetId),Oh(r,i.targetId)}).catch(Jn)):(Oh(r,i.targetId),await dh(r.localStore,i.targetId,!0))}async function KT(n,e){let t=K(n),r=t.Pu.get(e),i=t.Tu.get(r.targetId);t.isPrimaryClient&&i.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),ud(t.remoteStore,r.targetId))}async function HT(n,e,t){let r=B_(n);try{let i=await function(o,c){let u=K(o),h=oe.now(),f=c.reduce((S,C)=>S.add(C.key),Q()),m,_;return u.persistence.runTransaction("Locally write mutations","readwrite",S=>{let C=ze(),N=Q();return u.Os.getEntries(S,f).next(k=>{C=k,C.forEach(($,B)=>{B.isValidDocument()||(N=N.add($))})}).next(()=>u.localDocuments.getOverlayedDocuments(S,C)).next(k=>{m=k;let $=[];for(let B of c){let M=ZE(B,m.get(B.key).overlayedDocument);M!=null&&$.push(new pt(B.key,M,Fg(M.value.mapValue),He.exists(!0)))}return u.mutationQueue.addMutationBatch(S,h,$,c)}).next(k=>{_=k;let $=k.applyToLocalDocumentSet(m,N);return u.documentOverlayCache.saveOverlays(S,k.batchId,$)})}).then(()=>({batchId:_.batchId,changes:Kg(m)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(o,c,u){let h=o.Ru[o.currentUser.toKey()];h||(h=new ae(W)),h=h.insert(c,u),o.Ru[o.currentUser.toKey()]=h}(r,i.batchId,t),await Ss(r,i.changes),await As(r.remoteStore)}catch(i){let s=fd(i,"Failed to persist write");t.reject(s)}}async function x_(n,e){let t=K(n);try{let r=await wT(t.localStore,e);e.targetChanges.forEach((i,s)=>{let o=t.Eu.get(s);o&&(j(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1,22616),i.addedDocuments.size>0?o.lu=!0:i.modifiedDocuments.size>0?j(o.lu,14607):i.removedDocuments.size>0&&(j(o.lu,42227),o.lu=!1))}),await Ss(t,r,e)}catch(r){await Jn(r)}}function rg(n,e,t){let r=K(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){let i=[];r.Pu.forEach((s,o)=>{let c=o.view.va(e);c.snapshot&&i.push(c.snapshot)}),function(o,c){let u=K(o);u.onlineState=c;let h=!1;u.queries.forEach((f,m)=>{for(let _ of m.wa)_.va(c)&&(h=!0)}),h&&pd(u)}(r.eventManager,e),i.length&&r.hu.J_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function QT(n,e,t){let r=K(n);r.sharedClientState.updateQueryState(e,"rejected",t);let i=r.Eu.get(e),s=i&&i.key;if(s){let o=new ae(L.comparator);o=o.insert(s,Ie.newNoDocument(s,G.min()));let c=Q().add(s),u=new ha(G.min(),new Map,new ae(W),o,c);await x_(r,u),r.du=r.du.remove(s),r.Eu.delete(e),gd(r)}else await dh(r.localStore,e,!1).then(()=>Oh(r,e,t)).catch(Jn)}async function YT(n,e){let t=K(n),r=e.batch.batchId;try{let i=await IT(t.localStore,e);M_(t,r,null),L_(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await Ss(t,i)}catch(i){await Jn(i)}}async function JT(n,e,t){let r=K(n);try{let i=await function(o,c){let u=K(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let f;return u.mutationQueue.lookupMutationBatch(h,c).next(m=>(j(m!==null,37113),f=m.keys(),u.mutationQueue.removeMutationBatch(h,m))).next(()=>u.mutationQueue.performConsistencyCheck(h)).next(()=>u.documentOverlayCache.removeOverlaysForBatchId(h,f,c)).next(()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,f)).next(()=>u.localDocuments.getDocuments(h,f))})}(r.localStore,e);M_(r,e,t),L_(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await Ss(r,i)}catch(i){await Jn(i)}}function L_(n,e){(n.Vu.get(e)||[]).forEach(t=>{t.resolve()}),n.Vu.delete(e)}function M_(n,e,t){let r=K(n),i=r.Ru[r.currentUser.toKey()];if(i){let s=i.get(e);s&&(t?s.reject(t):s.resolve(),i=i.remove(e)),r.Ru[r.currentUser.toKey()]=i}}function Oh(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(let r of n.Tu.get(e))n.Pu.delete(r),t&&n.hu.pu(r,t);n.Tu.delete(e),n.isPrimaryClient&&n.Au.zr(e).forEach(r=>{n.Au.containsKey(r)||F_(n,r)})}function F_(n,e){n.Iu.delete(e.path.canonicalString());let t=n.du.get(e);t!==null&&(ud(n.remoteStore,t),n.du=n.du.remove(e),n.Eu.delete(t),gd(n))}function ig(n,e,t){for(let r of t)r instanceof Fa?(n.Au.addReference(r.key,e),XT(n,r)):r instanceof Ua?(D(md,"Document no longer in limbo: "+r.key),n.Au.removeReference(r.key,e),n.Au.containsKey(r.key)||F_(n,r.key)):F(19791,{yu:r})}function XT(n,e){let t=e.key,r=t.path.canonicalString();n.du.get(t)||n.Iu.has(r)||(D(md,"New document in limbo: "+t),n.Iu.add(r),gd(n))}function gd(n){for(;n.Iu.size>0&&n.du.size<n.maxConcurrentLimboResolutions;){let e=n.Iu.values().next().value;n.Iu.delete(e);let t=new L(ee.fromString(e)),r=n.mu.next();n.Eu.set(r,new Dh(t)),n.du=n.du.insert(t,r),P_(n.remoteStore,new Kr(Qe(Xa(t.path)),r,"TargetPurposeLimboResolution",Me.ue))}}async function Ss(n,e,t){let r=K(n),i=[],s=[],o=[];r.Pu.isEmpty()||(r.Pu.forEach((c,u)=>{o.push(r.gu(u,e,t).then(h=>{var f;if((h||t)&&r.isPrimaryClient){let m=h?!h.fromCache:(f=t==null?void 0:t.targetChanges.get(u.targetId))===null||f===void 0?void 0:f.current;r.sharedClientState.updateQueryState(u.targetId,m?"current":"not-current")}if(h){i.push(h);let m=uh.Es(u.targetId,h);s.push(m)}}))}),await Promise.all(o),r.hu.J_(i),await async function(u,h){let f=K(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>A.forEach(h,_=>A.forEach(_.Is,S=>f.persistence.referenceDelegate.addReference(m,_.targetId,S)).next(()=>A.forEach(_.ds,S=>f.persistence.referenceDelegate.removeReference(m,_.targetId,S)))))}catch(m){if(!ln(m))throw m;D(cd,"Failed to update sequence numbers: "+m)}for(let m of h){let _=m.targetId;if(!m.fromCache){let S=f.Fs.get(_),C=S.snapshotVersion,N=S.withLastLimboFreeSnapshotVersion(C);f.Fs=f.Fs.insert(_,N)}}}(r.localStore,s))}async function ZT(n,e){let t=K(n);if(!t.currentUser.isEqual(e)){D(md,"User change. New user:",e.toKey());let r=await S_(t.localStore,e);t.currentUser=e,function(s,o){s.Vu.forEach(c=>{c.forEach(u=>{u.reject(new x(P.CANCELLED,o))})}),s.Vu.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Ss(t,r.Bs)}}function eb(n,e){let t=K(n),r=t.Eu.get(e);if(r&&r.lu)return Q().add(r.key);{let i=Q(),s=t.Tu.get(e);if(!s)return i;for(let o of s){let c=t.Pu.get(o);i=i.unionWith(c.view.tu)}return i}}function U_(n){let e=K(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=x_.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=eb.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=QT.bind(null,e),e.hu.J_=qT.bind(null,e.eventManager),e.hu.pu=jT.bind(null,e.eventManager),e}function B_(n){let e=K(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=YT.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=JT.bind(null,e),e}var Qn=class{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=ec(e.databaseInfo.databaseId),this.sharedClientState=this.bu(e),this.persistence=this.Du(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Cu(e,this.localStore),this.indexBackfillerScheduler=this.Fu(e,this.localStore)}Cu(e,t){return null}Fu(e,t){return null}vu(e){return A_(this.persistence,new Ca,e.initialUser,this.serializer)}Du(e){return new _s(Ra.Vi,this.serializer)}bu(e){return new Da}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}};Qn.provider={build:()=>new Qn};var Vh=class extends Qn{constructor(e){super(),this.cacheSizeBytes=e}Cu(e,t){j(this.persistence.referenceDelegate instanceof Pa,46915);let r=this.persistence.referenceDelegate.garbageCollector;return new ba(r,e.asyncQueue,t)}Du(e){let t=this.cacheSizeBytes!==void 0?Le.withCacheSize(this.cacheSizeBytes):Le.DEFAULT;return new _s(r=>Pa.Vi(r,t),this.serializer)}},xh=class extends Qn{constructor(e,t,r){super(),this.Mu=e,this.cacheSizeBytes=t,this.forceOwnership=r,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.Mu.initialize(this,e),await B_(this.Mu.syncEngine),await As(this.Mu.remoteStore),await this.persistence.ji(()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve()))}vu(e){return A_(this.persistence,new Ca,e.initialUser,this.serializer)}Cu(e,t){let r=this.persistence.referenceDelegate.garbageCollector;return new ba(r,e.asyncQueue,t)}Fu(e,t){let r=new cl(t,this.persistence);return new al(e.asyncQueue,r)}Du(e){let t=yT(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),r=this.cacheSizeBytes!==void 0?Le.withCacheSize(this.cacheSizeBytes):Le.DEFAULT;return new ch(this.synchronizeTabs,t,e.clientId,r,e.asyncQueue,RT(),Ho(),this.serializer,this.sharedClientState,!!this.forceOwnership)}bu(e){return new Da}};var Yr=class{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>rg(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=ZT.bind(null,this.syncEngine),await FT(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new Sh}()}createDatastore(e){let t=ec(e.databaseInfo.databaseId),r=function(s){return new _h(s)}(e.databaseInfo);return function(s,o,c,u){return new wh(s,o,c,u)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,i,s,o,c){return new Th(r,i,s,o,c)}(this.localStore,this.datastore,e.asyncQueue,t=>rg(this.syncEngine,t,0),function(){return Na.C()?new Na:new fh}())}createSyncEngine(e,t){return function(i,s,o,c,u,h,f){let m=new Nh(i,s,o,c,u,h);return f&&(m.fu=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(i){let s=K(i);D(Hn,"RemoteStore shutting down."),s.Ia.add(5),await bs(s),s.Ea.shutdown(),s.Aa.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}};Yr.provider={build:()=>new Yr};var Lh=class{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.xu(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.xu(this.observer.error,e):Oe("Uncaught Error in snapshot listener:",e.toString()))}Ou(){this.muted=!0}xu(e,t){setTimeout(()=>{this.muted||e(t)},0)}};var un="FirestoreClient",Mh=class{constructor(e,t,r,i,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=i,this.user=pe.UNAUTHENTICATED,this.clientId=es.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,async o=>{D(un,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>(D(un,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();let e=new ht;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){let r=fd(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}};async function Yu(n,e){n.asyncQueue.verifyOperationInProgress(),D(un,"Initializing OfflineComponentProvider");let t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async i=>{r.isEqual(i)||(await S_(e.localStore,i),r=i)}),e.persistence.setDatabaseDeletedListener(()=>{St("Terminating Firestore due to IndexedDb database deletion"),n.terminate().then(()=>{D("Terminating Firestore due to IndexedDb database deletion completed successfully")}).catch(i=>{St("Terminating Firestore due to IndexedDb database deletion failed",i)})}),n._offlineComponents=e}async function sg(n,e){n.asyncQueue.verifyOperationInProgress();let t=await tb(n);D(un,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>eg(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,i)=>eg(e.remoteStore,i)),n._onlineComponents=e}async function tb(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){D(un,"Using user provided OfflineComponentProvider");try{await Yu(n,n._uninitializedComponentsProvider._offline)}catch(e){let t=e;if(!function(i){return i.name==="FirebaseError"?i.code===P.FAILED_PRECONDITION||i.code===P.UNIMPLEMENTED:!(typeof DOMException!="undefined"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(t))throw t;St("Error using user provided cache. Falling back to memory cache: "+t),await Yu(n,new Qn)}}else D(un,"Using default OfflineComponentProvider"),await Yu(n,new Vh(void 0));return n._offlineComponents}async function q_(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(D(un,"Using user provided OnlineComponentProvider"),await sg(n,n._uninitializedComponentsProvider._online)):(D(un,"Using default OnlineComponentProvider"),await sg(n,new Yr))),n._onlineComponents}function nb(n){return q_(n).then(e=>e.syncEngine)}async function og(n){let e=await q_(n),t=e.eventManager;return t.onListen=zT.bind(null,e.syncEngine),t.onUnlisten=WT.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=$T.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=KT.bind(null,e.syncEngine),t}function j_(n){let e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}var ag=new Map;var z_="firestore.googleapis.com",cg=!0,Ba=class{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new x(P.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=z_,this.ssl=cg}else this.host=e.host,this.ssl=(t=e.ssl)!==null&&t!==void 0?t:cg;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=y_;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<E_)throw new x(P.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}sE("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=j_((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new x(P.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new x(P.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new x(P.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}},Jr=class{constructor(e,t,r,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Ba({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new x(P.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new x(P.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Ba(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Ju;switch(r.type){case"firstParty":return new tl(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new x(P.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){let r=ag.get(t);r&&(D("ComponentProvider","Removing Datastore"),ag.delete(t),r.terminate())}(this),Promise.resolve()}};function rb(n,e,t,r={}){var i;n=Mn(n,Jr);let s=Mt(e),o=n._getSettings(),c=Object.assign(Object.assign({},o),{emulatorOptions:n._getEmulatorOptions()}),u=`${e}:${t}`;s&&(Qs(`https://${u}`),Lc("Firestore",!0)),o.host!==z_&&o.host!==u&&St("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");let h=Object.assign(Object.assign({},o),{host:u,ssl:s,emulatorOptions:r});if(!vt(h,c)&&(n._setSettings(h),r.mockUserToken)){let f,m;if(typeof r.mockUserToken=="string")f=r.mockUserToken,m=pe.MOCK_USER;else{f=Vf(r.mockUserToken,(i=n._app)===null||i===void 0?void 0:i.options.projectId);let _=r.mockUserToken.sub||r.mockUserToken.user_id;if(!_)throw new x(P.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");m=new pe(_)}n._authCredentials=new Xu(new Qo(f,m))}}var qa=class n{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new n(this.firestore,e,this._query)}},Ce=class n{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Yt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new n(this.firestore,e,this._key)}toJSON(){return{type:n._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(Is(t,n._jsonSchema))return new n(e,r||null,new L(ee.fromString(t.referencePath)))}};Ce._jsonSchemaVersion="firestore/documentReference/1.0",Ce._jsonSchema={type:de("string",Ce._jsonSchemaVersion),referencePath:de("string")};var Yt=class n extends qa{constructor(e,t,r){super(e,t,Xa(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){let e=this._path.popLast();return e.isEmpty()?null:new Ce(this.firestore,null,new L(e))}withConverter(e){return new n(this.firestore,e,this._path)}};function $_(n,e,...t){if(n=Ne(n),mg("collection","path",e),n instanceof Jr){let r=ee.fromString(e,...t);return rm(r),new Yt(n,null,r)}{if(!(n instanceof Ce||n instanceof Yt))throw new x(P.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let r=n._path.child(ee.fromString(e,...t));return rm(r),new Yt(n.firestore,null,r)}}function _d(n,e,...t){if(n=Ne(n),arguments.length===1&&(e=es.newId()),mg("doc","path",e),n instanceof Jr){let r=ee.fromString(e,...t);return nm(r),new Ce(n,null,new L(r))}{if(!(n instanceof Ce||n instanceof Yt))throw new x(P.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let r=n._path.child(ee.fromString(e,...t));return nm(r),new Ce(n.firestore,n instanceof Yt?n.converter:null,new L(r))}}var ug="AsyncQueue",ja=class{constructor(e=Promise.resolve()){this.Zu=[],this.Xu=!1,this.ec=[],this.tc=null,this.nc=!1,this.rc=!1,this.sc=[],this.F_=new Oa(this,"async_queue_retry"),this.oc=()=>{let r=Ho();r&&D(ug,"Visibility state changed to "+r.visibilityState),this.F_.y_()},this._c=e;let t=Ho();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.oc)}get isShuttingDown(){return this.Xu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.ac(),this.uc(e)}enterRestrictedMode(e){if(!this.Xu){this.Xu=!0,this.rc=e||!1;let t=Ho();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.oc)}}enqueue(e){if(this.ac(),this.Xu)return new Promise(()=>{});let t=new ht;return this.uc(()=>this.Xu&&this.rc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Zu.push(e),this.cc()))}async cc(){if(this.Zu.length!==0){try{await this.Zu[0](),this.Zu.shift(),this.F_.reset()}catch(e){if(!ln(e))throw e;D(ug,"Operation failed with retryable error: "+e)}this.Zu.length>0&&this.F_.g_(()=>this.cc())}}uc(e){let t=this._c.then(()=>(this.nc=!0,e().catch(r=>{throw this.tc=r,this.nc=!1,Oe("INTERNAL UNHANDLED ERROR: ",lg(r)),r}).then(r=>(this.nc=!1,r))));return this._c=t,t}enqueueAfterDelay(e,t,r){this.ac(),this.sc.indexOf(e)>-1&&(t=0);let i=bh.createAndSchedule(this,e,t,r,s=>this.lc(s));return this.ec.push(i),i}ac(){this.tc&&F(47125,{hc:lg(this.tc)})}verifyOperationInProgress(){}async Pc(){let e;do e=this._c,await e;while(e!==this._c)}Tc(e){for(let t of this.ec)if(t.timerId===e)return!0;return!1}Ic(e){return this.Pc().then(()=>{this.ec.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(let t of this.ec)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Pc()})}dc(e){this.sc.push(e)}lc(e){let t=this.ec.indexOf(e);this.ec.splice(t,1)}};function lg(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}function hg(n){return function(t,r){if(typeof t!="object"||t===null)return!1;let i=t;for(let s of r)if(s in i&&typeof i[s]=="function")return!0;return!1}(n,["next","error","complete"])}var Yn=class extends Jr{constructor(e,t,r,i){super(e,t,r,i),this.type="firestore",this._queue=new ja,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){let e=this._firestoreClient.terminate();this._queue=new ja(e),this._firestoreClient=void 0,await e}}};function G_(n,e,t){t||(t=us);let r=Ei(n,"firestore");if(r.isInitialized(t)){let i=r.getImmediate({identifier:t}),s=r.getOptions(t);if(vt(s,e))return i;throw new x(P.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new x(P.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<E_)throw new x(P.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&Mt(e.host)&&Qs(e.host),r.initialize({options:e,instanceIdentifier:t})}function W_(n,e){let t=typeof n=="object"?n:eu(),r=typeof n=="string"?n:e||us,i=Ei(t,"firestore").getImmediate({identifier:r});if(!i._initialized){let s=Nf("firestore");s&&rb(i,...s)}return i}function K_(n){if(n._terminated)throw new x(P.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||ib(n),n._firestoreClient}function ib(n){var e,t,r;let i=n._freezeSettings(),s=function(c,u,h,f){return new dl(c,u,h,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,j_(f.experimentalLongPollingOptions),f.useFetchStreams,f.isUsingEmulator)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,i);n._componentsProvider||!((t=i.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=i.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),n._firestoreClient=new Mh(n._authCredentials,n._appCheckCredentials,n._queue,s,n._componentsProvider&&function(c){let u=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(u),_online:u}}(n._componentsProvider))}var Jt=class n{constructor(e){this._byteString=e}static fromBase64String(e){try{return new n(ge.fromBase64String(e))}catch(t){throw new x(P.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new n(ge.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:n._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Is(e,n._jsonSchema))return n.fromBase64String(e.bytes)}};Jt._jsonSchemaVersion="firestore/bytes/1.0",Jt._jsonSchema={type:de("string",Jt._jsonSchemaVersion),bytes:de("string")};var ys=class{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new x(P.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new me(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}};var vs=class{constructor(e){this._methodName=e}};var Xt=class n{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new x(P.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new x(P.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return W(this._lat,e._lat)||W(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:n._jsonSchemaVersion}}static fromJSON(e){if(Is(e,n._jsonSchema))return new n(e.latitude,e.longitude)}};Xt._jsonSchemaVersion="firestore/geoPoint/1.0",Xt._jsonSchema={type:de("string",Xt._jsonSchemaVersion),latitude:de("number"),longitude:de("number")};var Zt=class n{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:n._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Is(e,n._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(t=>typeof t=="number"))return new n(e.vectorValues);throw new x(P.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}};Zt._jsonSchemaVersion="firestore/vectorValue/1.0",Zt._jsonSchema={type:de("string",Zt._jsonSchemaVersion),vectorValues:de("object")};var sb=/^__.*__$/,Fh=class{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new pt(e,this.data,this.fieldMask,t,this.fieldTransforms):new an(e,this.data,t,this.fieldTransforms)}};function H_(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw F(40011,{Ec:n})}}var Uh=class n{constructor(e,t,r,i,s,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.Ac(),this.fieldTransforms=s||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Ec(){return this.settings.Ec}Rc(e){return new n(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Vc(e){var t;let r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.Rc({path:r,mc:!1});return i.fc(e),i}gc(e){var t;let r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.Rc({path:r,mc:!1});return i.Ac(),i}yc(e){return this.Rc({path:void 0,mc:!0})}wc(e){return za(e,this.settings.methodName,this.settings.Sc||!1,this.path,this.settings.bc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}Ac(){if(this.path)for(let e=0;e<this.path.length;e++)this.fc(this.path.get(e))}fc(e){if(e.length===0)throw this.wc("Document fields must not be empty");if(H_(this.Ec)&&sb.test(e))throw this.wc('Document fields cannot begin and end with "__"')}},Bh=class{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||ec(e)}Dc(e,t,r,i=!1){return new Uh({Ec:e,methodName:t,bc:r,path:me.emptyPath(),mc:!1,Sc:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}};function ob(n){let e=n._freezeSettings(),t=ec(n._databaseId);return new Bh(n._databaseId,!!e.ignoreUndefinedProperties,t)}function ab(n,e,t,r,i,s={}){let o=n.Dc(s.merge||s.mergeFields?2:0,e,t,i);X_("Data must be an object, but it was:",o,r);let c=Y_(r,o),u,h;if(s.merge)u=new tt(o.fieldMask),h=o.fieldTransforms;else if(s.mergeFields){let f=[];for(let m of s.mergeFields){let _=cb(e,m,t);if(!o.contains(_))throw new x(P.INVALID_ARGUMENT,`Field '${_}' is specified in your field mask but missing from your input data.`);lb(f,_)||f.push(_)}u=new tt(f),h=o.fieldTransforms.filter(m=>u.covers(m.field))}else u=null,h=o.fieldTransforms;return new Fh(new je(c),u,h)}var qh=class n extends vs{_toFieldTransform(e){return new ua(e.path,new rn)}isEqual(e){return e instanceof n}};function Q_(n,e){if(J_(n=Ne(n)))return X_("Unsupported field value:",e,n),Y_(n,e);if(n instanceof vs)return function(r,i){if(!H_(i.Ec))throw i.wc(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.wc(`${r._methodName}() is not currently supported inside arrays`);let s=r._toFieldTransform(i);s&&i.fieldTransforms.push(s)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.mc&&e.Ec!==4)throw e.wc("Nested arrays are not supported");return function(r,i){let s=[],o=0;for(let c of r){let u=Q_(c,i.yc(o));u==null&&(u={nullValue:"NULL_VALUE"}),s.push(u),o++}return{arrayValue:{values:s}}}(n,e)}return function(r,i){if((r=Ne(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return HE(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){let s=oe.fromDate(r);return{timestampValue:Wr(i.serializer,s)}}if(r instanceof oe){let s=new oe(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:Wr(i.serializer,s)}}if(r instanceof Xt)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof Jt)return{bytesValue:r_(i.serializer,r._byteString)};if(r instanceof Ce){let s=i.databaseId,o=r.firestore._databaseId;if(!o.isEqual(s))throw i.wc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:od(r.firestore._databaseId||i.databaseId,r._key.path)}}if(r instanceof Zt)return function(o,c){return{mapValue:{fields:{[td]:{stringValue:nd},[Fr]:{arrayValue:{values:o.toArray().map(h=>{if(typeof h!="number")throw c.wc("VectorValues must only contain numeric values.");return sd(c.serializer,h)})}}}}}}(r,i);throw i.wc(`Unsupported field value: ${Kh(r)}`)}(n,e)}function Y_(n,e){let t={};return kg(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Xn(n,(r,i)=>{let s=Q_(i,e.Vc(r));s!=null&&(t[r]=s)}),{mapValue:{fields:t}}}function J_(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof oe||n instanceof Xt||n instanceof Jt||n instanceof Ce||n instanceof vs||n instanceof Zt)}function X_(n,e,t){if(!J_(t)||!gg(t)){let r=Kh(t);throw r==="an object"?e.wc(n+" a custom object"):e.wc(n+" "+r)}}function cb(n,e,t){if((e=Ne(e))instanceof ys)return e._internalPath;if(typeof e=="string")return Z_(n,e);throw za("Field path arguments must be of type string or ",n,!1,void 0,t)}var ub=new RegExp("[~\\*/\\[\\]]");function Z_(n,e,t){if(e.search(ub)>=0)throw za(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new ys(...e.split("."))._internalPath}catch{throw za(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function za(n,e,t,r,i){let s=r&&!r.isEmpty(),o=i!==void 0,c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let u="";return(s||o)&&(u+=" (found",s&&(u+=` in field ${r}`),o&&(u+=` in document ${i}`),u+=")"),new x(P.INVALID_ARGUMENT,c+n+u)}function lb(n,e){return n.some(t=>t.isEqual(e))}var $a=class{constructor(e,t,r,i,s){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new Ce(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){let e=new jh(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){let t=this._document.data.field(ey("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}},jh=class extends $a{data(){return super.data()}};function ey(n,e){return typeof e=="string"?Z_(n,e):e instanceof ys?e._internalPath:e._delegate._internalPath}function hb(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new x(P.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}var zh=class{convertValue(e,t="none"){switch(en(e)){case 0:return null;case 1:return e.booleanValue;case 2:return se(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Pt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw F(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){let r={};return Xn(e,(i,s)=>{r[i]=this.convertValue(s,t)}),r}convertVectorValue(e){var t,r,i;let s=(i=(r=(t=e.fields)===null||t===void 0?void 0:t[Fr].arrayValue)===null||r===void 0?void 0:r.values)===null||i===void 0?void 0:i.map(o=>se(o.doubleValue));return new Zt(s)}convertGeoPoint(e){return new Xt(se(e.latitude),se(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":let r=Ya(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(cs(e));default:return null}}convertTimestamp(e){let t=Rt(e);return new oe(t.seconds,t.nanos)}convertDocumentKey(e,t){let r=ee.fromString(e);j(f_(r),9688,{name:e});let i=new Mr(r.get(1),r.get(3)),s=new L(r.popFirst(5));return i.isEqual(t)||Oe(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}};function db(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}var Ln=class{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}},jn=class n extends $a{constructor(e,t,r,i,s,o){super(e,t,r,i,o),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){let t=new Pr(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){let r=this._document.data.field(ey("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new x(P.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e=this._document,t={};return t.type=n._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}};jn._jsonSchemaVersion="firestore/documentSnapshot/1.0",jn._jsonSchema={type:de("string",jn._jsonSchemaVersion),bundleSource:de("string","DocumentSnapshot"),bundleName:de("string"),bundle:de("string")};var Pr=class extends jn{data(e={}){return super.data(e)}},Cr=class n{constructor(e,t,r,i){this._firestore=e,this._userDataWriter=t,this._snapshot=i,this.metadata=new Ln(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){let e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new Pr(this._firestore,this._userDataWriter,r.key,r,new Ln(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){let t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new x(P.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(i,s){if(i._snapshot.oldDocs.isEmpty()){let o=0;return i._snapshot.docChanges.map(c=>{let u=new Pr(i._firestore,i._userDataWriter,c.doc.key,c.doc,new Ln(i._snapshot.mutatedKeys.has(c.doc.key),i._snapshot.fromCache),i.query.converter);return c.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}})}{let o=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(c=>s||c.type!==3).map(c=>{let u=new Pr(i._firestore,i._userDataWriter,c.doc.key,c.doc,new Ln(i._snapshot.mutatedKeys.has(c.doc.key),i._snapshot.fromCache),i.query.converter),h=-1,f=-1;return c.type!==0&&(h=o.indexOf(c.doc.key),o=o.delete(c.doc.key)),c.type!==1&&(o=o.add(c.doc),f=o.indexOf(c.doc.key)),{type:fb(c.type),doc:u,oldIndex:h,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new x(P.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e={};e.type=n._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=es.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;let t=[],r=[],i=[];return this.docs.forEach(s=>{s._document!==null&&(t.push(s._document),r.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),i.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}};function fb(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return F(61501,{type:n})}}Cr._jsonSchemaVersion="firestore/querySnapshot/1.0",Cr._jsonSchema={type:de("string",Cr._jsonSchemaVersion),bundleSource:de("string","QuerySnapshot"),bundleName:de("string"),bundle:de("string")};var Ga=class extends zh{constructor(e){super(),this.firestore=e}convertBytes(e){return new Jt(e)}convertReference(e){let t=this.convertDocumentKey(e,this.firestore._databaseId);return new Ce(this.firestore,null,t)}};function ty(n,e,t){n=Mn(n,Ce);let r=Mn(n.firestore,Yn),i=db(n.converter,e,t);return iy(r,[ab(ob(r),"setDoc",n._key,i,n.converter!==null,t).toMutation(n._key,He.none())])}function ny(n){return iy(Mn(n.firestore,Yn),[new Gr(n._key,He.none())])}function ry(n,...e){var t,r,i;n=Ne(n);let s={includeMetadataChanges:!1,source:"default"},o=0;typeof e[o]!="object"||hg(e[o])||(s=e[o++]);let c={includeMetadataChanges:s.includeMetadataChanges,source:s.source};if(hg(e[o])){let m=e[o];e[o]=(t=m.next)===null||t===void 0?void 0:t.bind(m),e[o+1]=(r=m.error)===null||r===void 0?void 0:r.bind(m),e[o+2]=(i=m.complete)===null||i===void 0?void 0:i.bind(m)}let u,h,f;if(n instanceof Ce)h=Mn(n.firestore,Yn),f=Xa(n._key.path),u={next:m=>{e[o]&&e[o](pb(h,n,m))},error:e[o+1],complete:e[o+2]};else{let m=Mn(n,qa);h=Mn(m.firestore,Yn),f=m._query;let _=new Ga(h);u={next:S=>{e[o]&&e[o](new Cr(h,_,m,S))},error:e[o+1],complete:e[o+2]},hb(n._query)}return function(_,S,C,N){let k=new Lh(N),$=new Ph(S,k,C);return _.asyncQueue.enqueueAndForget(async()=>UT(await og(_),$)),()=>{k.Ou(),_.asyncQueue.enqueueAndForget(async()=>BT(await og(_),$))}}(K_(h),f,c,u)}function iy(n,e){return function(r,i){let s=new ht;return r.asyncQueue.enqueueAndForget(async()=>HT(await nb(r),i,s)),s.promise}(K_(n),e)}function pb(n,e,t){let r=t.docs.get(e._key),i=new Ga(n);return new jn(n,i,e._key,r,new Ln(t.hasPendingWrites,t.fromCache),e.converter)}var $h=class{constructor(e){let t;this.kind="persistent",e!=null&&e.tabManager?(e.tabManager._initialize(e),t=e.tabManager):(t=yd(void 0),t._initialize(e)),this._onlineComponentProvider=t._onlineComponentProvider,this._offlineComponentProvider=t._offlineComponentProvider}toJSON(){return{kind:this.kind}}};function sy(n){return new $h(n)}var Gh=class{constructor(e){this.forceOwnership=e,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=Yr.provider,this._offlineComponentProvider={build:t=>new xh(t,e==null?void 0:e.cacheSizeBytes,this.forceOwnership)}}};function yd(n){return new Gh(n==null?void 0:n.forceOwnership)}function oy(){return new qh("serverTimestamp")}(function(e,t=!0){(function(i){Xr=i})(qt),Bt(new We("firestore",(r,{instanceIdentifier:i,options:s})=>{let o=r.getProvider("app").getImmediate(),c=new Yn(new Zu(r.getProvider("auth-internal")),new nl(o,r.getProvider("app-check-internal")),function(h,f){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new x(P.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Mr(h.options.projectId,f)}(o,i),o);return s=Object.assign({useFetchStreams:t},s),c._setSettings(s),c},"PUBLIC").setMultipleInstances(!0)),Ze(Xp,Zp,e),Ze(Xp,Zp,"esm2017")})();var O=n=>document.getElementById(n),we=(n,e,t)=>{let r=document.createElement(n);return e&&(r.className=e),t!=null&&(r.textContent=t),r},tr=n=>String(n).padStart(2,"0"),$e=n=>`${n.getFullYear()}-${tr(n.getMonth()+1)}-${tr(n.getDate())}`,uy=n=>{let[e,t,r]=n.split("-").map(Number);return new Date(e,t-1,r)},xe=()=>{let n=new Date;return new Date(n.getFullYear(),n.getMonth(),n.getDate())},hn=(n,e)=>{let t=new Date(n);return t.setDate(t.getDate()+e),t},ly=n=>hn(n,-((n.getDay()+6)%7)),Je=(n,e)=>new Intl.DateTimeFormat("en-US",e).format(n),Id=n=>n.length?n.reduce((e,t)=>e+t,0)/n.length:null,Rs=n=>n==null?"\u2013":(Math.round(n*10)/10).toString(),Td=(n,e,t)=>n===1?e:t,ic=["Terrible day","Very bad day","Bad day","Rough day","So-so","Ordinary day","Decent day","Good day","Very good day","Great day","The best"],ay;function ei(n){let e=O("toast");e.textContent=n,e.classList.add("show"),clearTimeout(ay),ay=setTimeout(()=>e.classList.remove("show"),1800)}var nc=window.MOOD_CONFIG&&window.MOOD_CONFIG.firebase||{},sc=!nc.apiKey||/^PASTE/.test(nc.apiKey);function mb(){let n=/^(localhost|127\.|192\.168\.)/.test(location.hostname),e=Zc({...nc,authDomain:n?`${nc.projectId}.firebaseapp.com`:location.host}),t=ku(e,{persistence:[xu,Ou],popupRedirectResolver:Fu}),r;try{r=G_(e,{localCache:sy({tabManager:yd()})})}catch{r=W_(e)}let i=null;return{onUser(s){Mu(t).catch(o=>{O("loginErr").textContent=hy(o)}),Du(t,o=>s(o&&{uid:o.uid,name:o.displayName||"No name",email:o.email||"",photo:o.photoURL}))},signIn(){let s=new Tn;return s.setCustomParameters({prompt:"select_account"}),Lu(t,s)},signOut(){return i&&i(),Nu(t)},listen(s,o){i&&i(),i=ry($_(r,"users",s,"days"),c=>{let u=new Map;c.forEach(h=>u.set(h.id,h.data())),o(u)},c=>ei("Loading error: "+(c.code||c.message)))},save(s,o,c,u){ty(_d(r,"users",s,"days",o),{score:c,note:u,updatedAt:oy()}).catch(h=>ei("Not saved: "+(h.code||h.message)))},remove(s,o){ny(_d(r,"users",s,"days",o)).catch(c=>ei("Not deleted: "+(c.code||c.message)))},token(){return t.currentUser?t.currentUser.getIdToken():Promise.resolve(null)}}}function hy(n){let e=n&&n.code||"";return e.includes("unauthorized-domain")?"This domain is not added in Firebase \u2192 Authentication \u2192 Settings \u2192 Authorized domains":e.includes("network")?"No internet connection":e.includes("cancelled")||e.includes("closed")?"":"Could not sign in: "+(e||n.message||n)}function gb(){let n="mood-demo",e=()=>{try{return new Map(Object.entries(JSON.parse(localStorage.getItem(n)||"{}")))}catch{return new Map}},t=null,r=i=>{try{localStorage.setItem(n,JSON.stringify(Object.fromEntries(i)))}catch{}t&&t(e())};return{onUser(i){i({uid:"demo",name:"Demo",email:"Data stays on this device only",photo:null})},signIn(){},signOut(){ei("There is nothing to sign out of in demo mode")},listen(i,s){t=s,s(e())},save(i,s,o,c){let u=e();u.set(s,{score:o,note:c}),r(u)},remove(i,s){let o=e();o.delete(s),r(o)},token(){return Promise.resolve(null)}}}var nr=sc?gb():mb(),Ct=null,kt=new Map,fe=$e(xe()),Dt=!1,rt="week",it=0;function _b(){nr.onUser(n=>{if(Ct=n,O("login").classList.toggle("hide",!!n),O("main").classList.toggle("hide",!n),!n){kt=new Map;return}O("demoBanner").classList.toggle("hide",!sc),Ab(),nr.listen(n.uid,e=>{kt=e,dn(),Nt()}),Rb()})}O("signInBtn").onclick=()=>{O("loginErr").textContent="",nr.signIn().catch(n=>{O("loginErr").textContent=hy(n)})};document.querySelectorAll("#tabbar button").forEach(n=>n.onclick=()=>dy(n.dataset.tab));function dy(n){document.querySelectorAll("#tabbar button").forEach(e=>e.classList.toggle("on",e.dataset.tab===n)),document.querySelectorAll(".tab").forEach(e=>e.classList.toggle("hide",e.id!=="tab-"+n)),scrollTo(0,0),n==="stats"&&Nt()}var Ps=O("slider");function fy(){let n=Number(Ps.value);Ps.style.setProperty("--p",n*10+"%"),O("scoreNum").textContent=n,O("scoreLabel").textContent=ic[n]}Ps.addEventListener("input",()=>{fy();let n=O("scoreNum");n.classList.add("bump"),setTimeout(()=>n.classList.remove("bump"),120)});document.querySelectorAll("#daySeg button").forEach(n=>n.onclick=()=>{fe=$e(hn(xe(),Number(n.dataset.off))),Dt=!1,dn()});function dn(){let n=$e(xe()),e=$e(hn(xe(),-1)),t=uy(fe);O("todayTitle").textContent=fe===n?"Today":fe===e?"Yesterday":Je(t,{day:"numeric",month:"long"});let r=Je(t,{weekday:"long",day:"numeric",month:"long"});O("todayDate").textContent=r.charAt(0).toUpperCase()+r.slice(1),document.querySelectorAll("#daySeg button").forEach(o=>o.classList.toggle("on",$e(hn(xe(),Number(o.dataset.off)))===fe)),O("question").textContent=fe===n?"How was your day?":"How was this day?";let i=kt.get(fe),s=!i||Dt;O("form").classList.toggle("hide",!s),O("saved").classList.toggle("hide",s),s?((!O("form").dataset.for||O("form").dataset.for!==fe+(i?"1":"0")+Dt)&&(Ps.value=i?i.score:5,O("note").value=i&&i.note||"",O("form").dataset.for=fe+(i?"1":"0")+Dt),fy(),O("saveBtn").textContent=i?"Save changes":"Save",O("cancelBtn").classList.toggle("hide",!i)):(O("savedWhen").textContent=fe===n?"Your day today":"Your day",O("savedScore").textContent=i.score,O("savedLabel").textContent=ic[i.score],O("savedNote").textContent=i.note||"",O("savedNote").classList.toggle("hide",!i.note)),wd()}O("saveBtn").onclick=()=>{let n=Number(Ps.value),e=O("note").value.trim().slice(0,1e3);nr.save(Ct.uid,fe,n,e),kt.set(fe,{score:n,note:e}),Dt=!1,O("form").dataset.for="",dn(),Nt(),ei("Saved"),fe===$e(xe())&&rr({action:"rated",date:fe})};O("editBtn").onclick=()=>{Dt=!0,O("form").dataset.for="",dn()};O("cancelBtn").onclick=()=>{Dt=!1,dn()};var rc=null;function wd(){clearTimeout(rc),rc=null,O("delBtn").textContent="Delete rating"}O("delBtn").onclick=()=>{if(!rc){O("delBtn").textContent="Tap again to delete",rc=setTimeout(wd,3500);return}wd(),nr.remove(Ct.uid,fe),kt.delete(fe),Dt=!1,O("form").dataset.for="",dn(),Nt(),ei("Rating deleted"),fe===$e(xe())&&rr({action:"rated",date:null})};document.querySelectorAll("#periodSeg button").forEach(n=>n.onclick=()=>{rt=n.dataset.p,it=0,document.querySelectorAll("#periodSeg button").forEach(e=>e.classList.toggle("on",e===n)),Nt()});O("prevP").onclick=()=>{it--,Nt()};O("nextP").onclick=()=>{it<0&&(it++,Nt())};var yb=["J","F","M","A","M","J","J","A","S","O","N","D"],vb=["Mo","Tu","We","Th","Fr","Sa","Su"];function py(n,e){let t=xe();if(n==="week"){let i=hn(ly(t),e*7);return Array.from({length:7},(s,o)=>{let c=hn(i,o),u=$e(c),h=kt.get(u);return{key:u,date:c,label:vb[o],value:h?h.score:null,note:h&&h.note,isToday:u===$e(t),future:c>t}})}if(n==="month"){let i=new Date(t.getFullYear(),t.getMonth()+e,1),s=new Date(i.getFullYear(),i.getMonth()+1,0).getDate();return Array.from({length:s},(o,c)=>{let u=new Date(i.getFullYear(),i.getMonth(),c+1),h=$e(u),f=kt.get(h),m=c+1;return{key:h,date:u,label:(m===1||m%5===0)&&m!==30||m===s?String(m):"",value:f?f.score:null,note:f&&f.note,isToday:h===$e(t),future:u>t}})}let r=t.getFullYear()+e;return Array.from({length:12},(i,s)=>{let o=[];kt.forEach((u,h)=>{h.startsWith(`${r}-${tr(s+1)}-`)&&o.push(u.score)});let c=new Date(r,s,1);return{key:`${r}-${tr(s+1)}`,date:c,label:yb[s],value:Id(o),count:o.length,isToday:r===t.getFullYear()&&s===t.getMonth(),future:c>t}})}function Ib(n,e){let t=xe();if(n==="week"){let r=hn(ly(t),e*7),i=hn(r,6);return e===0?"This week":e===-1?"Last week":r.getMonth()===i.getMonth()?`${Je(r,{month:"long"})} ${r.getDate()}\u2013${i.getDate()}`:`${Je(r,{day:"numeric",month:"short"})} \u2013 ${Je(i,{day:"numeric",month:"short"})}`}if(n==="month"){let r=new Date(t.getFullYear(),t.getMonth()+e,1),i=Je(r,{month:"long",year:r.getFullYear()===t.getFullYear()?void 0:"numeric"});return i.charAt(0).toUpperCase()+i.slice(1)}return String(t.getFullYear()+e)}function cy(n,e){if(n!=="year")return py(n,e).filter(i=>i.value!=null).map(i=>({k:i.key,v:i.value,d:i.date}));let t=String(xe().getFullYear()+e),r=[];return kt.forEach((i,s)=>{s.startsWith(t+"-")&&r.push({k:s,v:i.score,d:uy(s)})}),r}function Nt(){if(!Ct)return;O("periodLabel").textContent=Ib(rt,it),O("nextP").disabled=it>=0;let n=cy(rt,it),e=cy(rt,it-1),t=Id(n.map(c=>c.v)),r=Id(e.map(c=>c.v));O("avgV").textContent=Rs(t);let i={week:"last week",month:"last month",year:"last year"}[rt];if(t!=null&&r!=null){let c=Math.round((t-r)*10)/10;O("avgD").textContent=c===0?"same as before":`${c>0?"+":"\u2212"}${Rs(Math.abs(c))} vs ${i}`}else O("avgD").textContent="";let s=py(rt,it),o=rt==="year"?it===0?Math.round((xe()-new Date(xe().getFullYear(),0,1))/864e5)+1:new Date(xe().getFullYear()+it,1,29).getMonth()===1?366:365:s.filter(c=>!c.future).length;if(O("cntV").textContent=n.length,O("cntD").textContent=`of ${o} ${Td(o,"day","days")}`,rt==="year"){let c=s.filter(u=>u.value!=null).sort((u,h)=>h.value-u.value)[0];O("bestT").textContent="Best",O("bestV").textContent=c?Rs(c.value):"\u2013",O("bestD").textContent=c?Je(c.date,{month:"long"}):""}else{let c=n.slice().sort((u,h)=>h.v-u.v||h.d-u.d)[0];O("bestT").textContent="Best",O("bestV").textContent=c?c.v:"\u2013",O("bestD").textContent=c?Je(c.d,{day:"numeric",month:"short"}):""}Tb(s,t),bb(s)}var wb="http://www.w3.org/2000/svg",er=(n,e,t)=>{let r=document.createElementNS(wb,n);for(let i in e)r.setAttribute(i,e[i]);return t&&t.appendChild(r),r};function Eb(n,e,t,r){let i=t-r,s=Math.min(4,e/2,i);return`M${n},${t} V${r+s} Q${n},${r} ${n+s},${r} H${n+e-s} Q${n+e},${r} ${n+e},${r+s} V${t} Z`}function Tb(n,e){let t=O("chart");t.innerHTML="",O("tip").classList.add("hide");let r=t.clientWidth||320,i=220;t.setAttribute("viewBox",`0 0 ${r} ${i}`);let s=22,o=6,c=10,u=24,h=r-s-o,f=i-c-u,m=q=>c+f-q/10*f,_=n.length,S=h/_,C=Math.max(2,Math.min(_===7?30:_===12?18:10,S-2));[0,5,10].forEach(q=>{er("line",{x1:s,x2:r-o,y1:m(q),y2:m(q),stroke:"var(--grid)","stroke-width":1},t),er("text",{x:s-6,y:m(q)+4,"text-anchor":"end"},t).textContent=q});let N=[];n.forEach((q,U)=>{let I=s+S*U+S/2,g=I-C/2;if(q.value!=null){let y=Math.min(m(q.value),m(0)-3);N.push(er("path",{d:Eb(g,C,m(0),y),fill:"var(--accent)"},t))}else N.push(null),q.future||er("circle",{cx:I,cy:m(0)-3,r:1.6,fill:"var(--text3)"},t);if(q.label){let y=er("text",{x:I,y:i-6,"text-anchor":"middle"},t);y.textContent=q.label,q.isToday&&y.setAttribute("class","today")}}),e!=null&&er("line",{x1:s,x2:r-o,y1:m(e),y2:m(e),stroke:"var(--text2)","stroke-width":1,"stroke-dasharray":"3 3"},t);let k=er("rect",{x:s,y:0,width:h,height:i,fill:"transparent"},t),$=-1,B=q=>{let U=t.getBoundingClientRect(),I=Math.floor((q.clientX-U.left-s*(U.width/r))/(S*(U.width/r)));I<0||I>=_||I!==$&&($=I,M(I))},M=q=>{let U=n[q],I=O("tip");N.forEach((Ge,fn)=>Ge&&Ge.setAttribute("opacity",fn===q?1:.35)),I.innerHTML="";let g;rt==="year"?g=Je(U.date,{month:"long"}):g=Je(U.date,{weekday:"short",day:"numeric",month:"long"}),I.appendChild(we("div","",g.charAt(0).toUpperCase()+g.slice(1)));let y=we("b");U.value==null?y.textContent=U.future?"Still ahead":"No rating":rt==="year"?y.textContent=`Average ${Rs(U.value)} \xB7 ${U.count} ${Td(U.count,"day","days")}`:y.textContent=`${U.value} \xB7 ${ic[U.value]}`,I.appendChild(y),U.note&&I.appendChild(we("div","n",U.note)),I.classList.remove("hide");let w=t.parentNode.getBoundingClientRect(),E=t.getBoundingClientRect(),b=(s+S*q+S/2)*(E.width/r)+(E.left-w.left),v=I.offsetWidth/2;I.style.left=Math.max(v+4,Math.min(w.width-v-4,b))+"px"},H=()=>{$=-1,N.forEach(q=>q&&q.setAttribute("opacity",1)),O("tip").classList.add("hide")};k.addEventListener("pointerdown",B),k.addEventListener("pointermove",B),k.addEventListener("pointerleave",q=>{q.pointerType==="mouse"&&H()}),t.dataset.bound||document.addEventListener("pointerdown",q=>{t.contains(q.target)||H()}),t.dataset.bound=1}addEventListener("resize",()=>{O("tab-stats").classList.contains("hide")||Nt()});function bb(n){let e=O("entries");if(e.innerHTML="",rt==="year"){O("entriesTitle").textContent="By month";let r=n.filter(i=>i.count).reverse();if(!r.length)return e.appendChild(we("div","empty","No ratings this year yet"));r.forEach(i=>{let s=we("div","row"),o=we("div","grow"),c=Je(i.date,{month:"long"});o.appendChild(we("div","",c.charAt(0).toUpperCase()+c.slice(1))),o.appendChild(we("div","sub",`${i.count} ${Td(i.count,"day","days")}`)),s.appendChild(o),s.appendChild(we("div","badge",Rs(i.value))),e.appendChild(s)});return}O("entriesTitle").textContent="Entries";let t=n.filter(r=>r.value!=null).reverse();if(!t.length)return e.appendChild(we("div","empty","No ratings in this period yet"));t.forEach(r=>{let i=we("button","row"),s=we("div","grow"),o=Je(r.date,{weekday:"short",day:"numeric",month:"long"});s.appendChild(we("div","",o.charAt(0).toUpperCase()+o.slice(1))),s.appendChild(we("div","sub",r.note||ic[r.value])),i.appendChild(s),i.appendChild(we("div","badge",r.value)),i.appendChild(we("span","chev","\u203A")),i.onclick=()=>{fe=r.key,Dt=!1,dn(),dy("today")},e.appendChild(i)})}function Ab(){let n=O("avatar");if(n.innerHTML="",Ct.photo){let e=we("img");e.src=Ct.photo,e.referrerPolicy="no-referrer",e.alt="",n.appendChild(e)}else n.textContent=(Ct.name||"?").trim().charAt(0).toUpperCase();O("userName").textContent=Ct.name,O("userEmail").textContent=Ct.email}O("signOutBtn").onclick=()=>nr.signOut();for(let n=0;n<24;n++)O("remHour").appendChild(new Option(`${tr(n)}:00`,n));O("remHour").value=21;var my=matchMedia("(display-mode: standalone)").matches||navigator.standalone,gy=/iPhone|iPad|iPod/.test(navigator.userAgent)||navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1;gy&&!my&&(O("installSect").classList.remove("hide"),O("installBox").classList.remove("hide"),O("installText").textContent="Install it to your Home Screen: Share \u2192 Add to Home Screen. On iPhone, reminders only work in the installed app.");var Ed=null;async function rr(n){if(sc)return null;try{let e=await nr.token();if(!e)return null;let t=await fetch("/api/reminder",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+e},body:JSON.stringify(n)});return t.ok?t.json():null}catch{return null}}function mt(n){O("remNote").textContent=n}var Sb="You'll get a notification if you haven't rated the day yet. Optional.";async function Rb(){let n=O("remOn"),e=O("remHour");if(sc)return n.disabled=e.disabled=!0,mt("Reminders will work once Firebase is configured and the app is deployed with its functions.");try{let r=await fetch("/api/reminder",{cache:"no-store"}),i=r.ok&&(r.headers.get("content-type")||"").includes("json")?await r.json():null;Ed=i&&i.vapidPublicKey}catch{}if(!Ed)return n.disabled=e.disabled=!0,mt("The reminder server is not configured. See step 4 in the README.");let t=await rr({action:"get"});t&&(n.checked=!!t.enabled,e.value=t.hour),n.checked&&"Notification"in window&&Notification.permission!=="granted"&&(n.checked=!1),O("remTest").classList.toggle("hide",!n.checked),mt(Sb)}var Pb=n=>{let e="=".repeat((4-n.length%4)%4),t=atob((n+e).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from(t,r=>r.charCodeAt(0))};O("remOn").onchange=async()=>{let n=O("remOn");if(O("remTest").classList.toggle("hide",!n.checked),!n.checked)return await rr({action:"save",enabled:!1}),mt("Reminder is off.");if(!("serviceWorker"in navigator)||!("PushManager"in window)||!("Notification"in window))return n.checked=!1,mt(gy&&!my?"First add the app to your Home Screen, then turn on the reminder there.":"This browser does not support notifications.");try{if(await Notification.requestPermission()!=="granted")return n.checked=!1,mt("Notifications are blocked. Allow them for this app in your phone settings.");let t=await navigator.serviceWorker.ready,r=await t.pushManager.getSubscription()||await t.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:Pb(Ed)});if(!await rr({action:"save",enabled:!0,hour:Number(O("remHour").value),tz:Intl.DateTimeFormat().resolvedOptions().timeZone,subscription:r.toJSON()}))throw new Error("server");mt(`Done. I'll remind you at ${tr(O("remHour").value)}:00 if the day isn't rated yet.`)}catch{n.checked=!1,O("remTest").classList.add("hide"),mt("Could not turn on the reminder. Please try again.")}};O("remTest").onclick=async()=>{let n=await rr({action:"test"});mt(n&&n.devices?"Sent. The notification should arrive in a few seconds.":"Could not send it. Turn the reminder off and on again.")};O("remHour").onchange=async()=>{await rr({action:"save",hour:Number(O("remHour").value),tz:Intl.DateTimeFormat().resolvedOptions().timeZone})&&O("remOn").checked&&mt(`I'll remind you at ${tr(O("remHour").value)}:00 if the day isn't rated yet.`)};var vd=$e(xe());setInterval(()=>{let n=$e(xe());n!==vd&&(fe===vd&&(fe=n),vd=n,dn(),Nt())},6e4);"serviceWorker"in navigator&&navigator.serviceWorker.register("sw.js").catch(()=>{});_b();})();
/*! Bundled license information:

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/component/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/logger/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-35c79a8a.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/webchannel-wrapper/dist/bloom-blob/esm/bloom_blob_es2018.js:
  (** @license
  Copyright The Closure Library Authors.
  SPDX-License-Identifier: Apache-2.0
  *)
  (** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  *)

@firebase/webchannel-wrapper/dist/webchannel-blob/esm/webchannel_blob_es2018.js:
  (** @license
  Copyright The Closure Library Authors.
  SPDX-License-Identifier: Apache-2.0
  *)
  (** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
  * @license
  * Copyright 2020 Google LLC
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *   http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law | agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES | CONDITIONS OF ANY KIND, either express | implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
