package com.kush.nada.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    // Fixed Secret Key (Base64 encoded)
    private static final String SECRET = "TmV3U2VjcmV0S2V5Rm9ySldUU2lnbmluZ1B1cnBvc2VzMTIzNDU2Nzg=";

    // Get the Key object from the SECRET
    private Key getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);// Decode the Base64 secret
        System.out.println(keyBytes); // [B@1f26fdd
        return Keys.hmacShaKeyFor(keyBytes); // Generate the key
    }

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();

        return Jwts.builder() // Create the token
                .setClaims(claims) // Set claims (you can add custom claims if needed)
                .setSubject(username) // Set the subject (the username)
                .setIssuedAt(new Date(System.currentTimeMillis())) // Set the issue date
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 1440)) // Set expiration time (1 day in this case)
                .signWith(getKey(), SignatureAlgorithm.HS256) // Sign with the key and algorithm
                .compact(); // Return the compact token
    }

    public String extractUserName(String token) {
        return extractClaim(token, Claims::getSubject); // Extract the username from the token
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey()) // Use the same key for validation
                .build().parseClaimsJws(token).getBody(); // Parse and extract claims
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String userName = extractUserName(token);
        return (userName.equals(userDetails.getUsername()) && !isTokenExpired(token)); // Validate the token
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date()); // Check if the token is expired
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration); // Extract expiration date
    }
}