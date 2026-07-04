package shashap_backand.demo.dto;

import java.io.Serializable;

public class ProductStory implements Serializable {

    private String name;
    private String imageUrl;
    private int imageResId;
    private String promoLabel;
    private int originalPrice;
    private int discountedPrice;
    private boolean isSeen;

    // ==========================================
    // ✅ CONSTRUCTEUR VIDE (obligatoire pour la sérialisation)
    // ==========================================
    public ProductStory() {
    }

    // ==========================================
    // ✅ CONSTRUCTEUR COMPLET
    // Ordre : name, imageUrl, imageResId, promoLabel, originalPrice, discountedPrice, isSeen
    // ==========================================
    public ProductStory(String name, String imageUrl, int imageResId,
                        String promoLabel, int originalPrice, int discountedPrice,
                        boolean isSeen) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.imageResId = imageResId;
        this.promoLabel = promoLabel;
        this.originalPrice = originalPrice;
        this.discountedPrice = discountedPrice;
        this.isSeen = isSeen;
    }

    // ==========================================
    // GETTERS & SETTERS
    // ==========================================
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public int getImageResId() {
        return imageResId;
    }

    public void setImageResId(int imageResId) {
        this.imageResId = imageResId;
    }

    public String getPromoLabel() {
        return promoLabel;
    }

    public void setPromoLabel(String promoLabel) {
        this.promoLabel = promoLabel;
    }

    public int getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(int originalPrice) {
        this.originalPrice = originalPrice;
    }

    public int getDiscountedPrice() {
        return discountedPrice;
    }

    public void setDiscountedPrice(int discountedPrice) {
        this.discountedPrice = discountedPrice;
    }

    public boolean isSeen() {
        return isSeen;
    }

    public void setSeen(boolean seen) {
        this.isSeen = seen;
    }

    @Override
    public String toString() {
        return "ProductStory{" +
                "name='" + name + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", promoLabel='" + promoLabel + '\'' +
                ", originalPrice=" + originalPrice +
                ", discountedPrice=" + discountedPrice +
                ", isSeen=" + isSeen +
                '}';
    }
}