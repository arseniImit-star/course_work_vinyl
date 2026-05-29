// entity/Vinyl.java
package com.vinyl.vinyl_backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "vinyls")
public class Vinyl {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String artist;
    private Integer year;
    private BigDecimal price;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    private String description;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @ManyToOne
    @JoinColumn(name = "genre_id")
    private Genre genre;

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Genre getGenre() { return genre; }
    public void setGenre(Genre genre) { this.genre = genre; }
}