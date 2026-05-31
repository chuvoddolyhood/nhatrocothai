import { cropMeterRegion } from "../ocr/cropMeterRegion";
import { recognizeDigits } from "../ocr/ocrService";

export function useMeterOCR() {
    const processImage = async (cvSrc) => {
        // 1️⃣ Check OpenCV
        if (!window.cv || typeof cv.imshow !== "function") {
            console.error("OpenCV chưa sẵn sàng");
            cvSrc?.delete?.();
            return null;
        }

        try {
            // 2️⃣ Crop vùng số
            const roi = cropMeterRegion(cvSrc);
            if (!roi) {
                console.warn("Không tìm được vùng số");
                cvSrc.delete();
                return null;
            }

            // 3️⃣ Mat → Canvas
            const canvas = document.createElement("canvas");
            cv.imshow(canvas, roi);

            // 4️⃣ OCR
            const result = await recognizeDigits(canvas);

            // 5️⃣ Cleanup memory
            roi.delete();
            cvSrc.delete();

            return result;
        } catch (err) {
            console.error("Lỗi OCR:", err);
            cvSrc?.delete?.();
            return null;
        }
    };

    return { processImage };
}
