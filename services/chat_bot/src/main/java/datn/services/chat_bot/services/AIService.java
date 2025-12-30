package datn.services.chat_bot.services;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.google.genai.Chat;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.ContentEmbedding;
import com.google.genai.types.EmbedContentConfig;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.Part;
import com.google.genai.types.Schema;
import com.google.genai.types.Type.Known;

@Service
public class AIService {

        private final Client genaiClient;
        private final String CHAT_MODEL_ID = "gemini-2.5-flash";
        private final String EMBEDDING_MODEL_ID = "text-embedding-004";

        private final String SCHEMA_PROMPT = """

                        ### 5. ĐỊNH DẠNG ĐẦU RA:
                        - type: Object
                        - required:
                          - message
                          - isShowProduct
                          - productUUIDS
                        - properties:
                          - message:
                              type: string
                              description: "Câu trả lời ngắn gọn, thân thiện cho khách hàng."
                          - isShowProduct:
                              type: boolean
                              description: "isShowProduct = true khi người dùng có hành động tìm kiếm sản phẩm.
                                           isShowProduct = false nếu chỉ là chào hỏi xã giao hoặc hỏi về chính sách chung"
                          - productUUIDS:
                              type: array
                              description: "Danh sách các 'uuid' của sản phẩm ĐƯỢC NHẮC ĐẾN trong câu trả lời. Chỉ lấy uuid từ dữ liệu [PRODUCTS] đã cung cấp.
                                            Nếu không có sản phẩm nào, trả về mảng rỗng [].")
                        """;

        public AIService(Client client) {
                this.genaiClient = client;
        }

        public List<ContentEmbedding> getEmbedding(String text) {
                Optional<List<ContentEmbedding>> embedding = genaiClient.models.embedContent(
                                EMBEDDING_MODEL_ID,
                                text,
                                EmbedContentConfig.builder().build()).embeddings();

                return embedding.orElseThrow(() -> new RuntimeException("EMbedding failed"));
        }

        public String chat(String message, List<String> contexts) {
                Chat chatSession = genaiClient.chats.create(CHAT_MODEL_ID, getChatConfig());

                String businessInfo = contexts.get(0);
                String productInfo = contexts.get(1);
                String chatHistory = contexts.get(2);

                List<Content> contents = new LinkedList<>();
                contents.add(Content.builder()
                                .role("user")
                                .parts(Part.fromText(buildUserPrompt(message, businessInfo, productInfo, chatHistory)))
                                .build());
                contents.add(getSystemInstruction());

                return chatSession.sendMessage(contents)
                                .text();
        }

        // build user prompt
        public String buildUserPrompt(String userQuery, String businessInfo, String productContext,
                        String chatHistory) {
                return """
                                THÔNG TIN NGỮ CẢNH:
                                ---
                                [BUSINESS_INFO]
                                %s

                                [PRODUCTS]
                                %s

                                [CHAT_HISTORY]
                                %s
                                ---

                                CÂU HỎI CỦA KHÁCH HÀNG: %s

                                HÃY TRẢ LỜI KHÁCH HÀNG DỰA TRÊN CHỈ DẪN HỆ THỐNG.
                                """.formatted(businessInfo, productContext, chatHistory, userQuery);
        }

