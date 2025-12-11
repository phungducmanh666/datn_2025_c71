from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional
from typing import Any, Dict, List, Union
from uuid import UUID
import uuid
from services.embedding_service import EmbeddingService
import pandas as pd
from sqlalchemy import create_engine, text
from typing import List
from database.connection import engine
import numpy as np
from scipy.sparse import coo_matrix, csr_matrix, csc_matrix, diags
import math
import requests
from dotenv import load_dotenv
import os
import json, torch
import google.generativeai as genai
import struct
from transformers import AutoModelForCausalLM, AutoTokenizer
# số sản phẩm đề xuất trên trang chủ
TOP_K_HOME_PRODUCTS = 4
# số sản phẩm có độ tương đồng cao nhất để tính rating dự đoán
TOP_K_SIMILAR_PRODUCTS = 10
# số sản phẩm đề xuất ở trang chi tiết sản phẩm
TOP_K_DETAIL_PRODUCTS = 8
# số chữ số thập phân làm tròn trong quá trình chuẩn hóa 
DECIMALS = 3
# ngưỡng để coi là số 0
ZERO_THRESHOLD = 1e-12
# số user chung tối thiểu để tính similarity giữa 2 sản phẩm
MIN_COMMON_USERS = 2
#shrinkage để ổn định độ tương đồng khi số user chung nhỏ
SHRINKAGE = 0.0

# Base Service URL :
BASE_SERVICE_URL = "http://localhost:8080"
headers = {"Accept": "application/json"}
# Ánh xạ khóa EN -> VN cho phần thông tin cơ bản
BASIC_VN_KEYS = {
    "name": "tên",
    "status": "trạng thái",
    "price": "giá",
    "photoUrl": "ảnh đại diện",
    "images": "hình ảnh",
    # tuỳ backend nếu có các field khác như brand/series...
    "brand": "thương hiệu",
    "series": "dòng sản phẩm",
    "color": "màu",
    "chipset": "CPU",
    "ram": "RAM",
    "storage": "Dung lượng lưu trữ",
}
# 
router = APIRouter()
# embedding_service = EmbeddingService()
load_dotenv()

# Load mô hình mô tả sản phẩm
# description_model_name = os.getenv("QWEN_MODEL_NAME")
# description_model = AutoModelForCausalLM.from_pretrained(
#     description_model_name,
#     dtype="auto",          # ưu tiên bf16/fp16 trên GPU
#     # device_map="auto",
#     low_cpu_mem_usage=True
# )
# description_tokenizer = AutoTokenizer.from_pretrained(description_model_name, use_fast=True)




class TextRequest(BaseModel):
    text: str

@router.post("/embedding")
async def get_embedding(req: TextRequest):
    try:
        embedding = embedding_service.text_to_embedding(req.text)
        return {"embedding": embedding}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


#Cập nhật item profile
@router.get("/update_item_profile/{product_uid}", response_model=dict)
def update_item_profile(
    product_uid: UUID
):

    # 1. Lấy sản phẩm
    # url = "http://localhost:8080/product/products/7183fb41-0a79-4f2d-9f17-002f0eaedaa9"
    # product_endpoint = f"/product/products/{product_uid}"
    product_endpoint = f"/product/products/{product_uid}/json"
    # product_response = requests.get(BASE_SERVICE_URL + product_endpoint)
    product_response = requests.get(f"{BASE_SERVICE_URL}{product_endpoint}", headers=headers, timeout=10)
    
    # 2. Lấy thuộc tính và giá trị
    # attribute_endpoint = f"/product/products/{product_uid}/attributes"
    # attribute_response = requests.get(BASE_SERVICE_URL + attribute_endpoint)
    # attribute_response = requests.get(f"{BASE_SERVICE_URL}{attribute_endpoint}", headers=headers, timeout=10)

    # 3. Tạo JSON đặc trưng
    product_info = product_response.text
    # raw_attrs = attribute_response.text
    # groups = parse_multi_json(raw_attrs)

    # product_kv = merge_product_info_and_attrs(product_info, groups, product_type="Laptop")#key–value tiếng Việt, Điện thoại, Laptop, Máy tính bảng
    # 4. Tạo chuỗi mô tả sản phẩm

    # product_input_description = json.dumps(product_kv, ensure_ascii=False, indent=2)
    product_description = product_info
    print(product_description)
    # product_description = describe_product(product_input_description, language="Vietnamese", style="marketing", format_="paragraph", max_new_tokens=600)
    # print("Mô tả sản phẩm được tạo:")
    # print(product_description)
    # 5. Biển đổi chuỗi thành item profile

    genai.configure(api_key=os.getenv("GEMINI_SECRET_KEY"))
    gemini_model_name = os.getenv("GEMINI_MODEL_NAME")
    print("Sử dụng model Gemini:", gemini_model_name)

    # Tạo embedding vector
    embedding_response = genai.embed_content(
        model= gemini_model_name,
        content= product_description
    )
    embedding_vector = embedding_response["embedding"]
    print(embedding_vector)
    # 6. Cập nhật vào bảng item_profile
    binary_embedding = struct.pack('<' + 'f' * len(embedding_vector), *embedding_vector)
    print(type(binary_embedding))
    check_exists = check_embedding_exists(product_uid)
    if check_exists:
        save_binary_embedding_to_db(product_uid, binary_embedding, product_description)
    else:
        insert_binary_embedding_to_db(product_uid, binary_embedding, product_description)
    return {
        "result": "Not implement",  # FastAPI sẽ tự serialize từ Pydantic model
    }
