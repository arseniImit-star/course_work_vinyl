// repository/MessageRepository.java
package com.vinyl.vinyl_backend.repository;

import com.vinyl.vinyl_backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt ASC")
    List<Message> findByConversationIdOrderByCreatedAtAsc(@Param("conversationId") Long conversationId);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId AND m.receiver.id = :userId")
    void markMessagesAsRead(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId AND m.receiver.id = :userId AND m.isRead = false")
    Long countUnreadMessages(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
}