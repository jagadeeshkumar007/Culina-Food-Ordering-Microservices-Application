package com.culina.auth.dto;

public class AuthResponse {
	private String accessToken;
	private String refreshToken;
	private Long userId;
	private String role;
	private long expiresIn; // in seconds
	private String tokenType = "Bearer";

	public AuthResponse(String accessToken, String refreshToken, Long userId, String role, long expiresIn) {
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
		this.userId = userId;
		this.role = role;
		this.expiresIn = expiresIn;
	}

	public String getAccessToken() {
		return accessToken;
	}

	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}

	public String getRefreshToken() {
		return refreshToken;
	}

	public void setRefreshToken(String refreshToken) {
		this.refreshToken = refreshToken;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public long getExpiresIn() {
		return expiresIn;
	}

	public void setExpiresIn(long expiresIn) {
		this.expiresIn = expiresIn;
	}

	public String getTokenType() {
		return tokenType;
	}

	public void setTokenType(String tokenType) {
		this.tokenType = tokenType;
	}

}