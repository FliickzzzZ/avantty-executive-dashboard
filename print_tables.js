import * as fs from "fs";
import * as path from "path";

const leads = JSON.parse(fs.readFileSync(path.resolve("final_unique_company_leads.json"), "utf-8"));

console.log(`Total leads: ${leads.length}`);

for (let day = 4; day <= 33; day++) {
  const dayIndex = day - 4;
  const startIdx = dayIndex * 6;
  const dayLeads = leads.slice(startIdx, startIdx + 6);
  
  console.log(`\n### 📅 TABLA DIA ${day}`);
  console.log("| Name | First Name | Company Name | Email | Website | Timezone City |");
  console.log("|---|---|---|---|---|---|");
  dayLeads.forEach((l) => {
    console.log(`| ${l.name} | ${l.firstName} | ${l.company} | ${l.email} | ${l.website} | ${l.city} |`);
  });
}