#===============================================================================
#===============================================================================
@router.get("/recommendation_home_products_v0/{user_uid}", response_model=List[UUID])
def recommendation_home_products(
    user_uid: UUID
):
    #read data from database to dataframe
    df = pd.read_sql(text("SELECT user_uid, product_uid, rating FROM dbo.utility_matrix"), engine)
    print('dữ liệu trong bảng utility_matrix:')
    print(df)


    df_feature = pd.read_sql(text("SELECT uuid, name FROM dbo.feature"), engine)
    print('dữ liệu trong bảng feature:')
    print(df_feature)


    df_feature_matrix = pd.read_sql(text("SELECT product_uid, feature_uid, rate FROM dbo.feature_matrix"), engine)
    print('dữ liệu trong bảng feature_matrix:')
    print(df_feature_matrix)



    # list = df['user_uid'].unique().tolist()

    # lập chỉ mục
    user2idx = {u: i for i, u in enumerate(df["user_uid"].astype(str).unique())}
    prod2idx = {p: i for i, p in enumerate(df["product_uid"].astype(str).unique())} 
    idx2prod = np.array(df["product_uid"].astype(str).unique())  # để map ngược nhanh
    print("user2idx:", user2idx)
    print("prod2idx:", prod2idx)


    # --- Tạo chỉ số hàng (item) và cột (user) ---
    rows = df["product_uid"].astype(str).map(prod2idx).to_numpy(np.int32)
    cols = df["user_uid"].astype(str).map(user2idx).to_numpy(np.int32)
    vals = df["rating"].astype(np.float32).to_numpy()


    # --- Tạo ma trận thưa ---
    R = csr_matrix((vals, (rows, cols)), shape=(len(prod2idx), len(user2idx)))


    # --- Tạo ma tran đặc trưng sản phẩm ---
    rows_f = df_feature_matrix["product_uid"].astype(str).map(prod2idx).to_numpy(np.int32)
    cols_f = df_feature_matrix["feature_uid"].astype(str).map({f: i for i, f in enumerate(df_feature["uuid"].astype(str).unique())}).to_numpy(np.int32)
    vals_f = df_feature_matrix["rate"].astype(np.float32).to_numpy()
    R_f = csr_matrix((vals_f, (rows_f, cols_f)), shape=(len(prod2idx), len(df_feature["uuid"].unique())))
    print("Ma trận đặc trưng sản phẩm R_f:")
    print(R_f)


    # --- Lấy id của user ---
    u_str = str(user_uid).upper()
    if u_str not in user2idx:# nếu user không đánh giá thì không có đề xuất do không thể tính vector sở thích
        print(f"User {user_uid} không có trong dữ liệu.")
        return []

    # lấy index của user
    u_idx = user2idx[u_str]
    u_vector = calculate_vector_interested_user(R_f, R, u_idx) # tính vector sở thích của user
    print(f"Vector sở thích của user {user_uid} (index {u_idx}):")
    print(u_vector)
    

    topN = topk_for_home_product(R_f, u_vector, idx2prod, topk=TOP_K_HOME_PRODUCTS)
    
    return [UUID(pid) for pid, _ in topN]

