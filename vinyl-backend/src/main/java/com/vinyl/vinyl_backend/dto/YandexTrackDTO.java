// dto/YandexTrackDTO.java
package com.vinyl.vinyl_backend.dto;

public class YandexTrackDTO {
    private String id;
    private String title;
    private String artist;
    private String album;
    private Integer duration;
    private String coverUrl;
    private String previewUrl;

    // Геттеры
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getArtist() { return artist; }
    public String getAlbum() { return album; }
    public Integer getDuration() { return duration; }
    public String getCoverUrl() { return coverUrl; }
    public String getPreviewUrl() { return previewUrl; }

    // Сеттеры
    public void setId(String id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setArtist(String artist) { this.artist = artist; }
    public void setAlbum(String album) { this.album = album; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
    public void setPreviewUrl(String previewUrl) { this.previewUrl = previewUrl; }
}