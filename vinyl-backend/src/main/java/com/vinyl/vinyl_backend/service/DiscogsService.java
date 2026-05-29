package com.vinyl.vinyl_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class DiscogsService {

    @Value("${discogs.user-token:}")
    private String userToken;

    @Value("${discogs.user-agent:VinylStoreApp/1.0}")
    private String userAgent;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();

    // Большой список популярных ID релизов на Discogs
    private final int[] RELEASE_IDS = {
            139467, 249504, 94270, 171535, 134147, 102061, 377837, 117664, 196784,
            93505, 141109, 66733, 116423, 102265, 111347, 126322, 153583, 156824,
            167215, 178912, 189345, 198765, 203456, 215678, 227890, 234567
    };

    // Транслитерация кириллицы в латиницу для лучшего поиска
    private String transliterate(String input) {
        if (input == null) return "";

        HashMap<Character, String> map = new HashMap<>();
        map.put('а', "a"); map.put('б', "b"); map.put('в', "v"); map.put('г', "g");
        map.put('д', "d"); map.put('е', "e"); map.put('ё', "yo"); map.put('ж', "zh");
        map.put('з', "z"); map.put('и', "i"); map.put('й', "y"); map.put('к', "k");
        map.put('л', "l"); map.put('м', "m"); map.put('н', "n"); map.put('о', "o");
        map.put('п', "p"); map.put('р', "r"); map.put('с', "s"); map.put('т', "t");
        map.put('у', "u"); map.put('ф', "f"); map.put('х', "kh"); map.put('ц', "ts");
        map.put('ч', "ch"); map.put('ш', "sh"); map.put('щ', "sch"); map.put('ъ', "");
        map.put('ы', "y"); map.put('ь', ""); map.put('э', "e"); map.put('ю', "yu");
        map.put('я', "ya");

        StringBuilder result = new StringBuilder();
        for (char c : input.toLowerCase().toCharArray()) {
            if (map.containsKey(c)) {
                result.append(map.get(c));
            } else {
                result.append(c);
            }
        }
        return result.toString();
    }

    // Правильное кодирование URL для кириллицы
    private String encodeQuery(String query) {
        try {
            return URLEncoder.encode(query, StandardCharsets.UTF_8.toString());
        } catch (UnsupportedEncodingException e) {
            return query;
        }
    }

    // Получение случайных пластинок с Discogs
    public List<Map<String, Object>> getRandomReleases(int count) {
        List<Map<String, Object>> releases = new ArrayList<>();

        List<Integer> shuffledIds = new ArrayList<>();
        for (int id : RELEASE_IDS) shuffledIds.add(id);
        Collections.shuffle(shuffledIds);

        for (int i = 0; i < Math.min(count, shuffledIds.size()); i++) {
            Map<String, Object> release = fetchReleaseFromDiscogs(shuffledIds.get(i));
            if (release != null && !release.isEmpty()) {
                release.put("price", generateRandomPrice());
                release.put("stockQuantity", random.nextInt(15) + 5);
                releases.add(release);
            }
            try { Thread.sleep(200); } catch (Exception e) {}
        }

        System.out.println("✅ Загружено " + releases.size() + " пластинок с Discogs");
        return releases;
    }

    // Поиск пластинок на Discogs (с поддержкой русского языка)
    public List<Map<String, Object>> searchReleases(String query, int limit) {
        if (userToken == null || userToken.isEmpty()) {
            System.err.println("❌ Discogs token not configured!");
            return new ArrayList<>();
        }

        List<Map<String, Object>> allResults = new ArrayList<>();

        // Пробуем разные варианты поиска
        String[] searchVariants = {
                query,                                    // Оригинальный запрос
                transliterate(query),                     // Транслитерация
                query.replace(" ", "+")                   // Замена пробелов на +
        };

        // Удаляем дубликаты
        LinkedHashSet<String> uniqueVariants = new LinkedHashSet<>(Arrays.asList(searchVariants));

        for (String variant : uniqueVariants) {
            if (variant == null || variant.trim().isEmpty()) continue;

            System.out.println("🔍 Пробуем поиск: " + variant);

            String url = UriComponentsBuilder.fromHttpUrl("https://api.discogs.com/database/search")
                    .queryParam("q", variant)
                    .queryParam("type", "release")
                    .queryParam("per_page", limit)
                    .build()
                    .toString();

            HttpHeaders headers = createHeaders();

            try {
                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode results = root.get("results");

                if (results != null && results.size() > 0) {
                    for (JsonNode result : results) {
                        int discogsId = result.has("id") ? result.get("id").asInt() : 0;
                        if (discogsId > 0) {
                            // Проверяем, не добавили ли уже этот релиз
                            boolean exists = allResults.stream().anyMatch(r ->
                                    r.get("id").equals(discogsId)
                            );
                            if (!exists) {
                                Map<String, Object> release = fetchReleaseFromDiscogs(discogsId);
                                if (release != null && !release.isEmpty()) {
                                    release.put("price", generateRandomPrice());
                                    release.put("stockQuantity", random.nextInt(15) + 5);
                                    allResults.add(release);
                                }
                                try { Thread.sleep(200); } catch (Exception e) {}
                            }
                        }
                    }
                }

                if (allResults.size() >= limit) break;

            } catch (Exception e) {
                System.err.println("❌ Ошибка поиска для варианта '" + variant + "': " + e.getMessage());
            }
        }

        System.out.println("✅ Поиск завершен, найдено: " + allResults.size() + " пластинок");
        return allResults;
    }

    // Фильтрация по жанру
    public List<Map<String, Object>> filterByGenre(String genre, int limit) {
        if (userToken == null || userToken.isEmpty()) {
            System.err.println("❌ Discogs token not configured!");
            return new ArrayList<>();
        }

        String encodedGenre = encodeQuery(genre);
        String url = UriComponentsBuilder.fromHttpUrl("https://api.discogs.com/database/search")
                .queryParam("type", "release")
                .queryParam("genre", encodedGenre)
                .queryParam("per_page", limit)
                .build()
                .toString();

        HttpHeaders headers = createHeaders();

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode results = root.get("results");

            List<Map<String, Object>> releases = new ArrayList<>();
            if (results != null) {
                for (JsonNode result : results) {
                    int discogsId = result.has("id") ? result.get("id").asInt() : 0;
                    if (discogsId > 0) {
                        Map<String, Object> release = fetchReleaseFromDiscogs(discogsId);
                        if (release != null && !release.isEmpty()) {
                            release.put("price", generateRandomPrice());
                            release.put("stockQuantity", random.nextInt(15) + 5);
                            releases.add(release);
                        }
                        try { Thread.sleep(200); } catch (Exception e) {}
                    }
                }
            }
            System.out.println("✅ Фильтрация по жанру '" + genre + "' завершена, найдено: " + releases.size() + " пластинок");
            return releases;
        } catch (Exception e) {
            System.err.println("❌ Ошибка фильтрации по жанру: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // Получение деталей релиза по ID
    public Map<String, Object> getReleaseDetails(int releaseId) {
        return fetchReleaseFromDiscogs(releaseId);
    }

    // Получение треклиста
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getTracklist(int releaseId) {
        Map<String, Object> release = fetchReleaseFromDiscogs(releaseId);
        if (release != null && release.containsKey("tracklist")) {
            return (List<Map<String, Object>>) release.get("tracklist");
        }
        return new ArrayList<>();
    }

    // Основной метод запроса к Discogs API
    private Map<String, Object> fetchReleaseFromDiscogs(int releaseId) {
        if (userToken == null || userToken.isEmpty()) {
            return null;
        }

        String url = "https://api.discogs.com/releases/" + releaseId;
        HttpHeaders headers = createHeaders();

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            JsonNode release = objectMapper.readTree(response.getBody());

            Map<String, Object> details = new HashMap<>();
            details.put("id", releaseId);

            // Название
            if (release.has("title")) {
                details.put("title", release.get("title").asText());
            } else {
                details.put("title", "Unknown Title");
            }

            // Исполнитель
            if (release.has("artists") && release.get("artists").size() > 0) {
                details.put("artist", release.get("artists").get(0).get("name").asText());
            } else {
                details.put("artist", "Unknown Artist");
            }

            // Год выпуска
            if (release.has("year")) {
                details.put("year", release.get("year").asInt());
            } else {
                details.put("year", null);
            }

            // Обложка
            if (release.has("images") && release.get("images").size() > 0) {
                details.put("coverImage", release.get("images").get(0).get("uri").asText());
            } else {
                details.put("coverImage", null);
            }

            // Жанр
            if (release.has("genres") && release.get("genres").size() > 0) {
                details.put("genre", release.get("genres").get(0).asText());
            } else {
                details.put("genre", "Various");
            }

            // Стиль
            if (release.has("styles") && release.get("styles").size() > 0) {
                details.put("style", release.get("styles").get(0).asText());
            }

            // Треклист
            List<Map<String, Object>> tracklist = new ArrayList<>();
            if (release.has("tracklist") && release.get("tracklist").isArray()) {
                for (JsonNode track : release.get("tracklist")) {
                    Map<String, Object> trackMap = new HashMap<>();
                    trackMap.put("position", track.has("position") ? track.get("position").asText() : "");
                    trackMap.put("title", track.has("title") ? track.get("title").asText() : "");
                    trackMap.put("duration", track.has("duration") ? track.get("duration").asText() : "");
                    tracklist.add(trackMap);
                }
            }
            details.put("tracklist", tracklist);

            System.out.println("✅ Загружен релиз: " + details.get("title") + " - " + details.get("artist"));
            return details;

        } catch (Exception e) {
            System.err.println("❌ Ошибка загрузки релиза " + releaseId + ": " + e.getMessage());
            return null;
        }
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", userAgent);
        headers.set("Authorization", "Discogs token=" + userToken);
        return headers;
    }

    private int generateRandomPrice() {
        int[] prices = {1990, 2490, 2990, 3490, 3990, 4490, 4990, 5490, 5990};
        return prices[random.nextInt(prices.length)];
    }
}