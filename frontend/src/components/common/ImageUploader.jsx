import api from '../../utils/api'
import toast from 'react-hot-toast'
import { useState, useRef, useCallback } from 'react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function ImageUploader({ images, onChange, max = 5 }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [dragIndex, setDragIndex] = useState(null)
  const [manualUrl, setManualUrl] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const fileInputRef = useRef(null)

  const validateFiles = useCallback((files) => {
    const remaining = max - images.length

    if (remaining <= 0) {
      toast.error(`You can upload up to ${max} images`)
      return []
    }

    const selected = Array.from(files).slice(0, remaining)
    const validFiles = []

    if (files.length > remaining) {
      toast.error(`Only ${remaining} more image${remaining === 1 ? '' : 's'} can be added`)
    }

    selected.forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: only JPG, PNG, and WebP files are allowed`)
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: file size must be 5MB or less`)
        return
      }

      validFiles.push(file)
    })

    return validFiles
  }, [images.length, max])

  const uploadFiles = useCallback(async (fileList) => {
    const validFiles = validateFiles(fileList)

    if (!validFiles.length) {
      return
    }

    const formData = new FormData()
    validFiles.forEach((file) => formData.append('images', file))

    setIsUploading(true)

    try {
      const { data } = await api.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      onChange([...images, ...(data.images || [])].slice(0, max))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload images')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [images, max, onChange, validateFiles])

  const handleFileSelect = useCallback((event) => {
    if (event.target.files?.length) {
      uploadFiles(event.target.files)
    }
  }, [uploadFiles])

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    setIsDragging(false)

    if (event.dataTransfer.files?.length) {
      uploadFiles(event.dataTransfer.files)
    }
  }, [uploadFiles])

  const handleRemove = useCallback((index) => {
    onChange(images.filter((_, imageIndex) => imageIndex !== index))
  }, [images, onChange])

  const handleManualAdd = useCallback(() => {
    const trimmed = manualUrl.trim()

    if (!trimmed) {
      toast.error('Enter an image URL first')
      return
    }

    if (images.length >= max) {
      toast.error(`You can upload up to ${max} images`)
      return
    }

    try {
      new URL(trimmed)
    } catch {
      toast.error('Please enter a valid image URL')
      return
    }

    onChange([...images, { url: trimmed, public_id: '' }])
    setManualUrl('')
  }, [images, manualUrl, max, onChange])

  const handleDragStart = useCallback((index) => {
    setDragIndex(index)
  }, [])

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
  }, [])

  const handleImageDrop = useCallback((index) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      return
    }

    const reordered = [...images]
    const [movedImage] = reordered.splice(dragIndex, 1)
    reordered.splice(index, 0, movedImage)

    onChange(reordered)
    setDragIndex(null)
  }, [dragIndex, images, onChange])

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      <button
        type="button"
        onClick={openFilePicker}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`w-full rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <div className="space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            {isUploading ? (
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            ) : (
              <span className="text-2xl text-blue-600">+</span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {isUploading ? 'Uploading images...' : 'Drag and drop images here'}
            </p>
            <p className="text-sm text-gray-500">
              Click to browse. JPG, PNG, or WebP up to 5MB each.
            </p>
          </div>
        </div>
      </button>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={`${image.public_id || image.url}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleImageDrop(index)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
            >
              <img src={image.url} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                  MAIN
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-lg text-white opacity-0 transition group-hover:opacity-100"
                aria-label={`Remove image ${index + 1}`}
              >
                &times;
              </button>
            </div>
          ))}

          {images.length < max && (
            <button
              type="button"
              onClick={openFilePicker}
              className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-sm font-medium text-gray-600 transition hover:border-blue-400 hover:text-blue-600"
            >
              + Add more
            </button>
          )}
        </div>
      )}

      <div className="rounded-xl border border-gray-200">
        <button
          type="button"
          onClick={() => setShowManualInput((value) => !value)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-800"
        >
          <span>Or enter URL manually</span>
          <span>{showManualInput ? '-' : '+'}</span>
        </button>

        {showManualInput && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="url"
                value={manualUrl}
                onChange={(event) => setManualUrl(event.target.value)}
                placeholder="https://example.com/product-image.jpg"
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={handleManualAdd}
                className="btn-primary whitespace-nowrap"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
