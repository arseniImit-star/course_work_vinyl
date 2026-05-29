// service/RuTubeService.java
package com.vinyl.vinyl_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class RuTubeService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Map<String, Object>> searchVideos(String query, int limit) {
        try {
            String url = "https://rutube.ru/api/search/video/?query=" +
                    URLEncoder.encode(query, StandardCharsets.UTF_8.toString()) +
                    "&page=1&per_page=" + limit;

            System.out.println("🔍 RuTube запрос: " + url);

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode results = root.path("results");

            List<Map<String, Object>> videos = new ArrayList<>();
            if (results.isArray()) {
                for (JsonNode item : results) {
                    Map<String, Object> video = new HashMap<>();
                    video.put("id", item.path("id").asText());
                    video.put("title", item.path("title").asText());
                    video.put("videoUrl", "https://rutube.ru/video/" + item.path("id").asText() + "/");
                    video.put("thumbnailUrl", item.path("thumbnail_url").asText());
                    video.put("views", item.path("views_count").asInt());
                    video.put("author", item.path("author").path("name").asText());
                    video.put("duration", item.path("duration").asInt());
                    videos.add(video);
                }
            }

            System.out.println("✅ RuTube: найдено " + videos.size() + " видео");
            return videos;

        } catch (Exception e) {
            System.err.println("❌ RuTube ошибка: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // В методе searchForTrack добавьте фильтрацию по названию
    public List<Map<String, Object>> searchForTrack(String artist, String trackTitle) {
        List<Map<String, Object>> allVideos = new ArrayList<>();

        // Базовые запросы
        String[] searchQueries = {
                artist + " - " + trackTitle,
                artist + " " + trackTitle,
                trackTitle + " " + artist
        };

        for (String query : searchQueries) {
            List<Map<String, Object>> videos = searchVideos(query, 5);

            for (Map<String, Object> video : videos) {
                String videoTitle = ((String) video.get("title")).toLowerCase();
                String searchTitle = trackTitle.toLowerCase();

                // Фильтруем только релевантные видео
                if (videoTitle.contains(searchTitle) ||
                        videoTitle.contains(artist.toLowerCase())) {

                    // Проверяем на дубликаты
                    boolean exists = allVideos.stream()
                            .anyMatch(v -> v.get("id").equals(video.get("id")));

                    if (!exists) {
                        allVideos.add(video);
                    }
                }
            }

            if (allVideos.size() >= 5) break;
            try { Thread.sleep(300); } catch (Exception e) {}
        }

        return allVideos;
    }
}