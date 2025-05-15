package com.kush.nada.dtos;

import com.kush.nada.enums.ProductCategory;

public class ProductUpdateDto {
    // Only include fields that are updateable via this endpoint
    private String name;
    private String description;
    private ProductCategory category; // *** Use the actual Enum type ***


    // Getters and Setters for these fields
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    // *** Getter and Setter for the Enum type ***
    public ProductCategory getCategory() { return category; }
    public void setCategory(ProductCategory category) { this.category = category; }

    // ... other getters and setters ...

    // Optional: Add a constructor if needed
}