#=============================================== sửa lại khuyến nghị theo embedding
@router.get("/recommendation_home_products/{user_uid}", response_model=List[UUID])
def recommendation_home_products(
    user_uid: UUID
):
    #read data from database to dataframe
    df = pd.read_sql(text("SELECT user_uid, product_uid, rating FROM dbo.utility_matrix"), engine)


    #đọc product embeddings
    df_product_embeddings = pd.read_sql(text("SELECT product_uuid, embedding FROM dbo.ProductEmbeddings"), engine)
    emb_list = [decode_embedding(b) for b in df_product_embeddings["embedding"]]
    # Chắc chắn tất cả cùng dimension
    # D = emb_list[0].shape[0]
    emb_matrix = np.vstack(emb_list).astype(np.float32)  # shape (N, D)

    # lập chỉ mục
    user2idx = {u: i for i, u in enumerate(df["user_uid"].astype(str).unique())}
    #
    product_ids = df_product_embeddings["product_uuid"].astype(str).unique()
    prod2idx = {pid: i for i, pid in enumerate(product_ids)}
    idx2prod = {i: pid for pid, i in prod2idx.items()}

    R_f = csr_matrix(emb_matrix)  # mỗi hàng = 1 product embedding
    print(R_f.data)
    print(R_f.indices)
    print(R_f.indptr)


    # --- Tạo chỉ số hàng (item) và cột (user) ---
    rows = df["product_uid"].astype(str).map(prod2idx).to_numpy(np.int32)
    cols = df["user_uid"].astype(str).map(user2idx).to_numpy(np.int32)
    vals = df["rating"].astype(np.float32).to_numpy()


    # --- Tạo ma trận thưa ---
    R = csr_matrix((vals, (rows, cols)), shape=(len(prod2idx), len(user2idx)))



    # --- Lấy id của user ---
    u_str = str(user_uid).upper()
    if u_str not in user2idx:# nếu user không đánh giá thì không có đề xuất do không thể tính vector sở thích
        print(f"User {user_uid} không có trong dữ liệu.")
        return []

    # lấy index của user
    u_idx = user2idx[u_str]
    u_vector = calculate_vector_interested_user(R_f, R, u_idx) # tính vector sở thích của user
    print(f"Vector sở thích của user {user_uid} (index {u_idx}):")
    print(u_vector)
    

    topN = topk_for_home_product(R_f, u_vector, idx2prod, topk=TOP_K_HOME_PRODUCTS)
    
    return [UUID(pid) for pid, _ in topN]
