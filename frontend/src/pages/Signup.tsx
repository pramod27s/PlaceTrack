import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Route as RouteIcon } from 'lucide-react'
import { api, apiError } from '../lib/api'
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
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
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
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
          <RouteIcon size={20} className="text-white" />
        </div>
        <span className="text-lg font-bold text-slate-900">PlaceTrack</span>
      </div>

      <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
      <p className="mt-1 text-sm text-slate-500">
        Start tracking your placement season in one place.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {error && <ErrorNote message={error} />}

        <Field label="Full name" htmlFor="fullName" required>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </Field>

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

        <Field label="Password" htmlFor="password" hint="At least 8 characters." required>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
