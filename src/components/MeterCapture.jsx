import { useMeterOCR } from "../hooks/useMeterOCR";

export default function MeterCapture() {
    const { processImage } = useMeterOCR();

    const onFileChange = async (e) => {
        const img = e.target.files[0];
        const imgElement = new Image();
        imgElement.src = URL.createObjectURL(img);
        console.log(imgElement);

        imgElement.onload = async () => {
            if (!window.cv || !cv.imread) {
                console.error("OpenCV chưa sẵn sàng");
                return;
            } else {
                console.log("OpenCV sẵn sàng");
            }

            const src = cv.imread(imgElement);
            const value = await processImage(src);
            console.log(value);
        };
    };

    return <input type="file" accept="image/*" onChange={onFileChange} />;
}
