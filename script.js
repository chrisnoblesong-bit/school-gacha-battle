/* 학교 뽑기대전 - 전체 기능 통합본 */
"use strict";

const RARITIES = [
 {name:"일반",rank:0,color:"#c7d0e3",power:100},
 {name:"레어",rank:1,color:"#65b8ff",power:220},
 {name:"슈퍼레어",rank:2,color:"#c18cff",power:450},
 {name:"레전드",rank:3,color:"#ffd166",power:900},
 {name:"레전드 이상",rank:4,color:"#ff7b7b",power:1800},
 {name:"비밀",rank:5,color:"#ff79d1",power:4000}
];

const CHARACTERS = [
 {id:"hwang",name:"황승원",rank:0,icon:"🙂",desc:"기본기 탄탄한 입문 캐릭터"},
 {id:"gao",name:"가오승원",rank:1,icon:"😎",desc:"자신감으로 승부하는 레어 캐릭터"},
 {id:"basket",name:"농구승원",rank:2,icon:"🏀",desc:"코트 위의 슈퍼레어"},
 {id:"sport",name:"운동승원",rank:3,icon:"🔥",desc:"훈련으로 단련된 레전드"},
 {id:"math",name:"수학주원",rank:4,icon:"🧠",desc:"계산된 전략의 캐릭터"},
 {id:"special",name:"김하진 특수부대",rank:4,icon:"🛡️",desc:"방어력이 뛰어난 캐릭터"},
 {id:"north",name:"북한 림하진",rank:4,icon:"❄️",desc:"침착함을 가진 캐릭터"},
 {id:"genius",name:"영재주원",rank:4,icon:"💡",desc:"빠른 판단력의 천재 캐릭터"},
 {id:"jadeok",name:"자(덕)지섭",rank:5,icon:"📚",desc:"비밀 등급 캐릭터"},
 {id:"tyrant",name:"폭군 김하진",rank:5,icon:"👑",desc:"최상위 비밀 등급 캐릭터"},
 {id:"devSongao",name:"개발자 송가오",rank:5,icon:"🧑‍💻",desc:"개발자 비밀 캐릭터"},
 {id:"tone072",name:"0.072톤",rank:0,icon:"🐷",desc:"일반 캐릭터"},
 {id:"sunghun",name:"성헌",rank:0,icon:"🙂",desc:"일반 캐릭터"},
 {id:"happySunghun",name:"행복성헌",rank:0,icon:"😊",desc:"일반 캐릭터"},
 {id:"hanSunghun",name:"한성헌",rank:0,icon:"😄",desc:"일반 캐릭터"},
 {id:"kimHajin",name:"김하진",rank:0,icon:"🧑",desc:"일반 캐릭터"},
 {id:"parkJuwon",name:"박주원",rank:0,icon:"🧑",desc:"일반 캐릭터"},
 {id:"clatSeungwon",name:"클났승원",rank:1,icon:"😅",desc:"레어 캐릭터"},
 {id:"ideaSeongheong",name:"아이디어제공자 성헝",rank:1,icon:"💡",desc:"레어 캐릭터"},
 {id:"ultimatePig",name:"황한송김박돼지 승원",rank:5,power:10000000000000000,icon:"🐷",desc:"특수 강화로 탄생한 게임 클리어 캐릭터"}
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
 {id:"bot10",name:"서정재쌤",rank:4,power:2400,icon:"⚡"},
 {id:"bot13",name:"정현진쌤",rank:4,power:2600,icon:"🧑‍🏫"},
 {id:"bot11",name:"만석갱",rank:5,power:5000,icon:"👑"},
 {id:"bot12",name:"전설의 포켓몬",rank:5,power:6500,icon:"🐉"}
];

const RATES = [70,50,30,15,5];
const GACHA = [50,27,15,6,1.8,.2];
const KEY = "seungwonLegendBattleSaveV1";

const $ = id => document.getElementById(id);

let state;
let toastTimer = null;
let autoSellTimer = null;
let autoEnhanceTimer = null;
let autoEnhanceLimitTimer = null;
let autoSummonTimer = null;

let autoBattleRunning = false;
let battleInProgress = false;
let specialBoosted = false;
let cheatProgress = 0;

const cheatSequence = [
 "ArrowUp","ArrowDown","ArrowUp","ArrowDown",
 "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight"
];

/* 저장 데이터 */

