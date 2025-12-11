package services.product.api.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.repo.CustomerRepo;
import services.product.core.eum.EUserGender;
import services.product.core.model.database.CustomerData;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepo customerRepo;

    // #region crud
    public Mono<CustomerData> createCustomer(
            String firstName,
            String lastName,
            EUserGender gender,
            LocalDateTime birthDate,
            String phoneNumber,
            String email,
            String password,
            String photoUrl

    ) {
        return customerRepo.createCustomer(firstName, lastName, birthDate, gender, phoneNumber, email, password,
                photoUrl);
    }

    public Mono<CustomerData> getCustomer(UUID uuid) {
        return customerRepo.getCustomer(uuid);
    }

    public Mono<CustomerData> getCustomer(String email) {
        return customerRepo.getCustomer(email);
    }

    public Flux<CustomerData> getCustomers(Integer page, Integer size, String sort,
            String search) {
        return customerRepo.getCustomers(page, size, sort, search);
    }

    public Mono<Long> updateFirstName(UUID uuid, String value) {
        return customerRepo.updateFirstName(uuid, value);
    }

    public Mono<Long> updateLastName(UUID uuid, String value) {
        return customerRepo.updateLastName(uuid, value);
    }

    public Mono<Long> updateGender(UUID uuid, EUserGender value) {
        return customerRepo.updateGender(uuid, value);
    }

    public Mono<Long> updateBirthDate(UUID uuid, LocalDateTime value) {
        return customerRepo.updateBirthDate(uuid, value);
    }

    public Mono<Long> updatePhoneNumber(UUID uuid, String value) {
        return customerRepo.updatePhoneNumber(uuid, value);
    }

    public Mono<Long> updateAddress(UUID uuid, String value) {
        return customerRepo.updateAddress(uuid, value);
    }

    public Mono<Long> updatePhotoUrl(UUID uuid, String value) {
        return customerRepo.updatePhotoUrl(uuid, value);
    }

    public Mono<Long> deleteCustomer(UUID uuid) {
        return customerRepo.deleteCustomer(uuid);
    }

    public Mono<Long> countByFilter(String search) {
        return customerRepo.countByFilter(search);
    }

    public Mono<Boolean> existsByEmail(String email) {
        return customerRepo.existsByEmail(email);
    }

    public Mono<Long> countAllCustomer() {
        return customerRepo.countAllCustomer();
    }
}
