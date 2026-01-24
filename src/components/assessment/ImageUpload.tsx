'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
}: ImageUploadProps) {
  const [dragError, setDragError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: unknown[]) => {
      setDragError(null);

      if (fileRejections.length > 0) {
        setDragError('Some files were rejected. Please upload only images (JPG, PNG, WebP).');
        return;
      }

      const newImages = [...images, ...acceptedFiles].slice(0, maxImages);
      onImagesChange(newImages);
    },
    [images, onImagesChange, maxImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: maxImages - images.length,
    disabled: disabled || images.length >= maxImages,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50',
          disabled && 'opacity-50 cursor-not-allowed',
          images.length >= maxImages && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-4">
          <div
            className={cn(
              'p-4 rounded-full',
              isDragActive ? 'bg-blue-100' : 'bg-gray-100'
            )}
          >
            {isDragActive ? (
              <Upload className="w-8 h-8 text-blue-600" />
            ) : (
              <Camera className="w-8 h-8 text-gray-400" />
            )}
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700">
              {isDragActive ? 'Drop your images here' : 'Upload car damage photos'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop or click to select up to {maxImages} images
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports: JPG, PNG, WebP
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || images.length >= maxImages}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Select Images
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {dragError && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{dragError}</p>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Uploaded Images ({images.length}/{maxImages})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {images.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Damage photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs truncate">{file.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Tips for best results:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Take photos in good lighting conditions</li>
          <li>• Capture multiple angles of the damage</li>
          <li>• Include close-up shots of specific damage areas</li>
          <li>• Include a wider shot showing the affected area in context</li>
        </ul>
      </div>
    </div>
  );
}
