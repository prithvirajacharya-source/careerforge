type CountryFlagProps = {
  code: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
};

export default function CountryFlag({
  code,
  name,
  size = "md",
}: CountryFlagProps) {
  const sizes = {
    sm: "h-5 w-7",
    md: "h-7 w-10",
    lg: "h-10 w-14",
    xl: "h-14 w-20",
  };

  return (
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt={`${name} flag`}
      className={`${sizes[size]} rounded object-cover shadow-sm`}
    />
  );
}