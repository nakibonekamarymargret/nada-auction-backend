package com.kush.nada.services;

import com.kush.nada.exceptions.NotFoundException;
import com.kush.nada.models.UserEntity;
import com.kush.nada.repositories.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);


    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserEntity> findAllUsers() {
        return userRepository.findAllActiveUsers();
    }

    public UserEntity updateUserProfile(String email , UserEntity user){
        UserEntity userEntity = userRepository.findByEmail(email)
                .orElseThrow(()-> new NotFoundException("User not found"));

        if (user.getName()!= null) userEntity.setName(user.getName());
        if (user.getAddress()!= null) userEntity.setAddress(user.getAddress());
        if(user.getEmail() != null) userEntity.setEmail(user.getEmail());
        if(user.getPhoneNumber() != null) userEntity.setPhoneNumber(user.getPhoneNumber());
        if(user.getPassword() != null ) {
            userEntity.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        }

        return userRepository.save(userEntity);

    }
    public UserEntity softDeleteUser(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(()-> new NotFoundException("User not found with ID: " + id));

        user.setDeleted(true);
        userRepository.save(user);
        return user;
    }

    public UserEntity getUserById(Long id) {
        return userRepository.findActiveUserById(id)

                .orElseThrow(() -> new NotFoundException("No User found with Id: " + id));
    }

//    public UserEntity getUserWithAuctionsAndProductsByEmail(String email) {
//        return userRepository.findByEmailWithAuctionsAndProducts(email)
//                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));
//    }

    public UserEntity getUserWithAuctionsAndProductsByEmail(String email) {
        UserEntity user = userRepository.findByEmailWithAuctions(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Manually initialize auction products
        user.getAuctions().forEach(a -> a.getProducts().size());

        return user;
    }


    public UserEntity restoreUser(Long id) {
        // Fetch the user, including soft-deleted ones
        UserEntity user = userRepository.findDeletedUserById(id)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + id));

        // Check if the user is soft-deleted before restoring
        if (!user.isDeleted()) {
            throw new IllegalArgumentException("User is already active");
        }

        // Restore the user
        user.setDeleted(false);
        return userRepository.save(user); // Save the restored user
    }


    public UserEntity softDeleteUserByEmail(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));

        user.setDeleted(true);
        userRepository.save(user);
        return user;
    }

        public UserEntity softDeleteUserById(Long id) {
            UserEntity user = userRepository.findById(id)
                    .orElseThrow(() -> new NotFoundException("User not found"));

            user.setDeleted(true); // assuming a soft-delete flag
            return userRepository.save(user);
        }


}