@router.get("/recommendation_similar_products/{product_uid}/{user_uid}", response_model=List[UUID])
def recommendation_similar_products(
    product_uid: UUID,
    user_uid: UUID
):
    #read data from database to dataframe
    df = pd.read_sql(text("SELECT user_uid, product_uid, rating FROM dbo.utility_matrix"), engine)
    # print(df.head())
    # print('dữ liệu trong bảng utility_matrix:')
    # print(df)


    # lập chỉ mục
    user2idx = {u: i for i, u in enumerate(df["user_uid"].astype(str).unique())}
    prod2idx = {p: i for i, p in enumerate(df["product_uid"].astype(str).unique())} 
    idx2prod = np.array(df["product_uid"].astype(str).unique())  # để map ngược nhanh
    # print("user2idx:", user2idx)
    # print("prod2idx:", prod2idx)


    # --- Tạo chỉ số hàng (item) và cột (user) ---
    rows = df["product_uid"].astype(str).map(prod2idx).to_numpy(np.int32)
    cols = df["user_uid"].astype(str).map(user2idx).to_numpy(np.int32)
    vals = df["rating"].astype(np.float32).to_numpy()


    # --- Tạo ma trận thưa ---
    R = csr_matrix((vals, (rows, cols)), shape=(len(prod2idx), len(user2idx)))


    # --- Lấy vector đánh giá của user ---
    u_str = str(user_uid).upper()
    if u_str not in user2idx:# nếu user không đánh giá thì không có đề xuất
        print(f"User {user_uid} không có trong dữ liệu.")
        return []

    
    u_idx = user2idx[u_str]
    u_vector = R[:, u_idx]
    print(f"Vector đánh giá của user {user_uid} (index {u_idx}):")
    print(u_vector.toarray().T)
    # các item đã được user u đánh giá (chỉ số hàng trong R)
    rated_idx = u_vector.nonzero()[0]          # -> mảng 1D các chỉ số item đã có rating
    print(f"Các sản phẩm đã được user {user_uid} đánh giá (chỉ số hàng):", rated_idx)
    n_items = R.shape[0]
    # các item CHƯA được đánh giá
    unrated_idx = np.setdiff1d(
        np.arange(n_items, dtype=np.int32),
        rated_idx,
        assume_unique=True
    )
    print(f"Các sản phẩm CHƯA được user {user_uid} đánh giá (chỉ số hàng):", unrated_idx)

    #Chuẩn hóa ma trận bằng cách trừ đi giá trị trung bình của mỗi user
    R_norm = normalize_user_mean(R)


    predict_ratings = {}


    for i_idx in unrated_idx:# duyệt qua các sản phẩm chưa được đánh giá của user đang xét
        similarity_list = top_similar_for_product(R_norm=R_norm, #ma trận R trừ đi giá trị trung bình
                                                    product_uid=idx2prod[i_idx],  #sản phẩm hiện tại
                                                    item2idx=prod2idx, # map sản phẩm -> chỉ số hàng
                                                    idx2item=idx2prod, # map chỉ số hàng -> sản phẩm
                                                    topk=TOP_K_SIMILAR_PRODUCTS, # số sản phẩm tương tự cần lấy
                                                    min_common=MIN_COMMON_USERS, # số user chung tối thiểu để tính similarity
                                                    shrink=SHRINKAGE) # tham số shrinkage để ổn định độ tương đồng khi số user chung nhỏ
        print(f"Sản phẩm {idx2prod[i_idx]} tương tự với:")
        print(similarity_list)
        # tính rating dự đoán cho i_idx
        # ---- Chuẩn hóa: similarity_list -> List[(j_idx, sim)] ----
        neigh_pairs = [] # lưu thông tin về các hàng xóm (j_idx, sim)
        for nb in similarity_list:
            if isinstance(nb, dict):
                j_uid = nb['product_uid']
                sim   = nb['similarity']
            else:
                j_uid = nb[0]
                sim   = nb[1]
            j_idx = prod2idx[j_uid]
            neigh_pairs.append((j_idx, sim))
        # ---- Chỉ giữ hàng xóm mà user hiện tại đã đánh giá ----
        neigh_pairs = [ (j_idx, sim) for j_idx, sim in neigh_pairs if j_idx in rated_idx ]
        num = 0.0 # tử số
        den = 0.0 # mâu số
        for (j_idx, sim) in neigh_pairs:
            centered = float(R[j_idx, u_idx])   # r[u,j] - mean_u
            if centered != 0.0:
                num += sim * centered
                den += sim# độ tương đồng âm không xem xét
        r_hat = (num / den if den > 0 else 0.0)
        predict_ratings[idx2prod[i_idx]] = r_hat

    N = TOP_K_DETAIL_PRODUCTS
    topN = sorted(predict_ratings.items(), key=lambda x: x[1], reverse=True)[:N]
    print("Top-N sản phẩm được đề xuất:", topN)
    return [UUID(pid) for pid, _ in topN]



def normalize_user_mean(R: csr_matrix, decimals=DECIMALS, zero_threshold=ZERO_THRESHOLD):
    R64 = R.astype(np.float64, copy=True)
    for u in range(R64.shape[0]):
        s, e = R64.indptr[u], R64.indptr[u+1]
        if s == e: 
            continue
        row = R64.data[s:e]
        # tổng ổn định
        total = math.fsum(row)
        mean = total / (e - s)
        row -= mean
        # làm tròn “đẹp”
        row[:] = np.round(row, decimals=decimals)
        # zero-out rất nhỏ (nếu còn đuôi)
        small = np.abs(row) < zero_threshold
        row[small] = 0.0
    R64.eliminate_zeros()
    return R64



