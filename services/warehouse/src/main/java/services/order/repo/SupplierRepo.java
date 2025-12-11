package services.order.repo;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import services.order.model.entity.SupplierEntity;

public interface SupplierRepo extends JpaRepository<SupplierEntity, UUID> {
  Optional<SupplierEntity> findByName(String name);
}
