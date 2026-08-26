package org.transport.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.transport.dto.UserDto;
import org.transport.dto.UserWithVehicleDto;
import org.transport.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserWithVehicleDto> getCurrentUserDto(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUser(authentication));
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<UserDto>> getDrivers() {
        return ResponseEntity.ok(userService.getDrivers());
    }
}