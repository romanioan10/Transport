package org.transport.controller;

import org.transport.dto.AssignVehicleRequest;
import org.transport.model.Vehicle;
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

    @PostMapping
   public ResponseEntity<Vehicle> addVehicle(@RequestBody Vehicle vehicle) {
        Vehicle createdVehicle = vehicleService.addVehicle(vehicle);
        return ResponseEntity.ok(createdVehicle);
    }

    @GetMapping("/my-vehicle/{driverId}")
    public ResponseEntity<Vehicle> getVehicleForDriver(@PathVariable Long driverId) {
        Vehicle vehicle = vehicleService.getVehicleByDriverId(driverId);

        if (vehicle == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(vehicle);
    }

    @PutMapping("/{vehicleId}/assign-driver/{driverId}")
    public ResponseEntity<Vehicle> assignDriverToVehicle(
            @PathVariable Long vehicleId,
            @PathVariable Long driverId
    ) {
        Vehicle updatedVehicle = vehicleService.assignDriverToVehicle(vehicleId, driverId);
        return ResponseEntity.ok(updatedVehicle);
    }

    @PutMapping("/{vehicleId}/status")
    public ResponseEntity<Vehicle> updateVehicleStatus(
            @PathVariable Long vehicleId,
            @RequestParam boolean active
    ) {
        Vehicle updatedVehicle = vehicleService.updateVehicleStatus(vehicleId, active);
        return ResponseEntity.ok(updatedVehicle);
    }

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        List<Vehicle> vehicles = vehicleService.getAllVehicles();
        return ResponseEntity.ok(vehicles);
    }

    @PutMapping("/{vehicleId}/unassign-driver")
    public ResponseEntity<Vehicle> unassignDriver(@PathVariable Long vehicleId) {
        Vehicle updatedVehicle = vehicleService.unassignDriver(vehicleId);
        return ResponseEntity.ok(updatedVehicle);
    }
}