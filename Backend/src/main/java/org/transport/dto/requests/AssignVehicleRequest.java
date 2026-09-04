package org.transport.dto.requests;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AssignVehicleRequest(
        @NotNull @Positive
        Long vehicleId,
        @NotNull @Positive
        Long driverId) {
}