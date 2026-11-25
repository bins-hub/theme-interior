const GITHUB='https://api.github.com/repos/bins-hub/theme-interior';
const sha=/^[0-9a-f]{40}$/;
let certCache={url:'',expires:0,keys:[]};
function bytes(s){return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(s.length/4)*4,'=')),c=>c.charCodeAt(0));}
function decode(s){return JSON.parse(new TextDecoder().decode(bytes(s)));}
function response(message,status=400){return Response.json({message},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}});}
async function authorized(request,env){
  if(!env.ACCESS_TEAM_DOMAIN||!env.ACCESS_AUD||!env.ADMIN_EMAIL||!env.GITHUB_TOKEN)return false;
  const team=env.ACCESS_TEAM_DOMAIN.trim().toLowerCase();
  if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(team))return false;
  const issuer='https://'+team, token=request.headers.get('Cf-Access-Jwt-Assertion');
  if(!token||token.length>16000)return false;
  const parts=token.split('.');if(parts.length!==3)return false;
  const [h,p,s]=parts,header=decode(h),payload=decode(p),now=Date.now()/1000;
  if(header.alg!=='RS256'||typeof header.kid!=='string'||payload.iss!==issuer||!Array.isArray(payload.aud)||!payload.aud.includes(env.ACCESS_AUD)||typeof payload.exp!=='number'||payload.exp<=now||(payload.nbf&&payload.nbf>now)||typeof payload.email!=='string'||payload.email.toLowerCase()!==env.ADMIN_EMAIL.trim().toLowerCase())return false;
  const certURL=issuer+'/cdn-cgi/access/certs';
  if(certCache.url!==certURL||certCache.expires<Date.now()||!certCache.keys.some(x=>x.kid===header.kid)){
    const r=await fetch(certURL,{redirect:'error'});if(!r.ok)return false;
    const data=await r.json();if(!Array.isArray(data.keys))return false;
    certCache={url:certURL,expires:Date.now()+300000,keys:data.keys};
  }
  const jwk=certCache.keys.find(x=>x.kid===header.kid&&x.kty==='RSA');if(!jwk)return false;
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  return crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,bytes(s),new TextEncoder().encode(h+'.'+p));
}
function allowedPath(method,path,query){
  if(method==='GET'&&path==='/git/ref/heads/main'&&!query)return true;
  if(method==='GET'&&path.startsWith('/git/commits/')&&sha.test(path.slice(13))&&!query)return true;
  if(method==='GET'&&['/contents/projects/manifest.json','/contents/sitemap.xml'].includes(path)&&/^\?ref=[0-9a-f]{40}$/.test(query))return true;
  if(method==='POST'&&['/git/blobs','/git/trees','/git/commits'].includes(path)&&!query)return true;
  return method==='PATCH'&&path==='/git/refs/heads/main'&&!query;
}
const uuid='[a-f0-9-]{36}';
const projectPath=new RegExp('^projects/'+uuid+'/(?:index\\.html|'+uuid+'\\.jpg)$');
function validBody(path,b){
  if(!b||typeof b!=='object'||Array.isArray(b))return false;
  if(path==='/git/blobs')return b.encoding==='base64'&&typeof b.content==='string'&&b.content.length<=900000&&/^[A-Za-z0-9+/]+={0,2}$/.test(b.content);
  if(path==='/git/trees')return sha.test(b.base_tree)&&Array.isArray(b.tree)&&b.tree.length<=30&&b.tree.every(e=>e&&e.mode==='100644'&&e.type==='blob'&&(['projects/manifest.json','projects/index.html','sitemap.xml'].includes(e.path)||projectPath.test(e.path))&&(typeof e.content==='string'&&e.content.length<=3000000&&e.sha===undefined||e.content===undefined&&(sha.test(e.sha)||e.sha===null)));
  if(path==='/git/commits')return sha.test(b.tree)&&Array.isArray(b.parents)&&b.parents.length===1&&sha.test(b.parents[0])&&typeof b.message==='string'&&/^(Publish|Remove) TheMi project [a-f0-9-]{36}$/.test(b.message);
  return path==='/git/refs/heads/main'&&sha.test(b.sha)&&b.force===false;
}
export default {async fetch(request,env){
  try{
    if(!await authorized(request,env))return response('관리자 인증 또는 서버 설정이 필요합니다.',403);
    const u=new URL(request.url);
    if(!u.pathname.startsWith('/api/github/')){
      if(!['GET','HEAD'].includes(request.method))return response('Method not allowed',405);
      const r=await env.ASSETS.fetch(request),headers=new Headers(r.headers);headers.set('Cache-Control','no-store');headers.set('X-Robots-Tag','noindex, nofollow');headers.set('X-Frame-Options','DENY');headers.set('X-Content-Type-Options','nosniff');return new Response(r.body,{status:r.status,headers});
    }
    const path=u.pathname.slice('/api/github'.length),method=request.method;
    if(!allowedPath(method,path,u.search))return response('허용되지 않은 API',405);
    let body;
    if(method!=='GET'){
      if(request.headers.get('Origin')!==u.origin||!request.headers.get('Content-Type')?.startsWith('application/json'))return response('잘못된 요청 출처',403);
      const raw=await request.text();if(raw.length>4000000)return response('요청 크기 초과',413);
      const data=JSON.parse(raw);if(!validBody(path,data))return response('요청 내용 오류',400);body=JSON.stringify(data);
    }
    const r=await fetch(GITHUB+path+u.search,{method,headers:{Authorization:'Bearer '+env.GITHUB_TOKEN,Accept:'application/vnd.github+json','User-Agent':'TheMi-Admin','X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body,redirect:'error'});
    return new Response(r.body,{status:r.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }catch{return response('관리자 서비스 요청 실패',500);}
}};
