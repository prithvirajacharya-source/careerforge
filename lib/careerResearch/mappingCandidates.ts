export type ExpansionCountry = "sweden" | "united-states" | "norway" | "finland" | "denmark" | "canada" | "united-kingdom";
export type PriorityCareerMapping = { careerSlug: string; careerName: string; codes: Partial<Record<ExpansionCountry, string>> };

export const PRIORITY_CAREER_MAPPINGS: PriorityCareerMapping[] = [
  { careerSlug: "civil-engineer", careerName: "Civil Engineer", codes: { sweden: "2142", "united-states": "17-2051", norway: "2142", finland: "2142", denmark: "2142", canada: "NOC_21300", "united-kingdom": "2121" } },
  { careerSlug: "chemical-engineer", careerName: "Chemical Engineer", codes: { sweden: "2145", "united-states": "17-2041", norway: "2145", finland: "2145", denmark: "2145", canada: "NOC_21320" } },
  { careerSlug: "industrial-engineer", careerName: "Industrial Engineer", codes: { sweden: "2141", "united-states": "17-2112", norway: "2141", finland: "2141", denmark: "2141", canada: "NOC_21321" } },
  { careerSlug: "it-support-specialist", careerName: "IT Support Specialist", codes: { sweden: "3512", "united-states": "15-1232", norway: "3512", finland: "3512", denmark: "3512", canada: "NOC_22221", "united-kingdom": "3132" } },
  { careerSlug: "pharmacist", careerName: "Pharmacist", codes: { sweden: "2281", "united-states": "29-1051", norway: "2262", finland: "2262", denmark: "2262", canada: "NOC_31120", "united-kingdom": "2251" } },
  { careerSlug: "physiotherapist", careerName: "Physiotherapist", codes: { sweden: "2272", "united-states": "29-1123", norway: "2264", denmark: "2264", canada: "NOC_31202", "united-kingdom": "2221" } },
  { careerSlug: "radiographer", careerName: "Radiographer", codes: { sweden: "3211", "united-states": "29-2034", norway: "3211", finland: "3211", denmark: "3211", canada: "NOC_32121", "united-kingdom": "2254" } },
  { careerSlug: "financial-analyst", careerName: "Financial Analyst", codes: { sweden: "2413", "united-states": "13-2051", norway: "2413", finland: "2413", denmark: "2413", canada: "NOC_11101", "united-kingdom": "2422" } },
  { careerSlug: "hr-specialist", careerName: "HR Specialist", codes: { sweden: "2423", "united-states": "13-1071", norway: "2423", finland: "2423", denmark: "2423", canada: "NOC_11200", "united-kingdom": "3571" } },
  { careerSlug: "electrician", careerName: "Electrician", codes: { sweden: "7411", "united-states": "47-2111", norway: "7411", finland: "7411", denmark: "7411", canada: "NOC_72200", "united-kingdom": "5241" } },
  { careerSlug: "plumber", careerName: "Plumber", codes: { sweden: "7125", "united-states": "47-2152", norway: "7126", finland: "7126", denmark: "7126", canada: "NOC_72300", "united-kingdom": "5315" } },
  { careerSlug: "welder", careerName: "Welder", codes: { sweden: "7212", "united-states": "51-4121", norway: "7212", finland: "7212", denmark: "7212", canada: "NOC_72106", "united-kingdom": "5213" } },
  { careerSlug: "automotive-technician", careerName: "Automotive Technician", codes: { sweden: "7231", "united-states": "49-3023", norway: "7231", finland: "7231", denmark: "7231", canada: "NOC_72410", "united-kingdom": "5231" } },
  { careerSlug: "carpenter", careerName: "Carpenter", codes: { sweden: "7111", "united-states": "47-2031", norway: "7115", finland: "7115", denmark: "7115", canada: "NOC_72310", "united-kingdom": "5316" } },
  { careerSlug: "construction-manager", careerName: "Construction Manager", codes: { "united-states": "11-9021", norway: "1323", finland: "1323", denmark: "1323", canada: "NOC_70010", "united-kingdom": "2455" } },
  { careerSlug: "hvac-technician", careerName: "HVAC Technician", codes: { sweden: "7126", "united-states": "49-9021", norway: "7127", finland: "7127", denmark: "7127", canada: "NOC_72402", "united-kingdom": "5225" } },
  { careerSlug: "truck-driver", careerName: "Truck Driver", codes: { sweden: "8332", "united-states": "53-3032", norway: "8332", finland: "8332", denmark: "8332", canada: "NOC_73300", "united-kingdom": "8211" } },
  { careerSlug: "chef", careerName: "Chef", codes: { sweden: "5120", "united-states": "35-1011", norway: "3434", finland: "3434", denmark: "3434", canada: "NOC_62200", "united-kingdom": "5434" } },
  { careerSlug: "secondary-school-teacher", careerName: "Secondary-School Teacher", codes: { sweden: "2330", "united-states": "25-2031", norway: "2330", finland: "2330", denmark: "2330", canada: "NOC_41220", "united-kingdom": "2313" } },
  { careerSlug: "architect", careerName: "Architect", codes: { sweden: "2161", "united-states": "17-1011", norway: "2161", finland: "2161", denmark: "2161", canada: "NOC_21200", "united-kingdom": "2451" } },
];
