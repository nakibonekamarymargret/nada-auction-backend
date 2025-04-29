package com.kush.nada.models;

import com.kush.nada.enums.PaymentMethod;
import com.kush.nada.enums.PaymentStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments_table")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;              // Amount to be paid (the winning bid amount)

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus; // Status of the payment (PENDING, COMPLETED, etc.)

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod; // Payment method (CREDIT_CARD, PAYPAL, etc.)

    private LocalDateTime paymentDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;  // The user who made the payment

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_id")
    private Bid bid;  // The bid associated with the payment (optional)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id")
    private Auction auction;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id") // Foreign key column
    private Product product;

    public Payment() {
    }

    public Payment(Long id, Double amount, PaymentStatus paymentStatus, PaymentMethod paymentMethod, LocalDateTime paymentDate, UserEntity user, Bid bid, Auction auction, Product product) {
        this.id = id;
        this.amount = amount;
        this.paymentStatus = paymentStatus;
        this.paymentMethod = paymentMethod;
        this.paymentDate = paymentDate;
        this.user = user;
        this.bid = bid;
        this.auction = auction;
        this.product = product;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public Bid getBid() {
        return bid;
    }

    public void setBid(Bid bid) {
        this.bid = bid;
    }

    public Auction getAuction() {
        return auction;
    }

    public void setAuction(Auction auction) {
        this.auction = auction;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }
}
