package shashap_backand.demo.service;

import shashap_backand.demo.entity.Client;
import shashap_backand.demo.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    // ========== CRUD ==========

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Optional<Client> getClientById(Long id) {
        return clientRepository.findById(id);
    }

    public Optional<Client> getClientByTelephone(String telephone) {
        return clientRepository.findByTelephone(telephone);
    }

    @Transactional
    public Client createClient(Client client) {
        return clientRepository.save(client);
    }

    @Transactional
    public Client updateClient(Long id, Client clientDetails) {
        return clientRepository.findById(id)
                .map(client -> {
                    client.setNom(clientDetails.getNom());
                    client.setTelephone(clientDetails.getTelephone());
                    return clientRepository.save(client);
                })
                .orElseThrow(() -> new RuntimeException("Client non trouvé avec l'id: " + id));
    }

    @Transactional
    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }

    // ========== STATISTIQUES ==========

    public Map<String, Object> getClientStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalClients", clientRepository.count());
        stats.put("clientsFideles", clientRepository.findClientsFideles().size());
        stats.put("clientsInactifs", clientRepository.findClientsInactifs().size());
        stats.put("clientsNouveaux", clientRepository.findClientsNouveaux().size());
        stats.put("topClients", clientRepository.findTopClients());
        stats.put("totalDepense", clientRepository.findAll().stream()
                .mapToDouble(Client::getTotalDepense).sum());
        return stats;
    }

    // ========== RECHERCHE ==========

    public List<Client> searchClientsByNom(String nom) {
        return clientRepository.findByNomContainingIgnoreCase(nom);
    }

    public List<Client> getClientsFideles() {
        return clientRepository.findClientsFideles();
    }

    public List<Client> getClientsInactifs() {
        return clientRepository.findClientsInactifs();
    }

    public List<Client> getClientsNouveaux() {
        return clientRepository.findClientsNouveaux();
    }

    public List<Client> getTopClients() {
        return clientRepository.findTopClients();
    }

    // ========== MISE À JOUR APRÈS COMMANDE ==========

    @Transactional
    public Client updateAfterOrder(String telephone, Double montant) {
        return clientRepository.findByTelephone(telephone)
                .map(client -> {
                    client.ajouterCommande(montant);
                    return clientRepository.save(client);
                })
                .orElse(null);
    }
}