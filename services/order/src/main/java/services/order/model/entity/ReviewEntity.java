package services.order.model.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

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
@Table(name = "reviews")
public class ReviewEntity {

  @Id
  @UuidGenerator
  private UUID uuid;

  @OneToOne(fetch = FetchType.LAZY)
  @MapsId
  @JoinColumn(name = "order_line_uuid")
  private OrderLineEntity orderLine;

  @Column(length = 1000, columnDefinition = "NVARCHAR(200)")
  private String content;

  @Column(nullable = false)
  private Integer star;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    if (createdAt == null) {
      createdAt = LocalDateTime.now();
    }
    // Validation
    if (star < 1 || star > 5) {
      throw new IllegalArgumentException("Star rating must be between 1 and 5");
    }
  }
}