function loadState(){
 try{
  const saved = JSON.parse(localStorage.getItem(KEY));

  if(saved && saved.inventory && typeof saved.coins === "number"){
   const coins = Math.max(0,Number(saved.coins)||0);
   const isAdmin = !!saved.isAdmin;

   return {
    coins:isAdmin ? coins : Math.min(3000,coins),
    inventory:saved.inventory,
    wins:Number(saved.wins)||0,
    isAdmin,
    coinLocked:isAdmin ? false : (saved.coinLocked===true || coins>=3000)
   };
  }
 }catch(e){
  console.warn("저장 데이터 읽기 실패",e);
 }

 return {
  coins:500,
  inventory:{hwang:1},
  wins:0,
  isAdmin:false,
  coinLocked:false
 };
}

function save(){
 localStorage.setItem(KEY,JSON.stringify(state));
 renderAll();
}

/* 코인 관리 */

function addCoins(amount){
 amount = Math.max(0,Math.floor(Number(amount)||0));

 if(!amount) return 0;

 if(state.isAdmin){
  state.coins += amount;
  return amount;
 }

 if(state.coinLocked){
  if(state.coins>500) return 0;
  state.coinLocked = false;
 }

 const before = state.coins;

 state.coins = Math.min(3000,state.coins+amount);

 const added = state.coins-before;

 if(state.coins>=3000){
  state.coinLocked = true;
 }

 return added;
}

function spendCoins(amount){
 amount = Math.max(0,Math.floor(Number(amount)||0));

 if(state.coins<amount) return false;

 state.coins -= amount;

 if(!state.isAdmin && state.coinLocked && state.coins<=500){
  state.coinLocked = false;
 }

 return true;
}

/* 기본 기능 */

function rarity(rank){
 return RARITIES[rank] || RARITIES[0];
}

function character(id){
 return CHARACTERS.find(c=>c.id===id);
}

function power(c){
 return c ? (c.power || rarity(c.rank).power) : 0;
}

function toast(message){
 $("toast").textContent = message;
 $("toast").classList.add("show");

 clearTimeout(toastTimer);

 toastTimer = setTimeout(
  ()=>$("toast").classList.remove("show"),
  2500
 );
}

function weightedRank(){
 let n = Math.random()*100;
 let sum = 0;

 for(let i=0;i<GACHA.length;i++){
  sum += GACHA[i];
  if(n<sum) return i;
 }

 return 0;
}

/* 뽑기 */

function summonOne(){
 if(!spendCoins(10)) return null;

 const rank = weightedRank();

 let pool = CHARACTERS.filter(
  c=>c.rank===rank && c.id!=="ultimatePig"
 );

 if(rank===5 && Math.random()<.5){
  pool = pool.filter(c=>c.id==="devSongao");
 }else if(rank===5){
  pool = pool.filter(c=>c.id!=="devSongao");
 }

 const got = pool[Math.floor(Math.random()*pool.length)] || character("jadeok");

 state.inventory[got.id] = (state.inventory[got.id]||0)+1;

 return got;
}

function summon(amount){
 if(state.coins<amount*10){
  toast("코인이 부족해요!");
  return;
 }

 const results = [];

 for(let i=0;i<amount;i++){
  const c = summonOne();
  if(c) results.push(c);
 }

 $("summonResults").innerHTML =
  results.map(c=>cardHTML(c,true)).join("");

 save();

 toast(
  results.some(c=>c.rank===5)
  ? "🎉 비밀 등급 캐릭터 등장!"
  : amount+"회 뽑기 완료!"
 );
}

/* 캐릭터 판매 */

function salePrice(c){
 return [5,10,20,40,80,160][c.rank]||5;
}

function cardHTML(c,compact=false,sellable=false){
 const r = rarity(c.rank);
 const count = state.inventory[c.id]||0;

 return `
 <article class="character-card">
  <div class="character-icon">${c.icon}</div>
  <div class="rarity" style="color:${r.color}">${r.name}</div>
  <h3>${c.name}</h3>
  ${compact ? "" : `
   <div class="power">${c.desc}</div>
   <div class="power">전투력 ${power(c).toLocaleString()}</div>
   <span class="count-badge">보유 ${count}명</span>
  `}
  ${sellable ? `
   <button class="sell-btn" data-sell="${c.id}">
    1명 판매 · 🪙 ${salePrice(c)}
   </button>
  ` : ""}
 </article>`;
}

