const RARITIES = [
  {name:"일반", rank:0, color:"#c7d0e3", className:"common", power:100, icon:"🙂"},
  {name:"레어", rank:1, color:"#65b8ff", className:"rare", power:220, icon:"😎"},
  {name:"슈퍼레어", rank:2, color:"#c18cff", className:"super", power:450, icon:"🏀"},
  {name:"레전드", rank:3, color:"#ffd166", className:"legend", power:900, icon:"🔥"},
  {name:"레전드 이상", rank:4, color:"#ff7b7b", className:"mythic", power:1800, icon:"⚡"},
  {name:"비밀", rank:5, color:"#ff79d1", className:"secret", power:4000, icon:"👑"}
];

const CHARACTERS = [
  {id:"hwang",name:"황승원",rank:0,icon:"🙂",desc:"기본기 탄탄한 입문 캐릭터"},
  {id:"gao",name:"가오승원",rank:1,icon:"😎",desc:"자신감으로 승부하는 레어 캐릭터"},
  {id:"basket",name:"농구승원",rank:2,icon:"🏀",desc:"코트 위에서 강해지는 슈퍼레어"},
  {id:"sport",name:"운동승원",rank:3,icon:"🔥",desc:"훈련으로 단련된 레전드"},
  {id:"math",name:"수학주원",rank:4,icon:"🧠",desc:"계산된 전략의 레전드 이상"},
  {id:"special",name:"김하진 특수부대",rank:4,icon:"🛡️",desc:"방어력과 집중력이 뛰어난 캐릭터"},
  {id:"north",name:"북한 림하진",rank:4,icon:"❄️",desc:"차가운 침착함을 가진 캐릭터"},
  {id:"genius",name:"영재주원",rank:4,icon:"💡",desc:"빠른 판단력의 천재 캐릭터"},
  {id:"jadeok",name:"자(덕)지섭",rank:5,icon:"📚",desc:"아주 낮은 확률로 등장하는 비밀 캐릭터"},
  {id:"tyrant",name:"폭군 김하진",rank:5,icon:"👑",desc:"최상위 비밀 등급 캐릭터"}
];

const RATES = [70,50,30,15,5];
const GACHA = [
  {rank:0,weight:50},
  {rank:1,weight:27},
  {rank:2,weight:15},
  {rank:3,weight:6},
  {rank:4,weight:1.8},
  {rank:5,weight:.2}
];

const BOTS = [
  {id:"bot1",name:"동화쌤",rank:0,power:70,icon:"🙂"},
  {id:"bot2",name:"성현정쌤",rank:0,power:85,icon:"👩‍🏫"},
  {id:"bot3",name:"윤미화쌤",rank:0,power:100,icon:"👩‍🏫"},
  {id:"bot4",name:"후루베 동화동화쌤",rank:1,power:250,icon:"😎"},
  {id:"bot5",name:"박규연쌤",rank:1,power:320,icon:"🏀"},
  {id:"bot6",name:"이주쌤",rank:2,power:500,icon:"🏀"},
  {id:"bot7",name:"깻잎머리",rank:2,power:650,icon:"🌿"},
  {id:"bot8",name:"임태민쌤",rank:3,power:1000,icon:"🔥"},
  {id:"bot9",name:"나병일쌤",rank:3,power:1300,icon:"📚"},
  {id:"bot10",name:"서정재쌤",rank:4,power:2400,icon:"⚡"},
  {id:"bot13",name:"정현진 쌤",rank:4,power:2600,icon:"🧑‍🏫"},
  {id:"bot11",name:"만석갱",rank:5,power:5000,icon:"👑"},
  {id:"bot12",name:"전설의 포켓몬",rank:5,power:6500,icon:"🐉"}
];

const STORAGE_KEY="seungwonLegendBattleSaveV1";
const SUMMON_COST=10;
const BATTLE_START_COST=5;
const BATTLE_LOSS_COST=50;

function salePrice(c){return [5,10,20,40,80,160][c.rank]||5;}

let state=loadState();
let toastTimer;
let autoSellTimer=null;
let autoEnhanceTimer=null;
let autoBattleRunning=false;
let battleInProgress=false;
let lastAutoEnhanceAt=0;

