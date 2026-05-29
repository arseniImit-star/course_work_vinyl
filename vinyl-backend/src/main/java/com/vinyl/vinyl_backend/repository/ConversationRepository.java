// repository/ConversationRepository.java
package com.vinyl.vinyl_backend.repository;

import com.vinyl.vinyl_backend.entity.Conversation;
import com.vinyl.vinyl_backend.entity.Listing;
import com.vinyl.vinyl_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE c.user1.id = :userId OR c.user2.id = :userId ORDER BY c.lastMessageTime DESC")
    List<Conversation> findByUser(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE (c.user1.id = :user1Id AND c.user2.id = :user2Id) OR (c.user1.id = :user2Id AND c.user2.id = :user1Id)")
    Optional<Conversation> findByUsers(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);

    @Query("SELECT c FROM Conversation c WHERE ((c.user1.id = :user1Id AND c.user2.id = :user2Id) OR (c.user1.id = :user2Id AND c.user2.id = :user1Id)) AND c.listing.id = :listingId")
    Optional<Conversation> findByUsersAndListing(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id, @Param("listingId") Long listingId);

    // Проверка существования диалога
    boolean existsByUser1AndUser2(User user1, User user2);
    boolean existsByUser1AndUser2AndListing(User user1, User user2, Listing listing);
}