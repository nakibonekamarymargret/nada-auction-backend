package com.kush.nada.services;

import com.kush.nada.enums.AuctionStatus;
import com.kush.nada.exceptions.NotFoundException;
import com.kush.nada.models.Auction;
import com.kush.nada.models.Product;
import com.kush.nada.models.UserEntity;
import com.kush.nada.repositories.AuctionRepository;
import com.kush.nada.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;

    @Autowired
    public AuctionService(AuctionRepository auctionRepository,
                          UserRepository userRepository) {
        this.auctionRepository = auctionRepository;
        this.userRepository = userRepository;
    }

    //        @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public Auction createAuction(Auction auction) {
        // 1. Get authenticated seller
        UserEntity seller = getCurrentUser();

        // 2. Validate auction timing
        validateAuction(auction);

        // 3. Link seller and initialize auction state
        auction.setUser(seller); // Set bidirectional relationship
        auction.setCurrentPrice(auction.getStartingPrice()); // Initialize current price
        auction.setStatus(
                auction.getStartTime().isBefore(LocalDateTime.now())
                        ? AuctionStatus.LIVE
                        : AuctionStatus.SCHEDULED
        );

        // 4. Save auction
        return auctionRepository.save(auction);
    }

    private UserEntity getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String identifier = auth.getName(); // Could be either email or username

        return userRepository.findByEmail(identifier)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + identifier));
    }

    public List <Auction> getAllAuctions () {
        return auctionRepository.findAll();
    }
    public List <Auction> getLiveAuctions(){
        return auctionRepository.findByStatus(AuctionStatus.LIVE);
    }

    public List <Auction> getScheduledAuctions(){
        return auctionRepository.findByStatus(AuctionStatus.SCHEDULED);
    }
    public List <Auction> getClosedAuctions(){
        return auctionRepository.findByStatus(AuctionStatus.CLOSED);
    }

    private void validateAuction(Auction auction) {
        LocalDateTime now = LocalDateTime.now();
        if (auction.getStartTime().isBefore(now)) {
            throw new IllegalArgumentException("Start time cannot be in the past");
        }
        if (auction.getEndTime().isBefore(auction.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

    }

//    public List<Auction> searchAuction(String name) {
//        List<Auction> searchedAuctions =auctionRepository.findProductsByNameInAuctions( String name);
//
//        if(searchedAuctions.isEmpty()){
//            throw  new NotFoundException("No products Found with keyword" + " "+ name);
//        }
//        return searchedAuctions;
//    }

    public List<Auction> searchProductsByNameInAuctions(String name) {
        // Perform the search in the repository
        List<Auction> searchedProducts = auctionRepository.findAuctionsByProductName(name);

        // Check if products are found, otherwise throw an exception
        if (searchedProducts.isEmpty()) {
            throw new NotFoundException("No products found with keyword: " + name);
        }

        return searchedProducts;
    }
}