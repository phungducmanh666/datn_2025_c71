package services.promotion.repo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import feign.Param;
import services.promotion.model.entity.PromotionConditionEntity;

public interface PromotionConditionRepository extends JpaRepository<PromotionConditionEntity, Long> {
  @Query("SELECT pc FROM PromotionConditionEntity pc " +
      "JOIN pc.promotion p " +
      "WHERE pc.minimumValue <= :totalDiscountAmount " +
      "AND p.status = 'ENABLE' " +
      "AND :now BETWEEN p.startAt AND p.endAt")
  List<PromotionConditionEntity> findValidPromotionsForProduct(
      @Param("totalDiscountAmount") Long totalDiscountAmount,
      @Param("now") LocalDateTime now);

  @Query("""
          SELECT pc FROM PromotionConditionEntity pc
          WHERE pc.id IN :ids
      """)
  List<PromotionConditionEntity> getByIds(
      @Param("ids") List<Long> ids);

}
