import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/lib/utils'

interface FileUploaderProps {
  accept: Record<string, string[]>
  maxSize?: number
  onFileSelect: (file: File) => void
  selectedFile?: File | null
  disabled?: boolean
}

export function FileUploader({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  onFileSelect,
  selectedFile,
  disabled,
}: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      multiple: false,
      disabled,
    })

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFileSelect(null as unknown as File)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
            isDragActive
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50',
            disabled && 'cursor-not-allowed opacity-50',
            selectedFile && 'border-green-400 bg-green-50'
          )}
        >
          <input {...getInputProps()} />

          {selectedFile ? (
            <div className="text-center" onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <File className="h-8 w-8 text-green-600" />
              </div>
              <p className="mb-2 font-medium text-slate-900">
                {selectedFile.name}
              </p>
              <p className="mb-4 text-sm text-slate-600">
                {formatFileSize(selectedFile.size)}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFile}
                disabled={disabled}
              >
                <X className="mr-2 h-4 w-4" />
                Remove File
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Upload className="h-8 w-8 text-slate-400" />
              </div>
              <p className="mb-2 text-sm font-medium text-slate-900">
                {isDragActive
                  ? 'Drop the file here'
                  : 'Drag & drop a file here, or click to browse'}
              </p>
              <p className="text-xs text-slate-500">
                {Object.values(accept)
                  .flat()
                  .join(', ')}{' '}
                (Max {formatFileSize(maxSize)})
              </p>
            </div>
          )}
        </div>

        {/* File Rejection Errors */}
        {fileRejections.length > 0 && (
          <div className="mt-4 rounded-lg bg-red-50 p-3">
            <p className="text-sm font-medium text-red-800">
              File upload failed:
            </p>
            <ul className="mt-1 list-inside list-disc text-sm text-red-700">
              {fileRejections.map((rejection, index) => (
                <li key={index}>
                  {rejection.errors.map((error) => error.message).join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
