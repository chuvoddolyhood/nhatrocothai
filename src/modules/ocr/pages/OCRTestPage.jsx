/**
 * OCR Test Page
 * Demo page for testing OCR functionality
 */

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { OCRMeterReading } from "../components/OCRMeterReading";

export function OCRTestPage() {
  const [selectedType, setSelectedType] = useState(null);
  const [results, setResults] = useState([]);

  const handleComplete = (data) => {
    console.log("[OCRTestPage] Completed:", data);

    const result = {
      id: Date.now(),
      timestamp: new Date().toLocaleString("vi-VN"),
      ...data,
    };

    setResults((prev) => [result, ...prev]);
    setSelectedType(null);
  };

  const handleCancel = () => {
    setSelectedType(null);
  };

  const clearResults = () => {
    setResults([]);
  };

  if (selectedType) {
    return (
      <OCRMeterReading
        meterType={selectedType}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    );
  }

  const getConfidenceClass = (confidence) => {
    if (confidence >= 0.85) {
      return "text-green-600";
    }

    if (confidence >= 0.7) {
      return "text-yellow-600";
    }

    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              type="button"
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">OCR Test Page</h1>
              <p className="text-sm text-gray-600">
                Test chức năng đọc số điện nước bằng camera
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setSelectedType("electric")}
            type="button"
            className="bg-gradient-to-br from-yellow-400 to-orange-500 
                     text-white p-8 rounded-2xl hover:shadow-lg transition
                     text-left"
          >
            <div className="text-5xl mb-3">⚡</div>
            <h2 className="text-2xl font-bold mb-2">Đồng hồ điện</h2>
            <p className="opacity-90">Chụp và đọc số điện</p>
          </button>

          <button
            onClick={() => setSelectedType("water")}
            type="button"
            className="bg-gradient-to-br from-blue-400 to-cyan-500 
                     text-white p-8 rounded-2xl hover:shadow-lg transition
                     text-left"
          >
            <div className="text-5xl mb-3">💧</div>
            <h2 className="text-2xl font-bold mb-2">Đồng hồ nước</h2>
            <p className="opacity-90">Chụp và đọc số nước</p>
          </button>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Kết quả OCR</h2>
              <button
                onClick={clearResults}
                type="button"
                className="text-sm text-red-600 hover:text-red-700"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {result.meterType === "electric"
                          ? "⚡ Điện"
                          : "💧 Nước"}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {result.timestamp}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {result.text}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {result.isEdited && "✏️ Đã chỉnh sửa"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-gray-600">Độ chính xác:</span>
                        <span
                          className={`ml-1 font-semibold ${getConfidenceClass(result.confidence)}`}
                        >
                          {Math.round(result.confidence * 100)}%
                        </span>
                      </div>

                      {result.originalText !== result.text && (
                        <div>
                          <span className="text-gray-600">Số gốc:</span>
                          <span className="ml-1 text-gray-500">
                            {result.originalText}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Debug Info */}
                  <details className="mt-3 text-xs">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      Chi tiết
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded overflow-auto text-xs">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            📝 Hướng dẫn sử dụng
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Chọn loại đồng hồ (điện hoặc nước)</li>
            <li>• Chụp ảnh đồng hồ trong điều kiện ánh sáng tốt</li>
            <li>• Căn đồng hồ vào khung hướng dẫn</li>
            <li>• Kiểm tra và chỉnh sửa kết quả nếu cần</li>
            <li>• Xác nhận để lưu kết quả</li>
          </ul>
        </div>

        {/* Technical Info */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            🔧 Thông tin kỹ thuật
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">OCR Engine:</span>
              <span className="ml-2 font-medium">Tesseract.js</span>
            </div>
            <div>
              <span className="text-gray-600">Image Processing:</span>
              <span className="ml-2 font-medium">OpenCV.js</span>
            </div>
            <div>
              <span className="text-gray-600">Preprocessing:</span>
              <span className="ml-2 font-medium">
                Grayscale, Contrast, Denoise
              </span>
            </div>
            <div>
              <span className="text-gray-600">Character Set:</span>
              <span className="ml-2 font-medium">Digits only (0-9)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OCRTestPage;
