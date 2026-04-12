package com.springproject.ecom.repo;

import com.springproject.ecom.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepo extends JpaRepository<Order, Integer>{
    Optional<Order> findByOrOrderId(String orderId);
}
