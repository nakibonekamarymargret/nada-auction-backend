package com.kush.nada.services;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class ResponseService {
    public ResponseEntity<Map<String, Object>> createResponse(
            int returnCode,
            Object returnObject,
            HttpServletRequest request,
            HttpStatus status
    ) {
        Map<String, Object> response = new HashMap<>();
        response.put("returnCode", returnCode);
        response.put("returnPath", request.getRequestURI());
        response.put("returnTimestamp", LocalDateTime.now());
        response.put("ReturnObject", returnObject);
        return new ResponseEntity<>(response, status);
    }
}
