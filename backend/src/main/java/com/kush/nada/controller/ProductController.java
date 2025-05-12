package com.kush.nada.controller;

import com.kush.nada.models.Product;
import com.kush.nada.dtos.ProductDto;
import com.kush.nada.models.UserPrincipal;
import com.kush.nada.enums.ProductCategory;
import com.kush.nada.services.ProductService;
import com.kush.nada.services.ResponseService;
import com.kush.nada.services.S3ServiceUpload;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;



import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@CrossOrigin
@RestController
@RequestMapping("/product")
public class ProductController {

    private final ProductService productService;
    private final ResponseService responseService;
    private final S3ServiceUpload s3ServiceUpload;

    @Autowired
    public ProductController(ProductService productService, ResponseService responseService, S3ServiceUpload s3ServiceUpload) {
        this.productService = productService;
        this.responseService = responseService;
        this.s3ServiceUpload = s3ServiceUpload;
    }

    @PostMapping(value = "/add/{auctionId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Map<String, Object>> createProduct(
        @RequestParam("name") String name,
        @RequestParam("description") String description,
        @RequestParam("highestPrice") BigDecimal highestPrice,
        @RequestParam("category") String category,
        @RequestPart("file") MultipartFile file,
        @PathVariable Long auctionId,
        HttpServletRequest request,
        @AuthenticationPrincipal UserPrincipal principal) throws IOException {

    // Create Product object manually
    Product product = new Product();
    product.setName(name);
    product.setDescription(description);
    product.setHighestPrice(highestPrice);
    product.setCategory(ProductCategory.valueOf(category)); 

    // Handle image
    String imageUrl = s3ServiceUpload.uploadFile(file);
    product.setImageUrl(imageUrl);

    Product createdProduct = productService.createProduct(product, auctionId);

    return responseService.createResponse(200, createdProduct, request, HttpStatus.CREATED);
}




@GetMapping("/all")
public ResponseEntity<Map<String, Object>> getAllProducts(HttpServletRequest request) {
    List<ProductDto> products = productService.getAllProducts();
    return responseService.createResponse(200, products, request, HttpStatus.OK);
}   

    @GetMapping("/{id}")

     public ResponseEntity<Map<String, Object>> getProductById(@PathVariable Long id, HttpServletRequest request) {
        // Call the service method that returns the DTO
        ProductDto productDto = productService.getProductDtoById(id);
         Map<String, Object> responseMap = new HashMap<>();
         responseMap.put("status", 200); 
         responseMap.put("ReturnObject", productDto);

         return ResponseEntity.ok(responseMap); 
      }


    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateProduct(@PathVariable Long id, @RequestBody Product productDetails, HttpServletRequest request) {
        Product updatedProduct = productService.updateProduct(id, productDetails);
        return responseService.createResponse(200, updatedProduct, request, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable Long id, HttpServletRequest request) {
        productService.deleteProduct(id);
        return responseService.createResponse(200, "Product deleted", request, HttpStatus.OK);
    }
}