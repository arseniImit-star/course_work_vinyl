package com.vinyl.vinyl_backend.service;

import com.vinyl.vinyl_backend.entity.Vinyl;
import com.vinyl.vinyl_backend.repository.VinylRepository;  // ← ДОБАВЬТЕ ЭТУ СТРОКУ
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class VinylService {

    @Autowired
    private VinylRepository vinylRepository;

    public List<Vinyl> getAllVinyls() {
        return vinylRepository.findAll();
    }

    public Vinyl getVinylById(Long id) {
        return vinylRepository.findById(id).orElse(null);
    }

    public Vinyl createVinyl(Vinyl vinyl) {
        return vinylRepository.save(vinyl);
    }

    public Vinyl updateVinyl(Long id, Vinyl vinylDetails) {
        Vinyl vinyl = vinylRepository.findById(id).orElse(null);
        if (vinyl != null) {
            vinyl.setTitle(vinylDetails.getTitle());
            vinyl.setArtist(vinylDetails.getArtist());
            vinyl.setYear(vinylDetails.getYear());
            vinyl.setDescription(vinylDetails.getDescription());
            vinyl.setPrice(vinylDetails.getPrice());
            vinyl.setStockQuantity(vinylDetails.getStockQuantity());
            vinyl.setCoverImageUrl(vinylDetails.getCoverImageUrl());
            return vinylRepository.save(vinyl);
        }
        return null;
    }

    public void deleteVinyl(Long id) {
        vinylRepository.deleteById(id);
    }

    public List<Vinyl> searchByArtist(String artist) {
        return vinylRepository.findByArtist(artist);
    }

    public List<Vinyl> searchByTitle(String title) {
        return vinylRepository.findByTitleContainingIgnoreCase(title);
    }
}