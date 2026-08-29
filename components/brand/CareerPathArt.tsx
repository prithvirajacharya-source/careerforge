export default function CareerPathArt({ variant = "path", className = "" }: { variant?: "path" | "city" | "compass"; className?: string }) {
  return <svg className={className} viewBox="0 0 520 300" aria-hidden="true">
    <rect width="520" height="300" rx="28" fill="#eff6ff" />
    <circle cx="410" cy="62" r="34" fill="#bfdbfe" />
    <path d="M0 236 106 130l75 70 84-121 86 101 58-64 111 120v64H0Z" fill="#dbeafe" />
    <path d="M0 255 104 165l74 70 89-112 84 94 64-64 105 102v45H0Z" fill="#93c5fd" />
    {variant === "city" ? <>
      <path d="M78 232v-82h45v82m18 0V116h58v116m18 0v-61h42v61m20 0V92h63v140m19 0v-105h55v105" fill="#fff" stroke="#2563eb" strokeWidth="6" />
      <path d="M96 170h10m53-32h20m58 54h8m55-78h21m61 35h15" stroke="#93c5fd" strokeWidth="7" strokeLinecap="round" />
    </> : variant === "compass" ? <>
      <circle cx="260" cy="151" r="75" fill="#fff" stroke="#2563eb" strokeWidth="7" />
      <path d="m282 111-14 54-49 27 14-54 49-27Z" fill="#2563eb" />
      <circle cx="260" cy="151" r="8" fill="#0f1f35" />
    </> : <>
      <path d="M69 260c53-7 72-39 111-43 48-5 60 38 109 25 49-12 53-66 103-82" fill="none" stroke="#fff" strokeWidth="18" strokeLinecap="round" />
      <path d="M69 260c53-7 72-39 111-43 48-5 60 38 109 25 49-12 53-66 103-82" fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 14" />
      <path d="M389 85v78m0-78 58 16-58 20" fill="#2563eb" stroke="#1d4ed8" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="69" cy="260" r="12" fill="#166534" stroke="#fff" strokeWidth="5" />
    </>}
  </svg>;
}
