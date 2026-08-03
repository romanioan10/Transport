package org.transport.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class AssignVehicleRequest
{
    private Long vehicleId;
    private Long driverId;
}