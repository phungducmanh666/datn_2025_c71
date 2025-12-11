package services.promotion.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.promotion.model.constant.DiscountType;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "promotion_conditions")
@Builder
public class PromotionConditionEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "minimum_value", nullable = false)
  private Long minimumValue;

  @Enumerated(EnumType.STRING)
  @Column(name = "discount_type", nullable = false, length = 12)
  private DiscountType discountType;

  @Column(name = "discount_value", nullable = false)
  private Long discountValue;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "promotion_id", nullable = false)
  private PromotionEntity promotion;
}
