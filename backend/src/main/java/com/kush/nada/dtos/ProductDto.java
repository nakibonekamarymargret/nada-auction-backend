package com.kush.nada.dtos;

import com.kush.nada.enums.ProductCategory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductDto {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private BigDecimal highestPrice;
    private ProductCategory category;
    private LocalDateTime lastBidTime;
    private boolean isClosed; 
    private AuctionDto auction;

    public ProductDto() {}

     public ProductDto(Long id, String name, String description, String imageUrl,
                       BigDecimal highestPrice, ProductCategory category, LocalDateTime lastBidTime,
                       boolean isClosed, AuctionDto auction) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.highestPrice = highestPrice;
        this.category = category;
        this.lastBidTime = lastBidTime;
        this.isClosed = isClosed;
        this.auction = auction;
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public BigDecimal getHighestPrice() { return highestPrice; }
    public void setHighestPrice(BigDecimal highestPrice) { this.highestPrice = highestPrice; }
    public ProductCategory getCategory() { return category; }
    public void setCategory(ProductCategory category) { this.category = category; }
    public LocalDateTime getLastBidTime() { return lastBidTime; }
    public void setLastBidTime(LocalDateTime lastBidTime) { this.lastBidTime = lastBidTime; }
    public boolean isClosed() { return isClosed; }
    public void setClosed(boolean closed) { isClosed = closed; }
    public AuctionDto getAuction() { return auction; }
    public void setAuction(AuctionDto auction) { this.auction = auction; }
}