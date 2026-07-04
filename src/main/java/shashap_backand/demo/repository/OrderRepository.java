package shashap_backand.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import shashap_backand.demo.entity.Order;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Rechercher les commandes d'un client
    List<Order> findByClientId(Long clientId);

    // Rechercher les commandes par statut
    List<Order> findByStatus(String status);

    // Rechercher les commandes par numéro de commande
    Order findByOrderNumber(String orderNumber);
}