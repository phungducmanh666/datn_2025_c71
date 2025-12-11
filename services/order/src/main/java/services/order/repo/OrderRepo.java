package services.order.repo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import services.order.model.constant.OrderStatus;
import services.order.model.entity.OrderEntity;
import services.order.model.query.OrderStatusCount;

@Repository
public interface OrderRepo extends JpaRepository<OrderEntity, UUID>, JpaSpecificationExecutor<OrderEntity> {
    /**
     * Tìm orders theo status với phân trang và sắp xếp
     */
    Page<OrderEntity> findByStatus(OrderStatus status, Pageable pageable);

    @Query("""
                SELECT o FROM OrderEntity o
                WHERE (:customerUUID IS NULL AND o.customerUUID IS NULL)
                   OR (:customerUUID IS NOT NULL AND o.customerUUID = :customerUUID)
            """)
    List<OrderEntity> findAllByCustomerUUIDOrNull(@Param("customerUUID") UUID customerUUID);

    @Query("""
            SELECT o.status as status, COUNT(o.uuid) as number
            FROM OrderEntity o
            GROUP
            BY o.status""")
    List<OrderStatusCount> countOrdersByStatusJPQL();

    @Query(value = "SELECT " +
            "    CAST(o.created_at AS DATE) AS Ngay, " +
            "    COUNT(o.uuid) AS TongSoDonHang, " +
            "    SUM(o.total_amount) AS TongTienTatCaDon, " +
            "    SUM(CASE WHEN o.status = 'SUCCESS' THEN (o.total_amount - o.total_saved) ELSE 0 END) AS TongTienThuDuoc "
            +
            "FROM " +
            "    orders o " + // Tên bảng SQL thực tế
            "WHERE " +
            "    o.created_at >= :startDate " +
            "    AND o.created_at < :endDate " +
            "GROUP BY " +
            "    CAST(o.created_at AS DATE) " +
            "ORDER BY " +
            "    Ngay ASC", nativeQuery = true)
    List<Object[]> getDailyOrderStatisticsNative(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

}
