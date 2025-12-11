package services.order.repo;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import services.order.model.entity.ReciptEntity;

public interface ReciptRepo extends JpaRepository<ReciptEntity, UUID> {

}
