(function(){
  'use strict';
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var root=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  function rng(seed){var s=seed>>>0;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}

  /* ---------- Sound Effects (MP3 Setup) ---------- */
  var sfx = {
    'click': new Audio('lolo_s-stop-474070.mp3'), // Suara stop/click untuk button & day/night
    'levelUp': new Audio('freesound_community-pixel-sound-effect-4-82881.mp3'), // Level transition sound
    'jump': new Audio('lumora_studios-pixel-jump-319167.mp3') // Character jump sound
  };

  Object.values(sfx).forEach(function(audio) {
    audio.load();
  });

  window.playSFX = function(type) {
    if (sfx[type]) {
      sfx[type].currentTime = 0;
      sfx[type].play().catch(function(e){});
    }
  };

  /* ---------- Drawing Pixel Sprites ---------- */
  var GEM={
    diamond:['#1b6f7a','#3fd5d1','#9ff5ef','#ffffff'],
    emerald:['#146b2c','#35c75a','#8cf0a2','#ffffff'],
    gold:['#8a6100','#f2c230','#ffe680','#fff7c8'],
    iron:['#5b5f66','#b9bec6','#e6e9ee','#ffffff'],
    redstone:['#7a1010','#d32f2f','#ff7b7b','#ffd0d0'],
    lapis:['#1a2f8a','#3556d8','#7f9bff','#d6e0ff'],
    amethyst:['#4a2a7a','#8e5bd4','#c7a2ff','#f0e4ff'],
    copper:['#7a3b17','#d9803b','#f5b77a','#ffe3c6'],
    coal:['#1c1c1c','#4a4a4a','#7a7a7a','#bdbdbd']
  };
  
  var SPR={
    hero:{p:{H:'#3a2314',S:'#e9b48e',W:'#ffffff',E:'#2a3f9e',M:'#b5654a',T:'#1fa3b8',P:'#3b43a8',Q:'#2a2f80',B:'#4b4b4b'},r:[
      '..HHHHHHHH..','..HHHHHHHH..','..HSSSSSSH..','..SSSSSSSS..','..SWESSEWS..','..SSSSSSSS..','..SSSMMSSS..','..SSSSSSSS..',
      'TTTTTTTTTTTT','TTTTTTTTTTTT','SSTTTTTTTTSS','SSTTTTTTTTSS','SSTTTTTTTTSS','SSTTTTTTTTSS','SSTTTTTTTTSS','SSTTTTTTTTSS',
      '..PPPQPPPP..','..PPPQPPPP..','..BBBBBBBB..','..BBBBBBBB..']},
    gem:{p:null,r:['..aaaa..','.abccba.','abcddbba','abcbbbba','abbbbbba','.abbbba.','..abba..','...aa...']},
    chest:{p:{o:'#2b1a0c',b:'#9a6a35',g:'#ffd23f'},r:['oooooooo','obbbbbbo','obbbbbbo','oooggooo','obbggbbo','obbbbbbo','obbbbbbo','oooooooo']},
    book:{p:{o:'#2b1010',r:'#b3261e',p:'#f3ead2',w:'#fff5d0'},r:['oooooooo','orrrrrpo','orrwwrpo','orrrrrpo','orrwwrpo','orrrrrpo','orrrrrpo','oooooooo']},
    heart:{p:{r:'#e0312b',w:'#ffb3ad'},r:['.rr..rr.','rrrrrrrr','rrwrrrrr','rrrrrrrr','.rrrrrr.','..rrrr..','...rr...','........']},
    star:{p:{y:'#ffd23f'},r:['...yy...','...yy...','yyyyyyyy','.yyyyyy.','..yyyy..','..yyyy..','.yy..yy.','yy....yy']},
    mail:{p:{o:'#2b2b2b',w:'#f4f4f4',t:'#a9a9a9'},r:['oooooooo','owwwwwwo','ottwwtto','owttttwo','owwttwwo','owwwwwwo','oooooooo','........']},
    grass:{p:{g:'#5fbf3a',G:'#3f8f28',d:'#8a5a33',D:'#6b4426'},r:['gggggggg','gGggGggg','dGddGddd','dddddddd','ddDddddD','dddddDdd','dDddddDd','dddddddd']},
    tree:{p:{l:'#3fa33a',L:'#2a7a2a',t:'#8a5a2b',T:'#6b431f'},r:['..LLLLLL..','.LllllllL.','LllLlllllL','LlllllLllL','LllllllllL','.LlllLlllL','..LLLLLL..','....tT....','....tT....','....tT....','....tT....','....tT....']},
    cloud:{p:{w:'#ffffff',g:'#d3eaf7'},r:['....wwww........','..wwwwwwww.wwww.','.wwwwwwwwwwwwwww','wwwwwwwwwwwwwwww','ggwwwwwwwwwwwwgg','.gggggggggggggg.']},
    sun:{p:{o:'#ffd43b'},r:['....oooo....','..oooooooo..','.oooooooooo.','.oooooooooo.','oooooooooooo','oooooooooooo','oooooooooooo','oooooooooooo','.oooooooooo.','.oooooooooo.','..oooooooo..','....oooo....']},
    moon:{p:{o:'#e9edf7',c:'#b5bdd3'},r:['....oooo....','..oooooooo..','.ooccooooooo','.ooccoooooo.','oooooooocooo','oooooooocooo','ooocoooooooo','ooocccoooooo','.oooooooooo.','.oooooooooo.','..oooooooo..','....oooo....']}
  };
  
  $$('.spr[data-spr]').forEach(function(el){
    var d=SPR[el.getAttribute('data-spr')]; if(!d)return;
    var pal=d.p, g=el.getAttribute('data-gem');
    if(g&&GEM[g]){pal={a:GEM[g][0],b:GEM[g][1],c:GEM[g][2],d:GEM[g][3]}}
    var rows=d.r,w=rows[0].length,h=rows.length;
    var c=document.createElement('canvas');c.width=w;c.height=h;
    var x=c.getContext('2d');
    rows.forEach(function(row,y){for(var i=0;i<w;i++){var col=pal[row.charAt(i)];if(col){x.fillStyle=col;x.fillRect(i,y,1,1)}}});
    c.style.setProperty('--cols',w);c.style.setProperty('--rows',h);
    el.setAttribute('aria-hidden','true');
    el.appendChild(c);
  });

  /* ---------- Block Textures ---------- */
  function tile(size,draw){var c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);return 'url('+c.toDataURL('image/png')+')'}
  function speck(x,n,base,cols,dens,seed){
    x.fillStyle=base;x.fillRect(0,0,n,n);var r=rng(seed);
    for(var j=0;j<n;j++)for(var i=0;i<n;i++){if(r()<dens){x.fillStyle=cols[Math.floor(r()*cols.length)];x.fillRect(i,j,1,1)}}
  }
  function ores(x,n,colors,count,seed){
    var r=rng(seed);
    for(var k=0;k<count;k++){
      var px=2+Math.floor(r()*(n-5)),py=2+Math.floor(r()*(n-5)),c=colors[Math.floor(r()*colors.length)];
      x.fillStyle=c[0];x.fillRect(px,py,3,2);x.fillRect(px+1,py+2,2,1);
      x.fillStyle=c[1];x.fillRect(px+1,py,1,1);
    }
  }
  
  var dirtCols=['#6b4426','#8a5a33','#5d3a1f','#94663a'];
  var set=function(k,v){root.style.setProperty(k,v)};
  try{
    set('--tile-dirt',tile(16,function(x,n){speck(x,n,'#7a4e2c',dirtCols,.45,11)}));
    set('--tile-stone',tile(16,function(x,n){speck(x,n,'#7c7c7c',['#6f6f6f','#8a8a8a','#666666','#939393'],.45,23)}));
    set('--tile-ore',tile(32,function(x,n){
      speck(x,n,'#7c7c7c',['#6f6f6f','#8a8a8a','#666666','#939393'],.45,31);
      ores(x,n,[['#c99a14','#ffe680'],['#2aa9a5','#b8fffb'],['#c9a98a','#f4e3d0'],['#b02525','#ff8a8a']],6,41);
    }));
    set('--tile-deep',tile(32,function(x,n){
      speck(x,n,'#3d3d46',['#34343c','#47474f','#2b2b33'],.5,53);
      ores(x,n,[['#6e3fb8','#d2b4ff'],['#2aa9a5','#b8fffb']],4,61);
    }));
    set('--tile-lava',tile(16,function(x,n){speck(x,n,'#d4540a',['#ff8a1a','#ffb43a','#c23b05','#ff6a0f'],.6,73)}));
    set('--tile-bed',tile(16,function(x,n){speck(x,n,'#2a2a2a',['#1a1a1a','#3a3a3a','#4a4a4a','#111111'],.6,83)}));
    set('--tile-grass',tile(16,function(x,n){
      speck(x,n,'#7a4e2c',dirtCols,.45,11);
      var r=rng(5);
      for(var i=0;i<n;i++){
        var gl=4+(r()<.45?1:0)+(r()<.2?1:0);
        for(var j=0;j<gl;j++){x.fillStyle=j===0?'#7ad94f':(r()<.35?'#4f9f2f':'#5fbf3a');x.fillRect(i,j,1,1)}
      }
    }));
  }catch(e){}

  /* ---------- Stars Generator ---------- */
  (function(){
    var sky=$('#sky'),r=rng(7);
    for(var i=0;i<40;i++){
      var s=document.createElement('i');s.className='star'+(r()<.3?' big':'');
      s.style.left=(r()*100).toFixed(1)+'%';s.style.top=(r()*62).toFixed(1)+'%';
      s.style.animationDelay=(r()*3).toFixed(2)+'s';
      sky.appendChild(s);
    }
  })();

  /* ---------- Day / Night Toggle ---------- */
  var mq=window.matchMedia('(prefers-color-scheme: dark)');
  var themeBtn=$('#themeBtn');
  function eff(){return root.getAttribute('data-theme')||(mq.matches?'dark':'light')}
  function paintMode(){var d=eff()==='dark';$('#modeLabel').textContent=d?'Night':'Day';themeBtn.setAttribute('aria-pressed',d?'true':'false')}
  
  function toggleTheme() {
    playSFX('click');
    root.setAttribute('data-theme',eff()==='dark'?'light':'dark');
    paintMode();
  }
  
  themeBtn.addEventListener('click', toggleTheme);
  $$('.interactive-orb').forEach(function(orb) {
    orb.addEventListener('click', toggleTheme);
  });
  
  new MutationObserver(paintMode).observe(root,{attributes:true,attributeFilter:['data-theme']});
  if(mq.addEventListener)mq.addEventListener('change',paintMode);
  paintMode();

  /* ---------- Character Jump Animation ---------- */
  var heroChar = $('.hero-char');
  heroChar.addEventListener('click', function() {
    if (!heroChar.classList.contains('jump-anim')) {
      playSFX('jump');
      heroChar.classList.add('jump-anim');
      setTimeout(function() {
        heroChar.classList.remove('jump-anim');
      }, 400); 
    }
  });

  /* ---------- Fast Blinking Animation ---------- */
  (function() {
    var heroCanvas = $('.hero-char canvas');
    if (!heroCanvas) return;
    var ctx = heroCanvas.getContext('2d');
    
    function openEyes() {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(3, 4, 1, 1);
      ctx.fillRect(8, 4, 1, 1);
      ctx.fillStyle = '#2a3f9e';
      ctx.fillRect(4, 4, 1, 1);
      ctx.fillRect(7, 4, 1, 1);
    }
    
    function closeEyes() {
      ctx.fillStyle = '#e9b48e';
      ctx.fillRect(3, 4, 2, 1);
      ctx.fillRect(7, 4, 2, 1);
    }
    
    function blink() {
      var delay = Math.random() < 0.1 ? 50 : 100;
      closeEyes();
      setTimeout(function() {
        openEyes();
        if (delay === 50) {
          setTimeout(function() {
            closeEyes();
            setTimeout(openEyes, 50);
          }, 80);
        }
      }, delay);
      setTimeout(blink, 1000 + Math.random() * 2000);
    }
    setTimeout(blink, 1000);
  })();

  /* ---------- SPA Routing & EXP Bar ---------- */
  var ids=['home','about','skills','projects','experience','contact'];
  var biome=['Surface','Dirt Layer','Stone Cave','Treasure Mine','Crystal Cave','Lava Core'];
  var label=['Home','About','Skills','Projects','Experience','Contact'];
  var depths=['0 m', '120 m', '350 m', '600 m', '850 m', '1200 m']; 
  
  var slots=$$('.hb');
  var depthEl=$('#depth');
  var expFill=$('#expFill');
  var expNameLabel=$('#itemName');
  
  function setActive(i){
    slots.forEach(function(a,k){
      a.classList.toggle('on',k===i);
      if(k===i) a.setAttribute('aria-current','true');
      else a.removeAttribute('aria-current');
      a.blur(); // Blur focus outline
    });
    
    expNameLabel.style.animation = 'none';
    expNameLabel.offsetHeight;
    expNameLabel.style.animation = null; 

    expNameLabel.textContent=label[i];
    $('#biome').textContent=biome[i];
    depthEl.textContent=depths[i];
    
    var expPercentage = (i / (ids.length - 1)) * 100;
    expFill.style.width = expPercentage + '%';
  }

  window.go = function(i, fromUserClick){
    $$('.page').forEach(function(el) {
      el.classList.remove('active');
    });
    
    var targetEl = document.getElementById(ids[i]);
    if (targetEl) {
      targetEl.classList.add('active');
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); 
      if(fromUserClick) {
        playSFX('levelUp');
      }
    }
    setActive(i);
  };

  setActive(0);

  slots.forEach(function(a,i){
    a.addEventListener('click',function(e){
      e.preventDefault();
      go(i, true);
    });
  });

  window.addEventListener('keydown',function(e){
    if(e.metaKey||e.ctrlKey||e.altKey)return;
    var n=parseInt(e.key,10);
    if(n>=1&&n<=6) go(n-1, true);
  });

  /* ---------- Copy Email ---------- */
  var cb=$('#copyBtn');
  function pick(){var r=document.createRange();r.selectNodeContents($('#emailVal'));var s=window.getSelection();s.removeAllRanges();s.addRange(r)}
  function flash(t){cb.textContent=t;setTimeout(function(){cb.textContent='Copy'},1800)}
  cb.addEventListener('click',function(){
    playSFX('click');
    var t=cb.getAttribute('data-copy');
    try{navigator.clipboard.writeText(t).then(function(){flash('Copied!')},function(){pick();flash('Selected')})}
    catch(e){pick();flash('Selected')}
  });

})();
