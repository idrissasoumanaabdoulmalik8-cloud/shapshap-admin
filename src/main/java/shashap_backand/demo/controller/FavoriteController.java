package shashap_backand.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import shashap_backand.demo.entity.Favorite;
import shashap_backand.demo.entity.Product;
import shashap_backand.demo.repository.FavoriteRepository;
import shashap_backand.demo.repository.ProductRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*")
public class FavoriteController {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private ProductRepository productRepository;

    // ================================================
    // Liste complète des produits favoris d'un client
    // ================================================
    @GetMapping("/{phoneNumber}")
    public List<Product> getFavorites(@PathVariable String phoneNumber) {
        List<Favorite> favorites = favoriteRepository.findByPhoneNumber(phoneNumber);
        List<Product> products = new ArrayList<>();
        for (Favorite fav : favorites) {
            productRepository.findById(fav.getProductId()).ifPresent(products::add);
        }
        return products;
    }

    // ================================================
    // Juste les IDs favoris (plus léger, utile pour l'app
    // pour savoir quels coeurs afficher pleins)
    // ================================================
    @GetMapping("/{phoneNumber}/ids")
    public List<Long> getFavoriteIds(@PathVariable String phoneNumber) {
        List<Long> ids = new ArrayList<>();
        for (Favorite fav : favoriteRepository.findByPhoneNumber(phoneNumber)) {
            ids.add(fav.getProductId());
        }
        return ids;
    }

    // ================================================
    // Ajouter un favori
    // Body attendu : { "phoneNumber": "...", "productId": 12 }
    // ================================================
    @PostMapping
    public Favorite addFavorite(@RequestBody Map<String, Object> body) {
        String phoneNumber = (String) body.get("phoneNumber");
        Long productId = Long.valueOf(body.get("productId").toString());

        return favoriteRepository.findByPhoneNumberAndProductId(phoneNumber, productId)
                .orElseGet(() -> favoriteRepository.save(new Favorite(phoneNumber, productId)));
    }

    // ================================================
    // Retirer un favori
    // ================================================
    @DeleteMapping("/{phoneNumber}/{productId}")
    public void removeFavorite(@PathVariable String phoneNumber, @PathVariable Long productId) {
        favoriteRepository.deleteByPhoneNumberAndProductId(phoneNumber, productId);
    }
}