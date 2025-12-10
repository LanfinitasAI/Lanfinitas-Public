import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { useAuthStore } from '@/store'
import { useMemo } from 'react'

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register: registerUser, isLoading, error, clearError } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  })

  const password = watch('password')

  // Password strength indicator
  const passwordStrength = useMemo(() => {
    if (!password) return { strength: 0, label: 'None', color: 'bg-slate-200' }

    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++

    if (strength <= 2)
      return { strength: 1, label: 'Weak', color: 'bg-red-500' }
    if (strength <= 4)
      return { strength: 2, label: 'Medium', color: 'bg-yellow-500' }
    return { strength: 3, label: 'Strong', color: 'bg-green-500' }
  }, [password])

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError()
      await registerUser(data.email, data.password, data.username)
      onSuccess?.()
    } catch (err) {
      // Error is handled by the store
      console.error('Registration error:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Username Field */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-slate-700"
        >
          Username
        </label>
        <Input
          id="username"
          type="text"
          placeholder="johndoe"
          className="mt-1"
          {...register('username')}
          disabled={isLoading}
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700"
        >
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="mt-1"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700"
        >
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="mt-1"
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}

        {/* Password Strength Indicator */}
        {password && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Password strength:</span>
              <span className="font-medium">{passwordStrength.label}</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full transition-all ${passwordStrength.color}`}
                style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Password Requirements */}
        <div className="mt-2 space-y-1 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            {password.length >= 8 ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-slate-400" />
            )}
            <span>At least 8 characters</span>
          </div>
          <div className="flex items-center gap-1">
            {/[A-Z]/.test(password) ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-slate-400" />
            )}
            <span>One uppercase letter</span>
          </div>
          <div className="flex items-center gap-1">
            {/[a-z]/.test(password) ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-slate-400" />
            )}
            <span>One lowercase letter</span>
          </div>
          <div className="flex items-center gap-1">
            {/\d/.test(password) ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-slate-400" />
            )}
            <span>One number</span>
          </div>
        </div>
      </div>

      {/* Confirm Password Field */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-slate-700"
        >
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          className="mt-1"
          {...register('confirmPassword')}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms and Conditions Checkbox */}
      <div>
        <div className="flex items-start">
          <input
            id="agreeToTerms"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            {...register('agreeToTerms')}
            disabled={isLoading}
          />
          <label
            htmlFor="agreeToTerms"
            className="ml-2 block text-sm text-slate-700"
          >
            I agree to the{' '}
            <Link
              to="/terms"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="mt-1 text-sm text-red-600">
            {errors.agreeToTerms.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Sign Up'
        )}
      </Button>

      {/* Sign In Link */}
      <div className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Sign in
        </Link>
      </div>
    </form>
  )
}