function loadState(){
  try{
    const s=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(s&&s.inventory)return s;
  }catch(e){}
  return {coins:500,inventory:{hwang:1},wins:0};
}

function save(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  renderAll();
}

function rarity(rank){return RARITIES[rank]||RARITIES[0];}
function character(id){return CHARACTERS.find(c=>c.id===id);}

function totalPower(){
  return Object.entries(state.inventory).reduce((sum,[id,count])=>{
    const c=character(id);
    return sum+(c?rarity(c.rank).power*count:0);
  },0);
}

function toast(msg){
  const el=document.getElementById("toast");
  el.textContent=msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove("show"),2400);
}

function weightedRank(){
  let n=Math.random()*100,acc=0;
  for(const r of GACHA){
    acc+=r.weight;
    if(n<acc)return r.rank;
  }
  return 0;
}

function summonOne(){
  if(state.coins<SUMMON_COST){
    toast("코인이 부족해요!");
    return null;
  }
  state.coins-=SUMMON_COST;
  const rank=weightedRank();
  const pool=CHARACTERS.filter(c=>c.rank===rank);
  const got=pool[Math.floor(Math.random()*pool.length)];
  state.inventory[got.id]=(state.inventory[got.id]||0)+1;
  return got;
}

function showSummons(items){
  document.getElementById("summonResults").innerHTML=
    items.map(c=>cardHTML(c,{compact:true})).join("");
}

function summon(n){
  if(state.coins<n*SUMMON_COST){
    toast("코인이 부족해요!");
    return;
  }
  const results=[];
  for(let i=0;i<n;i++){
    const c=summonOne();
    if(c)results.push(c);
  }
  save();
  showSummons(results);
  const secrets=results.filter(c=>c.rank===5).length;
  if(secrets)toast("🎉 비밀 등급 캐릭터 등장!");
  else toast(`${n}회 뽑기 완료!`);
}

function cardHTML(c,{compact=false,count=null,sellable=false}={}){
  const r=rarity(c.rank);
  const owned=count===null?(state.inventory[c.id]||0):count;
  return `<article class="character-card" style="--glow:${r.color}">
    <div class="character-icon">${c.icon}</div>
    <div class="rarity" style="color:${r.color}">${r.name.toUpperCase()}</div>
    <h3>${c.name}</h3>
    ${compact?"":`<div class="power">${c.desc}</div><div class="power">전투력 ${r.power.toLocaleString()}</div>`}
    ${owned>0&&!compact?`<span class="count-badge">× ${owned}</span>`:""}
    ${sellable?`<button class="sell-btn" data-sell="${c.id}">1명 판매 · 🪙 ${salePrice(c)}</button>`:""}
  </article>`;
}

function renderCollection(){
  const grid=document.getElementById("collectionGrid");
  const list=CHARACTERS.filter(c=>(state.inventory[c.id]||0)>0);
  grid.innerHTML=list.length
    ?list.map(c=>cardHTML(c,{sellable:true})).join("")
    :`<div class="empty-state">아직 캐릭터가 없어요. 먼저 뽑기를 해보세요!</div>`;
}

function populateCharacterSelect(selectId,keep=true){
  const sel=document.getElementById(selectId);
  const old=keep?sel.value:"";
  const ids=CHARACTERS.filter(c=>(state.inventory[c.id]||0)>0).map(c=>c.id);

  sel.innerHTML=ids.length
    ?ids.map(id=>`<option value="${id}">${character(id).name} ×${state.inventory[id]}</option>`).join("")
    :`<option value="">보유 캐릭터 없음</option>`;

  if(ids.includes(old))sel.value=old;
}

function renderEnhance(){
  populateCharacterSelect("enhanceSelect");
  const id=document.getElementById("enhanceSelect").value;
  const box=document.getElementById("enhanceInfo");
  const btn=document.getElementById("enhanceButton");
  const c=character(id);

  if(!c){
    box.textContent="먼저 뽑기에서 캐릭터를 획득해 주세요.";
    btn.disabled=true;
    return;
  }

  const count=state.inventory[id]||0;
  const chance=RATES[c.rank];

  box.innerHTML=`<strong style="color:${rarity(c.rank).color}">${c.name}</strong><br>
    등급: ${rarity(c.rank).name} · 보유 수: ${count}명<br>
    ${c.rank===5?"최고 등급입니다. 더 이상 강화할 수 없어요.":`성공 확률: ${chance}%<br>필요 재료: 같은 캐릭터 2명 (현재 ${count}명)`}`;

  btn.disabled=count<2||c.rank>=5;
}

