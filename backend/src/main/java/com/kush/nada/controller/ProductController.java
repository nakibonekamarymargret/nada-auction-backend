package com.kush.nada.controller;

import com.kush.nada.models.Product;
import com.kush.nada.models.UserPrincipal;
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
import org.springframework.web.bind.annotation.CrossOrigin;

import java.io.IOException;
import java.util.List;
import java.util.Map;

//@RestController
//@RequestMapping("/product")
//public class ProductController {
//
//        private final ProductService productService;
//        private final ResponseService responseService;
//
//        @Autowired
//        public ProductController(ProductService productService, ResponseService responseService) {
//        this.productService = productService;
//        this.responseService = responseService;
//    }
//
//    @PostMapping("/add")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Map<String, Object>> createProduct(
//            @RequestBody Product product,
//            HttpServletRequest request,
//            @AuthenticationPrincipal UserPrincipal principal) {
//
//        Product createdProduct = productService.createProduct(product, principal.getUser());
//        return responseService.createResponse(200, createdProduct, request, HttpStatus.OK);
//    }
//
//
//}
//
//
//@RestController
//@RequestMapping("/product")
//public class ProductController {
//
//    @Autowired
//    private ProductService productService;
//
//    @Autowired
//    private ResponseService responseService;
//
//    @Autowired
//    private final S3ServiceUpload s3ServiceUpload;
//    // CREATE
////    @PostMapping("/add/{auctionId}")
////    @PreAuthorize("hasRole('ADMIN')")
////    public ResponseEntity<Map<String, Object>> createProduct(
////            @RequestBody Product product,
////            @PathVariable Long auctionId,
////            HttpServletRequest request,
////            @AuthenticationPrincipal UserPrincipal principal) {
////
////        Product createdProduct = productService.createProduct(product, auctionId);
////        return responseService.createResponse(200, createdProduct, request, HttpStatus.OK);
////    }
//
//    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Map<String, Object>> createProduct(
//            @RequestPart("product") Product product,
//            @RequestPart("file") MultipartFile file,
//            HttpServletRequest request,
//            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
//
//        // 1. Upload image to S3
//        String imageUrl = s3ServiceUpload.uploadFile(file);
//        product.setImageUrl(imageUrl);
//
//        // 2. Validate and associate auction
//        Long auctionId = product.getAuctionId();
//        if (auctionId == null) {
//            throw new IllegalArgumentException("Auction ID must be provided");
//        }
//
//        // 3. Create product with seller association
//        Product createdProduct = productService.createProduct(product, principal.getUser());
//
//        return responseService.createResponse(
//                200,
//                createdProduct,
//                request,
//                HttpStatus.CREATED
//        );
//    }
//}
//
//    // READ ALL
//    @GetMapping("/all")
//    // @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Map<String, Object>> getAllProducts(HttpServletRequest request) {
//        List<Product> products = productService.getAllProducts();
//        return responseService.createResponse(200, products, request, HttpStatus.OK);
//    }
//
//    // READ BY ID
//    @GetMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Map<String, Object>> getProductById(
//            @PathVariable Long id,
//            HttpServletRequest request) {
//
//        Product product = productService.getProductById(id);
//        return responseService.createResponse(200, product, request, HttpStatus.OK);
//    }
//
//    // UPDATE
//    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Map<String, Object>> updateProduct(
//            @PathVariable Long id,
//            @RequestBody Product productDetails,
//            HttpServletRequest request) {
//
//        Product updatedProduct = productService.updateProduct(id, productDetails);
//        return responseService.createResponse(200, updatedProduct, request, HttpStatus.OK);
//    }
//
//    // DELETE
//    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Map<String, Object>> deleteProduct(
//            @PathVariable Long id,
//            HttpServletRequest request) {
//
//        productService.deleteProduct(id);
//        return responseService.createResponse(200, "Product deleted", request, HttpStatus.OK);
//    }
//}
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
            @RequestPart("product") Product product,
            @PathVariable Long auctionId,
            @RequestPart("file") MultipartFile file,
            HttpServletRequest request,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {

        // Upload image to S3
        String imageUrl = s3ServiceUpload.uploadFile(file);
        product.setImageUrl(imageUrl);

        // Ensure auction ID exists
//        if (product.getAuction() == null || product.getAuction().getId() == null) {
//            throw new IllegalArgumentException("Auction ID must be provided.");
//        }

        Product createdProduct = productService.createProduct(product, auctionId);

        return responseService.createResponse(200, createdProduct, request, HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllProducts(HttpServletRequest request) {
        List<Product> products = productService.getAllProducts();
        return responseService.createResponse(200, products, request, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable Long id, HttpServletRequest request) {
        Product product = productService.getProductById(id);
        return responseService.createResponse(200, product, request, HttpStatus.OK);
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
