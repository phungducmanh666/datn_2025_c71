package services.order.model.entity;

import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
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
@Table(name = "shopping_carts")
public class ShoppingCartEntity {

  @Id
  @UuidGenerator
  @Column(name = "uuid", nullable = false, updatable = false)
  private UUID uuid;

  @Column(name = "customer_uuid", nullable = false)
  private UUID customerUUID;
  @Column(name = "product_uuid", nullable = false)
  private UUID productUUID;
}
