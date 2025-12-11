package services.order.model.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "export_items", uniqueConstraints = {
    @UniqueConstraint(name = "uk_export_product", columnNames = { "export_uuid", "product_uuid" })
})
public class ExportItemEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID uuid;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "export_uuid", nullable = false)
  private ExportEntity export;

  @Column(name = "product_uuid", nullable = false)
  private UUID productUUID;

  @Column(name = "number", nullable = false)
  private Integer number;
}