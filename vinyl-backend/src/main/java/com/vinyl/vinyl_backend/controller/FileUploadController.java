package com.vinyl.vinyl_backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Value("${upload.path}")
    private String uploadPath;

    @PostMapping("/photo")
    public ResponseEntity<String> uploadPhoto(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            String originalName = file.getOriginalFilename();
            String extension = originalName.substring(originalName.lastIndexOf("."));
            String fileName = UUID.randomUUID().toString() + extension;

            Path uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            Path targetPath = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/" + fileName;
            return ResponseEntity.ok(fileUrl);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed");
        }
    }
}