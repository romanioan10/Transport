package org.transport.dto;

import org.transport.model.User;
import org.transport.model.Vehicle;

public record VehicleDto(
        Long id,
        String licensePlate,
        String model,
        Double capacityVolume,
        Double capacityWeight,
        boolean active,
        UserDto driver) {

    public static VehicleDto from(Vehicle vehicle, User driver) {
        if (vehicle == null) return null;
        return new VehicleDto(
                vehicle.getId(),
                vehicle.getLicensePlate(),
                vehicle.getModel(),
                vehicle.getCapacityVolume(),
                vehicle.getCapacityWeight(),
                vehicle.isActive(),
                UserDto.from(driver)
        );
    }
}
