package com.vinyl.vinyl_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vinyl.vinyl_backend.dto.YandexTrackDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Service
public class YandexMusicService {

    @Value("${yandex.music.token:}")
    private String token;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean isTokenConfigured() {
        return token != null && !token.isEmpty();
    }

    /**
     * Поиск треков на Яндекс.Музыке
     */
    public List<YandexTrackDTO> searchTracks(String query, int limit) {
        if (token == null || token.isEmpty()) {
            System.err.println("❌ Yandex.Music token not configured!");
            return new ArrayList<>();
        }

        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8.toString());
            String url = "https://api.music.yandex.net/search?type=track&text=" + encodedQuery + "&page=0&pageSize=" + limit;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "OAuth " + token);
            headers.set("User-Agent", "VinylStoreApp/1.0");
            headers.set("Accept", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);

            System.out.println("📊 Статус Яндекс.Музыки: " + response.getStatusCode());

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return parseSearchResponse(response.getBody());
            }

            return new ArrayList<>();

        } catch (Exception e) {
            System.err.println("❌ Yandex.Music search error: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Поиск трека по исполнителю и названию
     */
    public Optional<YandexTrackDTO> searchTrackByArtistAndTitle(String artist, String title) {
        String query = artist + " " + title;
        List<YandexTrackDTO> results = searchTracks(query, 1);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    /**
     * Получение информации о треке по ID
     */
    public Optional<YandexTrackDTO> getTrackById(String trackId) {
        if (token == null || token.isEmpty()) {
            return Optional.empty();
        }

        try {
            String url = "https://api.music.yandex.net/tracks/" + trackId;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "OAuth " + token);
            headers.set("User-Agent", "VinylStoreApp/1.0");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                YandexTrackDTO track = parseTrackResponse(response.getBody());
                if (track != null) {
                    return Optional.of(track);
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error getting track: " + e.getMessage());
        }
        return Optional.empty();
    }

    /**
     * Получение URL для прослушивания preview
     */
    public String getTrackPreviewUrl(String trackId) {
        if (token == null || token.isEmpty()) {
            return null;
        }

        try {
            String url = "https://api.music.yandex.net/tracks/" + trackId + "/download-info";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "OAuth " + token);
            headers.set("User-Agent", "VinylStoreApp/1.0");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode infos = root.path("result");
                if (infos.isArray() && infos.size() > 0) {
                    for (JsonNode info : infos) {
                        if (info.has("codec") && "mp3".equals(info.get("codec").asText())) {
                            return info.get("downloadInfoUrl").asText();
                        }
                    }
                    return infos.get(0).get("downloadInfoUrl").asText();
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error getting preview URL: " + e.getMessage());
        }
        return null;
    }

    /**
     * Получение URL для полного трека
     */
    public String getFullTrackUrl(String trackId) {
        if (token == null || token.isEmpty()) {
            return null;
        }

        try {
            long timestamp = Instant.now().getEpochSecond();
            String sign = generateSignature(trackId, timestamp);

            String url = "https://api.music.yandex.net/tracks/" + trackId + "/download-info";
            url += "?can_use_streaming=true&ts=" + timestamp + "&sign=" + sign;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "OAuth " + token);
            headers.set("X-Yandex-Music-Client", "YandexMusicAndroid/24022571");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode infos = root.path("result");

                for (JsonNode info : infos) {
                    if (!info.path("preview").asBoolean() && "mp3".equals(info.path("codec").asText())) {
                        return info.path("downloadInfoUrl").asText();
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error getting full track URL: " + e.getMessage());
        }
        return null;
    }

    /**
     * Генерация подписи для запроса полного трека
     */
    private String generateSignature(String trackId, long timestamp) {
        String secret = "XGRlBW9FXlekgbPrRHuSiA";
        String data = trackId + timestamp;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] signatureBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(signatureBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate signature", e);
        }
    }

    /**
     * Диагностика API (для отладки)
     */
    public void debugApiResponse(String query) {
        if (token == null || token.isEmpty()) {
            System.out.println("❌ Токен не настроен");
            return;
        }

        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8.toString());
            String url = "https://api.music.yandex.net/search?type=track&text=" + encodedQuery + "&page=0&pageSize=5";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "OAuth " + token);
            headers.set("User-Agent", "Mozilla/5.0");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);

            System.out.println("=== ДИАГНОСТИКА ЯНДЕКС.МУЗЫКИ ===");
            System.out.println("URL: " + url);
            System.out.println("Статус: " + response.getStatusCode());
            System.out.println("================================");

        } catch (Exception e) {
            System.err.println("Ошибка: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Парсинг ответа поиска
    private List<YandexTrackDTO> parseSearchResponse(String jsonResponse) {
        List<YandexTrackDTO> tracks = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode results = root.path("result").path("tracks").path("results");

            if (results.isArray()) {
                for (JsonNode item : results) {
                    YandexTrackDTO track = new YandexTrackDTO();
                    track.setId(item.path("id").asText());
                    track.setTitle(item.path("title").asText());

                    JsonNode artists = item.path("artists");
                    if (artists.isArray() && artists.size() > 0) {
                        track.setArtist(artists.get(0).path("name").asText());
                    }

                    JsonNode albums = item.path("albums");
                    if (albums.isArray() && albums.size() > 0) {
                        track.setAlbum(albums.get(0).path("title").asText());
                    }

                    track.setDuration(item.path("durationMs").asInt() / 1000);

                    JsonNode coverUri = item.path("coverUri");
                    if (!coverUri.isMissingNode() && !coverUri.asText().isEmpty()) {
                        String uri = coverUri.asText();
                        track.setCoverUrl("https://" + uri.replace("%%", "200x200"));
                    }

                    track.setPreviewUrl(item.path("previewUrl").asText());
                    tracks.add(track);
                }
            }
            System.out.println("✅ Найдено " + tracks.size() + " треков");
        } catch (Exception e) {
            System.err.println("❌ Error parsing response: " + e.getMessage());
        }
        return tracks;
    }

    // Парсинг ответа трека
    private YandexTrackDTO parseTrackResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode result = root.path("result");

            YandexTrackDTO track = new YandexTrackDTO();
            track.setId(result.path("id").asText());
            track.setTitle(result.path("title").asText());

            JsonNode artists = result.path("artists");
            if (artists.isArray() && artists.size() > 0) {
                track.setArtist(artists.get(0).path("name").asText());
            }

            track.setAlbum(result.path("album").path("title").asText());
            track.setDuration(result.path("durationMs").asInt() / 1000);

            return track;
        } catch (Exception e) {
            return null;
        }
    }
}