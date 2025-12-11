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
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "order_lines", uniqueConstraints = {
    @UniqueConstraint(name = "uk_order_product", columnNames = { "order_uuid", "product_uuid" })
})
public class OrderLineEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID uuid;

  @Column(name = "product_uuid", nullable = false)
  private UUID productUUID;

  @Column(name = "order_number", nullable = false)
  private Integer orderNumber;

  @Column(name = "receipt_number", nullable = true)
  private Integer receiptNumber;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "purchase_order_uuid", nullable = false)
  private PurchaseOrderEntity purchaseOrder;

}
