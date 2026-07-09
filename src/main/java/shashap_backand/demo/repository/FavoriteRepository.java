package shashap_backand.demo.repository;

import shashap_backand.demo.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByPhoneNumber(String phoneNumber);
    Optional<Favorite> findByPhoneNumberAndProductId(String phoneNumber, Long productId);

    @Transactional
    void deleteByPhoneNumberAndProductId(String phoneNumber, Long productId);

    boolean existsByPhoneNumberAndProductId(String phoneNumber, Long productId);
}