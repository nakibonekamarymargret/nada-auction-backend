package com.kush.nada.controller;

<<<<<<< HEAD
=======
import com.kush.nada.models.Bid;
>>>>>>> 1ceedcb (Add the payment functionalities using stripe sandbox, remove the PaymentMethod enums to allow for flexibility after integrating stripe payment system)
import com.kush.nada.repositories.BidRepository;
import com.kush.nada.services.ResponseService;
import com.kush.nada.services.StripeService;
import jakarta.servlet.http.HttpServletRequest;
<<<<<<< HEAD
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
=======
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.stripe.model.checkout.Session;
>>>>>>> 1ceedcb (Add the payment functionalities using stripe sandbox, remove the PaymentMethod enums to allow for flexibility after integrating stripe payment system)


import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final StripeService stripeService;
    private final ResponseService responseService;
    private final BidRepository bidRepository;

<<<<<<< HEAD
=======
    @Autowired
>>>>>>> 1ceedcb (Add the payment functionalities using stripe sandbox, remove the PaymentMethod enums to allow for flexibility after integrating stripe payment system)
    public PaymentController(StripeService stripeService, ResponseService responseService, BidRepository bidRepository) {
        this.stripeService = stripeService;
        this.responseService = responseService;
        this.bidRepository = bidRepository;
    }

<<<<<<< HEAD
=======
    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, Object>> createCheckoutSession(
            @RequestParam Double amount,
            @RequestParam Long auctionId,
            @RequestParam Long productId,
            @RequestParam Long userId,
            @RequestParam Long bidId,
            HttpServletRequest request
    ) {
        try {
            Session session = stripeService.createCheckoutSession(amount, userId, productId, auctionId, bidId);
            String checkoutUrl = session.getUrl();
            return responseService.createResponse(200, Map.of("checkoutUrl", checkoutUrl), request, HttpStatus.OK);
        } catch (Exception e) {
            return responseService.createResponse(500, "Stripe error: " + e.getMessage(), request, HttpStatus.INTERNAL_SERVER_ERROR);
        }

//@PostMapping("/create-checkout-session")
//public ResponseEntity<Map<String, Object>> createCheckoutSession(
//        @RequestParam Long productId,
//        HttpServletRequest request
//) {
//    try {
//        Bid highestBid = bidRepository.findTopByProductIdOrderByAmountDesc(productId);
//        if (highestBid == null) {
//            return responseService.createResponse(404, "No bids found for product", request, HttpStatus.NOT_FOUND);
//        }
//
//        Long userId = highestBid.getUser().getId();
//        Long auctionId = highestBid.getAuction().getId(); // if applicable
//        Long bidId = highestBid.getId();
//        Double amount = highestBid.getAmount();
//
//        Session session = stripeService.createCheckoutSession(amount, userId, productId, auctionId, bidId);
//
//        return responseService.createResponse(200, Map.of("checkoutUrl", session.getUrl()), request, HttpStatus.OK);
//    } catch (Exception e) {
//        return responseService.createResponse(500, "Stripe error: " + e.getMessage(), request, HttpStatus.INTERNAL_SERVER_ERROR);
//    }

}

>>>>>>> 1ceedcb (Add the payment functionalities using stripe sandbox, remove the PaymentMethod enums to allow for flexibility after integrating stripe payment system)

    @GetMapping("/success")
    public ResponseEntity<Map<String, Object>> paymentSuccess(HttpServletRequest request) {
        return responseService.createResponse(200, "Payment successful. You can update DB now.", request, HttpStatus.OK);
    }

    @GetMapping("/cancel")
    public ResponseEntity<Map<String, Object>> paymentCancelled(HttpServletRequest request) {
        return responseService.createResponse(400, "Payment cancelled.", request, HttpStatus.BAD_REQUEST);
    }
}
