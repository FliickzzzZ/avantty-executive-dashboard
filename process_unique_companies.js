import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

function parseRawFile(filePath) {
  const text = fs.readFileSync(filePath, "utf-8");
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const leads = [];

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
        lines[i + 1].toLowerCase().includes("owner") ||
        lines[i + 1].toLowerCase().includes("lead") ||
        lines[i + 1].toLowerCase().includes("head of")) &&
      !line.includes("staffing") &&
      !line.includes("credit") &&
      !line.includes("Verified") &&
      line.length >= 3 &&
      !/^[A-Z0-9]$/.test(line)
    ) {
      name = line.trim();
    }

    if (name && name.length >= 3) {
      let title = "";
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
        if (cur.includes("@") && (cur.includes(".com") || cur.includes(".net") || cur.includes(".io") || cur.includes(".co.uk") || cur.includes(".at") || cur.includes(".bio"))) {
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
            cur.includes(", PA") ||
            cur.includes(", GB")) &&
          !cur.includes("staffing") &&
          !cur.includes("Verified") &&
          !city
        ) {
          city = cur.replace(/, United States/i, "").replace(/, US/i, "").replace(/, GB/i, "").trim();
        }

        // Title
        if (
          !title &&
          (cur.toLowerCase().includes("founder") ||
            cur.toLowerCase().includes("ceo") ||
            cur.toLowerCase().includes("managing partner") ||
            cur.toLowerCase().includes("president") ||
            cur.toLowerCase().includes("principal") ||
            cur.toLowerCase().includes("owner") ||
            cur.toLowerCase().includes("consultant") ||
            cur.toLowerCase().includes("recruiter") ||
            cur.toLowerCase().includes("director"))
        ) {
          title = cur;
        }

        // Company
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
          cur !== title &&
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
        company = website.replace(/\.(com|net|io|co\.uk|org|bio|biz|at)$/i, "").replace(/[-_]/g, " ");
        company = company.charAt(0).toUpperCase() + company.slice(1);
      }

      let domain = website;
      if (!domain) {
        domain = `${(company || "search").toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
      }

      // Seniority Score
      let score = 1;
      const tLower = (title || "").toLowerCase();
      if (tLower.includes("owner")) score = 10;
      else if (tLower.includes("founder") || tLower.includes("co-founder")) score = 9;
      else if (tLower.includes("ceo") || tLower.includes("president")) score = 8;
      else if (tLower.includes("managing partner") || tLower.includes("managing director")) score = 7;
      else if (tLower.includes("principal")) score = 5;
      else if (tLower.includes("partner")) score = 4;
      else score = 2;

      // Email unmask
      let calculatedEmail = "";
      const fLower = firstName.toLowerCase().replace(/[^a-z]/g, "");
      const lLower = lastName.toLowerCase().replace(/[^a-z]/g, "");

      if (emailMask && emailMask.includes("@")) {
        const [maskUser] = emailMask.split("@");
        const firstChar = maskUser[0] || "";
        const lastChar = maskUser[maskUser.length - 1] || "";
        const len = maskUser.length;

        if (maskUser.includes(".")) {
          calculatedEmail = `${fLower}.${lLower}@${domain}`;
        } else if (firstChar === fLower[0] && (lastChar === lLower[lLower.length - 1] || lLower.endsWith(lastChar))) {
          calculatedEmail = `${fLower[0]}${lLower}@${domain}`;
        } else if (len === fLower.length && firstChar === fLower[0] && lastChar === fLower[fLower.length - 1]) {
          calculatedEmail = `${fLower}@${domain}`;
        } else if (firstChar === fLower[0]) {
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

      leads.push({
        name,
        firstName,
        lastName,
        title: title || "Executive",
        company: company || "Executive Search",
        email: calculatedEmail,
        website: domain,
        city: city || "New York, NY",
        score
      });
    }
  }

  return leads;
}

const batch1 = parseRawFile(path.resolve("raw_leads.txt"));
const batch2 = parseRawFile(path.resolve("extra_leads.txt"));

const allLeads = [...batch1, ...batch2];

// Deduplicate leads by exact person name first
const personMap = new Map();
allLeads.forEach((lead) => {
  const key = lead.name.toLowerCase().trim();
  if (!personMap.has(key) || personMap.get(key).score < lead.score) {
    personMap.set(key, lead);
  }
});

const distinctPersonLeads = Array.from(personMap.values());

// Now enforce EXACTLY 1 LEAD PER COMPANY (Group by domain / company key)
const companyGroups = new Map();
distinctPersonLeads.forEach((lead) => {
  let compKey = (lead.website || lead.company).toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "").trim();
  if (!compKey) compKey = lead.company.toLowerCase().trim();

  if (!companyGroups.has(compKey)) {
    companyGroups.set(compKey, []);
  }
  companyGroups.get(compKey).push(lead);
});

// For each company, choose the single best lead (Highest Seniority Score)
const finalUniqueCompanyLeads = [];
const discardedDuplicates = [];

companyGroups.forEach((groupLeads, compKey) => {
  // Sort descending by seniority score
  groupLeads.sort((a, b) => b.score - a.score);
  const bestLead = groupLeads[0];
  finalUniqueCompanyLeads.push(bestLead);

  if (groupLeads.length > 1) {
    discardedDuplicates.push({
      company: bestLead.company,
      domain: compKey,
      chosen: `${bestLead.name} (${bestLead.title})`,
      removed: groupLeads.slice(1).map((l) => `${l.name} (${l.title})`)
    });
  }
});

console.log(`=== TOTAL UNIQUE COMPANIES: ${finalUniqueCompanyLeads.length} ===`);
console.log(`=== COMPANIES WITH DUPLICATES RESOLVED: ${discardedDuplicates.length} ===\n`);

discardedDuplicates.forEach((d, idx) => {
  console.log(`[${idx + 1}] Empresa: "${d.company}" (${d.domain})`);
  console.log(`     ✅ MANTENIDO (Mayor rango): ${d.chosen}`);
  console.log(`     ❌ DESCARTADO (Misma empresa): ${d.removed.join(", ")}`);
});

fs.writeFileSync(path.resolve("final_unique_company_leads.json"), JSON.stringify(finalUniqueCompanyLeads, null, 2));

// Generate 30 Excel files + Master Workbook
const HEADERS = ["Name", "First Name", "Company Name", "Email", "Website", "Timezone City"];
const COL_WIDTHS = [{ wch: 28 }, { wch: 18 }, { wch: 34 }, { wch: 36 }, { wch: 32 }, { wch: 26 }];

const downloadsDir = "C:\\Users\\nrc34\\Downloads";
const outputFolder = path.join(downloadsDir, "Tablas_Outbound_Dias_4_al_33");

const masterWb = XLSX.utils.book_new();

for (let day = 4; day <= 33; day++) {
  const dayIndex = day - 4;
  const startIdx = dayIndex * 6;
  const dayLeads = finalUniqueCompanyLeads.slice(startIdx, startIdx + 6);

  const rows = [HEADERS];

  for (const lead of dayLeads) {
    rows.push([lead.name, lead.firstName, lead.company, lead.email, lead.website, lead.city]);
  }

  while (rows.length < 7) {
    rows.push(["", "", "", "", "", ""]);
  }

  // 1. Single Workbook
  const singleWb = XLSX.utils.book_new();
  const singleWs = XLSX.utils.aoa_to_sheet(rows);
  singleWs["!cols"] = COL_WIDTHS;
  singleWs["!ref"] = "A1:F7";
  XLSX.utils.book_append_sheet(singleWb, singleWs, `Tabla Dia ${day}`);

  const singleFilePath = path.join(outputFolder, `Tabla Dia ${day}.xlsx`);
  XLSX.writeFile(singleWb, singleFilePath);

  // 2. Master Workbook Tab
  const masterWs = XLSX.utils.aoa_to_sheet(rows);
  masterWs["!cols"] = COL_WIDTHS;
  masterWs["!ref"] = "A1:F7";
  XLSX.utils.book_append_sheet(masterWb, masterWs, `Tabla Dia ${day}`);
}

const masterPath = path.join(downloadsDir, "Tablas_Outbound_Dia4_al_Dia33.xlsx");
XLSX.writeFile(masterWb, masterPath);

console.log(`\nAll 30 day files and master file successfully generated with 100% UNIQUE COMPANIES in: ${downloadsDir}`);
