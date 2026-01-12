import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Camera, X, Image as ImageIcon } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PhotoUploadProps {
  onPhotosUploaded: (photoUrls: string[]) => void
  maxPhotos?: number
}

export function PhotoUpload({ onPhotosUploaded, maxPhotos = 5 }: PhotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (files.length + selectedFiles.length > maxPhotos) {
      toast.error(`Máximo ${maxPhotos} fotos permitidas`)
      return
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen válida`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} es muy grande (máx 5MB)`)
        return false
      }
      return true
    })

    const newUrls = validFiles.map(file => URL.createObjectURL(file))
    
    setSelectedFiles(prev => [...prev, ...validFiles])
    setPreviewUrls(prev => [...prev, ...newUrls])
  }

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast.error('Selecciona al menos una foto')
      return
    }

    onPhotosUploaded(previewUrls)
    toast.success(`${selectedFiles.length} foto(s) agregada(s)`)
    setSelectedFiles([])
    setPreviewUrls([])
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => document.getElementById('photo-upload')?.click()}
        >
          <Camera size={18} className="mr-2" />
          Seleccionar Fotos
        </Button>
        {previewUrls.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
          >
            <ImageIcon size={18} className="mr-2" />
            Ver ({previewUrls.length})
          </Button>
        )}
      </div>
      
      <input
        id="photo-upload"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previewUrls.slice(0, 3).map((url, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={14} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      )}

      {previewUrls.length > 0 && (
        <Button
          type="button"
          onClick={handleUpload}
          className="w-full"
        >
          Agregar {selectedFiles.length} foto(s)
        </Button>
      )}

      {showPreview && (
        <Dialog open onOpenChange={setShowPreview}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Vista Previa de Fotos</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="w-full rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  >
                    <X size={18} weight="bold" />
                  </button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
