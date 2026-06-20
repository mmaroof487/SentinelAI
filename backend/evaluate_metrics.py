import os
import json
import base64
from ultralytics import YOLO
from google import genai
from google.genai import types
from app.config import settings
from app.services.detector import detect_triple_riding

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def generate_ground_truth(evidence_dir, output_file):
    print("Generating ground truth using Gemini 2.0 Flash...")
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    ground_truth = {}
    for filename in os.listdir(evidence_dir):
        if not filename.endswith(".jpg"):
            continue
            
        path = os.path.join(evidence_dir, filename)
        
        # We upload using the new genai SDK pattern
        with open(path, "rb") as f:
            image_bytes = f.read()
            
        prompt = "Does this image show a motorcycle/scooter with 3 or more people riding it? Answer ONLY 'YES' or 'NO'."
        
        try:
            response = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=[
                    prompt,
                    types.Part.from_bytes(data=image_bytes, mime_type='image/jpeg')
                ]
            )
            answer = response.text.strip().upper()
            is_triple_riding = "YES" in answer
            ground_truth[filename] = is_triple_riding
            print(f"Labeled {filename}: {is_triple_riding}")
        except Exception as e:
            print(f"Failed to label {filename}: {e}")
            
    with open(output_file, "w") as f:
        json.dump(ground_truth, f, indent=2)
    return ground_truth

def evaluate_model(evidence_dir, ground_truth):
    print("\nEvaluating YOLOv8 model against ground truth...")
    
    true_positives = 0
    false_positives = 0
    false_negatives = 0
    true_negatives = 0
    
    import time
    total_time = 0
    count = 0
    
    for filename, is_actual_violation in ground_truth.items():
        path = os.path.join(evidence_dir, filename)
        
        start = time.time()
        result = detect_triple_riding(path)
        end = time.time()
        
        total_time += (end - start)
        count += 1
        
        # If result is returned, it means a detection happened (wait, our new detector returns dict with violation="None" if no violation)
        if result and result.get("violation") == "Triple Riding":
            is_pred_violation = True
        else:
            is_pred_violation = False
            
        if is_actual_violation and is_pred_violation:
            true_positives += 1
        elif not is_actual_violation and is_pred_violation:
            false_positives += 1
        elif is_actual_violation and not is_pred_violation:
            false_negatives += 1
        else:
            true_negatives += 1
            
    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    avg_time_ms = (total_time / count) * 1000 if count > 0 else 0
    
    metrics = {
        "precision": round(precision * 100, 1),
        "recall": round(recall * 100, 1),
        "f1_score": round(f1 * 100, 1),
        "avg_inference_ms": round(avg_time_ms),
        "dataset_size": count
    }
    
    print("\n--- RESULTS ---")
    print(f"Precision: {metrics['precision']}%")
    print(f"Recall:    {metrics['recall']}%")
    print(f"F1 Score:  {metrics['f1_score']}%")
    print(f"Avg Time:  {metrics['avg_inference_ms']}ms")
    
    return metrics

if __name__ == "__main__":
    evidence_dir = settings.EVIDENCE_DIR
    gt_file = "ground_truth.json"
    metrics_file = "metrics.json"
    
    # 1. Generate or load ground truth
    if not os.path.exists(gt_file):
        ground_truth = generate_ground_truth(evidence_dir, gt_file)
    else:
        with open(gt_file, "r") as f:
            ground_truth = json.load(f)
            
    # 2. Evaluate model
    metrics = evaluate_model(evidence_dir, ground_truth)
    
    # 3. Save metrics for the API
    with open(metrics_file, "w") as f:
        json.dump(metrics, f, indent=2)
        
    print(f"\nMetrics saved to {metrics_file}")
