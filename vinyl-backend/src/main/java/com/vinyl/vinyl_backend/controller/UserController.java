// controller/UserController.java
package com.vinyl.vinyl_backend.controller;

import com.vinyl.vinyl_backend.entity.User;
import com.vinyl.vinyl_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Получить информацию о пользователе по ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);

        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("city", user.getCity());
        response.put("bio", user.getBio());
        response.put("rating", user.getRating());
        response.put("avatarPath", user.getAvatarPath());
        response.put("createdAt", user.getCreatedAt());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());

        return ResponseEntity.ok(response);
    }

    // Получить текущего пользователя по токену (опционально)
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        // TODO: Извлечь userId из JWT токена
        // Пока возвращаем первого пользователя для теста
        Optional<User> userOpt = userRepository.findById(1L);

        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("city", user.getCity());
        response.put("bio", user.getBio());
        response.put("rating", user.getRating());
        response.put("avatarPath", user.getAvatarPath());

        return ResponseEntity.ok(response);
    }
}