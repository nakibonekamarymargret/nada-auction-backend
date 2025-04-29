package com.kush.nada.controller;

import com.kush.nada.enums.Role;
import com.kush.nada.models.UserEntity;
import com.kush.nada.models.UserPrincipal;
import com.kush.nada.services.ResponseService;
import com.kush.nada.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserService userService;
    private final ResponseService responseService;

    public UserController(UserService userService, ResponseService responseService) {
        this.userService = userService;
        this.responseService = responseService;
    }


    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<Map<String , Object>> getAllUsers(HttpServletRequest request){
        List<UserEntity> allUsers = userService.findAllUsers();
        return responseService.createResponse(200, allUsers , request , HttpStatus.OK);
    }

    @PatchMapping("/edit/user")
    @PreAuthorize("isAuthenticated() or hasRole('ADMIN')")
    public ResponseEntity<Map<String , Object>> updateUser(
            @RequestBody UserEntity updatedUserRequest,
            HttpServletRequest request ,
            @AuthenticationPrincipal UserPrincipal principal
            ){
        String email = principal.getUser().getEmail();
        System.out.println(email);

        UserEntity updatedUser = userService.updateUserProfile(email ,updatedUserRequest);
        return responseService.createResponse(200,updatedUser,request,HttpStatus.OK);
    }

    /// lets delete a user (soft)

    @DeleteMapping("/delete/user/{id}")
    @PreAuthorize("isAuthenticated() or hasRole('ADMIN')")
    public ResponseEntity<Map<String , Object>> softDeleteUser(
            @PathVariable Long id,
            HttpServletRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ){
        String currentUserEmail = principal.getUser().getEmail();
        boolean isAdmin = principal.getUser().getRole().equals(Role.ADMIN);

        // Only allow self-deletion unless admin
        if (!isAdmin && !principal.getUser().getId().equals(id)) {
            throw new AccessDeniedException("You can only delete your own profile");
        }

        UserEntity softDeletedUser = userService.softDeleteUserById(id);
        return responseService.createResponse(
                200, "You have deleted the profile of " + softDeletedUser.getName(), request, HttpStatus.OK);
    }


}
