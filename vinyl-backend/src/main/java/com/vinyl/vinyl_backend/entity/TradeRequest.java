package com.vinyl.vinyl_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "trade_requests")
@Data
public class TradeRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String status; // PENDING, ACCEPTED, DECLINED, COMPLETED
    private String message;
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester;

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private User receiver;

    @ManyToOne
    @JoinColumn(name = "offered_vinyl_id")
    private Vinyl offeredVinyl;

    @ManyToOne
    @JoinColumn(name = "requested_vinyl_id")
    private Vinyl requestedVinyl;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        status = "PENDING";
    }
}