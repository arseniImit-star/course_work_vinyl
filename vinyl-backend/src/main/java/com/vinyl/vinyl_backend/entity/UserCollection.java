// entity/UserCollection.java
package com.vinyl.vinyl_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_collection")
public class UserCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "vinyl_data", columnDefinition = "json")
    private String vinylData;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @Column(name = "user_rating")
    private Integer userRating;

    @Column(name = "user_comment", columnDefinition = "TEXT")
    private String userComment;

    @Column(name = "user_photos", columnDefinition = "json")
    private String userPhotos;

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getVinylData() { return vinylData; }
    public void setVinylData(String vinylData) { this.vinylData = vinylData; }

    public LocalDateTime getAddedDate() { return addedDate; }
    public void setAddedDate(LocalDateTime addedDate) { this.addedDate = addedDate; }

    public Integer getUserRating() { return userRating; }
    public void setUserRating(Integer userRating) { this.userRating = userRating; }

    public String getUserComment() { return userComment; }
    public void setUserComment(String userComment) { this.userComment = userComment; }

    public String getUserPhotos() { return userPhotos; }
    public void setUserPhotos(String userPhotos) { this.userPhotos = userPhotos; }
}