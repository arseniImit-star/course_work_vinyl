package com.vinyl.vinyl_backend.entity;

import jakarta.persistence.*;

@Entity
public class VinylPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String photoUrl; // Путь к файлу на сервере

    @ManyToOne
    @JoinColumn(name = "vinyl_id")
    private Vinyl vinyl;

    // геттеры и сеттеры
}