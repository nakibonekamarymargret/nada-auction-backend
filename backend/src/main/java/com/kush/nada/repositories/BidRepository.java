//package com.kush.nada.repositories;
//
//import com.kush.nada.models.Bid;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//
//@Repository
//public interface BidRepository extends JpaRepository<Bid , Long> {
//}

// Version 2

package com.kush.nada.repositories;

import com.kush.nada.models.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByProductId(Long productId);

    default Bid findTopByProductIdOrderByAmountDesc(Long productId) {
        List<Bid> bids = findByProductIdOrderByAmountDesc(productId);
        return bids.isEmpty() ? null : bids.get(0);
    }

    List<Bid> findByProductIdOrderByAmountDesc(Long productId);
}
