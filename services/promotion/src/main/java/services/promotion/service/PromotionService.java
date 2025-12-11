package services.promotion.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import services.promotion.model.constant.DiscountType;
import services.promotion.model.constant.PromotionStatus;
import services.promotion.model.entity.PromotionConditionEntity;
import services.promotion.model.entity.PromotionDetailEntity;
import services.promotion.model.entity.PromotionEntity;
import services.promotion.model.exception.BadRequestException;
import services.promotion.model.exception.NotFoundException;
import services.promotion.model.request.OrderREQ;
import services.promotion.model.request.PromotionREQ;
import services.promotion.model.response.PromotionConditionRES;
import services.promotion.model.response.PromotionDetailRES;
import services.promotion.model.response.PromotionRES;
import services.promotion.repo.PromotionConditionRepository;
import services.promotion.repo.PromotionDetailRepository;
import services.promotion.repo.PromotionRepository;
import services.promotion.specification.PromotionSpecification;

@Service
@RequiredArgsConstructor
public class PromotionService {
  private final PromotionRepository promotionRepository;
  private final PromotionDetailRepository promotionDetailRepository;
  private final PromotionConditionRepository promotionConditionRepository;

  @Transactional
  public PromotionRES createPromotion(PromotionREQ promotionREQ, UUID staffUUID) {
    if (promotionREQ.getConditions() != null && promotionREQ.getConditions().size() > 0) {
      return createPromotionWithMinimunMoney(promotionREQ, staffUUID);
    } else if (promotionREQ.getDetails() != null && promotionREQ.getDetails().size() > 0) {
      return createPromotionWithDiscountProducts(promotionREQ, staffUUID);
    }
    throw new BadRequestException(
        "Bạn đã tạo khuyến mãi với dữ liệu không hợp lệ, vui lòng cung cấp điều kiện khuyến mãi hoặc sản phẩm khuyến mãi.");
  }

  private PromotionRES createPromotionWithMinimunMoney(PromotionREQ promotionREQ, UUID staffUUID) {
    PromotionEntity promotionEntity = createPromotionEntity(promotionREQ, staffUUID);
    List<PromotionConditionEntity> promotionConditionEntities = new ArrayList<>();
    for (var promotionCondition : promotionREQ.getConditions()) {
      var promotionConditionEntity = PromotionConditionEntity.builder()
          .discountType(promotionCondition.getDiscountType())
          .discountValue(promotionCondition.getDiscountValue())
          .minimumValue(promotionCondition.getMinimumValue())
          .build();
      promotionConditionEntity.setPromotion(promotionEntity);
      promotionConditionEntities.add(promotionConditionEntity);
    }
    promotionEntity.setConditions(promotionConditionEntities);
    return PromotionRES.fromEntity(promotionRepository.save(promotionEntity));
  }

  private PromotionRES createPromotionWithDiscountProducts(PromotionREQ promotionREQ, UUID staffUUID) {
    PromotionEntity promotionEntity = createPromotionEntity(promotionREQ, staffUUID);
    List<PromotionDetailEntity> promotionDetailEntities = new ArrayList<>();
    for (var promotionCondition : promotionREQ.getDetails()) {
      var promotionDetailEntity = PromotionDetailEntity.builder()
          .discountType(promotionCondition.getDiscountType())
          .discountValue(promotionCondition.getDiscountValue())
          .productUUID(promotionCondition.getProductUUID())
          .build();
      promotionDetailEntity.setPromotion(promotionEntity);
      promotionDetailEntities.add(promotionDetailEntity);
    }
    promotionEntity.setDetails(promotionDetailEntities);
    return PromotionRES.fromEntity(promotionRepository.save(promotionEntity));
  }

  private PromotionEntity createPromotionEntity(PromotionREQ promotionREQ, UUID staffUUID) {
    return PromotionEntity.builder()
        .staffUUID(staffUUID)
        .title(promotionREQ.getTitle())
        .description(promotionREQ.getDescription())
        .startAt(promotionREQ.getStartAt())
        .endAt(promotionREQ.getEndAt())
        .status(PromotionStatus.ENABLE)
        .build();
  }

  public Page<PromotionRES> getPromotions(
      PromotionStatus status,
      int page,
      int size,
      String sort) {

    Pageable pageable = createPageable(page, size, sort);
    Specification<PromotionEntity> spec = PromotionSpecification.hasStatus(status);
    Page<PromotionEntity> promotionPage = promotionRepository.findAll(spec, pageable);
    return promotionPage.map(PromotionRES::fromEntity);
  }

