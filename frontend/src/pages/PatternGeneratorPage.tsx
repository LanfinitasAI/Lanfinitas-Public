import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  InputSelector,
  type InputType,
} from '@/components/pattern/InputSelector'
import { FileUploader } from '@/components/pattern/FileUploader'
import { ParameterForm } from '@/components/pattern/ParameterForm'
import {
  GenerationProgress,
  type GenerationStatus,
} from '@/components/pattern/GenerationProgress'
import { ResultPreview } from '@/components/pattern/ResultPreview'

export function PatternGeneratorPage() {
  const [inputType, setInputType] = useState<InputType>('3d-mesh')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [generationStatus, setGenerationStatus] =
    useState<GenerationStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)

  // Generation steps tracking
  const [steps, setSteps] = useState([
    { id: '1', title: 'Uploading file', status: 'pending' as const },
    { id: '2', title: 'Processing 3D model', status: 'pending' as const },
    { id: '3', title: 'Generating patterns', status: 'pending' as const },
    { id: '4', title: 'Optimizing layout', status: 'pending' as const },
    { id: '5', title: 'Creating output file', status: 'pending' as const },
  ])

  // File upload accept types
  const getAcceptTypes = () => {
    switch (inputType) {
      case '3d-mesh':
        return {
          'model/obj': ['.obj'],
          'model/fbx': ['.fbx'],
          'model/step': ['.step', '.stp'],
          'model/stl': ['.stl'],
        }
      case 'image':
        return {
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/png': ['.png'],
        }
      default:
        return {}
    }
  }

  // Handle file upload and generation
  const handleFileUpload = async () => {
    if (!selectedFile) return

    setGenerationStatus('uploading')
    setProgress(0)

    // Simulate upload and processing
    // In real implementation, this would be API calls
    const updateStep = (
      stepId: string,
      status: 'in-progress' | 'completed' | 'error',
      stepProgress?: number
    ) => {
      setSteps((prev) =>
        prev.map((step) =>
          step.id === stepId ? { ...step, status, progress: stepProgress } : step
        )
      )
    }

    try {
      // Step 1: Upload
      updateStep('1', 'in-progress', 0)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        updateStep('1', 'in-progress', i)
        setProgress(i * 0.2)
      }
      updateStep('1', 'completed')

      // Step 2: Processing
      setGenerationStatus('processing')
      updateStep('2', 'in-progress', 0)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 150))
        updateStep('2', 'in-progress', i)
        setProgress(20 + i * 0.2)
      }
      updateStep('2', 'completed')

      // Step 3: Generating
      updateStep('3', 'in-progress', 0)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        updateStep('3', 'in-progress', i)
        setProgress(40 + i * 0.2)
      }
      updateStep('3', 'completed')

      // Step 4: Optimizing
      updateStep('4', 'in-progress', 0)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        updateStep('4', 'in-progress', i)
        setProgress(60 + i * 0.2)
      }
      updateStep('4', 'completed')

      // Step 5: Creating output
      updateStep('5', 'in-progress', 0)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        updateStep('5', 'in-progress', i)
        setProgress(80 + i * 0.2)
      }
      updateStep('5', 'completed')

      // Complete
      setProgress(100)
      setGenerationStatus('completed')

      // Set mock result
      setResult({
        id: '1',
        name: selectedFile.name.replace(/\.[^/.]+$/, '_pattern.dxf'),
        imageUrl: undefined, // In real app, this would be from API
        downloadUrl: '#',
        fileSize: 1024 * 256, // 256 KB
        format: 'dxf',
        createdAt: new Date().toISOString(),
      })
    } catch (error) {
      setGenerationStatus('error')
    }
  }

  // Handle parameter form submission
  const handleParameterSubmit = async (data: any) => {
    console.log('Parameter form submitted:', data)
    // Similar to file upload handling
    if (selectedFile) {
      await handleFileUpload()
    }
  }

  // Reset to start over
  const handleStartOver = () => {
    setInputType('3d-mesh')
    setSelectedFile(null)
    setGenerationStatus('idle')
    setProgress(0)
    setResult(null)
    setSteps([
      { id: '1', title: 'Uploading file', status: 'pending' },
      { id: '2', title: 'Processing 3D model', status: 'pending' },
      { id: '3', title: 'Generating patterns', status: 'pending' },
      { id: '4', title: 'Optimizing layout', status: 'pending' },
      { id: '5', title: 'Creating output file', status: 'pending' },
    ])
  }

  const isProcessing = generationStatus === 'uploading' || generationStatus === 'processing'

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Pattern Generator
              </h1>
              <p className="mt-1 text-slate-600">
                Generate 2D patterns from 3D models or images using AI
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Input Type Selection */}
            {generationStatus === 'idle' && (
              <>
                <div>
                  <h2 className="mb-4 text-lg font-semibold text-slate-900">
                    1. Select Input Type
                  </h2>
                  <InputSelector
                    selectedType={inputType}
                    onSelectType={setInputType}
                  />
                </div>

                {/* File Upload */}
                {(inputType === '3d-mesh' || inputType === 'image') && (
                  <div>
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">
                      2. Upload File
                    </h2>
                    <FileUploader
                      accept={getAcceptTypes()}
                      onFileSelect={setSelectedFile}
                      selectedFile={selectedFile}
                    />
                  </div>
                )}

                {/* Parameters */}
                <div>
                  <h2 className="mb-4 text-lg font-semibold text-slate-900">
                    3. Configure Parameters
                  </h2>
                  <ParameterForm onSubmit={handleParameterSubmit} />
                </div>

                {/* Generate Button */}
                {(inputType === '3d-mesh' || inputType === 'image') && (
                  <Button
                    onClick={handleFileUpload}
                    disabled={!selectedFile}
                    className="w-full"
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Pattern
                  </Button>
                )}
              </>
            )}

            {/* Progress */}
            {generationStatus !== 'idle' && generationStatus !== 'completed' && (
              <GenerationProgress
                status={generationStatus}
                progress={progress}
                steps={steps}
              />
            )}

            {/* Start Over Button */}
            {generationStatus === 'completed' && (
              <Button onClick={handleStartOver} variant="outline" className="w-full">
                Start Over
              </Button>
            )}
          </div>

          {/* Right Column - Result */}
          <div>
            {result && generationStatus === 'completed' && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                  Generated Pattern
                </h2>
                <ResultPreview
                  result={result}
                  onSave={(result) => {
                    console.log('Save to library:', result)
                    // In real app, this would save to backend
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