def cosine_on_overlap_row_fast(ui_idx, vi, uj_idx, vj, min_common=2, shrink=0.0): # đang bị hardcode min_common và shrink =====================================
    """
    Cosine similarity chỉ trên user chung.
    ui_idx, vi: indices & data của hàng i
    uj_idx, vj: indices & data của hàng j
    """
    p = q = 0
    dot = 0.0
    ni = 0.0
    nj = 0.0
    common = 0

    # lấy vị trí các user chung cùng đánh giá, tiện tính thêm đồng thời tử số(dot) và bình phương độ dài (ni, nj)
    while p < ui_idx.size and q < uj_idx.size:
        if ui_idx[p] == uj_idx[q]:
            x = vi[p]; y = vj[q]
            dot += x * y
            ni  += x * x
            nj  += y * y
            common += 1
            p += 1; q += 1
        elif ui_idx[p] < uj_idx[q]:
            p += 1
        else:
            q += 1

    if common < min_common or ni == 0.0 or nj == 0.0:
        return 0.0, 0  # sim, common

    sim = dot / (np.sqrt(ni) * np.sqrt(nj))
    if shrink > 0.0:
        sim *= (common / (common + shrink))  # shrinkage ổn định khi common nhỏ
    return float(sim), common

def top_similar_for_product(
    product_uid: str,
    R_norm: csr_matrix,            # shape (n_items, n_users), CSR, đã mean-center theo user
    item2idx: dict[str, int],      # map product_uid -> row index
    idx2item: np.ndarray,          # map row index -> product_uid
    topk: int = TOP_K_SIMILAR_PRODUCTS,
    min_common: int = MIN_COMMON_USERS,
    shrink: float = SHRINKAGE
):
    # kiểm tra tồn tại=========> nếu sản phẩm hiện tại không được đánh giá thì không có sản phẩm tương tự
    if product_uid not in item2idx:
        return []

    i = item2idx[product_uid]
    print ("Index của sản phẩm:", i)
    n_items = R_norm.shape[0]
    print("Tổng số item:", n_items)

    # Lấy hàng i một lần
    row_i = R_norm.getrow(i)# Vector hàng i đại diện cho sản phẩm hiện tại
    print("Row i:", row_i)

    ui_idx = row_i.indices# Chỉ số cột (user) mà item i có rating
    vi     = row_i.data# Giá trị rating tương ứng


    if ui_idx.size == 0: # nếu sản phẩm không có user nào đánh giá không xét do không thể tính similarity
        return []

    sims = [] # lưu trữ (product_uid, similarity, common)
    for j in range(n_items): # duyệt qua tất cả các sản phẩm khác
        if j == i: # bỏ qua chính nó
            continue
        row_j = R_norm.getrow(j) # Vector hàng j đại diện cho sản phẩm thứ j
        uj_idx = row_j.indices # Chỉ số cột (user) mà item j có rating
        vj     = row_j.data # Giá trị rating tương ứng
        if uj_idx.size == 0: # nếu sản phẩm không có user nào đánh giá không xét do không thể tính similarity
            continue

        sim, common = cosine_on_overlap_row_fast(ui_idx, vi, uj_idx, vj, min_common=min_common, shrink=shrink) # tính similarity giữa i và j
        if sim > 0.0:  # lọc bớt chỉ lấy similarity > 0
            sims.append((idx2item[j], sim, common))

    # sắp xếp theo similarity giảm dần (có thể tie-break theo common)
    sims.sort(key=lambda x: (x[1], x[2]), reverse=True)# sort by sim, then by common
    return sims[:topk] 

