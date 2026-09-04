package org.transport.dto.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record UpdateVehicleRequest(
        @NotBlank String licensePlate,
        @NotBlank String model,
        @NotNull @PositiveOrZero Double capacityVolume,
        @NotNull @PositiveOrZero Double capacityWeight,
        @NotNull Boolean active
) {
}