function renderBattle(){
  populateCharacterSelect("battleSelect");

  const sel=document.getElementById("botSelect");
  const old=sel.value;
  sel.innerHTML=BOTS.map(b=>`<option value="${b.id}">${b.name} · ${rarity(b.rank).name}</option>`).join("");
  if(BOTS.some(b=>b.id===old))sel.value=old;

  updateFighters();

  document.getElementById("botRoster").innerHTML=BOTS.map(b=>
    `<div class="bot-item"><strong>${b.icon} ${b.name}</strong><span>${rarity(b.rank).name} · 전투력 ${b.power.toLocaleString()}</span></div>`
  ).join("");
}

function fighterHTML(c,power){
  if(!c)return "출전 가능한 캐릭터가 없습니다.";
  const r=rarity(c.rank);
  return `<div class="character-icon">${c.icon}</div>
    <div class="rarity" style="color:${r.color}">${r.name}</div>
    <h3>${c.name}</h3><p>전투력 ${power.toLocaleString()}</p>`;
}

function updateFighters(){
  const c=character(document.getElementById("battleSelect").value);
  const bot=BOTS.find(b=>b.id===document.getElementById("botSelect").value);

  document.getElementById("battleMyCard").innerHTML=
    c?fighterHTML(c,rarity(c.rank).power):"캐릭터 없음";
  document.getElementById("battleBotCard").innerHTML=
    bot?fighterHTML(bot,bot.power):"";

  document.getElementById("battleButton").disabled=!c||battleInProgress;
  document.getElementById("autoBattleButton").disabled=!c;
}

function setHealthBars(playerHp,botHp,playerName,botName){
  document.getElementById("playerHpName").textContent=playerName;
  document.getElementById("botHpName").textContent=botName;
  document.getElementById("playerHpText").textContent=playerHp+" / 100";
  document.getElementById("botHpText").textContent=botHp+" / 100";

  const p=document.getElementById("playerHpBar");
  const b=document.getElementById("botHpBar");

  p.style.width=playerHp+"%";
  b.style.width=botHp+"%";
  p.classList.toggle("low",playerHp<=30);
  b.classList.toggle("low",botHp<=30);
}

function addBattleLog(message,kind="system-action"){
  const log=document.getElementById("battleLog");

  if(log.textContent==="대전 기록이 여기에 표시됩니다.")log.innerHTML="";

  const line=document.createElement("p");
  line.className=kind;
  line.textContent=message;
  log.appendChild(line);
  log.scrollTop=log.scrollHeight;
}

function wait(ms){
  return new Promise(resolve=>setTimeout(resolve,ms));
}

function randomAttack(){
  const attacks=[
    {name:"빠른 잽",power:.78},
    {name:"정면 돌파",power:1},
    {name:"강력한 필살기",power:1.28}
  ];
  return attacks[Math.floor(Math.random()*attacks.length)];
}

