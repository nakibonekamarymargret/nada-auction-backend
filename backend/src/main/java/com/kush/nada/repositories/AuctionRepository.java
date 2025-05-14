package com.kush.nada.repositories;

import com.kush.nada.enums.AuctionStatus;
import com.kush.nada.models.Auction;
import com.kush.nada.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import static com.kush.nada.enums.AuctionStatus.LIVE;

@Repository
public interface AuctionRepository extends JpaRepository<Auction , Long> {
    List<Auction> findByStartTimeBeforeAndStatus(LocalDateTime startTime, AuctionStatus status);
    List<Auction> findByEndTimeBeforeAndStatus(LocalDateTime endTime, AuctionStatus status);
    List<Auction> findByStatus(AuctionStatus status); // Method to find by status


//    @Query("SELECT a.title FROM auctions_table a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
//    List<Auction> searchAuction(@Param("keyword") String keyword);
//@Query("SELECT a FROM Auction a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
//List<Auction> searchAuction(@Param("name") String keyword);

//    @Query("SELECT p FROM Auction a JOIN a.products p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
//    List<Product> findProductsByNameInAuctions(@Param("name") String name);

//
@Query("SELECT DISTINCT a FROM Auction a JOIN a.products p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
List<Auction> findAuctionsByProductName(@Param("name") String name);
}
