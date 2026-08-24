package com.edutrack.service;

import com.edutrack.config.JwtTokenProvider;
import com.edutrack.config.ValidationConfig;
import com.edutrack.dto.AuthDto;
import com.edutrack.model.Role;
import com.edutrack.model.User;
import com.edutrack.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final ValidationConfig validationConfig;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider, ValidationConfig validationConfig) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.validationConfig = validationConfig;
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        if (!user.isActive()) {
            throw new RuntimeException("Account has been deactivated. Please contact an administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        AuthDto.UserDto userDto = toUserDto(user);
        return new AuthDto.AuthResponse(token, userDto);
    }

    public AuthDto.UserDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toUserDto(user);
    }

    public void changePassword(AuthDto.ChangePasswordRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getNewPassword() == null || request.getNewPassword().length() < validationConfig.getUserPasswordMin() || request.getNewPassword().length() > validationConfig.getUserPasswordMax()) {
            throw new IllegalArgumentException("Password must be between " + validationConfig.getUserPasswordMin() + " and " + validationConfig.getUserPasswordMax() + " characters.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setNeedsPasswordReset(false);
        userRepository.save(user);
    }

    public void forgotPassword(AuthDto.ForgotPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email address is required.");
        }

        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new RuntimeException("No account found with the provided email address."));

        if (!user.isActive()) {
            throw new RuntimeException("Account has been deactivated. Please contact an administrator.");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < validationConfig.getUserPasswordMin() || request.getNewPassword().length() > validationConfig.getUserPasswordMax()) {
            throw new IllegalArgumentException("Password must be between " + validationConfig.getUserPasswordMin() + " and " + validationConfig.getUserPasswordMax() + " characters.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setNeedsPasswordReset(false);
        userRepository.save(user);
    }

    public AuthDto.UserDto toUserDto(User user) {
        return new AuthDto.UserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isNeedsPasswordReset(),
                user.isActive()
        );
    }
}
