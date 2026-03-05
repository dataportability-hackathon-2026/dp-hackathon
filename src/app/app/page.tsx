import { SinglePageApp } from "@/components/single-page-app"
import { AuthGate } from "@/components/auth-gate"

export default function AppPage() {
  return (
    <AuthGate>
      <SinglePageApp />
    </AuthGate>
  )
}
