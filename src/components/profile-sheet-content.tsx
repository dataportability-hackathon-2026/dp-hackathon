"use client";

import {
  Bell,
  Check,
  ChevronRight,
  ClipboardList,
  Clock,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  User,
} from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { BillingDialog } from "@/components/billing/billing-dialog";
import { UsageDialog } from "@/components/billing/usage-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { authClient } from "@/lib/auth-client";
import {
  dataStore,
  type MotivationProfile,
  useDataStore,
} from "@/lib/data-store";
import { usePreferences } from "@/lib/hooks/use-preferences";
import { preferencesStore, type VizType } from "@/lib/preferences-store";

const IS_DEV = process.env.NODE_ENV !== "production";

function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function buildPreferencesFromProfile(profile: {
  preferredFormats?: string[];
  sessionLength?: string;
  coachingTone?: string;
  feedbackStyle?: string;
}): string[] {
  const prefs: string[] = [];
  if (profile.preferredFormats?.length) {
    const formatted = profile.preferredFormats
      .map((f) => f.replace(/-/g, " "))
      .join(", ");
    prefs.push(`Prefers ${formatted}`);
  }
  if (profile.sessionLength) {
    prefs.push(`${profile.sessionLength} min sessions`);
  }
  if (profile.coachingTone) {
    prefs.push(`${profile.coachingTone} coaching tone`);
  }
  if (profile.feedbackStyle) {
    prefs.push(`${profile.feedbackStyle} feedback style`);
  }
  return prefs;
}

const MOTIVATION_ITEMS: Array<{
  key: keyof MotivationProfile;
  label: string;
  desc: string;
}> = [
  {
    key: "autonomy",
    label: "Autonomy",
    desc: "Need for choice and self-direction",
  },
  {
    key: "competence",
    label: "Competence",
    desc: "Need to feel capable and effective",
  },
  {
    key: "relatedness",
    label: "Relatedness",
    desc: "Need for connection and belonging",
  },
];

