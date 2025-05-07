package com.kush.nada.controller;

import com.kush.nada.models.Auction;
import com.kush.nada.models.Bid;
import com.kush.nada.models.Product;
import com.kush.nada.models.UserPrincipal;
import com.kush.nada.services.BidService;
import com.kush.nada.services.ProductService;
import com.kush.nada.services.ResponseService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;
@CrossOrigin
@RestController
@RequestMapping("/bids")
public class BidController {

    private final BidService bidService;
    private final ProductService productService; // Assuming ProductService fetches products
    private final ResponseService responseService;

    public BidController(BidService bidService, ProductService productService, ResponseService responseService) {
        this.bidService = bidService;
        this.productService = productService;
        this.responseService = responseService;
    }

    // CREATE
    @PostMapping("/place/{productId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> placeBid(
            @PathVariable Long productId,
            @RequestBody Bid bid,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        Long userId = extractUserId(principal);

        // Fetch the Product and its associated Auction
        Product product = productService.getProductById(productId); // Fetch the Product by productId
        Auction auction = product.getAuction(); // Automatically get the Auction tied to the Product

        if (auction == null) {
            return responseService.createResponse(400, "Auction not found for this product", request, HttpStatus.BAD_REQUEST);
        }

        // Create the bid using the auctionId and the productId
        Bid createdBid = bidService.createBid(bid, productId, auction.getId(), userId);

        return responseService.createResponse(200, createdBid, request, HttpStatus.CREATED);
    }

    // READ (Single)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getBidById(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        Bid bid = bidService.getBidById(id);
        return responseService.createResponse(200, bid, request, HttpStatus.OK);
    }

    // READ (All)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllBids(HttpServletRequest request) {
        List<Bid> bids = bidService.getAllBids();
        return responseService.createResponse(200, bids, request, HttpStatus.OK);
    }

    // UPDATE
    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateBid(
            @PathVariable Long id,
            @RequestBody Bid bid,
            HttpServletRequest request
    ) {
        Bid updatedBid = bidService.updateBid(id, bid);
        return responseService.createResponse(200, updatedBid, request, HttpStatus.OK);
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteBid(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        bidService.deleteBid(id);
        return responseService.createResponse(200, "Bid deleted successfully.", request, HttpStatus.OK);
    }

    // Helper method for user ID extraction
    private Long extractUserId(UserPrincipal principal) {
        if (principal == null) {
            throw new RuntimeException("User not authenticated.");
        }
        return principal.getId();
    }
}
