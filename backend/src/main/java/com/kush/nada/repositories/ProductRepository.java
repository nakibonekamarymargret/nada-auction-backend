package com.kush.nada.repositories;

import com.kush.nada.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product , Long> {
    List<Product> findByIsClosedFalse();
}
