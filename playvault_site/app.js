
(()=>{
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const intro=$('#intro'), loading=$('#chargement'), site=$('#site'),
      fill=$('#loadingFill'), loadText=$('#loadingText'), loadPct=$('#loadingPct'),
      world=$('#world'), toast=$('#toast'), shardCount=$('#shardCount'),
      fallback=$('#modelFallback'), model=$('#product3d'),
      zoomValue=$('#zoomValue');

const sectors=[
{x:0,y:0,name:'ACCUEIL'},
{x:1520,y:-140,name:'LOI'},
{x:3050,y:440,name:'BOÎTIER'},
{x:4600,y:-200,name:'FONCTIONS'},
{x:6150,y:360,name:'FONDATION'},
{x:7700,y:-120,name:'MANIFESTE'}
];

let cam={x:0,y:0},keys={},last=performance.now(),running=false,shards=0,zoom=.90,currentSector=0;

$('#startBtn').addEventListener('click',()=>{
  intro.classList.add('hidden');
  loading.classList.remove('hidden');
  let v=0;
  const labels=[
    'Montage des archives locales…',
    'Vérification du registre orphelin…',
    'Activation des droits citoyens…',
    'Initialisation du noyau de reconstruction…',
    'Ouverture du réseau de la Fondation…',
    'Vault prêt.'
  ];
  const t=setInterval(()=>{
    v=Math.min(100,v+Math.floor(Math.random()*6)+3);
    fill.style.width=v+'%';
    loadPct.textContent=v+'%';
    loadText.textContent=labels[Math.min(labels.length-1,Math.floor(v/20))];
    if(v===100){
      clearInterval(t);
      setTimeout(()=>{
        loading.classList.add('hidden');
        site.classList.remove('hidden');
        running=true;
        go(0);
        requestAnimationFrame(loop);
      },420);
    }
  },70);
});

function loop(now){
  if(!running)return;
  const dt=Math.min((now-last)/16.67,2);last=now;
  const speed=(6.8/zoom)*dt;

  if(keys.w||keys.z||keys.arrowup)cam.y-=speed;
  if(keys.s||keys.arrowdown)cam.y+=speed;
  if(keys.a||keys.q||keys.arrowleft)cam.x-=speed;
  if(keys.d||keys.arrowright)cam.x+=speed;

  cam.x=Math.max(-40,Math.min(8800,cam.x));
  cam.y=Math.max(-650,Math.min(1750,cam.y));

  render();
  updateQuest();
  checkShards();
  requestAnimationFrame(loop);
}

function render(){
  const left=innerWidth>900?28:18;
  const top=innerWidth>900?104:88;

  // cam.x / cam.y are ALWAYS the world coordinates shown at the top-left.
  // Therefore switching from navigation to WASD never changes reference mode.
  const tx=left-(cam.x*zoom);
  const ty=top-(cam.y*zoom);

  world.style.transform=`matrix(${zoom},0,0,${zoom},${tx},${ty})`;
}

addEventListener('resize',render);

addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  keys[k]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();
  if(k==='+'||k==='=')setZoom(zoom+.1);
  if(k==='-'||k==='_')setZoom(zoom-.1);
});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

function go(i){
  const s=sectors[i];
  if(!s)return;

  currentSector=i;
  cam.x=s.x;
  cam.y=s.y;

  render();
  updateQuest(i);

  const mn=$('#mobileNav');
  if(mn)mn.classList.remove('open');
}

$$('[data-fast]').forEach(b=>b.addEventListener('click',()=>go(+b.dataset.fast)));

const menuBtn=$('#menuBtn');
if(menuBtn)menuBtn.addEventListener('click',()=>$('#mobileNav').classList.toggle('open'));

function nearest(){
  let bi=0,bd=1e9;
  sectors.forEach((s,i)=>{
    const d=Math.hypot(s.x-cam.x,s.y-cam.y);
    if(d<bd){bd=d;bi=i}
  });
  currentSector=bi;
  return[bi,bd];
}
function updateQuest(force=null){
  const i=force!==null?force:nearest()[0];
  $$('.quest').forEach((q,n)=>{
    q.classList.toggle('active',n===Math.min(i,4));
    const sm=q.querySelector('small');
    if(!sm)return;
    if(n<i){sm.textContent='TERMINÉ';sm.style.color='var(--green)'}
    else if(n===Math.min(i,4)){sm.textContent='ACTIF';sm.style.color='var(--acid)'}
    else{sm.textContent='VERROUILLÉ';sm.style.color=''}
  });
}
function show(t){toast.textContent=t;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1300)}

