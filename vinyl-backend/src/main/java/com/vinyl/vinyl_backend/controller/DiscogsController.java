package com.vinyl.vinyl_backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.*;

@RestController
@RequestMapping("/api/vinyls/discogs")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DiscogsController {

    @Value("${discogs.user-token}")
    private String discogsToken;

    @Value("${discogs.user-agent}")
    private String discogsUserAgent;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Поиск пластинок на Discogs
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchVinyls(@RequestParam String query, @RequestParam(defaultValue = "12") int limit) {
        try {
            String url = "https://api.discogs.com/database/search?q=" +
                    java.net.URLEncoder.encode(query, "UTF-8") +
                    "&type=release&per_page=" + limit;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Discogs token=" + discogsToken);
            headers.set("User-Agent", discogsUserAgent);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    JsonNode.class
            );

            JsonNode results = response.getBody().get("results");
            List<Map<String, Object>> vinyls = new ArrayList<>();

            for (JsonNode result : results) {
                Map<String, Object> vinyl = new HashMap<>();
                vinyl.put("id", result.has("id") ? result.get("id").asInt() : null);
                vinyl.put("title", result.has("title") ? result.get("title").asText() : "Unknown");
                vinyl.put("artist", extractArtist(result));
                vinyl.put("year", result.has("year") ? result.get("year").asText() : null);
                vinyl.put("genre", extractGenre(result));
                vinyl.put("coverImage", extractCoverImage(result));
                vinyl.put("label", result.has("label") && result.get("label").size() > 0 ? result.get("label").get(0).asText() : null);
                vinyl.put("country", result.has("country") ? result.get("country").asText() : null);
                vinyl.put("format", result.has("format") && result.get("format").size() > 0 ? result.get("format").get(0).asText() : "Vinyl");

                vinyls.add(vinyl);
            }

            return ResponseEntity.ok(vinyls);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка поиска: " + e.getMessage()));
        }
    }

    /**
     * Получение случайных пластинок
     */
    @GetMapping("/random")
    public ResponseEntity<?> getRandomVinyls(@RequestParam(defaultValue = "12") int limit) {
        try {
            String url = "https://api.discogs.com/database/search?type=release&sort=have&sort_order=desc&per_page=" + limit;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Discogs token=" + discogsToken);
            headers.set("User-Agent", discogsUserAgent);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    JsonNode.class
            );

            JsonNode results = response.getBody().get("results");
            List<Map<String, Object>> vinyls = new ArrayList<>();

            for (JsonNode result : results) {
                Map<String, Object> vinyl = new HashMap<>();
                vinyl.put("id", result.has("id") ? result.get("id").asInt() : null);
                vinyl.put("title", result.has("title") ? result.get("title").asText() : "Unknown");
                vinyl.put("artist", extractArtist(result));
                vinyl.put("year", result.has("year") ? result.get("year").asText() : null);
                vinyl.put("genre", extractGenre(result));
                vinyl.put("coverImage", extractCoverImage(result));

                vinyls.add(vinyl);
            }

            Collections.shuffle(vinyls);
            return ResponseEntity.ok(vinyls);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка загрузки: " + e.getMessage()));
        }
    }

    /**
     * Фильтрация по жанру
     */
    @GetMapping("/filter")
    public ResponseEntity<?> filterByGenre(@RequestParam String genre, @RequestParam(defaultValue = "12") int limit) {
        try {
            String url = "https://api.discogs.com/database/search?type=release&genre=" +
                    java.net.URLEncoder.encode(genre, "UTF-8") +
                    "&per_page=" + limit;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Discogs token=" + discogsToken);
            headers.set("User-Agent", discogsUserAgent);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    JsonNode.class
            );

            JsonNode results = response.getBody().get("results");
            List<Map<String, Object>> vinyls = new ArrayList<>();

            for (JsonNode result : results) {
                Map<String, Object> vinyl = new HashMap<>();
                vinyl.put("id", result.has("id") ? result.get("id").asInt() : null);
                vinyl.put("title", result.has("title") ? result.get("title").asText() : "Unknown");
                vinyl.put("artist", extractArtist(result));
                vinyl.put("year", result.has("year") ? result.get("year").asText() : null);
                vinyl.put("genre", genre);
                vinyl.put("coverImage", extractCoverImage(result));

                vinyls.add(vinyl);
            }

            return ResponseEntity.ok(vinyls);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка фильтрации: " + e.getMessage()));
        }
    }

    /**
     * Получение треклиста для пластинки
     */
    @GetMapping("/tracklist/{releaseId}")
    public ResponseEntity<?> getTracklist(@PathVariable String releaseId) {
        try {
            System.out.println("=== ЗАГРУЗКА ТРЕКЛИСТА ===");
            System.out.println("Release ID: " + releaseId);

            String url = "https://api.discogs.com/releases/" + releaseId;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Discogs token=" + discogsToken);
            headers.set("User-Agent", discogsUserAgent);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            System.out.println("Статус ответа: " + response.getStatusCode());

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());

            String title = root.has("title") ? root.get("title").asText() : "Unknown";
            System.out.println("Пластинка: " + title);

            JsonNode tracklistNode = root.get("tracklist");

            List<Map<String, String>> tracklist = new ArrayList<>();

            if (tracklistNode != null && tracklistNode.isArray()) {
                System.out.println("Найдено треков в ответе: " + tracklistNode.size());

                for (JsonNode track : tracklistNode) {
                    Map<String, String> trackMap = new HashMap<>();

                    String position = "";
                    if (track.has("position") && !track.get("position").isNull()) {
                        position = track.get("position").asText();
                    }
                    trackMap.put("position", position);

                    String title_ = "";
                    if (track.has("title") && !track.get("title").isNull()) {
                        title_ = track.get("title").asText();
                    }
                    trackMap.put("title", title_);

                    String duration = "";
                    if (track.has("duration") && !track.get("duration").isNull()) {
                        duration = track.get("duration").asText();
                    }
                    trackMap.put("duration", duration);

                    if (!title_.isEmpty()) {
                        tracklist.add(trackMap);
                        System.out.println("  Трек: " + position + " - " + title_ + " (" + duration + ")");
                    }
                }
            } else {
                System.out.println("Поле tracklist не найдено или не является массивом");
            }

            System.out.println("Итого загружено треков: " + tracklist.size());
            System.out.println("=========================");

            return ResponseEntity.ok(tracklist);

        } catch (HttpClientErrorException e) {
            System.err.println("HTTP ошибка: " + e.getStatusCode());
            System.err.println("Response: " + e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("error", "Ошибка загрузки треклиста: " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка: " + e.getMessage()));
        }
    }

    /**
     * Получение деталей релиза
     */
    @GetMapping("/release/{releaseId}")
    public ResponseEntity<?> getReleaseDetails(@PathVariable String releaseId) {
        try {
            String url = "https://api.discogs.com/releases/" + releaseId;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Discogs token=" + discogsToken);
            headers.set("User-Agent", discogsUserAgent);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    JsonNode.class
            );

            JsonNode release = response.getBody();
            Map<String, Object> details = new HashMap<>();

            details.put("id", release.has("id") ? release.get("id").asInt() : null);
            details.put("title", release.has("title") ? release.get("title").asText() : "Unknown");
            details.put("artist", extractArtistFromRelease(release));
            details.put("year", release.has("year") ? release.get("year").asText() : null);
            details.put("country", release.has("country") ? release.get("country").asText() : null);
            details.put("label", release.has("labels") && release.get("labels").size() > 0 ?
                    release.get("labels").get(0).get("name").asText() : null);
            details.put("genres", release.has("genres") ? release.get("genres") : null);
            details.put("coverImage", release.has("images") && release.get("images").size() > 0 ?
                    release.get("images").get(0).get("uri").asText() : null);

            return ResponseEntity.ok(details);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка загрузки деталей: " + e.getMessage()));
        }
    }

    // Вспомогательные методы для извлечения данных

    private String extractArtist(JsonNode result) {
        if (result.has("title")) {
            String title = result.get("title").asText();
            if (title.contains(" - ")) {
                return title.split(" - ")[0];
            }
        }
        if (result.has("artist")) {
            JsonNode artist = result.get("artist");
            if (artist.isArray() && artist.size() > 0) {
                return artist.get(0).asText();
            } else if (artist.isTextual()) {
                return artist.asText();
            }
        }
        return "Unknown Artist";
    }

    private String extractArtistFromRelease(JsonNode release) {
        if (release.has("artists") && release.get("artists").size() > 0) {
            return release.get("artists").get(0).get("name").asText();
        }
        if (release.has("title")) {
            String title = release.get("title").asText();
            if (title.contains(" - ")) {
                return title.split(" - ")[0];
            }
        }
        return "Unknown Artist";
    }

    private String extractGenre(JsonNode result) {
        if (result.has("genre")) {
            JsonNode genre = result.get("genre");
            if (genre.isArray() && genre.size() > 0) {
                return genre.get(0).asText();
            } else if (genre.isTextual()) {
                return genre.asText();
            }
        }
        return "Various";
    }

    private String extractCoverImage(JsonNode result) {
        if (result.has("cover_image") && !result.get("cover_image").asText().isEmpty()) {
            String coverUrl = result.get("cover_image").asText();
            return coverUrl.replace("-150", "-500");
        }
        return null;
    }
}