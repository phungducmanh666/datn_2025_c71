package services.promotion.model.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.promotion.model.constant.PromotionStatus;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "promotions")
@Builder
public class PromotionEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(length = 100)
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(length = 7, nullable = false)
  private PromotionStatus status;

  @Column(name = "start_at", nullable = false)
  private LocalDateTime startAt;
  @Column(name = "end_at", nullable = false)
  private LocalDateTime endAt;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "staff_uuid", nullable = false)
  private UUID staffUUID;

  @OneToMany(mappedBy = "promotion", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  @Builder.Default
  private List<PromotionConditionEntity> conditions = new ArrayList<>();

  @OneToMany(mappedBy = "promotion", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  @Builder.Default
  private List<PromotionDetailEntity> details = new ArrayList<>();

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
  }
}
