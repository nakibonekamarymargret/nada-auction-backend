package com.kush.nada.models;

import com.kush.nada.enums.AuctionStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "auctions_table")
public class Auction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double startingPrice;   // Starting point for bidding
    private Double currentPrice;    // Current highest bid

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private AuctionStatus status;// SCHEDULED, LIVE, CLOSED


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;  // The auctioneer or organizer of the auction

    @OneToMany(mappedBy = "auction", fetch = FetchType.LAZY)
    private List<Product> products;  // List of products associated with this auction

    @OneToMany(mappedBy = "auction", fetch = FetchType.LAZY)
    private List<Bid> bids;
}
