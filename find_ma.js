import * as fs from "fs";
import * as path from "path";

const originalLeads = JSON.parse(fs.readFileSync(path.resolve("parsed_leads.json"), "utf-8"));

originalLeads.forEach((l, idx) => {
  if (l.website.includes("mastaffing") || l.company.toLowerCase().includes("mastaffing") || l.company.toLowerCase().includes("michael aaron") || l.name.toLowerCase().includes("knafo")) {
    const day = Math.floor(idx / 6) + 4;
    const row = (idx % 6) + 2;
    console.log(`FOUND: ${l.name} | ${l.company} | ${l.website} in Tabla Dia ${day}, Fila ${row}`);
  }
});
