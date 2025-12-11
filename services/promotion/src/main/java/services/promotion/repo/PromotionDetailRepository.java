package services.promotion.repo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import feign.Param;
import services.promotion.model.entity.PromotionDetailEntity;

public interface PromotionDetailRepository extends JpaRepository<PromotionDetailEntity, Long> {

  @Query("SELECT pd FROM PromotionDetailEntity pd " +
      "JOIN pd.promotion p " +
      "WHERE pd.productUUID = :productUUID " +
      "AND p.status = 'ENABLE' " +
      "AND :now BETWEEN p.startAt AND p.endAt")
  List<PromotionDetailEntity> findValidPromotionsForProduct(
      @Param("productUUID") UUID productUUID,
      @Param("now") LocalDateTime now);
}
