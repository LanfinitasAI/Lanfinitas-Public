import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  PerspectiveCamera,
  Grid,
  Environment,
  ContactShadows,
  useGLTF,
  Center,
  Stage,
} from '@react-three/drei'
import * as THREE from 'three'
import { Controls3D } from './Controls3D'
import { useThreeJS } from '@/hooks/useThreeJS'

export interface Viewer3DProps {
  modelUrl?: string
  modelType?: 'gltf' | 'obj' | 'fbx'
  textureUrl?: string
  showGrid?: boolean
  showShadows?: boolean
  backgroundColor?: string
  cameraPosition?: [number, number, number]
  onModelLoad?: () => void
  onModelError?: (error: Error) => void
  className?: string
}

/**
 * Model component that loads and displays a 3D model
 */
function Model({
  url,
  textureUrl,
  onLoad,
  onError,
}: {
  url: string
  textureUrl?: string
  onLoad?: () => void
  onError?: (error: Error) => void
}) {
  const { scene } = useGLTF(url)
  const modelRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (scene) {
      onLoad?.()

      // Apply texture if provided
      if (textureUrl && modelRef.current) {
        const loader = new THREE.TextureLoader()
        loader.load(
          textureUrl,
          (texture) => {
            modelRef.current?.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshStandardMaterial({
                  map: texture,
                })
              }
            })
          },
          undefined,
          (error) => {
            console.error('Error loading texture:', error)
          }
        )
      }
    }
  }, [scene, textureUrl, onLoad])

  return (
    <Center>
      <primitive ref={modelRef} object={scene} />
    </Center>
  )
}

/**
 * Scene content component
 */
function SceneContent({
  modelUrl,
  textureUrl,
  showGrid,
  showShadows,
  onModelLoad,
  onModelError,
}: {
  modelUrl?: string
  textureUrl?: string
  showGrid: boolean
  showShadows: boolean
  onModelLoad?: () => void
  onModelError?: (error: Error) => void
}) {
  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />

      {/* Environment */}
      <Environment preset="studio" />

      {/* Grid Helper */}
      {showGrid && <Grid args={[10, 10]} />}

      {/* Model */}
      {modelUrl ? (
        <Suspense fallback={<LoadingBox />}>
          <Model
            url={modelUrl}
            textureUrl={textureUrl}
            onLoad={onModelLoad}
            onError={onModelError}
          />
        </Suspense>
      ) : (
        <DefaultModel />
      )}

      {/* Shadows */}
      {showShadows && <ContactShadows opacity={0.5} scale={10} blur={1} far={10} />}

      {/* Orbit Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={20}
        makeDefault
      />
    </>
  )
}

/**
 * Default fallback model (cube)
 */
function DefaultModel() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6366f1" metalness={0.3} roughness={0.4} />
    </mesh>
  )
}

/**
 * Loading placeholder
 */
function LoadingBox() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#94a3b8" wireframe />
    </mesh>
  )
}

/**
 * Main 3D Viewer Component
 */
export function Viewer3D({
  modelUrl,
  modelType = 'gltf',
  textureUrl,
  showGrid: initialShowGrid = true,
  showShadows = true,
  backgroundColor = '#f8fafc',
  cameraPosition = [0, 0, 5],
  onModelLoad,
  onModelError,
  className = '',
}: Viewer3DProps) {
  const [showGrid, setShowGrid] = useState(initialShowGrid)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'g':
          setShowGrid((prev) => !prev)
          break
        case 'f':
          handleToggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full ${className}`}
      style={{ backgroundColor }}
    >
      <Canvas
        shadows
        camera={{ position: cameraPosition, fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <SceneContent
          modelUrl={modelUrl}
          textureUrl={textureUrl}
          showGrid={showGrid}
          showShadows={showShadows}
          onModelLoad={onModelLoad}
          onModelError={onModelError}
        />
      </Canvas>

      {/* Controls Overlay */}
      <ControlsOverlay
        showGrid={showGrid}
        isFullscreen={isFullscreen}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Loading Indicator */}
      {modelUrl && (
        <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 px-3 py-2 text-sm text-slate-600 shadow-lg">
          Loading model...
        </div>
      )}
    </div>
  )
}

/**
 * Controls overlay component
 */
function ControlsOverlay({
  showGrid,
  isFullscreen,
  onToggleGrid,
  onToggleFullscreen,
}: {
  showGrid: boolean
  isFullscreen: boolean
  onToggleGrid: () => void
  onToggleFullscreen: () => void
}) {
  const { takeScreenshot } = useThreeJS()

  return (
    <Controls3D
      onReset={() => {
        // Reset will be handled by OrbitControls
        console.log('Reset camera')
      }}
      onScreenshot={() => takeScreenshot('3d-model.png')}
      onToggleFullscreen={onToggleFullscreen}
      onToggleGrid={onToggleGrid}
      isFullscreen={isFullscreen}
      showGrid={showGrid}
    />
  )
}
