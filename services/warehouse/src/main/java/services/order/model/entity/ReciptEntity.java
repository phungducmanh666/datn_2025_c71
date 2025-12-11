package services.order.model.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
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
@Table(name = "recipts")
public class ReciptEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID uuid;

  private String note;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
  @JoinColumn(name = "purchase_order_uuid", nullable = false)
  private PurchaseOrderEntity purchaseOrder;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }

}
