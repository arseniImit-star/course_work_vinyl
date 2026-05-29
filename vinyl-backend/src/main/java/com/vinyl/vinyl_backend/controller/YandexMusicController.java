package com.vinyl.vinyl_backend.controller;

import com.vinyl.vinyl_backend.dto.YandexTrackDTO;
import com.vinyl.vinyl_backend.service.YandexMusicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/yandex")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class YandexMusicController {

    @Autowired
    private YandexMusicService yandexMusicService;

    @GetMapping("/search")
    public ResponseEntity<?> searchTracks(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            String decodedQuery = URLDecoder.decode(q, StandardCharsets.UTF_8.toString());
            System.out.println("🔍 Поиск на Яндекс.Музыке: " + decodedQuery);

            List<YandexTrackDTO> tracks = yandexMusicService.searchTracks(decodedQuery, limit);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("query", decodedQuery);
            response.put("total", tracks.size());
            response.put("tracks", tracks);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/track")
    public ResponseEntity<?> searchTrackByArtistAndTitle(
            @RequestParam String artist,
            @RequestParam String title) {
        try {
            String decodedArtist = URLDecoder.decode(artist, StandardCharsets.UTF_8.toString());
            String decodedTitle = URLDecoder.decode(title, StandardCharsets.UTF_8.toString());

            Optional<YandexTrackDTO> track = yandexMusicService.searchTrackByArtistAndTitle(decodedArtist, decodedTitle);

            if (track.isPresent()) {
                return ResponseEntity.ok(track.get());
            } else {
                return ResponseEntity.status(404)
                        .body(Map.of("error", "Трек не найден"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/play/{trackId}")
    public ResponseEntity<?> getTrackPreview(@PathVariable String trackId) {
        try {
            String url = yandexMusicService.getTrackPreviewUrl(trackId);
            if (url != null) {
                return ResponseEntity.ok(Map.of("url", url));
            } else {
                return ResponseEntity.status(404)
                        .body(Map.of("error", "Не удалось получить ссылку на трек"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/play-full/{trackId}")
    public ResponseEntity<?> getFullTrack(@PathVariable String trackId) {
        try {
            String url = yandexMusicService.getFullTrackUrl(trackId);
            if (url != null) {
                return ResponseEntity.ok(Map.of("url", url));
            } else {
                return ResponseEntity.status(404)
                        .body(Map.of("error", "Не удалось получить ссылку на полный трек"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        try {
            List<String> testQueries = Arrays.asList("Queen", "The Beatles", "Imagine Dragons");
            Map<String, Object> results = new HashMap<>();

            for (String query : testQueries) {
                List<YandexTrackDTO> tracks = yandexMusicService.searchTracks(query, 3);
                results.put(query, tracks.size());
            }

            return ResponseEntity.ok(Map.of(
                    "token_configured", yandexMusicService.isTokenConfigured(),
                    "results", results
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/debug")
    public ResponseEntity<?> debug(@RequestParam String q) {
        yandexMusicService.debugApiResponse(q);
        return ResponseEntity.ok(Map.of("message", "Check server logs"));
    }
}