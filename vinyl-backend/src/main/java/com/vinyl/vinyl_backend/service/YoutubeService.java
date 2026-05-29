package com.vinyl.vinyl_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.*;

@Service
public class YoutubeService {

    @Value("${youtube.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Поиск видео на YouTube по названию трека и исполнителю
    public Map<String, Object> searchTrack(String trackTitle, String artist) {
        if (apiKey == null || apiKey.isEmpty()) {
            return getMockYoutubeResult(trackTitle, artist);
        }

        String query = trackTitle + " " + artist + " official audio";
        String url = UriComponentsBuilder.fromHttpUrl("https://www.googleapis.com/youtube/v3/search")
                .queryParam("part", "snippet")
                .queryParam("q", query)
                .queryParam("type", "video")
                .queryParam("maxResults", 1)
                .queryParam("key", apiKey)
                .build()
                .toString();

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, null, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode items = root.get("items");

            if (items != null && items.size() > 0) {
                JsonNode firstVideo = items.get(0);
                String videoId = firstVideo.get("id").get("videoId").asText();
                String title = firstVideo.get("snippet").get("title").asText();

                Map<String, Object> result = new HashMap<>();
                result.put("videoId", videoId);
                result.put("title", title);
                return result;
            }
            return getMockYoutubeResult(trackTitle, artist);
        } catch (Exception e) {
            System.err.println("Ошибка поиска на YouTube: " + e.getMessage());
            return getMockYoutubeResult(trackTitle, artist);
        }
    }

    // Мок-данные на случай ошибки API
    private Map<String, Object> getMockYoutubeResult(String trackTitle, String artist) {
        Map<String, Object> mock = new HashMap<>();
        mock.put("videoId", "dQw4w9WgXcQ"); // Демо-видео
        mock.put("title", trackTitle + " - " + artist);
        return mock;
    }
}