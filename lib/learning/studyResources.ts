import type { StudyResource } from "./types.ts";

const resource = (id: string, title: string, provider: string, url: string, skills: string[], description: string, resourceType: StudyResource["resourceType"] = "course", pricing: StudyResource["pricing"] = "free", level = "Beginner to intermediate"): StudyResource => ({ id, title, provider, url, skills, description, resourceType, pricing, level, durationText: null, language: "English", careerSlugs: [], verifiedAt: "2026-08-16", sponsored: false });

export const STUDY_RESOURCES: StudyResource[] = [
  resource("python-tutorial", "The Python Tutorial", "Python Software Foundation", "https://docs.python.org/3/tutorial/", ["Python"], "Official introduction to Python syntax, data structures and modules.", "documentation"),
  resource("matlab-onramp", "MATLAB Onramp", "MathWorks", "https://matlabacademy.mathworks.com/details/matlab-onramp/gettingstarted", ["MATLAB"], "Interactive official introduction to MATLAB.", "course"),
  resource("typescript-handbook", "The TypeScript Handbook", "Microsoft", "https://www.typescriptlang.org/docs/handbook/intro.html", ["TypeScript"], "Official guide to TypeScript concepts and everyday use.", "documentation"),
  resource("react-learn", "Learn React", "React", "https://react.dev/learn", ["React", "JavaScript"], "Official hands-on guide to React components and state.", "tutorial"),
  resource("mdn-javascript", "JavaScript Guide", "MDN Web Docs", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", ["JavaScript"], "Mozilla's structured JavaScript language guide.", "documentation"),
  resource("git-skills", "GitHub Skills", "GitHub", "https://skills.github.com/", ["Git"], "Interactive practice using Git and GitHub workflows.", "practice"),
  resource("sql-tutorial", "SQL Training", "Microsoft Learn", "https://learn.microsoft.com/en-us/training/paths/get-started-querying-with-transact-sql/", ["SQL"], "Official learning path for relational queries with SQL.", "course"),
  resource("aws-cloud", "Cloud Practitioner Training", "Amazon Web Services", "https://aws.amazon.com/training/learn-about/cloud-practitioner/", ["AWS"], "Official AWS training options for cloud concepts and services.", "course", "free"),
  resource("azure-fundamentals", "Introduction to Microsoft Azure: Describe Cloud Concepts", "Microsoft Learn", "https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/", ["Azure"], "Official beginner learning path covering core cloud concepts.", "course"),
  resource("docker-start", "Docker Get Started", "Docker", "https://docs.docker.com/get-started/", ["Docker"], "Official guided introduction to containers and Docker workflows.", "tutorial"),
  resource("kubernetes-basics", "Learn Kubernetes Basics", "Kubernetes", "https://kubernetes.io/docs/tutorials/kubernetes-basics/", ["Kubernetes"], "Official interactive Kubernetes fundamentals.", "tutorial"),
  resource("pandas-start", "Getting Started with pandas", "pandas", "https://pandas.pydata.org/docs/getting_started/index.html", ["Python", "Data Analysis"], "Official tutorials for tabular data analysis.", "tutorial"),
  resource("ml-mooc", "Machine Learning MOOC", "scikit-learn", "https://inria.github.io/scikit-learn-mooc/", ["Python", "Machine Learning"], "Open course maintained by scikit-learn contributors.", "course"),
  resource("mit-mechanics", "Engineering Mechanics", "MIT OpenCourseWare", "https://ocw.mit.edu/courses/1-050-engineering-mechanics-i-fall-2007/", ["Engineering Mechanics"], "University course materials covering mechanics fundamentals.", "course"),
  resource("autodesk-learning", "Get Started with AutoCAD", "Autodesk", "https://www.autodesk.com/learn/ondemand/collection/get-started-with-autocad", ["CAD"], "Official Autodesk collection covering essential AutoCAD workflows.", "course"),
  resource("ansys-courses", "Ansys Innovation Courses", "Ansys", "https://innovationspace.ansys.com/courses/", ["ANSYS", "FEA"], "Official engineering simulation course library.", "course"),
  resource("siemens-sce", "SCE Learning Modules", "Siemens", "https://www.siemens.com/en-us/content/sce-education-training-learning-modules/", ["PLC", "Industrial Automation"], "Official Siemens learning modules for automation and self-study.", "course"),
  resource("arduino-docs", "Arduino Documentation", "Arduino", "https://docs.arduino.cc/", ["Electronics", "Embedded Systems"], "Official guides and references for electronics projects.", "documentation"),
  resource("cisco-networking", "Networking Basics", "Cisco Skills for All", "https://skillsforall.com/course/networking-basics", ["Networking"], "Cisco introductory networking course.", "course"),
  resource("nist-cyber", "NICE Cybersecurity Career Resources", "NIST", "https://www.nist.gov/itl/applied-cybersecurity/nice/resources", ["Cybersecurity"], "Official NIST learning and workforce resources.", "documentation"),
  resource("khan-statistics", "Statistics and Probability", "Khan Academy", "https://www.khanacademy.org/math/statistics-probability", ["Statistics"], "Practice-oriented statistics and probability curriculum.", "course"),
  resource("pmi-kickoff", "KICKOFF", "Project Management Institute", "https://www.pmi.org/kickoff", ["Project Management"], "Official foundational project-management course.", "course"),
];
