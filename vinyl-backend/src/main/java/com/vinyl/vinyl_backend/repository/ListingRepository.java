package com.vinyl.vinyl_backend.repository;

import com.vinyl.vinyl_backend.entity.Listing;
import com.vinyl.vinyl_backend.entity.ListingStatus;
import com.vinyl.vinyl_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByStatus(ListingStatus status);
    List<Listing> findByUser(User user);
    List<Listing> findByStatusOrderByCreatedAtDesc(ListingStatus status);
}