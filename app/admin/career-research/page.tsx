import Link from "next/link";
import CareerResearchConsole from "@/components/admin/CareerResearchConsole";

export default function CareerResearchPage() {
  return <main className="min-h-screen bg-[#07101f] px-5 py-10 text-white sm:px-8"><div className="mx-auto max-w-7xl"><Link href="/admin" className="text-sm font-bold text-blue-300 hover:text-white">← Research Console</Link><div className="mt-8"><p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">SEKUR Career Research Engine v1</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Career-market evidence review</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">Collect, normalize, validate and store official career evidence as a reviewable candidate before any live profile can change.</p></div><div className="mt-10"><CareerResearchConsole /></div></div></main>;
}
