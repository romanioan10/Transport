package org.transport.controller;

import org.transport.model.Vehicle;
import org.transport.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<Vehicle> addVehicle(
            @RequestBody Vehicle vehicle,
            @RequestParam Long driverId
    ) {
        Vehicle savedVehicle = vehicleService.addVehicle(vehicle, driverId);
        return ResponseEntity.ok(savedVehicle);
    }

    @GetMapping("/my-vehicle/{driverId}")
    public ResponseEntity<Vehicle> getVehicleForDriver(@PathVariable Long driverId) {
        Vehicle vehicle = vehicleService.getVehicleByDriverId(driverId);

        if (vehicle == null) {
            return ResponseEntity.noContent().build(); // Returneaza gol daca nu are masina
        }
        return ResponseEntity.ok(vehicle);
    }
}