package services.order.repo;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import services.order.model.entity.ExportEntity;

public interface ExportRepo extends JpaRepository<ExportEntity, UUID> {

}
