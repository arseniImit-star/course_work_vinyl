// controller/MessageController.java (полная версия)
package com.vinyl.vinyl_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vinyl.vinyl_backend.entity.Conversation;
import com.vinyl.vinyl_backend.entity.Listing;
import com.vinyl.vinyl_backend.entity.Message;
import com.vinyl.vinyl_backend.entity.User;
import com.vinyl.vinyl_backend.repository.ConversationRepository;
import com.vinyl.vinyl_backend.repository.ListingRepository;
import com.vinyl.vinyl_backend.repository.MessageRepository;
import com.vinyl.vinyl_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class MessageController {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ListingRepository listingRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Получить все диалоги пользователя
    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(@RequestParam Long userId) {
        try {
            List<Conversation> conversations = conversationRepository.findByUser(userId);

            List<Map<String, Object>> result = conversations.stream().map(conv -> {
                Long otherUserId = conv.getUser1().getId().equals(userId) ? conv.getUser2().getId() : conv.getUser1().getId();
                User otherUser = userRepository.findById(otherUserId).orElse(null);

                Map<String, Object> convMap = new HashMap<>();
                convMap.put("id", conv.getId());
                convMap.put("otherUserId", otherUserId);
                convMap.put("otherUsername", otherUser != null ? otherUser.getUsername() : "Unknown");
                convMap.put("otherUserAvatar", otherUser != null ? otherUser.getAvatarPath() : null);
                convMap.put("lastMessage", conv.getLastMessage());
                convMap.put("lastMessageTime", conv.getLastMessageTime());

                if (conv.getListing() != null) {
                    Map<String, Object> listingMap = new HashMap<>();
                    listingMap.put("id", conv.getListing().getId());
                    listingMap.put("title", conv.getListing().getTitle());
                    convMap.put("listing", listingMap);
                }

                Long unreadCount = messageRepository.countUnreadMessages(conv.getId(), userId);
                convMap.put("unreadCount", unreadCount);

                return convMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Создать новый диалог
    @PostMapping("/conversations")
    public ResponseEntity<?> createConversation(@RequestBody Map<String, Object> request) {
        try {
            Long currentUserId = ((Number) request.get("currentUserId")).longValue();
            Long otherUserId = ((Number) request.get("otherUserId")).longValue();
            Long listingId = request.get("listingId") != null ? ((Number) request.get("listingId")).longValue() : null;

            // Не даем создать диалог с самим собой
            if (currentUserId.equals(otherUserId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Нельзя создать диалог с самим собой"));
            }

            User currentUser = userRepository.findById(currentUserId).orElse(null);
            User otherUser = userRepository.findById(otherUserId).orElse(null);

            if (currentUser == null || otherUser == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Пользователь не найден"));
            }

            Listing listing = null;
            if (listingId != null) {
                listing = listingRepository.findById(listingId).orElse(null);
            }

            // Проверяем, существует ли уже диалог
            Optional<Conversation> existingConv;
            if (listing != null) {
                existingConv = conversationRepository.findByUsersAndListing(currentUserId, otherUserId, listingId);
            } else {
                existingConv = conversationRepository.findByUsers(currentUserId, otherUserId);
            }

            // Если диалог уже существует, возвращаем его
            if (existingConv.isPresent()) {
                Conversation conv = existingConv.get();
                Map<String, Object> response = new HashMap<>();
                response.put("id", conv.getId());
                response.put("otherUserId", otherUserId);
                response.put("otherUsername", otherUser.getUsername());
                response.put("alreadyExists", true);
                return ResponseEntity.ok(response);
            }

            // Создаем новый диалог
            Conversation conversation = new Conversation();
            conversation.setUser1(currentUser);
            conversation.setUser2(otherUser);
            conversation.setListing(listing);
            conversation.setCreatedAt(LocalDateTime.now());

            conversationRepository.save(conversation);

            Map<String, Object> response = new HashMap<>();
            response.put("id", conversation.getId());
            response.put("otherUserId", otherUserId);
            response.put("otherUsername", otherUser.getUsername());
            response.put("createdAt", conversation.getCreatedAt());
            response.put("alreadyExists", false);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Получить сообщения диалога
    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<?> getMessages(@PathVariable Long conversationId, @RequestParam Long userId) {
        try {
            List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

            List<Map<String, Object>> result = messages.stream().map(msg -> {
                Map<String, Object> msgMap = new HashMap<>();
                msgMap.put("id", msg.getId());
                msgMap.put("senderId", msg.getSender().getId());
                msgMap.put("receiverId", msg.getReceiver().getId());
                msgMap.put("message", msg.getMessage());
                msgMap.put("photoUrl", msg.getPhotoUrl());
                msgMap.put("isRead", msg.getIsRead());
                msgMap.put("createdAt", msg.getCreatedAt());
                return msgMap;
            }).collect(Collectors.toList());

            // Отмечаем сообщения как прочитанные
            messageRepository.markMessagesAsRead(conversationId, userId);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Отправить сообщение
    @PostMapping("/conversations/{conversationId}/send")
    public ResponseEntity<?> sendMessage(@PathVariable Long conversationId, @RequestBody Map<String, Object> request) {
        try {
            Conversation conversation = conversationRepository.findById(conversationId).orElse(null);
            if (conversation == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Диалог не найден"));
            }

            Long senderId = ((Number) request.get("senderId")).longValue();
            String messageText = (String) request.get("message");
            String photoUrl = (String) request.get("photo");

            User sender = userRepository.findById(senderId).orElse(null);
            if (sender == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Отправитель не найден"));
            }

            User receiver = conversation.getUser1().getId().equals(senderId) ? conversation.getUser2() : conversation.getUser1();

            Message message = new Message();
            message.setConversation(conversation);
            message.setSender(sender);
            message.setReceiver(receiver);
            message.setMessage(messageText != null ? messageText : "");
            message.setPhotoUrl(photoUrl);
            message.setIsRead(false);
            message.setCreatedAt(LocalDateTime.now());

            messageRepository.save(message);

            // Обновляем последнее сообщение в диалоге
            conversation.setLastMessage(messageText != null ? messageText : "📸 Фото");
            conversation.setLastMessageTime(LocalDateTime.now());
            conversationRepository.save(conversation);

            Map<String, Object> response = new HashMap<>();
            response.put("id", message.getId());
            response.put("senderId", message.getSender().getId());
            response.put("message", message.getMessage());
            response.put("photoUrl", message.getPhotoUrl());
            response.put("createdAt", message.getCreatedAt());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}