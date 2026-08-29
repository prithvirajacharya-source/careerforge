import CompareClient from "./CompareClient";
import SiteHeader from "@/components/SiteHeader";
import { getAllCountryIntelligence } from "@/lib/intelligence/service";
import { supabase } from "@/lib/supabase";
import { sortCountriesByName } from "@/lib/countryCatalog";

export const dynamic = "force-dynamic";

type CountryRow = {
  slug: string;
  name: string;
  code: string;
  region: string | null;
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{
    left?: string;
    right?: string;
  }>;
}) {
  const params = await searchParams;

  const intelligence =
    await getAllCountryIntelligence();

  const { data: countryRows } =
    await supabase
      .from("countries")
      .select("slug, name, code, region");

  const countries = sortCountriesByName(
    ((countryRows ?? []) as CountryRow[])
      .filter(
        (country) =>
          intelligence[country.slug]
      )
      .map((country) => ({
        slug: country.slug,
        name: country.name,
        code: country.code,
        region:
          country.region ?? "Global",
        result:
          intelligence[country.slug]
            .result,
      })),
  );

  if (countries.length < 2) {
    return (
      <main className="sekur-intelligence min-h-screen">
        <SiteHeader />

        <section className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
            SEKUR Compare
          </p>

          <h1 className="mt-4 text-5xl font-black">
            More intelligence needed
          </h1>

          <p className="mt-5 text-slate-400">
            At least two countries need
            intelligence data before they
            can be compared.
          </p>
        </section>
      </main>
    );
  }

  const availableSlugs =
    countries.map(
      (country) => country.slug
    );

  const defaultLeft =
    availableSlugs.includes("sweden")
      ? "sweden"
      : availableSlugs[0];

  const defaultRight =
    availableSlugs.includes("germany")
      ? "germany"
      : availableSlugs.find(
          (slug) =>
            slug !== defaultLeft
        ) ?? availableSlugs[1];

  const left =
    params.left &&
    availableSlugs.includes(
      params.left
    )
      ? params.left
      : defaultLeft;

  let right =
    params.right &&
    availableSlugs.includes(
      params.right
    )
      ? params.right
      : defaultRight;

  if (right === left) {
    right =
      availableSlugs.find(
        (slug) => slug !== left
      ) ?? defaultRight;
  }

  return (
    <main className="sekur-intelligence min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="mt-4 text-5xl font-black tracking-tight md:text-6xl">
          Compare career opportunities
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
          See salary, outlook and other available information side by side.
        </p>

        <CompareClient
          key={`${left}-${right}`}
          countries={countries}
          initialLeft={left}
          initialRight={right}
        />
      </section>
    </main>
  );
}