async function battle(){
  if(battleInProgress)return;

  const c=character(document.getElementById("battleSelect").value);
  const bot=BOTS.find(b=>b.id===document.getElementById("botSelect").value);

  if(!c||!bot){
    toast("출전 캐릭터를 먼저 획득해 주세요.");
    return;
  }

  if(state.coins<BATTLE_START_COST){
    toast("대전을 시작하려면 5코인이 필요해요.");
    return;
  }

  battleInProgress=true;
  document.getElementById("battleButton").disabled=true;

  const result=document.getElementById("battleResult");
  result.className="battle-result";
  result.textContent="대전 진행 중...";

  let playerHp=100;
  let botHp=100;
  const playerPower=rarity(c.rank).power;
  const botPower=bot.power;

  setHealthBars(playerHp,botHp,c.name,bot.name);
  document.getElementById("battleLog").innerHTML="";
  addBattleLog("대전 시작! "+c.name+" 전투력 "+playerPower+" · "+bot.name+" 전투력 "+botPower,"system-action");

  let playerTurn=true;
  let turn=0;

  while(playerHp>0&&botHp>0&&turn<30){
    turn++;

    if(playerTurn){
      const attack=randomAttack();
      const damage=Math.max(4,Math.round((8+8*playerPower/botPower)*attack.power*(.85+Math.random()*.3)));
      botHp=Math.max(0,botHp-damage);
      addBattleLog(c.name+"의 "+attack.name+"! "+bot.name+"에게 "+damage+" 피해를 줬어요.","player-action");
    }else{
      const attack=randomAttack();
      const damage=Math.max(4,Math.round((8+8*botPower/playerPower)*attack.power*(.85+Math.random()*.3)));
      playerHp=Math.max(0,playerHp-damage);
      addBattleLog(bot.name+"의 "+attack.name+"! "+c.name+"에게 "+damage+" 피해를 줬어요.","bot-action");
    }

    setHealthBars(playerHp,botHp,c.name,bot.name);
    await wait(600);
    playerTurn=!playerTurn;
  }

  const win=botHp<=0||(playerHp>0&&botHp>0&&playerHp>=botHp);
  state.coins-=BATTLE_START_COST;

  if(win){
    state.wins++;
    state.coins+=100;
    result.className="battle-result win";
    result.innerHTML="🏆 <strong>승리!</strong><br>"+c.name+"이(가) "+bot.name+"을(를) 이겼어요.<br>대전 비용: 🪙 5 코인 · 승리 보상: 🪙 100 코인";
    addBattleLog(c.name+" 승리!","system-action");
  }else{
    const deducted=Math.min(BATTLE_LOSS_COST,state.coins);
    state.coins-=deducted;
    result.className="battle-result lose";
    result.innerHTML="💥 <strong>패배...</strong><br>"+bot.name+"에게 패배했어요.<br>대전 비용: 🪙 5 코인 · 패배 차감: 🪙 "+deducted+" 코인";
    addBattleLog(bot.name+" 승리!","system-action");
  }

  save();

  const otherBots=BOTS.filter(x=>x.id!==bot.id);
  const nextBot=otherBots[Math.floor(Math.random()*otherBots.length)];
  document.getElementById("botSelect").value=nextBot.id;
  updateFighters();
  addBattleLog("다음 상대 봇: "+nextBot.name,"system-action");

  battleInProgress=false;
  updateFighters();
}

function toggleAutoSell(){
  const button=document.getElementById("autoSellButton");

  if(autoSellTimer){
    clearInterval(autoSellTimer);
    autoSellTimer=null;
    button.textContent="자동 판매 시작";
    toast("자동 판매를 멈췄어요.");
    return;
  }

  autoSellTimer=setInterval(()=>{
    let changed=false;

    for(const c of CHARACTERS){
      const count=state.inventory[c.id]||0;
      if(count>1){
        state.inventory[c.id]--;
        state.coins+=salePrice(c);
        changed=true;
      }
    }

    if(changed)save();
  },900);

  button.textContent="자동 판매 중지";
  toast("각 캐릭터를 1명씩 남기고 중복만 자동 판매합니다.");
}

function toggleAutoEnhance(){
  const button=document.getElementById("autoEnhanceButton");

  if(autoEnhanceTimer){
    clearInterval(autoEnhanceTimer);
    autoEnhanceTimer=null;
    button.textContent="자동 강화 시작";
    toast("자동 강화를 멈췄어요.");
    return;
  }

  lastAutoEnhanceAt=Date.now();

  autoEnhanceTimer=setInterval(()=>{
    const speed=Number(document.getElementById("enhanceSpeed").value)||1;
    if(Date.now()-lastAutoEnhanceAt<1000/speed)return;

    lastAutoEnhanceAt=Date.now();
    const c=CHARACTERS.find(x=>x.rank<5&&(state.inventory[x.id]||0)>=2);

    if(!c){
      clearInterval(autoEnhanceTimer);
      autoEnhanceTimer=null;
      button.textContent="자동 강화 시작";
      toast("강화할 캐릭터가 없어 자동 강화를 멈췄어요.");
      return;
    }

    document.getElementById("enhanceSelect").value=c.id;
    enhance();
  },50);

  button.textContent="자동 강화 중지";
  toast("선택한 속도로 강화합니다. 최대 5배속이에요.");
}

