package org.transport.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.transport.dto.UserWithVehicleDto;
import org.transport.model.User;
import org.transport.model.UserVehicle;
import org.transport.model.Vehicle;
import org.transport.repository.UserRepository;
import org.transport.repository.UserVehicleRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserVehicleRepository userVehicleRepository;

    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email-ul este deja folosit!");
        }
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Userul nu a fost gasit!"));

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Parola gresita!");
        }

        return user;
    }

    public List<UserWithVehicleDto> getAllUsersWithVehicles() {
        return userRepository.findAll().stream()
                .map(user -> {

                    UserVehicle uv = userVehicleRepository
                            .findByUserAndActiveTrue(user)
                            .orElse(null);

                    Vehicle vehicle = uv != null ? uv.getVehicle() : null;

                    UserWithVehicleDto dto = new UserWithVehicleDto();
                    dto.setId(user.getId());
                    dto.setEmail(user.getEmail());
                    dto.setFirstName(user.getFirstName());
                    dto.setLastName(user.getLastName());
                    dto.setPhoneNumber(user.getPhoneNumber());
                    dto.setRole(user.getRole().name());
                    dto.setVehicle(vehicle);

                    return dto;
                })
                .collect(Collectors.toList());
    }

    public UserWithVehicleDto getCurrentUser(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserVehicle uv = userVehicleRepository
                .findByUserAndActiveTrue(user)
                .orElse(null);

        Vehicle vehicle = uv != null ? uv.getVehicle() : null;

        UserWithVehicleDto dto = new UserWithVehicleDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole().name());
        dto.setVehicle(vehicle);

        return dto;
    }
}