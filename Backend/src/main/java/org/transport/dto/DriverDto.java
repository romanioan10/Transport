package org.transport.dto;

import org.transport.model.User;
import org.transport.model.Vehicle;

public record DriverDto(UserDto userDto,
                        VehicleDto vehicle) {

    public static DriverDto from(User user, Vehicle vehicle) {
        return new DriverDto(UserDto.from(user),
                VehicleDto.from(vehicle, user)
        );
    }
}