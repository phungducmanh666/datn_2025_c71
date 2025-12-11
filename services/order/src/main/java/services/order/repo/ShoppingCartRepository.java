package services.order.repo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import services.order.model.entity.ShoppingCartEntity;

@Repository
public interface ShoppingCartRepository extends JpaRepository<ShoppingCartEntity, UUID> {
  List<ShoppingCartEntity> findByCustomerUUID(UUID customerUuid);

  Optional<ShoppingCartEntity> findByCustomerUUIDAndProductUUID(UUID customerUuid, UUID productUuid);

}
