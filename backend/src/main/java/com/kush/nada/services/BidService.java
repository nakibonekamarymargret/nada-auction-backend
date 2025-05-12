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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BidService {

    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final AuctionRepository auctionRepository;
    private final SimpMessagingTemplate messagingTemplate;


    public BidService(BidRepository bidRepository, UserRepository userRepository, ProductRepository productRepository, AuctionRepository auctionRepository, SimpMessagingTemplate messagingTemplate) {
        this.bidRepository = bidRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.auctionRepository = auctionRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Bid createBid(Bid bid, Long productId, Long auctionId, Long userId) {
        Optional<Product> productOptional = productRepository.findById(productId);
        if (productOptional.isPresent()) {
            Product product = productOptional.get();
            bid.setProduct(product);

            Optional<Auction> auctionOptional = auctionRepository.findById(auctionId);
            if (auctionOptional.isPresent()) {
                Auction auction = auctionOptional.get();
                bid.setAuction(auction);

                bid.setBidder(userRepository.findById(userId).orElse(null));
                bid.setBidTime(LocalDateTime.now());

                // Update product with latest bid info
                if (bid.getAmount().compareTo(product.getHighestPrice()) > 0) {
                    product.setHighestPrice(bid.getAmount());
                    product.setLastBidTime(bid.getBidTime());
                    productRepository.save(product); // Save updated product
                }

                Bid savedBid = bidRepository.save(bid);
                return savedBid;
            }
        }
        throw new RuntimeException("Invalid product or auction ID");
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
}

