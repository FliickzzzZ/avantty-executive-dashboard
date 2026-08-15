import * as fs from "fs";
import * as path from "path";

const originalLeads = JSON.parse(fs.readFileSync(path.resolve("parsed_leads.json"), "utf-8"));
const uniqueCompanyLeads = JSON.parse(fs.readFileSync(path.resolve("final_unique_company_leads.json"), "utf-8"));

// Find Jared Coseglia / trustaffingpartners in originalLeads
originalLeads.forEach((l, idx) => {
  if (l.website.includes("trustaffingpartners") || l.company.toLowerCase().includes("tru staffing") || l.name.toLowerCase().includes("coseglia")) {
    const day = Math.floor(idx / 6) + 4;
    const row = (idx % 6) + 2;
    console.log(`FOUND: ${l.name} | ${l.company} | ${l.website} in Tabla Dia ${day}, Fila ${row}`);
  }
});

// Let's find some top remaining replacement candidates from extra_leads that are not in the current tables
console.log("\nTop unused replacement leads from extra_leads:");
const remaining = uniqueCompanyLeads.slice(30); // look at high quality candidates
remaining.slice(0, 5).forEach((r) => {
  console.log(`- ${r.name} | ${r.firstName} | ${r.company} | ${r.email} | ${r.website} | ${r.city}`);
});
