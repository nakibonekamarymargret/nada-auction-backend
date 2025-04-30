package com.kush.nada.services;

import com.kush.nada.models.Auction;
import com.kush.nada.models.Product;
import com.kush.nada.repositories.AuctionRepository;
import com.kush.nada.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final AuctionRepository auctionRepository;

    @Autowired
    public ProductService(ProductRepository productRepository,
                          AuctionRepository auctionRepository) {
        this.productRepository = productRepository;
        this.auctionRepository = auctionRepository;}

        //@Transactional
        @PreAuthorize("hasRole('USER')")
        public Product createProduct (Product product){
            // 1. Fetch the auction to ensure it exists
            Auction auction = auctionRepository.findById(product.getAuction().getId())
                    .orElseThrow(() -> new RuntimeException("Auction not found"));

            // 2. Link product to auction
            product.setAuction(auction);

            // 3. Save product
            return productRepository.save(product);
        }
    }


