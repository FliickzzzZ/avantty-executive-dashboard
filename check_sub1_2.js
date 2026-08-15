import * as fs from "fs";
import * as path from "path";

const originalLeads = JSON.parse(fs.readFileSync(path.resolve("parsed_leads.json"), "utf-8"));
const uniqueCompanyLeads = JSON.parse(fs.readFileSync(path.resolve("final_unique_company_leads.json"), "utf-8"));

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

const replacementCandidates = uniqueCompanyLeads.filter((l) => {
  let compKey = (l.website || l.company).toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "").trim();
  return !seenCompany.has(compKey);
});

console.log("SUSTITUCION 1:");
console.log(duplicates[0], replacementCandidates[0]);
console.log("\nSUSTITUCION 2:");
console.log(duplicates[1], replacementCandidates[1]);
