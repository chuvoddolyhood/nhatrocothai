/**
 * CameraCapture Component
 * Provides camera access and image capture functionality for meter reading
 */

import { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Camera, X, RotateCcw, Lightbulb } from "lucide-react";

export function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // 'environment' = rear camera

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  /**
   * Start camera stream
   */
  async function startCamera() {
    try {
      setError(null);
      setIsReady(false);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true);
        };
      }
    } catch (err) {
      console.error("[CameraCapture] Error accessing camera:", err);

      let errorMessage = "Không thể truy cập camera.";

      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        errorMessage =
          "Bạn cần cấp quyền truy cập camera để sử dụng tính năng này.";
      } else if (
        err.name === "NotFoundError" ||
        err.name === "DevicesNotFoundError"
      ) {
        errorMessage = "Không tìm thấy camera trên thiết bị.";
      } else if (
        err.name === "NotReadableError" ||
        err.name === "TrackStartError"
      ) {
        errorMessage = "Camera đang được sử dụng bởi ứng dụng khác.";
      }

      setError(errorMessage);
    }
  }

  /**
   * Stop camera stream
   */
  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsReady(false);
    }
  }

  /**
   * Capture image from video
   */
  function captureImage() {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `meter_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          onCapture(file);
        }
      },
      "image/jpeg",
      0.9,
    );
  }

  /**
   * Toggle between front and rear camera
   */
  function toggleCamera() {
    stopCamera();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }

  /**
   * Handle cancel
   */
  function handleCancel() {
    stopCamera();
    if (onCancel) {
      onCancel();
    }
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col" style={{ zIndex: 1100 }}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={handleCancel}
            className="text-white p-2 hover:bg-white/20 rounded-full transition"
            aria-label="Hủy"
            type="button"
          >
            <X size={24} />
          </button>

          <h2 className="text-white text-lg font-semibold">
            Chụp đồng hồ điện/nước
          </h2>

          <button
            onClick={toggleCamera}
            className="text-white p-2 hover:bg-white/20 rounded-full transition"
            aria-label="Đổi camera"
            type="button"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>

      {/* Video Stream */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-red-50 text-red-800 p-6 rounded-lg max-w-md text-center">
              <p className="font-semibold mb-2">⚠️ Lỗi Camera</p>
              <p className="text-sm mb-4">{error}</p>
              <button
                onClick={startCamera}
                type="button"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Guide Overlay */}
            {isReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  {/* Guide Frame */}
                  <div className="border-4 border-white/50 rounded-lg w-80 h-48 relative">
                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400" />

                    {/* Center text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-white text-sm bg-black/50 px-3 py-1 rounded">
                        Căn đồng hồ vào khung
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Tips Section */}
      <div className="absolute left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent p-6 pb-8" style={{ bottom: '160px' }}>
        <div className="flex items-start gap-2 text-white/90">
          <Lightbulb size={20} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p>• Đảm bảo ánh sáng tốt</p>
            <p>• Giữ điện thoại thẳng và ổn định</p>
            <p>• Đưa camera gần đồng hồ để rõ số</p>
          </div>
        </div>
      </div>

      {/* Capture Button - padding để tránh navigation bar (70px) */}
      <div className="absolute left-0 right-0 bottom-0 z-10 p-6 bg-gradient-to-t from-black/80 to-transparent" style={{ paddingBottom: '90px' }}>
        <div className="flex justify-center">
          <button
            onClick={captureImage}
            disabled={!isReady || error}
            type="button"
            className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold 
                     flex items-center gap-2 hover:bg-gray-100 transition
                     disabled:bg-gray-400 disabled:cursor-not-allowed
                     shadow-lg"
            aria-label="Chụp ảnh"
          >
            <Camera size={24} />
            Chụp ảnh
          </button>
        </div>
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default CameraCapture;

CameraCapture.propTypes = {
  onCapture: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

CameraCapture.defaultProps = {
  onCancel: null,
};

/**
 * Fallback file input for browsers without camera support
 */
export function CameraFallback({ onCapture, onCancel }) {
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Chọn ảnh đồng hồ</h3>

      <p className="text-gray-600 text-sm mb-4">
        Trình duyệt của bạn không hỗ trợ camera. Vui lòng chọn ảnh từ thư viện.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          type="button"
          className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg 
                   hover:bg-blue-700 transition font-semibold"
        >
          📷 Chọn ảnh
        </button>

        <button
          onClick={onCancel}
          type="button"
          className="px-4 py-3 rounded-lg border border-gray-300 
                   hover:bg-gray-50 transition"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

CameraFallback.propTypes = {
  onCapture: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

CameraFallback.defaultProps = {
  onCancel: null,
};
