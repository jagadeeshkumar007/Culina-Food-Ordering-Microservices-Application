package com.culina.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final long accessTokenExpirationMillis;
    private final long refreshTokenExpirationMillis;

    public JwtUtil(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.access-token-expiration:1800000}") long accessTokenExpirationMillis,  // 30 min
            @Value("${security.jwt.refresh-token-expiration:604800000}") long refreshTokenExpirationMillis  // 7 days
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirationMillis = accessTokenExpirationMillis;
        this.refreshTokenExpirationMillis = refreshTokenExpirationMillis;
    }

    // Generate Access Token
    public String generateAccessToken(Long userId, String email, String role) {
        return generateToken(userId, email, role, accessTokenExpirationMillis, "ACCESS");
    }

    // Generate Refresh Token
    public String generateRefreshToken(Long userId, String email, String role) {
        return generateToken(userId, email, role, refreshTokenExpirationMillis, "REFRESH");
    }

    // Generic token generation
    public String generateToken(Long userId, String email, String role, long expirationMillis, String tokenType) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .claim("tokenType", tokenType)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // Validate token
    public boolean isTokenValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Check if token is expired
    public boolean isTokenExpired(String token) {
        try {
            return getClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    // Extract User ID
    public Long extractUserId(String token) {
        return Long.parseLong(getClaims(token).getSubject());
    }

    // Extract Email
    public String extractEmail(String token) {
        return getClaims(token).get("email", String.class);
    }

    // Extract Role
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // Extract Token Type
    public String extractTokenType(String token) {
        return getClaims(token).get("tokenType", String.class);
    }

    // Validate that token is a refresh token
    public boolean isRefreshToken(String token) {
        try {
            return "REFRESH".equals(extractTokenType(token));
        } catch (Exception e) {
            return false;
        }
    }

    // Validate that token is an access token
    public boolean isAccessToken(String token) {
        try {
            return "ACCESS".equals(extractTokenType(token));
        } catch (Exception e) {
            return false;
        }
    }

    // Get expiration in seconds
    public long getAccessTokenExpirationSeconds() {
        return accessTokenExpirationMillis / 1000;
    }

    public long getRefreshTokenExpirationSeconds() {
        return refreshTokenExpirationMillis / 1000;
    }

    // Parse claims
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}