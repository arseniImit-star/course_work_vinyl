// service/CollectionService.java
package com.vinyl.vinyl_backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vinyl.vinyl_backend.dto.CollectionDTO;
import com.vinyl.vinyl_backend.entity.User;
import com.vinyl.vinyl_backend.entity.UserCollection;
import com.vinyl.vinyl_backend.repository.UserCollectionRepository;
import com.vinyl.vinyl_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CollectionService {

    @Autowired
    private UserCollectionRepository userCollectionRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public boolean addToCollection(Long userId, Map<String, Object> vinylData,
                                   Integer userRating, String userComment,
                                   List<String> userPhotos) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return false;

            // Проверяем, есть ли уже такая пластинка в коллекции
            String vinylId = String.valueOf(vinylData.get("id"));
            String vinylDataJson = objectMapper.writeValueAsString(vinylData);

            // Простая проверка существования
            List<UserCollection> existing = userCollectionRepository.findByUser(user);
            for (UserCollection uc : existing) {
                try {
                    Map<String, Object> existingData = objectMapper.readValue(uc.getVinylData(), Map.class);
                    if (existingData.get("id").toString().equals(vinylId)) {
                        return false; // Уже есть
                    }
                } catch (Exception e) {
                    // Игнорируем
                }
            }

            UserCollection collection = new UserCollection();
            collection.setUser(user);
            collection.setVinylData(vinylDataJson);
            collection.setAddedDate(LocalDateTime.now());
            collection.setUserRating(userRating);
            collection.setUserComment(userComment);
            collection.setUserPhotos(userPhotos != null ? objectMapper.writeValueAsString(userPhotos) : null);

            userCollectionRepository.save(collection);
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    public boolean removeFromCollection(Long userId, Long collectionId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return false;

            userCollectionRepository.deleteByUserAndId(user, collectionId);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<CollectionDTO> getUserCollection(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return new ArrayList<>();

        List<UserCollection> collections = userCollectionRepository.findByUser(user);

        return collections.stream().map(c -> {
            CollectionDTO dto = new CollectionDTO();
            dto.setId(c.getId());
            dto.setAddedDate(c.getAddedDate());
            dto.setUserRating(c.getUserRating());
            dto.setUserComment(c.getUserComment());

            try {
                Map<String, Object> vinylData = objectMapper.readValue(c.getVinylData(), Map.class);
                dto.setVinylData(vinylData);

                if (c.getUserPhotos() != null) {
                    List<String> photos = objectMapper.readValue(c.getUserPhotos(), List.class);
                    dto.setUserPhotos(photos);
                }
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }

            return dto;
        }).collect(Collectors.toList());
    }
    @Transactional
    public boolean updateCollectionItem(Long userId, Long collectionId, Integer userRating, String userComment, List<String> userPhotos) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return false;

            UserCollection collectionItem = userCollectionRepository.findById(collectionId).orElse(null);
            if (collectionItem == null || !collectionItem.getUser().getId().equals(userId)) return false;

            if (userRating != null) {
                collectionItem.setUserRating(userRating);
            }
            if (userComment != null) {
                collectionItem.setUserComment(userComment);
            }
            if (userPhotos != null) {
                collectionItem.setUserPhotos(objectMapper.writeValueAsString(userPhotos));
            }

            userCollectionRepository.save(collectionItem);
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}