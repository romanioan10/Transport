package org.transport.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.transport.dto.AssignmentDto;
import org.transport.dto.VehicleDto;
import org.transport.dto.requests.AssignVehicleRequest;
import org.transport.service.AssignmentService;

import java.util.List;

@RestController
@RequestMapping("/assignments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping
    public ResponseEntity<List<AssignmentDto>> listActive() {
        return ResponseEntity.ok(assignmentService.listActive());
    }

    @GetMapping("/history")
    public ResponseEntity<List<AssignmentDto>> listHistory() {
        return ResponseEntity.ok(assignmentService.listAll());
    }

    @GetMapping("/history/vehicle/{vehicleId}")
    public ResponseEntity<List<AssignmentDto>> historyForVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(assignmentService.historyForVehicle(vehicleId));
    }

    @GetMapping("/history/driver/{driverId}")
    public ResponseEntity<List<AssignmentDto>> historyForDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(assignmentService.historyForDriver(driverId));
    }

    @PostMapping
    public ResponseEntity<VehicleDto> assign(@Valid @RequestBody AssignVehicleRequest request) {
        return ResponseEntity.ok(assignmentService.assignDriverToVehicle(request));
    }

    @DeleteMapping("/vehicle/{vehicleId}")
    public ResponseEntity<VehicleDto> unassignByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(assignmentService.unassignDriver(vehicleId));
    }
}

