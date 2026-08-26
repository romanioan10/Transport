package org.transport.controller;

import org.transport.dto.VehicleDto;
import org.transport.model.Vehicle;
import org.transport.service.UserVehicleService;
import org.transport.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;
    private final UserVehicleService userVehicleService;

    @PostMapping
    public ResponseEntity<VehicleDto> addVehicle(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.addVehicle(vehicle));
    }

    @GetMapping
    public ResponseEntity<List<VehicleDto>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @PutMapping("/{vehicleId}/status")
    public ResponseEntity<VehicleDto> updateVehicleStatus(
            @PathVariable Long vehicleId,
            @RequestParam boolean active
    ) {
        return ResponseEntity.ok(vehicleService.updateVehicleStatus(vehicleId, active));
    }

    @PutMapping("/{vehicleId}/assign-driver/{driverId}")
    public ResponseEntity<VehicleDto> assignDriverToVehicle(
            @PathVariable Long vehicleId,
            @PathVariable Long driverId
    ) {
        return ResponseEntity.ok(userVehicleService.assignDriverToVehicle(vehicleId, driverId));
    }

    @PutMapping("/{vehicleId}/unassign-driver")
    public ResponseEntity<VehicleDto> unassignDriver(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(userVehicleService.unassignDriver(vehicleId));
    }
}