//package com.vinyl.vinyl_backend.config;
//
//import com.vinyl.vinyl_backend.entity.User;
//import com.vinyl.vinyl_backend.entity.Vinyl;
//import com.vinyl.vinyl_backend.repository.UserRepository;
//import com.vinyl.vinyl_backend.repository.VinylRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.stereotype.Component;
//import java.math.BigDecimal;
//
//@Component
//public class DataInitializer implements CommandLineRunner {
//
//    @Autowired
//    private VinylRepository vinylRepository;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Override
//    public void run(String... args) throws Exception {
//        // Добавляем тестового пользователя
//        if (userRepository.count() == 0) {
//            User user = new User();
//            user.setUsername("user");
//            user.setEmail("user@example.com");
//            user.setPassword("password");
//            userRepository.save(user);
//        }
//
//        // Добавляем тестовые пластинки
//        if (vinylRepository.count() == 0) {
//            Vinyl vinyl1 = new Vinyl();
//            vinyl1.setTitle("Abbey Road");
//            vinyl1.setArtist("The Beatles");
//            vinyl1.setYear(1969);
//            vinyl1.setPrice(new BigDecimal("29.99"));
//            vinyl1.setStockQuantity(10);
//            vinylRepository.save(vinyl1);
//
//            Vinyl vinyl2 = new Vinyl();
//            vinyl2.setTitle("The Dark Side of the Moon");
//            vinyl2.setArtist("Pink Floyd");
//            vinyl2.setYear(1973);
//            vinyl2.setPrice(new BigDecimal("34.99"));
//            vinyl2.setStockQuantity(5);
//            vinylRepository.save(vinyl2);
//
//            Vinyl vinyl3 = new Vinyl();
//            vinyl3.setTitle("Thriller");
//            vinyl3.setArtist("Michael Jackson");
//            vinyl3.setYear(1982);
//            vinyl3.setPrice(new BigDecimal("24.99"));
//            vinyl3.setStockQuantity(15);
//            vinylRepository.save(vinyl3);
//        }
//    }
//}