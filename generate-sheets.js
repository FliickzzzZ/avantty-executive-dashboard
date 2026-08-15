import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

// 42 leads currently provided by the user
const LEADS_DATA = [
  // Dia 4 (6 leads)
  { name: "Michelle Goyco", firstName: "Michelle", company: "Private Label Staff", email: "", website: "privatelabelstaffing.com", city: "Miller Place, NY" },
  { name: "Caity McGuirk", firstName: "Caity", company: "Park Square Executive Search", email: "", website: "parksquare.com", city: "Boston, MA" },
  { name: "Jared Black", firstName: "Jared", company: "NewVine Employment Group", email: "", website: "newvinegroup.com", city: "Fort Lauderdale, FL" },
  { name: "Erin Wallace", firstName: "Erin", company: "Plenty Search", email: "", website: "plentysearch.com", city: "New York, NY" },
  { name: "Charles Graham", firstName: "Charles", company: "Graham Consulting", email: "", website: "grahamconsulting.co.nz", city: "New York, NY" },
  { name: "Adam Levy", firstName: "Adam", company: "Ikon Search", email: "", website: "ikonsearch.com", city: "New York, NY" },

  // Dia 5 (6 leads)
  { name: "Kathy Abdouch", firstName: "Kathy", company: "The Sterling Choice", email: "", website: "thesterlingchoice.com", city: "Chicago, IL" },
  { name: "Adam Carlson", firstName: "Adam", company: "Buckingham Search", email: "", website: "buckinghamsearch.com", city: "Chicago, IL" },
  { name: "Javier Dutan", firstName: "Javier", company: "Awana", email: "", website: "awana.io", city: "New York, NY" },
  { name: "Graydon Winter", firstName: "Graydon", company: "Jackson James", email: "", website: "jacksonjames.com", city: "New York, NY" },
  { name: "Lisa Yae", firstName: "Lisa", company: "Hanold Associates", email: "", website: "hanold-associates.com", city: "Chicago, IL" },
  { name: "Nolan Greenberg", firstName: "Nolan", company: "Worth Search", email: "", website: "worthsearch.com", city: "New York, NY" },

  // Dia 6 (6 leads)
  { name: "Jeff Cohen", firstName: "Jeff", company: "Rice Cohen International", email: "", website: "ricecohen.com", city: "Philadelphia, PA" },
  { name: "Lewis Bagshaw", firstName: "Lewis", company: "Acquire Me", email: "", website: "acquireme.io", city: "New York, NY" },
  { name: "Tom Borghesi", firstName: "Tom", company: "Syntagma Group", email: "", website: "syntagmagroup.com", city: "Boston, MA" },
  { name: "Adam Shefshick", firstName: "Adam", company: "BlackTree Technical Group", email: "", website: "blacktreetech.com", city: "Boston, MA" },
  { name: "Joshua McAfee", firstName: "Joshua", company: "Humans Doing", email: "", website: "humansdoing.net", city: "Atlanta, GA" },
  { name: "Todd Froats", firstName: "Todd", company: "ICX Group", email: "", website: "icxgroup.com", city: "Jacksonville, FL" },

  // Dia 7 (6 leads)
  { name: "Maggie Shea", firstName: "Maggie", company: "StaffBuffalo", email: "", website: "staffbuffalo.com", city: "Buffalo, NY" },
  { name: "Jonathan Matijevic", firstName: "Jonathan", company: "NuLogic Business Solutions", email: "", website: "nulosolutions.com", city: "Boca Raton, FL" },
  { name: "Mike Fitzgerald", firstName: "Mike", company: "33Eleven", email: "", website: "33elevenpartners.com", city: "New York, NY" },
  { name: "Amanda Mihnovich", firstName: "Amanda", company: "Private Label Staff", email: "", website: "privatelabelstaffing.com", city: "Ponte Vedra Beach, FL" },
  { name: "Jean Forney", firstName: "Jean", company: "Samuel J. Associates", email: "", website: "samueljassociates.com", city: "Delray Beach, FL" },
  { name: "Ronald Torch", firstName: "Ronald", company: "Torch Group", email: "", website: "torchgroup.com", city: "Fort Lauderdale, FL" },

  // Dia 8 (6 leads)
  { name: "Christopher Atiyah", firstName: "Christopher", company: "Engtal", email: "", website: "engtal.com", city: "Chicago, IL" },
  { name: "Casey Gilfillan", firstName: "Casey", company: "AMS Practice Managements LLC", email: "", website: "amsmanagements.com", city: "Boston, MA" },
  { name: "Bert Wendeln", firstName: "Bert", company: "The Carlisle Group (TCG)", email: "", website: "tcgrecruit.com", city: "Mechanicsburg, PA" },
  { name: "Andre Haug", firstName: "Andre", company: "Aggancio", email: "", website: "aggancio.com", city: "New York, NY" },
  { name: "Kris Limaye", firstName: "Kris", company: "Howard Fischer Associates", email: "", website: "hfischer.com", city: "Philadelphia, PA" },
  { name: "Stewart Muller", firstName: "Stewart", company: "Muller & Associates", email: "", website: "mullersearch.com", city: "Alpharetta, GA" },

  // Dia 9 (6 leads)
  { name: "Jordan Romoff", firstName: "Jordan", company: "Lecours", email: "", website: "lecoursgroup.com", city: "Miami Beach, FL" },
  { name: "Steven Littman", firstName: "Steven", company: "Rhodes Associates", email: "", website: "rhodesassociates.com", city: "New York, NY" },
  { name: "Ashley David", firstName: "Ashley", company: "Park Square Executive Search", email: "", website: "parksquare.com", city: "Boston, MA" },
  { name: "Nicki Perchik", firstName: "Nicki", company: "The NLP Group", email: "", website: "thenlpgroup.net", city: "Glenview, IL" },
  { name: "Caryn Yair", firstName: "Caryn", company: "Highspring / Focus Search", email: "", website: "focussearchpartners.com", city: "Atlanta, GA" },
  { name: "Sebastian Mann", firstName: "Sebastian", company: "X4 Engineering", email: "", website: "x4engineering.com", city: "Boston, MA" },

  // Dia 10 (6 leads)
  { name: "Robert Jordan", firstName: "Robert", company: "InterimExecs", email: "", website: "interimexecs.com", city: "Chicago, IL" },
  { name: "Emily Keyes", firstName: "Emily", company: "The Talent Boom", email: "", website: "thetalentboom.com", city: "Boca Raton, FL" },
  { name: "Gerald Cerza", firstName: "Gerald", company: "the ASSURANCE group", email: "", website: "theassurancegroup.com", city: "New York, NY" },
  { name: "Lindsey Spanier", firstName: "Lindsey", company: "Sloane Staffing", email: "", website: "sloane-staffing.com", city: "Jupiter, FL" },
  { name: "Karin Bunescu", firstName: "Karin", company: "Partnership Employment", email: "", website: "partnershipemployment.com", city: "St. Petersburg, FL" },
  { name: "Victoria Mininni", firstName: "Victoria", company: "API Partners", email: "", website: "apipartners.com", city: "New York, NY" }
];

