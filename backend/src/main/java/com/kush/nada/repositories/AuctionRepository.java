package com.kush.nada.repositories;

import com.kush.nada.enums.AuctionStatus;
import com.kush.nada.models.Auction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import static com.kush.nada.enums.AuctionStatus.LIVE;

@Repository
public interface AuctionRepository extends JpaRepository<Auction , Long> {
    List<Auction> findByStartTimeBeforeAndStatus(LocalDateTime startTime, AuctionStatus status);
    List<Auction> findByEndTimeBeforeAndStatus(LocalDateTime endTime, AuctionStatus status);
    List<Auction> findByStatus(AuctionStatus status); // Method to find by status




}
