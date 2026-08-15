import * as fs from "fs";
import * as path from "path";

const originalLeads = JSON.parse(fs.readFileSync(path.resolve("parsed_leads.json"), "utf-8"));

originalLeads.forEach((l, idx) => {
  if (l.company.toLowerCase().includes("restaurantzone") || l.website.includes("restaurantzone") || l.name.toLowerCase().includes("restaurantzone")) {
    const day = Math.floor(idx / 6) + 4;
    const row = (idx % 6) + 2;
    console.log(`FOUND: ${l.name} | Company: "${l.company}" | Web: ${l.website} in Tabla Dia ${day}, Fila ${row}`);
  }
});
