package com.edutrack.service;

import com.edutrack.config.JwtTokenProvider;
import com.edutrack.config.ValidationConfig;
import com.edutrack.dto.AuthDto;
import com.edutrack.model.Batch;
import com.edutrack.model.Role;
import com.edutrack.model.User;
import com.edutrack.repository.BatchRepository;
import com.edutrack.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final ValidationConfig validationConfig;

    public AuthService(UserRepository userRepository, BatchRepository batchRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider, ValidationConfig validationConfig) {
        this.userRepository = userRepository;
        this.batchRepository = batchRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.validationConfig = validationConfig;
    }

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (request.getFullName() == null || request.getFullName().trim().length() < validationConfig.getUserFullnameMin() || request.getFullName().trim().length() > validationConfig.getUserFullnameMax()) {
            throw new IllegalArgumentException("Full name must be between " + validationConfig.getUserFullnameMin() + " and " + validationConfig.getUserFullnameMax() + " characters.");
        }
        if (request.getEmail() == null || request.getEmail().trim().length() > validationConfig.getUserEmailMax() || !request.getEmail().contains("@")) {
            throw new IllegalArgumentException("Invalid email format, or email exceeds " + validationConfig.getUserEmailMax() + " characters.");
        }
        if (request.getPassword() == null || request.getPassword().length() < validationConfig.getUserPasswordMin() || request.getPassword().length() > validationConfig.getUserPasswordMax()) {
            throw new IllegalArgumentException("Password must be between " + validationConfig.getUserPasswordMin() + " and " + validationConfig.getUserPasswordMax() + " characters.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email address is already in use!");
        }

        Batch batch = null;
        if (request.getBatchId() != null) {
            batch = batchRepository.findById(request.getBatchId()).orElse(null);
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getRole() != null ? request.getRole() : Role.STUDENT,
                batch
        );

        User savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getId());
        
        AuthDto.UserDto userDto = toUserDto(savedUser);
        return new AuthDto.AuthResponse(token, userDto);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

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

    public AuthDto.UserDto toUserDto(User user) {
        Long batchId = user.getBatch() != null ? user.getBatch().getId() : null;
        String batchName = user.getBatch() != null ? user.getBatch().getName() : null;
        return new AuthDto.UserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                batchId,
                batchName
        );
    }
}
