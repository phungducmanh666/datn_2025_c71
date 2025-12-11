package services.order.model.entity;

import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
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
@Table(name = "order_lines", uniqueConstraints = {
        @UniqueConstraint(name = "uk_order_product", columnNames = { "order_uuid", "product_uuid" })
})
public class OrderLineEntity {

    @Id
    @UuidGenerator
    private UUID uuid;

    @Column(name = "product_uuid", nullable = false)
    private UUID productUUID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_uuid", nullable = false)
    private OrderEntity order;

    @Column(name = "discount_id", nullable = true)
    private Long discountId;

    @Column(nullable = false)
    private Integer number;

    @Column(name = "unit_price", nullable = false)
    private Long unitPrice;

    @Column(name = "final_unit_price", nullable = false)
    private Long finalUnitPrice;

    // Quan hệ One-to-One với Review
    @OneToOne(mappedBy = "orderLine", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private ReviewEntity review;

    // Helper method
    public void setReview(ReviewEntity review) {
        this.review = review;
        if (review != null) {
            review.setOrderLine(this);
        }
    }
}
