package com.kush.nada.services;

import com.kush.nada.enums.AuctionStatus;
import com.kush.nada.exceptions.NotFoundException;
import com.kush.nada.models.Auction;
import com.kush.nada.models.Bid;
import com.kush.nada.models.Product;
import com.kush.nada.models.UserEntity;
import com.kush.nada.repositories.AuctionRepository;
import com.kush.nada.repositories.BidRepository;
import com.kush.nada.repositories.ProductRepository;
import com.kush.nada.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BidService {

    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final AuctionRepository auctionRepository;


    public BidService(BidRepository bidRepository, UserRepository userRepository, ProductRepository productRepository, AuctionRepository auctionRepository) {
        this.bidRepository = bidRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.auctionRepository = auctionRepository;
    }

    public Bid createBid(Bid bid, Long productId, Long auctionId, Long userId) {
        if (auctionId == null || productId == null || userId == null) {
            throw new IllegalStateException("Product ID must be provided.");
        }

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new NotFoundException("Auction not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        if (product.isClosed()) {
            throw new IllegalStateException("Bidding is closed for this product.");
        }

        if (product.getLastBidTime() != null &&
                product.getLastBidTime().plusSeconds(30).isBefore(LocalDateTime.now())) {
            product.setClosed(true);
            productRepository.save(product);
            throw new IllegalStateException("Bidding timed out for this product.");
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!AuctionStatus.LIVE.equals(auction.getStatus())) {
            throw new IllegalStateException("Auction is not live. Cannot place a bid.");
        }

        if (bid.getAmount().doubleValue() <= auction.getCurrentPrice()) {
            throw new IllegalStateException("Bid must be higher than current price.");
        }

        auction.setCurrentPrice(bid.getAmount().doubleValue());
        auctionRepository.save(auction);

        product.setLastBidTime(LocalDateTime.now()); // Track bid time per product
        productRepository.save(product); //

        // Set full entity references
        bid.setBidder(user);
        bid.setProduct(product);
        bid.setAuction(auction);
        bid.setBidTime(LocalDateTime.now());

        return bidRepository.save(bid);
    }
    public List<Bid> getAllBidsForProduct(Long productId) {
        return bidRepository.findByProductId(productId);
    }

    public Bid getBidById(Long id) {
        return bidRepository.findById(id).orElseThrow(() -> new RuntimeException("Bid not found"));
    }

    public Bid findTopByProductIdOrderByAmountDesc(Long productId) {
        return bidRepository.findTopByProductIdOrderByAmountDesc(productId);
    }
}

