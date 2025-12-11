package services.gateway.filter;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import services.gateway.model.TokenParserData;

import java.util.List;
import java.util.function.Consumer;

@Component
public class AuthFilter implements GlobalFilter, Ordered {

    private static final String AUTH_STATUS_HEADER = "X-Auth-Status";
    private static final List<String> USER_HEADERS = List.of(
            "X-User-UUID", 
            "X-Username", 
            "X-User-Type", 
            "X-User-Roles", 
            "X-User-Permissions"
    );
    private final WebClient webClient;

    public AuthFilter(WebClient.Builder webClientBuilder) {
        // Build WebClient một lần trong constructor
        this.webClient = webClientBuilder.build(); 
    }

    /**
     * Hàm Mutate để xoá tất cả các header liên quan đến User và thêm header Auth Status
     * @param initialRequest Request gốc
     * @param status Trạng thái xác thực (AUTHENTICATED/UNAUTHENTICATED)
     * @return Request đã được sửa đổi (mutated request)
     */
    private ServerHttpRequest createBaseRequest(ServerHttpRequest initialRequest, String status) {
        return initialRequest.mutate()
                .headers(httpHeaders -> {
                    // 1. Xoá tất cả các header User để tránh giả mạo
                    USER_HEADERS.forEach(httpHeaders::remove);
                    // 2. Thêm hoặc cập nhật header Auth Status
                    httpHeaders.set(AUTH_STATUS_HEADER, status);
                })
                .build();
    }
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String token = exchange.getRequest().getHeaders().getFirst("X-TOKEN");

        // 1. Khởi tạo request cơ sở với trạng thái mặc định (UNAUTHENTICATED)
        ServerHttpRequest baseRequest = createBaseRequest(exchange.getRequest(), "UNAUTHENTICATED");
        
        // 2. Nếu không có token -> Cho request SẠCH đi tiếp
        if (token == null || token.isBlank()) {
            System.out.println("-> No token found. Passing UNAUTHENTICATED request.");
            return chain.filter(exchange.mutate().request(baseRequest).build());
        }
        
        System.out.println("-> Token found. Calling user service for validation.");

        // 3. Có token -> Gọi dịch vụ xác thực
        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .host("user")
                        .path("/auths/token/parser")
                        .queryParam("token", token)
                        .build())
                .retrieve()
                // Xử lý response thành công (2xx) hoặc lỗi (4xx, 5xx)
                .toEntity(TokenParserData.class)
                .flatMap(response -> {
                    // Trạng thái thành công 2xx và body có dữ liệu
                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        return handleSuccessfulAuth(exchange, chain, baseRequest, response.getBody());
                    } else {
                        // Trạng thái thất bại (ví dụ: 401 Unauthorized)
                        System.out.println("-> Auth failed. Status: " + response.getStatusCode());
                        return chain.filter(exchange.mutate().request(baseRequest).build()); // Request UNAUTHENTICATED đi tiếp
                    }
                })
                .onErrorResume(e -> {
                    // Lỗi hệ thống/mạng (WebClientException)
                    System.err.println("-> Error connecting to user service: " + e.getMessage());
                    // Dù lỗi xảy ra, vẫn cho request đi tiếp với header mặc định
                    return chain.filter(exchange.mutate().request(baseRequest).build());
                });
    }

    /**
     * Xử lý khi xác thực thành công: Thêm các header user vào request
     */
    private Mono<Void> handleSuccessfulAuth(
            ServerWebExchange exchange, 
            GatewayFilterChain chain, 
            ServerHttpRequest baseRequest, 
            TokenParserData data
    ) {
        System.out.println("-> Auth successful for user: " + data.getUsername());
        
        ServerHttpRequest authenticatedRequest = baseRequest.mutate()
                // Ghi đè trạng thái thành AUTHENTICATED
                .header(AUTH_STATUS_HEADER, "AUTHENTICATED") 
                // Thêm các header thông tin người dùng
                .header("X-User-UUID", data.getUserUUID().toString())
                .header("X-Username", data.getUsername())
                .header("X-User-Type", data.getType().name())
                .header("X-User-Roles", String.join(",", data.getRoles()))
                .header("X-User-Permissions", String.join(",", data.getPermissions()))
                .build();
        
        return chain.filter(exchange.mutate().request(authenticatedRequest).build());
    }

    @Override
    public int getOrder() {
        // Đảm bảo Filter chạy trước các Route Filter khác
        return -1; 
    }
}