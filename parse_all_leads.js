import * as fs from "fs";
import * as path from "path";

const text = fs.readFileSync(path.resolve("raw_leads.txt"), "utf-8");
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

    for (let j = i + 1; j < Math.min(lines.length, i + 16); j++) {
      const cur = lines[j];

      // Stop if next candidate starts
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

      // Company line is between title and website
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

    const firstName = name.split(" ")[0].trim();

    if (!company && website) {
      company = website.replace(/\.(com|net|io|co\.uk|org)$/i, "").replace(/[-_]/g, " ");
      company = company.charAt(0).toUpperCase() + company.slice(1);
    }

    leads.push({
      name,
      firstName,
      company: company || "Executive Search",
      email: "",
      website: website || `${(company || "search").toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      city: city || "New York, NY"
    });
  }
}

// Deduplicate
const seen = new Set();
const uniqueLeads = [];
for (const l of leads) {
  const key = l.name.toLowerCase().trim();
  if (!seen.has(key)) {
    seen.add(key);
    uniqueLeads.push(l);
  }
}

console.log(`Unique Leads Extracted: ${uniqueLeads.length}`);
fs.writeFileSync(path.resolve("parsed_leads.json"), JSON.stringify(uniqueLeads, null, 2));

console.log("\nSummary of all parsed unique leads:");
uniqueLeads.forEach((l, idx) => {
  console.log(`${idx + 1}. ${l.name} | ${l.firstName} | ${l.company} | ${l.website} | ${l.city}`);
});
