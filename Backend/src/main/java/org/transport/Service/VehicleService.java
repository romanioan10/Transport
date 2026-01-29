package org.transport.Service;

import org.transport.Model.User;
import org.transport.Model.Vehicle;
import org.transport.Repository.UserRepository;
import org.transport.Repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public Vehicle addVehicle(Vehicle vehicle, Long driverId) {
        if (vehicleRepository.existsByLicensePlate(vehicle.getLicensePlate())) {
            throw new RuntimeException("Numarul de inmatriculare exista deja!");
        }

        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Soferul cu acest ID nu a fost gasit!"));

        vehicle.setDriver(driver);

        return vehicleRepository.save(vehicle);
    }

    public Vehicle getVehicleByDriverId(Long driverId) {
        return vehicleRepository.findByDriverId(driverId)
                .orElse(null);
    }
}