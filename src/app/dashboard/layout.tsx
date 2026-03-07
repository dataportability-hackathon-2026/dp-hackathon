import { AuthGate } from "@/components/auth-gate";
import { HelpButton } from "@/components/help-dialog";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      {children}
      <HelpButton />
    </AuthGate>
  );
}
