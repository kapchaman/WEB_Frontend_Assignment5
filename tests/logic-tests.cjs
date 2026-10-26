// Optional development checks: node tests/logic-tests.cjs
// No test dependency is loaded by the website.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
const dummy = {querySelectorAll:()=>[], addEventListener:()=>{}, noValidate:false};
function contextFor(file, cut, replacements=[]) {
 let source=fs.readFileSync(path.join(root,'js',file),'utf8').split(cut)[0];
 for(const [before,after] of replacements) source=source.replace(before,after);
 const ctx=vm.createContext({document:{getElementById:()=>dummy}, console, Option:function(){}});
 vm.runInContext(source,ctx); return ctx;
}
const b=contextFor('task1-battle.js','battleControls.addEventListener');
vm.runInContext('renderBattle=()=>{}; showBattleMessage=(m)=>{ lastMessage=m; }; var lastMessage="";',b);
function run(code){return vm.runInContext(code,b);}
function setup(){run('restartBattle(); Math.random=()=>0.5;');}
function snapshot(){return run('JSON.stringify(battleState)');}
test('inclusive random endpoints',()=>{run('Math.random=()=>0;');assert.equal(run('randomInteger(8,15)'),8);run('Math.random=()=>0.999999;');assert.equal(run('randomInteger(8,15)'),15);});
test('full HP repair and unknown moves preserve the complete state',()=>{setup();const s=snapshot();run('playTurn("heal");');assert.equal(snapshot(),s);run('playTurn("teleport");');assert.equal(snapshot(),s);});
test('normal attack produces independent inclusive damage',()=>{setup();run('var rolls=[0.5,0,0.5,0];Math.random=()=>rolls.shift();playTurn("attack");');assert.equal(run('battleState.enemyHP'),92);assert.equal(run('battleState.heroHP'),95);});
test('defense halves one incoming hit with upward rounding',()=>{setup();run('Math.random=()=>0.5;playTurn("defend");');assert.equal(run('battleState.heroHP'),95);run('playTurn("attack");');assert.equal(run('battleState.heroHP'),85);});
test('repair clamps to max HP, consumes a kit, allows counterattack',()=>{setup();run('battleState.heroHP=98;playTurn("heal");');assert.equal(run('battleState.heroHP'),90);assert.equal(run('battleState.heals'),2);});
test('no-kit repair changes nothing',()=>{setup();run('battleState.heals=0;battleState.heroHP=40;');const s=snapshot();run('playTurn("heal");');assert.equal(snapshot(),s);});
test('critical hits on both sides double damage',()=>{setup();run('var rolls=[0,0.999,0,0.999];Math.random=()=>rolls.shift();playTurn("attack");');assert.equal(run('battleState.enemyHP'),70);assert.equal(run('battleState.heroHP'),72);});
test('victory prevents enemy retaliation and further moves',()=>{setup();run('battleState.enemyHP=1;playTurn("attack");');assert.equal(run('battleState.phase'),'won');assert.equal(run('battleState.heroHP'),100);const s=snapshot();run('playTurn("attack");');assert.equal(snapshot(),s);});
test('defeat clamps HP to zero and restart restores defaults',()=>{setup();run('battleState.heroHP=1;playTurn("defend");');assert.equal(run('battleState.phase'),'lost');assert.equal(run('battleState.heroHP'),0);run('restartBattle();');assert.equal(run('battleState.heroHP'),100);assert.equal(run('battleState.round'),0);assert.equal(run('battleState.heals'),3);});
test('flight recorder retains the five latest actions',()=>{setup();run('for(let i=0;i<8;i++) addBattleLog(String(i));');assert.equal(run('battleState.log.length'),5);assert.equal(run('battleState.log[0]'),'7');});
test('changed gameplay constants propagate into state and damage',()=>{const c=contextFor('task1-battle.js','battleControls.addEventListener',[['maxHP: 100','maxHP: 120'],['maxHeals: 3','maxHeals: 4'],['attackMin: 8','attackMin: 30'],['attackMax: 15','attackMax: 30'],['logLimit: 5','logLimit: 2']]);vm.runInContext('renderBattle=()=>{};showBattleMessage=()=>{};restartBattle();Math.random=()=>0.5;playTurn("attack");',c);assert.equal(vm.runInContext('battleState.enemyHP',c),90);assert.equal(vm.runInContext('battleState.heals',c),4);assert.equal(vm.runInContext('battleState.log.length',c),2);});
const board=contextFor('task2-board.js','taskBoard.addEventListener');
test('12 unique data objects with typed properties',()=>{assert.equal(vm.runInContext('tasks.length',board),12);assert.equal(vm.runInContext('new Set(tasks.map(t=>t.id)).size',board),12);assert.equal(vm.runInContext('tasks.every(t=>typeof t.minutes==="number" && typeof t.outdoor==="boolean" && typeof t.title==="string")',board),true);});
test('manual loop counts initial global progress and minutes',()=>{assert.equal(vm.runInContext('JSON.stringify(getBoardStats())',board),' {"done":2,"active":3,"remainingMinutes":145}'.trim());});
test('stats include added data and status changes',()=>{vm.runInContext('tasks.push({id:"new",title:"New task",description:"Test",tag:"New tag",priority:2,minutes:7,outdoor:false,status:"todo"});tasks.find(t=>t.id==="scope").status="done";',board);assert.equal(vm.runInContext('JSON.stringify(getBoardStats())',board),'{"done":3,"active":2,"remainingMinutes":132}');});
const crew=contextFor('task3-crew.js','for (const field of crewFields) {\n  field.addEventListener');
vm.runInContext('var data={name:"Xialik",role:"observer",color:"mint",skills:{navigation:4,engineering:4,science:8,stamina:4}};var field={id:"",setCustomValidity:()=>{},checkValidity:()=>true};',crew);
function error(id){return vm.runInContext(`field.id=${JSON.stringify(id)};getCrewError(field,data)`,crew);}
test('valid character satisfies all custom rules',()=>{for(const id of ['crew-name','crew-role','crew-color','navigation','engineering','science','stamina'])assert.equal(error(id),'');});
test('taken callsigns compare without case sensitivity',()=>{vm.runInContext('data.name="nOvA";',crew);assert.match(error('crew-name'),/taken/);vm.runInContext('data.name="Xialik";',crew);});
test('primary minimum follows each role',()=>{for(const [role,skill] of [['observer','science'],['engineer','engineering'],['pilot','navigation']]){vm.runInContext(`data.role="${role}";data.skills.${skill}=6;`,crew);assert.match(error(skill),/at least 7/);vm.runInContext(`data.skills.${skill}=7;`,crew);assert.equal(error(skill),'');}});
test('amber is exclusive to Engineers and role change repairs it',()=>{vm.runInContext('data.color="amber";data.role="pilot";',crew);assert.match(error('crew-color'),/reserved/);vm.runInContext('data.role="engineer";',crew);assert.equal(error('crew-color'),'');});
test('total must equal 20 including values above and below it',()=>{vm.runInContext('data.skills={navigation:4,engineering:7,science:4,stamina:4};',crew);assert.match(error('stamina'),/total is 19/);vm.runInContext('data.skills.stamina=6;',crew);assert.match(error('stamina'),/total is 21/);vm.runInContext('data.skills.stamina=5;',crew);assert.equal(error('stamina'),'');});
console.log(`\n${passed} logic checks passed. Browser validation and layout were checked separately.`);
