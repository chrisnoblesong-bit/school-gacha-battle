/* =========================================
   학교 뽑기대전 - 전체 script.js
   내 캐릭터 유지 / 상대 봇만 랜덤 변경
========================================= */

const RARITIES = [
  {name:"일반",rank:0,color:"#c7d0e3",className:"common",power:100,icon:"🙂"},
  {name:"레어",rank:1,color:"#65b8ff",className:"rare",power:220,icon:"😎"},
  {name:"슈퍼레어",rank:2,color:"#c18cff",className:"super",power:450,icon:"🏀"},
  {name:"레전드",rank:3,color:"#ffd166",className:"legend",power:900,icon:"🔥"},
  {name:"레전드 이상",rank:4,color:"#ff7b7b",className:"mythic",power:1800,icon:"⚡"},
  {name:"비밀",rank:5,color:"#ff79d1",className:"secret",power:4000,icon:"👑"}
];

const CHARACTERS = [
  {id:"hwang",name:"황승원",rank:0,icon:"🙂",desc:"기본기 탄탄한 입문 캐릭터"},
  {id:"gao",name:"가오승원",rank:1,icon:"😎",desc:"자신감으로 승부하는 레어 캐릭터"},
  {id:"basket",name:"농구승원",rank:2,icon:"🏀",desc:"코트 위에서 강해지는 캐릭터"},
  {id:"sport",name:"운동승원",rank:3,icon:"🔥",desc:"훈련으로 단련된 레전드"},
  {id:"math",name:"수학주원",rank:4,icon:"🧠",desc:"계산된 전략의 캐릭터"},
  {id:"special",name:"김하진 특수부대",rank:4,icon:"🛡️",desc:"방어력이 뛰어난 캐릭터"},
  {id:"north",name:"북한 림하진",rank:4,icon:"❄️",desc:"침착함을 가진 캐릭터"},
  {id:"genius",name:"영재주원",rank:4,icon:"💡",desc:"빠른 판단력의 천재 캐릭터"},
  {id:"jadeok",name:"자(덕)지섭",rank:5,icon:"📚",desc:"비밀 캐릭터"},
  {id:"tyrant",name:"폭군 김하진",rank:5,icon:"👑",desc:"최상위 비밀 캐릭터"},
  {id:"devSongao",name:"개발자 송가오",rank:5,icon:"🧑‍💻",desc:"개발자 비밀 캐릭터"},
  {id:"tone072",name:"0.072톤",rank:0,icon:"🐷",desc:"일반 캐릭터"},
  {id:"sunghun",name:"성헌",rank:0,icon:"🙂",desc:"일반 캐릭터"},
  {id:"happySunghun",name:"행복성헌",rank:0,icon:"😊",desc:"일반 캐릭터"},
  {id:"hanSunghun",name:"한성헌",rank:0,icon:"😄",desc:"일반 캐릭터"},
  {id:"kimHajin",name:"김하진",rank:0,icon:"🧑",desc:"일반 캐릭터"},
  {id:"parkJuwon",name:"박주원",rank:0,icon:"🧑",desc:"일반 캐릭터"},
  {id:"clatSeungwon",name:"클났승원",rank:1,icon:"😅",desc:"레어 캐릭터"},
  {id:"ideaSeongheong",name:"아이디어제공자 성헝",rank:1,icon:"💡",desc:"레어 캐릭터"},
  {
    id:"ultimatePig",
    name:"황한송김박돼지 승원",
    rank:5,
    power:10000000000000000,
    icon:"🐷",
    desc:"특수강화로 탄생한 게임 클리어 캐릭터"
  }
];

const RATES = [70,50,30,15,5];

const GACHA = [
  {rank:0,weight:50},
  {rank:1,weight:27},
  {rank:2,weight:15},
  {rank:3,weight:6},
  {rank:4,weight:1.8},
  {rank:5,weight:0.2}
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
  {id:"bot9",name:"서정재쌤",rank:4,power:2400,icon:"⚡"},
  {id:"bot10",name:"정현진쌤",rank:4,power:2600,icon:"🧑‍🏫"},
  {id:"bot11",name:"만석갱",rank:5,power:5000,icon:"👑"},
  {id:"bot12",name:"전설의 포켓몬",rank:5,power:6500,icon:"🐉"}
];

