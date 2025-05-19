package com.kush.nada.controller;

import com.kush.nada.models.UserEntity;
import com.kush.nada.repositories.UserRepository;
import com.kush.nada.services.AuthService;
import com.kush.nada.services.JwtService;
import com.kush.nada.services.ResponseService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.CrossOrigin;


import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ResponseService responseService;
    private final AuthenticationManager authenticationManager;
//    private final S3ServiceUpload s3ServiceUpload;

    public AuthController(AuthService authService, JwtService jwtService, UserRepository userRepository, ResponseService responseService, AuthenticationManager authenticationManager
//                          S3ServiceUpload s3ServiceUpload
    ) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.responseService = responseService;
        this.authenticationManager = authenticationManager;
//        this.s3ServiceUpload = s3ServiceUpload;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<Map<String, Object>> registerUserWithImage(@RequestBody UserEntity user,
                                                                     HttpServletRequest request
    ) {

        // Register the user
        UserEntity registeredUser = authService.registerUser(user);

        return responseService.createResponse(201, registeredUser, request, HttpStatus.CREATED);
    }

    @PostMapping("/auth/login")
    //** http://localhost:8080/api/auth/login
    public ResponseEntity<Map<String, Object>> userLogin(@RequestBody UserEntity user, HttpServletRequest request) throws BadCredentialsException {
        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
        );

        // If authentication is successful
        if (authentication.isAuthenticated()) {
            // Generate JWT token for the authenticated user
            String token = jwtService.generateToken(user.getEmail());

            // Fetch the authenticated user from the database using the email
            Optional<UserEntity> authenticatedUser = userRepository.findByEmail(user.getEmail());

            // If the user is found, proceed to return the response
            if (authenticatedUser.isPresent()) {
                UserEntity userEntity = authenticatedUser.get();

                // Prepare the response data
                Map<String, Object> response = new HashMap<>();
                response.put("email", userEntity.getEmail());
                response.put("role", userEntity.getRole());
                response.put("token", token);

                // Return the response
                return responseService.createResponse(200, response, request, HttpStatus.OK);
            }
        }

        // If authentication fails or user is not found, throw the exception
        throw new BadCredentialsException("Invalid email or password");
    }


//  Validation Api
    @PostMapping("/auth/validate-user-details")
public ResponseEntity<Map<String, Object>> validateUserDetails(
        @RequestBody Map<String, String> userDetails,
        HttpServletRequest request
) {
    String jwt = jwtService.extractTokenFromRequest(request);
    String userEmail = jwtService.extractUserName(jwt);

    Optional<UserEntity> optionalUser = userRepository.findByEmail(userEmail);

    if (optionalUser.isEmpty()) {
        return responseService.createResponse(404, "User not found", request, HttpStatus.NOT_FOUND);
    }

    UserEntity user = optionalUser.get();

    String name = userDetails.get("name");
    String phoneNumber = userDetails.get("phoneNumber");
    String address = userDetails.get("address");

    boolean isMatch = user.getName().equalsIgnoreCase(name.trim()) &&
                      user.getPhoneNumber().equalsIgnoreCase(phoneNumber.trim()) &&
                      user.getAddress().equalsIgnoreCase(address.trim());

    if (isMatch) {
        return responseService.createResponse(200, "Details match", request, HttpStatus.OK);
    } else {
        return responseService.createResponse(400, "Details do not match", request, HttpStatus.BAD_REQUEST);
    }
}



}