def calculate_vector_interested_user(R_f: csr_matrix, R: csr_matrix, u_idx: int):

    """
    Tính vector đặc trưng sở thích của user u dựa trên ma trận đặc trưng sản phẩm R_f
    và ma trận tiện ích R.
    R_f: (I × F) ma trận đặc trưng sản phẩm
    R:   (I × U) ma trận tiện ích
    u_idx: chỉ số cột của user u trong R
    Trả về: vector (F,) đặc trưng sở thích của user u
    """
    # Lấy vector đánh giá của user u
    u_vector = R[:, u_idx]
    print(f"Vector đánh giá của user index {u_idx}:")
    print(u_vector.toarray().T)


    # Các chỉ số hàng (item) mà user u đã đánh giá
    rated_idx = u_vector.nonzero()[0]
    print(f"Các sản phẩm đã được user index {u_idx} đánh giá (chỉ số hàng):", rated_idx)
    if rated_idx.size == 0:
        return np.zeros(R_f.shape[1], dtype=np.float32)

    # Tính vector sở thích bằng cách trung bình có trọng số các vector đặc trưng sản phẩm đã đánh giá
    feature_vector = np.zeros(R_f.shape[1], dtype=np.float32)
    print("Tính vector sở thích...")
    print(feature_vector)

    total_rating = 0.0
    for i_idx in rated_idx:
        rating = R[i_idx, u_idx]
        print(f"Xử lý sản phẩm index {i_idx} với rating {rating}")
        product_feature_vector = R_f.getrow(i_idx).toarray().flatten()
        print(product_feature_vector)
        feature_vector += rating * product_feature_vector
        print("Cộng vào vector sở thích:")
        print(feature_vector)
        total_rating += rating
        print("Tổng rating hiện tại:", total_rating)

    if total_rating > 0.0:
        feature_vector /= total_rating

    return feature_vector
def topk_for_home_product(R_f: csr_matrix, user_vector: np.ndarray, idx2item: np.ndarray, topk: int = TOP_K_HOME_PRODUCTS):
    """
    Tìm top-k sản phẩm phù hợp nhất với vector sở thích user.
    R_f: (I × F) ma trận đặc trưng sản phẩm
    user_vector: (F,) vector sở thích của user
    idx2item: map row index -> product_uid
    """
    n_items = R_f.shape[0]
    print("tổng số sản phẩm:", n_items)
    sims = []
    user_norm = np.linalg.norm(user_vector) # tính độ dài vector sở thích user
    print("user_norm:", user_norm)

    for i in range(n_items):
        item_vector = R_f.getrow(i).toarray().flatten() # lấy vector đặc trưng sản phẩm i
        print("item_vector:", item_vector)
        item_norm = np.linalg.norm(item_vector) # tính độ dài vector đặc trưng sản phẩm
        print("item_norm:", item_norm)
        if item_norm == 0.0 or user_norm == 0.0:
            continue
        sim = np.dot(user_vector, item_vector) / (user_norm * item_norm)
        sims.append((idx2item[i], sim)) # lưu (product_uid, similarity)

    # sắp xếp theo similarity giảm dần
    sims.sort(key=lambda x: x[1], reverse=True)
    print("sims:", sims)
    return sims[:topk]

def save_binary_embedding_to_db(product_uuid: uuid.UUID, binary_embedding: bytes, product_description: str):
    with engine.begin() as connection:
        query = text("""
            UPDATE dbo.ProductEmbeddings
            SET embedding = :embedding, generated_description = :product_description
            WHERE product_uuid = :product_uid
        """)
        connection.execute(query, {"embedding": binary_embedding, "product_uid": str(product_uuid), "product_description": str(product_description)})
def insert_binary_embedding_to_db(product_uuid: uuid.UUID, binary_embedding: bytes, product_description: str):
    with engine.begin() as connection:
        query = text("""
            INSERT INTO dbo.ProductEmbeddings (product_uuid, embedding, generated_description)
            VALUES (:product_uid, :embedding, :product_description)
        """)
        connection.execute(query, {"product_uid": str(product_uuid), "embedding": binary_embedding, "product_description": str(product_description)})

def parse_multi_json(raw: str):
    """
    Parse trường hợp response chứa nhiều JSON object đứng liên tiếp:
    {..}{..}{..}
    Trả về: list[dict].
    """
    raw = raw.strip()
    decoder = json.JSONDecoder()
    items = []
    idx = 0
    length = len(raw)

    while idx < length:
        # Bỏ qua khoảng trắng / xuống dòng
        while idx < length and raw[idx].isspace():
            idx += 1
        if idx >= length:
            break

        obj, next_idx = decoder.raw_decode(raw, idx)
        items.append(obj)
        idx = next_idx

    return items


