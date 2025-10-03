"use client"
import React, { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAllSteps } from "@/lib/hooks/useStep"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, CheckCircle, Camera, Upload, X, RotateCcw, Video, Play, Square } from "lucide-react"

interface FormData {
  [key: string]: any;
}

interface StaticStepButton {
  id: string;
  label: string;
  type: 'image' | 'video';
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

  const { data: allSteps = [] } = useAllSteps('cv')
  const staticStepNumber = allSteps.length > 0 ? allSteps[allSteps.length - 1].sortOrder + 1 : 1

  const [formData, setFormData] = useState<FormData>({})
  const [activeUpload, setActiveUpload] = useState<StaticStepButton | null>(null)
  const [uploadMode, setUploadMode] = useState<'camera' | 'file' | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [currentCamera, setCurrentCamera] = useState<'front' | 'back'>('front')
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideos, setRecordedVideos] = useState<string[]>([])
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)

  const fromStep = searchParams.get('fromStep')

  const completedSteps = React.useMemo(() => {
    const completed = new Set<number>()
    for (let i = 0; i < allSteps.length; i++) completed.add(i)
    return completed
  }, [allSteps.length])

  const updateFormData = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const goToStep = (stepIndex: number) => {
    router.push(`/cv-create?step=${stepIndex}`)
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
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: currentCamera === 'front' ? 'user' : 'environment' },
          audio: false,
        })
        setCameraStream(stream)
      } catch {
        toast({ variant: "destructive", description: "Kamera açıla bilmədi. Brauzerdə icazə verin." })
        setUploadMode(null)
      }
    })()
  }, [uploadMode, currentCamera])

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      const v = videoRef.current
      v.srcObject = cameraStream as any
      v.muted = true
      v.playsInline = true
      v.play().catch(() => {})
    }
  }, [cameraStream])

  useEffect(() => () => stopCamera(), [])

  const switchCamera = async () => {
    stopCamera()
    setCurrentCamera(p => (p === 'front' ? 'back' : 'front'))
    setUploadMode('camera') // trigger effect to reopen
  }

  const handleFileUploadClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,.pdf,.doc,.docx'
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setUploadedFile(file)
        toast({ description: `Fayl seçildi: ${file.name}` })
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

  const staticStepButtons: StaticStepButton[] = [
    { id: 'button-1', label: 'Vəsiqənin şəkili', type: 'image' },
    { id: 'button-2', label: 'Namizədin şəkili', type: 'image' },
    { id: 'button-3', label: 'Arxafonu təmizlənilməmiş şəkil', type: 'image' },
    { id: 'button-4', label: 'Profil şəkli', type: 'image' },
    { id: 'button-5', label: 'Əlavə sertifikatlar', type: 'image' },
    { id: 'button-6', label: 'Təlim sertifikat şəkili', type: 'image' },
    { id: 'button-7', label: 'Video çək', type: 'video' }
  ]

  // Unmount-da kameranı dayandır
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

                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-red-500 border-red-500 text-white">
                    <span className="text-sm font-medium">{staticStepNumber}</span>
                  </div>
                  <span className="ml-2 text-sm font-medium text-red-600">
                    Statik Step {staticStepNumber}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staticStepButtons.map((button) => (
                  <Button
                    key={button.id}
                    onClick={() => { openFor(button) }}
                    className="h-20 flex flex-col items-center justify-center gap-2 p-4"
                    variant="outline"
                  >
                    {button.type === 'video' ? (
                      <Video className="w-6 h-6" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                    <span className="text-sm font-medium text-center">{button.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center pt-6">
            <Button
              variant="outline"
              onClick={() => goToStep(allSteps.length - 1)}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Əvvəlki</span>
            </Button>

            <Button
              onClick={() => {
                toast({ description: "CV uğurla yaradıldı!" })
                router.push("/cv")
              }}
              style={{ backgroundColor: "green" }}
              className="bg-green-600 hover:bg-green-700"
            >
              Tamamla
            </Button>
          </div>
        </div>
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
                 >
                   <RotateCcw className="w-4 h-4 mr-2" />
                   Kamera dəyiş
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
                   toast({ description: "Şəkillər uğurla yükləndi!" })
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
                 muted 
                 className="w-full h-[500px] object-cover" 
               />
               
               {/* Camera Switch Button - Top Right */}
               <div className="absolute top-4 right-4">
                 <Button
                   onClick={switchCamera}
                   size="sm"
                   className="bg-black/70 text-white hover:bg-black/80 backdrop-blur-sm"
                 >
                   <RotateCcw className="w-4 h-4 mr-2" />
                   Kamera dəyiş
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
                   toast({ description: "Videolar uğurla yükləndi!" })
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
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80">
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <Button
              onClick={() => setSelectedImageIndex(null)}
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-black/50 text-white hover:bg-black/70 z-10"
            >
              <X className="h-4 w-4" />
            </Button>
            <img 
              src={capturedImages[selectedImageIndex]} 
              alt={`Enlarged ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                Şəkil {selectedImageIndex + 1} / {capturedImages.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
