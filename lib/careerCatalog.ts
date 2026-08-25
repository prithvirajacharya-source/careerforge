export const CAREER_CATEGORIES = [
  "Engineering",
  "Technology",
  "Healthcare",
  "Finance & Business",
  "Skilled Trades",
  "Construction",
  "Transport & Logistics",
  "Hospitality",
  "Education",
  "Other Professional",
] as const;

export type CareerCategory = (typeof CAREER_CATEGORIES)[number];

export type CareerCatalogEntry = {
  slug: string;
  title: string;
  category: CareerCategory;
  description: string;
  catalogAvailable: true;
  regulatedProfession: boolean;
  regulationNote?: string;
};

const career = (
  slug: string,
  title: string,
  category: CareerCategory,
  description: string,
  regulatedProfession = false,
  regulationNote?: string
): CareerCatalogEntry => ({ slug, title, category, description, catalogAvailable: true, regulatedProfession, regulationNote });

export const CAREER_CATALOG: CareerCatalogEntry[] = [
  career("mechanical-engineer", "Mechanical Engineer", "Engineering", "Design and improve machines, products and mechanical systems.", true, "Professional engineering requirements vary by country."),
  career("electrical-engineer", "Electrical Engineer", "Engineering", "Design and develop electrical, electronic and power systems.", true, "Professional engineering requirements vary by country."),
  career("civil-engineer", "Civil Engineer", "Engineering", "Plan and deliver buildings, infrastructure and public works.", true, "Professional registration may be required."),
  career("chemical-engineer", "Chemical Engineer", "Engineering", "Develop industrial processes involving chemicals, materials and energy.", true, "Professional engineering requirements vary by country."),
  career("industrial-engineer", "Industrial Engineer", "Engineering", "Improve production, logistics and operational systems."),
  career("software-engineer", "Software Engineer", "Technology", "Build and maintain software products and systems."),
  career("cybersecurity-analyst", "Cybersecurity Analyst", "Technology", "Protect systems, networks and information from security threats."),
  career("data-scientist", "Data Scientist", "Technology", "Use data, statistics and computing to support decisions."),
  career("it-support-specialist", "IT Support Specialist", "Technology", "Help people and organizations resolve technology problems."),
  career("cloud-devops-engineer", "Cloud / DevOps Engineer", "Technology", "Build and operate cloud infrastructure and software delivery systems."),
  career("registered-nurse", "Registered Nurse", "Healthcare", "Provide and coordinate patient care across healthcare settings.", true, "Registration and recognition of qualifications are country-specific."),
  career("doctor", "Doctor / Physician", "Healthcare", "Diagnose, treat and help prevent illness and injury.", true, "Medical licensing is required and specialties must not be treated as equivalent."),
  career("physiotherapist", "Physiotherapist", "Healthcare", "Help people restore movement, function and physical wellbeing.", true, "Registration or a protected professional title may apply."),
  career("pharmacist", "Pharmacist", "Healthcare", "Prepare medicines and advise patients and clinicians on their safe use.", true, "National licensing and qualification recognition are required."),
  career("radiographer", "Radiographer", "Healthcare", "Use medical imaging or radiation technologies in patient care.", true, "Professional registration and radiation-safety requirements may apply."),
  career("accountant", "Accountant", "Finance & Business", "Prepare, analyze and explain financial records and controls."),
  career("financial-analyst", "Financial Analyst", "Finance & Business", "Evaluate financial performance, investments and business decisions."),
  career("auditor", "Auditor", "Finance & Business", "Examine financial records, controls and compliance."),
  career("business-analyst", "Business Analyst", "Finance & Business", "Analyze business needs and improve processes, products and systems."),
  career("sales-manager", "Sales Manager", "Finance & Business", "Lead sales strategy, teams and customer growth."),
  career("electrician", "Electrician", "Skilled Trades", "Install, maintain and repair electrical systems.", true, "Trade authorization and electrical-safety licensing may apply."),
  career("plumber", "Plumber", "Skilled Trades", "Install and repair water, drainage and pipe systems.", true, "Trade certification requirements vary by country."),
  career("welder", "Welder", "Skilled Trades", "Join and repair metals using specialist welding processes.", true, "Process or industry certifications may be required."),
  career("cnc-machinist", "CNC Machinist", "Skilled Trades", "Set up and operate computer-controlled manufacturing equipment."),
  career("automotive-technician", "Automotive Technician", "Skilled Trades", "Diagnose, maintain and repair cars and other vehicles.", true, "Trade certification may apply."),
  career("carpenter", "Carpenter", "Construction", "Build and repair structures and components made primarily from wood.", true, "Trade certification requirements vary."),
  career("construction-manager", "Construction Manager", "Construction", "Plan and coordinate construction projects, budgets and teams."),
  career("hvac-technician", "HVAC Technician", "Construction", "Install and maintain heating, ventilation and cooling systems.", true, "Refrigerant, electrical and safety certification may apply."),
  career("heavy-equipment-operator", "Heavy Equipment Operator", "Construction", "Operate machinery used in construction and infrastructure work.", true, "Equipment-class authorization may apply."),
  career("truck-driver", "Truck Driver", "Transport & Logistics", "Transport goods by road using commercial vehicles.", true, "A commercial driving licence is required."),
  career("warehouse-worker", "Warehouse Worker", "Transport & Logistics", "Receive, store, pick and dispatch goods."),
  career("logistics-coordinator", "Logistics Coordinator", "Transport & Logistics", "Coordinate the movement, storage and delivery of goods."),
  career("supply-chain-specialist", "Supply Chain Specialist", "Transport & Logistics", "Plan and improve sourcing, inventory and distribution networks."),
  career("chef", "Chef", "Hospitality", "Prepare food and lead kitchen operations.", true, "Food-safety certification may apply."),
  career("hotel-manager", "Hotel Manager", "Hospitality", "Manage accommodation operations, service and staff."),
  career("restaurant-manager", "Restaurant Manager", "Hospitality", "Manage restaurant service, staffing and commercial performance."),
  career("teacher", "Teacher", "Education", "Teach and support learners in school settings.", true, "Teacher authorization and subject requirements are country-specific."),
  career("preschool-teacher", "Preschool Teacher", "Education", "Support early childhood learning and development.", true, "Early-years teaching credentials may be required."),
  career("university-lecturer", "University Lecturer", "Education", "Teach and conduct research in higher education."),
  career("architect", "Architect", "Other Professional", "Design buildings and guide projects through planning and construction.", true, "Architect is a protected title in many countries."),
  career("lawyer", "Lawyer", "Other Professional", "Advise and represent clients on legal matters.", true, "Admission to the relevant national or regional bar is required."),
  career("hr-specialist", "HR Specialist", "Other Professional", "Support hiring, employee relations and workforce practices."),
  career("marketing-specialist", "Marketing Specialist", "Other Professional", "Research markets and plan campaigns, positioning and growth."),
  career("project-manager", "Project Manager", "Other Professional", "Plan and coordinate work, budgets, risks and delivery across projects."),
];

export function getCareerCatalogEntry(slug: string) {
  return CAREER_CATALOG.find((entry) => entry.slug === slug) ?? null;
}

