import * as fs from "fs";
import * as path from "path";

const leads = JSON.parse(fs.readFileSync(path.resolve("parsed_leads.json"), "utf-8"));

// Group by company & website/domain
const companyMap = new Map();

leads.forEach((lead, idx) => {
  const dayNum = Math.floor(idx / 6) + 4;
  
  // Normalize company & website key
  let cleanDomain = (lead.website || "").toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "");
  let cleanCompany = (lead.company || "").toLowerCase().trim();

  const key = cleanDomain || cleanCompany;

  if (!companyMap.has(key)) {
    companyMap.set(key, {
      companyName: lead.company,
      website: lead.website,
      leads: []
    });
  }

  companyMap.get(key).leads.push({
    name: lead.name,
    firstName: lead.firstName,
    email: lead.email,
    day: `Dia ${dayNum}`,
    table: `Tabla Dia ${dayNum}`,
    city: lead.city
  });
});

// Filter only companies with > 1 lead
const duplicates = [];
companyMap.forEach((data, key) => {
  if (data.leads.length > 1) {
    duplicates.push(data);
  }
});

console.log(`=== TOTAL EMPRESAS CON MULTIPLES LEADS: ${duplicates.length} ===\n`);

duplicates.forEach((item, idx) => {
  console.log(`[${idx + 1}] EMPRESA: "${item.companyName}" (Web: ${item.website}) -> ${item.leads.length} LEADS:`);
  item.leads.forEach((l) => {
    console.log(`    - ${l.name} (${l.day} / ${l.table}) - Email: ${l.email} - Ciudad: ${l.city}`);
  });
  console.log("");
});