function renderCollection(){
 const list = CHARACTERS.filter(
  c=>(state.inventory[c.id]||0)>0
 );

 $("collectionGrid").innerHTML = list.length
  ? list.map(c=>cardHTML(c,false,true)).join("")
  : '<div class="empty-state">아직 캐릭터가 없어요. 먼저 뽑기를 해보세요!</div>';
}

/* 선택 목록 */

function populateSelect(id){
 const select = $(id);
 const old = select.value;

 const owned = CHARACTERS.filter(
  c=>(state.inventory[c.id]||0)>0
 );

 select.innerHTML = owned.length
  ? owned.map(c=>`
    <option value="${c.id}">
     ${c.name} ×${state.inventory[c.id]}
    </option>
   `).join("")
  : '<option value="">보유 캐릭터 없음</option>';

 if(owned.some(c=>c.id===old)){
  select.value = old;
 }
}

/* 강화 */

function renderEnhance(){
 populateSelect("enhanceSelect");

 const c = character($("enhanceSelect").value);
 const box = $("enhanceInfo");

 if(!c){
  box.textContent = "먼저 뽑기에서 캐릭터를 획득해 주세요.";
  $("enhanceButton").disabled = true;
  renderSpecial();
  return;
 }

 const count = state.inventory[c.id]||0;

 box.innerHTML = `
  <strong style="color:${rarity(c.rank).color}">${c.name}</strong>
  <br>
  등급: ${rarity(c.rank).name} · 보유: ${count}명
  <br>
  ${c.rank===5
   ? "최고 등급입니다."
   : "성공 확률: "+RATES[c.rank]+"% · 같은 캐릭터 2명 필요"}
 `;

 $("enhanceButton").disabled = count<2 || c.rank>=5;

 renderSpecial();
}

function renderSpecial(){
 const ready =
  (state.inventory.devSongao||0)>0 &&
  (state.inventory.tyrant||0)>0;

 $("specialEnhancePanel").hidden = !ready;

 $("specialChance").textContent =
  specialBoosted ? "80% (방향키 보너스)" : "1%";
}

function enhance(){
 const id = $("enhanceSelect").value;
 const c = character(id);

 if(!c) return;

 if((state.inventory[id]||0)<2){
  toast("같은 캐릭터가 2명 이상 필요해요.");
  return;
 }

 if(c.rank>=5){
  toast("비밀 등급은 최고 등급이에요.");
  return;
 }

 state.inventory[id]--;

 let message;

 if(Math.random()*100<RATES[c.rank]){
  const pool = CHARACTERS.filter(
   x=>x.rank===c.rank+1 && x.id!=="ultimatePig"
  );

  const next = pool[Math.floor(Math.random()*pool.length)];

  state.inventory[next.id] = (state.inventory[next.id]||0)+1;

  message = `강화 성공! ${c.name} → ${next.name}`;
 }else{
  message = "강화 실패! 재료 1명이 소모되었어요.";
 }

 $("enhanceLog").textContent = message;

 save();
 toast(message);
}

/* 자동 강화 */

function stopAutoEnhance(message){
 clearInterval(autoEnhanceTimer);
 autoEnhanceTimer = null;

 clearTimeout(autoEnhanceLimitTimer);
 autoEnhanceLimitTimer = null;

 $("autoEnhanceButton").textContent = "자동 강화 시작 (최대 3분)";

 if(message) toast(message);
}

function toggleAutoEnhance(){
 if(autoEnhanceTimer){
  stopAutoEnhance("자동 강화를 멈췄어요.");
  return;
 }

 $("autoEnhanceButton").textContent = "자동 강화 중지";

 autoEnhanceTimer = setInterval(()=>{
  const c = CHARACTERS.find(
   x=>x.rank<5 && (state.inventory[x.id]||0)>=2
  );

  if(!c){
   stopAutoEnhance("강화할 캐릭터가 없어 자동 강화를 멈췄어요.");
   return;
  }

  $("enhanceSelect").value = c.id;
  enhance();

 },Math.max(25,250/Number($("enhanceSpeed").value||1)));

 autoEnhanceLimitTimer = setTimeout(
  ()=>stopAutoEnhance("⏰ 자동 강화 3분이 지나 자동 정지되었습니다."),
  180000
 );

 toast("자동 강화 시작! 최대 3분 동안 실행됩니다.");
}

