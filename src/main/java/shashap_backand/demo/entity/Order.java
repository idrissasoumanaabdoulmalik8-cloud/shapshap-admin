package shashap_backand.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderNumber;
    private String customerName;
    private String phoneNumber;
    private LocalDateTime orderDate;
    private Double totalAmount;
    private String status;
    private String paymentMethod;
    private Boolean isTakeaway;
    private String address;

    // ✅ NOUVEAU : coordonnées GPS choisies via la carte intégrée (Android)
    private Double latitude;
    private Double longitude;

    @Column(name = "client_id")
    private Long clientId;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();
    // Constructeurs
    public Order() {}

    public Order(String orderNumber, String customerName, String phoneNumber,
                 Double totalAmount, String status, String paymentMethod,
                 Boolean isTakeaway, String address, Long clientId) {
        this.orderNumber = orderNumber;
        this.customerName = customerName;
        this.phoneNumber = phoneNumber;
        this.orderDate = LocalDateTime.now();
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.isTakeaway = isTakeaway;
        this.address = address;
        this.clientId = clientId;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Boolean getIsTakeaway() {
        return isTakeaway;
    }

    public void setIsTakeaway(Boolean isTakeaway) {
        this.isTakeaway = isTakeaway;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
        // Permet de lier automatiquement chaque article à cette commande
        if (items != null) {
            for (OrderItem item : items) {
                item.setOrder(this);
            }
        }
    }

    @Override
    public String toString() {
        return "Order{" +
                "id=" + id +
                ", orderNumber='" + orderNumber + '\'' +
                ", customerName='" + customerName + '\'' +
                ", totalAmount=" + totalAmount +
                ", status='" + status + '\'' +
                '}';
    }
}