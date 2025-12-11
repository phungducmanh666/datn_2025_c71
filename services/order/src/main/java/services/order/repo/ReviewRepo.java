package services.order.repo;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import services.order.model.entity.ReviewEntity;

@Repository
public interface ReviewRepo extends JpaRepository<ReviewEntity, UUID> {
  List<ReviewEntity> findByOrderLine_ProductUUID(UUID productUUID);
}
