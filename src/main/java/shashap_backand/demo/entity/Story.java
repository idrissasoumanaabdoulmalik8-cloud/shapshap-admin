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

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "promo")
    private String promo;  // ex: "-20%", "-15%", ou null

    @Column(name = "order_index")
    private int orderIndex;  // Ordre d'affichage (0, 1, 2...)

    @Column(name = "seen")
    private boolean seen;
}