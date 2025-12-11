// package services.order.specification;

// import java.util.UUID;

// import org.springframework.data.jpa.domain.Specification;

// import services.order.model.constant.OrderStatus;
// import services.order.model.entity.OrderEntity;

// public class OrderSpecification {

// /**
// * Specification để filter theo status
// */
// public static Specification<OrderEntity> hasStatus(OrderStatus status) {
// return (root, query, criteriaBuilder) -> {
// if (status == null) {
// return criteriaBuilder.conjunction(); // No filter
// }
// return criteriaBuilder.equal(root.get("status"), status);
// };
// }

// /**
// * Specification để filter theo customerUUID
// */
// public static Specification<OrderEntity> hasCustomerUUID(UUID customerUUID) {
// return (root, query, criteriaBuilder) -> {
// if (customerUUID == null) {
// return criteriaBuilder.conjunction(); // No filter
// }
// return criteriaBuilder.equal(root.get("customerUUID"), customerUUID);
// };
// }

// /**
// * Combine multiple specifications
// */
// public static Specification<OrderEntity> filterOrders(OrderStatus status,
// UUID customerUUID) {
// return Specification
// .where(hasStatus(status))
// .and(hasCustomerUUID(customerUUID));
// }
// }