  private Pageable createPageable(int page, int size, String sort) {
    if (sort == null || sort.trim().isEmpty()) {
      return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    String[] sortParams = sort.split(",");
    if (sortParams.length != 2) {
      throw new IllegalArgumentException(
          "Invalid sort format. Expected: 'fieldName,direction' (e.g., 'createdAt,DESC')");
    }

    String fieldName = sortParams[0].trim();
    String direction = sortParams[1].trim().toUpperCase();

    // Validate direction
    if (!direction.equals("ASC") && !direction.equals("DESC")) {
      throw new IllegalArgumentException(
          "Invalid sort direction: " + direction + ". Use 'ASC' or 'DESC'");
    }

    // Validate field name (optional but recommended)
    validateSortField(fieldName);

    Sort.Direction sortDirection = Sort.Direction.fromString(direction);

    Integer safePage = page;
    if (safePage == null || safePage < 0) {
      safePage = 0;
    }

    Integer safeSize = size;
    if (safeSize == null || safeSize < 1) {
      safeSize = 10;
    }

    return PageRequest.of(safePage, safeSize, Sort.by(sortDirection, fieldName));
  }

  private void validateSortField(String fieldName) {
    List<String> validFields = List.of(
        "id", "title", "status", "createdAt", "startAt", "endAt");

    if (!validFields.contains(fieldName)) {
      throw new IllegalArgumentException(
          "Invalid sort field: " + fieldName +
              ". Valid fields: " + String.join(", ", validFields));
    }
  }

  public PromotionRES getPromotion(Long id) {
    return PromotionRES.fromEntity(getPromotionEntity(id));
  }

  private PromotionEntity getPromotionEntity(Long id) {
    return promotionRepository.findById(id).orElseThrow(
        () -> new NotFoundException("Không tìm thấy khuyến mãi có id: " + id));
  }

  public void updatePromotionStatus(Long id, PromotionStatus status) {
    PromotionEntity promotionEntity = getPromotionEntity(id);
    promotionEntity.setStatus(status);
    promotionRepository.save(promotionEntity);
  }

  public void deletePromotion(Long id) {
    promotionRepository.delete(getPromotionEntity(id));
  }

  public List<PromotionRES> getOrderPromotions(OrderREQ orderREQ) {
    Specification<PromotionEntity> spec = PromotionSpecification.inTime(LocalDateTime.now());
    List<PromotionEntity> activePromotions = promotionRepository.findAll(spec);

    long orderTotal = orderREQ.calculateTotal();
    Set<UUID> orderProductUUIDs = orderREQ.getItems().stream()
        .map(item -> item.getProductUUID())
        .collect(Collectors.toSet());

    List<PromotionEntity> applicablePromotions = activePromotions.stream()
        .filter(promo -> isPromotionApplicable(promo, orderTotal, orderProductUUIDs))
        .collect(Collectors.toList());

    return applicablePromotions.stream()
        .map(PromotionRES::fromEntity)
        .collect(Collectors.toList());
  }

  private boolean isPromotionApplicable(PromotionEntity promotion, long orderTotal, Set<UUID> orderProductUUIDs) {
    boolean hasConditions = promotion.getConditions() != null && !promotion.getConditions().isEmpty();
    boolean hasDetails = promotion.getDetails() != null && !promotion.getDetails().isEmpty();

    if (hasConditions) {
      return promotion.getConditions().stream()
          .anyMatch(condition -> orderTotal >= condition.getMinimumValue());
    } else if (hasDetails) {
      return promotion.getDetails().stream()
          .anyMatch(detail -> orderProductUUIDs.contains(detail.getProductUUID()));
    }
    return false;
  }

  // #region check details discount (product discount)
  public List<PromotionDetailRES> getProductDiscount(UUID productUUID) {
    List<PromotionDetailEntity> validPromotions = promotionDetailRepository.findValidPromotionsForProduct(
        productUUID,
        LocalDateTime.now());

    if (validPromotions.isEmpty()) {
      return new ArrayList<>();
    }
    return PromotionDetailRES.fromEntities(validPromotions);

  }
  // #endregion

  // #region check condition discount
  public List<PromotionConditionRES> getPromotionConditionsForOrder(Long totalDiscountAmount) {
    List<PromotionConditionEntity> candidates = promotionConditionRepository.findValidPromotionsForProduct(
        totalDiscountAmount,
        LocalDateTime.now());

    if (candidates.isEmpty()) {
      return new ArrayList<>();
    }

    Map<Long, PromotionConditionEntity> bestConditionMap = candidates.stream()
        .collect(Collectors.toMap(
            // Key mapper
            condition -> condition.getPromotion().getId(),

            // Value mapper
            condition -> condition,

            // Merge function (SỬA Ở ĐÂY)
            (existing, replacement) -> {
              // Logic cũ: So sánh số tiền giảm -> existingValue >= replacementValue

              // Logic mới: So sánh minimumValue.
              // Cái nào có minimumValue cao hơn thì lấy (vì nó gần với giá trị đơn hàng hơn)
              if (existing.getMinimumValue() > replacement.getMinimumValue()) {
                return existing;
              } else if (existing.getMinimumValue() < replacement.getMinimumValue()) {
                return replacement;
              } else {
                // Trường hợp đặc biệt: Nếu minimumValue bằng nhau
                // Thì nên giữ lại cái nào giảm giá nhiều tiền hơn (hoặc tùy bạn chọn)
                long existingDiscount = calculateDiscountAmount(existing, totalDiscountAmount);
                long replacementDiscount = calculateDiscountAmount(replacement, totalDiscountAmount);
                return existingDiscount >= replacementDiscount ? existing : replacement;
              }
            }));

    return PromotionConditionRES.fromEntities(new ArrayList<>(bestConditionMap.values()));

  }

  private long calculateDiscountAmount(PromotionConditionEntity condition, Long totalDiscountAmount) {
    if (condition.getDiscountType() == DiscountType.PERCENTAGE) {
      // Ví dụ: 10% của 1 triệu là 100k
      return (long) (totalDiscountAmount * (condition.getDiscountValue() / 100.0));
    } else {
      // Ví dụ: Giảm trực tiếp 50k
      return condition.getDiscountValue();
    }
  }
  // #endregion

}
