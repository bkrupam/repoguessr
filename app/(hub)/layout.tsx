import AppNav from "@/components/AppNav";

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNav />
      {children}
    </>
  );
}
