package org.transport.service;

import org.transport.dto.VehicleDto;
import org.transport.exception.ConflictException;
import org.transport.exception.NotFoundException;
import org.transport.model.Vehicle;
import org.transport.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserVehicleService userVehicleService;

    public VehicleDto addVehicle(Vehicle vehicle) {
        if (vehicleRepository.existsByLicensePlate(vehicle.getLicensePlate())) {
            throw new ConflictException("Numarul de inmatriculare exista deja!");
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        return VehicleDto.from(saved, null);
    }

    public List<VehicleDto> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(vehicle -> VehicleDto.from(
                        vehicle,
                        userVehicleService.getActiveDriverForVehicle(vehicle).orElse(null)
                ))
                .toList();
    }

    public VehicleDto updateVehicleStatus(Long vehicleId, boolean active) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new NotFoundException("Vehicle not found"));

        vehicle.setActive(active);
        Vehicle saved = vehicleRepository.save(vehicle);

        return VehicleDto.from(
                saved,
                userVehicleService.getActiveDriverForVehicle(saved).orElse(null)
        );
    }
}