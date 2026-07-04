package shashap_backand.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import shashap_backand.demo.entity.Story;
import java.util.List;

@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {

    // Récupérer toutes les stories triées par ordre d'affichage
    List<Story> findAllByOrderByOrderIndexAsc();

    // Supprimer toutes les stories
    void deleteAll();
}