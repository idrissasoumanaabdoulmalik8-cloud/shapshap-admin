package shashap_backand.demo.repository;

import shashap_backand.demo.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    // Chercher par téléphone
    Optional<Client> findByTelephone(String telephone);

    // Chercher par nom (insensible à la casse)
    List<Client> findByNomContainingIgnoreCase(String nom);

    // Clients fidèles (5+ commandes)
    @Query("SELECT c FROM Client c WHERE c.nombreCommandes >= 5")
    List<Client> findClientsFideles();

    // Clients inactifs (0 commandes)
    @Query("SELECT c FROM Client c WHERE c.nombreCommandes = 0")
    List<Client> findClientsInactifs();

    // Clients nouveaux (1-4 commandes)
    @Query("SELECT c FROM Client c WHERE c.nombreCommandes BETWEEN 1 AND 4")
    List<Client> findClientsNouveaux();

    // Top clients par total dépensé
    @Query("SELECT c FROM Client c ORDER BY c.totalDepense DESC")
    List<Client> findTopClients();
}