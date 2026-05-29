// dto/CollectionDTO.java
package com.vinyl.vinyl_backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class CollectionDTO {
    private Long id;
    private Map<String, Object> vinylData;
    private LocalDateTime addedDate;
    private Integer userRating;
    private String userComment;
    private List<String> userPhotos;

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Map<String, Object> getVinylData() { return vinylData; }
    public void setVinylData(Map<String, Object> vinylData) { this.vinylData = vinylData; }

    public LocalDateTime getAddedDate() { return addedDate; }
    public void setAddedDate(LocalDateTime addedDate) { this.addedDate = addedDate; }

    public Integer getUserRating() { return userRating; }
    public void setUserRating(Integer userRating) { this.userRating = userRating; }

    public String getUserComment() { return userComment; }
    public void setUserComment(String userComment) { this.userComment = userComment; }

    public List<String> getUserPhotos() { return userPhotos; }
    public void setUserPhotos(List<String> userPhotos) { this.userPhotos = userPhotos; }
}