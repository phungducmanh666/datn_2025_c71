package services.promotion.specification;

import java.time.LocalDateTime;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import services.promotion.model.constant.PromotionStatus;
import services.promotion.model.entity.PromotionEntity;

public class PromotionSpecification {

  /**
   * Specification để filter theo status
   */
  public static Specification<PromotionEntity> hasStatus(PromotionStatus status) {
    return (root, query, criteriaBuilder) -> {
      if (status == null) {
        return criteriaBuilder.conjunction(); // No filter
      }
      return criteriaBuilder.equal(root.get("status"), status);
    };
  }

  public static Specification<PromotionEntity> inTime(LocalDateTime now) {
    return (root, query, criteriaBuilder) -> {
      if (now == null) {
        return criteriaBuilder.conjunction(); // No filter
      }
      Predicate statusPredicate = criteriaBuilder.equal(root.get("status"), PromotionStatus.ENABLE);
      Predicate startAtPredicate = criteriaBuilder.lessThanOrEqualTo(root.get("startAt"), now);
      Predicate endAtPredicate = criteriaBuilder.greaterThanOrEqualTo(root.get("endAt"), now);
      return criteriaBuilder.and(statusPredicate, startAtPredicate, endAtPredicate);
    };
  }

}
