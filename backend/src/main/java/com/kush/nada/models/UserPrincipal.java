package com.kush.nada.models;

import com.kush.nada.enums.Role;
import com.kush.nada.models.UserEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private UserEntity user;

    public UserPrincipal(UserEntity user) {
        this.user = user;
    }

    public UserEntity getUser() {
        return user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        if(user.getRole().equals(Role.ADMIN)){
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        if(user.getRole().equals(Role.USER)){
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

        }
        return authorities;

    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {  /// we want to login with email
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;	}


    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }


    @Override
    public boolean isEnabled() {
        return true;
    }
<<<<<<< HEAD
=======

    public Long getId() {
        return user.getId();
    }

>>>>>>> Development
}