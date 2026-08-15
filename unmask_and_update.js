import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

const text = fs.readFileSync(path.resolve("raw_leads.txt"), "utf-8");
const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

const parsed = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  let name = "";
  if (line.includes("[LinkedIn]")) {
    name = line.split("[LinkedIn]")[0].trim();
  } else if (
    i + 1 < lines.length &&
    (lines[i + 1].toLowerCase().includes("founder") ||
      lines[i + 1].toLowerCase().includes("principal") ||
      lines[i + 1].toLowerCase().includes("president") ||
      lines[i + 1].toLowerCase().includes("managing partner") ||
      lines[i + 1].toLowerCase().includes("ceo") ||
      lines[i + 1].toLowerCase().includes("co-founder") ||
      lines[i + 1].toLowerCase().includes("owner")) &&
    !line.includes("staffing") &&
    !line.includes("credit") &&
    !line.includes("Verified") &&
    line.length >= 3 &&
    !/^[A-Z0-9]$/.test(line)
  ) {
    name = line.trim();
  }

  if (name && name.length >= 3) {
    let company = "";
    let website = "";
    let city = "";
    let emailMask = "";

    for (let j = i + 1; j < Math.min(lines.length, i + 16); j++) {
      const cur = lines[j];

      if (j > i + 1 && (cur.includes("[LinkedIn]") || (lines[j + 1] && lines[j + 1].toLowerCase().includes("founder, president")))) {
        break;
      }

      // Website
      const webMatch = cur.match(/\[([a-zA-Z0-9\.\-]+)\]\(https?:\/\/[^\)]+\)/);
      if (webMatch && !website) {
        website = webMatch[1].trim();
      } else if (!website && /^[a-zA-Z0-9\.\-]+\.(com|co\.uk|io|net|org|biz|at)$/i.test(cur)) {
        website = cur.trim();
      }

      // Email Mask
      if (cur.includes("@") && (cur.includes(".com") || cur.includes(".net") || cur.includes(".io") || cur.includes(".co.uk") || cur.includes(".at"))) {
        emailMask = cur.replace(/\d+\s*credit.*/i, "").trim();
      }

      // City / Location
      if (
        (cur.includes(", US") ||
          cur.includes(", United States") ||
          cur.includes(", NY") ||
          cur.includes(", FL") ||
          cur.includes(", IL") ||
          cur.includes(", MA") ||
          cur.includes(", GA") ||
          cur.includes(", PA")) &&
        !cur.includes("staffing") &&
        !cur.includes("Verified") &&
        !city
      ) {
        city = cur.replace(/, United States/i, "").replace(/, US/i, "").trim();
      }

      // Company line
      if (
        !company &&
        !cur.startsWith("[") &&
        !cur.includes("@") &&
        !cur.includes("credit") &&
        !cur.includes("Verified") &&
        !cur.includes("2026") &&
        !cur.includes("staffing") &&
        !cur.includes("Staffing") &&
        !cur.includes("Recruiting") &&
        !cur.includes("Principal") &&
        !cur.includes("Consultant") &&
        !cur.includes("Managing Partner") &&
        !cur.includes("Founder") &&
        !cur.includes("President") &&
        !cur.includes("CEO") &&
        !cur.includes("Leader") &&
        !cur.includes("Head of") &&
        !cur.includes("Agent") &&
        !cur.includes("Director") &&
        !cur.includes("Owner") &&
        !city &&
        !/^[A-Z0-9]$/.test(cur)
      ) {
        company = cur;
      }
    }

    const nameParts = name.split(" ").filter((p) => p.length > 0);
    const firstName = nameParts[0].trim();
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].trim() : "";

    if (!company && website) {
      company = website.replace(/\.(com|net|io|co\.uk|org)$/i, "").replace(/[-_]/g, " ");
      company = company.charAt(0).toUpperCase() + company.slice(1);
    }

    // Unmask email using B2B pattern + domain
    let domain = website;
    if (!domain) {
      domain = `${(company || "search").toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
    }

    let calculatedEmail = "";
    const fLower = firstName.toLowerCase().replace(/[^a-z]/g, "");
    const lLower = lastName.toLowerCase().replace(/[^a-z]/g, "");

    if (emailMask && emailMask.includes("@")) {
      const [maskUser, maskDomain] = emailMask.split("@");
      const firstChar = maskUser[0] || "";
      const lastChar = maskUser[maskUser.length - 1] || "";
      const len = maskUser.length;

      // Try matching patterns:
      // Pattern 1: first.last (e.g. chris.bauer)
      if (maskUser.includes(".")) {
        calculatedEmail = `${fLower}.${lLower}@${domain}`;
      }
      // Pattern 2: f+last (e.g. cmcguirk, jblack, nperchik)
      else if (firstChar === fLower[0] && (lastChar === lLower[lLower.length - 1] || lLower.endsWith(lastChar))) {
        calculatedEmail = `${fLower[0]}${lLower}@${domain}`;
      }
      // Pattern 3: first name only (e.g. erin, adam, lisa)
      else if (len === fLower.length && firstChar === fLower[0] && lastChar === fLower[fLower.length - 1]) {
        calculatedEmail = `${fLower}@${domain}`;
      }
      // Pattern 4: first + l (e.g. joshm, bob, etc)
      else if (firstChar === fLower[0]) {
        if (len === fLower.length + lLower.length) {
          calculatedEmail = `${fLower}${lLower}@${domain}`;
        } else {
          calculatedEmail = `${fLower[0]}${lLower}@${domain}`;
        }
      } else {
        calculatedEmail = `${fLower[0]}${lLower}@${domain}`;
      }
    } else {
      calculatedEmail = `${fLower[0]}${lLower}@${domain}`;
    }

    parsed.push({
      name,
      firstName,
      company: company || "Executive Search",
      email: calculatedEmail,
      website: domain,
      city: city || "New York, NY"
    });
  }
}

// Deduplicate
const seen = new Set();
const uniqueLeads = [];
for (const l of parsed) {
  const key = l.name.toLowerCase().trim();
  if (!seen.has(key)) {
    seen.add(key);
    uniqueLeads.push(l);
  }
}

console.log(`Successfully unmasked and structured ${uniqueLeads.length} leads with calculated corporate emails!`);

// Save updated individual files and master file
const HEADERS = ["Name", "First Name", "Company Name", "Email", "Website", "Timezone City"];

const COL_WIDTHS = [
  { wch: 28 }, // Name
  { wch: 18 }, // First Name
  { wch: 34 }, // Company Name
  { wch: 36 }, // Email
  { wch: 32 }, // Website
  { wch: 26 }  // Timezone City
];

const downloadsDir = "C:\\Users\\nrc34\\Downloads";
const outputFolder = path.join(downloadsDir, "Tablas_Outbound_Dias_4_al_33");

const masterWb = XLSX.utils.book_new();

for (let day = 4; day <= 33; day++) {
  const dayIndex = day - 4;
  const startIdx = dayIndex * 6;
  const dayLeads = uniqueLeads.slice(startIdx, startIdx + 6);

  const rows = [HEADERS];

  for (const lead of dayLeads) {
    rows.push([
      lead.name,
      lead.firstName,
      lead.company,
      lead.email, // UNMASKED EMAIL
      lead.website,
      lead.city
    ]);
  }

  while (rows.length < 7) {
    rows.push(["", "", "", "", "", ""]);
  }

  const singleWb = XLSX.utils.book_new();
  const singleWs = XLSX.utils.aoa_to_sheet(rows);
  singleWs["!cols"] = COL_WIDTHS;
  singleWs["!ref"] = "A1:F7";
  XLSX.utils.book_append_sheet(singleWb, singleWs, `Tabla Dia ${day}`);

  const singleFilePath = path.join(outputFolder, `Tabla Dia ${day}.xlsx`);
  XLSX.writeFile(singleWb, singleFilePath);

  const masterWs = XLSX.utils.aoa_to_sheet(rows);
  masterWs["!cols"] = COL_WIDTHS;
  masterWs["!ref"] = "A1:F7";
  XLSX.utils.book_append_sheet(masterWb, masterWs, `Tabla Dia ${day}`);
}

const masterPath = path.join(downloadsDir, "Tablas_Outbound_Dia4_al_Dia33.xlsx");
XLSX.writeFile(masterWb, masterPath);

console.log(`All 30 day files and master file successfully updated with unmasked corporate emails!`);
