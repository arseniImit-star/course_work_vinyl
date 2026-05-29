// entity/Message.java
package com.vinyl.vinyl_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @ManyToOne
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @ManyToOne
    @JoinColumn(name = "listing_id")
    private Listing listing;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }

    public Conversation getConversation() { return conversation; }
    public void setConversation(Conversation conversation) { this.conversation = conversation; }

    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}