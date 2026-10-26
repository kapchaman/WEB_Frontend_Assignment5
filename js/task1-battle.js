"use strict";

// TASK 1 / OPTION B: all gameplay numbers are configured here.
const GAME = Object.freeze({
  maxHP: 100,
  attackMin: 8,
  attackMax: 15,
  enemyMin: 5,
  enemyMax: 14,
  healAmount: 20,
  maxHeals: 3,
  criticalChance: 0.10,
  criticalMultiplier: 2,
  defenseDivisor: 2,
  logLimit: 5
});

let battleState;
const battlePanel = document.getElementById("battle-panel");
const battleMessage = document.getElementById("battle-message");
const battleControls = document.getElementById("battle-controls");

// +1 makes the maximum reachable; floor makes every integer equally likely.
function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addBattleLog(message) {
  battleState.log.unshift(message);
  battleState.log = battleState.log.slice(0, GAME.logLimit);
}

function showBattleMessage(message, isError = false) {
  battleMessage.textContent = message;
  battleMessage.classList.toggle("is-error", isError);
}

function renderBattle() {
  for (const side of ["hero", "enemy"]) {
    const hp = battleState[`${side}HP`];
    const bar = document.getElementById(`${side}-hp`);
    bar.max = GAME.maxHP;
    bar.value = hp;
    document.getElementById(`${side}-hp-text`).textContent = `${hp} / ${GAME.maxHP}`;
  }
  document.getElementById("round-number").textContent = battleState.round;
  document.getElementById("repairs-left").textContent = battleState.heals;
  const isOver = battleState.phase !== "playing";
  for (const button of battleControls.querySelectorAll("button")) {
    button.disabled = isOver;
  }
  // aria-disabled keeps Repair focusable so an invalid move can explain itself.
  document.getElementById("heal-button").setAttribute(
    "aria-disabled", String(isOver || battleState.heals === 0 || battleState.heroHP === GAME.maxHP)
  );
  battlePanel.classList.toggle("is-win", battleState.phase === "won");
  battlePanel.classList.toggle("is-loss", battleState.phase === "lost");
  document.getElementById("battle-phase").textContent = battleState.phase === "won"
    ? "ROUTE CLEARED" : battleState.phase === "lost" ? "SIGNAL LOST" : "AWAITING YOUR MOVE";

  const log = document.getElementById("battle-log");
  log.replaceChildren();
  for (const message of battleState.log) {
    const item = document.createElement("li");
    item.textContent = message;
    log.append(item);
  }
}

function playTurn(action) {
  // Guard clauses reject moves BEFORE modifying any state or generating damage.
  if (battleState.phase !== "playing") {
    showBattleMessage("The simulation has ended. Restart to fly again.", true);
    return;
  }
  if (action !== "attack" && action !== "defend" && action !== "heal") {
    showBattleMessage("Unknown command. Choose Attack, Defend or Repair.", true);
    return;
  }
  if (action === "heal" && (battleState.heals === 0 || battleState.heroHP === GAME.maxHP)) {
    showBattleMessage(battleState.heals === 0 ? "No repair kits left. Attack or defend."
      : "Your hull is already full. No kit or turn was used.", true);
    return;
  }

  battleState.round += 1;
  if (action === "attack") {
    const critical = Math.random() < GAME.criticalChance;
    const damage = randomInteger(GAME.attackMin, GAME.attackMax) * (critical ? GAME.criticalMultiplier : 1);
    battleState.enemyHP = Math.max(0, battleState.enemyHP - damage);
    addBattleLog(`${critical ? "Critical! " : ""}You hit Silent Echo for ${damage} HP.`);
  } else if (action === "defend") {
    addBattleLog("Shield raised. The next incoming hit will be halved.");
  } else {
    const restored = Math.min(GAME.healAmount, GAME.maxHP - battleState.heroHP);
    battleState.heroHP += restored;
    battleState.heals -= 1;
    addBattleLog(`Repair complete: +${restored} HP. ${battleState.heals} kits remain.`);
  }

  if (battleState.enemyHP === 0) {
    battleState.phase = "won";
    showBattleMessage("Route cleared. The Steppe Voyager is going home.");
    renderBattle();
    return; // A defeated enemy does not hit back.
  }

  const critical = Math.random() < GAME.criticalChance;
  const incoming = randomInteger(GAME.enemyMin, GAME.enemyMax) * (critical ? GAME.criticalMultiplier : 1);
  const damage = action === "defend" ? Math.ceil(incoming / GAME.defenseDivisor) : incoming;
  battleState.heroHP = Math.max(0, battleState.heroHP - damage);
  addBattleLog(`Drone ${critical ? "critical hit" : "counterattack"}: -${damage} HP${action === "defend" ? " after shielding" : ""}.`);

  if (battleState.heroHP === 0) {
    battleState.phase = "lost";
    showBattleMessage("Signal lost. Reset the simulator and try a different flight plan.");
  } else {
    showBattleMessage(`Round ${battleState.round} complete. Choose your next move.`);
  }
  renderBattle();
}

function restartBattle() {
  battleState = { heroHP: GAME.maxHP, enemyHP: GAME.maxHP, heals: GAME.maxHeals,
    round: 0, phase: "playing", log: ["Systems ready. The route home is yours to clear."] };
  showBattleMessage("Choose a move. The drone responds after every valid turn.");
  renderBattle();
}

battleControls.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (button && battleControls.contains(button)) playTurn(button.dataset.action);
});
document.getElementById("restart-battle").addEventListener("click", restartBattle);
document.getElementById("battle-rules").textContent = `Attack ${GAME.attackMin}–${GAME.attackMax} · Enemy ${GAME.enemyMin}–${GAME.enemyMax} · Critical chance ${GAME.criticalChance * 100}%`;
document.getElementById("battle-manual").textContent = `Both ships start at ${GAME.maxHP} HP. Attack deals ${GAME.attackMin}–${GAME.attackMax}; the enemy responds for ${GAME.enemyMin}–${GAME.enemyMax}. Each attack on either side has a ${GAME.criticalChance * 100}% chance to deal ×${GAME.criticalMultiplier} damage. Defend divides the next hit by ${GAME.defenseDivisor}, rounded up. Repair restores up to ${GAME.healAmount} HP and has ${GAME.maxHeals} uses. The enemy responds after a valid repair too. Full-hull repairs and moves after the end are rejected. Restart begins a fresh simulation.`;
restartBattle();
