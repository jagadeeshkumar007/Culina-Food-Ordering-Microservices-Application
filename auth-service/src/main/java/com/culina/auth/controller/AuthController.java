package com.culina.auth.controller;

import com.culina.auth.dto.*;
import com.culina.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // SIGNUP
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok("User registered successfully");
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // REFRESH TOKEN
    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        RefreshTokenResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    // LOGOUT (Optional - for token blacklisting in future)
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        // You can implement token blacklisting here in the future
        return ResponseEntity.ok("Logged out successfully");
    }

    // TEST / ME (JWT REQUIRED)
    @GetMapping("/me")
    public ResponseEntity<String> me() {
        return ResponseEntity.ok("JWT is valid");
    }
}