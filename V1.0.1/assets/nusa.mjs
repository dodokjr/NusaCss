const K='nusa-theme',A='nusa-accent',H=()=>document.documentElement,
ls=(k,v)=>{try{return v===undefined?localStorage.getItem(k):localStorage.setItem(k,v)}catch{}};
export const theme={
  get:()=>ls(K)||'system',
  apply(){const m=this.get();H().classList.toggle('dark',m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme:dark)').matches))},
  set(m){ls(K,m);this.apply()},
  toggle(){this.set(H().classList.contains('dark')?'light':'dark')}
};
export const accent={set(a){a==='indigo'?H().removeAttribute('data-accent'):H().setAttribute('data-accent',a);ls(A,a)}};
export const palette={set(p){p==='default'?H().removeAttribute('data-palette'):H().setAttribute('data-palette',p);ls('nusa-palette',p)}};
export const fmt={rupiah:n=>'Rp '+Number(n).toLocaleString('id-ID')};
export function copy(t){navigator.clipboard?.writeText(t);toast('Disalin ke papan klip',{type:'success'})}
export function sparkline(el,vals,w=120,h=36){const mx=Math.max(...vals),mn=Math.min(...vals),r=mx-mn||1,d='M'+vals.map((v,i)=>[(i/(vals.length-1)*w).toFixed(1),(h-2-(v-mn)/r*(h-4)).toFixed(1)].join(',')).join('L');el.innerHTML=`<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><path class="fill" pathLength="1" d="${d}L${w},${h}L0,${h}Z"/><path pathLength="1" d="${d}"/></svg>`}
export function donut(el,vals,size=120){const t=vals.reduce((a,b)=>a+b,0),R=42,C=2*Math.PI*R,cl=['indigo','pink','teal','amber','sky','violet'];let o=0;el.innerHTML=`<svg class="donut" viewBox="0 0 100 100" width="${size}" height="${size}" style="transform:rotate(-90deg)"><circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--surface-2)" stroke-width="12"/>${vals.map((v,i)=>{const l=v/t*C,s=`<circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--c-${cl[i%6]}-500)" stroke-width="12" stroke-dasharray="${l} ${C-l}" stroke-dashoffset="${-o}"/>`;o+=l;return s}).join('')}</svg>`}
function extras(){
  const P=ls('nusa-palette');P&&palette.set(P);
  document.querySelectorAll('[data-spark]').forEach(el=>sparkline(el,el.dataset.spark.split(',').map(Number)));
  document.querySelectorAll('[data-donut]').forEach(el=>donut(el,el.dataset.donut.split(',').map(Number),+el.dataset.size||120));
  document.querySelectorAll('[data-tilt]').forEach(el=>{el.onmousemove=e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(800px) rotateY(${x*10}deg) rotateX(${-y*10}deg)`};el.onmouseleave=()=>el.style.transform=''});
  const sb=document.querySelector('.scroll-bar');sb&&addEventListener('scroll',()=>sb.style.width=scrollY/(document.documentElement.scrollHeight-innerHeight)*100+'%',{passive:true});
  const rows=t=>[...t.tBodies[0].rows];
  document.querySelectorAll('.table-sort').forEach(t=>t.querySelectorAll('th').forEach((th,i)=>th.onclick=()=>{const dir=th.dataset.d=th.dataset.d==='1'?'-1':'1',v=r=>r.cells[i].textContent.trim();rows(t).sort((a,b)=>dir*v(a).localeCompare(v(b),'id',{numeric:true})).forEach(r=>t.tBodies[0].append(r))}));
  document.querySelectorAll('[data-filter]').forEach(inp=>inp.oninput=()=>{const q=inp.value.toLowerCase();rows(document.querySelector(inp.dataset.filter)).forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(q))});
}
export function reveal(root=document){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
  root.querySelectorAll('.reveal:not(.in)').forEach(el=>io.observe(el));
}
export function countUp(el,to=+el.dataset.count,ms=1200){
  const pre=el.dataset.prefix||'',t0=performance.now();
  const f=t=>{const p=Math.min((t-t0)/ms,1);el.textContent=pre+Math.round(to*(1-Math.pow(1-p,3))).toLocaleString('id-ID');p<1&&requestAnimationFrame(f)};
  requestAnimationFrame(f);
}
export function toast(msg,{type='info',ms=3000,pos='bottom'}={}){
  const cls='toasts'+(pos==='top'?' toasts-top':''),box=document.querySelector(pos==='top'?'.toasts-top':'.toasts:not(.toasts-top)')||document.body.appendChild(Object.assign(document.createElement('div'),{className:cls}));
  const ic={info:'info',success:'check',error:'x',warn:'alert'}[type]||'info',t=document.createElement('div');
  t.className='toast toast-'+type;t.innerHTML=`<i class="i i-${ic}"></i><span></span><button class="alert-close" data-dismiss aria-label="Tutup"><i class="i i-x"></i></button>`;t.children[1].textContent=msg;box.append(t);
  setTimeout(()=>{if(t.isConnected){t.style.opacity=0;setTimeout(()=>t.remove(),300)}},ms);
}
const closeM=m=>{m?.classList.remove('open');if(!document.querySelector('.modal.open'))document.body.classList.remove('nu-lock')};
export const modal={open:id=>{document.getElementById(id)?.classList.add('open');document.body.classList.add('nu-lock')},close:id=>closeM(document.getElementById(id))};
export function dialog({title='',text='',type='info',ok='OK',cancel=null,input=null}={}){
  return new Promise(res=>{
    const k={info:['info','sky'],success:['check','green'],warn:['alert','amber'],error:['x','red']}[type]||['info','sky'],m=document.createElement('div');
    m.className='modal modal-sm modal-blur open';m.dataset.dyn=1;
    m.innerHTML=`<div class="card stack center"><div class="modal-icon" style="--a:var(--c-${k[1]}-500)"><i class="i i-${k[0]}"></i></div><h3 class="font-bold"></h3><p class="text-muted"></p><input class="input" hidden><div class="row justify-center"><button class="btn btn-ghost" data-v="0" hidden></button><button class="btn" data-v="1"></button></div></div>`;
    const [h,p,inp,no,yes]=['h3','p','input','[data-v="0"]','[data-v="1"]'].map(s=>m.querySelector(s));
    h.textContent=title;h.hidden=!title;p.textContent=text;yes.textContent=ok;
    if(cancel){no.hidden=false;no.textContent=cancel}
    if(input!==null){inp.hidden=false;inp.placeholder=input}
    const done=v=>{removeEventListener('keydown',esc);m.remove();document.body.classList.toggle('nu-lock',!!document.querySelector('.modal.open'));res(v)},
    esc=e=>e.key==='Escape'&&done(input!==null?null:false);
    addEventListener('keydown',esc);
    m.onclick=e=>{const v=e.target.dataset?.v;if(e.target===m||v==='0')done(input!==null?null:false);else if(v==='1')done(input!==null?inp.value:true)};
    document.body.append(m);document.body.classList.add('nu-lock');(input!==null?inp:yes).focus();
  })
}
export const alertBox=(text,o={})=>dialog({text,...o});
export const promptBox=(text,o={})=>dialog({text,input:'',cancel:'Batal',ok:'Simpan',...o});
export const confirmBox=(text,o={})=>dialog({text,type:'warn',cancel:'Batal',ok:'Ya, lanjut',...o});
export function typewriter(el,words,speed=80){
  let w=0,c=0,del=false;
  (function tick(){const s=words[w];el.textContent=s.slice(0,c);
    if(!del&&c===s.length){del=true;return setTimeout(tick,1400)}
    if(del&&c===0){del=false;w=(w+1)%words.length}
    c+=del?-1:1;setTimeout(tick,del?speed/2:speed)})();
}
export function init(){
  theme.apply();const a=ls(A);a&&accent.set(a);extras();reveal();
  document.querySelectorAll('[data-count]').forEach(el=>{const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){countUp(el);io.disconnect()}});io.observe(el)});
  document.querySelectorAll('[data-type]').forEach(el=>typewriter(el,el.dataset.type.split('|')));
  document.addEventListener('click',e=>{
    if(e.target.classList?.contains('modal'))closeM(e.target);
    const bt=e.target.closest('.btn');if(bt){const r=bt.getBoundingClientRect(),s=Math.max(r.width,r.height),sp=document.createElement('span');sp.className='ripple';sp.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;bt.append(sp);setTimeout(()=>sp.remove(),600)}
    const dm=e.target.closest('[data-dismiss]');if(dm){const x=dm.closest('.alert,.toast,.banner');if(x){x.style.opacity=0;setTimeout(()=>x.remove(),250)}}
    const tb=e.target.closest('[data-tab]');if(tb)tb.closest('.tabs').querySelectorAll('.tab').forEach(x=>{x.classList.toggle('active',x===tb);const p=document.getElementById(x.dataset.tab);if(p)p.hidden=x!==tb});
    const t=e.target.closest('[data-nu-theme],[data-nu-palette],[data-nu-toggle],[data-copy],[data-nu-accent],[data-nu-open],[data-nu-close]');if(!t)return;const d=t.dataset;
    if('nuTheme' in d)theme.toggle();if(d.nuAccent)accent.set(d.nuAccent);if(d.nuPalette)palette.set(d.nuPalette);if(d.nuToggle)document.getElementById(d.nuToggle)?.classList.toggle('open');if(d.copy)copy(d.copy);if(d.nuOpen)modal.open(d.nuOpen);if('nuClose' in d)closeM(t.closest('.modal'));
  });
  addEventListener('keydown',e=>{if(e.key==='Escape')closeM([...document.querySelectorAll('.modal.open:not([data-dyn])')].pop())});
  matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>theme.apply());
}
if(typeof document!=='undefined')document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
