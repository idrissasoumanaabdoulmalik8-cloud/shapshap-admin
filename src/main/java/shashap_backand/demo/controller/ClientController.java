package shashap_backand.demo.controller;

import shashap_backand.demo.entity.Client;
import shashap_backand.demo.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "*")
public class ClientController {

    @Autowired
    private ClientService clientService;

    // ========== CRUD ==========

    @GetMapping
    public List<Client> getAllClients() {
        return clientService.getAllClients();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        Optional<Client> client = clientService.getClientById(id);
        return client.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/telephone/{telephone}")
    public ResponseEntity<Client> getClientByTelephone(@PathVariable String telephone) {
        Optional<Client> client = clientService.getClientByTelephone(telephone);
        return client.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Client> createClient(@RequestBody Client client) {
        // Vérifier si le client existe déjà
        Optional<Client> existing = clientService.getClientByTelephone(client.getTelephone());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(null);
        }
        Client savedClient = clientService.createClient(client);
        return new ResponseEntity<>(savedClient, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable Long id, @RequestBody Client client) {
        try {
            Client updatedClient = clientService.updateClient(id, client);
            return ResponseEntity.ok(updatedClient);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }

    // ========== STATISTIQUES ==========

    @GetMapping("/stats")
    public Map<String, Object> getClientStats() {
        return clientService.getClientStats();
    }

    // ========== RECHERCHE ==========

    @GetMapping("/search")
    public List<Client> searchClients(@RequestParam String nom) {
        return clientService.searchClientsByNom(nom);
    }

    @GetMapping("/fideles")
    public List<Client> getClientsFideles() {
        return clientService.getClientsFideles();
    }

    @GetMapping("/inactifs")
    public List<Client> getClientsInactifs() {
        return clientService.getClientsInactifs();
    }

    @GetMapping("/nouveaux")
    public List<Client> getClientsNouveaux() {
        return clientService.getClientsNouveaux();
    }

    @GetMapping("/top")
    public List<Client> getTopClients() {
        return clientService.getTopClients();
    }

    // ========== MISE À JOUR APRÈS COMMANDE ==========

    @PostMapping("/order-update")
    public ResponseEntity<Client> updateAfterOrder(@RequestParam String telephone,
                                                   @RequestParam Double montant) {
        Client client = clientService.updateAfterOrder(telephone, montant);
        return client != null ? ResponseEntity.ok(client) : ResponseEntity.notFound().build();
    }
}