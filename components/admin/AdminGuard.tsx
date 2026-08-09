"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { supabase } from "@/lib/supabase";

type AdminGuardProps = {
  children: ReactNode;
};

export default function AdminGuard({
  children,
}: AdminGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [status, setStatus] = useState<
    "checking" | "allowed" | "denied"
  >("checking");

  useEffect(() => {
    async function checkAccess() {
      setStatus("checking");

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      /*
        /admin is also our login page.

        Therefore:
        - Logged out users MUST be allowed to open /admin.
        - Logged-in admins can also open /admin.
        - Logged-in non-admin users are rejected.
      */
      if (pathname === "/admin") {
        if (error || !user) {
          setStatus("allowed");
          return;
        }

        const role =
          user.app_metadata?.role;

        if (role === "admin") {
          setStatus("allowed");
          return;
        }

        setStatus("denied");
        router.replace("/");
        return;
      }

      /*
        Everything BELOW /admin requires
        a real authenticated admin.
      */
      if (error || !user) {
        setStatus("denied");
        router.replace("/admin");
        return;
      }

      const role =
        user.app_metadata?.role;

      if (role !== "admin") {
        setStatus("denied");
        router.replace("/");
        return;
      }

      setStatus("allowed");
    }

    checkAccess();
  }, [pathname, router]);

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07101f] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

          <p className="mt-5 text-sm font-semibold text-slate-400">
            Verifying SEKUR access...
          </p>
        </div>
      </main>
    );
  }

  if (status !== "allowed") {
    return null;
  }

  return <>{children}</>;
}