package services.order.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import services.order.model.response.ReviewResponse;
import services.order.service.ReviewService;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

  private final ReviewService reviewService;

  @PostMapping
  public ResponseEntity<Void> createReview(
      @RequestParam(name = "order-line-uuid") UUID orderLineUUID,
      @RequestParam String content,
      @RequestParam Integer star) {
    reviewService.createReview(orderLineUUID, content, star);
    return ResponseEntity.noContent().build();
  }

  @GetMapping
  public ResponseEntity<List<ReviewResponse>> getReviews(
      @RequestParam(name = "product-uuid") UUID productUUID) {
    List<ReviewResponse> reviews = reviewService.getReviews(productUUID);
    return ResponseEntity.ok(reviews);
  }

}
