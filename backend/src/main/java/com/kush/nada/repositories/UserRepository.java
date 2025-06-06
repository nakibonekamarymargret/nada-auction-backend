package com.kush.nada.repositories;

import com.kush.nada.enums.Role;
import com.kush.nada.models.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity ,Long> {

    Optional<UserEntity> findByEmail(String email);

    @Query("SELECT u FROM UserEntity u WHERE u.deleted = false")
    List<UserEntity> findAllActiveUsers();

    // All soft-deleted users
    @Query("SELECT u FROM UserEntity u WHERE u.deleted = true"
    )
    List<UserEntity> findAllDeletedUsers();

    // Get deleted user by ID
    @Query("SELECT u FROM UserEntity u WHERE u.id = :id AND u.deleted = true")
    Optional<UserEntity> findDeletedUserById(@Param("id") Long id);

    @Query("SELECT u FROM UserEntity u WHERE u.id = :id AND u.deleted = false")
    Optional<UserEntity> findActiveUserById(@Param("id") Long id);

    // Receive User with Auctions and Products in the Auctions
//    @Query("SELECT u FROM UserEntity u " +
//            "LEFT JOIN FETCH u.auctions a " +
//            "LEFT JOIN FETCH a.products " +
//            "WHERE u.email = :email")
//    Optional<UserEntity> findByEmailWithAuctionsAndProducts(@Param("email") String email);

    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.auctions WHERE u.email = :email")
    Optional<UserEntity> findByEmailWithAuctions(@Param("email") String email);


    boolean existsByEmail(String email);

    boolean existsByName(String name);

    boolean existsByPhoneNumber(String phoneNumber);
}