import { useNavigate, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: Location })?.from?.pathname || '/patterns'

  const handleSuccess = () => {
    navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="mt-2 text-slate-600">Sign in to your account</p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg">
          <LoginForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}
