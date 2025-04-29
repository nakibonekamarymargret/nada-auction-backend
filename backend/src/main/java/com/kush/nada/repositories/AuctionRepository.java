package com.kush.nada.repositories;

import com.kush.nada.models.Auction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuctionRepository extends JpaRepository<Auction , Long> {
}
