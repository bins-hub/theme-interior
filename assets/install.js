/* JAPULSE-style opt-in PWA installation for TheMi. No automatic prompt or marketing overlay. */
(function(){
"use strict";
if(!window.isSecureContext)return;
const standalone=()=>window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
if("serviceWorker" in navigator){
  const register=()=>navigator.serviceWorker.register("/sw.js",{scope:"/",updateViaCache:"none"}).catch(()=>{});
  if(document.readyState==="complete")register();else window.addEventListener("load",register,{once:true});
}
if(standalone())return;
const isIOS=/iPad|iPhone|iPod/i.test(navigator.userAgent)||(/Macintosh/i.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
const isAndroid=/Android/i.test(navigator.userAgent);
let deferred=null,button=null,close=null,panel=null,busy=false,dismissed=false;
try{dismissed=Number(localStorage.getItem("themi.pwa.dismissUntil")||0)>Date.now();}catch(e){}
function closePanel(){if(panel){panel.remove();panel=null;}}
function removeButton(){closePanel();button?.remove();close?.remove();button=null;close=null;}
function dismiss(){dismissed=true;try{localStorage.setItem("themi.pwa.dismissUntil",String(Date.now()+7*86400000));}catch(e){}removeButton();}
function showHelp(message){
  closePanel();
  panel=document.createElement("section");panel.className="themi-pwa-panel";panel.setAttribute("role","dialog");panel.setAttribute("aria-label","디자인더미 앱 설치 안내");
  const title=document.createElement("h2");title.textContent="디자인더미 앱 설치";
  const p=document.createElement("p");p.textContent=message||(isIOS?"Safari 공유 버튼 → 홈 화면에 추가 → 추가를 선택하세요. 앱 안에서 열었다면 Safari에서 다시 접속하세요.":isAndroid?"Chrome 오른쪽 위 ⋮ → 앱 설치 또는 홈 화면에 추가를 선택하세요.":"Chrome 오른쪽 위 ⋮ → 캐스팅, 저장, 공유 → 페이지를 앱으로 설치 또는 바로가기 만들기. Edge는 … → 앱 → 이 사이트를 앱으로 설치. 바탕화면 바로가기 옵션을 선택하세요.");
  const end=document.createElement("button");end.type="button";end.textContent="닫기";end.addEventListener("click",()=>{closePanel();button?.focus();});
  panel.append(title,p,end);document.body.append(panel);end.focus();
}
async function installNow(){
  if(busy)return;
  if(standalone()){removeButton();return;}
  if(!deferred){showHelp();return;}
  const evt=deferred;deferred=null;busy=true;if(button)button.disabled=true;
  try{
    await evt.prompt();const choice=await evt.userChoice;
    if(choice.outcome==="accepted"){removeButton();}
    else showHelp("설치가 취소되었습니다. 브라우저 메뉴에서 다시 설치할 수 있습니다.");
  }catch(e){showHelp();}
  finally{busy=false;if(button)button.disabled=false;}
}
function ensureButton(){
  if(button||standalone()||dismissed)return;
  button=document.createElement("button");button.type="button";button.className="themi-pwa-cta";button.textContent="↧  디자인더미 앱 설치";button.addEventListener("click",installNow);
  close=document.createElement("button");close.type="button";close.className="themi-pwa-close";close.textContent="×";close.setAttribute("aria-label","설치 안내 7일간 숨기기");close.addEventListener("click",dismiss);
  document.body.append(button,close);
}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;ensureButton();});
window.addEventListener("appinstalled",()=>{deferred=null;removeButton();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&panel){closePanel();button?.focus();}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ensureButton,{once:true});else ensureButton();
})();