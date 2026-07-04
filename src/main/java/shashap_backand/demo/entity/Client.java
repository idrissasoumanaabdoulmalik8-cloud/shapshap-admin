package shashap_backand.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(unique = true, nullable = false)
    private String telephone;

    @Column(name = "nombre_commandes", columnDefinition = "INT DEFAULT 0")
    private Integer nombreCommandes = 0;

    @Column(name = "total_depense", columnDefinition = "DOUBLE DEFAULT 0")
    private Double totalDepense = 0.0;

    @Column(name = "date_derniere_commande")
    private LocalDateTime dateDerniereCommande;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();

    // Constructeurs
    public Client() {}

    public Client(String nom, String telephone) {
        this.nom = nom;
        this.telephone = telephone;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public Integer getNombreCommandes() {
        return nombreCommandes;
    }

    public void setNombreCommandes(Integer nombreCommandes) {
        this.nombreCommandes = nombreCommandes;
    }

    public Double getTotalDepense() {
        return totalDepense;
    }

    public void setTotalDepense(Double totalDepense) {
        this.totalDepense = totalDepense;
    }

    public LocalDateTime getDateDerniereCommande() {
        return dateDerniereCommande;
    }

    public void setDateDerniereCommande(LocalDateTime dateDerniereCommande) {
        this.dateDerniereCommande = dateDerniereCommande;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    // Méthodes calculées
    @Transient
    public String getStatut() {
        if (nombreCommandes == 0) return "INACTIF";
        if (nombreCommandes >= 5) return "FIDÈLE";
        return "NOUVEAU";
    }

    @Transient
    public Double getPanierMoyen() {
        if (nombreCommandes == 0) return 0.0;
        return totalDepense / nombreCommandes;
    }

    // Méthode pour ajouter une commande
    public void ajouterCommande(Double montant) {
        this.nombreCommandes++;
        this.totalDepense += montant;
        this.dateDerniereCommande = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "Client{" +
                "id=" + id +
                ", nom='" + nom + '\'' +
                ", telephone='" + telephone + '\'' +
                ", nombreCommandes=" + nombreCommandes +
                ", totalDepense=" + totalDepense +
                ", statut=" + getStatut() +
                '}';
    }
}