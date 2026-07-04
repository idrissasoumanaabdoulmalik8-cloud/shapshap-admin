package shashap_backand.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double price;
    private String category;

    @Column(length = 500)
    private String imageUrl;

    private Boolean isAvailable;

    // 🎯 AJOUT : Champ pour stocker le pourcentage de réduction (ex: 20 pour -20%)
    private Integer discount;

    // 🎯 NOUVEAU : true si le produit doit être affiché dans la frise des stories, false sinon
    private Boolean isStory;

    // Constructeurs
    public Product() {}

    // Constructeur complet mis à jour
    public Product(String name, Double price, String category, String imageUrl, Boolean isAvailable, Integer discount, Boolean isStory) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.imageUrl = imageUrl;
        this.isAvailable = isAvailable;
        this.discount = discount;
        this.isStory = isStory; // 👈 Initialisation du flag story
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public Double getPrice() { return price; }
    public String getCategory() { return category; }
    public String getImageUrl() { return imageUrl; }
    public Boolean getIsAvailable() { return isAvailable; }
    public Integer getDiscount() { return discount; }
    public Boolean getIsStory() { return isStory; } // 👈 AJOUTÉ

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setPrice(Double price) { this.price = price; }
    public void setCategory(String category) { this.category = category; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    public void setDiscount(Integer discount) { this.discount = discount; }
    public void setIsStory(Boolean isStory) { this.isStory = isStory; } // 👈 AJOUTÉ
}