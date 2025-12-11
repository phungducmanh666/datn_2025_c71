// package services.product.core.config;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.web.reactive.config.CorsRegistry;
// import org.springframework.web.reactive.config.EnableWebFlux;
// import org.springframework.web.reactive.config.WebFluxConfigurer;

// @Configuration
// @EnableWebFlux
// public class CorsGlobalConfiguration implements WebFluxConfigurer {

//     @Override
//     public void addCorsMappings(CorsRegistry registry) {
//         registry.addMapping("/**")
//                 .allowedOrigins("*") // ✅ Sửa ở đây
//                 .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
//                 .allowedHeaders("*")
//                 .allowCredentials(false)
//                 .maxAge(3600)
//                 .exposedHeaders("*");
//     }
// }