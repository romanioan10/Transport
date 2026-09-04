package org.transport.dto;

import org.transport.model.UserVehicle;

import java.time.LocalDateTime;

public record AssignmentDto(
        Long id,
        UserDto driver,
        VehicleDto vehicle,
        boolean active,
        LocalDateTime assignedAt,
        LocalDateTime unassignedAt
) {
    public static AssignmentDto from(UserVehicle uv) {
        if (uv == null) return null;
        return new AssignmentDto(
                uv.getId(),
                UserDto.from(uv.getUser()),
                VehicleDto.from(uv.getVehicle(), uv.isActive() ? uv.getUser() : null),
                uv.isActive(),
                uv.getAssignedAt(),
                uv.getUnassignedAt()
        );
    }
}
