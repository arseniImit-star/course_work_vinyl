package com.vinyl.vinyl_backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class CreateVinylRequest {

    @NotBlank
    private String artist;

    @NotBlank
    private String albumTitle;

    @Min(1900)
    @Max(2100)
    private Integer releaseYear;

    public String getArtist() {
        return artist;
    }

    public void setArtist(String artist) {
        this.artist = artist;
    }

    public String getAlbumTitle() {
        return albumTitle;
    }

    public void setAlbumTitle(String albumTitle) {
        this.albumTitle = albumTitle;
    }

    public Integer getReleaseYear() {
        return releaseYear;
    }

    public void setReleaseYear(Integer releaseYear) {
        this.releaseYear = releaseYear;
    }
}