import * as fs from "fs";
import * as path from "path";

// Read raw extra leads to see completely brand new companies not yet used anywhere
const extraRaw = fs.readFileSync(path.resolve("extra_leads.txt"), "utf-8");
import("./process_unique_companies.js");
