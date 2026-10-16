/* Interacciones originales; aún son maqueta local y no generan cotizaciones persistidas. */


(function(){

var $=function(s){return document.querySelector(s)},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};

/* texturas de piedra generadas con SVG */

var V='0 0 0 0 .2 1 .2 0 0 0',W='0 0 0 .3 .55 .3 0 0 0',S='0 0 0 0 0 0 0 1 1 1';

var ST=[

 {n:'Calacatta Royal',t:'Mármol',p:'$525',base:'#F3F1ED',L:[['#B9B4AB','0.005 0.014',4,3,W],['#7F7B75','0.007 0.02',4,9,V]]},

 {n:'Calacatta Vitage',t:'Mármol',p:'$525',base:'#EFECE6',L:[['#D2C3A6','0.006 0.015',4,14,W],['#9B8E7A','0.008 0.022',4,5,V]]},

 {n:'Blanco Estelar',t:'Cuarzo',p:'$400',base:'#F1F1EF',L:[['#8D9193','0.9',1,2,S],['#C9CBCB','0.35',2,6,S]]},

 {n:'San Gabriel',t:'Granito negro',p:'$800',base:'#17191A',L:[['#DADBD9','0.75',1,7,S],['#6D6E6B','0.012 0.03',3,4,W]]},

 {n:'Gris Curumba',t:'Granito gris',p:'Consultar',base:'#8E908E',L:[['#2E302F','0.6',1,3,S],['#D6D6D2','0.45',1,8,S]]}

];

function rgb(h){return [1,3,5].map(function(i){return (parseInt(h.substr(i,2),16)/255).toFixed(3)})}

var defs='';ST.forEach(function(s,i){var f='<filter id="st'+i+'" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feFlood flood-color="'+s.base+'" result="b"/>',m='<feMergeNode in="b"/>';

 s.L.forEach(function(l,k){var c=rgb(l[0]);f+='<feTurbulence type="fractalNoise" baseFrequency="'+l[1]+'" numOctaves="'+l[2]+'" seed="'+l[3]+'" result="n'+k+'"/><feColorMatrix in="n'+k+'" type="matrix" values="0 0 0 0 '+c[0]+' 0 0 0 0 '+c[1]+' 0 0 0 0 '+c[2]+' 1 0 0 0 0" result="m'+k+'"/><feComponentTransfer in="m'+k+'" result="v'+k+'"><feFuncA type="table" tableValues="'+l[4]+'"/></feComponentTransfer>';m+='<feMergeNode in="v'+k+'"/>'});

 defs+=f+'<feMerge>'+m+'</feMerge></filter>'});

$('#defs').innerHTML=defs;

function tex(i){return '<svg class="tex" aria-hidden="true" preserveAspectRatio="none"><rect width="100%" height="100%" filter="url(#st'+i+')"/></svg>'}

/* hero */

var arch=$('#arch'),sw=$('#sw');

ST.forEach(function(s,i){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label',s.n);b.innerHTML='<i>'+tex(i)+'</i>';b.addEventListener('click',function(){hero(i)});sw.appendChild(b)});

function hero(i){arch.innerHTML=tex(i);$('#hn').textContent=ST[i].n;$('#hd').textContent=ST[i].t+(ST[i].p==='Consultar'?' · Consulta el precio':' · '+ST[i].p+' de referencia');

 $$('#sw button').forEach(function(b,k){b.setAttribute('aria-pressed',k===i)})}

hero(0);

/* menú */

var bg=$('.burger'),nav=$('nav');bg.addEventListener('click',function(){var o=nav.classList.toggle('open');bg.setAttribute('aria-expanded',o)});

$$('nav a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open')})});

if('IntersectionObserver' in window){var so=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting)$$('nav a').forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+x.target.id)})})},{rootMargin:'-45% 0px -50% 0px'});$$('section[id]').forEach(function(s){so.observe(s)})}

/* cotización */

var list=[];

