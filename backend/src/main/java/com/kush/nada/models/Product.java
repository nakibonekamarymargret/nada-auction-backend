package com.kush.nada.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.kush.nada.enums.ProductCategory;
import jakarta.persistence.*;
import jakarta.persistence.Column;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;


@Entity
@Table(name = "products_table")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String imageUrl;
    private BigDecimal highestPrice;
    @Enumerated(EnumType.STRING)  // Store the enum as a string in the database
    private ProductCategory category;
    private LocalDateTime lastBidTime;
    private boolean isClosed = false;
    @Column(name = "last_bid_amount", precision = 19, scale = 2)
    private BigDecimal lastBidAmount;


    @JsonIgnore

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id")
    private Auction auction;


    // Add a helper method to simplify ID access
    public Long getAuctionId() {
        return auction != null ? auction.getId() : null;
    }

    @JsonIgnore
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    private List<Bid> bids;

    @JsonIgnore
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    private List<Payment> payments;

    public Product() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public BigDecimal getHighestPrice() {
        return highestPrice;
    }

    public void setHighestPrice(BigDecimal highestPrice) {
        this.highestPrice = highestPrice;
    }

    public ProductCategory getCategory() {
        return category;
    }

    public void setCategory(ProductCategory category) {
        this.category = category;
    }

    public LocalDateTime getLastBidTime() {
        return lastBidTime;
    }

    public void setLastBidTime(LocalDateTime lastBidTime) {
        this.lastBidTime = lastBidTime;
    }

    public boolean isClosed() {
        return isClosed;
    }

    public void setClosed(boolean closed) {
        isClosed = closed;
    }

    public BigDecimal getLastBidAmount() {
        return lastBidAmount;
    }

    public void setLastBidAmount(BigDecimal lastBidAmount) {
        this.lastBidAmount = lastBidAmount;
    }

    public Auction getAuction() {
        return auction;
    }

    public void setAuction(Auction auction) {
        this.auction = auction;
    }

    public List<Bid> getBids() {
        return bids;
    }

    public void setBids(List<Bid> bids) {
        this.bids = bids;
    }

    public List<Payment> getPayments() {
        return payments;
    }

    public void setPayments(List<Payment> payments) {
        this.payments = payments;
    }

    public Product(Long id, String name, String description, String imageUrl, BigDecimal highestPrice, ProductCategory category, LocalDateTime lastBidTime, boolean isClosed, BigDecimal lastBidAmount, Auction auction, List<Bid> bids, List<Payment> payments) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.highestPrice = highestPrice;
        this.category = category;
        this.lastBidTime = lastBidTime;
        this.isClosed = isClosed;
        this.lastBidAmount = lastBidAmount;
        this.auction = auction;
        this.bids = bids;
        this.payments = payments;
    }
}