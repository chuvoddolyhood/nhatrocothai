"""
YOLOv8 training script for digit detection on mechanical meters.

Usage:
    python train.py                    # Default: 100 epochs, yolov8n
    python train.py --epochs 200       # Custom epochs
    python train.py --model yolov8s    # Use small model
"""
import os
import sys
import argparse
import shutil

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "server")


def train(epochs=100, model_size="yolov8n", batch=16, imgsz=640, device=""):
    """Train YOLOv8 model for digit detection."""
    try:
        from ultralytics import YOLO
    except ImportError:
        print("ERROR: ultralytics not installed.")
        print("Run: pip install ultralytics")
        sys.exit(1)

    data_yaml = os.path.join(SCRIPT_DIR, "data.yaml")
    if not os.path.exists(data_yaml):
        print("ERROR: data.yaml not found. Run generate_synthetic.py first.")
        sys.exit(1)

    # Check dataset exists
    train_dir = os.path.join(SCRIPT_DIR, "dataset", "images", "train")
    if not os.path.exists(train_dir) or len(os.listdir(train_dir)) == 0:
        print("ERROR: No training images. Run generate_synthetic.py first.")
        sys.exit(1)

    print(f"🚀 Starting YOLOv8 training")
    print(f"   Model: {model_size}")
    print(f"   Epochs: {epochs}")
    print(f"   Batch: {batch}")
    print(f"   Image size: {imgsz}")
    print(f"   Data: {data_yaml}")
    print()

    # Load pretrained model
    model = YOLO(f"{model_size}.pt")

    # Train
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        batch=batch,
        imgsz=imgsz,
        device=device or None,
        project=os.path.join(SCRIPT_DIR, "runs"),
        name="digit_detect",
        exist_ok=True,
        patience=20,
        save=True,
        plots=True,
        verbose=True,
    )

    # Copy best model to server/models/
    best_pt = os.path.join(SCRIPT_DIR, "runs", "digit_detect", "weights", "best.pt")
    dest = os.path.join(SERVER_DIR, "models", "best.pt")
    os.makedirs(os.path.dirname(dest), exist_ok=True)

    if os.path.exists(best_pt):
        shutil.copy2(best_pt, dest)
        print(f"\n✅ Best model copied to: {dest}")
    else:
        print(f"\n⚠️  best.pt not found at {best_pt}")

    print("\n🎉 Training complete!")
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train YOLOv8 digit detector")
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--model", type=str, default="yolov8n", 
                        choices=["yolov8n", "yolov8s", "yolov8m", "yolov8l"])
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--device", type=str, default="")
    args = parser.parse_args()

    train(args.epochs, args.model, args.batch, args.imgsz, args.device)
