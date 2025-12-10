import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)

    // Only show prompt if not in standalone and not dismissed before
    const dismissed = localStorage.getItem('installPromptDismissed')
    if (!standalone && !dismissed) {
      // For iOS, show custom prompt
      if (ios) {
        const iosPromptShown = sessionStorage.getItem('iosInstallPromptShown')
        if (!iosPromptShown) {
          setTimeout(() => setShowPrompt(true), 3000) // Show after 3 seconds
          sessionStorage.setItem('iosInstallPromptShown', 'true')
        }
      }
    }

    // Listen for beforeinstallprompt event (Chrome, Edge)
    const handler = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)

      // Don't show prompt if user dismissed it before
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000) // Show after 3 seconds
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false)
      setDeferredPrompt(null)
      console.log('PWA was installed')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    await deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the prompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('installPromptDismissed', 'true')
  }

  const handleDismissTemporary = () => {
    setShowPrompt(false)
  }

  // Don't show if already in standalone mode
  if (isStandalone) return null

  // Don't show if user dismissed or no prompt available
  if (!showPrompt) return null

  // iOS-specific prompt
  if (isIOS) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg md:left-auto md:right-4 md:w-96">
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleDismissTemporary}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Install App</CardTitle>
          </div>
          <CardDescription>
            Add Lanfinitas AI to your home screen for quick access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">To install:</p>
          <ol className="ml-4 list-decimal space-y-1 text-muted-foreground">
            <li>Tap the Share button in Safari</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" in the top right corner</li>
          </ol>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleDismiss} className="w-full">
            Don't Show Again
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Chrome/Edge prompt
  if (deferredPrompt) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg md:left-auto md:right-4 md:w-96">
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleDismissTemporary}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Install App</CardTitle>
          </div>
          <CardDescription>
            Install Lanfinitas AI for a better experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="ml-4 list-disc space-y-1">
            <li>Faster load times</li>
            <li>Work offline</li>
            <li>Quick access from home screen</li>
            <li>Native app experience</li>
          </ul>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={handleDismiss} className="flex-1">
            Not Now
          </Button>
          <Button onClick={handleInstall} className="flex-1">
            Install
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return null
}
