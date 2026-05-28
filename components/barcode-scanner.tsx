'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { X, Loader2, Flashlight, FlashlightOff } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { DecodeHintType } from '@zxing/library'

interface BarcodeScannerProps {
  onResult: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onResult, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [torchOn, setTorchOn] = useState(false)
  const [torchAvailable, setTorchAvailable] = useState(false)

  const toggleTorch = useCallback(async () => {
    if (!videoRef.current) return
    const stream = videoRef.current.srcObject as MediaStream | null
    if (!stream) return
    const track = stream.getVideoTracks()[0]
    if (!track) return
    const next = !torchOn
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] })
      setTorchOn(next)
    } catch {
      // torch not supported on this device
    }
  }, [torchOn])

  useEffect(() => {
    if (!videoRef.current) return

    const hints = new Map()
    hints.set(DecodeHintType.TRY_HARDER, true)

    const reader = new BrowserMultiFormatReader(hints)
    const controlsPromise = reader.decodeFromConstraints(
      {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet],
        },
      },
      videoRef.current,
      (result, _err, controls) => {
        if (result) {
          controls.stop()
          onResultRef.current(result.getText())
        }
      }
    )

    controlsPromise
      .then(() => {
        setLoading(false)
        const stream = videoRef.current?.srcObject as MediaStream | null
        if (stream) {
          const track = stream.getVideoTracks()[0]
          const caps = track?.getCapabilities?.() as Record<string, unknown> | undefined
          if (caps && 'torch' in caps) setTorchAvailable(true)
        }
      })
      .catch(() => {
        setLoading(false)
        setError('Camera non accessibile. Controlla i permessi.')
      })

    return () => {
      controlsPromise.then((c) => c.stop()).catch(() => {})
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 pt-safe-top">
        <p className="text-white font-semibold text-base">Scansiona codice a barre</p>
        <div className="flex items-center gap-2">
          {torchAvailable && (
            <button
              onClick={toggleTorch}
              className="p-2 rounded-full bg-white/10 text-white active:bg-white/20"
              title={torchOn ? 'Spegni torcia' : 'Accendi torcia'}
            >
              {torchOn ? <FlashlightOff className="h-5 w-5" /> : <Flashlight className="h-5 w-5" />}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 text-white active:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />

        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <p className="text-white text-center px-6">{error}</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-72 h-36 relative">
              <div className="absolute inset-0 border-2 border-white/20 rounded-lg" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
              <div className="absolute left-2 right-2 h-0.5 bg-emerald-400 animate-scan" />
            </div>
          </div>
        )}
      </div>

      <div className="p-5 pb-safe-bottom text-center">
        <p className="text-neutral-400 text-sm">
          Inquadra il codice a barre del prodotto
        </p>
      </div>
    </div>
  )
}
