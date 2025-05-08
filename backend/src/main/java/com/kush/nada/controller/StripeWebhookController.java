package com.kush.nada.controller;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kush.nada.services.PaymentService;
import com.stripe.model.Event;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.IOException;

@RestController
@RequestMapping("/stripe")
public class StripeWebhookController {

    private final PaymentService paymentService;

    public StripeWebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

@PostMapping("/webhook")
public ResponseEntity<String> handleStripeEvent(HttpServletRequest request) {
    String payload = "";
    try (BufferedReader reader = request.getReader()) {
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);
        payload = sb.toString();
    } catch (IOException e) {
        return ResponseEntity.badRequest().body("Failed to read payload");
    }

    if (payload.isEmpty()) {
        return ResponseEntity.badRequest().body("No payload received");
    }

    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    Event event;
    try {
        event = objectMapper.readValue(payload, Event.class);
    } catch (IOException e) {
        return ResponseEntity.badRequest().body("Error parsing event: " + e.getMessage());
    }

    if ("checkout.session.completed".equals(event.getType().trim())) {
        try {
            JsonNode rootNode = objectMapper.readTree(payload);
            JsonNode sessionNode = rootNode.path("data").path("object");
            JsonNode metadata = sessionNode.path("metadata");

            if (metadata.isMissingNode() || metadata.isEmpty()) {
                return ResponseEntity.badRequest().body("No metadata in session");
            }

            Long userId = Long.parseLong(metadata.path("userId").asText());
            Long productId = Long.parseLong(metadata.path("productId").asText());
            Long auctionId = Long.parseLong(metadata.path("auctionId").asText());
            Long bidId = Long.parseLong(metadata.path("bidId").asText());

            double amount = sessionNode.path("amount_total").asDouble() / 100.0;

            // Payment method type (e.g., card, paypal, etc.)
            String paymentMethod = "";
            JsonNode paymentMethodTypes = sessionNode.path("payment_method_types");
            if (paymentMethodTypes.isArray() && paymentMethodTypes.size() > 0) {
                paymentMethod = paymentMethodTypes.get(0).asText(); // usually "card"
            }
            paymentService.saveSuccessfulPayment(userId, productId, auctionId, bidId, amount, paymentMethod);

            return ResponseEntity.ok("Payment processed successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error processing session: " + e.getMessage());
        }
    }

    return ResponseEntity.ok("Event ignored");
}

}
