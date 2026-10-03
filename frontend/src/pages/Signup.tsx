import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlaceTrackIcon } from '../components/PlaceTrackLogo'
import { api, apiError, apiFieldErrors } from '../lib/api'
import { useAuth } from '../store/auth'
import { Button, ErrorNote, Field, Input } from '../components/ui'
import { AuthShell } from '../components/AuthShell'
import type { AuthResponse } from '../lib/types'

export default function Signup() {
  const navigate = useNavigate()
  const signIn = useAuth((s) => s.signIn)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    if (password.length < 8) {
      setFieldErrors({ password: 'Use at least 8 characters.' })
      return
    }
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords don't match." })
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', {
        fullName,
        email,
        password,
      })
      signIn(data.token, data.user)
      navigate('/', { replace: true })
    } catch (err) {
      const perField = apiFieldErrors(err)
      if (Object.keys(perField).length) setFieldErrors(perField)
      else setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
          <PlaceTrackIcon size={20} className="text-white" />
        </div>
        <span className="text-lg font-semibold text-slate-900 dark:text-white">PlaceTrack</span>
      </div>

      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Create your account</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Track your whole placement season in one place.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {error && <ErrorNote message={error} />}

        <Field label="Full name" htmlFor="fullName" required error={fieldErrors.fullName}>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            aria-invalid={Boolean(fieldErrors.fullName) || undefined}
          />
        </Field>

        <Field label="Email" htmlFor="email" required error={fieldErrors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={Boolean(fieldErrors.email) || undefined}
          />
        </Field>

        <Field label="Password" htmlFor="password" hint="At least 8 characters." required error={fieldErrors.password}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-invalid={Boolean(fieldErrors.password) || undefined}
          />
        </Field>

        <Field label="Confirm password" htmlFor="confirmPassword" required error={fieldErrors.confirmPassword}>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            aria-invalid={Boolean(fieldErrors.confirmPassword) || undefined}
          />
        </Field>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
