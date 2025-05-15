package com.kush.nada.models;

import java.io.Serializable;
import java.util.Objects;

public class UserWishlistId implements Serializable {
    private Long userId;
    private Long productId;

    public UserWishlistId() {}

    public UserWishlistId(Long userId, Long productId) {
        this.userId = userId;
        this.productId = productId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }
    // REQUIRED: equals() and hashCode()
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserWishlistId)) return false;
        UserWishlistId that = (UserWishlistId) o;
        return Objects.equals(userId, that.userId) &&
                Objects.equals(productId, that.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, productId);
    }

}