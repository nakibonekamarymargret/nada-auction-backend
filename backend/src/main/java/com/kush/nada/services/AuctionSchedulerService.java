package com.kush.nada.services;

import com.kush.nada.enums.AuctionStatus;
import com.kush.nada.models.Auction;
import com.kush.nada.models.Product;
import com.kush.nada.repositories.AuctionRepository;
import com.kush.nada.repositories.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuctionSchedulerService {

    private final AuctionRepository auctionRepository;
    private final ProductRepository productRepository;

    @Autowired
    public AuctionSchedulerService(AuctionRepository auctionRepository, ProductRepository productRepository) {
        this.auctionRepository = auctionRepository;
        this.productRepository = productRepository;
    }

    // Runs every minute to manage auction lifecycle transitions
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
            System.out.println("Auction " + auction.getId() + " is now CLOSED"); // Add logging
        }
    }

    // Runs every 10 seconds to manage per-product bidding timeouts
    @Transactional
    @Scheduled(fixedRate = 10000) // Run every 10 seconds
    public void closeInactiveProductBids() {
        LocalDateTime now = LocalDateTime.now();

        // Find products still open to bidding
        List<Product> openProducts = productRepository.findByIsClosedFalse();

        for (Product product : openProducts) {
            // Check if last bid was more than 30 seconds ago
            if (product.getLastBidTime() != null &&
                    product.getLastBidTime().plusSeconds(1800).isBefore(now)) {

                product.setClosed(true);
                productRepository.save(product);
                System.out.println("Product " + product.getId() + " bidding is now CLOSED due to inactivity."); // Add logging
            }
        }
    }
}