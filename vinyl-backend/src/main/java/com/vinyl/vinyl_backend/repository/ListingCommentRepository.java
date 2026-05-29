// repository/ListingCommentRepository.java
package com.vinyl.vinyl_backend.repository;

import com.vinyl.vinyl_backend.entity.Listing;
import com.vinyl.vinyl_backend.entity.ListingComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ListingCommentRepository extends JpaRepository<ListingComment, Long> {
    List<ListingComment> findByListingOrderByCreatedAtDesc(Listing listing);
}