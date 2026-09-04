package org.transport.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.transport.dto.responses.AuthResponse;
import org.transport.dto.requests.LoginRequest;
import org.transport.dto.requests.RegisterRequest;
import org.springframework.web.bind.annotation.*;
import org.transport.service.AuthService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }
}