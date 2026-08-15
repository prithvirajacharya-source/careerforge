"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UserAccountLink() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);
  return <Link href="/profile" className="hidden rounded-xl border border-white/15 bg-black/20 px-4 py-2 text-sm font-semibold transition hover:border-emerald-300/30 hover:bg-white/10 sm:block">{signedIn ? "Profile" : "Sign in"}</Link>;
}
