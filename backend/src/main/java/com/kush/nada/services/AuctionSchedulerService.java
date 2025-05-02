package com.kush.nada.services;

import com.kush.nada.enums.AuctionStatus;
import com.kush.nada.models.Auction;
import com.kush.nada.repositories.AuctionRepository;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuctionSchedulerService {
    private final AuctionRepository auctionRepository;

    public AuctionSchedulerService(AuctionRepository auctionRepository) {
        this.auctionRepository = auctionRepository;
    }

    @Transactional
    @Scheduled(cron = "0 * * * * *") // Run every minute
    public void updateAuctionStatus() {
        LocalDateTime now = LocalDateTime.now();

        // Find auctions that are scheduled to start and are not yet LIVE
        List<Auction> startingAuctions = auctionRepository.findByStartTimeBeforeAndStatus(now, AuctionStatus.SCHEDULED);
        for (Auction auction : startingAuctions) {
            auction.setStatus(AuctionStatus.LIVE);
            auctionRepository.save(auction);
            System.out.println("Auction " + auction.getId() + " is now LIVE"); // Add logging
        }

        // Find auctions that are scheduled to end and are still LIVE
        List<Auction> endingAuctions = auctionRepository.findByEndTimeBeforeAndStatus(now, AuctionStatus.LIVE);
        for (Auction auction : endingAuctions) {
            auction.setStatus(AuctionStatus.CLOSED);
            auctionRepository.save(auction);
            System.out.println("Auction " + auction.getId() + " is now CLOSED");  //Add logging
        }
    }
}
