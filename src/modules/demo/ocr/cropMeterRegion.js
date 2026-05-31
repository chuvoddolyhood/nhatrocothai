export function cropMeterRegion(src) {
    // const gray = new cv.Mat();
    // const thresh = new cv.Mat();
    // const morph = new cv.Mat();

    // cv.cvtColor(src, gray, cv.COLOR_BGR2GRAY);
    // cv.threshold(gray, thresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
    // cv.bitwise_not(thresh, thresh);

    // const kernel = cv.getStructuringElement(
    //     cv.MORPH_RECT,
    //     new cv.Size(25, 5)
    // );

    // cv.morphologyEx(thresh, morph, cv.MORPH_CLOSE, kernel);

    // const contours = new cv.MatVector();
    // const hierarchy = new cv.Mat();
    // cv.findContours(
    //     morph,
    //     contours,
    //     hierarchy,
    //     cv.RETR_EXTERNAL,
    //     cv.CHAIN_APPROX_SIMPLE
    // );

    // let bestRect = null;
    // let maxArea = 0;

    // for (let i = 0; i < contours.size(); i++) {
    //     const rect = cv.boundingRect(contours.get(i));
    //     const area = rect.width * rect.height;
    //     const ratio = rect.width / rect.height;

    //     if (area > 5000 && ratio > 3 && ratio < 10) {
    //         if (area > maxArea) {
    //             bestRect = rect;
    //             maxArea = area;
    //         }
    //     }
    // }

    // return bestRect ? src.roi(bestRect) : null;

    const gray = new cv.Mat();
    const blur = new cv.Mat();
    const thresh = new cv.Mat();
    const morph = new cv.Mat();

    // 1️⃣ Gray
    cv.cvtColor(src, gray, cv.COLOR_BGR2GRAY);

    // 2️⃣ Blur để giảm noise
    cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0);

    // 3️⃣ Threshold (TRẮNG SỐ - ĐEN NỀN)
    cv.threshold(
        blur,
        thresh,
        0,
        255,
        cv.THRESH_BINARY + cv.THRESH_OTSU
    );

    // Nếu nền bị trắng → đảo
    const whitePixels = cv.countNonZero(thresh);
    if (whitePixels > thresh.rows * thresh.cols * 0.6) {
        cv.bitwise_not(thresh, thresh);
    }

    // 4️⃣ Morphology (gom chữ số)
    const kernel = cv.getStructuringElement(
        cv.MORPH_RECT,
        new cv.Size(35, 7) // 👈 tăng kernel
    );

    cv.morphologyEx(thresh, morph, cv.MORPH_CLOSE, kernel);

    // 5️⃣ Contour
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
        morph,
        contours,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
    );

    let bestRect = null;
    let maxArea = 0;

    for (let i = 0; i < contours.size(); i++) {
        const rect = cv.boundingRect(contours.get(i));
        const area = rect.width * rect.height;
        const ratio = rect.width / rect.height;

        if (
            area > src.rows * src.cols * 0.01 && // 👈 theo %
            ratio > 2 &&
            ratio < 12
        ) {
            if (area > maxArea) {
                bestRect = rect;
                maxArea = area;
            }
        }
    }

    gray.delete();
    blur.delete();
    thresh.delete();
    morph.delete();
    contours.delete();
    hierarchy.delete();

    return bestRect ? src.roi(bestRect) : null;
}
