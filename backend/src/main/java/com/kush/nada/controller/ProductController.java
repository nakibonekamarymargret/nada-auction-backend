package com.kush.nada.controller;

import com.kush.nada.models.Product;
import com.kush.nada.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/product")
public class ProductController {

        private final ProductService productService;

        @Autowired
        public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/add")
        public ResponseEntity<Product> createProduct(@RequestBody Product product) {
            Product createdProduct = productService.createProduct(product);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
        }
    }

