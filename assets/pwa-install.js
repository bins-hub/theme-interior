/* TheMi: show a first-visit install invitation, then request native installation only on user action. */
(function(){
"use strict";
if(!window.isSecureContext)return;
const standalone=()=>window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
if("serviceWorker" in navigator){
 const register=()=>navigator.serviceWorker.register("/sw.js",{scope:"/",updateViaCache:"none"}).catch(()=>{});
 if(document.readyState==="complete")register();else window.addEventListener("load",register,{once:true});
}
const key="themi.pwa.banner.dismissUntil.v1";
let pending=null,busy=false,installed=standalone(),banner=null;
function dismissed(){try{return Number(localStorage.getItem(key)||0)>Date.now();}catch{return false;}}
function hide(){if(banner)banner.hidden=true;}
function snooze(){try{localStorage.setItem(key,String(Date.now()+7*86400000));}catch{}hide();}
function show(){if(banner&&!installed&&!standalone()&&!dismissed())banner.hidden=false;}
window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();pending=event;});
window.addEventListener("appinstalled",()=>{installed=true;pending=null;hide();});
function init(){
 banner=document.getElementById("themi-install-banner");
 if(!banner)return;
 const yes=document.getElementById("themi-install-yes"),later=document.getElementById("themi-install-later"),close=document.getElementById("themi-install-close"),help=document.getElementById("themi-install-help");
 function guide(){
  const ua=navigator.userAgent||"";
  const ios=/iPhone|iPad|iPod/i.test(ua)||(/Macintosh/i.test(ua)&&navigator.maxTouchPoints>1);
  help.textContent=ios?"Safari 공유 버튼 → 홈 화면에 추가 → 추가를 누르세요. 다른 앱에서 열었다면 Safari로 접속해 주세요.":/Android/i.test(ua)?"Chrome ⋮ 메뉴 → 앱 설치 또는 홈 화면에 추가를 선택하세요.":"Chrome ⋮ → 캐스팅, 저장, 공유 → 페이지를 앱으로 설치. Edge는 … → 앱 → 이 사이트를 앱으로 설치를 선택하세요. 바탕화면 바로가기 생성 옵션을 확인하세요.";
  help.hidden=false;
 }
 async function install(){
  if(busy)return;
  if(installed||standalone()){hide();return;}
  if(!pending){guide();return;}
  const event=pending;pending=null;busy=true;yes.disabled=true;
  try{
   await event.prompt();const choice=await event.userChoice;
   if(choice.outcome==="accepted"){installed=true;hide();}
   else{help.textContent="설치가 취소되었습니다. 다시 시도하려면 설치하기를 누르거나 브라우저 메뉴를 이용하세요.";help.hidden=false;}
  }catch{guide();}
  finally{busy=false;yes.disabled=false;}
 }
 yes.addEventListener("click",install);
 later.addEventListener("click",snooze);
 close.addEventListener("click",snooze);
 show();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();