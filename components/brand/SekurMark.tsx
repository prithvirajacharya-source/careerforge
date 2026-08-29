export default function SekurMark({
  className = "h-9 w-9",
  monochrome = false,
}: {
  className?: string;
  monochrome?: boolean;
}) {
  return <svg className={className} viewBox="0 0 48 48" role="img" aria-label="SEKUR">
    <path fill={monochrome ? "currentColor" : "#1d4ed8"} d="M24 2 43 10v13c0 12-7.7 19.5-19 23C12.7 42.5 5 35 5 23V10L24 2Z" />
    <path fill={monochrome ? "currentColor" : "#60a5fa"} opacity={monochrome ? 0.45 : 1} d="m24 7 13 5.5v7.1L18.5 12 24 7Z" />
    <path fill="#fff" d="M14 14h21v6H22.5l13 7v7H14v-6h12.5l-12.5-7v-7Z" />
    <path fill={monochrome ? "#fff" : "#bfdbfe"} opacity={monochrome ? 0.7 : 1} d="m26.5 28 9 5v1H25l-8.5-4.6V28h10Z" />
  </svg>;
}