/* 자동 판매 */

function toggleAutoSell(){
 if(autoSellTimer){
  clearInterval(autoSellTimer);
  autoSellTimer = null;

  $("autoSellButton").textContent = "자동 판매 시작";
  toast("자동 판매를 멈췄어요.");
  return;
 }

 $("autoSellButton").textContent = "자동 판매 중지";

 autoSellTimer = setInterval(()=>{
  let changed = false;

  CHARACTERS.forEach(c=>{
   const count = state.inventory[c.id]||0;

   if(count>1){
    if(!state.isAdmin && state.coinLocked && state.coins>500){
     return;
    }

    state.inventory[c.id]--;
    addCoins(salePrice(c));
    changed = true;
   }
  });

  if(changed) save();

 },900);

 toast("각 캐릭터를 1명씩 남기고 중복만 판매합니다.");
}

/* 자동 뽑기 */

function toggleAutoSummon(){
 if(autoSummonTimer){
  clearInterval(autoSummonTimer);
  autoSummonTimer = null;

  $("autoSummonButton").textContent = "자동 뽑기 시작 · 10배속";
  toast("자동 뽑기를 멈췄어요.");
  return;
 }

 if(state.coins<10){
  toast("뽑을 코인이 없어요.");
  return;
 }

 $("autoSummonButton").textContent = "자동 뽑기 중지";

 autoSummonTimer = setInterval(()=>{
  const n = Math.min(10,Math.floor(state.coins/10));

  if(n<=0){
   clearInterval(autoSummonTimer);
   autoSummonTimer = null;

   $("autoSummonButton").textContent = "자동 뽑기 시작 · 10배속";
   toast("코인을 모두 사용했어요.");
   return;
  }

  summon(n);

 },1000);

 toast("코인이 부족해질 때까지 자동으로 뽑습니다.");
}

/* 대전 */

function fighterHTML(c,p){
 if(!c) return "캐릭터 없음";

 return `
  <div class="character-icon">${c.icon}</div>
  <div class="rarity" style="color:${rarity(c.rank).color}">
   ${rarity(c.rank).name}
  </div>
  <h3>${c.name}</h3>
  <p>전투력 ${p.toLocaleString()}</p>
 `;
}

function renderBattle(){
 populateSelect("battleSelect");
 updateFighters();

 $("botRoster").innerHTML = BOTS.map(b=>`
  <div class="bot-item">
   <strong>${b.icon} ${b.name}</strong>
   <span>${rarity(b.rank).name} · 전투력 ${b.power.toLocaleString()}</span>
  </div>
 `).join("");
}

function updateFighters(){
 const c = character($("battleSelect").value);

 $("battleMyCard").innerHTML =
  c ? fighterHTML(c,power(c)) : "캐릭터 없음";

 $("battleButton").disabled = !c || battleInProgress;
 $("autoBattleButton").disabled = !c;
}

function setHealth(p,b,pn,bn){
 $("playerHpName").textContent = pn;
 $("botHpName").textContent = bn;

 $("playerHpText").textContent = p+" / 100";
 $("botHpText").textContent = b+" / 100";

 $("playerHpBar").style.width = p+"%";
 $("botHpBar").style.width = b+"%";
}

function logBattle(message,kind="system-action"){
 const log = $("battleLog");

 if(log.textContent==="대전 기록이 여기에 표시됩니다."){
  log.innerHTML = "";
 }

 const p = document.createElement("p");
 p.className = kind;
 p.textContent = message;

 log.appendChild(p);
 log.scrollTop = log.scrollHeight;
}

const wait = ms => new Promise(resolve=>setTimeout(resolve,ms));

function randomAttack(){
 const attacks = [
  {name:"빠른 잽",power:.78},
  {name:"정면 돌파",power:1},
  {name:"강력한 필살기",power:1.28}
 ];

 return attacks[Math.floor(Math.random()*attacks.length)];
}

function randomBot(){
 return BOTS[Math.floor(Math.random()*BOTS.length)];
}

