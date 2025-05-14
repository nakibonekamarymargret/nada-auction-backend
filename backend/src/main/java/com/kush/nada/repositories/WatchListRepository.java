package com.kush.nada.repositories;

import com.kush.nada.models.UserEntity;
import com.kush.nada.models.UserWishlistId;
import com.kush.nada.models.WatchList;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WatchListRepository extends JpaRepository<WatchList, UserWishlistId> {
    boolean existsById_UserIdAndId_ProductId(Long userId, Long productId);
    void deleteById_UserIdAndId_ProductId(Long userId, Long productId);
    List<WatchList> findByUser(UserEntity user);
}