const STORAGE_KEY = "seungwonLegendBattleSaveV1";
const SUMMON_COST = 10;
const BATTLE_START_COST = 5;
const BATTLE_LOSS_COST = 50;
const POWER_LIMIT = 10000000;

let state = loadState();

let toastTimer = null;
let autoSellTimer = null;
let autoEnhanceTimer = null;
let autoEnhanceLimitTimer = null;
let autoSummonTimer = null;
let autoBattleRunning = false;
let battleInProgress = false;
let lastAutoEnhanceAt = 0;
let specialBoosted = false;

/* =========================================
   기본 데이터
========================================= */

function defaultState(){
  return {
    coins:500,
    inventory:{hwang:1},
    wins:0,
    adminUnlocked:false
  };
}

function character(id){
  return CHARACTERS.find(c=>c.id===id);
}

function rarity(rank){
  return RARITIES[rank] || RARITIES[0];
}

function characterPower(c){
  return c ? (c.power || rarity(c.rank).power) : 0;
}

function hasUltimatePig(data){
  return Number(data?.inventory?.ultimatePig || 0)>0;
}

function inventoryPower(inventory){
  return Object.entries(inventory || {}).reduce((sum,[id,count])=>{
    const c = character(id);
    return sum+(c ? characterPower(c)*Number(count || 0) : 0);
  },0);
}

function totalPower(){
  return inventoryPower(state.inventory);
}

/* =========================================
   저장 및 불러오기
========================================= */

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if(saved && saved.inventory){
      saved.coins = Number(saved.coins || 0);
      saved.wins = Number(saved.wins || 0);
      saved.adminUnlocked = saved.adminUnlocked===true;

      const hasClearCharacter = hasUltimatePig(saved);
      const power = inventoryPower(saved.inventory);

      if(!saved.adminUnlocked && !hasClearCharacter && power>POWER_LIMIT){
        localStorage.removeItem(STORAGE_KEY);
        alert("전투력 제한 초과! 게임 데이터가 초기화되었습니다.");
        return defaultState();
      }

      return saved;
    }
  }catch(error){
    console.error("저장 데이터 오류:",error);
  }

  return defaultState();
}

function stopAllAutomation(){
  if(autoSellTimer){
    clearInterval(autoSellTimer);
    autoSellTimer=null;
  }

  if(autoEnhanceTimer){
    clearInterval(autoEnhanceTimer);
    autoEnhanceTimer=null;
  }

  if(autoEnhanceLimitTimer){
    clearTimeout(autoEnhanceLimitTimer);
    autoEnhanceLimitTimer=null;
  }

  if(autoSummonTimer){
    clearInterval(autoSummonTimer);
    autoSummonTimer=null;
  }

  autoBattleRunning=false;
}

function save(){
  const hasClearCharacter = hasUltimatePig(state);

  if(!state.adminUnlocked && !hasClearCharacter && totalPower()>POWER_LIMIT){
    stopAllAutomation();
    localStorage.removeItem(STORAGE_KEY);

    alert(
      "전투력 10,000,000 초과!\n"+
      "관리자 인증 또는 게임 클리어 캐릭터가 없는 계정이므로 초기화됩니다."
    );

    location.reload();
    return;
  }

  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  renderAll();
}

/* =========================================
   알림
========================================= */

function toast(message){
  const el = document.getElementById("toast");
  if(!el)return;

  el.textContent=message;
  el.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer=setTimeout(()=>{
    el.classList.remove("show");
  },2600);
}

/* =========================================
   뽑기
========================================= */

function weightedRank(){
  let number=Math.random()*100;
  let total=0;

  for(const item of GACHA){
    total+=item.weight;
    if(number<total)return item.rank;
  }

  return 0;
}

function summonOne(){
  if(state.coins<SUMMON_COST)return null;

  state.coins-=SUMMON_COST;

  const rank=weightedRank();

  let pool=CHARACTERS.filter(c=>
    c.rank===rank && c.id!=="ultimatePig"
  );

  if(rank===5 && Math.random()<0.5){
    pool=pool.filter(c=>c.id!=="devSongao");
  }

  if(!pool.length){
    state.coins+=SUMMON_COST;
    return null;
  }

  const got=pool[Math.floor(Math.random()*pool.length)];

  state.inventory[got.id]=(state.inventory[got.id] || 0)+1;

  return got;
}

