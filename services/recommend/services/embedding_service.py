from transformers import AutoTokenizer, AutoModel
import torch
from constants.config import MODEL_LOCAL_PATH

class EmbeddingService:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_LOCAL_PATH)
        self.model = AutoModel.from_pretrained(MODEL_LOCAL_PATH)
        self.model.eval()

    def text_to_embedding(self, text: str):
        inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        with torch.no_grad():
            outputs = self.model(**inputs)
            # Lấy mean pooling của last hidden state
            last_hidden_state = outputs.last_hidden_state  # (1, seq_len, hidden_size)
            attention_mask = inputs.attention_mask.unsqueeze(-1)  # (1, seq_len, 1)
            masked_hidden = last_hidden_state * attention_mask
            summed = masked_hidden.sum(dim=1)
            counts = attention_mask.sum(dim=1).clamp(min=1e-9)
            mean_pooled = summed / counts
            embedding = mean_pooled[0].tolist()  # chuyển thành list số float
        return embedding
