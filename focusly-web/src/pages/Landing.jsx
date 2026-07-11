import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useScrollReveal, useScrollProgress } from '../hooks/useScrollReveal'
import FocuslyLogo from '../components/FocuslyLogo'
import { Menu, X } from '../components/Icons'

/* ── Small wrappers that apply animation classes when in-view ── */
function Reveal({ children, animation = 'fade-up', delay = '', className = '', tag: Tag = 'div', ...props }) {
  const [ref, visible] = useScrollReveal({ threshold: 0.1 })
  return (
    <Tag
      ref={ref}
      className={`${animation} ${visible ? 'in-view' : ''} ${delay} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}

function StaggerGroup({ children, className = '' }) {
  const [ref, visible] = useScrollReveal({ threshold: 0.08 })
  return (
    <div ref={ref} className={`stagger-group ${visible ? 'in-view' : ''} ${className}`}>
      {children}
    </div>
  )
}

function RevealTitle({ children, className = '' }) {
  const [ref, visible] = useScrollReveal({ threshold: 0.15 })
  return (
    <span ref={ref} className={`reveal-text ${visible ? 'in-view' : ''} ${className}`}>
      <span>{children}</span>
    </span>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const [showMobileNav, setShowMobileNav] = useState(false)
  const progress = useScrollProgress()

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F8FAFC] flex flex-col font-sans antialiased overflow-x-hidden select-none">

      {/* Scroll Progress Bar */}
      <div
        className="scroll-progress-bar"
        style={{ width: `${progress * 100}%` }}
      />

      {/* Top Editorial Nav */}
      <header className="sticky top-0 z-50 bg-[#0B0C10]/90 backdrop-blur-md border-b border-white/15 px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="md:!hidden btn-icon p-2 flex items-center justify-center text-slate-300 hover:text-white"
            aria-label="Toggle navigation"
          >
            {showMobileNav ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link to="/" className="flex items-center gap-3 text-decoration-none">
            <FocuslyLogo size={28} showText={true} />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-[0.18em] text-slate-400">
          <a href="#features" className="hover:text-white transition-colors text-decoration-none">01 / Features</a>
          <a href="#showcase" className="hover:text-white transition-colors text-decoration-none">02 / Kanban</a>
          <a href="#vision" className="hover:text-white transition-colors text-decoration-none">03 / Vision</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono font-bold uppercase tracking-widest">
          {user ? (
            <Link to="/workspaces" className="btn btn-primary py-2 px-4 sm:px-5 text-[11px] sm:text-xs text-decoration-none font-bold">
              Workspace →
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-block text-slate-300 hover:text-white px-3 py-2 transition-colors text-decoration-none font-bold">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary py-2 px-4 sm:px-5 text-[11px] sm:text-xs text-decoration-none font-bold">
                Get Started →
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {showMobileNav && (
        <div className="md:hidden bg-[#13151E] border-b border-white/20 px-4 py-5 animate-slide-down z-40 sticky top-20">
          <div className="flex flex-col gap-3 font-mono text-xs uppercase tracking-wider">
            <a href="#features" onClick={() => setShowMobileNav(false)} className="px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white text-decoration-none transition-colors">01 / Features Architecture</a>
            <a href="#showcase" onClick={() => setShowMobileNav(false)} className="px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white text-decoration-none transition-colors">02 / Interactive Kanban</a>
            <a href="#vision" onClick={() => setShowMobileNav(false)} className="px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white text-decoration-none transition-colors">03 / System Vision</a>
            {!user && (
              <Link to="/login" onClick={() => setShowMobileNav(false)} className="px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white text-decoration-none transition-colors border-t border-white/10 mt-1 pt-3 block">
                Sign In To Workspace →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Hero Section ── */}
      <section className="relative min-h-[85vh] flex flex-col justify-between border-b border-white/15 overflow-hidden">
        {/* Background Hero Image */}
        <div className="absolute inset-0 z-0">
          <img src="/images/haven_bg.png" alt="Hero Architecture" className="w-full h-full object-cover object-center opacity-40 scale-105 animate-pulse duration-[10000ms]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C10] via-[#0B0C10]/60 to-[#0B0C10]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-[#0B0C10]/40 to-[#0B0C10]" />
        </div>

        {/* Hero Top Indicator */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-12 pt-8 sm:pt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-mono font-semibold text-slate-400">
          <div className="flex items-center gap-2 sm:gap-2.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="font-bold tracking-[0.1em] sm:tracking-[0.15em] text-[11px] sm:text-xs">Stay Focused. Get Things Done.</span>
          </div>
        </div>

        {/* Hero Headline — Text Reveal */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-12 py-10 sm:py-12 lg:py-20 max-w-7xl">
          <h1 className="font-extrabold text-[clamp(36px,10vw,110px)] leading-[0.88] tracking-[-0.05em] uppercase text-white">
            <RevealTitle>STAY</RevealTitle>
            <RevealTitle>FOCUSED.</RevealTitle>
            <RevealTitle><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-500">GET THINGS DONE.</span></RevealTitle>
          </h1>
          <Reveal animation="fade-up" className="max-w-2xl text-slate-300 text-sm md:text-base mt-6 sm:mt-8 leading-relaxed font-sans" tag="p">
            Focusly combines AI note parsing, sub-50ms live Reverb synchronization, and precision Kanban workflows into one minimalist workspace built for high-velocity engineering teams.
          </Reveal>
        </div>

        {/* Hero Footer 3-col — Stagger Fade Up */}
        <div className="relative z-10 border-t border-white/15 bg-[#0B0C10]/80 backdrop-blur-md">
          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/15">
            <div className="stagger-item p-6 lg:p-8 flex flex-col justify-between gap-6 group hover:bg-white/[0.02] transition-colors">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">01 / Engine</span>
                <h3 className="text-base font-bold uppercase tracking-tight text-white mb-2">AI Note-to-Task Parser</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">Paste raw meeting transcripts or unstructured brainstorming notes. Focusly AI parses tasks, assigns priority, and builds Kanban cards instantly.</p>
              </div>
              <Link to="/register" className="text-xs font-mono font-bold uppercase tracking-widest text-white group-hover:text-slate-300 flex items-center gap-2 transition-colors">Explore Parser →</Link>
            </div>

            <div className="stagger-item p-6 lg:p-8 flex flex-col justify-between gap-6 group hover:bg-white/[0.02] transition-colors">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">02 / Sync</span>
                <h3 className="text-base font-bold uppercase tracking-tight text-white mb-2">Real-Time WebSockets</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">Powered by Laravel Reverb. Experience sub-50ms live synchronization across global distributed engineering teams with zero page refreshes.</p>
              </div>
              <Link to="/register" className="text-xs font-mono font-bold uppercase tracking-widest text-white group-hover:text-slate-300 flex items-center gap-2 transition-colors">Live Sync →</Link>
            </div>

            <div className="stagger-item p-6 lg:p-8 flex flex-col justify-between gap-6 group hover:bg-white/[0.02] transition-colors">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">03 / Security</span>
                <h3 className="text-base font-bold uppercase tracking-tight text-white mb-2">Multi-Tenant RBAC</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">Enterprise-grade workspace isolation with strict role-based access controls for owners, administrators, and team members.</p>
              </div>
              <Link to="/register" className="text-xs font-mono font-bold uppercase tracking-widest text-white group-hover:text-slate-300 flex items-center gap-2 transition-colors">Start Workspace →</Link>
            </div>
          </StaggerGroup>
        </div>
      </section>

      {/* ── Features Gallery Grid ── */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto w-full border-b border-white/15">
        <Reveal animation="fade-up" className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-slate-400 block mb-3">System Architecture &amp; Features</span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white">CORE MODULES</h2>
        </Reveal>

        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { img: '/images/hero.png',   label: 'Module 01', title: 'AI Note Engine',     desc: 'Transform paragraphs of unstructured thought into organized Kanban backlog cards.' },
            { img: '/images/kanban.png', label: 'Module 02', title: 'Instant Kanban',     desc: 'Drag-and-drop state transitions synchronized live across all active client browsers.' },
            { img: '/images/ai.png',     label: 'Module 03', title: 'Focus Intelligence', desc: 'Deep context understanding extracts deadlines, assignees, and task hierarchy.' },
            { img: '/images/team.png',   label: 'Module 04', title: 'Team Collaboration', desc: 'Comment threads, attachment management, and activity logs per task card.' },
          ].map(({ img, label, title, desc }) => (
            <div key={title} className="stagger-item group relative h-[420px] bg-[#13151E] border border-white/15 overflow-hidden flex flex-col justify-end p-6 cursor-pointer">
              <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-110 group-hover:opacity-60 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/50 to-transparent" />
              <div className="relative z-10">
                <span className="text-xs font-mono text-slate-400 tracking-widest block mb-1">{label}</span>
                <h3 className="text-lg font-extrabold uppercase tracking-tight text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">{desc}</p>
              </div>
            </div>
          ))}
        </StaggerGroup>
      </section>

      {/* ── Interactive Kanban Showcase ── */}
      <section id="showcase" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto w-full border-b border-white/15 scroll-mt-20">
        <div id="kanban" className="scroll-mt-20" />

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <Reveal animation="fade-up">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-slate-400 block mb-3">LIVE WORKFLOW PREVIEW</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white m-0">PRECISION KANBAN BOARD</h2>
            <p className="text-slate-400 text-sm md:text-base mt-3 max-w-2xl font-sans m-0">Visual task tracking engineered for speed. Experience high-contrast cards, instant status updates, and sub-50ms WebSocket telemetry.</p>
          </Reveal>
          <Reveal animation="scale-in">
            <Link to={user ? "/workspaces" : "/register"} className="btn btn-primary px-6 py-3.5 font-bold text-xs font-mono uppercase tracking-widest w-full sm:w-auto self-start md:self-auto shrink-0 text-center text-decoration-none">
              Deploy Project Board →
            </Link>
          </Reveal>
        </div>

        {/* Live Mockup Board — each column is Scale + Fade */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start bg-[#0F1115] p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/15">

          {/* Column 1: To Do */}
          <Reveal animation="scale-in" className="glass flex flex-col p-5 bg-[#13151E] border border-white/15 rounded-xl min-h-[420px]">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                <span className="font-extrabold text-xs text-white uppercase tracking-wider">To Do</span>
                <span className="bg-white/10 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded font-bold">2</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">BACKLOG</span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-xl bg-[#18181B] border border-white/15 hover:border-white/35 transition-colors">
                <div className="flex items-center justify-between mb-2"><span className="badge badge-high font-mono text-[10px]">HIGH</span><div className="avatar avatar-sm border border-white/30">JD</div></div>
                <p className="m-0 mb-3 text-sm font-bold text-white">Refactor Auth Controllers to Multi-Tenant RBAC</p>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/10"><span>Due Oct 14</span><span>💬 4 logs</span></div>
              </div>
              <div className="p-4 rounded-xl bg-[#18181B] border border-white/15 hover:border-white/35 transition-colors">
                <div className="flex items-center justify-between mb-2"><span className="badge badge-medium font-mono text-[10px]">MEDIUM</span><div className="avatar avatar-sm border border-white/30">SK</div></div>
                <p className="m-0 mb-3 text-sm font-bold text-white">Optimize PostgreSQL indexes for task drag latency</p>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/10"><span>Due Oct 18</span><span>📎 2 specs</span></div>
              </div>
            </div>
          </Reveal>

          {/* Column 2: In Progress */}
          <Reveal animation="scale-in" className="glass flex flex-col p-5 bg-[#13151E] border border-white/25 rounded-xl min-h-[420px] relative" style={{ transitionDelay: '0.1s' }}>
            <div className="absolute -top-3 right-6 bg-[#f8fafc] text-[#0B0C10] font-mono font-bold text-[9px] uppercase px-2.5 py-0.5 rounded-full border border-white/10">LIVE SYNCING</div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="font-extrabold text-xs text-white uppercase tracking-wider">In Progress</span>
                <span className="bg-white/10 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded font-bold">1</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">EXECUTION</span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/30 hover:border-white/50 transition-colors">
                <div className="flex items-center justify-between mb-2"><span className="badge badge-high font-mono text-[10px]">HIGH</span><div className="avatar avatar-sm border border-white/30">AL</div></div>
                <p className="m-0 mb-3 text-sm font-bold text-white">Deploy AI Note-to-Kanban Ingestion Engine</p>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-2 border-t border-white/10"><span className="text-white font-bold">In Dev</span><span>Sub-50ms</span></div>
              </div>
            </div>
          </Reveal>

          {/* Column 3: Done */}
          <Reveal animation="scale-in" className="glass flex flex-col p-5 bg-[#13151E] border border-white/15 rounded-xl min-h-[420px] opacity-80" style={{ transitionDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#64748B]" />
                <span className="font-extrabold text-xs text-white uppercase tracking-wider">Done</span>
                <span className="bg-white/10 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded font-bold">2</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">SHIPPED</span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-xl bg-[#18181B]/60 border border-white/10 line-through text-slate-400">
                <div className="flex items-center justify-between mb-2"><span className="badge badge-low font-mono text-[10px]">LOW</span><div className="avatar avatar-sm border border-white/20">JD</div></div>
                <p className="m-0 mb-3 text-sm font-bold text-slate-300">Strip box shadows and neon colors from design system</p>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-white/10"><span>Shipped Today</span><span>✓ Verified</span></div>
              </div>
              <div className="p-4 rounded-xl bg-[#18181B]/60 border border-white/10 line-through text-slate-400">
                <div className="flex items-center justify-between mb-2"><span className="badge badge-medium font-mono text-[10px]">MEDIUM</span><div className="avatar avatar-sm border border-white/20">SK</div></div>
                <p className="m-0 mb-3 text-sm font-bold text-slate-300">Create Focusly geometric vector logo identity</p>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-white/10"><span>Shipped Today</span><span>✓ Verified</span></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Vision Section (Bottom Landscape) ── */}
      <section id="vision" className="relative min-h-[70vh] flex flex-col justify-end p-6 sm:p-8 lg:p-16 overflow-hidden border-b border-white/15 scroll-mt-20">
        <div className="absolute inset-0 z-0">
          <img src="/images/haven_wood.png" alt="Night Sky Landscape" className="w-full h-full object-cover opacity-40 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C10] via-transparent to-[#0B0C10]" />
        </div>

        <div className="relative z-10 max-w-5xl flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <RevealTitle className="text-xs font-mono uppercase tracking-[0.3em] text-slate-400 block mb-4">
              Next-Gen Engineering Workflows
            </RevealTitle>
            <h2 className="font-extrabold text-[clamp(32px,7vw,72px)] leading-[0.9] tracking-[-0.04em] uppercase text-white">
              <RevealTitle>BUILD AND</RevealTitle>
              <RevealTitle>INSPIRE YOUR</RevealTitle>
              <RevealTitle>TEAM.</RevealTitle>
            </h2>
          </div>

          <Reveal animation="fade-up" className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto relative z-10">
            <Link to="/register" className="btn btn-primary px-8 py-4 text-xs font-mono uppercase tracking-widest text-decoration-none w-full sm:w-auto font-bold">
              Deploy Your Workspace →
            </Link>
            <Link to="/login" className="btn btn-secondary px-8 py-4 text-xs font-mono uppercase tracking-widest text-decoration-none w-full sm:w-auto font-bold">
              Sign In Now
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between text-xs font-mono tracking-wider text-slate-500 uppercase gap-4 text-center sm:text-left">
        <Reveal animation="blur-in" className="flex items-center gap-3">
          <FocuslyLogo size={22} />
          <span>© 2026 FOCUSLY INC. ALL RIGHTS RESERVED.</span>
        </Reveal>
        <Reveal animation="fade-up" className="flex flex-wrap justify-center gap-6">
          <Link to="/login" className="hover:text-white transition-colors text-decoration-none">Privacy</Link>
          <Link to="/login" className="hover:text-white transition-colors text-decoration-none">Terms</Link>
          <Link to="/login" className="hover:text-white transition-colors text-decoration-none">API Specs</Link>
        </Reveal>
      </footer>
    </div>
  )
}
