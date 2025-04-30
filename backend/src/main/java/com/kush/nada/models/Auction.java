package com.kush.nada.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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


    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;  // The auctioneer or organizer of the auction

//    @JsonManagedReference // Allows serialization of products in auctions
//    @JsonIgnore
    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL , fetch = FetchType.LAZY)
    private List<Product> products;  // List of products associated with this auction

    @OneToMany(mappedBy = "auction", fetch = FetchType.LAZY)
    private List<Bid> bids;

    public Auction() {
    }

    public Auction(Long id, Double startingPrice, Double currentPrice, LocalDateTime startTime, LocalDateTime endTime, AuctionStatus status, UserEntity user, List<Product> products, List<Bid> bids) {
        this.id = id;
        this.startingPrice = startingPrice;
        this.currentPrice = currentPrice;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.user = user;
        this.products = products;
        this.bids = bids;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getStartingPrice() {
        return startingPrice;
    }

    public void setStartingPrice(Double startingPrice) {
        this.startingPrice = startingPrice;
    }

    public Double getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(Double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public AuctionStatus getStatus() {
        return status;
    }

    public void setStatus(AuctionStatus status) {
        this.status = status;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

    public List<Bid> getBids() {
        return bids;
    }

    public void setBids(List<Bid> bids) {
        this.bids = bids;
    }
}
