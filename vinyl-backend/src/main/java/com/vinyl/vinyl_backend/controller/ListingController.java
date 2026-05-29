// controller/ListingController.java
package com.vinyl.vinyl_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vinyl.vinyl_backend.entity.Listing;
import com.vinyl.vinyl_backend.entity.ListingComment;
import com.vinyl.vinyl_backend.entity.ListingStatus;
import com.vinyl.vinyl_backend.entity.ListingType;
import com.vinyl.vinyl_backend.entity.User;
import com.vinyl.vinyl_backend.repository.ListingCommentRepository;
import com.vinyl.vinyl_backend.repository.ListingRepository;
import com.vinyl.vinyl_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ListingController {

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ListingCommentRepository commentRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/listings")
    public ResponseEntity<List<Map<String, Object>>> getAllListings() {
        List<Listing> listings = listingRepository.findByStatus(ListingStatus.ACTIVE);

        List<Map<String, Object>> response = listings.stream().map(listing -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", listing.getId());
            map.put("title", listing.getTitle());
            map.put("description", listing.getDescription());
            map.put("type", listing.getType().toString());
            map.put("price", listing.getPrice());
            map.put("desiredRecords", listing.getDesiredRecords());
            map.put("status", listing.getStatus().toString());
            map.put("createdAt", listing.getCreatedAt());
            map.put("userId", listing.getUser().getId());
            map.put("username", listing.getUser().getUsername());

            try {
                Map<String, Object> vinylData = objectMapper.readValue(listing.getVinylData(), Map.class);
                map.put("vinylData", vinylData);
            } catch (Exception e) {
                map.put("vinylData", new HashMap<>());
            }

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<?> getListing(@PathVariable Long id) {
        Listing listing = listingRepository.findById(id).orElse(null);
        if (listing == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", listing.getId());
        response.put("title", listing.getTitle());
        response.put("description", listing.getDescription());
        response.put("type", listing.getType().toString());
        response.put("price", listing.getPrice());
        response.put("desiredRecords", listing.getDesiredRecords());
        response.put("status", listing.getStatus().toString());
        response.put("createdAt", listing.getCreatedAt());
        response.put("userId", listing.getUser().getId());
        response.put("username", listing.getUser().getUsername());

        try {
            Map<String, Object> vinylData = objectMapper.readValue(listing.getVinylData(), Map.class);
            response.put("vinylData", vinylData);
        } catch (Exception e) {
            response.put("vinylData", new HashMap<>());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/listings")
    public ResponseEntity<?> createListing(@RequestBody Map<String, Object> request) {
        try {
            Long userId = ((Number) request.get("userId")).longValue();
            String type = (String) request.get("type");
            String title = (String) request.get("title");
            String description = (String) request.get("description");
            Map<String, Object> vinylData = (Map<String, Object>) request.get("vinylData");
            Double price = request.get("price") != null ? ((Number) request.get("price")).doubleValue() : null;
            String desiredRecords = (String) request.get("desiredRecords");

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Пользователь не найден"));
            }

            Listing listing = new Listing();
            listing.setUser(user);
            listing.setTitle(title);
            listing.setDescription(description);
            listing.setType(ListingType.valueOf(type));
            listing.setVinylData(objectMapper.writeValueAsString(vinylData));
            listing.setPrice(price != null ? java.math.BigDecimal.valueOf(price) : null);
            listing.setDesiredRecords(desiredRecords);
            listing.setStatus(ListingStatus.ACTIVE);
            listing.setCreatedAt(LocalDateTime.now());

            listingRepository.save(listing);

            return ResponseEntity.ok(Map.of("success", true, "listing", listing.getId()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @DeleteMapping("/listings/{id}")
    public ResponseEntity<?> deleteListing(@PathVariable Long id) {
        Listing listing = listingRepository.findById(id).orElse(null);
        if (listing == null) {
            return ResponseEntity.notFound().build();
        }

        listing.setStatus(ListingStatus.CLOSED);
        listingRepository.save(listing);

        return ResponseEntity.ok(Map.of("success", true));
    }

    // ========== МЕТОДЫ ДЛЯ КОММЕНТАРИЕВ ==========

    // Получить комментарии к объявлению
    @GetMapping("/listings/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable Long id) {
        try {
            Listing listing = listingRepository.findById(id).orElse(null);
            if (listing == null) {
                return ResponseEntity.notFound().build();
            }

            List<ListingComment> comments = commentRepository.findByListingOrderByCreatedAtDesc(listing);

            List<Map<String, Object>> response = comments.stream().map(comment -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", comment.getId());
                map.put("content", comment.getContent());
                map.put("createdAt", comment.getCreatedAt());
                map.put("userId", comment.getUser().getId());
                map.put("username", comment.getUser().getUsername());
                map.put("userAvatar", comment.getUser().getAvatarPath());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Добавить комментарий к объявлению (с получением userId из тела запроса)
    @PostMapping("/listings/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Listing listing = listingRepository.findById(id).orElse(null);
            if (listing == null) {
                return ResponseEntity.notFound().build();
            }

            // Получаем userId из тела запроса (передается с фронтенда)
            Long userId = null;
            if (request.get("userId") != null) {
                userId = ((Number) request.get("userId")).longValue();
            }

            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Пользователь не авторизован"));
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Пользователь не найден"));
            }

            String content = (String) request.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Комментарий не может быть пустым"));
            }

            ListingComment comment = new ListingComment();
            comment.setListing(listing);
            comment.setUser(user);
            comment.setContent(content);
            comment.setCreatedAt(LocalDateTime.now());

            commentRepository.save(comment);

            return ResponseEntity.ok(Map.of("success", true, "message", "Комментарий добавлен"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}