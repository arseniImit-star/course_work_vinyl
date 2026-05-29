package com.vinyl.vinyl_backend.repository;

import com.vinyl.vinyl_backend.entity.TradeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TradeRequestRepository extends JpaRepository<TradeRequest, Long> {
    List<TradeRequest> findByRequesterId(Long userId);
    List<TradeRequest> findByReceiverId(Long userId);
}