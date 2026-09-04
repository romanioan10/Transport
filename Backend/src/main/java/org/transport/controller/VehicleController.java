package org.transport.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.transport.dto.VehicleDto;
import org.transport.dto.requests.CreateVehicleRequest;
import org.transport.dto.requests.UpdateVehicleRequest;
import org.transport.service.VehicleService;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<List<VehicleDto>> list(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String plate,
            @RequestParam(required = false) String model
    ) {
        return ResponseEntity.ok(vehicleService.search(active, plate, model));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VehicleDto> addVehicle(@Valid @RequestBody CreateVehicleRequest request) {
        return ResponseEntity.ok(vehicleService.addVehicle(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VehicleDto> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVehicleRequest request
    ) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, request));
    }

    @PutMapping("/{vehicleId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VehicleDto> updateVehicleStatus(
            @PathVariable Long vehicleId,
            @RequestParam boolean active
    ) {
        return ResponseEntity.ok(vehicleService.updateVehicleStatus(vehicleId, active));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
}
