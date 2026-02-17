package com.culina.auth.service;

import com.culina.auth.dto.AuthResponse;
import com.culina.auth.dto.LoginRequest;
import com.culina.auth.dto.RefreshTokenResponse;
import com.culina.auth.dto.SignupRequest;
import com.culina.auth.model.User;
import com.culina.auth.repository.UserRepository;
import com.culina.auth.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // SIGNUP
    public void signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setRole(request.getRole());
        user.setActive(true);

        userRepository.save(user);
    }

    // LOGIN
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException("User is inactive");
        }

        // Generate both access and refresh tokens
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail(), user.getRole());

        return new AuthResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.getRole(),
                jwtUtil.getAccessTokenExpirationSeconds()
        );
    }

    // REFRESH TOKEN
    public RefreshTokenResponse refreshToken(String refreshToken) {
        // Validate refresh token
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        if (!jwtUtil.isRefreshToken(refreshToken)) {
            throw new RuntimeException("Token is not a refresh token");
        }

        // Extract user details from refresh token
        Long userId = jwtUtil.extractUserId(refreshToken);
        String email = jwtUtil.extractEmail(refreshToken);
        String role = jwtUtil.extractRole(refreshToken);

        // Verify user still exists and is active
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException("User is inactive");
        }

        // Generate new tokens
        String newAccessToken = jwtUtil.generateAccessToken(userId, email, role);
        String newRefreshToken = jwtUtil.generateRefreshToken(userId, email, role);

        return new RefreshTokenResponse(
                newAccessToken,
                newRefreshToken,
                jwtUtil.getAccessTokenExpirationSeconds()
        );
    }
}