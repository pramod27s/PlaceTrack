import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PlaceTrackIcon } from '../components/PlaceTrackLogo'
import { api, apiError } from '../lib/api'
import { useAuth } from '../store/auth'
import { Button, ErrorNote, Field, Input } from '../components/ui'
import { AuthShell } from '../components/AuthShell'
import type { AuthResponse } from '../lib/types'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const signIn = useAuth((s) => s.signIn)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
      signIn(data.token, data.user)
      navigate(from, { replace: true })
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setEmail('demo@placetrack.app')
    setPassword('demo1234')
  }

  return (
    <AuthShell>
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
          <PlaceTrackIcon size={20} className="text-white" />
        </div>
        <span className="text-lg font-bold text-slate-900 dark:text-white">PlaceTrack</span>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Sign in to pick up where your placement season left off.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {error && <ErrorNote message={error} />}

        <Field label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field label="Password" htmlFor="password" required>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {import.meta.env.DEV && (
        <button
          type="button"
          onClick={fillDemo}
          className="mt-4 w-full rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 px-4 py-2.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 transition hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
        >
          Explore with the demo account →
        </button>
      )}

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        New here?{' '}
        <Link to="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
