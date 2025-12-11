package services.order.model.entity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "exports")
public class ExportEntity {

  @Id
  @UuidGenerator
  private UUID uuid;

  @Column(name = "order_uuid", nullable = false)
  private UUID orderUUID;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @OneToMany(fetch = FetchType.LAZY, mappedBy = "export", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<ExportItemEntity> items;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}