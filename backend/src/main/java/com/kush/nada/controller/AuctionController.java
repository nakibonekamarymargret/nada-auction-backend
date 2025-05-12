package com.kush.nada.controller;

import com.kush.nada.enums.AuctionStatus;
import com.kush.nada.models.Auction;
import com.kush.nada.models.Product;
import com.kush.nada.services.AuctionService;
import com.kush.nada.services.ResponseService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/auctions")
public class AuctionController {


    private final AuctionService auctionService;
    private final ResponseService responseService;

    @Autowired
    public AuctionController(AuctionService auctionService, ResponseService responseService) {
        this.auctionService = auctionService;
        this.responseService = responseService;
    }
@PostMapping("/add")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Map<String, Object>> createAuction(@RequestBody Auction auction, HttpServletRequest request) {
    // Validate fields before saving
    if (auction.getStartTime() == null || auction.getStartTime().isBefore(LocalDateTime.now())) {
        throw new IllegalArgumentException("Start time must be in the future.");
    }
    if (auction.getEndTime() == null || auction.getEndTime().isBefore(auction.getStartTime())) {
        throw new IllegalArgumentException("End time must be after start time.");
    }
    if (auction.getStartingPrice() == null || auction.getStartingPrice() < 0) {
        throw new IllegalArgumentException("Starting price must be non-negative.");
    }

    // Set status based on time
    auction.setStatus(
        auction.getStartTime().isAfter(LocalDateTime.now()) 
            ? AuctionStatus.SCHEDULED 
            : AuctionStatus.LIVE
    );

    Auction createdAuction = auctionService.createAuction(auction);
    return responseService.createResponse(201, createdAuction, request, HttpStatus.OK);
}

    @GetMapping("/all")
    public ResponseEntity<Map<String , Object>> getAllAuctions(HttpServletRequest request){
       List <Auction> auctions = auctionService.getAllAuctions();
        return responseService.createResponse(200,auctions,request,HttpStatus.OK);
    }

    //@PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/live")
    public ResponseEntity<Map<String , Object>> getLiveAuctions(HttpServletRequest request){
        List<Auction> liveAuctions = auctionService.getLiveAuctions();
        return responseService.createResponse(200, liveAuctions , request , HttpStatus.OK);
    }

   // @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/scheduled")
    public ResponseEntity<Map<String , Object>> getScheduledAuctions(HttpServletRequest request){
        List<Auction> liveAuctions = auctionService.getScheduledAuctions();
        return responseService.createResponse(200, liveAuctions , request , HttpStatus.OK);
    }

   // @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/closed")
    public ResponseEntity<Map<String , Object>> getClosedAuctions(HttpServletRequest request){
        List<Auction> liveAuctions = auctionService.getClosedAuctions();
        return responseService.createResponse(200, liveAuctions , request , HttpStatus.OK);
    }


    @GetMapping("/search/product")
    public ResponseEntity<Map<String, Object>> searchAuction(
            @RequestParam String name,
            HttpServletRequest request
    ) {

        List<Auction> auctionSearch = auctionService.searchProductsByNameInAuctions(name);
        return  responseService.createResponse(200,auctionSearch ,request, HttpStatus.OK);
    }

}