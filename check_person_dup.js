import * as fs from "fs";
import * as path from "path";

const leads = JSON.parse(fs.readFileSync(path.resolve("parsed_leads.json"), "utf-8"));

// Check person names
const nameCount = new Map();
leads.forEach((l, idx) => {
  const day = Math.floor(idx / 6) + 4;
  const name = l.name.trim();
  if (!nameCount.has(name)) {
    nameCount.set(name, []);
  }
  nameCount.get(name).push({ day: `Dia ${day}`, table: `Tabla Dia ${day}`, company: l.company });
});

nameCount.forEach((occurrences, name) => {
  if (occurrences.length > 1) {
    console.log(`PERSONA REPETIDA: ${name} (${occurrences.length} veces):`);
    occurrences.forEach((o) => console.log(`   - ${o.day} (${o.table}) | ${o.company}`));
  }
});
