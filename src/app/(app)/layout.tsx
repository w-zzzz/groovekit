import { Sidebar, MobileNav } from '@/components/layout/sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-h-screen pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
