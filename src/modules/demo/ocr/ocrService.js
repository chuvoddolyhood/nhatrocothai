import { createWorker } from "tesseract.js";

let worker;

export async function initOCR() {
    worker = await createWorker();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
}

export async function recognizeDigits(image) {
    const { data } = await worker.recognize(image, {
        tessedit_char_whitelist: "0123456789",
        psm: 7
    });

    console.log("data: ", data);


    return data.text.replace(/\D/g, "");
}
