import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { RegisterForm } from '@/components/auth/RegisterForm'

export function RegisterPage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/patterns', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
          <p className="mt-2 text-slate-600">Join Lanfinitas AI today</p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg">
          <RegisterForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}
