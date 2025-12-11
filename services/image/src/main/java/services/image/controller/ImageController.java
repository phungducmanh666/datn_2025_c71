package services.image.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;
import services.image.service.ImageService;

@RestController
@RequestMapping("/images")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    // Upload hình ảnh
    @PostMapping("/upload")
    public Mono<String> uploadImage(@RequestPart("file") FilePart filePart) {
        return imageService.upload(filePart);
    }

    // Lấy hình ảnh theo tên
    @GetMapping(value = "/{filename}", produces = MediaType.IMAGE_JPEG_VALUE)
    public Mono<FileSystemResource> getImage(@PathVariable String filename) {
        return imageService.getImage(filename)
                .map(FileSystemResource::new);
    }

    // Stream hình ảnh (tương tự get nhưng trả reactive)
    @GetMapping(value = "/stream/{filename}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public Mono<FileSystemResource> streamImage(@PathVariable String filename) {
        return imageService.getImage(filename)
                .map(FileSystemResource::new);
    }
}
