package services.promotion.service;

import org.springframework.stereotype.Service;

import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import services.promotion.model.response.PromotionDetailRES;
import services.promotion.repo.PromotionDetailRepository;

@Service
@RequiredArgsConstructor
public class PromotionDetailService {
  private final PromotionDetailRepository promotionDetailRepository;

  public PromotionDetailRES getPromotionDetail(Long id) {
    return PromotionDetailRES.fromEntity(
        promotionDetailRepository.findById(id).orElseThrow(() -> new NotFoundException("Khong tim thay khuyen mai")));
  }
}
