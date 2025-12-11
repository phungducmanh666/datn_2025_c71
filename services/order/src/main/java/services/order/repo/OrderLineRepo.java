package services.order.repo;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import services.order.model.entity.OrderLineEntity;

@Repository
public interface OrderLineRepo extends JpaRepository<OrderLineEntity, UUID> {
}
