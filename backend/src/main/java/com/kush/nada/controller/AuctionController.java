package com.kush.nada.controller;

import com.kush.nada.models.Auction;
import com.kush.nada.services.AuctionService;
import com.kush.nada.services.ResponseService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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


    @PostMapping ("/add")
    public ResponseEntity<Auction> createAuction(@RequestBody Auction auction) {
        Auction createdAuction = auctionService.createAuction(auction);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAuction);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<Map<String , Object>> getAllAuctions(HttpServletRequest request){
       List <Auction> auctions = auctionService.getAllAuctions();
        return responseService.createResponse(200,auctions,request,HttpStatus.OK);
    }

}