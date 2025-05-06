package com.kush.nada.controller;

import com.kush.nada.repositories.BidRepository;
import com.kush.nada.services.ResponseService;
import com.kush.nada.services.StripeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final StripeService stripeService;
    private final ResponseService responseService;
    private final BidRepository bidRepository;

    public PaymentController(StripeService stripeService, ResponseService responseService, BidRepository bidRepository) {
        this.stripeService = stripeService;
        this.responseService = responseService;
        this.bidRepository = bidRepository;
    }


    @GetMapping("/success")
    public ResponseEntity<Map<String, Object>> paymentSuccess(HttpServletRequest request) {
        return responseService.createResponse(200, "Payment successful. You can update DB now.", request, HttpStatus.OK);
    }

    @GetMapping("/cancel")
    public ResponseEntity<Map<String, Object>> paymentCancelled(HttpServletRequest request) {
        return responseService.createResponse(400, "Payment cancelled.", request, HttpStatus.BAD_REQUEST);
    }
}
