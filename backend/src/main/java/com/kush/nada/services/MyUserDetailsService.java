package com.kush.nada.services;

import com.kush.nada.models.UserEntity;
import com.kush.nada.models.UserPrincipal;
import com.kush.nada.repositories.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {


    private final UserRepository userRepository;

    public MyUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByEmail(email)
                .filter(u -> !u.isDeleted()) // <-- This line is the key
                .orElseThrow(() -> new UsernameNotFoundException("Invalid email or password"));
        return new UserPrincipal(user);
    }
}
