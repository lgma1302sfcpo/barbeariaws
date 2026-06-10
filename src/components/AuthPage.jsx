import { useState } from 'react'
import { Loader2, LogIn, UserPlus } from 'lucide-react'
import { writeAuth } from '../lib/auth.js'

export default function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(isRegister ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister ? form : { email: form.email, password: form.password }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Nao foi possivel entrar.')

      writeAuth(data)
      window.location.href = data.user?.role === 'ADMIN' ? '/admin' : '/#produtos'
    } catch (authError) {
      setError(authError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-ink-950 pt-24 text-white">
      <section className="section-padding">
        <div className="section-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="section-eyebrow">{isRegister ? 'Cadastro' : 'Login'}</p>
            <h1 className="section-title">
              {isRegister ? 'Crie sua conta para comprar com mais agilidade.' : 'Entre para acompanhar suas compras.'}
            </h1>
            <p className="section-copy">
              Sua conta ajuda a preencher dados no checkout e facilita a consulta dos pedidos no atendimento.
            </p>
          </div>

          <div className="premium-card p-6 lg:p-8">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-md border border-gold-300/25 bg-gold-300/10 text-gold-300">
              {isRegister ? <UserPlus size={24} /> : <LogIn size={24} />}
            </div>
            <h2 className="text-2xl font-black">{isRegister ? 'Criar conta' : 'Entrar'}</h2>

            <form className="mt-6 space-y-4" onSubmit={submit}>
              {isRegister && (
                <label className="block text-sm font-bold text-zinc-300">
                  Nome
                  <input
                    value={form.name}
                    onChange={(event) => setField('name', event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-white outline-none transition focus:border-gold-300"
                    placeholder="Seu nome"
                  />
                </label>
              )}

              <label className="block text-sm font-bold text-zinc-300">
                E-mail
                <input
                  value={form.email}
                  onChange={(event) => setField('email', event.target.value)}
                  type="email"
                  className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-white outline-none transition focus:border-gold-300"
                  placeholder="voce@email.com"
                />
              </label>

              {isRegister && (
                <label className="block text-sm font-bold text-zinc-300">
                  WhatsApp
                  <input
                    value={form.phone}
                    onChange={(event) => setField('phone', event.target.value)}
                    inputMode="tel"
                    className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-white outline-none transition focus:border-gold-300"
                    placeholder="(13) 99999-9999"
                  />
                </label>
              )}

              <label className="block text-sm font-bold text-zinc-300">
                Senha
                <input
                  value={form.password}
                  onChange={(event) => setField('password', event.target.value)}
                  type="password"
                  className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-white outline-none transition focus:border-gold-300"
                  placeholder={isRegister ? 'Minimo de 6 caracteres' : 'Sua senha'}
                />
              </label>

              {error && (
                <p className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
                  {error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
                {isRegister ? 'Cadastrar' : 'Entrar'}
              </button>
            </form>

            <p className="mt-5 text-sm text-zinc-400">
              {isRegister ? 'Ja tem conta?' : 'Ainda nao tem conta?'}{' '}
              <a href={isRegister ? '/login' : '/cadastro'} className="font-bold text-gold-300 transition hover:text-gold-100">
                {isRegister ? 'Entrar' : 'Criar cadastro'}
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