function summon(amount){
  amount=Number(amount);

  if(state.coins<amount*SUMMON_COST){
    toast("코인이 부족해요!");
    return;
  }

  const results=[];

  for(let i=0;i<amount;i++){
    const got=summonOne();
    if(got)results.push(got);
  }

  save();
  showSummons(results);
  toast(amount+"회 뽑기 완료!");
}

function showSummons(items){
  const box=document.getElementById("summonResults");
  if(!box)return;

  box.innerHTML=items.map(c=>cardHTML(c,{compact:true})).join("");
}

/* =========================================
   캐릭터 카드 및 판매
========================================= */

function salePrice(c){
  return [5,10,20,40,80,160][c.rank] || 5;
}

function cardHTML(c,options={}){
  const compact=options.compact || false;
  const sellable=options.sellable || false;
  const r=rarity(c.rank);
  const owned=state.inventory[c.id] || 0;

  return `
    <article class="character-card" style="--glow:${r.color}">
      <div class="character-icon">${c.icon}</div>
      <div class="rarity" style="color:${r.color}">${r.name}</div>
      <h3>${c.name}</h3>
      ${compact ? "" : `
        <div class="power">${c.desc}</div>
        <div class="power">전투력 ${characterPower(c).toLocaleString()}</div>
        <span class="count-badge">× ${owned}</span>
      `}
      ${sellable ? `
        <button class="sell-btn" data-sell="${c.id}">
          1명 판매 · 🪙 ${salePrice(c)}
        </button>
      ` : ""}
    </article>
  `;
}

function renderCollection(){
  const grid=document.getElementById("collectionGrid");
  if(!grid)return;

  const list=CHARACTERS.filter(c=>(state.inventory[c.id] || 0)>0);

  grid.innerHTML=list.length
    ? list.map(c=>cardHTML(c,{sellable:true})).join("")
    : '<div class="empty-state">아직 캐릭터가 없어요.</div>';
}

/* =========================================
   캐릭터 선택 목록
========================================= */

function populateCharacterSelect(id){
  const select=document.getElementById(id);
  if(!select)return;

  const previous=select.value;

  const owned=CHARACTERS.filter(c=>
    (state.inventory[c.id] || 0)>0
  );

  select.innerHTML=owned.length
    ? owned.map(c=>
        `<option value="${c.id}">${c.name} ×${state.inventory[c.id]}</option>`
      ).join("")
    : '<option value="">보유 캐릭터 없음</option>';

  if(owned.some(c=>c.id===previous)){
    select.value=previous;
  }
}

/* =========================================
   강화
========================================= */

function renderEnhance(){
  populateCharacterSelect("enhanceSelect");

  const select=document.getElementById("enhanceSelect");
  const info=document.getElementById("enhanceInfo");
  const button=document.getElementById("enhanceButton");

  if(!select || !info || !button)return;

  const c=character(select.value);

  if(!c){
    info.textContent="먼저 캐릭터를 획득해 주세요.";
    button.disabled=true;
    renderSpecialEnhance();
    return;
  }

  const count=state.inventory[c.id] || 0;

  info.innerHTML=`
    <strong style="color:${rarity(c.rank).color}">${c.name}</strong><br>
    등급: ${rarity(c.rank).name}<br>
    보유 수: ${count}명<br>
    ${c.rank>=5 ? "최고 등급입니다." : "성공 확률: "+RATES[c.rank]+"%"}
  `;

  button.disabled=count<2 || c.rank>=5;

  renderSpecialEnhance();
}

function enhance(){
  const id=document.getElementById("enhanceSelect").value;
  const c=character(id);

  if(!c)return;

  if((state.inventory[id] || 0)<2){
    toast("같은 캐릭터가 2명 이상 필요해요.");
    return;
  }

  if(c.rank>=5){
    toast("최고 등급 캐릭터입니다.");
    return;
  }

  state.inventory[id]--;

  let message;

  if(Math.random()*100<RATES[c.rank]){
    const nextRank=c.rank+1;

    const pool=CHARACTERS.filter(x=>
      x.rank===nextRank && x.id!=="ultimatePig"
    );

    const next=pool[Math.floor(Math.random()*pool.length)];

    state.inventory[next.id]=(state.inventory[next.id] || 0)+1;

    message="강화 성공! "+c.name+" → "+next.name;
  }else{
    message="강화 실패! 재료 1명이 소모되었습니다.";
  }

  document.getElementById("enhanceLog").textContent=message;

  save();
  toast(message);
}

