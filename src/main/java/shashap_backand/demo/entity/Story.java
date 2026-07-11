package shashap_backand.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "stories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Story {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = true)
    private Long productId; // ✅ NULLABLE maintenant : un événement n'a pas de produit lié

    @Column(name = "promo")
    private String promo;  // ex: "-20%", "-15%", ou null

    @Column(name = "order_index")
    private int orderIndex;  // Ordre d'affichage (0, 1, 2...)

    @Column(name = "seen")
    private boolean seen;

    // ✅ NOUVEAU : champs pour les stories "ÉVÉNEMENT" (soirée artiste, DJ, etc.)
    @Column(name = "is_event")
    private boolean isEvent;

    @Column(name = "event_date")
    private String eventDate; // ex: "Ven 12 Juil · 20h"

    @Column(name = "artist_name")
    private String artistName; // ex: "DJ Malik"

    @Column(name = "description", length = 1000)
    private String description; // description libre de l'événement

    // ✅ NOUVEAU : nom et image PROPRES à la story, utilisés uniquement
    // pour les événements (puisqu'il n'y a pas de Product lié dont on
    // pourrait tirer ces infos comme pour une story produit classique)
    @Column(name = "event_name")
    private String eventName;

    @Column(name = "event_image_url", length = 500)
    private String eventImageUrl;

    @Column(name = "start_date")
    private String startDate; // ex: "2026-07-19"

    @Column(name = "end_date")
    private String endDate;   // ex: "2026-07-20"
}