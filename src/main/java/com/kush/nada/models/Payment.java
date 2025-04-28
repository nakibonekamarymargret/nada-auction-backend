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
}
