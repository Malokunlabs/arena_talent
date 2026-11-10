"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { ProofMediaItem } from "@/services/proofService";

interface MediaLightboxModalProps {
  isOpen: boolean;
  items: ProofMediaItem[];
  initialIndex?: number;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export default function MediaLightboxModal({
  isOpen,
  items,
  initialIndex = 0,
  title,
  subtitle,
  onClose,
}: MediaLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(
    null,
  );
  const touchStartXRef = useRef<number | null>(null);
  const didDragRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      const safeIndex = Math.min(Math.max(initialIndex, 0), Math.max(items.length - 1, 0));
      setCurrentIndex(safeIndex);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex, items.length]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const goToIndex = useCallback(
    (nextIndex: number) => {
      if (items.length <= 1) return;
      const wrapped = (nextIndex + items.length) % items.length;
      setCurrentIndex(wrapped);
      resetZoom();
    },
    [items.length, resetZoom],
  );

  const goPrev = useCallback(() => {
    goToIndex(currentIndex - 1);
  }, [currentIndex, goToIndex]);

  const goNext = useCallback(() => {
    goToIndex(currentIndex + 1);
  }, [currentIndex, goToIndex]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(MAX_ZOOM, Number((prev + ZOOM_STEP).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const next = Math.max(MIN_ZOOM, Number((prev - ZOOM_STEP).toFixed(2)));
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      } else if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        resetZoom();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, goPrev, goNext, handleZoomIn, handleZoomOut, resetZoom]);

  if (!isOpen || items.length === 0) return null;

  const activeItem = items[currentIndex] ?? items[0];
  const isImage = activeItem.type !== "video";

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isImage || zoom <= 1) return;
    e.preventDefault();
    didDragRef.current = false;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      didDragRef.current = true;
    }
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (zoom > 1) {
      resetZoom();
    } else {
      setZoom(2);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isImage) return;
    if (e.ctrlKey || zoom > 1 || Math.abs(e.deltaY) > 0) {
      // Allow zoom via mouse wheel on image stage
      if (e.deltaY < 0) {
        setZoom((prev) => Math.min(MAX_ZOOM, Number((prev + 0.25).toFixed(2))));
      } else if (e.deltaY > 0) {
        setZoom((prev) => {
          const next = Math.max(MIN_ZOOM, Number((prev - 0.25).toFixed(2)));
          if (next <= 1) setPan({ x: 0, y: 0 });
          return next;
        });
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (zoom > 1 || items.length <= 1) return;
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || zoom > 1 || items.length <= 1) return;
    const endX = e.changedTouches[0]?.clientX;
    if (typeof endX !== "number") return;
    const delta = endX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(delta) > 45) {
      if (delta > 0) goPrev();
      else goNext();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/92 backdrop-blur-md flex flex-col select-none animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Media Viewer"
    >
      {/* Top Toolbar */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3.5 text-white shrink-0 border-b border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 flex items-center gap-3">
          {items.length > 1 && (
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-[12px] font-semibold tabular-nums shrink-0">
              {currentIndex + 1} / {items.length}
            </span>
          )}
          {(title || subtitle) && (
            <div className="min-w-0 hidden sm:block">
              {title && (
                <p className="text-[13.5px] font-semibold text-white truncate">
                  {title}
                </p>
              )}
              {subtitle && (
                <p className="text-[11.5px] text-white/65 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isImage && (
            <div className="flex items-center gap-1 bg-white/10 rounded-xl px-1.5 py-1 mr-1.5">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= MIN_ZOOM}
                title="Zoom out (-)"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/15 disabled:opacity-35 transition-colors cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="min-w-[44px] text-center text-[12px] font-medium tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= MAX_ZOOM}
                title="Zoom in (+)"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/15 disabled:opacity-35 transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              {zoom > 1 && (
                <button
                  type="button"
                  onClick={resetZoom}
                  title="Reset zoom (0)"
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close media viewer"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Main Media Stage */}
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden px-4 sm:px-14 py-4"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {items.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous media"
            className="absolute left-3 sm:left-5 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/55 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {activeItem.type === "video" ? (
          <div
            className="relative flex items-center justify-center max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              key={activeItem.url}
              src={activeItem.url}
              poster={activeItem.thumbnailUrl}
              controls
              autoPlay
              playsInline
              className="max-h-[76vh] max-w-[92vw] sm:max-w-[82vw] rounded-2xl shadow-2xl bg-black outline-none"
            />
          </div>
        ) : (
          <div
            onClick={handleImageClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative flex items-center justify-center max-w-full max-h-full ${
              zoom > 1
                ? isDragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : "cursor-zoom-in"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeItem.url}
              alt={title ? `${title} media ${currentIndex + 1}` : "Proof image"}
              draggable={false}
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
              }}
              className={`max-h-[76vh] max-w-[92vw] sm:max-w-[82vw] object-contain rounded-xl shadow-2xl ${
                isDragging ? "" : "transition-transform duration-150 ease-out"
              }`}
            />
          </div>
        )}

        {items.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next media"
            className="absolute right-3 sm:right-5 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/55 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scrollable Thumbnail Strip */}
      {items.length > 1 && (
        <div
          className="px-4 py-3 border-t border-white/10 flex items-center justify-center shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2.5 overflow-x-auto max-w-full py-1 px-2">
            {items.map((item, idx) => {
              const active = idx === currentIndex;
              return (
                <button
                  key={`${item.url}-${idx}`}
                  type="button"
                  onClick={() => goToIndex(idx)}
                  aria-label={`View media ${idx + 1}`}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    active
                      ? "border-[#A855F7] scale-105 shadow-[0_0_0_2px_rgba(168,85,247,0.35)]"
                      : "border-white/15 opacity-60 hover:opacity-100"
                  }`}
                >
                  {item.type === "video" ? (
                    <>
                      <video
                        src={item.url}
                        poster={item.thumbnailUrl}
                        muted
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute inset-0 bg-black/35 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </span>
                    </>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
