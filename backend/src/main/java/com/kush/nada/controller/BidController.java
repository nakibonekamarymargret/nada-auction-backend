package com.kush.nada.controller;
import com.kush.nada.dtos.BidDto;
import com.stripe.model.checkout.Session;
import com.kush.nada.models.Bid;
import com.kush.nada.models.Product;
import com.kush.nada.models.UserPrincipal;
import com.kush.nada.services.BidService;
import com.kush.nada.services.ProductService;
import com.kush.nada.services.ResponseService;
import com.kush.nada.services.StripeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin
@RestController
@RequestMapping("/bids")
public class BidController {

    private final BidService bidService;
    private final ProductService productService;
    private final ResponseService responseService;
    private final StripeService stripeService;

    @Autowired
    public BidController(
            BidService bidService,
            ProductService productService,
            ResponseService responseService,
            StripeService stripeService) {
        this.bidService = bidService;
        this.productService = productService;
        this.responseService = responseService;
        this.stripeService = stripeService;
    }

    // Place a bid
    @PostMapping("/place/{productId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> placeBid(
            @PathVariable Long productId,
            @RequestBody Bid bid,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        Long userId = extractUserId(principal);
        Product product = productService.getProductById(productId);

        if (product.getAuction() == null) {
            return responseService.createResponse(400, "Product has no associated auction", request, HttpStatus.BAD_REQUEST);
        }

        Bid createdBid = bidService.createBid(bid, productId, product.getAuction().getId(), userId);

        Map<String, Object> returnData = new HashMap<>();
        returnData.put("bid", createdBid);
        returnData.put("message", "Bid placed successfully. Awaiting final confirmation.");

        return responseService.createResponse(200, returnData, request, HttpStatus.CREATED);
    }

    // Check result after bidding closes
    @GetMapping("/check-result/{productId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> checkAuctionResult(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) throws Exception {
        Long userId = extractUserId(principal);
        Product product = productService.getProductById(productId);

        if (!product.isClosed()) {
            throw new IllegalStateException("Bidding is still open for this product.");
        }

        List<Bid> productBids = bidService.getAllBidsForProduct(productId);
        Bid highestBid = bidService.findTopByProductIdOrderByAmountDesc(productId);

        if (highestBid == null) {
            throw new IllegalStateException("No bids were placed for this product.");
        }

        Map<String, Object> returnData = new HashMap<>();

        String winnerName = highestBid.getBidder().getName();
        Double winningAmount = highestBid.getAmount().doubleValue();

        boolean userPlacedBid = productBids.stream()
                .anyMatch(bid -> bid.getBidder().getId().equals(userId));

        if (!userPlacedBid) {
            returnData.put("message", String.format("The winner for this product has been chosen. The winning price was: $%.2f.", winningAmount));
        } else if (highestBid.getBidder().getId().equals(userId)) {
            Session session = stripeService.createCheckoutSession(
                    winningAmount,
                    userId,
                    productId,
                    highestBid.getAuction().getId(),
                    highestBid.getId()
            );
            returnData.put("message", "Congratulations, you are the winner of this product! Proceed to payment.");
            returnData.put("winningAmount", winningAmount);
            returnData.put("checkoutUrl", session.getUrl());
        } else {
            returnData.put("message", "Sorry, you did not win this time. Try next time!");
            returnData.put("winnerInfo", String.format("The winner for this product has been chosen. The winning price was: $%.2f.", winningAmount));
        }

        return responseService.createResponse(200, returnData, request, HttpStatus.OK);
    }
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')") // Only admins can view all bids
    public ResponseEntity<Map<String, Object>> getAllBids(HttpServletRequest request) {
        List<BidDto> bidDtos = bidService.getAllBids()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        Map<String, Object> returnData = new HashMap<>();
        returnData.put("ReturnObject", bidDtos);
        returnData.put("message", "All bids retrieved successfully.");

        return responseService.createResponse(200, returnData, request, HttpStatus.OK);
    }

    //Fetch Bids for a Product
    @GetMapping("/product/{productId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getBidsByProduct(
            @PathVariable Long productId,
            HttpServletRequest request
    ) {
        List<BidDto> bidDtos = bidService.getAllBidsForProduct(productId)
                .stream()
                .sorted((b1, b2) -> b2.getAmount().compareTo(b1.getAmount()))
                .map(this::mapToDto)
                .collect(Collectors.toList());

        Map<String, Object> returnData = new HashMap<>();
        returnData.put("ReturnObject", bidDtos);
        returnData.put("message", "Bids retrieved successfully.");

        return responseService.createResponse(200, returnData, request, HttpStatus.OK);
    }
    @GetMapping("/my-latest/{productId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getMyLatestBid(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        Long userId = extractUserId(principal);
        Bid myLatestBid = bidService.findLatestBidByUserAndProduct(userId, productId);

        if (myLatestBid == null) {
            return responseService.createResponse(404, "No bid found for this user on this product", request, HttpStatus.NOT_FOUND);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("message", "User's latest bid fetched");
        payload.put("bid", myLatestBid);

        return responseService.createResponse(200, payload, request, HttpStatus.OK);    }


    // Helper Method
    private Long extractUserId(UserPrincipal principal) {
        if (principal == null) {
            throw new RuntimeException("User not authenticated.");
        }
        return principal.getId();
    }
    private BidDto mapToDto(Bid bid) {
        BidDto dto = new BidDto();
        dto.setId(bid.getId());
        dto.setAmount(bid.getAmount());
        dto.setBidderName(bid.getBidder().getName());
        dto.setBidTime(bid.getBidTime());
        return dto;
    }

}