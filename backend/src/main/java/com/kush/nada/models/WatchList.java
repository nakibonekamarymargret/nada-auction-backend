package com.kush.nada.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "watchlist")
public class WatchList {

    @EmbeddedId
    private UserWishlistId id;

    @JsonIgnore
    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @JsonIgnore
    @ManyToOne
    @MapsId("productId")
    @JoinColumn(name = "product_id")
    private Product product;

    public WatchList() {
    }

    public WatchList(UserWishlistId id, UserEntity user, Product product) {
        this.id = id;
        this.user = user;
        this.product = product;
    }

    public UserWishlistId getId() {
        return id;
    }

    public void setId(UserWishlistId id) {
        this.id = id;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }
}