async function battle(){
 if(battleInProgress) return;

 const owned = CHARACTERS.filter(
  c=>(state.inventory[c.id]||0)>0
 );

 if(!owned.length){
  toast("먼저 캐릭터를 획득해 주세요.");
  return;
 }

 // 자동 대전에서도 내가 선택한 캐릭터는 고정
 const c = character($("battleSelect").value);

 if(!c){
  toast("출전 캐릭터를 선택해 주세요.");
  return;
 }

 if(state.coins<5){
  toast("대전을 시작하려면 5코인이 필요해요.");
  return;
 }

 battleInProgress = true;
 updateFighters();

 // 상대 봇만 매 경기 랜덤 변경
 const bot = randomBot();
 const speed = Number($("battleSpeed").value)||1;

 $("battleBotCard").innerHTML = fighterHTML(bot,bot.power);
 $("battleResult").className = "battle-result";
 $("battleResult").textContent = "대전 진행 중...";
 $("battleLog").innerHTML = "";

 let ph = 100;
 let bh = 100;
 let turn = 0;
 let playerTurn = true;

 setHealth(ph,bh,c.name,bot.name);

 logBattle(`대전 시작! ${c.name} VS ${bot.name}`);

 while(ph>0 && bh>0 && turn<30){
  turn++;

  const attack = randomAttack();

  if(playerTurn){
   const damage = Math.max(
    4,
    Math.round(
     (8+8*power(c)/bot.power)*
     attack.power*
     (.85+Math.random()*.3)
    )
   );

   bh = Math.max(0,bh-damage);

   logBattle(
    `${c.name}의 ${attack.name}! ${bot.name}에게 ${damage} 피해`,
    "player-action"
   );

  }else{
   const damage = Math.max(
    4,
    Math.round(
     (8+8*bot.power/power(c))*
     attack.power*
     (.85+Math.random()*.3)
    )
   );

   ph = Math.max(0,ph-damage);

   logBattle(
    `${bot.name}의 ${attack.name}! ${c.name}에게 ${damage} 피해`,
    "bot-action"
   );
  }

  setHealth(ph,bh,c.name,bot.name);

  await wait(600/speed);

  playerTurn = !playerTurn;
 }

 const won = bh<=0 || (ph>0 && bh>0 && ph>=bh);

 spendCoins(5);

 if(won){
  state.wins++;

  const earned = addCoins(100);

  $("battleResult").className = "battle-result win";

  $("battleResult").textContent =
   `🏆 승리! ${c.name}이(가) ${bot.name}을(를) 이겼어요. +${earned}코인`;

 }else{
  const penalty = Math.min(50,state.coins);

  spendCoins(penalty);

  $("battleResult").className = "battle-result lose";

  $("battleResult").textContent =
   `패배... ${bot.name}에게 패배했어요. 추가 차감 ${penalty}코인`;
 }

 logBattle(won ? `${c.name} 승리!` : `${bot.name} 승리!`);

 save();

 battleInProgress = false;
 updateFighters();
}

/* 자동 대전 */

async function runAutoBattle(){
 while(autoBattleRunning){

  if(state.coins<5){
   autoBattleRunning = false;
   $("autoBattleButton").textContent = "자동 대전 시작";
   toast("코인이 부족해 자동 대전을 멈췄어요.");
   break;
  }

  await battle();

  if(autoBattleRunning){
   await wait(500);
  }
 }
}

function toggleAutoBattle(){
 if(autoBattleRunning){
  autoBattleRunning = false;
  $("autoBattleButton").textContent = "자동 대전 시작";
  toast("자동 대전을 멈췄어요.");
  return;
 }

 if(!CHARACTERS.some(c=>(state.inventory[c.id]||0)>0)){
  toast("먼저 캐릭터를 획득해 주세요.");
  return;
 }

 if(!character($("battleSelect").value)){
  toast("먼저 출전할 캐릭터를 선택해 주세요.");
  return;
 }

 autoBattleRunning = true;

 $("autoBattleButton").textContent = "자동 대전 중지";

 toast("선택한 내 캐릭터는 고정되고 상대 봇만 매 경기 무작위로 바뀝니다.");

 runAutoBattle();
}

/* 특수 강화 */

function specialEnhance(){
 if(!(state.inventory.devSongao>0 && state.inventory.tyrant>0)){
  toast("개발자 송가오와 폭군 김하진이 모두 필요해요.");
  return;
 }

 if(Math.random()<(specialBoosted?.8:.01)){
  state.inventory.ultimatePig =
   (state.inventory.ultimatePig||0)+1;

  save();

  showGameClear("황한송김박돼지 승원");

 }else{
  toast("특수 강화 실패! 재료 캐릭터는 그대로 보존됩니다.");
 }
}

