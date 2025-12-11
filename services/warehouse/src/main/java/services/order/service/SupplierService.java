package services.order.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import services.order.model.entity.SupplierEntity;
import services.order.model.response.SupplierDTO;
import services.order.repo.SupplierRepo;

@Service
@RequiredArgsConstructor
public class SupplierService {

  private final SupplierRepo supplierRepo;

  public SupplierEntity createSupplier(String name, String contactInfo, String address) {
    return supplierRepo.save(
        SupplierEntity.builder()
            .name(name)
            .contactInfo(contactInfo)
            .address(address)
            .build());
  }

  public Page<SupplierDTO> getSuppliers(Integer page, Integer size, String sort) {
    int currentPage = (page != null) ? page : 0;
    int pageSize = (size != null) ? size : Integer.MAX_VALUE;

    PageRequest pageRequest = createPageRequest(currentPage, pageSize, sort);
    return supplierRepo.findAll(pageRequest).map(SupplierDTO::fromEntity);
  }

  private PageRequest createPageRequest(int page, int size, String sort) {
    if (sort == null || sort.trim().isEmpty()) {
      return PageRequest.of(page, size);
    }

    String[] sortParts = sort.split(",");
    String sortField = sortParts[0].trim();
    Sort.Direction direction = Sort.Direction.ASC;

    if (sortParts.length > 1) {
      try {
        direction = Sort.Direction.fromString(sortParts[1].trim().toUpperCase());
      } catch (IllegalArgumentException e) {
        // Giữ mặc định ASC nếu direction không hợp lệ
      }
    }
    return PageRequest.of(page, size, Sort.by(direction, sortField));
  }

  public SupplierEntity findSupplier(UUID uuid) {
    return supplierRepo.findById(uuid).orElseThrow(() -> new RuntimeException("Not found entity"));
  }

  public Boolean isNameExists(String name) {
    try {
      supplierRepo.findByName(name).orElseThrow(() -> new RuntimeException("Not found entity"));
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  public void deleteSupplier(UUID uuid) {
    supplierRepo.deleteById(uuid);
  }

}
