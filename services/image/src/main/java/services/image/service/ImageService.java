package services.image.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;

import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
public class ImageService {

    @Value("${image.upload.dir}")
    private String uploadDir;

    // Upload file, trả về tên file đã tạo
    public Mono<String> upload(FilePart filePart) {
        String newFileName = UUID.randomUUID().toString();
        Path path = Paths.get(uploadDir, newFileName);

        try {
            Files.createDirectories(path.getParent());
        } catch (Exception e) {
            return Mono.error(e);
        }

        return filePart.transferTo(path)
                .then(Mono.just(newFileName));
    }

    // Lấy file dưới dạng Path
    public Mono<Path> getImage(String filename) {
        Path path = Paths.get(uploadDir, filename);
        return Mono.fromCallable(() -> {
            if (!Files.exists(path)) {
                return null;
            }
            return path;
        })
                .subscribeOn(Schedulers.boundedElastic()) // chuyển blocking sang thread riêng
                .flatMap(p -> p == null ? Mono.empty() : Mono.just(p));
    }
}
