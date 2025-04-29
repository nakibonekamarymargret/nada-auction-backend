package com.kush.nada.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("returnCode", 400); // 400 Bad Request for validation errors
        response.put("error", "Validation failed"); // General error message

        // Collect all validation error details for each invalid field
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            response.put(error.getField(), error.getDefaultMessage()); // Map field name to its validation error message
        });

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Handle other exceptions like IllegalArgumentException
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("returnCode", 400); // 400 for bad requests
        response.put("error", ex.getMessage()); // Pass the message of the IllegalArgumentException

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Handle UserNotFoundException
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFoundException(NotFoundException ex, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("path", request.getRequestURI());
        response.put("returnCode", 404); // 404 for not found
        response.put("returnMessage", ex.getMessage()); // Pass the message
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFoundException(BadRequestException ex, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("path", request.getRequestURI());
        response.put("returnCode", 404); // 404 for not found
        response.put("returnMessage", ex.getMessage()); // Pass the message
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }
}