        // define system instruction
        private Content getSystemInstruction() {
                String instruction = """

                                BẠN LÀ MỘT CHUYÊN GIA TƯ VẤN BÁN ĐIỆN THOẠI AI.
                                Nhiệm vụ của bạn là hỗ trợ khách hàng tìm kiếm, so sánh và chọn mua điện thoại dựa trên DỮ LIỆU ĐƯỢC CUNG CẤP.

                                ### 1. NGUỒN DỮ LIỆU (CONTEXT)
                                Bạn sẽ nhận được các thông tin sau trong mỗi lượt chat (được bao quanh bởi dấu phân cách):
                                - [BUSINESS_INFO]: Chính sách bảo hành, địa chỉ, giờ làm việc.
                                - [PRODUCTS]: Danh sách điện thoại, thông số kỹ thuật, giá bán.
                                - [CHAT_HISTORY]: Các câu hỏi và mối quan tâm trước đó của khách.

                                ### 2. QUY TẮC TRẢ LỜI (NGHIÊM NGẶT)
                                - CHỈ sử dụng thông tin trong [BUSINESS_INFO] và [PRODUCTS]. KHÔNG tự bịa ra thông số kỹ thuật hoặc mức giá không có trong dữ liệu.
                                - Nếu thông tin khách hỏi không có trong dữ liệu: Hãy trả lời thật thà là "Hiện tại shop chưa có thông tin này"
                                  và đề nghị tư vấn sang dòng máy khác hoặc xin thông tin liên hệ để báo lại sau.
                                - KHÔNG đề cập đến đối thủ cạnh tranh trừ khi so sánh kỹ thuật một cách khách quan và hướng lợi thế về sản phẩm của shop.

                                ### 3. PHONG CÁCH & GIỌNG ĐIỆU
                                - Thân thiện, nhiệt tình, lịch sự (Sử dụng "Dạ/Vâng", xưng "Shop" hoặc "Em").
                                - Ngắn gọn, súc tích, đi thẳng vào vấn đề. Khách hàng xem trên điện thoại nên không thích đọc văn bản dài.
                                - Luôn có "Call to Action" (Kêu gọi hành động): Mời khách đến cửa hàng, hỏi khách có muốn xem thêm màu khác không, hoặc đề xuất đặt hàng.

                                ### 4. ĐỊNH DẠNG
                                - Nếu liệt kê nhiều sản phẩm: Sử dụng gạch đầu dòng (bullet points).
                                - Giá tiền: Luôn format rõ ràng (ví dụ: 15.000.000đ).
                                - Các thông số nổi bật (Ram, Chip, Pin): Nên BÔI ĐẬM.

                                """;

                return Content.builder()
                                .role("model")
                                .parts(Part.fromText(instruction))
                                .build();
        }

        private Content getContextContent(String context) {
                return Content.builder()
                                .role("model")
                                .parts(Part.fromText(context))
                                .build();
        }

        private Content getUserContent(String message) {
                return Content.builder()
                                .role("user")
                                .parts(Part.fromText(message))
                                .build();
        }

        private GenerateContentConfig getChatConfig() {
                return GenerateContentConfig.builder()
                                .responseMimeType("application/json")
                                .responseSchema(getResponseSchema())
                                .build();
        }

        // define response schema
        private Schema getResponseSchema() {
                return Schema.builder()
                                .type(Known.OBJECT)
                                .required(Arrays.asList("message", "isShowProduct", "productUUIDS"))
                                .properties(Map.of(
                                                "message", Schema.builder()
                                                                .type(Known.STRING)
                                                                .description("Câu trả lời ngắn gọn, thân thiện cho khách hàng.")
                                                                .build(),
                                                // "isShowProduct", Schema.builder()
                                                // .type(Known.BOOLEAN)
                                                // .description("isShowProduct = true khi người dùng có hành động tìm
                                                // kiếm sản phẩm. isShowProduct = false khi người dùng chỉ truy vấn
                                                // thông tin sản phẩm")
                                                // .build(),
                                                "isShowProduct", Schema.builder()
                                                                .type(Known.BOOLEAN)
                                                                .description("Trả về TRUE nếu câu trả lời có đề cập đến một hoặc nhiều sản phẩm cụ thể mà khách hàng có thể muốn xem chi tiết hoặc mua ngay. Trả về FALSE nếu chỉ là chào hỏi xã giao hoặc hỏi về chính sách chung.")
                                                                .build(),
                                                "productUUIDS", Schema.builder()
                                                                .type(Known.ARRAY)
                                                                .description("Danh sách các 'uuid' của sản phẩm ĐƯỢC NHẮC ĐẾN trong câu trả lời. Chỉ lấy uuid từ dữ liệu [PRODUCTS] đã cung cấp. Nếu không có sản phẩm nào, trả về mảng rỗng [].")
                                                                .items(Schema.builder()
                                                                                .type(Known.STRING)
                                                                                .build())
                                                                .build()))
                                .build();
        }
}