/* =========================================
   자동 강화 - 3분 제한
========================================= */

function stopAutoEnhance(message){
  if(autoEnhanceTimer){
    clearInterval(autoEnhanceTimer);
    autoEnhanceTimer=null;
  }

  if(autoEnhanceLimitTimer){
    clearTimeout(autoEnhanceLimitTimer);
    autoEnhanceLimitTimer=null;
  }

  const button=document.getElementById("autoEnhanceButton");

  if(button)button.textContent="자동 강화 시작";

  if(message)toast(message);
}

function toggleAutoEnhance(){
  const button=document.getElementById("autoEnhanceButton");

  if(autoEnhanceTimer){
    stopAutoEnhance("자동 강화를 멈췄어요.");
    return;
  }

  lastAutoEnhanceAt=Date.now();

  autoEnhanceTimer=setInterval(()=>{
    const speed=Number(document.getElementById("enhanceSpeed").value) || 1;

    if(Date.now()-lastAutoEnhanceAt<1000/speed)return;

    lastAutoEnhanceAt=Date.now();

    const c=CHARACTERS.find(x=>
      x.rank<5 && (state.inventory[x.id] || 0)>=2
    );

    if(!c){
      stopAutoEnhance("강화할 캐릭터가 없어 자동 강화를 멈췄어요.");
      return;
    }

    document.getElementById("enhanceSelect").value=c.id;
    enhance();

  },25);

  autoEnhanceLimitTimer=setTimeout(()=>{
    stopAutoEnhance("⏰ 자동 강화 3분이 지나 자동 정지되었습니다.");
  },180000);

  button.textContent="자동 강화 중지";
  toast("자동 강화 시작! 3분 후 자동 정지됩니다.");
}

/* =========================================
   자동 판매
========================================= */

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
      const count=state.inventory[c.id] || 0;

      if(count>1){
        state.inventory[c.id]--;
        state.coins+=salePrice(c);
        changed=true;
      }
    }

    if(changed)save();

  },900);

  button.textContent="자동 판매 중지";
  toast("캐릭터를 1명씩 남기고 중복을 자동 판매합니다.");
}

/* =========================================
   자동 뽑기
========================================= */

function toggleAutoSummon(){
  const button=document.getElementById("autoSummonButton");

  if(autoSummonTimer){
    clearInterval(autoSummonTimer);
    autoSummonTimer=null;
    button.textContent="자동 뽑기 시작 · 10배속";
    toast("자동 뽑기를 멈췄어요.");
    return;
  }

  if(state.coins<SUMMON_COST){
    toast("코인이 부족해요.");
    return;
  }

  autoSummonTimer=setInterval(()=>{
    const count=Math.min(10,Math.floor(state.coins/SUMMON_COST));

    if(count<=0){
      clearInterval(autoSummonTimer);
      autoSummonTimer=null;
      button.textContent="자동 뽑기 시작 · 10배속";
      toast("코인이 부족해 자동 뽑기를 멈췄어요.");
      return;
    }

    summon(count);

  },1000);

  button.textContent="자동 뽑기 중지";
  toast("자동 뽑기를 시작했습니다.");
}

/* =========================================
   대전 화면
========================================= */

function fighterHTML(c,power){
  if(!c)return "캐릭터 없음";

  const r=rarity(c.rank);

  return `
    <div class="character-icon">${c.icon}</div>
    <div class="rarity" style="color:${r.color}">${r.name}</div>
    <h3>${c.name}</h3>
    <p>전투력 ${power.toLocaleString()}</p>
  `;
}

function updateFighters(){
  const select=document.getElementById("battleSelect");
  if(!select)return;

  const c=character(select.value);

  document.getElementById("battleMyCard").innerHTML=
    c ? fighterHTML(c,characterPower(c)) : "캐릭터 없음";

  document.getElementById("battleButton").disabled=
    !c || battleInProgress;
}

