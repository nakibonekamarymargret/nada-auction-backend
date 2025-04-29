package com.kush.nada.services;

import com.kush.nada.enums.Role;
import com.kush.nada.exceptions.BadRequestException;
import com.kush.nada.models.UserEntity;
import com.kush.nada.repositories.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);


    public UserEntity registerUser(UserEntity user){
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            throw new BadRequestException("Name cannot be empty");
        }
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email cannot be empty");
        }
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }
        if (userRepository.existsByName(user.getName())) {
            throw new BadRequestException("Name is already taken");
        }
        if (user.getAddress() == null || user.getAddress().isEmpty()) {
            throw new BadRequestException("Address is required.");
        }
        if (user.getPhoneNumber() == null || user.getPhoneNumber().isEmpty()) {
            throw new BadRequestException("Phone Number is required.");
        }
        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        user.setRole(userRepository.count() == 0 ? Role.ADMIN : Role.USER);


        return userRepository.save(user);
    }



}
