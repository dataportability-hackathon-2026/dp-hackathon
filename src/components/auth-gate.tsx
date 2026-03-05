"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Eye, EyeOff, GraduationCap, Palette, Stethoscope, Shield } from "lucide-react"

const isDev = process.env.NODE_ENV === "development"

type DemoPersona = {
  label: string
  name: string
  email: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    label: "Dr. Priya",
    name: "Dr. Priya Ramanathan",
    email: "priya@university.edu",
    icon: Stethoscope,
    color: "border-border hover:bg-muted",
  },
  {
    label: "Marcus",
    name: "Marcus Chen",
    email: "marcus@risd.edu",
    icon: Palette,
    color: "border-border hover:bg-muted",
  },
  {
    label: "Maya",
    name: "Maya Chen",
    email: "maya@stanford.edu",
    icon: GraduationCap,
    color: "border-border hover:bg-muted",
  },
]

const ADMIN_PERSONA: DemoPersona = {
  label: "Admin",
  name: "Admin User",
  email: "admin@coremodel.ai",
  icon: Shield,
  color: "border-border hover:bg-muted",
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <>{children}</>
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setIsAuthenticated(true)
      setLoading(false)
    }, 800)
  }

  function loginAsPersona(persona: DemoPersona) {
    setEmail(persona.email)
    setName(persona.name)
    setLoading(true)
    setTimeout(() => {
      setIsAuthenticated(true)
      setLoading(false)
    }, 400)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
            <Brain className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? "Create your account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Start your adaptive learning journey"
              : "Sign in to continue learning"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Dr. Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {isDev && (
            <div className="mt-6 border-t pt-4">
              <p className="mb-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Dev Quick Login
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_PERSONAS.map((persona) => {
                  const Icon = persona.icon
                  return (
                    <button
                      key={persona.email}
                      type="button"
                      onClick={() => loginAsPersona(persona)}
                      disabled={loading}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${persona.color}`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{persona.label}</span>
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => loginAsPersona(ADMIN_PERSONA)}
                  disabled={loading}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${ADMIN_PERSONA.color}`}
                >
                  <Shield className="size-4 shrink-0" />
                  <span className="truncate">Admin</span>
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