async function runAutoBattle(){
  while(autoBattleRunning){
    if(state.coins<BATTLE_START_COST){
      autoBattleRunning=false;
      document.getElementById("autoBattleButton").textContent="자동 대전 시작";
      toast("코인이 부족해 자동 대전을 멈췄어요.");
      break;
    }

    await battle();
    if(autoBattleRunning)await wait(900);
  }
}

function toggleAutoBattle(){
  const button=document.getElementById("autoBattleButton");

  if(autoBattleRunning){
    autoBattleRunning=false;
    button.textContent="자동 대전 시작";
    toast("자동 대전을 멈췄어요.");
    return;
  }

  if(!CHARACTERS.some(c=>(state.inventory[c.id]||0)>0)){
    toast("먼저 캐릭터를 획득해 주세요.");
    return;
  }

  autoBattleRunning=true;
  button.textContent="자동 대전 중지";
  toast("대전이 끝날 때마다 상대 봇이 바뀝니다.");
  runAutoBattle();
}

function enhance(){
  const id=document.getElementById("enhanceSelect").value;
  const c=character(id);
  if(!c)return;

  const count=state.inventory[id]||0;
  if(count<2){
    toast("같은 캐릭터가 2명 이상 필요해요.");
    return;
  }

  if(c.rank>=5){
    toast("비밀 등급은 최고 등급이에요.");
    return;
  }

  const chance=RATES[c.rank];
  state.inventory[id]--;
  let msg;

  if(Math.random()*100<chance){
    const nextRank=c.rank+1;
    const candidates=CHARACTERS.filter(x=>x.rank===nextRank);
    const next=candidates[Math.floor(Math.random()*candidates.length)];
    state.inventory[next.id]=(state.inventory[next.id]||0)+1;
    msg=`강화 성공! ${c.name} → ${next.name} (${rarity(nextRank).name})`;
  }else{
    msg=`강화 실패! 재료 1명이 소모되었어요. ${c.name}은(는) 남아 있습니다.`;
  }

  document.getElementById("enhanceLog").textContent=msg;
  save();
  toast(msg);
}

function renderAll(){
  document.getElementById("coins").textContent=state.coins.toLocaleString();
  document.getElementById("ownedCount").textContent=
    CHARACTERS.filter(c=>(state.inventory[c.id]||0)>0).length;
  document.getElementById("winCount").textContent=state.wins;
  document.getElementById("battlePower").textContent=totalPower().toLocaleString();
  renderCollection();
  renderEnhance();
  renderBattle();
}

document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b===btn));
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===`page-${btn.dataset.page}`));
}));

document.getElementById("summonOne").addEventListener("click",()=>summon(1));
document.getElementById("summonTen").addEventListener("click",()=>summon(10));
document.getElementById("enhanceSelect").addEventListener("change",renderEnhance);

document.getElementById("collectionGrid").addEventListener("click",event=>{
  const button=event.target.closest("[data-sell]");
  if(!button)return;

  const id=button.dataset.sell;
  const c=character(id);
  const count=state.inventory[id]||0;
  if(!c||count<1)return;

  state.inventory[id]=count-1;
  if(state.inventory[id]===0)delete state.inventory[id];

  const earned=salePrice(c);
  state.coins+=earned;
  save();
  toast(`${c.name} 1명을 판매해 ${earned}코인을 받았어요.`);
});

document.getElementById("enhanceButton").addEventListener("click",enhance);
document.getElementById("autoSellButton").addEventListener("click",toggleAutoSell);
document.getElementById("autoEnhanceButton").addEventListener("click",toggleAutoEnhance);
document.getElementById("autoBattleButton").addEventListener("click",toggleAutoBattle);
document.getElementById("battleSelect").addEventListener("change",updateFighters);
document.getElementById("botSelect").addEventListener("change",updateFighters);
document.getElementById("battleButton").addEventListener("click",battle);

renderAll();
