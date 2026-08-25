const SKILL_ALIASES: Record<string, string[]> = {
  Python: ["python"], SQL: ["sql", "postgresql", "mysql"], MATLAB: ["matlab"],
  TypeScript: ["typescript"], React: ["react.js", "reactjs", "react"], JavaScript: ["javascript", "node.js", "nodejs"],
  CAD: ["computer aided design", "cad"], CATIA: ["catia"], SolidWorks: ["solidworks"], ANSYS: ["ansys"], Abaqus: ["abaqus"],
  FEA: ["finite element analysis", "finite element method", "fem", "fea"], BMS: ["battery management system", "bms"],
  CAN: ["controller area network", "can bus"], "Battery testing": ["battery test", "battery validation"],
  Git: ["github", "gitlab", "git"], Linux: ["linux"], AWS: ["amazon web services", "aws"], Azure: ["microsoft azure", "azure"],
  Docker: ["docker"], Kubernetes: ["kubernetes", "k8s"], PLC: ["programmable logic controller", "plc"],
  "Machine Learning": ["machine learning", "ml model"], Statistics: ["statistics", "statistical"],
  Cybersecurity: ["cyber security", "cybersecurity"], Networking: ["networking", "tcp/ip"],
  Excel: ["microsoft excel", "spreadsheets", "excel"], "Project Management": ["project management", "project manager"],
};

const escaped = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function extractSkills(text: string) {
  const found: string[] = [];
  for (const [skill, aliases] of Object.entries(SKILL_ALIASES)) {
    if (aliases.some((alias) => new RegExp(`(^|[^a-z0-9])${escaped(alias)}([^a-z0-9]|$)`, "i").test(text))) found.push(skill);
  }
  return found;
}

export function normalizeSkill(skill: string) {
  const hit = Object.entries(SKILL_ALIASES).find(([name, aliases]) =>
    name.toLowerCase() === skill.trim().toLowerCase() || aliases.includes(skill.trim().toLowerCase())
  );
  return hit?.[0] ?? skill.trim();
}