/* 게임 클리어 */

function showGameClear(name){
 $("gameClearName").textContent = name;
 $("gameClearOverlay").hidden = false;
}

/* 관리자 */

function activateAdmin(){
 if($("adminCode").value!=="140614"){
  toast("관리자 코드가 맞지 않습니다.");
  return;
 }

 state.isAdmin = true;
 state.coinLocked = false;

 state.inventory.ultimatePig =
  (state.inventory.ultimatePig||0)+1;

 save();

 showGameClear("황한송김박돼지 승원");

 $("adminCode").value = "";

 toast("관리자 모드가 활성화되었습니다. 코인 제한이 해제됩니다.");
}

/* 화면 업데이트 */

function renderAll(){
 $("coins").textContent = state.coins.toLocaleString();

 const coinStatus = $("coinStatus");

 if(coinStatus){
  coinStatus.textContent = state.isAdmin
   ? "관리자 모드 · 코인 제한 없음"
   : state.coinLocked
    ? "코인 획득 잠금 · 500 이하가 되면 해제"
    : "일반 모드 · 최대 3,000코인";
 }

 $("ownedCount").textContent =
  CHARACTERS.filter(c=>(state.inventory[c.id]||0)>0).length;

 $("winCount").textContent = state.wins;

 $("battlePower").textContent =
  CHARACTERS.reduce(
   (sum,c)=>sum+power(c)*(state.inventory[c.id]||0),
   0
  ).toLocaleString();

 renderCollection();
 renderEnhance();
 renderBattle();
}

function showPage(name){
 document.querySelectorAll(".tab").forEach(b=>{
  b.classList.toggle("active",b.dataset.page===name);
 });

 document.querySelectorAll(".page").forEach(p=>{
  p.classList.toggle("active",p.id==="page-"+name);
 });
}

/* 버튼 이벤트 */

function bindEvents(){

 document.querySelectorAll(".tab").forEach(b=>{
  b.addEventListener("click",()=>showPage(b.dataset.page));
 });

 $("summonOne").addEventListener("click",()=>summon(1));
 $("summonTen").addEventListener("click",()=>summon(10));

 $("autoSummonButton").addEventListener("click",toggleAutoSummon);

 $("collectionGrid").addEventListener("click",e=>{
  const btn = e.target.closest("[data-sell]");

  if(!btn) return;

  const c = character(btn.dataset.sell);

  if(!c || (state.inventory[c.id]||0)<1) return;

  if(!state.isAdmin && state.coinLocked && state.coins>500){
   toast("코인이 500 이하가 되면 다시 판매 보상을 받을 수 있어요.");
   return;
  }

  state.inventory[c.id]--;

  const earned = addCoins(salePrice(c));

  save();

  toast(c.name+" 판매 완료! +"+earned+"코인");
 });

 $("autoSellButton").addEventListener("click",toggleAutoSell);

 $("enhanceSelect").addEventListener("change",renderEnhance);
 $("enhanceButton").addEventListener("click",enhance);

 $("autoEnhanceButton").addEventListener("click",toggleAutoEnhance);

 $("specialEnhanceButton").addEventListener("click",specialEnhance);

 $("adminButton").addEventListener("click",activateAdmin);

 $("adminCode").addEventListener("keydown",e=>{
  if(e.key==="Enter") activateAdmin();
 });

 $("battleSelect").addEventListener("change",updateFighters);

 $("battleButton").addEventListener("click",battle);

 $("autoBattleButton").addEventListener("click",toggleAutoBattle);

 $("closeGameClear").addEventListener("click",()=>{
  $("gameClearOverlay").hidden = true;
 });

 /* 특수 강화 확률 비밀 코드 */

 document.addEventListener("keydown",e=>{
  if(e.target.matches("input,select,textarea")) return;

  if(e.key===cheatSequence[cheatProgress]){
   cheatProgress++;

   if(cheatProgress===cheatSequence.length){
    specialBoosted = true;
    cheatProgress = 0;

    renderSpecial();

    toast("특수 강화 확률이 80%로 올라갔어요!");
   }

  }else{
   cheatProgress = e.key===cheatSequence[0] ? 1 : 0;
  }
 });
}

/* 게임 시작 */

function init(){
 state = loadState();

 bindEvents();

 renderAll();
}

document.addEventListener("DOMContentLoaded",init);
