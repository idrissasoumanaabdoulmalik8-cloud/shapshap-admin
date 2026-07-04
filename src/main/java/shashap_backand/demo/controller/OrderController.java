package shashap_backand.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import shashap_backand.demo.entity.Order;
import shashap_backand.demo.entity.OrderItem;
import shashap_backand.demo.repository.OrderRepository;
import shashap_backand.demo.dto.OrderNotification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // ================================================
    // Récupérer toutes les commandes
    // ================================================
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // ================================================
    // Récupérer une commande par son ID
    // ================================================
    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    // ================================================
    // Récupérer les commandes d'un client
    // ================================================
    @GetMapping("/client/{clientId}")
    public List<Order> getOrdersByClient(@PathVariable Long clientId) {
        return orderRepository.findByClientId(clientId);
    }

    // ================================================
    // Récupérer les commandes par statut
    // ================================================
    @GetMapping("/status/{status}")
    public List<Order> getOrdersByStatus(@PathVariable String status) {
        return orderRepository.findByStatus(status);
    }

    // ================================================
    // Créer une nouvelle commande
    // ================================================
    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        if (order.getOrderDate() == null) {
            order.setOrderDate(LocalDateTime.now());
        }
        if (order.getStatus() == null) {
            order.setStatus("PENDING");
        }

        // Lier chaque article à la commande
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setOrder(order);
            }
        }

        Order savedOrder = orderRepository.save(order);

        // ✅ Notifier le site admin (WebSocket)
        OrderNotification notif = new OrderNotification(
                "NEW_ORDER",
                savedOrder.getId(),
                savedOrder.getOrderNumber() != null ? savedOrder.getOrderNumber() : "#" + savedOrder.getId(),
                savedOrder.getStatus(),
                savedOrder.getCustomerName() != null ? savedOrder.getCustomerName() : "Client",
                savedOrder.getTotalAmount() != null ? savedOrder.getTotalAmount() : 0.0
        );
        messagingTemplate.convertAndSend("/topic/orders", notif);
        System.out.println("📡 WebSocket envoyé : /topic/orders → NEW_ORDER (commande #" + savedOrder.getId() + ")");

        return savedOrder;
    }

    // ================================================
    // Mettre à jour le statut d'une commande
    // ================================================
    @PutMapping("/{id}/status")
    public Order updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        System.out.println("🟡 Méthode updateStatus appelée pour commande #" + id);
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null) {
            String newStatus = body.get("status");
            System.out.println("🔄 Changement statut : " + order.getStatus() + " → " + newStatus);
            order.setStatus(newStatus);
            Order savedOrder = orderRepository.save(order);
            System.out.println("💾 Commande sauvegardée");

            OrderNotification notif = new OrderNotification(
                    "STATUS_CHANGED",
                    savedOrder.getId(),
                    savedOrder.getOrderNumber() != null ? savedOrder.getOrderNumber() : "#" + savedOrder.getId(),
                    savedOrder.getStatus(),
                    savedOrder.getCustomerName() != null ? savedOrder.getCustomerName() : "Client",
                    savedOrder.getTotalAmount() != null ? savedOrder.getTotalAmount() : 0.0
            );
            messagingTemplate.convertAndSend("/topic/orders", notif);
            System.out.println("📡 WebSocket envoyé : /topic/orders → STATUS_CHANGED (commande #" + id + ")");
            return savedOrder;
        } else {
            System.out.println("❌ Commande #" + id + " introuvable !");
        }
        return null;
    }

    // ================================================
    // Supprimer une commande
    // ================================================
    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) {
        orderRepository.deleteById(id);
    }
}