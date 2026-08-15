import type { Metadata } from "next";
import AdminGuard from "@/components/admin/AdminGuard";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminGuard>
      {children}
    </AdminGuard>
  );
}
