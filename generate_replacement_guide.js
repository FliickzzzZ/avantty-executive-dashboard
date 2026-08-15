import * as fs from "fs";
import * as path from "path";

// Read the original batch of 166 leads (parsed_leads.json)
const originalLeads = JSON.parse(fs.readFileSync(path.resolve("parsed_leads.json"), "utf-8"));

// Track companies and find where duplicate occurrences are located
const seenCompany = new Map();
const duplicatesToReplace = [];

originalLeads.forEach((lead, idx) => {
  const day = Math.floor(idx / 6) + 4;
  const rowInSheet = (idx % 6) + 2; // Row 1 is header, so rows 2 to 7

  let compKey = (lead.website || lead.company).toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "").trim();
  if (!compKey) compKey = lead.company.toLowerCase().trim();

  if (!seenCompany.has(compKey)) {
    // First time seeing this company: KEEP IT
    seenCompany.set(compKey, {
      name: lead.name,
      day: `Tabla Dia ${day}`,
      row: rowInSheet,
      company: lead.company
    });
  } else {
    // Already seen: THIS IS A DUPLICATE TO REPLACE!
    const original = seenCompany.get(compKey);
    duplicatesToReplace.push({
      originalLead: original,
      duplicateLead: {
        name: lead.name,
        firstName: lead.firstName,
        company: lead.company,
        email: lead.email,
        website: lead.website,
        city: lead.city,
        day: `Tabla Dia ${day}`,
        row: rowInSheet,
        idx
      }
    });
  }
});

// Read extra leads (the 50 new ones)
const extraLeadsRaw = fs.readFileSync(path.resolve("extra_leads.txt"), "utf-8");
// Let's import parse logic to get all new unique leads from extra_leads.txt
import { execSync } from "child_process";

console.log(`=== DUPLICADOS ENCONTRADOS EN TUS TABLAS ORIGINALES: ${duplicatesToReplace.length} ===\n`);

duplicatesToReplace.forEach((d, idx) => {
  console.log(`[${idx + 1}] EN: ${d.duplicateLead.day} (Fila ${d.duplicateLead.row})`);
  console.log(`    ❌ REPETIDO A QUITAR: ${d.duplicateLead.name} (${d.duplicateLead.company})`);
  console.log(`    ℹ️ (Ya tenías en ${d.originalLead.day}, Fila ${d.originalLead.row} a ${d.originalLead.name})`);
});
