package org.transport.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.transport.dto.Responses.AuthResponse;
import org.transport.dto.Requests.LoginRequest;
import org.transport.dto.Requests.RegisterRequest;
import org.transport.exception.BadRequestException;
import org.transport.exception.NotFoundException;
import org.transport.model.User;
import org.transport.model.UserRole;
import org.transport.model.UserStatus;
import org.transport.repository.UserRepository;
import org.transport.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadRequestException("Invalid password");
        }

        if(user.getStatus() == UserStatus.DISABLED)
        {
            throw new BadRequestException("User account is disabled");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(token);
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phoneNumber(request.phoneNumber())
                .role(UserRole.CLIENT)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(token);
    }
}