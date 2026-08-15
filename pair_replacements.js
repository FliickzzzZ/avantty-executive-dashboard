import * as fs from "fs";
import * as path from "path";

// Read original leads
const originalLeads = JSON.parse(fs.readFileSync(path.resolve("parsed_leads.json"), "utf-8"));

// Read all unique leads from extra_leads.txt
const uniqueCompanyLeads = JSON.parse(fs.readFileSync(path.resolve("final_unique_company_leads.json"), "utf-8"));

// Track companies already present in original
const seenCompany = new Map();
const duplicates = [];

originalLeads.forEach((lead, idx) => {
  const day = Math.floor(idx / 6) + 4;
  const rowInSheet = (idx % 6) + 2;

  let compKey = (lead.website || lead.company).toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "").trim();
  if (!compKey) compKey = lead.company.toLowerCase().trim();

  if (!seenCompany.has(compKey)) {
    seenCompany.set(compKey, {
      name: lead.name,
      day: `Tabla Dia ${day}`,
      row: rowInSheet,
      company: lead.company
    });
  } else {
    const original = seenCompany.get(compKey);
    duplicates.push({
      tab: `Tabla Dia ${day}`,
      row: rowInSheet,
      currentPerson: lead.name,
      currentCompany: lead.company,
      reason: `Ya tenías a ${original.name} de "${original.company}" en ${original.day} (Fila ${original.row})`
    });
  }
});

// Pick the best brand new companies from the extra leads (not in seenCompany)
const replacementCandidates = uniqueCompanyLeads.filter((l) => {
  let compKey = (l.website || l.company).toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "").trim();
  return !seenCompany.has(compKey);
});

console.log(`Available replacement candidates: ${replacementCandidates.length}`);

// Output clean step-by-step replacement guide
duplicates.forEach((dup, idx) => {
  const rep = replacementCandidates[idx];
  console.log(`\n============================================================`);
  console.log(`📍 SUSTITUCIÓN #${idx + 1}: En [${dup.tab}] ➔ Fila ${dup.row}`);
  console.log(`❌ Quitar: "${dup.currentPerson}" (Empresa repetida: ${dup.currentCompany})`);
  console.log(`   Motivo: ${dup.reason}`);
  console.log(`✅ Pegar en esa fila:`);
  console.log(`   • Columna A (Name): ${rep.name}`);
  console.log(`   • Columna B (First Name): ${rep.firstName}`);
  console.log(`   • Columna C (Company Name): ${rep.company}`);
  console.log(`   • Columna D (Email): ${rep.email}`);
  console.log(`   • Columna E (Website): ${rep.website}`);
  console.log(`   • Columna F (Timezone City): ${rep.city}`);
});