def merge_product_info_and_attrs(
    product_info: Dict[str, Any],
    attrs_payload: Union[Dict[str, Any], List[Dict[str, Any]]],
    *,
    product_type: str = None  # vd: "điện thoại", "laptop" nếu bạn muốn thêm vào dict
) -> Dict[str, str]:
    """
    Trả về dict key–value tiếng Việt:
    - Lấy các field cơ bản từ product_info (map sang tiếng Việt).
    - Duyệt tất cả nhóm thuộc tính trong attrs_payload, ghép attribute_values thành chuỗi.
    - Bỏ qua thuộc tính không có giá trị.
    """
    result: Dict[str, str] = {}

    # 1) Map các field cơ bản
    for k, v in product_info.items():
        if v is None:
            continue
        if k == "price":
            vv = format_currency_vnd(v)
        elif k == "images":
            # nếu list -> join; nếu None thì bỏ qua
            if isinstance(v, list):
                vv = ", ".join(map(str, v)) if v else None
            else:
                vv = None
        else:
            vv = v

        vn_key = BASIC_VN_KEYS.get(k)
        if vn_key and vv is not None and str(vv).strip():
            result[vn_key] = str(vv).strip()

    # Thêm loại sản phẩm nếu bạn muốn gắn cố định (tuỳ business)
    if product_type:
        result["loại sản phẩm"] = product_type

    # 2) Chuẩn hoá attrs_payload thành list nhóm
    if isinstance(attrs_payload, dict):
        groups = [attrs_payload]
    elif isinstance(attrs_payload, list):
        groups = attrs_payload
    else:
        groups = []

    # 3) Duyệt mọi nhóm -> mọi attribute -> join các value
    for grp in groups:
        attrs = grp.get("attributes") or []
        for attr in attrs:
            name = attr.get("name")
            values = attr.get("attribute_values") or []

            # Hỗ trợ nhiều kiểu structure: list[dict{value}], list[str], ...
            vals: List[str] = []
            for item in values:
                if isinstance(item, dict):
                    # ưu tiên field 'value', fallback các tên thường gặp khác
                    val = (
                        item.get("value")
                        or item.get("name")
                        or item.get("text")
                        or item.get("label")
                    )
                    if val:
                        vals.append(str(val))
                elif isinstance(item, (str, int, float)):
                    vals.append(str(item))

            if name and vals:
                result[name] = ", ".join(vals)

    return result
def format_currency_vnd(value: Union[int, float, str]) -> str:
    """Định dạng tiền về dạng 11.490.000₫ (nếu là số), nếu là chuỗi thì trả nguyên."""
    try:
        amount = float(value)
        # format kiểu 1,149,000 -> đổi dấu phẩy/thập phân cho VN
        s = f"{int(amount):,}".replace(",", ".")
        return f"{s}₫"
    except Exception:
        return str(value)

def check_embedding_exists(product_uid: uuid.UUID) -> bool:
    with engine.begin() as connection:
        query = text("""
            SELECT COUNT(*) AS count
            FROM dbo.ProductEmbeddings
            WHERE product_uuid = :product_uid AND embedding IS NOT NULL
        """)
        result = connection.execute(query, {"product_uid": str(product_uid)})
        row = result.one()
        if row and row[0] > 0:
            return True
        else:
            return False

# def describe_product(product: dict,
#                      language: str = "Vietnamese",       # or "English"
#                      style: str = "marketing",            # "marketing" | "technical" | "neutral"
#                      format_: str = "paragraph",          # "paragraph" | "bullets"
#                      max_new_tokens: int = 256) -> str:
#     """
#     Build a full product description from a JSON-like dict.
#     """

#     # system_msg = (
#     #     "You are a precise product copywriter. "
#     #     "Write a compelling description using ONLY the fields provided in the JSON. "
#     #     "Do not invent specs or values that are missing. "
#     #     "Prioritize name, key features, price, brand/series, and standout attributes. "
#     #     f"Language: {language}. Style: {style}. "
#     #     f"Output format: {'one concise paragraph' if format_=='paragraph' else 'bullet points'}. "
#     #     "Keep numbers/units exactly as provided. If something is missing, gracefully omit it."
#     # )
#     # system_msg = (
#     #     f"""You are a highly precise product description generator.

