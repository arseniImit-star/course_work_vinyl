// controller/RuTubeController.java
package com.vinyl.vinyl_backend.controller;

import com.vinyl.vinyl_backend.service.RuTubeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/rutube")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class RuTubeController {

    @Autowired
    private RuTubeService ruTubeService;

    @GetMapping("/search")
    public ResponseEntity<?> searchVideos(@RequestParam String q, @RequestParam(defaultValue = "5") int limit) {
        try {
            String decodedQuery = URLDecoder.decode(q, StandardCharsets.UTF_8.toString());
            List<Map<String, Object>> videos = ruTubeService.searchVideos(decodedQuery, limit);

            Map<String, Object> response = new HashMap<>();
            response.put("videos", videos);
            response.put("total", videos.size());
            response.put("query", decodedQuery);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/track")
    public ResponseEntity<?> searchForTrack(@RequestParam String artist, @RequestParam String track) {
        try {
            String decodedArtist = URLDecoder.decode(artist, StandardCharsets.UTF_8.toString());
            String decodedTrack = URLDecoder.decode(track, StandardCharsets.UTF_8.toString());

            List<Map<String, Object>> videos = ruTubeService.searchForTrack(decodedArtist, decodedTrack);

            Map<String, Object> response = new HashMap<>();
            response.put("videos", videos);
            response.put("total", videos.size());
            response.put("artist", decodedArtist);
            response.put("track", decodedTrack);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}