function setZoom(v){
  zoom=Math.max(.55,Math.min(1.35,Math.round(v*100)/100));
  if(zoomValue)zoomValue.textContent=Math.round(zoom*100)+'%';
  render();
}
$('#zoomIn')?.addEventListener('click',()=>setZoom(zoom+.1));
$('#zoomOut')?.addEventListener('click',()=>setZoom(zoom-.1));
$('#zoomReset')?.addEventListener('click',()=>setZoom(.9));

function checkShards(){
  
  $$('.shard:not(.got)').forEach(s=>{
    const x=parseFloat(getComputedStyle(s).left),y=parseFloat(getComputedStyle(s).top);
    const vx=cam.x+(innerWidth/(2*zoom)); const vy=cam.y+(innerHeight/(2*zoom));
    if(Math.hypot(x-vx,y-vy)<75)collect(s);
  });
}
function collect(s){
  if(s.classList.contains('got'))return;
  s.classList.add('got');shards++;
  shardCount.textContent=`${shards} / 6`;
  show(shards===6?'ARCHIVE COMPLÈTE':'FRAGMENT D’ARCHIVE RÉCUPÉRÉ');
}
$$('.shard').forEach(s=>s.addEventListener('click',()=>collect(s)));

const specs=[
['CARTE MÈRE','PCB multicouche propriétaire — 15 × 15 cm','Relie le SoC, la RAM, le stockage, le réseau, l’alimentation et les ports.','~150 g','40 €'],
['SoC + NPU','ARM Octa-Cœur avec NPU intégré','Exécute le système, les jeux, l’émulation et les modèles d’IA chargés de reconstruire les fichiers et de générer le serveur fantôme.','~15 g','85 €'],
['MÉMOIRE','16 Go LPDDR5X','Conserve en mémoire le système, les modèles d’IA, les jeux et la simulation du serveur local.','~10 g','15 €'],
['STOCKAGE','256 Go UFS + 2 emplacements M.2 NVMe','Permet d’ajouter ses propres SSD pour conserver les jeux, les sauvegardes et l’historique d’apprentissage.','~30 g','30 €'],
['RÉSEAU','Wi‑Fi 7 + Bluetooth 6 + Ethernet 2,5 Gb','Assure les communications réseau, les mises à jour, le réseau local et les connexions distantes sécurisées.','~12 g','12 €'],
['INTERFACE','Écran VFD + bouton coupe-réseau + LED d’état','Affiche les journaux de restauration en temps réel. Le bouton coupe-réseau interrompt physiquement toutes les communications.','~90 g','35 €'],
['REFROIDISSEMENT','Chambre à vapeur passive — 16 × 16 cm','Dissipe la chaleur du SoC et du NPU sans ventilateur afin de garantir un fonctionnement silencieux.','~220 g','25 €'],
['CHÂSSIS','Aluminium anodisé + USB‑C PD 100 W — 18 × 18 × 7 cm','Protège les composants, facilite la dissipation thermique et alimente l’ensemble du système.','~450 g','35 €']
];
$$('.spec').forEach((b,i)=>b.addEventListener('click',()=>{
  $$('.spec').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  const s=specs[i];
  $('#specType').textContent=s[0];$('#specTitle').textContent=s[1];
  $('#specText').textContent=s[2];$('#specWeight').textContent=s[3];$('#specCost').textContent=s[4];
}));

const features=[
['PROTOCOLE // 01','Modulaire','Le boîtier PlayVault a été conçu dès l’origine pour accueillir des pièces personnalisées et facilement interchangeables.'],
['PROTOCOLE // 02','Imprimable','Téléchargez des modèles compatibles et imprimez vos propres éléments chez vous ou dans un fablab.'],
['PROTOCOLE // 03','Communautaire','La communauté imagine de nouvelles façades, coques et accessoires et partage librement ses créations.'],
['PROTOCOLE // 04','Evolutif','Combinez les créations, modifiez-les ou concevez les vôtres pour faire évoluer votre PlayVault au fil du temps.']
];
$$('.feature').forEach((b,i)=>b.addEventListener('click',()=>{
  $$('.feature').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  $('#featureCode').textContent=features[i][0];
  $('#featureTitle').textContent=features[i][1];
  $('#featureText').textContent=features[i][2];
}));
$('#toggleFeature')?.addEventListener('click',()=>{
  const s=$('#featureStatus');const on=s.textContent.includes('ARMÉ');
  s.textContent=on?'○ EN VEILLE':'● ARMÉ';
  s.style.color=on?'#6d7891':'var(--acid)';
  show(on?'La page arrivera bientot avec toutes vos créations !':'La page arrivera bientot avec toutes vos créations !');
});

if(model){
  model.addEventListener('load',()=>{fallback.style.display='none'});
  model.addEventListener('error',()=>{fallback.style.display='grid'});
}
})();
