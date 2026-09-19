/**
 * OCRVerification Component
 * Displays OCR result and allows user verification/correction
 */

import { useState } from "react";
import PropTypes from "prop-types";
import {
  CheckCircle,
  AlertTriangle,
  Camera,
  Edit2,
  Image as ImageIcon,
} from "lucide-react";

export function OCRVerification({
  result,
  onConfirm,
  onRetake,
  meterType = "electric", // 'electric' or 'water'
}) {
  const [editedValue, setEditedValue] = useState(result?.text ?? "");
  const [showOriginal, setShowOriginal] = useState(false);

  if (!result) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm({
      text: editedValue,
      confidence: result.confidence,
      isEdited: editedValue !== result.text,
      originalText: result.text,
      imageFile: result.imageFile,
    });
  };

  const handleValueChange = (e) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, "");
    setEditedValue(value);
  };

  const needsVerification =
    result.needsVerification || result.confidence < 0.85;
  const hasErrors = result.errors && result.errors.length > 0;

  const meterLabel = meterType === "electric" ? "điện" : "nước";
  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">
          Xác nhận chỉ số {meterLabel}
        </h3>
        <p className="text-gray-600 text-sm">
          Kiểm tra kỹ số liệu trước khi xác nhận
        </p>
      </div>

      {/* Image Preview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <ImageIcon size={16} />
            Ảnh đã chụp
          </label>
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            type="button"
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            {showOriginal ? "Hiện ảnh đã xử lý" : "Hiện ảnh gốc"}
          </button>
        </div>

        <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
          <img
            src={
              showOriginal ? result.originalImageUrl : result.processedImageUrl
            }
            alt="Captured meter"
            className="w-full h-auto"
          />

          {result.processingTime && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {result.processingTime}ms
            </div>
          )}
        </div>
      </div>

      {/* OCR Result */}
      <div className="mb-6">
        <label
          htmlFor="meter-reading"
          className="text-sm font-medium text-gray-700 mb-2 block"
        >
          Chỉ số đọc được
        </label>

        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={editedValue}
            onChange={handleValueChange}
            className={`w-full px-4 py-3 text-2xl font-mono border-2 rounded-lg
                      focus:outline-none focus:ring-2 transition
                      ${
                        needsVerification
                          ? "border-yellow-400 focus:ring-yellow-400 bg-yellow-50"
                          : "border-green-400 focus:ring-green-400 bg-green-50"
                      }`}
            placeholder="Nhập chỉ số"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Edit2 size={20} className="text-gray-400" />
          </div>
        </div>

        {/* Confidence Score */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {needsVerification ? (
              <AlertTriangle size={16} className="text-yellow-600" />
            ) : (
              <CheckCircle size={16} className="text-green-600" />
            )}
            <span className="text-sm text-gray-700">
              Độ chính xác: {confidencePercent}%
            </span>
          </div>

          {needsVerification && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Cần kiểm tra
            </span>
          )}
        </div>

        {/* Warning Message */}
        {needsVerification && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-start gap-2">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                {result.warning ||
                  "Độ tin cậy thấp. Vui lòng kiểm tra kỹ số liệu và chỉnh sửa nếu cần."}
              </span>
            </p>
          </div>
        )}

        {/* Errors */}
        {hasErrors && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <ul className="text-sm text-red-800 space-y-1">
              {result.errors.map((error, index) => (
                <li
                  key={`${error}-${index}`}
                  className="flex items-start gap-2"
                >
                  <span>•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 font-medium mb-2">
          💡 Mẹo để có kết quả tốt hơn:
        </p>
        <ul className="text-sm text-blue-700 space-y-1 ml-4">
          <li>• Chụp ảnh trong điều kiện ánh sáng tốt</li>
          <li>• Đưa camera gần và căn thẳng với đồng hồ</li>
          <li>• Đảm bảo các chữ số rõ ràng, không bị mờ</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onRetake}
          type="button"
          className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg
                   hover:bg-gray-50 transition font-semibold
                   flex items-center justify-center gap-2"
        >
          <Camera size={20} />
          Chụp lại
        </button>

        <button
          onClick={handleConfirm}
          type="button"
          disabled={!editedValue || editedValue.length < 3}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 transition font-semibold
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          Xác nhận
        </button>
      </div>

      {/* Debug Info (Development only) */}
      {import.meta.env.DEV && (
        <details className="mt-4 text-xs text-gray-500">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(
              {
                text: result.text,
                rawText: result.rawText,
                confidence: result.confidence,
                isValid: result.isValid,
                needsVerification: result.needsVerification,
                processingTime: result.processingTime,
              },
              null,
              2,
            )}
          </pre>
        </details>
      )}
    </div>
  );
}

OCRVerification.propTypes = {
  result: PropTypes.shape({
    text: PropTypes.string,
    confidence: PropTypes.number,
    needsVerification: PropTypes.bool,
    errors: PropTypes.arrayOf(PropTypes.string),
    warning: PropTypes.string,
    originalImageUrl: PropTypes.string,
    processedImageUrl: PropTypes.string,
    processingTime: PropTypes.number,
    imageFile: PropTypes.object,
  }),
  onConfirm: PropTypes.func.isRequired,
  onRetake: PropTypes.func.isRequired,
  meterType: PropTypes.oneOf(["electric", "water"]),
};

OCRVerification.defaultProps = {
  result: null,
  meterType: "electric",
};

export default OCRVerification;
