package com.kush.nada.services;

import com.kush.nada.enums.AuctionStatus;
import com.kush.nada.models.Auction;
import com.kush.nada.models.Product;
import com.kush.nada.models.UserEntity;
import com.kush.nada.repositories.AuctionRepository;
import com.kush.nada.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private ProductRepository productRepository;
    private AuctionRepository auctionRepository;

    @Autowired
    public ProductService(ProductRepository productRepository, AuctionRepository auctionRepository) {
        this.productRepository = productRepository;
        this.auctionRepository = auctionRepository;
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

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // READ BY ID
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    // UPDATE
  //  @Transactional
    public Product updateProduct(Long id, Product productDetails) {
        Product existingProduct = getProductById(id);

        // Validate auction if changed
        if (productDetails.getAuctionId() != null &&
                !productDetails.getAuctionId().equals(existingProduct.getAuctionId())) {

            Auction newAuction = auctionRepository.findById(productDetails.getAuctionId())
                    .orElseThrow(() -> new RuntimeException("New auction not found"));
            existingProduct.setAuction(newAuction);
        }

        // Update other fields
        existingProduct.setName(productDetails.getName());
        existingProduct.setDescription(productDetails.getDescription());
        existingProduct.setHighestPrice(productDetails.getHighestPrice());
        existingProduct.setCategory(productDetails.getCategory());

        return productRepository.save(existingProduct);
    }

    // DELETE
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}