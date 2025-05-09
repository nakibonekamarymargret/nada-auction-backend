package com.kush.nada.services;

import com.kush.nada.dtos.ProductUpdateDto;
import com.kush.nada.enums.AuctionStatus;
import com.kush.nada.exceptions.NotFoundException;
import com.kush.nada.models.Auction;
import com.kush.nada.dtos.AuctionDto;
import com.kush.nada.dtos.ProductDto;
import com.kush.nada.models.Product;
import com.kush.nada.models.UserEntity;
import com.kush.nada.repositories.AuctionRepository;
import com.kush.nada.repositories.BidRepository;
import com.kush.nada.repositories.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import java.util.Optional;

import java.util.stream.Collectors;

import java.util.List;

@Service
public class ProductService {

    private ProductRepository productRepository;
    private AuctionRepository auctionRepository;
    private final BidRepository bidRepository;

    @Autowired
    public ProductService(ProductRepository productRepository, AuctionRepository auctionRepository ,BidRepository bidRepository) {
        this.productRepository = productRepository;
        this.auctionRepository = auctionRepository;
        this.bidRepository= bidRepository;

    }

    // CREATE
     public Product createProduct(Product product, Long auctionId) {
          if (auctionId == null) {  // Also add to see check that the ID exists
            throw new IllegalArgumentException("Auction ID must be provided.");
        }
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

         if (auction.getStatus() == AuctionStatus.CLOSED) {
             throw new IllegalStateException("Cannot add product to a closed auction.");
         }
         if (auction.getStatus() == AuctionStatus.LIVE) {
             throw new IllegalStateException("Cannot add product to a Live auction.");
         }

        product.setAuction(auction);
        return productRepository.save(product);
    }

    // READ ALL

   public List<ProductDto> getAllProducts() {
    List<Product> products = productRepository.findAll();

    return products.stream().map(product -> {
        Auction auction = product.getAuction();
        AuctionDto auctionDto = null;

        if (auction != null) {
            auctionDto = new AuctionDto(
                auction.getId(),
                auction.getStatus(),
                auction.getStartTime(),
                auction.getEndTime()
            );
        }

        return new ProductDto(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getImageUrl(),
            product.getHighestPrice(),
            product.getCategory(),
            product.getLastBidTime(),
            product.isClosed(),
            auctionDto
        );
    }).collect(Collectors.toList());
}


    // READ BY ID
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
public Product findByName(String name) {
    Optional<Product> optionalProduct = productRepository.findByName(name);
return optionalProduct.orElse(null);


}
public ProductDto getProductDtoById(Long id) { 
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Auction auction = product.getAuction(); 
        AuctionDto auctionDto = null;
        if (auction != null) {
            auctionDto = new AuctionDto(
                auction.getId(),
                auction.getStatus(),
                auction.getStartTime(),
                auction.getEndTime()
            );
        }

        ProductDto productDto = new ProductDto(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getImageUrl(),
            product.getHighestPrice(),
            product.getCategory(),
            product.getLastBidTime(),
            product.isClosed(),
            auctionDto // Include the Auction DTO
        );

        return productDto;
    }

    // UPDATE
  //  @Transactional
    @Transactional // Ensure this annotation is present
    public Product updateProduct(Long id, ProductUpdateDto productDetailsDto) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with id " + id));

        // Update fields conditionally
        if (productDetailsDto.getName() != null) {
            existingProduct.setName(productDetailsDto.getName());
        }
        if (productDetailsDto.getDescription() != null) {
            existingProduct.setDescription(productDetailsDto.getDescription());
        }
        if (productDetailsDto.getCategory() != null) {
            existingProduct.setCategory(productDetailsDto.getCategory());
        }


        // Save the changes
        Product savedProduct = productRepository.save(existingProduct);

        // *** IMPORTANT: Initialize the lazy-loaded Auction relationship ***
        // Accessing the related object or one of its properties forces Hibernate
        // to fetch it from the database while the entity is still managed.
        if (savedProduct.getAuction() != null) {
            // Accessing a property like getStatus() is a common way to trigger initialization
            // Make sure getAuction().getStatus() doesn't itself cause another lazy load issue if Auction has complex relations
            AuctionStatus auctionStatus = savedProduct.getAuction().getStatus();
            // You can optionally log this status here to confirm it's loaded
            // System.out.println("Initialized auction status: " + auctionStatus);
        }
        // *** The auction relationship is now loaded for the returned entity ***


        // Return the saved and initialized product entity
        return savedProduct;
    }

    // DELETE
    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        bidRepository.deleteByProduct_Id(id);
        productRepository.delete(product);
    }
}