import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} Lanfinitas AI. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link
              to="/about"
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              About
            </Link>
            <Link
              to="/docs"
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              Documentation
            </Link>
            <Link
              to="/support"
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
