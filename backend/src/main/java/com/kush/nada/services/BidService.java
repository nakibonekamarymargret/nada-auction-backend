package com.kush.nada.services;

import com.kush.nada.dtos.BidDto;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BidService {

    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final AuctionRepository auctionRepository;
//sockets
private final SimpMessagingTemplate messagingTemplate;


    public BidService(BidRepository bidRepository, UserRepository userRepository, ProductRepository productRepository, AuctionRepository auctionRepository, SimpMessagingTemplate messagingTemplate) {
        this.bidRepository = bidRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.auctionRepository = auctionRepository;
        this.messagingTemplate = messagingTemplate;
    }



    public Bid createBid(Bid bid, Long productId, Long auctionId, Long userId) {
        if (auctionId == null || productId == null || userId == null) {
            throw new IllegalStateException("Product ID and Auction ID must be provided.");
        }

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new NotFoundException("Auction not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        if (product.isClosed()) {
            throw new IllegalStateException("Bidding is closed for this product.");
        }
//Revert back to 30 seconds after successfull completion
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

        // Determine minimum required bid
        BigDecimal minRequiredBid;

        if (product.getLastBidAmount() == null) {
            minRequiredBid = BigDecimal.valueOf(auction.getStartingPrice());
        } else {
            minRequiredBid = product.getLastBidAmount();
        }

        if (bid.getAmount().compareTo(minRequiredBid) <= 0) {
            throw new IllegalStateException("Bid must be higher than the product's current minimum of " + minRequiredBid);
        }

        // Set bid details
        bid.setBidder(user);
        bid.setProduct(product);
        bid.setAuction(auction);
        bid.setBidTime(LocalDateTime.now());

        Bid savedBid = bidRepository.save(bid);

        // Update product bid info
        product.setLastBidAmount(bid.getAmount());
        product.setLastBidTime(LocalDateTime.now());

        if (product.getHighestPrice() == null || bid.getAmount().compareTo(product.getHighestPrice()) > 0) {
            product.setHighestPrice(bid.getAmount());
        }

        productRepository.save(product);

        // Update auction current price if needed
        if (bid.getAmount().doubleValue() > auction.getCurrentPrice()) {
            auction.setCurrentPrice(bid.getAmount().doubleValue());
            auctionRepository.save(auction);
        }

        // Convert to BidDto for broadcasting
        BidDto bidDto = new BidDto();
        bidDto.setId(savedBid.getId());
        bidDto.setAmount(savedBid.getAmount());
        bidDto.setBidderName(savedBid.getBidder().getName());
        bidDto.setBidTime(savedBid.getBidTime());

        // Broadcast DTO to WebSocket clients
        messagingTemplate.convertAndSend("/topic/bids/" + productId, bidDto);

        return savedBid;
    }
    public List<Bid> getAllBidsForProduct(Long productId) {
        return bidRepository.findByProductId(productId);
    }
    public List<Bid> getAllBids() {
        return bidRepository.findAll();
    }

    public Bid getBidById(Long id) {
        return bidRepository.findById(id).orElseThrow(() -> new RuntimeException("Bid not found"));
    }

    public Bid findTopByProductIdOrderByAmountDesc(Long productId) {
        return bidRepository.findTopByProductIdOrderByAmountDesc(productId);
    }
    public Bid findLatestBidByUserAndProduct(Long userId, Long productId) {
        return bidRepository
                .findTopByBidderIdAndProductIdOrderByBidTimeDesc(userId, productId)
                .orElse(null);
    }


}