package com.edutrack.service;

import com.edutrack.config.JwtTokenProvider;
import com.edutrack.dto.AuthDto;
import com.edutrack.model.Batch;
import com.edutrack.model.Role;
import com.edutrack.model.User;
import com.edutrack.repository.BatchRepository;
import com.edutrack.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository, BatchRepository batchRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.batchRepository = batchRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
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
