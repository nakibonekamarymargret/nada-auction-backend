package com.kush.nada.repositories;

import com.kush.nada.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product , Long> {
}
