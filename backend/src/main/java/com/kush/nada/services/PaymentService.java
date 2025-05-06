package com.kush.nada.services;

import com.kush.nada.enums.PaymentStatus;
import com.kush.nada.models.*;
import com.kush.nada.repositories.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;

    public PaymentService(PaymentRepository paymentRepository, UserRepository userRepository,
                          ProductRepository productRepository, AuctionRepository auctionRepository,
                          BidRepository bidRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
    }

public Payment saveSuccessfulPayment(Long userId, Long productId, Long auctionId, Long bidId, Double amount, String paymentMethod) {
    UserEntity user = userRepository.findById(userId).orElse(null);
    Product product = productRepository.findById(productId).orElse(null);
    Auction auction = auctionRepository.findById(auctionId).orElse(null);
    Bid bid = bidRepository.findById(bidId).orElse(null);

    Payment payment = new Payment();
    payment.setUser(user);
    payment.setProduct(product);
    payment.setAuction(auction);
    payment.setBid(bid);
    payment.setAmount(amount);
    payment.setPaymentMethod(paymentMethod); // Now a String
    payment.setPaymentStatus(PaymentStatus.COMPLETED);
    payment.setPaymentDate(LocalDateTime.now());

    return paymentRepository.save(payment);
}

}