function renderBattle(){
  populateCharacterSelect("battleSelect");
  updateFighters();

  const roster=document.getElementById("botRoster");

  roster.innerHTML=BOTS.map(b=>`
    <div class="bot-item">
      <strong>${b.icon} ${b.name}</strong>
      <span>${rarity(b.rank).name} · 전투력 ${b.power.toLocaleString()}</span>
    </div>
  `).join("");
}

/* =========================================
   체력 표시
========================================= */

function setHealthBars(playerHp,botHp,playerName,botName){
  document.getElementById("playerHpName").textContent=playerName;
  document.getElementById("botHpName").textContent=botName;

  document.getElementById("playerHpText").textContent=playerHp+" / 100";
  document.getElementById("botHpText").textContent=botHp+" / 100";

  const playerBar=document.getElementById("playerHpBar");
  const botBar=document.getElementById("botHpBar");

  playerBar.style.width=playerHp+"%";
  botBar.style.width=botHp+"%";

  playerBar.classList.toggle("low",playerHp<=30);
  botBar.classList.toggle("low",botHp<=30);
}

function addBattleLog(message,kind){
  const log=document.getElementById("battleLog");

  if(log.textContent==="대전 기록이 여기에 표시됩니다."){
    log.innerHTML="";
  }

  const line=document.createElement("p");
  line.className=kind || "system-action";
  line.textContent=message;

  log.appendChild(line);
  log.scrollTop=log.scrollHeight;
}

function wait(ms){
  return new Promise(resolve=>setTimeout(resolve,ms));
}

function randomAttack(){
  const attacks=[
    {name:"빠른 잽",power:0.78},
    {name:"정면 돌파",power:1},
    {name:"강력한 필살기",power:1.28}
  ];

  return attacks[Math.floor(Math.random()*attacks.length)];
}

function randomBot(){
  return BOTS[Math.floor(Math.random()*BOTS.length)];
}

/* =========================================
   대전 실행
   내 캐릭터는 유지되고 상대만 랜덤
========================================= */

async function battle(){
  if(battleInProgress)return;

  const select=document.getElementById("battleSelect");

  // 대전 시작 시 선택한 내 캐릭터를 고정
  const selectedCharacterId=select.value;
  const c=character(selectedCharacterId);

  if(!c){
    toast("출전 캐릭터를 먼저 획득해 주세요.");
    return;
  }

  if(state.coins<BATTLE_START_COST){
    toast("대전을 시작하려면 5코인이 필요해요.");
    return;
  }

  // 상대 봇만 무작위 선택
  const bot=randomBot();

  document.getElementById("battleBotCard").innerHTML=
    fighterHTML(bot,bot.power);

  battleInProgress=true;
  document.getElementById("battleButton").disabled=true;

  const speed=Number(document.getElementById("battleSpeed").value) || 1;
  const result=document.getElementById("battleResult");

  result.className="battle-result";
  result.textContent="대전 진행 중...";

  let playerHp=100;
  let botHp=100;
  let turn=0;
  let playerTurn=true;

  const playerPower=characterPower(c);
  const botPower=bot.power;

  setHealthBars(playerHp,botHp,c.name,bot.name);
  document.getElementById("battleLog").innerHTML="";

  addBattleLog(
    "대전 시작! "+c.name+" 전투력 "+playerPower+
    " · "+bot.name+" 전투력 "+botPower
  );

  while(playerHp>0 && botHp>0 && turn<30){
    turn++;

    if(playerTurn){
      const attack=randomAttack();

      const damage=Math.max(4,Math.round(
        (8+8*playerPower/botPower)*
        attack.power*(0.85+Math.random()*0.3)
      ));

      botHp=Math.max(0,botHp-damage);

      addBattleLog(
        c.name+"의 "+attack.name+"! "+
        bot.name+"에게 "+damage+" 피해!",
        "player-action"
      );
    }else{
      const attack=randomAttack();

      const damage=Math.max(4,Math.round(
        (8+8*botPower/playerPower)*
        attack.power*(0.85+Math.random()*0.3)
      ));

      playerHp=Math.max(0,playerHp-damage);

      addBattleLog(
        bot.name+"의 "+attack.name+"! "+
        c.name+"에게 "+damage+" 피해!",
        "bot-action"
      );
    }

    setHealthBars(playerHp,botHp,c.name,bot.name);

    await wait(600/speed);

    playerTurn=!playerTurn;
  }

  const win=
    botHp<=0 ||
    (playerHp>0 && playerHp>=botHp);

  state.coins-=BATTLE_START_COST;

  if(win){
    state.wins++;
    state.coins+=100;

    result.className="battle-result win";
    result.innerHTML=
      "🏆 <strong>승리!</strong><br>"+
      c.name+"이(가) "+bot.name+"을(를) 이겼어요.<br>"+
      "승리 보상: 🪙 100 코인";

    addBattleLog(c.name+" 승리!","system-action");
  }else{
    const deducted=Math.min(BATTLE_LOSS_COST,state.coins);

    state.coins-=deducted;

    result.className="battle-result lose";
    result.innerHTML=
      "💥 <strong>패배...</strong><br>"+
      bot.name+"에게 패배했어요.<br>"+
      "추가 차감: 🪙 "+deducted+" 코인";

    addBattleLog(bot.name+" 승리!","system-action");
  }

  // 선택한 내 캐릭터는 절대 변경하지 않음
  select.value=selectedCharacterId;

  battleInProgress=false;

  save();
  updateFighters();
}

