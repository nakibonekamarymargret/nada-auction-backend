package com.kush.nada.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.kush.nada.enums.Role;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "users_table")
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id ;
    private String address;
    private String phoneNumber;
    private String name ;
    @Column(unique = true)
    private String email;
    private String password;
    @Enumerated(EnumType.STRING)
    private Role role;
    @JsonIgnore
    private boolean deleted = false;

//    @JsonIgnore
//    @OneToMany
//    private List<Product> products; // Removed relationship between User -> Product

    @JsonIgnore
    @OneToMany(mappedBy = "bidder")
    private List<Bid> bids;  // List of bids placed by the user

    @JsonIgnore
    @OneToMany(mappedBy = "user")
    private List<Payment> payments;  // List of payments made by the user

    @JsonIgnore
    @OneToMany(mappedBy = "user")
    private List<Auction> auctions;

    public UserEntity() {
    }

    public UserEntity(Long id, String address, String phoneNumber, String name, String email, String password, Role role, boolean deleted, List<Bid> bids, List<Payment> payments, List<Auction> auctions) {
        this.id = id;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.deleted = deleted;
//        this.products = products;
        this.bids = bids;
        this.payments = payments;
        this.auctions = auctions;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

//    public List<Product> getProducts() {
//        return products;
//    }
//
//    public void setProducts(List<Product> products) {
//        this.products = products;
//    }

    public List<Bid> getBids() {
        return bids;
    }

    public void setBids(List<Bid> bids) {
        this.bids = bids;
    }

    public List<Payment> getPayments() {
        return payments;
    }

    public void setPayments(List<Payment> payments) {
        this.payments = payments;
    }

    public List<Auction> getAuctions() {
        return auctions;
    }

    public void setAuctions(List<Auction> auctions) {
        this.auctions = auctions;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }
}
