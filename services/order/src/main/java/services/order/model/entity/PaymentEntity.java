package services.order.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
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
@Table(name = "payments")
public class PaymentEntity {
  @Id
  @OneToOne(fetch = FetchType.LAZY)
  @MapsId
  @JoinColumn(name = "order_uuid")
  private OrderEntity order;

  @Column(name = "payment_amount", nullable = true)
  private Long paymentAmount;

  @Column(name = "discount_amount", nullable = true)
  private Long discountAmount;

  @Column(nullable = true)
  private String apptransid;

  @Column(nullable = true)
  private Long zptransid;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
