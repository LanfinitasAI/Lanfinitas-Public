import { Link } from 'react-router-dom'

/**
 * Landing Page - Minimalist Black/White Design
 *
 * Features:
 * - Minimalist black background with white text
 * - Impact font for brand name (super large)
 * - Typewriter font for navigation and hero text
 * - Mountain background image overlay
 * - TRY IT button linking to Identity Management
 */

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-6">
        {/* Logo - Impact Font */}
        <div className="font-impact text-2xl tracking-tighter uppercase">
          LANFINITAS AI
        </div>

        {/* Right Nav Links - Typewriter Font */}
        <div className="font-mono text-sm tracking-wider uppercase flex gap-8">
          <Link
            to="/login"
            className="hover:text-gray-400 transition-colors"
          >
            LOGIN
          </Link>
          <span className="text-gray-600">|</span>
          <button className="hover:text-gray-400 transition-colors">
            JOIN WAITLIST
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-12">
        {/* Hero Text - Center */}
        <div className="relative z-10 mb-32 text-center">
          <h1 className="font-mono text-xl tracking-wider uppercase leading-relaxed max-w-4xl">
            AI RESHAPES FASHION, DESIGNING A ZERO-WASTE FUTURE
          </h1>
        </div>

        {/* Super Large Brand Text - Impact Font */}
        <div className="absolute left-0 bottom-0 w-full overflow-hidden">
          {/* Mountain Background Image - Bottom Left */}
          <div className="absolute left-0 bottom-0 w-1/2 h-96 opacity-30 mix-blend-overlay">
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cpath d='M0 400 L200 100 L400 250 L600 50 L800 300 L800 400 Z' fill='%23ffffff'/%3E%3C/svg%3E"
              alt="Mountains"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Giant Brand Text */}
          <div className="relative z-10 pointer-events-none select-none">
            <h2
              className="font-impact tracking-tighter uppercase leading-none"
              style={{ fontSize: '20rem' }}
            >
              LANFINITAS
            </h2>
            <h2
              className="font-impact tracking-tighter uppercase leading-none"
              style={{ fontSize: '20rem' }}
            >
              AI
            </h2>
          </div>
        </div>

        {/* TRY IT Button - Bottom Left */}
        <Link
          to="/identity"
          className="fixed left-12 bottom-12 z-20 font-mono border border-white px-12 py-4 hover:bg-white hover:text-black transition-colors uppercase tracking-wider text-lg"
        >
          TRY IT
        </Link>
      </div>

      {/* Background Gradient for depth */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>
    </div>
  )
}
