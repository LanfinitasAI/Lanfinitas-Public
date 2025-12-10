import { useCallback, useRef, useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export interface UseThreeJSReturn {
  takeScreenshot: (filename?: string) => void
  resetCamera: () => void
  fitToView: (object: THREE.Object3D) => void
}

/**
 * Custom hook for Three.js utilities
 */
export function useThreeJS(): UseThreeJSReturn {
  const { gl, camera, scene } = useThree()
  const originalCameraPosition = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 5))
  const originalCameraTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0))

  // Save initial camera position
  const saveCameraPosition = useCallback(() => {
    originalCameraPosition.current.copy(camera.position)
    if (camera instanceof THREE.PerspectiveCamera || camera instanceof THREE.OrthographicCamera) {
      // Store look-at target
      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)
      originalCameraTarget.current.copy(camera.position).add(direction)
    }
  }, [camera])

  /**
   * Take a screenshot of the current scene
   */
  const takeScreenshot = useCallback(
    (filename: string = 'screenshot.png') => {
      try {
        // Render the scene
        gl.render(scene, camera)

        // Get the canvas data URL
        const dataURL = gl.domElement.toDataURL('image/png')

        // Create download link
        const link = document.createElement('a')
        link.href = dataURL
        link.download = filename
        link.click()
      } catch (error) {
        console.error('Error taking screenshot:', error)
      }
    },
    [gl, scene, camera]
  )

  /**
   * Reset camera to original position
   */
  const resetCamera = useCallback(() => {
    camera.position.copy(originalCameraPosition.current)
    if (camera instanceof THREE.PerspectiveCamera || camera instanceof THREE.OrthographicCamera) {
      camera.lookAt(originalCameraTarget.current)
    }
  }, [camera])

  /**
   * Fit object to view by adjusting camera position
   */
  const fitToView = useCallback(
    (object: THREE.Object3D) => {
      // Calculate bounding box
      const box = new THREE.Box3().setFromObject(object)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())

      // Get the max dimension
      const maxDim = Math.max(size.x, size.y, size.z)
      const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov : 50
      const fovRad = (fov * Math.PI) / 180

      // Calculate camera distance
      let cameraDistance = Math.abs(maxDim / 2 / Math.tan(fovRad / 2))
      cameraDistance *= 1.5 // Add some padding

      // Position camera
      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)
      const newPosition = center.clone().sub(direction.multiplyScalar(cameraDistance))

      camera.position.copy(newPosition)
      camera.lookAt(center)

      // Update controls target if using OrbitControls
      camera.updateProjectionMatrix()
    },
    [camera]
  )

  return {
    takeScreenshot,
    resetCamera,
    fitToView,
  }
}

/**
 * Load texture helper
 */
export function useTextureLoader(url: string | null): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    if (!url) {
      setTexture(null)
      return
    }

    const loader = new THREE.TextureLoader()
    loader.load(
      url,
      (loadedTexture) => {
        setTexture(loadedTexture)
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error)
        setTexture(null)
      }
    )
  }, [url])

  return texture
}
