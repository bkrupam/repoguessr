interface HubPageShellProps {
  children: React.ReactNode;
  /** Wider shell for ranks list */
  wide?: boolean;
}

export default function HubPageShell({ children, wide = false }: HubPageShellProps) {
  return (
    <div
      className={`min-h-[calc(100dvh-5.75rem)] w-full mx-auto px-6 py-12 flex flex-col items-center justify-center text-center hub-enter ${
        wide ? "max-w-2xl" : "max-w-xl"
      }`}
    >
      {children}
    </div>
  );
}