/* =========================================
   자동 대전
========================================= */

async function runAutoBattle(){
  while(autoBattleRunning){
    if(state.coins<BATTLE_START_COST){
      autoBattleRunning=false;

      document.getElementById("autoBattleButton").textContent=
        "자동 대전 시작";

      toast("코인이 부족해 자동 대전을 멈췄어요.");
      break;
    }

    await battle();

    if(autoBattleRunning){
      await wait(900);
    }
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

  if(!CHARACTERS.some(c=>(state.inventory[c.id] || 0)>0)){
    toast("먼저 캐릭터를 획득해 주세요.");
    return;
  }

  autoBattleRunning=true;
  button.textContent="자동 대전 중지";

  toast("자동 대전 시작! 내 캐릭터는 유지되고 상대만 랜덤으로 바뀝니다.");

  runAutoBattle();
}

/* =========================================
   특수 강화
========================================= */

function renderSpecialEnhance(){
  const panel=document.getElementById("specialEnhancePanel");

  const ready=
    (state.inventory.devSongao || 0)>0 &&
    (state.inventory.tyrant || 0)>0;

  panel.hidden=!ready;

  if(ready){
    document.getElementById("specialChance").textContent=
      specialBoosted ? "80% (방향키 보너스)" : "1%";
  }
}

function specialEnhance(){
  if(
    !(state.inventory.devSongao>0) ||
    !(state.inventory.tyrant>0)
  ){
    toast("개발자 송가오와 폭군 김하진이 모두 필요해요.");
    return;
  }

  const chance=specialBoosted ? 0.8 : 0.01;

  if(Math.random()<chance){
    state.inventory.ultimatePig=
      (state.inventory.ultimatePig || 0)+1;

    save();
    showGameClear("황한송김박돼지 승원");
  }else{
    toast("특수 강화 실패! 재료는 그대로 보존됩니다.");
  }
}

function showGameClear(name){
  document.getElementById("gameClearName").textContent=name;
  document.getElementById("gameClearOverlay").hidden=false;
}

function closeGameClear(){
  document.getElementById("gameClearOverlay").hidden=true;
}

/* =========================================
   관리자 코드
========================================= */

function activateAdmin(){
  const input=document.getElementById("adminCode");

  if(input.value!=="140614"){
    toast("관리자 코드가 맞지 않습니다.");
    return;
  }

  state.adminUnlocked=true;

  state.inventory.ultimatePig=
    (state.inventory.ultimatePig || 0)+1;

  save();

  showGameClear("황한송김박돼지 승원");

  input.value="";

  toast("관리자 인증 성공!");
}

/* =========================================
   방향키 비밀 코드
========================================= */

const cheatSequence=[
  "ArrowUp","ArrowDown","ArrowUp","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight"
];

let cheatProgress=0;

document.addEventListener("keydown",event=>{
  if(event.key.startsWith("Arrow")){
    event.preventDefault();
  }

  if(event.key===cheatSequence[cheatProgress]){
    cheatProgress++;

    if(cheatProgress===cheatSequence.length){
      specialBoosted=true;
      cheatProgress=0;

      renderSpecialEnhance();

      toast("특수 강화 확률이 80%로 올라갔어요!");
    }
  }else{
    cheatProgress=event.key===cheatSequence[0] ? 1 : 0;
  }
});

/* =========================================
   전체 화면 갱신
========================================= */

function renderAll(){
  document.getElementById("coins").textContent=
    state.coins.toLocaleString();

  document.getElementById("ownedCount").textContent=
    CHARACTERS.filter(c=>(state.inventory[c.id] || 0)>0).length;

  document.getElementById("winCount").textContent=state.wins;

  document.getElementById("battlePower").textContent=
    totalPower().toLocaleString();

  renderCollection();
  renderEnhance();
  renderBattle();
}

/* =========================================
   메뉴 이동
========================================= */

function setupTabs(){
  document.querySelectorAll(".tab").forEach(button=>{
    button.addEventListener("click",()=>{
      document.querySelectorAll(".tab").forEach(tab=>
        tab.classList.remove("active")
      );

      document.querySelectorAll(".page").forEach(page=>
        page.classList.remove("active")
      );

      button.classList.add("active");

      const page=document.getElementById(
        "page-"+button.dataset.page
      );

      if(page)page.classList.add("active");
    });
  });
}

/* =========================================
   버튼 연결
========================================= */

function setupEvents(){
  document.getElementById("summonOne").addEventListener("click",()=>{
    summon(1);
  });

  document.getElementById("summonTen").addEventListener("click",()=>{
    summon(10);
  });

  document.getElementById("autoSummonButton").addEventListener("click",()=>{
    toggleAutoSummon();
  });

  document.getElementById("autoSellButton").addEventListener("click",()=>{
    toggleAutoSell();
  });

  document.getElementById("enhanceButton").addEventListener("click",()=>{
    enhance();
  });

  document.getElementById("autoEnhanceButton").addEventListener("click",()=>{
    toggleAutoEnhance();
  });

  document.getElementById("specialEnhanceButton").addEventListener("click",()=>{
    specialEnhance();
  });

  document.getElementById("adminButton").addEventListener("click",()=>{
    activateAdmin();
  });

  document.getElementById("battleButton").addEventListener("click",()=>{
    battle();
  });

  document.getElementById("autoBattleButton").addEventListener("click",()=>{
    toggleAutoBattle();
  });

  document.getElementById("closeGameClear").addEventListener("click",()=>{
    closeGameClear();
  });

  document.getElementById("enhanceSelect").addEventListener("change",()=>{
    renderEnhance();
  });

  document.getElementById("battleSelect").addEventListener("change",()=>{
    updateFighters();
  });

  document.getElementById("collectionGrid").addEventListener("click",event=>{
    const button=event.target.closest("[data-sell]");
    if(!button)return;

    const id=button.dataset.sell;
    const c=character(id);

    if(!c || (state.inventory[id] || 0)<=0)return;

    state.inventory[id]--;
    state.coins+=salePrice(c);

    save();
    toast(c.name+" 1명을 판매했습니다.");
  });

  document.getElementById("adminCode").addEventListener("keydown",event=>{
    if(event.key==="Enter")activateAdmin();
  });
}

/* =========================================
   과도한 클릭 감지
========================================= */

const clickHistory=[];
let resetTriggered=false;

document.addEventListener("click",event=>{
  if(resetTriggered)return;

  const button=event.target.closest("button");
  if(!button)return;

  const now=Date.now();

  clickHistory.push(now);

  while(clickHistory.length && now-clickHistory[0]>=1000){
    clickHistory.shift();
  }

  if(clickHistory.length>=30){
    resetTriggered=true;

    stopAllAutomation();

    localStorage.removeItem(STORAGE_KEY);

    alert(
      "초당 30회 이상의 클릭이 감지되었습니다.\n"+
      "게임 데이터가 초기화됩니다."
    );

    location.reload();
  }
},true);

/* =========================================
   게임 시작
========================================= */

document.addEventListener("DOMContentLoaded",()=>{
  setupTabs();
  setupEvents();
  renderAll();

  document.getElementById("battleLog").textContent=
    "대전 기록이 여기에 표시됩니다.";

  document.getElementById("battleBotCard").textContent=
    "대전 시작 시 상대가 정해집니다.";

  document.getElementById("battleResult").textContent=
    "캐릭터를 선택하고 대전을 시작하세요.";
});
