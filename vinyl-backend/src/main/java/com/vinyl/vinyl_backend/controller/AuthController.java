// controller/AuthController.java
package com.vinyl.vinyl_backend.controller;

import com.vinyl.vinyl_backend.config.JwtUtil;
import com.vinyl.vinyl_backend.entity.User;
import com.vinyl.vinyl_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String email = request.get("email");
            String password = request.get("password");
            String firstName = request.get("firstName");
            String lastName = request.get("lastName");
            String city = request.get("city");

            // Проверка существования пользователя
            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Пользователь с таким именем уже существует"));
            }

            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Пользователь с таким email уже существует"));
            }

            // Валидация пароля
            if (password.length() < 8) {
                return ResponseEntity.badRequest().body(Map.of("message", "Пароль должен содержать минимум 8 символов"));
            }

            // Создание пользователя
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setCity(city);
            user.setCreatedAt(LocalDateTime.now());
            user.setRole("USER");
            user.setRating(0.0);

            User savedUser = userRepository.save(user);
            String token = jwtUtil.generateToken(savedUser.getUsername(), savedUser.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("id", savedUser.getId());
            response.put("username", savedUser.getUsername());
            response.put("email", savedUser.getEmail());
            response.put("role", savedUser.getRole());
            response.put("token", token);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Ошибка при регистрации: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");

            Optional<User> userOpt = userRepository.findByUsername(username);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Неверное имя пользователя или пароль"));
            }

            User user = userOpt.get();

            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Неверное имя пользователя или пароль"));
            }

            String token = jwtUtil.generateToken(user.getUsername(), user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("token", token);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Ошибка при входе: " + e.getMessage()));
        }
    }
}