import os
from transformers import AutoTokenizer, AutoModel
from config import MODEL_NAME, MODEL_LOCAL_PATH

def download_and_save_model():
    if not os.path.exists(MODEL_LOCAL_PATH):
        os.makedirs(MODEL_LOCAL_PATH)

    print(f"📥 Đang tải model {MODEL_NAME} từ Hugging Face...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModel.from_pretrained(MODEL_NAME)

    print(f"💾 Lưu model và tokenizer vào {MODEL_LOCAL_PATH} ...")
    tokenizer.save_pretrained(MODEL_LOCAL_PATH)
    model.save_pretrained(MODEL_LOCAL_PATH)
    print("✅ Hoàn thành tải và lưu model.")

if __name__ == "__main__":
    download_and_save_model()
