import Navbar from "@/components/navbar";
import DashboardNav from "@/components/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <DashboardNav />
      <main className="min-h-screen bg-slate-50">{children}</main>
    </>
  );
}