/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect, useState } from 'react';
import { StagedProduct } from './types';

interface PlacementGizmoProps {
    bounds: DOMRect;
    product: StagedProduct;
    onUpdate: (updates: Partial<StagedProduct>) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const CancelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PlacementGizmo: React.FC<PlacementGizmoProps> = ({ bounds, product, onUpdate, onConfirm, onCancel }) => {
    const gizmoRef = useRef<HTMLDivElement>(null);
    const [activeDrag, setActiveDrag] = useState<'move' | 'scale' | null>(null);
    const [startDragInfo, setStartDragInfo] = useState({ x: 0, y: 0, productX: 0, productY: 0, scale: 1 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, type: 'move' | 'scale') => {
        e.preventDefault();
        e.stopPropagation();
        setActiveDrag(type);
        
        setStartDragInfo({
            x: e.clientX,
            y: e.clientY,
            productX: product.x,
            productY: product.y,
            scale: product.scale,
        });
    };
    
    // Unifying mouse and touch events
    useEffect(() => {
        const handleInteractionMove = (clientX: number, clientY: number) => {
            if (!activeDrag) return;
            
            const dx = clientX - startDragInfo.x;
            const dy = clientY - startDragInfo.y;

            if (activeDrag === 'move') {
                onUpdate({ x: startDragInfo.productX + dx, y: startDragInfo.productY + dy });
            } else if (activeDrag === 'scale') {
                const SENSITIVITY = 0.005;
                const scaleChange = dx * SENSITIVITY;
                const newScale = startDragInfo.scale + scaleChange;
                onUpdate({ scale: Math.max(0.1, newScale) });
            }
        };

        const handleInteractionEnd = () => {
            setActiveDrag(null);
        };
        
        const handleMouseMove = (e: MouseEvent) => handleInteractionMove(e.clientX, e.clientY);
        const handleTouchMove = (e: TouchEvent) => handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY);
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleInteractionEnd);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleInteractionEnd);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleInteractionEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleInteractionEnd);
        };
    }, [activeDrag, startDragInfo, onUpdate]);


    const gizmoStyle: React.CSSProperties = {
        top: product.y,
        left: product.x,
        width: product.width,
        transform: `translate(-50%, -50%) scale(${product.scale})`,
    };

    return (
        <div
            ref={gizmoRef}
            className="placement-gizmo"
            style={gizmoStyle}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
            onTouchStart={(e) => {
                 // Allow touches on handles/actions to work independently
                if (e.target === gizmoRef.current) {
                    e.preventDefault();
                    setActiveDrag('move');
                    setStartDragInfo({
                        x: e.touches[0].clientX, y: e.touches[0].clientY,
                        productX: product.x, productY: product.y,
                        scale: product.scale,
                    });
                }
            }}
        >
            <div className="placement-gizmo__content">
                <img
                    src={product.imageUrl}
                    alt="Staged product"
                    className="placement-gizmo__image"
                />
                <div
                    className="placement-gizmo__handle placement-gizmo__handle--scale"
                    onMouseDown={(e) => handleMouseDown(e, 'scale')}
                    onTouchStart={(e) => {
                        e.stopPropagation();
                        setActiveDrag('scale');
                        setStartDragInfo({
                            x: e.touches[0].clientX, y: e.touches[0].clientY,
                            productX: product.x, productY: product.y,
                            scale: product.scale,
                        });
                    }}
                />
            </div>
            <div 
                className="placement-gizmo__actions"
                onMouseDown={(e) => e.stopPropagation()} // Prevent move drag on buttons
                onTouchStart={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onConfirm}
                    className="placement-gizmo__button bg-green-500 hover:bg-green-600"
                    aria-label="Confirm placement"
                >
                    <ConfirmIcon />
                </button>
                <button
                    onClick={onCancel}
                    className="placement-gizmo__button bg-red-500 hover:bg-red-600"
                    aria-label="Cancel placement"
                >
                    <CancelIcon />
                </button>
            </div>
        </div>
    );
};

export default PlacementGizmo;