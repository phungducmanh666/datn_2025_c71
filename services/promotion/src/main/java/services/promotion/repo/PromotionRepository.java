package services.promotion.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import services.promotion.model.entity.PromotionEntity;

public interface PromotionRepository
                extends JpaRepository<PromotionEntity, Long>, JpaSpecificationExecutor<PromotionEntity> {
}
