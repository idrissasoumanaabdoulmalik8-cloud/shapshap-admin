package shashap_backand.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import shashap_backand.demo.entity.Product;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Rechercher les produits par catégorie
    List<Product> findByCategory(String category);

    // Rechercher les produits disponibles
    List<Product> findByIsAvailableTrue();

    // Rechercher les produits par nom (contient, insensible à la casse)
    List<Product> findByNameContainingIgnoreCase(String name);

    // ✅ AJOUTÉ : Rechercher un produit par son nom EXACT
    // Utilisé par la synchronisation des stories
    Product findByName(String name);
}