function OverviewTab({
  onRetakeAssessment,
}: {
  onRetakeAssessment?: () => void;
}) {
  const listId = useId();
  const profileStrengths = useDataStore((s) => s.profileStrengths);
  const motivationProfile = useDataStore((s) => s.motivationProfile);
  const calibrationTendency = useDataStore((s) => s.calibrationTendency);
  const systemAdaptations = useDataStore((s) => s.systemAdaptations);
  const learningProfile = useDataStore((s) => s.learningProfile);
  const assessmentId = useDataStore((s) => s.assessmentId);

  const [assessments, setAssessments] = useState<
    Array<{
      id: string;
      type: string;
      version: number;
      status: string;
      completedAt: string | null;
      createdAt: string;
    }>
  >([]);
  const [generatingMock, setGeneratingMock] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/assessments?limit=5");
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const handleGenerateMock = async () => {
    setGeneratingMock(true);
    try {
      const res = await fetch("/api/assessments/mock", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        dataStore.hydrateFromAssessment(data);
        await fetchHistory();
      }
    } catch {
      // silently fail
    } finally {
      setGeneratingMock(false);
    }
  };

  const hasAssessment = !!assessmentId;
  const preferences = learningProfile
    ? buildPreferencesFromProfile(learningProfile)
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {IS_DEV && (
        <Button
          variant="outline"
          className="w-full border-dashed border-amber-500/50 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
          onClick={handleGenerateMock}
          disabled={generatingMock}
        >
          {generatingMock ? (
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          ) : (
            <Sparkles className="size-4" data-icon="inline-start" />
          )}
          {generatingMock
            ? "Generating Mock Profile..."
            : "Generate Mock Profile (Dev)"}
        </Button>
      )}

      {onRetakeAssessment && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onRetakeAssessment}
        >
          <ClipboardList className="size-4" data-icon="inline-start" />
          {hasAssessment ? "Retake Assessment" : "Take Assessment"}
        </Button>
      )}

      <div>
        {assessments.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              {assessments[0].completedAt
                ? `Learning profile completed ${new Date(assessments[0].completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : "Assessment in progress"}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {assessments.map((a) => (
                <Badge
                  key={a.id}
                  variant={a.status === "completed" ? "secondary" : "outline"}
                >
                  v{a.version} — {a.type.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No assessments completed yet. Take the assessment or generate a mock
            profile to get started.
          </p>
        )}
      </div>

      {!hasAssessment && !assessments.some((a) => a.status === "completed") ? (
        <Card>
          <CardContent className="py-8 text-center">
            <ClipboardList className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium">No cognitive profile yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Complete the 12-screen assessment to generate your personalized
              learning profile.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Learning Strengths</CardTitle>
              <CardDescription>
                From your Learning Profile assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileStrengths.map((s) => (
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
                  <p className="text-xs text-muted-foreground">
                    {s.description}
                  </p>
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
              {MOTIVATION_ITEMS.map((m) => (
                <div key={`${listId}-mot-${m.key}`} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{m.label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatPercent(motivationProfile[m.key])}
                    </span>
                  </div>
                  <Progress value={motivationProfile[m.key] * 100}>
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
                    +{formatPercent(calibrationTendency.gap)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {calibrationTendency.tendency}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You predict{" "}
                    {formatPercent(calibrationTendency.avgConfidence)}{" "}
                    confidence but score{" "}
                    {formatPercent(calibrationTendency.avgAccuracy)} on average
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>From your profile assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {preferences.length > 0 ? (
                  preferences.map((pref) => (
                    <li
                      key={`${listId}-pref-${pref}`}
                      className="flex items-start gap-2 text-sm"
                    >
                      <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      {pref}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground">
                    No preferences recorded yet
                  </li>
                )}
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
              {systemAdaptations.map((a) => (
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
        </>
      )}
    </div>
  );
}

function NotificationsDialog() {
  const prefs = usePreferences();

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
        <Bell className="size-4 text-muted-foreground" />
        Notifications
      </DialogTrigger>
      <DialogContent className="flex max-h-[80dvh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription className="sr-only">
            Notifications
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto -mx-6 px-6 py-1">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <span className="text-sm">Email notifications</span>
            </div>
            <Checkbox
              checked={prefs.emailNotifications}
              onCheckedChange={(checked) =>
                preferencesStore.set({ emailNotifications: checked })
              }
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <span className="text-sm">Weekly progress digest</span>
            </div>
            <Checkbox
              checked={prefs.weeklyDigest}
              onCheckedChange={(checked) =>
                preferencesStore.set({ weeklyDigest: checked })
              }
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-sm">Daily study reminders</span>
            </div>
            <Checkbox
              checked={prefs.dailyReminders}
              onCheckedChange={(checked) =>
                preferencesStore.set({ dailyReminders: checked })
              }
            />
          </label>
        </div>
        <DialogFooter className="pt-4">
          <DialogClose render={<Button variant="outline" />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialog() {
  const { data: session } = authClient.useSession();
  const [displayName, setDisplayName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
          <DialogDescription className="sr-only">Settings</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto -mx-6 px-6">
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Profile
            </p>
            <div className="space-y-2">
              <Label htmlFor="settings-name">Display Name</Label>
              <Input
                id="settings-name"
                autoComplete="name"
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
                  autoComplete="email"
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
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Security
            </p>
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
            <p className="text-xs font-medium text-destructive uppercase">
              Danger Zone
            </p>
            <div className="rounded-lg border border-destructive/30 p-3">
              <p className="text-sm font-medium">Delete Account</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="mt-3"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete your account? This action cannot be undone.",
                    )
                  ) {
                    // TODO: implement account deletion
                  }
                }}
              >
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
  );
}

const VIZ_ITEMS = [
  { label: "Wave", value: "wave" },
  { label: "Bars", value: "bars" },
  { label: "Aura", value: "aura" },
] as const;

function PreferencesDialog() {
  const prefs = usePreferences();

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
        <SlidersHorizontal className="size-4 text-muted-foreground" />
        Preferences
      </DialogTrigger>
      <DialogContent className="flex max-h-[80dvh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Preferences</DialogTitle>
          <DialogDescription className="sr-only">Preferences</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto -mx-6 px-6 py-1">
          {/* Visualization type */}
          <div className="space-y-2">
            <Label>Voice Visualization</Label>
            <Select
              items={
                VIZ_ITEMS as unknown as readonly {
                  label: string;
                  value: string;
                }[]
              }
              value={prefs.vizType}
              onValueChange={(v) =>
                preferencesStore.set({ vizType: v as VizType })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VIZ_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Daily minutes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Daily Study Time</Label>
              <span className="text-sm tabular-nums text-muted-foreground">
                {prefs.dailyMinutes} min
              </span>
            </div>
            <Slider
              min={5}
              max={120}
              step={5}
              value={[prefs.dailyMinutes]}
              onValueChange={(v) =>
                preferencesStore.set({
                  dailyMinutes: Array.isArray(v) ? v[0] : v,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              How many minutes per day you want to study
            </p>
          </div>

          {/* Difficulty */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Difficulty Level</Label>
              <span className="text-sm tabular-nums text-muted-foreground">
                {prefs.difficulty}%
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[prefs.difficulty]}
              onValueChange={(v) =>
                preferencesStore.set({
                  difficulty: Array.isArray(v) ? v[0] : v,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Higher values mean more challenging content
            </p>
          </div>

          {/* Review frequency */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Review Frequency</Label>
              <span className="text-sm tabular-nums text-muted-foreground">
                Every {prefs.reviewFrequency} day
                {prefs.reviewFrequency !== 1 && "s"}
              </span>
            </div>
            <Slider
              min={1}
              max={14}
              step={1}
              value={[prefs.reviewFrequency]}
              onValueChange={(v) =>
                preferencesStore.set({
                  reviewFrequency: Array.isArray(v) ? v[0] : v,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              How often to schedule spaced-repetition reviews
            </p>
          </div>

          <Separator />

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="pref-timezone">Timezone</Label>
            <Input
              id="pref-timezone"
              autoComplete="off"
              value={prefs.timezone}
              onChange={(e) =>
                preferencesStore.set({ timezone: e.target.value })
              }
              placeholder="e.g. America/New_York"
            />
          </div>
        </div>
        <DialogFooter className="pt-4">
          <DialogClose render={<Button variant="outline" />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AccountSection() {
  return (
    <div className="flex flex-col gap-1 p-6">
      <UsageDialog />
      <BillingDialog />
      <PreferencesDialog />
      <NotificationsDialog />
      <SettingsDialog />
      <Separator className="my-1" />
      <button
        type="button"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
        onClick={() => {
          void authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                window.location.href = "/";
              },
            },
          });
        }}
      >
        <LogOut className="size-4" />
        Log out
      </button>
    </div>
  );
}

export function ProfileSheetContent({
  onRetakeAssessment,
}: {
  onRetakeAssessment?: () => void;
}) {
  const { data: session } = authClient.useSession();
  return (
    <>
      <SheetHeader className="flex-row items-center gap-3">
        <Avatar>
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <SheetTitle>{session?.user?.name ?? "Account"}</SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto p-6">
        <OverviewTab onRetakeAssessment={onRetakeAssessment} />
      </div>
      <Separator />
      <AccountSection />
    </>
  );
}
