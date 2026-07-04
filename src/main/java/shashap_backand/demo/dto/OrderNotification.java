package shashap_backand.demo.dto;

public class OrderNotification {

    private String action;       // "NEW_ORDER" ou "STATUS_CHANGED"
    private Long orderId;
    private String orderNumber;
    private String status;
    private String clientName;
    private double total;

    // Constructeur vide
    public OrderNotification() {
    }

    // Constructeur complet
    public OrderNotification(String action, Long orderId, String orderNumber,
                             String status, String clientName, double total) {
        this.action = action;
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.status = status;
        this.clientName = clientName;
        this.total = total;
    }

    // Getters & Setters
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
}