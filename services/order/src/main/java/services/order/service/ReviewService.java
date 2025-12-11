package services.order.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import services.order.model.entity.OrderLineEntity;
import services.order.model.entity.ReviewEntity;
import services.order.model.response.ReviewResponse;
import services.order.repo.OrderLineRepo;
import services.order.repo.ReviewRepo;

@Service
@RequiredArgsConstructor
public class ReviewService {

  private final OrderLineRepo orderLineRepo;
  private final ReviewRepo reviewRepo;

  public void createReview(UUID orderLineUUID, String content, Integer star) {
    OrderLineEntity orderLineEntity = findOrderLineEntity(orderLineUUID);

    ReviewEntity reviewEntity = new ReviewEntity();
    reviewEntity.setContent(content);
    reviewEntity.setStar(star);
    reviewEntity.setOrderLine(orderLineEntity);

    orderLineEntity.setReview(reviewEntity);

    orderLineRepo.save(orderLineEntity);
  }

  public OrderLineEntity findOrderLineEntity(UUID uuid) {
    return orderLineRepo.findById(uuid).orElseThrow(() -> new RuntimeException("Entity not found"));
  }

  public List<ReviewResponse> getReviews(UUID productUUID) {
    List<ReviewEntity> reviews = getAllReviewsByProductUUID(productUUID);
    return reviews.stream().map(ReviewResponse::fromEntity).toList();
  }

  public List<ReviewEntity> getAllReviewsByProductUUID(UUID productUUID) {
    // Sử dụng Query Method đã định nghĩa trong Repository
    return reviewRepo.findByOrderLine_ProductUUID(productUUID);
  }

}