const HEADERS = ["Name", "First Name", "Company Name", "Email", "Website", "Timezone City"];

const COL_WIDTHS = [
  { wch: 28 }, // Column A: Name
  { wch: 20 }, // Column B: First Name
  { wch: 34 }, // Column C: Company Name
  { wch: 38 }, // Column D: Email (Spacious slot between Company and Website)
  { wch: 32 }, // Column E: Website
  { wch: 26 }  // Column F: Timezone City
];

function generateAndSaveFiles() {
  const wb = XLSX.utils.book_new();

  // Downloads output folder
  const downloadsDir = "C:\\Users\\nrc34\\Downloads";
  const singleSheetsDir = path.join(downloadsDir, "Tablas_Outbound_Por_Dia");
  if (!fs.existsSync(singleSheetsDir)) {
    fs.mkdirSync(singleSheetsDir, { recursive: true });
  }

  // Generate Days 4 to 33 (30 days)
  for (let day = 4; day <= 33; day++) {
    const sheetName = `Tabla Dia ${day}`;
    const dayIndex = day - 4; // 0 to 29
    const startLeadIdx = dayIndex * 6;

    const rows = [HEADERS];

    if (startLeadIdx < LEADS_DATA.length) {
      const dayLeads = LEADS_DATA.slice(startLeadIdx, startLeadIdx + 6);
      for (const lead of dayLeads) {
        rows.push([
          lead.name,
          lead.firstName,
          lead.company,
          lead.email, // Empty or filled email slot
          lead.website,
          lead.city
        ]);
      }
      while (rows.length < 7) {
        rows.push(["", "", "", "", "", ""]);
      }
    } else {
      // Empty template rows for remaining days
      for (let r = 0; r < 6; r++) {
        rows.push(["", "", "", "", "", ""]);
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = COL_WIDTHS;
    ws["!ref"] = "A1:F7";

    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Also write individual CSV for this day into Tablas_Outbound_Por_Dia folder
    const csvContent = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    fs.writeFileSync(path.join(singleSheetsDir, `Tabla_Dia_${day}.csv`), csvContent);
  }

  // 1. Save master workbook directly to Downloads
  const downloadWorkbookPath = path.join(downloadsDir, "Tablas_Outbound_Dia4_al_Dia33.xlsx");
  XLSX.writeFile(wb, downloadWorkbookPath);
  console.log(`Saved master workbook directly to: ${downloadWorkbookPath}`);

  // 2. Also keep a copy in project public folder
  const publicDir = path.resolve("public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicPath = path.join(publicDir, "Tablas_Outbound_Dia4_al_Dia33.xlsx");
  XLSX.writeFile(wb, publicPath);
}

generateAndSaveFiles();
