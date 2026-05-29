// controller/CollectionController.java
package com.vinyl.vinyl_backend.controller;

import com.vinyl.vinyl_backend.dto.CollectionDTO;
import com.vinyl.vinyl_backend.service.CollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/collection")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class CollectionController {

    @Autowired
    private CollectionService collectionService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserCollection(@PathVariable Long userId) {
        List<CollectionDTO> collection = collectionService.getUserCollection(userId);
        return ResponseEntity.ok(collection);
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<?> addToCollection(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        Map<String, Object> vinylData = (Map<String, Object>) request.get("vinylData");
        Integer userRating = (Integer) request.get("userRating");
        String userComment = (String) request.get("userComment");
        @SuppressWarnings("unchecked")
        List<String> userPhotos = (List<String>) request.get("userPhotos");

        boolean added = collectionService.addToCollection(userId, vinylData, userRating, userComment, userPhotos);

        Map<String, Object> response = new HashMap<>();
        response.put("success", added);
        response.put("message", added ? "Пластинка добавлена в коллекцию" : "Пластинка уже в коллекции");

        return ResponseEntity.ok(response);
    }
// CollectionController.java - добавьте этот метод

    @PutMapping("/{userId}/{collectionId}")
    public ResponseEntity<?> updateCollectionItem(
            @PathVariable Long userId,
            @PathVariable Long collectionId,
            @RequestBody Map<String, Object> request) {

        Integer userRating = (Integer) request.get("userRating");
        String userComment = (String) request.get("userComment");
        @SuppressWarnings("unchecked")
        List<String> userPhotos = (List<String>) request.get("userPhotos");

        boolean updated = collectionService.updateCollectionItem(userId, collectionId, userRating, userComment, userPhotos);

        Map<String, Object> response = new HashMap<>();
        response.put("success", updated);
        response.put("message", updated ? "Изменения сохранены" : "Ошибка при сохранении");

        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{userId}/{collectionId}")
    public ResponseEntity<?> removeFromCollection(@PathVariable Long userId, @PathVariable Long collectionId) {
        boolean removed = collectionService.removeFromCollection(userId, collectionId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", removed);
        response.put("message", removed ? "Пластинка удалена из коллекции" : "Ошибка при удалении");

        return ResponseEntity.ok(response);
    }
}