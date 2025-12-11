package services.order.repo;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import services.order.model.entity.StockEntity;

public interface StockRepo extends JpaRepository<StockEntity, UUID> {

}
