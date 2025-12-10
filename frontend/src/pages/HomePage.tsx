import { Link } from 'react-router-dom'
import { Sparkles, Upload, Layers, Zap } from 'lucide-react'

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-center">
          {/* Logo and Icon */}
          <div className="mb-8 flex justify-center">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 shadow-xl">
              <Sparkles className="h-16 w-16 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-6xl font-bold text-transparent">
            Lanfinitas AI
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-xl text-gray-600">
            3D Fashion Design Platform
          </p>

          {/* Description */}
          <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">
              AI-Powered 3D to 2D Conversion
            </h2>
            <p className="mb-6 text-gray-600">
              Transform your 3D fashion designs into precise 2D patterns using
              advanced AI technology.
            </p>

            {/* Features */}
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <FeatureCard icon={Upload} title="Pattern Generation" />
              <FeatureCard icon={Layers} title="Fabric Simulation" />
              <FeatureCard icon={Zap} title="Layout Optimization" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/login"
                className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Get Started
              </Link>
              <Link
                to="/patterns"
                className="rounded-lg border-2 border-indigo-600 px-6 py-3 font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
              >
                View Patterns
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
}

function FeatureCard({ icon: Icon, title }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <Icon className="mb-2 h-8 w-8 text-indigo-600" />
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
  )
}
