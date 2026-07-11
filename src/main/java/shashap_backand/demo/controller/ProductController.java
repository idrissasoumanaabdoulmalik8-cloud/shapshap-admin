package shashap_backand.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import shashap_backand.demo.entity.Product;
import shashap_backand.demo.entity.Story;
import shashap_backand.demo.repository.ProductRepository;
import shashap_backand.demo.repository.StoryRepository;
import shashap_backand.demo.dto.ProductStory;
import shashap_backand.demo.dto.StoryUpdateMessage;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final String UPLOAD_DIR = "uploads/";

    // ================================================
    // Récupérer tous les produits
    // ================================================
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // ================================================
    // Récupérer un produit par ID
    // ================================================
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productRepository.findById(id).orElse(null);
    }

    // ================================================
    // Récupérer les produits par catégorie
    // ================================================
    @GetMapping("/category/{category}")
    public List<Product> getProductsByCategory(@PathVariable String category) {
        return productRepository.findByCategory(category);
    }

    // ================================================
    // Créer un produit
    // ================================================
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    // ================================================
    // Modifier un produit
    // ================================================
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return productRepository.findById(id).map(existingProduct -> {

            if (productDetails.getName() != null) {
                existingProduct.setName(productDetails.getName());
            }
            if (productDetails.getPrice() != null) {
                existingProduct.setPrice(productDetails.getPrice());
            }
            if (productDetails.getCategory() != null) {
                existingProduct.setCategory(productDetails.getCategory());
            }
            if (productDetails.getImageUrl() != null) {
                existingProduct.setImageUrl(productDetails.getImageUrl());
            }
            if (productDetails.getIsAvailable() != null) {
                existingProduct.setIsAvailable(productDetails.getIsAvailable());
            }
            if (productDetails.getDiscount() != null) {
                existingProduct.setDiscount(productDetails.getDiscount());
            }
            if (productDetails.getIsStory() != null) {
                existingProduct.setIsStory(productDetails.getIsStory());
            }
            if (productDetails.getDescription() != null) {
                existingProduct.setDescription(productDetails.getDescription());
            }

            Product updatedProduct = productRepository.save(existingProduct);
            return ResponseEntity.ok(updatedProduct);
        }).orElse(ResponseEntity.notFound().build());
    }

    // ================================================
    // Supprimer un produit
    // ================================================
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
    }

    // ================================================
    // ⭐ UPLOAD D'IMAGE
    // ================================================
    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
                System.out.println("📁 Dossier uploads créé: " + UPLOAD_DIR);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;

            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String imageUrl = "/api/products/uploads/" + fileName;
            System.out.println("✅ Image uploadée: " + imageUrl);

            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur lors de l'upload: " + e.getMessage());
        }
    }

    // ================================================
    // Servir les images uploadées
    // ================================================
    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                }

                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .header(HttpHeaders.CONTENT_TYPE, contentType)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ================================================
    // ⭐⭐⭐ RÉCUPÉRER LES STORIES (POUR L'APP ANDROID)
    // ================================================
    @GetMapping("/stories")
    public List<ProductStory> getStories() {
        List<ProductStory> result = new ArrayList<>();
        List<Story> dbStories = storyRepository.findAllByOrderByOrderIndexAsc();

        System.out.println("📱 STORIES API appelée - Stories en BDD: " + dbStories.size());

        if (dbStories.isEmpty()) {
            System.out.println("⚠️ Aucune story en BDD - L'admin doit d'abord enregistrer les stories sur le site");
            return result;
        }

        for (Story s : dbStories) {

            // ✅ CAS ÉVÉNEMENT : pas de produit lié, on utilise les champs
            // propres de la Story (eventName / eventImageUrl)
            if (s.isEvent()) {
                ProductStory eventStory = new ProductStory(
                        s.getEventName() != null ? s.getEventName() : "Événement",
                        s.getEventImageUrl(),
                        0,
                        null,   // pas de promo sur un événement
                        0,
                        0,
                        s.isSeen()
                );
                eventStory.setIsEvent(true);
                eventStory.setEventDate(s.getEventDate());
                eventStory.setArtistName(s.getArtistName());
                eventStory.setDescription(s.getDescription());

                result.add(eventStory);
                System.out.println("✅ Story ÉVÉNEMENT #" + s.getOrderIndex() + " : " + s.getArtistName());
                continue;
            }

            Product p = productRepository.findById(s.getProductId()).orElse(null);

            if (p == null) {
                System.out.println("⏭️ Story ignorée : produit ID " + s.getProductId() + " introuvable");
                continue;
            }

            if (p.getIsAvailable() != null && !p.getIsAvailable()) {
                System.out.println("⏭️ Story ignorée : " + p.getName() + " (indisponible)");
                continue;
            }

            int originalPrice = (p.getPrice() != null) ? p.getPrice().intValue() : 0;
            int discountedPrice = originalPrice;
            String promoLabel = s.getPromo();

            if (promoLabel != null && !promoLabel.isEmpty()) {
                try {
                    String cleaned = promoLabel.replace("-", "").replace("%", "").trim();
                    int discountPercent = Integer.parseInt(cleaned);

                    if (discountPercent > 0 && discountPercent <= 100) {
                        discountedPrice = originalPrice - (originalPrice * discountPercent / 100);
                        System.out.println("🏷️ Promo " + p.getName() + ": " + promoLabel
                                + " | Prix: " + originalPrice + " → " + discountedPrice);
                    } else {
                        System.out.println("⚠️ Pourcentage invalide pour " + p.getName() + ": " + discountPercent);
                        promoLabel = null;
                    }
                } catch (NumberFormatException e) {
                    System.out.println("⚠️ Promo mal formatée pour " + p.getName() + ": " + promoLabel);
                    promoLabel = null;
                }
            }

            ProductStory productStory = new ProductStory(
                    p.getName(),
                    p.getImageUrl(),
                    0,
                    promoLabel,
                    originalPrice,
                    discountedPrice,
                    s.isSeen()
            );

            // ✅ Champs événement (soirée artiste, DJ, etc.)
            productStory.setIsEvent(s.isEvent());
            productStory.setEventDate(s.getEventDate());
            productStory.setArtistName(s.getArtistName());
            productStory.setDescription(s.getDescription());

            result.add(productStory);

            System.out.println("✅ Story #" + s.getOrderIndex() + " : " + p.getName()
                    + " | image=" + p.getImageUrl()
                    + " | promo=" + promoLabel
                    + " | prix=" + originalPrice + "/" + discountedPrice
                    + " | seen=" + s.isSeen());
        }

        System.out.println("📱 STORIES API - Total envoyé à l'app Android: " + result.size());
        return result;
    }

    // ================================================
    // ⭐⭐⭐ SYNCHRONISER LES STORIES (DEPUIS LE SITE)
    // ================================================
    @PostMapping("/stories/sync")
    public ResponseEntity<String> syncStories(@RequestBody List<ProductStory> stories) {
        try {
            System.out.println("📥 Réception de " + stories.size() + " stories depuis le site admin");

            // Supprimer toutes les anciennes stories
            storyRepository.deleteAll();
            System.out.println("🗑️ Anciennes stories supprimées");

            // Insérer les nouvelles stories dans l'ordre reçu
            for (int i = 0; i < stories.size(); i++) {
                ProductStory ps = stories.get(i);

                // ✅ CAS ÉVÉNEMENT : pas besoin de produit existant, on
                // stocke le nom/image directement sur la Story elle-même
                if (ps.getIsEvent()) {
                    Story eventStory = new Story();
                    eventStory.setProductId(null);
                    eventStory.setOrderIndex(i);
                    eventStory.setSeen(ps.isSeen());
                    eventStory.setEvent(true);
                    eventStory.setEventDate(ps.getEventDate());
                    eventStory.setArtistName(ps.getArtistName());
                    eventStory.setDescription(ps.getDescription());
                    eventStory.setEventName(ps.getName());
                    eventStory.setEventImageUrl(ps.getImageUrl());

                    storyRepository.save(eventStory);

                    System.out.println("💾 Story ÉVÉNEMENT sauvegardée #" + i + " : " + ps.getArtistName()
                            + " | image=" + ps.getImageUrl());
                    continue;
                }

                // Trouver le produit par son nom
                Product product = productRepository.findByName(ps.getName());

                if (product == null) {
                    System.out.println("⚠️ Produit introuvable pour la story: " + ps.getName());
                    continue;
                }

                // Créer la story
                Story story = new Story();
                story.setProductId(product.getId());
                story.setPromo(ps.getPromoLabel());
                story.setOrderIndex(i);
                story.setSeen(ps.isSeen());

                // ✅ Champs événement (toujours false ici, mais on les
                // initialise proprement pour éviter des valeurs nulles)
                story.setEvent(false);
                story.setEventDate(null);
                story.setArtistName(null);
                story.setDescription(null);

                storyRepository.save(story);

                System.out.println("💾 Story sauvegardée #" + i + " : " + product.getName()
                        + " | promo=" + ps.getPromoLabel()
                        + " | seen=" + ps.isSeen());
            }

            // ✅ ENVOYER UNE NOTIFICATION WEBSOCKET À TOUS LES CLIENTS CONNECTÉS
            StoryUpdateMessage msg = new StoryUpdateMessage("SYNC", stories.size());
            messagingTemplate.convertAndSend("/topic/stories", msg);
            System.out.println("📡 WebSocket envoyé : /topic/stories → SYNC (" + stories.size() + " stories)");

            System.out.println("✅ Synchronisation terminée : " + stories.size() + " stories");
            return ResponseEntity.ok("OK - " + stories.size() + " stories synchronisées");

        } catch (Exception e) {
            System.err.println("❌ Erreur synchronisation stories: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }
}