package services.order.model.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
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
@Table(name = "delivery_infos")
public class DeliveryInfomationEntity {
    @Id
    @Column(name = "order_uuid")
    private UUID orderUUID;

    @Column(name = "recipient_name", columnDefinition = "NVARCHAR(50)")
    private String recipientName;

    @Column(name = "recipient_phone_number", columnDefinition = "NVARCHAR(12)")
    private String recipientPhoneNumber;

    @Column(name = "delivery_address", columnDefinition = "NVARCHAR(200)")
    private String deliveryAddress;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "order_uuid")
    private OrderEntity order;
}
