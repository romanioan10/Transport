package org.transport.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.transport.dto.UserDto;
import org.transport.dto.UserWithVehicleDto;
import org.transport.exception.NotFoundException;
import org.transport.model.User;
import org.transport.model.UserRole;
import org.transport.model.Vehicle;
import org.transport.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserVehicleService userVehicleService;

    public UserWithVehicleDto getCurrentUser(Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Vehicle vehicle = userVehicleService.getActiveVehicleForUser(user).orElse(null);

        return UserWithVehicleDto.from(user, vehicle);
    }

    public List<UserDto> getDrivers() {
        return userRepository.findByRole(UserRole.DRIVER).stream()
                .map(UserDto::from)
                .toList();
    }
}