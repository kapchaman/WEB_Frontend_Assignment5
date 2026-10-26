"use strict";

// TASK 3 / OPTION B: exactly 20 points across four skills, each from 1 to 10.
const SKILL_TOTAL = 20;
const PRIMARY_MINIMUM = 7;
const ROLE_RULES = {
  observer: { label: "Observer", skill: "science" },
  engineer: { label: "Engineer", skill: "engineering" },
  pilot: { label: "Pilot", skill: "navigation" }
};
const CREW_COLORS = { mint: "Aurora mint", violet: "Nebula violet", amber: "Signal amber" };
const SKILLS = ["navigation", "engineering", "science", "stamina"];
const takenNames = ["nova", "vega", "orion"];
const crewForm = document.getElementById("crew-form");
const crewFields = [...crewForm.querySelectorAll("input, select")];
const touchedFields = new Set();
let submittedWithErrors = false;

// Keep required, min, max, step, pattern and length attributes for validity checks.
crewForm.noValidate = true;

function readCrew() {
  const data = {
    name: document.getElementById("crew-name").value.trim(),
    role: document.getElementById("crew-role").value,
    color: document.getElementById("crew-color").value,
    skills: {}
  };
  for (const skill of SKILLS) data.skills[skill] = document.getElementById(skill).valueAsNumber;
  return data;
}

function totalSkills(data) {
  let total = 0;
  for (const skill of SKILLS) total += Number.isFinite(data.skills[skill]) ? data.skills[skill] : 0;
  return total;
}

function getCrewError(field, data) {
  // Clear a previous custom error before checking native constraints again.
  field.setCustomValidity("");
  if (!field.checkValidity()) {
    if (field.validity.badInput) return "Enter a whole number from 1 to 10.";
    if (field.validity.valueMissing) return "This field is required.";
    if (field.validity.rangeUnderflow || field.validity.rangeOverflow || field.validity.stepMismatch)
      return "Use a whole number from 1 to 10.";
    if (field.id === "crew-name") return "Use 3–18 characters: start with a letter, then letters, digits, spaces, _ or -.";
    return "Check the value in this field.";
  }

  if (field.id === "crew-name") {
    // Trim and normalize case before comparing. Also protect programmatic values.
    if (!/^[A-Za-z][A-Za-z0-9 _-]{2,17}$/.test(data.name)) return "Use a callsign of 3–18 characters starting with a letter.";
    if (takenNames.includes(data.name.toLowerCase())) return "That callsign is taken. Choose another one.";
  }
  if (field.id === "crew-role" && !ROLE_RULES[data.role]) return "Choose one of the listed roles.";
  if (field.id === "crew-color") {
    if (!CREW_COLORS[data.color]) return "Choose one of the listed colors.";
    if (data.color === "amber" && data.role !== "engineer") return "Signal amber is reserved for Engineers. Change the role or color.";
  }
  if (SKILLS.includes(field.id)) {
    const role = ROLE_RULES[data.role];
    if (role && field.id === role.skill && data.skills[field.id] < PRIMARY_MINIMUM)
      return `${role.label} needs at least ${PRIMARY_MINIMUM} points in ${role.skill}.`;
    if (field.id === "stamina" && totalSkills(data) !== SKILL_TOTAL)
      return `Skills must total exactly ${SKILL_TOTAL}. Your total is ${totalSkills(data)}.`;
  }
  return "";
}

function validateCrewField(field, data) {
  const error = getCrewError(field, data);
  field.setCustomValidity(error);
  field.setAttribute("aria-invalid", String(Boolean(error)));
  document.getElementById(`${field.id}-error`).textContent = error;
  return error;
}

function updateErrorSummary(count) {
  const summary = document.getElementById("form-errors");
  summary.hidden = count === 0;
  summary.textContent = count ? `${count} ${count === 1 ? "field needs" : "fields need"} attention. Check the messages below.` : "";
}

function crewElement(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function buildCrewCard(data, final = false) {
  const color = CREW_COLORS[data.color] ? data.color : "mint";
  const card = crewElement("article", undefined, "crew-card");
  card.classList.add(`color-${color}`); // CSS classes, never inline styles.
  const top = crewElement("div", undefined, "crew-card-top");
  top.append(crewElement("span", "ORBIT / CREW DIVISION"), crewElement("span", final ? "ISSUED" : "DRAFT"));
  const emblem = crewElement("div", "✳", "crew-emblem");
  emblem.setAttribute("aria-hidden", "true");
  card.append(top, emblem, crewElement("h3", data.name || "Your callsign"),
    crewElement("p", ROLE_RULES[data.role]?.label || "Role unassigned", "crew-role"));
  const stats = crewElement("div", undefined, "crew-stats");
  for (const skill of SKILLS) {
    const row = crewElement("div", undefined, "crew-stat");
    row.append(crewElement("span", skill.toUpperCase()),
      crewElement("strong", Number.isFinite(data.skills[skill]) ? String(data.skills[skill]) : "—"));
    stats.append(row);
  }
  const foot = crewElement("div", undefined, "crew-card-foot");
  foot.append(crewElement("span", "ASTANA / AFTER HOURS"), crewElement("strong", `${totalSkills(data)} / ${SKILL_TOTAL} POINTS`));
  card.append(stats, foot);
  return card;
}

function updateCrew() {
  const data = readCrew();
  document.getElementById("crew-preview").replaceChildren(buildCrewCard(data));
  const remaining = SKILL_TOTAL - totalSkills(data);
  const counter = document.getElementById("points-left");
  counter.textContent = remaining >= 0 ? `${remaining} points left` : `${Math.abs(remaining)} points over budget`;
  counter.classList.toggle("is-over", remaining < 0);
  let errors = 0;
  // Revalidate ALL touched fields so cross-field messages do not become stale.
  for (const field of crewFields) {
    if (touchedFields.has(field.id) && validateCrewField(field, data)) errors += 1;
  }
  if (submittedWithErrors) updateErrorSummary(errors);
}

for (const field of crewFields) {
  field.addEventListener("blur", () => {
    touchedFields.add(field.id);
    updateCrew();
  });
  field.addEventListener("input", updateCrew);
  field.addEventListener("change", updateCrew);
}

crewForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = readCrew();
  let firstInvalid = null;
  let errors = 0;
  for (const field of crewFields) {
    touchedFields.add(field.id);
    if (validateCrewField(field, data)) {
      errors += 1;
      if (!firstInvalid) firstInvalid = field;
    }
  }
  submittedWithErrors = errors > 0;
  updateErrorSummary(errors);
  if (firstInvalid) {
    firstInvalid.focus();
    return; // No final card is built from invalid data.
  }

  const result = document.getElementById("crew-result");
  const title = crewElement("h3", "Crew ID issued. Welcome aboard.", "result-heading");
  title.tabIndex = -1;
  result.replaceChildren(title, buildCrewCard(data, true),
    crewElement("p", "Your callsign is now reserved for this page session. The form is ready for the next crew member.", "result-note"));
  takenNames.push(data.name.toLowerCase());
  crewForm.reset();
  title.focus({ preventScroll: true });
  result.scrollIntoView({ block: "nearest" });
});

crewForm.addEventListener("reset", () => {
  touchedFields.clear();
  submittedWithErrors = false;
  for (const field of crewFields) {
    field.setCustomValidity("");
    field.removeAttribute("aria-invalid");
    document.getElementById(`${field.id}-error`).textContent = "";
  }
  updateErrorSummary(0);
  // The reset event fires before the browser restores default input values.
  queueMicrotask(updateCrew);
});

updateCrew(); // Preview, but deliberately no errors on initial load.
