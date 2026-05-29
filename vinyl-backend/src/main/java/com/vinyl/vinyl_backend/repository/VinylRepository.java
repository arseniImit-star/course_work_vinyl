// repository/VinylRepository.java
package com.vinyl.vinyl_backend.repository;

import com.vinyl.vinyl_backend.entity.Vinyl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VinylRepository extends JpaRepository<Vinyl, Long> {

    // Поиск по исполнителю (точное совпадение)
    List<Vinyl> findByArtist(String artist);

    // Поиск по исполнителю (без учета регистра, частичное совпадение)
    List<Vinyl> findByArtistContainingIgnoreCase(String artist);

    // Поиск по названию (без учета регистра, частичное совпадение)
    List<Vinyl> findByTitleContainingIgnoreCase(String title);

    // Поиск по жанру
    List<Vinyl> findByGenreId(Long genreId);

    // Поиск по году выпуска
    List<Vinyl> findByYear(Integer year);

    // Поиск по цене (меньше или равно)
    List<Vinyl> findByPriceLessThanEqual(Double price);
}