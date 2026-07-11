package shashap_backand.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;

public class ProductStory implements Serializable {

    private String name;
    private String imageUrl;
    private int imageResId;
    private String promoLabel;
    private int originalPrice;
    private int discountedPrice;
    private boolean isSeen;

    @JsonProperty("isEvent")
    private boolean isEvent;

    @JsonProperty("eventDate")
    private String eventDate;

    @JsonProperty("artistName")
    private String artistName;

    @JsonProperty("description")
    private String description;

    // ✅ NOUVEAU : dates de programmation
    @JsonProperty("startDate")
    private String startDate;

    @JsonProperty("endDate")
    private String endDate;

    // ==========================================
    // ✅ CONSTRUCTEUR VIDE (obligatoire pour la sérialisation)
    // ==========================================
    public ProductStory() {
    }

    // ==========================================
    // ✅ CONSTRUCTEUR COMPLET
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
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public int getImageResId() { return imageResId; }
    public void setImageResId(int imageResId) { this.imageResId = imageResId; }

    public String getPromoLabel() { return promoLabel; }
    public void setPromoLabel(String promoLabel) { this.promoLabel = promoLabel; }

    public int getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(int originalPrice) { this.originalPrice = originalPrice; }

    public int getDiscountedPrice() { return discountedPrice; }
    public void setDiscountedPrice(int discountedPrice) { this.discountedPrice = discountedPrice; }

    public boolean isSeen() { return isSeen; }
    public void setSeen(boolean seen) { this.isSeen = seen; }

    @JsonProperty("isEvent")
    public boolean getIsEvent() { return isEvent; }

    @JsonProperty("isEvent")
    public void setIsEvent(boolean isEvent) { this.isEvent = isEvent; }

    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }

    public String getArtistName() { return artistName; }
    public void setArtistName(String artistName) { this.artistName = artistName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    // ✅ NOUVEAU
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

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