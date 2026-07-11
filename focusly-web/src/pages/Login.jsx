import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import FocuslyLogo from '../components/FocuslyLogo'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back to Focusly!')
      navigate('/workspaces')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6 lg:p-12 font-sans antialiased select-none">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-white/15 pb-6 gap-3">
        <Link to="/" className="flex items-center gap-3 text-decoration-none">
          <FocuslyLogo size={32} showText={true} />
        </Link>
        <div className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-slate-400 text-right">
          AUTHENTICATION
        </div>
      </header>

      {/* Main Form Area */}
      <div className="flex-1 flex items-center justify-center py-12 relative z-10">
        {/* Background Decorative Ambient Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[450px] h-[280px] sm:h-[450px] bg-white/[0.02] rounded-full blur-[80px] pointer-events-none -z-10" />

        <div className="w-full max-w-md">
          {/* Editorial Header */}
          <div className="mb-8 sm:mb-10">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-slate-400 block mb-2">
              System Access
            </span>
            <h1 className="font-extrabold text-3xl sm:text-4xl uppercase tracking-[-0.03em] text-white leading-tight">
              SIGN IN TO <br />
              WORKSPACE.
            </h1>
          </div>

          {/* Clean Glass Card */}
          <div className="glass p-6 sm:p-8 border border-white/15 bg-[#13151E]/80 backdrop-blur-md rounded-2xl shadow-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="form-group">
                <label className="label" htmlFor="login-email">Work Email</label>
                <input
                  id="login-email"
                  type="email"
                  className="input"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className="input"
                  placeholder="••••••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                id="login-submit"
                type="submit"
                className="btn btn-primary w-full py-3.5 mt-2 font-bold justify-center"
                disabled={loading}
              >
                {loading ? (
                  <><div className="spinner w-4 h-4 border-2 border-t-black border-black/20 mr-2" /> Authenticating…</>
                ) : (
                  'Continue →'
                )}
              </button>
            </form>

            <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs font-mono uppercase tracking-wider text-slate-400">
              New to Focusly?{' '}
              <Link to="/register" className="text-white font-bold hover:underline ml-1 inline-block">
                Create Account →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/15 pt-6 text-[10px] sm:text-xs font-mono uppercase tracking-[0.15em] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
        <span>© 2026 FOCUSLY INC.</span>
        <span>STAY FOCUSED. GET THINGS DONE.</span>
      </footer>
    </div>
  )
}
