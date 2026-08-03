package org.transport.service;

import org.transport.model.User;
import org.transport.model.UserRole;
import org.transport.model.Vehicle;
import org.transport.repository.UserRepository;
import org.transport.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public Vehicle addVehicle(Vehicle vehicle) {
        if (vehicleRepository.existsByLicensePlate(vehicle.getLicensePlate())) {
            throw new RuntimeException("Numarul de inmatriculare exista deja!");
        }

        return vehicleRepository.save(vehicle);
    }

    public Vehicle getVehicleByDriverId(Long driverId) {
        return vehicleRepository.findByDriverId(driverId)
                .orElse(null);
    }

    public Vehicle assignDriverToVehicle(Long vehicleId, Long driverId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        if (driver.getRole() != UserRole.DRIVER) {
            throw new RuntimeException("Selected user is not a driver");
        }

        vehicleRepository.findByDriverId(driverId).ifPresent(oldVehicle -> {
            oldVehicle.setDriver(null);
            vehicleRepository.save(oldVehicle);
        });

        vehicle.setDriver(driver);

        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicleStatus(Long vehicleId, boolean active) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        vehicle.setActive(active);

        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle unassignDriver(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        vehicle.setDriver(null);

        return vehicleRepository.save(vehicle);
    }
}