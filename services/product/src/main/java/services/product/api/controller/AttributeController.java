package services.product.api.controller;

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
import services.product.api.service.AttributeGroupService;
import services.product.api.service.AttributeService;
import services.product.core.model.database.AttributeData;
import services.product.core.model.database.AttributeGroupData;

@RestController
@RequestMapping("/attributes")
@RequiredArgsConstructor
public class AttributeController {
  private final AttributeService attributeService;
  private final AttributeGroupService attributeGroupService;

  // #region attribute group
  @PostMapping("/groups")
  public Mono<ResponseEntity<AttributeGroupData>> createGroup(@RequestParam String name) {
    return attributeGroupService.create(name).map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping(value = "/groups", produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<AttributeGroupData>>> getGroupsByFilter(
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) String sort,
      @RequestParam(required = false) String search) {

    Flux<AttributeGroupData> items = attributeGroupService.getByFilter(page, size, sort, search);
    Mono<Long> total = attributeGroupService.countByFilter(search);

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

  @GetMapping("/groups/{uuid}")
  public Mono<ResponseEntity<AttributeGroupData>> getGroupByUUID(@PathVariable UUID uuid) {
    return attributeGroupService.getByUUID(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/groups/{uuid}/name")
  public Mono<ResponseEntity<Long>> updateGroupNameByUUID(
      @PathVariable UUID uuid,
      @RequestParam(name = "name") String value) {
    return attributeGroupService.updateNameByUUID(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @DeleteMapping("/groups/{uuid}")
  public Mono<ResponseEntity<Long>> deleteGroupByUUID(
      @PathVariable UUID uuid) {
    return attributeGroupService.deleteByUUID(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping("/groups/check-name")
  public Mono<ResponseEntity<Boolean>> checkGroupNameExists(@RequestParam String name) {
    return attributeGroupService.existsByName(name).map(rs -> ResponseEntity.ok().body(rs));
  }

  // #endregion

  // #region crud

  @PostMapping
  public Mono<ResponseEntity<AttributeData>> createAttribute(
      @RequestParam(name = "group-uuid") UUID groupUUID,
      @RequestParam String name) {
    return attributeService.create(groupUUID, name).map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping(produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<AttributeData>>> getAttributesByGroup(
      @RequestParam(name = "group-uuid") UUID groupUUID,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) String sort,
      @RequestParam(required = false) String search) {

    Flux<AttributeData> items = attributeService.getByFilter(groupUUID, page, size, sort, search);
    Mono<Long> total = attributeService.countByFilter(groupUUID, search);

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

  @GetMapping("/check-name")
  public Mono<ResponseEntity<Boolean>> checkAttributeNameExists(
      @RequestParam(name = "group-uuid") UUID groupUUID,
      @RequestParam String name) {
    return attributeService.existsByName(groupUUID, name).map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping("/{uuid}")
  public Mono<ResponseEntity<AttributeData>> getByUUID(@PathVariable UUID uuid) {
    return attributeService.getByUUID(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/name")
  public Mono<ResponseEntity<Long>> updateNameByUUID(
      @PathVariable UUID uuid,
      @RequestParam(name = "name") String value) {
    return attributeService.updateNameByUUID(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @DeleteMapping("/{uuid}")
  public Mono<ResponseEntity<Long>> deleteByUUID(
      @PathVariable UUID uuid) {
    return attributeService.deleteByUUID(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }
  // #endregion
}
