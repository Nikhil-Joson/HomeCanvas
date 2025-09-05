/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useCallback, useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react';

interface ImageUploaderProps {
  id: string;
  label?: string;
  onFileSelect: (file: File) => void;
  imageUrl: string | null;
  isDropZone?: boolean;
  onProductDrop?: (position: {x: number, y: number}, relativePosition: { xPercent: number; yPercent: number; }) => void;
  persistedOrbPosition?: { x: number; y: number } | null;
  showDebugButton?: boolean;
  onDebugClick?: () => void;
  isTouchHovering?: boolean;
  touchOrbPosition?: { x: number; y: number } | null;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const WarningIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const UndoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.293 8.293a1 1 0 011.414 0L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        <path d="M10.707 3.293a1 1 0 010 1.414L8.414 7H13a1 1 0 110 2H8.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
    </svg>
);

const RedoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.293 8.293a1 1 0 011.414 0L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        <path d="M9.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L11.586 9H7a1 1 0 110-2h4.586L9.293 4.707a1 1 0 010-1.414z" />
    </svg>
);


const ImageUploader = forwardRef<HTMLImageElement, ImageUploaderProps>(({ id, label, onFileSelect, imageUrl, isDropZone = false, onProductDrop, persistedOrbPosition, showDebugButton, onDebugClick, isTouchHovering = false, touchOrbPosition = null, onUndo, onRedo, canUndo, canRedo }, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [orbPosition, setOrbPosition] = useState<{x: number, y: number} | null>(null);
  const [fileTypeError, setFileTypeError] = useState<string | null>(null);

  // Expose the internal imgRef to the parent component via the forwarded ref
  useImperativeHandle(ref, () => imgRef.current as HTMLImageElement);
  
  useEffect(() => {
    if (!imageUrl) {
      setFileTypeError(null);
    }
  }, [imageUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setFileTypeError('For best results, please use PNG, JPG, JPEG, or WEBP formats.');
      } else {
        setFileTypeError(null);
      }
      onFileSelect(file);
    }
  };
  
  // A shared handler for both click and drop placements.
  const handlePlacement = useCallback((clientX: number, clientY: number) => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container || !onProductDrop) return;

    const containerRect = container.getBoundingClientRect();
    
    // 1. Calculate the click/drop position relative to the container.
    const dropX = clientX - containerRect.left;
    const dropY = clientY - containerRect.top;

    // 2. Calculate the rendered image's dimensions and position inside the container,
    // accounting for the letterboxing caused by 'object-contain'.
    const { naturalWidth, naturalHeight } = img;
    const { width: containerWidth, height: containerHeight } = containerRect;

    const imageAspectRatio = naturalWidth / naturalHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let renderedWidth, renderedHeight, offsetX, offsetY;
    if (imageAspectRatio > containerAspectRatio) {
      renderedWidth = containerWidth;
      renderedHeight = containerWidth / imageAspectRatio;
      offsetX = 0;
      offsetY = (containerHeight - renderedHeight) / 2;
    } else {
      renderedHeight = containerHeight;
      renderedWidth = containerHeight * imageAspectRatio;
      offsetX = (containerWidth - renderedWidth) / 2;
      offsetY = 0;
    }
    
    // 3. Translate the container-relative coords to image-relative coords.
    const imageX = dropX - offsetX;
    const imageY = dropY - offsetY;

    // 4. Check if the action was outside the image area (in the padding).
    if (imageX < 0 || imageX > renderedWidth || imageY < 0 || imageY > renderedHeight) {
      console.warn("Action was outside the image boundaries.");
      return;
    }
    
    // 5. Calculate percentage-based position for the AI.
    const xPercent = (imageX / renderedWidth) * 100;
    const yPercent = (imageY / renderedHeight) * 100;

    // 6. Pass both container-relative and image-relative positions up.
    onProductDrop({ x: dropX, y: dropY }, { xPercent, yPercent });
  }, [onProductDrop]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDropZone) {
      handlePlacement(e.clientX, e.clientY);
    } else {
      inputRef.current?.click();
    }
  };
  
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDraggingOver(true);
      if (isDropZone && onProductDrop) {
          const rect = event.currentTarget.getBoundingClientRect();
          setOrbPosition({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
          });
      }
  }, [isDropZone, onProductDrop]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDraggingOver(false);
      setOrbPosition(null);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDraggingOver(false);
      setOrbPosition(null);

      if (isDropZone && onProductDrop) {
          // Case 1: A product is being dropped onto the scene
          handlePlacement(event.clientX, event.clientY);
      } else {
          // Case 2: A file is being dropped to be uploaded
          const file = event.dataTransfer.files?.[0];
          if (file && file.type.startsWith('image/')) {
              const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
              if (!allowedTypes.includes(file.type)) {
                  setFileTypeError('For best results, please use PNG, JPG, JPEG, or WEBP formats.');
              } else {
                  setFileTypeError(null);
              }
              onFileSelect(file);
          }
      }
  }, [isDropZone, onProductDrop, onFileSelect, handlePlacement]);
  
  const showHoverState = isDraggingOver || isTouchHovering;
  const currentOrbPosition = orbPosition || touchOrbPosition;
  
  const cursorClass = isDropZone ? 'cursor-crosshair' : 'cursor-pointer';

  const uploaderClasses = `w-full aspect-video bg-zinc-100 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors duration-300 relative overflow-hidden ${cursorClass} ${
      showHoverState ? 'border-blue-500 bg-blue-50 is-dragging-over'
    : isDropZone ? 'border-zinc-400'
    : 'border-zinc-300 hover:border-blue-500'
  }`;

  return (
    <div className="flex flex-col items-center w-full">
      {label && <h3 className="text-xl font-semibold mb-4 text-zinc-700">{label}</h3>}
      <div
        ref={containerRef}
        className={uploaderClasses}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-dropzone-id={id}
      >
        <input
          type="file"
          id={id}
          ref={inputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />
        {imageUrl ? (
          <>
            <img 
              ref={imgRef}
              src={imageUrl} 
              alt={label || 'Uploaded Scene'} 
              className="w-full h-full object-contain pointer-events-none"
            />
            {persistedOrbPosition && (
                <div 
                    className="drop-orb" 
                    style={{ 
                        left: persistedOrbPosition.x, 
                        top: persistedOrbPosition.y,
                        opacity: 1,
                        transform: 'translate(-50%, -50%) scale(1)',
                        transition: 'none', // Appear instantly without animation
                    }}
                ></div>
            )}
            <div 
                className="drop-orb" 
                style={{ 
                    left: currentOrbPosition ? currentOrbPosition.x : -9999, 
                    top: currentOrbPosition ? currentOrbPosition.y : -9999 
                }}
            ></div>
            {isDropZone && (
              <div className="absolute top-2 right-2 z-20 flex gap-1 bg-black/60 p-1 rounded-lg backdrop-blur-sm shadow-lg">
                <button type="button" onClick={(e) => { e.stopPropagation(); onUndo?.(); }} disabled={!canUndo} className="p-1.5 text-white hover:bg-white/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Undo"><UndoIcon/></button>
                <button type="button" onClick={(e) => { e.stopPropagation(); onRedo?.(); }} disabled={!canRedo} className="p-1.5 text-white hover:bg-white/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Redo"><RedoIcon/></button>
              </div>
            )}
            {showDebugButton && onDebugClick && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDebugClick();
                    }}
                    className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-opacity-80 transition-all z-20 shadow-lg"
                    aria-label="Show debug view"
                >
                    Debug
                </button>
            )}
          </>
        ) : (
          <div className="text-center text-zinc-500 p-4">
            <UploadIcon />
            <p>Click to upload or drag & drop</p>
          </div>
        )}
      </div>
      {fileTypeError && (
        <div className="w-full mt-2 text-sm text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-lg p-3 flex items-center animate-fade-in" role="alert">
            <WarningIcon />
            <span>{fileTypeError}</span>
        </div>
      )}
    </div>
  );
});

export default ImageUploader;
