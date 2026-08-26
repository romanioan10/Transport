package org.transport.dto;

import org.transport.model.User;
import org.transport.model.Vehicle;

public record UserWithVehicleDto(Long id,
                                 String email,
                                 String firstName,
                                 String lastName,
                                 String phoneNumber,
                                 String role,
                                 VehicleDto vehicle) {

    public static UserWithVehicleDto from(User user, Vehicle vehicle) {
        return new UserWithVehicleDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.getRole().name(),
                VehicleDto.from(vehicle, user)
        );
    }
}