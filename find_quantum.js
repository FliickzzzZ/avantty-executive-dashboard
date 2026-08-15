import * as fs from "fs";
import * as path from "path";

const originalLeads = JSON.parse(fs.readFileSync(path.resolve("parsed_leads.json"), "utf-8"));

originalLeads.forEach((l, idx) => {
  if (l.website.toLowerCase().includes("quantum") || l.company.toLowerCase().includes("quantum") || l.name.toLowerCase().includes("rowe") || l.name.toLowerCase().includes("glyck")) {
    const day = Math.floor(idx / 6) + 4;
    const row = (idx % 6) + 2;
    console.log(`FOUND: ${l.name} | ${l.company} | ${l.website} in Tabla Dia ${day}, Fila ${row}`);
  }
});
