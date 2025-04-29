package com.kush.nada.controller;

import com.kush.nada.models.UserEntity;
import com.kush.nada.services.ResponseService;
import com.kush.nada.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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


    @GetMapping("/users")
    public ResponseEntity<Map<String , Object>> getAllUsers(HttpServletRequest request){
        List<UserEntity> allUsers = userService.findAllUsers();
        return responseService.createResponse(200, allUsers , request , HttpStatus.OK);
    }

}
