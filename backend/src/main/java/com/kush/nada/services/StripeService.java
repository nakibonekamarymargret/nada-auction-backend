package com.kush.nada.services;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class StripeService {

    @Value("${stripe.api.key}")
    private String stripeSecretKey;

    public Session createCheckoutSession(Double amount, Long userId, Long productId, Long auctionId, Long bidId) throws StripeException {
        Stripe.apiKey = stripeSecretKey;

        Map<String, String> metadata = new HashMap<>();
        metadata.put("userId", String.valueOf(userId));
        metadata.put("productId", String.valueOf(productId));
        metadata.put("auctionId", String.valueOf(auctionId));
        metadata.put("bidId", String.valueOf(bidId));

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:7107/success")
                .setCancelUrl("http://localhost:7107/cancel")
                .setCustomerEmail("admin@nadaauction.com") // optional
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount((long) (amount * 100)) // cents
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Auction Payment")
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .putAllMetadata(metadata)
                .build();

        return Session.create(params);
    }
}
