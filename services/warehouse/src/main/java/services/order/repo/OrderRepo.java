package services.order.repo;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import services.order.model.entity.PurchaseOrderEntity;

public interface OrderRepo extends JpaRepository<PurchaseOrderEntity, UUID> {

}
