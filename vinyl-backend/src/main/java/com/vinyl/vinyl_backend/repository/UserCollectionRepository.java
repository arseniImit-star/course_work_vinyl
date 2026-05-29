// repository/UserCollectionRepository.java
package com.vinyl.vinyl_backend.repository;

import com.vinyl.vinyl_backend.entity.User;
import com.vinyl.vinyl_backend.entity.UserCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserCollectionRepository extends JpaRepository<UserCollection, Long> {
    List<UserCollection> findByUser(User user);
    void deleteByUserAndId(User user, Long collectionId);
    boolean existsByUserAndVinylDataContaining(User user, String vinylId);
}