package com.kush.nada.services;

import com.kush.nada.enums.Role;
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
        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        if (userRepository.count() == 0) {
            user.setRole(Role.ADMIN);
        } else {
            user.setRole(Role.USER);
        }
        return userRepository.save(user);
    }



}
