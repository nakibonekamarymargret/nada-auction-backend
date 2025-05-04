package com.kush.nada.services;

<<<<<<< HEAD
import org.springframework.stereotype.Service;

@Service
public class BidService {
}
=======
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
    private final AuctionRepository auctionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public BidService(BidRepository bidRepository,
                      AuctionRepository auctionRepository,
                      ProductRepository productRepository,
                      UserRepository userRepository) {
        this.bidRepository = bidRepository;
        this.auctionRepository = auctionRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // CREATE

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

        if (auction.getStatus() != AuctionStatus.LIVE) {
            throw new IllegalStateException("Auction is not live. Cannot place a bid.");
        }

        if (bid.getAmount().doubleValue() <= auction.getCurrentPrice()) {
            throw new IllegalStateException("Bid must be higher than current price.");
        }

        auction.setCurrentPrice(bid.getAmount().doubleValue());
        auctionRepository.save(auction);

        product.setLastBidTime(LocalDateTime.now()); // Track bid time per product
        productRepository.save(product); //

        bid.setAuction(auction);
        bid.setProduct(product);
        bid.setBidder(user);
        bid.setBidTime(LocalDateTime.now());

        return bidRepository.save(bid);
    }

//    public Bid createBid(Bid bid, Long productId, Long auctionId, Long userId) {
//        if (auctionId == null || productId == null || userId == null) {
//            throw new IllegalStateException("Auction ID, Product ID, and User ID must be provided.");
//        }
//
//        Auction auction = auctionRepository.findById(auctionId)
//                .orElseThrow(() -> new NotFoundException("Auction not found"));
//
//        Product product = productRepository.findById(productId)
//                .orElseThrow(() -> new NotFoundException("Product not found"));
//
//        UserEntity user = userRepository.findById(userId)
//                .orElseThrow(() -> new NotFoundException("User not found"));
//
//        if (auction.getStatus() != AuctionStatus.LIVE) {
//            throw new IllegalStateException("Auction is not live. Cannot place a bid.");
//        }
//
//        if (bid.getAmount().doubleValue() <= auction.getCurrentPrice()) {
//            throw new IllegalStateException("Bid must be higher than current price.");
//        }
//
//        auction.setCurrentPrice(bid.getAmount().doubleValue());
//        auctionRepository.save(auction);
//
//        bid.setAuction(auction);
//        bid.setProduct(product);
//        bid.setBidder(user);
//        bid.setBidTime(LocalDateTime.now());
//
//        return bidRepository.save(bid);
//    }

    // READ (Get One)
    public Bid getBidById(Long id) {
        return bidRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Bid not found"));
    }

    // READ (Get All)
    public List<Bid> getAllBids() {
        return bidRepository.findAll();
    }

    // UPDATE
    public Bid updateBid(Long id, Bid updatedBid) {
        Bid existingBid = bidRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Bid not found"));

        existingBid.setAmount(updatedBid.getAmount());
        existingBid.setBidTime(LocalDateTime.now()); // Update time if necessary

        return bidRepository.save(existingBid);
    }

    // DELETE
    public void deleteBid(Long id) {
        Bid existingBid = bidRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bid not found"));
        bidRepository.delete(existingBid);
    }
}

>>>>>>> Development
