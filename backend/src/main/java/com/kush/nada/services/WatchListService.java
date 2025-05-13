package com.kush.nada.services;

import com.kush.nada.dtos.ProductDto;
import com.kush.nada.exceptions.NotFoundException;
import com.kush.nada.models.Product;
import com.kush.nada.models.UserEntity;
import com.kush.nada.models.UserWishlistId;
import com.kush.nada.models.WatchList;
import com.kush.nada.repositories.ProductRepository;
import com.kush.nada.repositories.WatchListRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WatchListService {


    private final WatchListRepository watchListRepository;
    private final ProductRepository productRepository;

    @Autowired
    public WatchListService(WatchListRepository watchListRepository, ProductRepository productRepository) {
        this.watchListRepository = watchListRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public boolean toggleWatchList(Long productId, UserEntity user) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        UserWishlistId wishlistId = new UserWishlistId();
        wishlistId.setUserId(user.getId());
        wishlistId.setProductId(product.getId());

        if (watchListRepository.existsById_UserIdAndId_ProductId(user.getId(), product.getId())) {
            watchListRepository.deleteById_UserIdAndId_ProductId(user.getId(), product.getId());
            return false;
        } else {
            WatchList watchList = new WatchList(wishlistId, user, product);
            watchListRepository.save(watchList);
            return true;
        }
    }

    public List<ProductDto> getWatchListProducts(UserEntity user) {
        return watchListRepository.findByUser(user).stream()
                .map(entry -> mapToProductDto(entry.getProduct()))
                .collect(Collectors.toList());
    }

    private ProductDto mapToProductDto(Product product) {
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getImageUrl(),
                product.getHighestPrice(),
                product.getCategory(),
                product.getLastBidTime(),
                product.isClosed(),
                null
        );
    }
}