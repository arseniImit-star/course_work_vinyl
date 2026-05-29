// config/YandexMusicInitializer.java
//package com.vinyl.vinyl_backend.config;
//
//import com.vinyl.vinyl_backend.service.YandexMusicService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.context.event.ApplicationReadyEvent;
//import org.springframework.context.event.EventListener;
//import org.springframework.stereotype.Component;
//
//@Component
//public class YandexMusicInitializer {
//
//    @Autowired
//    private YandexMusicService yandexMusicService;
//
//    @EventListener(ApplicationReadyEvent.class)
//    public void initYandexMusic() {
//        yandexMusicService.init();
//    }
//    }