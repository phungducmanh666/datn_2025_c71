package services.product.core.model.request;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestCreateProductData {

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class CatalogInfo {
    private UUID catalogUUID;
    private UUID brandUUID;
    private List<UUID> productLineUUIDS;
  }

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class ProductInfo {
    private String name;
    private BigDecimal price;
    private String photoUrl;
  }

  // @Data
  // @AllArgsConstructor
  // @NoArgsConstructor
  // public static class ProductVariant {
  // private String sku;
  // private BigDecimal price;
  // private List<UUID> optionUUIDS;
  // }

  private CatalogInfo metadata;
  private ProductInfo info;
  // private List<ProductVariant> variants;

}
