package services.product.api.controller;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.service.CustomerService;
import services.product.core.eum.EUserGender;
import services.product.core.model.database.CustomerData;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {
  private final CustomerService customerService;

  // #region crud
  @PostMapping
  public Mono<ResponseEntity<CustomerData>> createCustomer(
      @RequestParam(name = "first-name") String firstName,
      @RequestParam(name = "last-name") String lastName,
      @RequestParam(required = false) EUserGender gender,
      @RequestParam(name = "birth-date") LocalDateTime birthDate,
      @RequestParam(name = "phone-number") String phoneNumber,
      @RequestParam String email,
      @RequestParam String password) {
    return customerService.createCustomer(firstName, lastName, gender, birthDate, phoneNumber, email, password, null)
        .map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping(produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<CustomerData>>> getCustomers(
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) String sort,
      @RequestParam(required = false) String search) {

    Flux<CustomerData> items = customerService.getCustomers(page, size, sort, search);
    Mono<Long> total = customerService.countByFilter(search);

    return total.map(count -> {

      HttpHeaders headers = new HttpHeaders();
      headers.add("X-Total-Items", String.valueOf(count));
      if (page != null) {
        headers.add("X-Current-Page", String.valueOf(page));
      }
      if (size != null) {
        headers.add("X-Page-Size", String.valueOf(size));
      }

      return ResponseEntity.ok()
          .headers(headers)
          .body(items);

    });
  }

  @GetMapping("/{uuid}")
  public Mono<ResponseEntity<CustomerData>> getCustomer(@PathVariable UUID uuid) {
    return customerService.getCustomer(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/first-name")
  public Mono<ResponseEntity<Long>> updateFirstName(
      @PathVariable UUID uuid,
      @RequestParam(name = "first-name") String value) {
    return customerService.updateFirstName(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/last-name")
  public Mono<ResponseEntity<Long>> updateLastName(
      @PathVariable UUID uuid,
      @RequestParam(name = "last-name") String value) {
    return customerService.updateLastName(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/gender")
  public Mono<ResponseEntity<Long>> updateGender(
      @PathVariable UUID uuid,
      @RequestParam(name = "gender") EUserGender value) {
    return customerService.updateGender(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/birth-date")
  public Mono<ResponseEntity<Long>> updateBirthDate(
      @PathVariable UUID uuid,
      @RequestParam(name = "birth-date") LocalDateTime value) {
    return customerService.updateBirthDate(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/phone-number")
  public Mono<ResponseEntity<Long>> updatePhoneNumber(
      @PathVariable UUID uuid,
      @RequestParam(name = "phone-number") String value) {
    return customerService.updatePhoneNumber(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/photo-url")
  public Mono<ResponseEntity<Long>> updatePhotoUrl(
      @PathVariable UUID uuid,
      @RequestParam(name = "photo-url") String value) {
    return customerService.updatePhotoUrl(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/address")
  public Mono<ResponseEntity<Long>> updateAddress(
      @PathVariable UUID uuid,
      @RequestParam(name = "address") String value) {
    return customerService.updateAddress(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @DeleteMapping("/{uuid}")
  public Mono<ResponseEntity<Long>> deleteCustomer(
      @PathVariable UUID uuid) {
    return customerService.deleteCustomer(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping("/check-name")
  public Mono<ResponseEntity<Boolean>> checkEmailExists(@RequestParam String email) {
    return customerService.existsByEmail(email).map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping("/count-statistics")
  public Mono<ResponseEntity<Long>> countStatistics() {
    return customerService.countAllCustomer().map(rs -> ResponseEntity.ok().body(rs));
  }
}