function draw(){var u=$('#ql');u.innerHTML='';$('#n').textContent=list.length;

 if(!list.length)u.innerHTML='<li>Aún no agregas nada. Elige una piedra, un ambiente o un servicio para empezar.</li>';

 list.forEach(function(t,i){var li=document.createElement('li');li.innerHTML='<span></span><button type="button">Quitar</button>';li.firstChild.textContent=t;li.lastChild.addEventListener('click',function(){list.splice(i,1);draw()});u.appendChild(li)});

 $('#wa').href='https://wa.me/50375755056?text='+encodeURIComponent('Hola, quiero cotizar:\n'+(list.length?list.map(function(x){return '- '+x}).join('\n'):'(aún sin selección, quiero asesoría)'))}

function show(on){$('#panel').classList.toggle('on',on);$('#dim').classList.toggle('on',on);$('#panel').setAttribute('aria-hidden',!on);if(on)$('#close').focus()}

function add(t){if(list.indexOf(t)<0)list.push(t);draw();show(true)}

$('#open').addEventListener('click',function(){show(true)});$('#cta').addEventListener('click',function(){show(true)});$('#close').addEventListener('click',function(){show(false)});$('#dim').addEventListener('click',function(){show(false)});

document.addEventListener('keydown',function(e){if(e.key==='Escape')show(false)});

$$('[data-add]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();add(a.dataset.add)})});

/* colección */

var rail=$('#rail');

ST.forEach(function(s,i){var c=document.createElement('article');c.className='pc';

 c.innerHTML='<div class="ph">'+tex(i)+'<span class="tag">'+s.t+'</span></div><h3>'+s.n+'</h3><div class="pr">'+(s.p==='Consultar'?'Consultar precio':s.p)+' <small>'+(s.p==='Consultar'?'':'precio de referencia')+'</small></div><button class="btn fill sm" type="button">Agregar a cotización</button>';

 c.querySelector('button').addEventListener('click',function(){add(s.n+' · '+s.t)});rail.appendChild(c)});

$$('.ar button').forEach(function(b){b.addEventListener('click',function(){rail.scrollBy({left:b.dataset.d*330,behavior:'smooth'})})});

/* configurador */

var G=[['Negro mate','#26292A'],['Nogal natural','#7E5B3E'],['Blanco hueso','#E8E3D9'],['Verde piedra','#4B554E']],

 O={esp:['Cocina','Baño','Oficina o negocio'],pie:ST.map(function(s){return s.n}),gab:G.map(function(g){return g[0]}),aca:['Pulido','Satinado']},sel={esp:0,pie:0,gab:0,aca:0};

function build(id,key){var d=$(id);O[key].forEach(function(t,i){var l=document.createElement('label');l.innerHTML='<input type="radio" name="'+key+'"'+(i===0?' checked':'')+'><span>'+t+'</span>';l.firstChild.addEventListener('change',function(){sel[key]=i;paint()});d.appendChild(l)})}

build('#o-esp','esp');build('#o-pie','pie');build('#o-gab','gab');build('#o-aca','aca');

function paint(){var g=G[sel.gab][1];

 $('#bs').innerHTML=tex(sel.pie);$('#tp').innerHTML=tex(sel.pie);

 $('#cb').style.background=g;$$('.up').forEach(function(u){u.style.background=g});

 $('#fx').style.borderColor=sel.gab===0?'#C79A63':'#2B3436';

 $('#shine').style.opacity=sel.aca===0?1:0;

 $('#res').innerHTML='<strong style="font-weight:600">Tu combinación:</strong> '+O.esp[sel.esp].toLowerCase()+' con '+ST[sel.pie].n+' ('+ST[sel.pie].t.toLowerCase()+'), gabinetes '+G[sel.gab][0].toLowerCase()+' y acabado '+O.aca[sel.aca].toLowerCase()+'.'}

paint();

$('#guardar').addEventListener('click',function(){var t='Mi diseño: '+O.esp[sel.esp]+' · '+ST[sel.pie].n+' · gabinetes '+G[sel.gab][0]+' · acabado '+O.aca[sel.aca];list=list.filter(function(x){return x.indexOf('Mi diseño')!==0});add(t)});

draw();

})();


