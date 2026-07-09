package shashap_backand.demo.repository;

import shashap_backand.demo.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByPhoneNumber(String phoneNumber);
    Optional<Favorite> findByPhoneNumberAndProductId(String phoneNumber, Long productId);
    void deleteByPhoneNumberAndProductId(String phoneNumber, Long productId);
    boolean existsByPhoneNumberAndProductId(String phoneNumber, Long productId);
}