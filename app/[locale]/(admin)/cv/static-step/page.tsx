"use client"
import React, { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAllSteps } from "@/lib/hooks/useStep"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, ChevronRight, CheckCircle, Camera, Upload, X, RotateCcw, Video, Play, Square, Loader2 } from "lucide-react"
import { cvService } from "@/lib/services/cvServices"
import AlertDialogComponent from "@/components/AlertDiolog/AlertDiolog"

interface FormData {
  [key: string]: any;
}

interface StaticStepButton {
  id: string;
  label: string;
  type: 'image' | 'video';
  fileType: number; // ResumeFileType enum value
}

/** SINGLE MODAL IMPLEMENTATION (auto-close problemi həll) */
function BasicModal({ open, children, title, onClose }: { open: boolean; children: React.ReactNode; title?: string; onClose: () => void }) {
  if (!open) return null
  return (
    <div aria-modal role="dialog" className="fixed inset-0 z-[999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative z-[1000] max-w-5xl w-[95vw] bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-xl font-semibold text-gray-900">{title}</h3>}
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function StaticStepPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const { data: allStepsRaw = [] } = useAllSteps('cv', 1)
  // Filter only active steps
  const allSteps = allStepsRaw.filter(step => step.isActive === true)

  const [formData, setFormData] = useState<FormData>({})
  const [activeUpload, setActiveUpload] = useState<StaticStepButton | null>(null)
  const [uploadMode, setUploadMode] = useState<'camera' | 'file' | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [currentCamera, setCurrentCamera] = useState<'front' | 'back'>('front')
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideos, setRecordedVideos] = useState<string[]>([])
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [savedMedia, setSavedMedia] = useState<Record<string, { images: string[], videos: string[], files: File[] }>>({})
  const [existingMedia, setExistingMedia] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [mediaToDelete, setMediaToDelete] = useState<{ buttonId: string; type: 'image' | 'video' | 'file'; index: number } | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)

  const fromStep = searchParams.get('fromStep')
  const resumeId = searchParams.get('resumeId')

  const completedSteps = React.useMemo(() => {
    const completed = new Set<number>()
    for (let i = 0; i < allSteps.length; i++) completed.add(i)
    return completed
  }, [allSteps.length])

  // Load existing media when resumeId is present
  useEffect(() => {
    const loadExistingMedia = async () => {
      if (resumeId) {
        setIsLoadingMedia(true)
        try {
          const response = await cvService.getCvMedia(Number(resumeId))
          const mediaFiles = response?.responseValue || []
          setExistingMedia(mediaFiles)
          
          // Group media by type for display
          const groupedMedia: Record<string, { images: string[], videos: string[], files: File[] }> = {}
          
          mediaFiles.forEach((media: any) => {
            const buttonId = `button-${media.fileType}` // Map fileType to button ID (1-5)
            if (!groupedMedia[buttonId]) {
              groupedMedia[buttonId] = { images: [], videos: [], files: [] }
            }
            
            // ResumeFileType: 1=CandidatesImage, 2=CandidatesVideo, 3=CandidatesLicense, 4=CandidatesCertificate, 5=CandidatesTrainingCertificate
            if (media.fileType === 2) {
              // Video
              groupedMedia[buttonId].videos.push(media.fileUrl)
            } else {
              // All other types are images (1, 3, 4, 5)
              groupedMedia[buttonId].images.push(media.fileUrl)
            }
          })
          
          setSavedMedia(groupedMedia)
        } catch (error) {
          console.error('Error loading media:', error)
          toast({ 
            variant: "destructive", 
            description: "Media yüklənə bilmədi" 
          })
        } finally {
          setIsLoadingMedia(false)
        }
      }
    }

    loadExistingMedia()
  }, [resumeId])

  const updateFormData = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(device => device.kind === 'videoinput')
      setAvailableCameras(cameras)
      
      if (cameras.length > 0 && !selectedCameraId) {
        setSelectedCameraId(cameras[0].deviceId)
      }
    } catch (error) {
      console.error('Error getting cameras:', error)
    }
  }

  const openFor = (btn: StaticStepButton) => {
    setActiveUpload(btn)
    setUploadMode(null)
    setCapturedImages([])
    setUploadedFile(null)
  }
  const closeModal = () => {
    stopCamera()
    stopRecording()
    setActiveUpload(null)
    setUploadMode(null)
    setCapturedImages([])
    setUploadedFile(null)
    setSelectedImageIndex(null)
    setRecordedVideos([])
    setRecordedChunks([])
  }

  const stopCamera = () => {
    try {
      cameraStream?.getTracks().forEach(t => t.stop())
    } catch {}
    setCameraStream(null)
  }

  useEffect(() => {
    if (uploadMode !== 'camera') return
    
    const startCamera = async () => {
      try {
        // Stop existing stream first
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop())
        }
        
        // Get available cameras first
        await getAvailableCameras()
        
        // Use selected camera or default
        const constraints: MediaStreamConstraints = {
          video: selectedCameraId 
            ? { 
                deviceId: { exact: selectedCameraId },
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            : { 
                facingMode: currentCamera === 'front' ? 'user' : 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
              },
          audio: true,
        }
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        setCameraStream(stream)
      } catch (error) {
        console.error('Camera error:', error)
        toast({ 
          variant: "destructive", 
          description: `Kamera açıla bilmədi: ${error instanceof Error ? error.message : 'Naməlum xəta'}` 
        })
        setUploadMode(null)
      }
    }
    
    startCamera()
  }, [uploadMode, currentCamera, selectedCameraId])

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      const v = videoRef.current
      v.srcObject = cameraStream as any
      v.muted = false
      v.playsInline = true
      v.play().catch(() => {})
    }
  }, [cameraStream])

  useEffect(() => () => stopCamera(), [])

  const switchCamera = async () => {
    try {
      // Stop current camera
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
        setCameraStream(null)
      }
      
      // Get available cameras if not already done
      if (availableCameras.length === 0) {
        await getAvailableCameras()
      }
      
      // Find next camera
      const currentIndex = availableCameras.findIndex(cam => cam.deviceId === selectedCameraId)
      const nextIndex = (currentIndex + 1) % availableCameras.length
      const nextCamera = availableCameras[nextIndex]
      
      if (nextCamera) {
        setSelectedCameraId(nextCamera.deviceId)
        
        // Wait a bit for cleanup
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Start new camera
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              deviceId: { exact: nextCamera.deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: true,
          })
          setCameraStream(stream)
          toast({ description: `Kamera dəyişdirildi: ${nextCamera.label || `Kamera ${nextIndex + 1}`}` })
        } catch (error) {
          console.error('Camera switch error:', error)
          toast({ 
            variant: "destructive", 
            description: `Kamera dəyişdirilə bilmədi: ${error instanceof Error ? error.message : 'Naməlum xəta'}` 
          })
        }
      } else {
        toast({ 
          variant: "destructive", 
          description: "Başqa kamera tapılmadı" 
        })
      }
    } catch (error) {
      console.error('Switch camera error:', error)
    }
  }

  const handleFileUploadClick = () => {
    if (!activeUpload) return
    
    const input = document.createElement('input')
    input.type = 'file'
    // Set accept based on button type
    input.accept = activeUpload.type === 'video' ? 'video/*' : 'image/*,.pdf,.doc,.docx'
    input.multiple = true
    input.onchange = e => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      if (files.length > 0 && activeUpload) {
        // Save files to savedMedia
        setSavedMedia(prev => ({
          ...prev,
          [activeUpload.id]: {
            images: prev[activeUpload.id]?.images || [],
            videos: prev[activeUpload.id]?.videos || [],
            files: [...(prev[activeUpload.id]?.files || []), ...files]
          }
        }))
        toast({ description: `${files.length} fayl seçildi` })
        closeModal()
      }
    }
    input.click()
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg')
    setCapturedImages(prev => [...prev, imageData])
  }

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index))
  }

  const startRecording = () => {
    if (!cameraStream) return
    
    const chunks: Blob[] = []
    setRecordedChunks(chunks)
    
    const recorder = new MediaRecorder(cameraStream, {
      mimeType: 'video/webm;codecs=vp9'
    })
    
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }
    
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const videoUrl = URL.createObjectURL(blob)
      setRecordedVideos(prev => [...prev, videoUrl])
      setRecordedChunks([])
    }
    
    recorder.start()
    setMediaRecorder(recorder)
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const removeVideo = (index: number) => {
    setRecordedVideos(prev => {
      const newVideos = prev.filter((_, i) => i !== index)
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index])
      return newVideos
    })
  }

  const handleDeleteClick = (buttonId: string, type: 'image' | 'video' | 'file', index: number) => {
    setMediaToDelete({ buttonId, type, index })
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!mediaToDelete) return
    
    const { buttonId, type, index } = mediaToDelete
    await removeSavedMedia(buttonId, type, index)
    
    setDeleteConfirmOpen(false)
    setMediaToDelete(null)
  }

  const removeSavedMedia = async (buttonId: string, type: 'image' | 'video' | 'file', index: number) => {
    const current = savedMedia[buttonId]
    if (!current) return

    let mediaUrl = ''
    if (type === 'image') {
      mediaUrl = current.images[index]
    } else if (type === 'video') {
      mediaUrl = current.videos[index]
    }

    // Check if this is an existing media (URL from server)
    const isExistingMedia = mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))
    
    if (isExistingMedia && resumeId) {
      // Find the media ID from existingMedia
      const mediaItem = existingMedia.find(m => m.fileUrl === mediaUrl)
      if (mediaItem) {
        try {
          await cvService.deleteResumeFile(mediaItem.id)
          toast({ description: "Media uğurla silindi" })
          
          // Remove from existingMedia
          setExistingMedia(prev => prev.filter(m => m.id !== mediaItem.id))
        } catch (error) {
          console.error('Error deleting media:', error)
          toast({ 
            variant: "destructive", 
            description: "Media silinə bilmədi" 
          })
          return
        }
      }
    }

    // Remove from local state
    setSavedMedia(prev => {
      const updated = { ...prev[buttonId] }
      
      if (type === 'image') {
        updated.images = current.images.filter((_, i) => i !== index)
      } else if (type === 'video') {
        if (!isExistingMedia) {
          URL.revokeObjectURL(current.videos[index])
        }
        updated.videos = current.videos.filter((_, i) => i !== index)
      } else if (type === 'file') {
        updated.files = current.files.filter((_, i) => i !== index)
      }
      
      return { ...prev, [buttonId]: updated }
    })
  }

  const getTotalMediaCount = (buttonId: string) => {
    const media = savedMedia[buttonId]
    if (!media) return 0
    return media.images.length + media.videos.length + media.files.length
  }

  const goToStep = (stepIndex: number) => {
    if (resumeId) {
      router.push(`/cv-create?step=${stepIndex}&editId=${resumeId}`)
    } else {
      router.push(`/cv-create?step=${stepIndex}`)
    }
  }

  const goToLastStep = () => {
    const lastStepIndex = allSteps.length - 1
    if (resumeId) {
      router.push(`/cv-create?step=${lastStepIndex}&editId=${resumeId}`)
    } else {
      router.push(`/cv-create?step=${lastStepIndex}`)
    }
  }

  // ResumeFileType enum mapping
  const staticStepButtons: StaticStepButton[] = [
    { id: 'button-1', label: 'Namizədin şəkili', type: 'image', fileType: 1 },        
    { id: 'button-3', label: 'Vəsiqənin şəkili', type: 'image', fileType: 3 },        
    { id: 'button-4', label: 'Əlavə sertifikatlar', type: 'image', fileType: 4 },     
    { id: 'button-5', label: 'Təlim sertifikat şəkili', type: 'image', fileType: 5 }, 
    { id: 'button-2', label: 'Namizədin videosu', type: 'video', fileType: 2 },       
  ]

  // Convert base64 to Blob
  const base64ToBlob = async (base64: string, mimeType: string): Promise<Blob> => {
    const response = await fetch(base64)
    return response.blob()
  }

  // Convert blob URL to Blob
  const urlToBlob = async (url: string): Promise<Blob> => {
    const response = await fetch(url)
    return response.blob()
  }

  const handleSubmitMedia = async () => {
    if (!resumeId) {
      toast({ 
        variant: "destructive", 
        description: "Resume ID tapılmadı. Əvvəlcə CV yaradın." 
      })
      return
    }

    // Check if there's any NEW media to upload (exclude existing URLs)
    const hasNewMedia = Object.values(savedMedia).some(media => {
      const hasNewImages = media.images.some(img => 
        !img.startsWith('http://') && !img.startsWith('https://')
      )
      const hasNewVideos = media.videos.some(vid => 
        !vid.startsWith('http://') && !vid.startsWith('https://')
      )
      return hasNewImages || hasNewVideos || media.files.length > 0
    })

    if (!hasNewMedia) {
      toast({ 
        description: "CV uğurla tamamlandı!" 
      })
      router.push("/cv")
      return
    }

    setIsSubmitting(true)

    try {
      const allFiles: { file: File | Blob; fileType: number }[] = []

      // Process all saved media with correct fileType from button definition
      for (const [buttonId, media] of Object.entries(savedMedia)) {
        // Find the button to get its fileType
        const button = staticStepButtons.find(btn => btn.id === buttonId)
        if (!button) continue

        const fileType = button.fileType

        // Process images
        for (const imageBase64 of media.images) {
          // Check if it's a URL (existing media) or base64 (new capture)
          if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://')) {
            // Skip existing media, don't re-upload
            continue
          }
          const blob = await base64ToBlob(imageBase64, 'image/jpeg')
          const file = new File([blob], `image-${Date.now()}.jpg`, { type: 'image/jpeg' })
          allFiles.push({ file, fileType })
        }

        // Process videos
        for (const videoUrl of media.videos) {
          // Check if it's an existing media URL
          if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
            // Skip existing media, don't re-upload
            continue
          }
          const blob = await urlToBlob(videoUrl)
          const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' })
          allFiles.push({ file, fileType })
        }

        // Process uploaded files
        for (const uploadedFile of media.files) {
          allFiles.push({ file: uploadedFile, fileType })
        }
      }

      // Upload new files (create endpoint can handle both new and existing resumes)
      if (allFiles.length > 0) {
        console.log(`Uploading ${allFiles.length} media files for Resume ID: ${resumeId}`)
        await cvService.createCvMedia(Number(resumeId), allFiles)
        toast({ 
          description: existingMedia.length > 0 
            ? `${allFiles.length} yeni media faylı əlavə edildi!` 
            : `${allFiles.length} media faylı uğurla yükləndi!` 
        })
      } else {
        // No new files to upload
        toast({ 
          description: "CV uğurla tamamlandı!" 
        })
      }

      // Navigate to CV list
      router.push("/cv")
    } catch (error) {
      console.error('Media upload error:', error)
      toast({ 
        variant: "destructive", 
        description: "Media yükləmə zamanı xəta baş verdi." 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  React.useEffect(() => {
    return () => { try { stopCamera() } catch {} }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">CV Yaratma</h1>

            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                {allSteps.map((step, index) => {
                  const isCompleted = completedSteps.has(index)
                  return (
                    <div key={step.id} className="flex items-center">
                      <button
                        onClick={() => goToStep(index)}
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                          isCompleted
                            ? 'bg-red-500 border-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-200 border-gray-300 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </button>
                      <span
                        className={`ml-2 text-sm font-medium ${
                          isCompleted ? 'text-red-600' : 'text-gray-600'
                        }`}
                      >
                        {step.translations?.[0]?.title || `Step ${index + 1}`}
                      </span>
                      <div className="w-8 h-0.5 bg-gray-300 mx-4" />
                    </div>
                  )
                })}

                {/* Media Step - Without Number, only icon */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-red-500 border-red-500 text-white">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-red-600">
                    Media
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingMedia ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Media yüklənir...</p>
            </div>
          </div>
        ) : (
        <div className="space-y-8">
          {/* Media Summary Card */}
          {Object.keys(savedMedia).length > 0 && (
            <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Yüklənmiş Media</h3>
                    <p className="text-sm text-gray-600">Sənədləriniz uğurla yükləndi</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-2 text-2xl font-bold text-blue-600">
                        <Camera className="w-6 h-6" />
                        {Object.values(savedMedia).reduce((sum, media) => sum + media.images.length, 0)}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Şəkil</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-2 text-2xl font-bold text-purple-600">
                        <Video className="w-6 h-6" />
                        {Object.values(savedMedia).reduce((sum, media) => sum + media.videos.length, 0)}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Video</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-2 text-2xl font-bold text-green-600">
                        <Upload className="w-6 h-6" />
                        {Object.values(savedMedia).reduce((sum, media) => sum + media.files.length, 0)}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Fayl</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-none bg-transparent p-0">
            <CardHeader className="px-0 pt-0 pb-2">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Sənəd Yükləmə
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Aşağıdakı düymələrdən birini seçərək sənəd yükləyin
              </p>
            </CardHeader>
            <CardContent className="space-y-6 px-0 pb-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staticStepButtons.map((button) => {
                  const mediaCount = getTotalMediaCount(button.id)
                  const hasMedia = mediaCount > 0
                  
                  return (
                    <div key={button.id} className="space-y-3">
                      <Button
                        onClick={() => { openFor(button) }}
                        className={`w-full h-24 flex flex-col items-center justify-center gap-2 p-4 transition-all duration-200 ${
                          hasMedia 
                            ? 'border-2 border-green-500 bg-green-50 hover:bg-green-100 shadow-md' 
                            : 'border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                        variant="outline"
                      >
                        {button.type === 'video' ? (
                          <Video className={`w-7 h-7 ${hasMedia ? 'text-green-600' : 'text-gray-600'}`} />
                        ) : (
                          <Upload className={`w-7 h-7 ${hasMedia ? 'text-green-600' : 'text-gray-600'}`} />
                        )}
                        <span className={`text-sm font-semibold text-center ${hasMedia ? 'text-green-700' : 'text-gray-700'}`}>
                          {button.label}
                        </span>
                        {hasMedia && (
                          <Badge className="bg-green-600 hover:bg-green-600 text-white text-xs px-2">
                            {mediaCount} fayl
                          </Badge>
                        )}
                      </Button>
                      
                      {/* Media Preview Cards */}
                      {hasMedia && (
                        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50 shadow-sm">
                          <CardContent className="p-4 space-y-3">
                            {/* Images Preview */}
                            {savedMedia[button.id]?.images.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                  <Camera className="w-3 h-3" />
                                  Şəkillər ({savedMedia[button.id].images.length})
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                  {savedMedia[button.id].images.map((img, idx) => (
                                    <div key={idx} className="relative group">
                                      <img 
                                        src={img} 
                                        alt={`${button.label} ${idx + 1}`}
                                        className="w-full h-20 object-cover rounded-lg border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() => setSelectedImageIndex(idx)}
                                      />
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteClick(button.id, 'image', idx)
                                        }}
                                        size="sm"
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Videos Preview */}
                            {savedMedia[button.id]?.videos.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  Videolar ({savedMedia[button.id].videos.length})
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {savedMedia[button.id].videos.map((video, idx) => (
                                    <div key={idx} className="relative group cursor-pointer">
                                      <video 
                                        src={video} 
                                        className="w-full h-20 object-cover rounded-lg border-2 border-white shadow-sm"
                                        preload="metadata"
                                        onClick={() => setSelectedVideoUrl(video)}
                                      />
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteClick(button.id, 'video', idx)
                                        }}
                                        size="sm"
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                      <div 
                                        className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg pointer-events-none"
                                      >
                                        <Play className="w-8 h-8 text-white opacity-80" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Files Preview */}
                            {savedMedia[button.id]?.files.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                  <Upload className="w-3 h-3" />
                                  Fayllar ({savedMedia[button.id].files.length})
                                </h4>
                                <div className="space-y-1">
                                  {savedMedia[button.id].files.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white rounded px-2 py-1 text-xs border">
                                      <span className="truncate flex-1">{file.name}</span>
                                      <Button
                                        onClick={() => handleDeleteClick(button.id, 'file', idx)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center pt-6">
            <Button
              variant="outline"
              onClick={goToLastStep}
              className="flex items-center space-x-2"
              disabled={isSubmitting}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Əvvəlki</span>
            </Button>

            <Button
              onClick={handleSubmitMedia}
              disabled={isSubmitting}
              style={{ backgroundColor: "green" }}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Yüklənir..." : "Tamamla"}
            </Button>
          </div>
        </div>
        )}
      </div>

      {/* Modallar */}
      <BasicModal
        open={!!activeUpload}
        title={
          activeUpload
            ? `${activeUpload.label} - ${uploadMode === 'camera' ? 'Kamera' : uploadMode === 'file' ? 'Fayl' : 'Sənəd Yüklə'}`
            : undefined
        }
        onClose={closeModal}
      >
        {!uploadMode && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setUploadMode('camera')}
                className="flex items-center gap-2 h-20"
                variant="outline"
              >
                <Camera className="w-6 h-6" />
                <span>Kamera ilə çək</span>
              </Button>
              <Button
                onClick={handleFileUploadClick}
                className="flex items-center gap-2 h-20"
                variant="outline"
              >
                <Upload className="w-6 h-6" />
                <span>Kompyuterdən yüklə</span>
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={closeModal}>Bağla</Button>
            </div>
          </div>
        )}

         {uploadMode === 'camera' && activeUpload?.type !== 'video' && (
           <div className="space-y-6">
             {/* Camera Preview - Large Center */}
             <div className="relative bg-gray-100 rounded-xl overflow-hidden">
               <video 
                 ref={videoRef} 
                 autoPlay 
                 playsInline 
                 muted 
                 className="w-full h-[500px] object-cover" 
               />
               
               {/* Camera Switch Button - Top Right */}
               <div className="absolute top-4 right-4">
                 <Button
                   onClick={switchCamera}
                   size="sm"
                   className="bg-black/70 text-white hover:bg-black/80 backdrop-blur-sm"
                   disabled={availableCameras.length <= 1}
                 >
                   <RotateCcw className="w-4 h-4 mr-2" />
                   Kamera dəyiş ({availableCameras.length})
                 </Button>
               </div>
             </div>

             {/* Capture Button */}
             <div className="flex justify-center">
               <Button 
                 onClick={capturePhoto} 
                 size="lg"
                 className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full"
               >
                 <Camera className="w-5 h-5 mr-2" />
                 Şəkil çək
               </Button>
             </div>

             {/* Captured Images Gallery */}
             {capturedImages.length > 0 && (
               <div className="space-y-4">
                 <h4 className="text-lg font-medium text-gray-700">Çəkilmiş şəkillər ({capturedImages.length})</h4>
                 <div className="grid grid-cols-4 gap-3">
                   {capturedImages.map((image, index) => (
                     <div key={index} className="relative group cursor-pointer">
                       <img 
                         src={image} 
                         alt={`Captured ${index + 1}`} 
                         className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
                         onDoubleClick={() => setSelectedImageIndex(index)}
                         title="Böyütmək üçün iki dəfə klikləyin"
                       />
                       <Button
                         onClick={() => removeImage(index)}
                         size="sm"
                         variant="destructive"
                         className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <X className="h-3 w-3" />
                       </Button>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Action Buttons */}
             <div className="flex justify-center gap-4 pt-4">
               <Button
                 onClick={() => {
                   if (activeUpload) {
                     setSavedMedia(prev => ({
                       ...prev,
                       [activeUpload.id]: {
                         images: [...(prev[activeUpload.id]?.images || []), ...capturedImages],
                         videos: prev[activeUpload.id]?.videos || [],
                         files: prev[activeUpload.id]?.files || []
                       }
                     }))
                   }
                   toast({ description: "Şəkillər uğurla yadda saxlanıldı!" })
                   closeModal()
                 }}
                 disabled={capturedImages.length === 0}
                 className="bg-green-600 hover:bg-green-700 text-white px-6"
               >
                 Təsdiq et
               </Button>
               <Button 
                 variant="outline" 
                 onClick={closeModal}
                 className="px-6"
               >
                 Bağla
               </Button>
             </div>
           </div>
         )}

         {uploadMode === 'camera' && activeUpload?.type === 'video' && (
           <div className="space-y-6">
             {/* Video Preview - Large Center */}
             <div className="relative bg-gray-100 rounded-xl overflow-hidden">
               <video 
                 ref={videoRef} 
                 autoPlay 
                 playsInline 
                 className="w-full h-[500px] object-cover" 
               />
               
               {/* Camera Switch Button - Top Right */}
               <div className="absolute top-4 right-4">
                 <Button
                   onClick={switchCamera}
                   size="sm"
                   className="bg-black/70 text-white hover:bg-black/80 backdrop-blur-sm"
                   disabled={availableCameras.length <= 1}
                 >
                   <RotateCcw className="w-4 h-4 mr-2" />
                   Kamera dəyiş ({availableCameras.length})
                 </Button>
               </div>

               {/* Recording Indicator */}
               {isRecording && (
                 <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                   <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                   <span className="text-sm font-medium">Qeyd edilir...</span>
                 </div>
               )}
             </div>

             {/* Recording Controls */}
             <div className="flex justify-center gap-4">
               {!isRecording ? (
                 <Button 
                   onClick={startRecording} 
                   size="lg"
                   className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full"
                 >
                   <Video className="w-5 h-5 mr-2" />
                   Video çəkməyə başla
                 </Button>
               ) : (
                 <Button 
                   onClick={stopRecording} 
                   size="lg"
                   className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-full"
                 >
                   <Square className="w-5 h-5 mr-2" />
                   Video çəkməni dayandır
                 </Button>
               )}
             </div>

             {/* Recorded Videos Gallery */}
             {recordedVideos.length > 0 && (
               <div className="space-y-4">
                 <h4 className="text-lg font-medium text-gray-700">Çəkilmiş videolar ({recordedVideos.length})</h4>
                 <div className="grid grid-cols-2 gap-4">
                   {recordedVideos.map((video, index) => (
                     <div key={index} className="relative group">
                       <video 
                         src={video} 
                         controls
                         className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                         preload="metadata"
                       />
                       <Button
                         onClick={() => removeVideo(index)}
                         size="sm"
                         variant="destructive"
                         className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <X className="h-3 w-3" />
                       </Button>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Action Buttons */}
             <div className="flex justify-center gap-4 pt-4">
               <Button
                 onClick={() => {
                   if (activeUpload) {
                     setSavedMedia(prev => ({
                       ...prev,
                       [activeUpload.id]: {
                         images: prev[activeUpload.id]?.images || [],
                         videos: [...(prev[activeUpload.id]?.videos || []), ...recordedVideos],
                         files: prev[activeUpload.id]?.files || []
                       }
                     }))
                   }
                   toast({ description: "Videolar uğurla yadda saxlanıldı!" })
                   closeModal()
                 }}
                 disabled={recordedVideos.length === 0}
                 className="bg-green-600 hover:bg-green-700 text-white px-6"
               >
                 Təsdiq et
               </Button>
               <Button 
                 variant="outline" 
                 onClick={closeModal}
                 className="px-6"
               >
                 Bağla
               </Button>
             </div>
           </div>
         )}
      </BasicModal>

      {/* Enlarged Image Modal */}
      {selectedImageIndex !== null && (() => {
        // Find all images from savedMedia
        const allImages: string[] = []
        Object.values(savedMedia).forEach(media => {
          allImages.push(...media.images)
        })
        
        return (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="relative max-w-5xl max-h-[90vh] w-full p-4">
              <Button
                onClick={() => setSelectedImageIndex(null)}
                variant="ghost"
                size="sm"
                className="absolute top-6 right-6 h-10 w-10 p-0 bg-white/20 text-white hover:bg-white/30 z-10 rounded-full"
              >
                <X className="h-5 w-5"style={{ color: "red" }} />
              </Button>
              
              {/* Navigation Buttons */}
              {allImages.length > 1 && (
                <>
                  <Button
                    onClick={() => setSelectedImageIndex(prev => prev! > 0 ? prev! - 1 : allImages.length - 1)}
                    variant="ghost"
                    size="sm"
                    className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 p-0 bg-white/20 text-white hover:bg-white/30 z-10 rounded-full"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    onClick={() => setSelectedImageIndex(prev => prev! < allImages.length - 1 ? prev! + 1 : 0)}
                    variant="ghost"
                    size="sm"
                    className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 p-0 bg-white/20 text-white hover:bg-white/30 z-10 rounded-full"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
              
              <img 
                src={allImages[selectedImageIndex]} 
                alt={`Enlarged ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-xl mx-auto shadow-2xl"
              />
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  Şəkil {selectedImageIndex + 1} / {allImages.length}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Video Preview Modal */}
      {selectedVideoUrl && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative max-w-5xl max-h-[90vh] w-full p-4">
            <Button
              onClick={() => setSelectedVideoUrl(null)}
              variant="ghost"
              size="sm"
              className="absolute top-6 right-6 h-10 w-10 p-0 bg-white/20 text-white hover:bg-white/30 z-10 rounded-full"
            >
              <X className="h-5 w-5" style={{ color: "red" }} />
            </Button>
            
            <video 
              src={selectedVideoUrl}
              controls
              autoPlay
              className="max-w-full max-h-full rounded-xl mx-auto shadow-2xl"
              style={{ maxHeight: '80vh' }}
            />
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                Video
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialogComponent
        open={deleteConfirmOpen}
        setOpen={setDeleteConfirmOpen}
        title="Media silmək"
        description="Bu medianı silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz."
        onCancel={() => {
          setDeleteConfirmOpen(false)
          setMediaToDelete(null)
        }}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
