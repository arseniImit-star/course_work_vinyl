// entity/Listing.java
package com.vinyl.vinyl_backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "listings")
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "vinyl_data", columnDefinition = "json")
    private String vinylData;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingType type;

    private BigDecimal price;

    @Column(name = "desired_records", columnDefinition = "TEXT")
    private String desiredRecords;

    @Enumerated(EnumType.STRING)
    private ListingStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getVinylData() { return vinylData; }
    public void setVinylData(String vinylData) { this.vinylData = vinylData; }

    public ListingType getType() { return type; }
    public void setType(ListingType type) { this.type = type; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getDesiredRecords() { return desiredRecords; }
    public void setDesiredRecords(String desiredRecords) { this.desiredRecords = desiredRecords; }

    public ListingStatus getStatus() { return status; }
    public void setStatus(ListingStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}