#     #     STRICT RULES (must follow exactly):
#     #     1. Use ONLY the data provided in the JSON. Do NOT add, guess, or infer any missing specifications.
#     #     2. ABSOLUTELY DO NOT REMOVE or OMIT any technical specifications that appear in the JSON.
#     #     3. Preserve all numbers, units, names, model codes, and attribute values EXACTLY as provided.
#     #     4. If something is missing in JSON, simply skip it — do NOT invent or generalize.

#     #     WRITING RULES:
#     #     - Prioritize clarity and completeness of all technical details.
#     #     - Write strictly in {language}.
#     #     - Maintain the requested writing style: {style} (e.g., marketing / technical / neutral).
#     #     - Output format must be one concise paragraph if "paragraph"
#     #     - Preserve all important technical specifications, but you may skip generic/common specs that all smartphones typically have (such as standard connectivity features or sensors) if they are not relevant.
#     #     - Do not transform, merge, simplify, or “generalize” the specs — list them exactly.
#     #     - Do NOT explain, comment, justify, or provide warnings.
#     #     - Do NOT mention contradictions or errors in the JSON.
#     #     - Produce ONLY the final product description, nothing else.
#     #     - Never output more than one description.
#     #     - Output MUST be 100% in Vietnamese. DO NOT use Chinese or English or any other language for any reason.
#     #     - If input contains Chinese characters, ignore them and still output ONLY Vietnamese.
#     #     Your main goal: produce a clean, accurate, and fully faithful description that keeps ALL specifications intact while still reading naturally.
#     #     """
#     # )
#     system_msg = (
#         f"""You are a highly precise product description generator.

#         STRICT RULES:
#         - Use ONLY the data in the JSON. Do NOT add, guess, infer, comment, explain, or warn.
#         - Preserve all numbers, units, names, model codes, and technical values exactly as provided.
#         - Keep all important technical specifications; you may skip universal/common specs if not relevant.
#         - Do NOT mention contradictions or errors in the JSON.
#         - Output ONLY ONE final description.

#         LANGUAGE RULES:
#         - Write strictly in {language}.
#         - Output MUST be 100% in Vietnamese. Do NOT use Chinese, English, or any other language.
#         - If the input contains Chinese characters, ignore them and still output only Vietnamese.

#         WRITING RULES:
#         - Use the requested writing style: {style}.
#         - Output format: one concise paragraph if "paragraph", otherwise bullet points.
#         - Maintain clarity and completeness for all important technical details.
#         - Do not transform, merge, simplify, or generalize specs; describe them exactly as provided.

#         Your goal: produce a clean, accurate, natural-sounding Vietnamese description based solely on the JSON.
#         """
#     )

#     # Put your product object as JSON in the user content (as text)
#     product_json = json.dumps(product, ensure_ascii=False, indent=2)

#     user_msg = (
#         "Here is the product JSON. Create the description as instructed.\n\n"
#         "```json\n" + product_json + "\n```"
#     )

#     messages = [
#         {"role": "system", "content": system_msg},
#         {"role": "user", "content": user_msg}
#     ]

#     prompt_text = description_tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

#     inputs = description_tokenizer(prompt_text, return_tensors="pt", truncation=True).to(description_model.device)

#     outputs = description_model.generate(
#         **inputs,
#         max_new_tokens=max_new_tokens,
#         temperature=0.3,       # focused, less hallucination
#         top_p=0.9,
#         do_sample=False,         #ban dau la true sua lai thanh false de tat sampling cho output on dinh
#         repetition_penalty=1.05,
#         eos_token_id=description_tokenizer.eos_token_id,
#         pad_token_id=description_tokenizer.eos_token_id
#     )

#     new_tokens = outputs[0, inputs["input_ids"].shape[1]:]
#     text = description_tokenizer.decode(new_tokens, skip_special_tokens=True).strip()
#     return text

def decode_embedding(blob: bytes) -> np.ndarray:
    v = np.frombuffer(blob, dtype=np.float32)
    return v  # shape: (D,)
