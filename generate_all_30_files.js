import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

const leads = JSON.parse(fs.readFileSync(path.resolve("parsed_leads.json"), "utf-8"));

const HEADERS = ["Name", "First Name", "Company Name", "Email", "Website", "Timezone City"];

const COL_WIDTHS = [
  { wch: 28 }, // Name
  { wch: 18 }, // First Name
  { wch: 34 }, // Company Name
  { wch: 36 }, // Email (Blank space for user)
  { wch: 32 }, // Website
  { wch: 26 }  // Timezone City
];

const downloadsDir = "C:\\Users\\nrc34\\Downloads";
const outputFolder = path.join(downloadsDir, "Tablas_Outbound_Dias_4_al_33");

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

// Master workbook with all 30 tabs
const masterWb = XLSX.utils.book_new();

// Days 4 to 33 (30 days)
for (let day = 4; day <= 33; day++) {
  const dayIndex = day - 4; // 0 to 29
  const startIdx = dayIndex * 6;
  const dayLeads = leads.slice(startIdx, startIdx + 6);

  const rows = [HEADERS];

  for (const lead of dayLeads) {
    rows.push([
      lead.name,
      lead.firstName,
      lead.company,
      "", // Empty email slot between Company and Website
      lead.website,
      lead.city
    ]);
  }

  // Ensure 6 lead rows per sheet
  while (rows.length < 7) {
    rows.push(["", "", "", "", "", ""]);
  }

  // 1. Create individual workbook for this day
  const singleWb = XLSX.utils.book_new();
  const singleWs = XLSX.utils.aoa_to_sheet(rows);
  singleWs["!cols"] = COL_WIDTHS;
  singleWs["!ref"] = "A1:F7";
  XLSX.utils.book_append_sheet(singleWb, singleWs, `Tabla Dia ${day}`);

  const singleFilePath = path.join(outputFolder, `Tabla Dia ${day}.xlsx`);
  XLSX.writeFile(singleWb, singleFilePath);

  // 2. Add to master workbook
  const masterWs = XLSX.utils.aoa_to_sheet(rows);
  masterWs["!cols"] = COL_WIDTHS;
  masterWs["!ref"] = "A1:F7";
  XLSX.utils.book_append_sheet(masterWb, masterWs, `Tabla Dia ${day}`);
}

// Save master workbook directly to Downloads root
const masterPath = path.join(downloadsDir, "Tablas_Outbound_Dia4_al_Dia33.xlsx");
XLSX.writeFile(masterWb, masterPath);

console.log(`Generated 30 individual Excel files in: ${outputFolder}`);
console.log(`Generated Master Excel file at: ${masterPath}`);
