"use client"

import { useId, useState } from "react"
import {
  Bell,
  Check,
  ChevronRight,
  Clock,
  ClipboardList,
  Lock,
  LogOut,
  Mail,
  Palette,
  Settings,
  Shield,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { UsageDialog } from "@/components/billing/usage-dialog"
import { BillingDialog } from "@/components/billing/billing-dialog"

function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`
}

const PROFILE_STRENGTHS = [
  { area: "Cognitive Reflection", score: 0.72, label: "Strong", description: "You pause to reason through tricky problems rather than going with your gut." },
  { area: "Metacognitive Awareness", score: 0.58, label: "Developing", description: "You have moderate self-awareness of your own learning, but tend to overestimate mastery." },
  { area: "Study Strategy Repertoire", score: 0.65, label: "Good", description: "You use active recall and spaced repetition. Could benefit from more elaboration techniques." },
  { area: "Self-Regulation", score: 0.52, label: "Developing", description: "Decent time management, but you sometimes skip reflection steps when pressed for time." },
] as const

const MOTIVATION_PROFILE = {
  autonomy: 0.78,
  competence: 0.62,
  relatedness: 0.45,
} as const

const CALIBRATION_TENDENCY = {
  tendency: "Overconfident",
  avgConfidence: 0.80,
  avgAccuracy: 0.55,
  gap: 0.25,
} as const

const LEARNING_PREFERENCES = [
  { pref: "Visual diagrams over text-heavy explanations" },
  { pref: "Short practice sessions (25-30 min)" },
  { pref: "Worked examples before free practice" },
  { pref: "Prefers direct, concise coaching tone" },
] as const

const SYSTEM_ADAPTATIONS = [
  { rule: "Chunk size reduced to 4 items", reason: "Cognitive load risk is high during eigenvalue practice" },
  { rule: "Reflection prompts every 3rd item", reason: "Calibration error (ECE 0.18) above threshold" },
  { rule: "Interleaved practice enabled at 40%", reason: "Cross-concept mastery reached 0.5 threshold" },
  { rule: "Autonomy-supportive coaching tone", reason: "High autonomy drive in motivation profile" },
] as const

function OverviewTab({ onRetakeAssessment }: { onRetakeAssessment?: () => void }) {
  const listId = useId()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {onRetakeAssessment && (
        <Button variant="outline" className="w-full" onClick={onRetakeAssessment}>
          <ClipboardList className="size-4" data-icon="inline-start" />
          Retake Assessment
        </Button>
      )}

      <div>
        <p className="text-sm text-muted-foreground">
          Learning profile completed Feb 15, 2026
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <Badge variant="secondary">Exam-focused</Badge>
          <Badge variant="secondary">45 min/day</Badge>
          <Badge variant="secondary">5 days/week</Badge>
          <Badge variant="outline">Deadline: Mar 28</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning Strengths</CardTitle>
          <CardDescription>
            From your 12-screen Learning Profile assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {PROFILE_STRENGTHS.map((s) => (
            <div key={`${listId}-str-${s.area}`} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{s.area}</span>
                <Badge
                  variant={s.score >= 0.7 ? "default" : "outline"}
                  className="text-xs"
                >
                  {s.label}
                </Badge>
              </div>
              <Progress value={s.score * 100}>
                <ProgressLabel className="sr-only">{s.area}</ProgressLabel>
              </Progress>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Motivation Profile</CardTitle>
          <CardDescription>
            Self-Determination Theory: what drives your learning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(
            [
              { key: "autonomy", label: "Autonomy", desc: "Need for choice and self-direction" },
              { key: "competence", label: "Competence", desc: "Need to feel capable and effective" },
              { key: "relatedness", label: "Relatedness", desc: "Need for connection and belonging" },
            ] as const
          ).map((m) => (
            <div key={`${listId}-mot-${m.key}`} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">{m.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatPercent(MOTIVATION_PROFILE[m.key])}
                </span>
              </div>
              <Progress value={MOTIVATION_PROFILE[m.key] * 100}>
                <ProgressLabel className="sr-only">{m.label}</ProgressLabel>
              </Progress>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confidence Calibration</CardTitle>
          <CardDescription>
            How well your confidence matches your actual performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <span className="text-lg font-bold text-destructive">
                +{formatPercent(CALIBRATION_TENDENCY.gap)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{CALIBRATION_TENDENCY.tendency}</p>
              <p className="text-xs text-muted-foreground">
                You predict {formatPercent(CALIBRATION_TENDENCY.avgConfidence)} confidence but score{" "}
                {formatPercent(CALIBRATION_TENDENCY.avgAccuracy)} on average
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Learning Preferences</CardTitle>
          <CardDescription>
            From screens 10-11 of your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {LEARNING_PREFERENCES.map((p) => (
              <li
                key={`${listId}-pref-${p.pref}`}
                className="flex items-start gap-2 text-sm"
              >
                <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                {p.pref}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Adaptations</CardTitle>
          <CardDescription>
            How the system is currently adjusting to your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {SYSTEM_ADAPTATIONS.map((a) => (
            <div
              key={`${listId}-adapt-${a.rule}`}
              className="rounded-lg border p-3"
            >
              <p className="text-sm font-medium">{a.rule}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {a.reason}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsDialog() {
  const [displayName, setDisplayName] = useState("Maya Chen")
  const [email, setEmail] = useState("maya.chen@university.edu")
  const [timezone, setTimezone] = useState("America/New_York")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
          />
        }
      >
        <Settings className="size-4 text-muted-foreground" />
        Settings
      </DialogTrigger>
      <DialogContent className="flex max-h-[80dvh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account preferences
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto -mx-6 px-6">
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase">Profile</p>
            <div className="space-y-2">
              <Label htmlFor="settings-name">Display Name</Label>
              <Input
                id="settings-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-email">Email</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Badge variant="outline" className="shrink-0 text-xs">
                  <Check className="mr-1 size-3" />
                  Verified
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase">Preferences</p>
            <div className="space-y-2">
              <Label htmlFor="settings-timezone">Timezone</Label>
              <Input
                id="settings-timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. America/New_York"
              />
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-muted-foreground" />
                  <span className="text-sm">Email notifications</span>
                </div>
                <Checkbox defaultChecked />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="text-sm">Weekly progress digest</span>
                </div>
                <Checkbox defaultChecked />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-sm">Daily study reminders</span>
                </div>
                <Checkbox />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Palette className="size-4 text-muted-foreground" />
                  <span className="text-sm">Dark mode</span>
                </div>
                <Checkbox />
              </label>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase">Security</p>
            <Button variant="outline" size="sm" className="w-full">
              <Lock className="size-3.5" data-icon="inline-start" />
              Change Password
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Shield className="size-3.5" data-icon="inline-start" />
              Two-Factor Authentication
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-xs font-medium text-destructive uppercase">Danger Zone</p>
            <div className="rounded-lg border border-destructive/30 p-3">
              <p className="text-sm font-medium">Delete Account</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive" size="sm" className="mt-3">
                Delete Account
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={handleSave} disabled={saved}>
            {saved ? (
              <>
                <Check className="size-3.5" data-icon="inline-start" />
                Saved
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AccountSection() {
  return (
    <div className="flex flex-col gap-1 p-6">
      <UsageDialog />
      <BillingDialog />
      <SettingsDialog />
      <Separator className="my-1" />
      <button
        type="button"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
        onClick={() => {
          void authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                window.location.href = "/"
              },
            },
          })
        }}
      >
        <LogOut className="size-4" />
        Log out
      </button>
    </div>
  )
}

export function ProfileSheetContent({ onRetakeAssessment }: { onRetakeAssessment?: () => void }) {
  return (
    <>
      <SheetHeader className="flex-row items-center gap-3">
        <Avatar>
          <AvatarFallback>MC</AvatarFallback>
        </Avatar>
        <SheetTitle>Maya Chen</SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto p-6">
        <OverviewTab onRetakeAssessment={onRetakeAssessment} />
      </div>
      <Separator />
      <AccountSection />
    </>
  )
}
