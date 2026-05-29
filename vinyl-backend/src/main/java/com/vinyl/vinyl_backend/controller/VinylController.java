package com.vinyl.vinyl_backend.controller;

import com.vinyl.vinyl_backend.entity.Vinyl;
import com.vinyl.vinyl_backend.repository.VinylRepository;
import com.vinyl.vinyl_backend.service.DiscogsService;
import com.vinyl.vinyl_backend.service.YoutubeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
//@RequestMapping("/api/vinyls")
@CrossOrigin(origins = "*")
public class VinylController {

    @Autowired
    private VinylRepository vinylRepository;

    @Autowired
    private DiscogsService discogsService;

    @Autowired
    private YoutubeService youtubeService;

    @GetMapping
    public List<Vinyl> getAllVinyls() {
        return vinylRepository.findAll();
    }

    @GetMapping("/{id}")
    public Vinyl getVinylById(@PathVariable Long id) {
        return vinylRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Vinyl createVinyl(@RequestBody Vinyl vinyl) {
        return vinylRepository.save(vinyl);
    }

    // ========== DISCOGS API ENDPOINTS ==========

    @GetMapping("/discogs/random")
    public ResponseEntity<List<Map<String, Object>>> getRandomReleases(
            @RequestParam(defaultValue = "12") int limit) {
        try {
            return ResponseEntity.ok(discogsService.getRandomReleases(limit));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/discogs/search")
    public ResponseEntity<List<Map<String, Object>>> searchReleases(
            @RequestParam String query,
            @RequestParam(defaultValue = "12") int limit) {
        try {
            return ResponseEntity.ok(discogsService.searchReleases(query, limit));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/discogs/filter")
    public ResponseEntity<List<Map<String, Object>>> filterByGenre(
            @RequestParam String genre,
            @RequestParam(defaultValue = "12") int limit) {
        try {
            return ResponseEntity.ok(discogsService.filterByGenre(genre, limit));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/discogs/release/{id}")
    public ResponseEntity<Map<String, Object>> getReleaseDetails(@PathVariable int id) {
        try {
            return ResponseEntity.ok(discogsService.getReleaseDetails(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/discogs/tracklist/{id}")
    public ResponseEntity<List<Map<String, Object>>> getTracklist(@PathVariable int id) {
        try {
            return ResponseEntity.ok(discogsService.getTracklist(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // ========== YOUTUBE API ENDPOINT ==========

    @GetMapping("/discogs/youtube")
    public ResponseEntity<Map<String, Object>> searchYoutube(
            @RequestParam String title,
            @RequestParam String artist) {
        try {
            Map<String, Object> result = youtubeService.searchTrack(title, artist);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}