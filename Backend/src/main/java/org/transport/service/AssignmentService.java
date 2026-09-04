package org.transport.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.transport.dto.AssignmentDto;
import org.transport.dto.VehicleDto;
import org.transport.dto.requests.AssignVehicleRequest;
import org.transport.exception.BadRequestException;
import org.transport.exception.NotFoundException;
import org.transport.model.User;
import org.transport.model.UserRole;
import org.transport.model.UserStatus;
import org.transport.model.UserVehicle;
import org.transport.model.Vehicle;
import org.transport.repository.UserRepository;
import org.transport.repository.UserVehicleRepository;
import org.transport.repository.VehicleRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final UserRepository userRepository;
    private final UserVehicleRepository userVehicleRepository;
    private final VehicleRepository vehicleRepository;

    public Optional<User> getActiveDriverForVehicle(Vehicle vehicle) {
        return userVehicleRepository.findByVehicleAndActiveTrue(vehicle)
                .map(UserVehicle::getUser);
    }

    public Optional<Vehicle> getActiveVehicleForUser(User user) {
        return userVehicleRepository.findByUserAndActiveTrue(user)
                .map(UserVehicle::getVehicle);
    }

    public List<AssignmentDto> listActive() {
        return userVehicleRepository.findByActiveTrueOrderByAssignedAtDesc().stream()
                .map(AssignmentDto::from)
                .toList();
    }

    public List<AssignmentDto> listAll() {
        return userVehicleRepository.findAllByOrderByAssignedAtDesc().stream()
                .map(AssignmentDto::from)
                .toList();
    }

    public List<AssignmentDto> historyForVehicle(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new NotFoundException("Vehicle not found"));
        return userVehicleRepository.findByVehicleOrderByAssignedAtDesc(vehicle).stream()
                .map(AssignmentDto::from)
                .toList();
    }

    public List<AssignmentDto> historyForDriver(Long driverId) {
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new NotFoundException("Driver not found"));
        return userVehicleRepository.findByUserOrderByAssignedAtDesc(driver).stream()
                .map(AssignmentDto::from)
                .toList();
    }

    @Transactional
    public VehicleDto assignDriverToVehicle(AssignVehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> new NotFoundException("Vehicle not found"));

        User driver = userRepository.findById(request.driverId())
                .orElseThrow(() -> new NotFoundException("Driver not found"));

        if (driver.getRole() != UserRole.DRIVER) {
            throw new BadRequestException("Selected user is not a driver");
        }

        if (driver.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Driver account is not active");
        }

        if (!vehicle.isActive()) {
            throw new BadRequestException("Vehicle is not active");
        }

        LocalDateTime now = LocalDateTime.now();

        userVehicleRepository.findByUserAndActiveTrue(driver).ifPresent(uv -> {
            uv.setActive(false);
            uv.setUnassignedAt(now);
            userVehicleRepository.save(uv);
        });

        userVehicleRepository.findByVehicleAndActiveTrue(vehicle).ifPresent(uv -> {
            uv.setActive(false);
            uv.setUnassignedAt(now);
            userVehicleRepository.save(uv);
        });

        UserVehicle assignment = new UserVehicle(driver, vehicle, true);
        assignment.setAssignedAt(now);
        userVehicleRepository.save(assignment);

        return VehicleDto.from(vehicle, driver);
    }

    @Transactional
    public VehicleDto unassignDriver(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new NotFoundException("Vehicle not found"));

        userVehicleRepository.findByVehicleAndActiveTrue(vehicle).ifPresent(uv -> {
            uv.setActive(false);
            uv.setUnassignedAt(LocalDateTime.now());
            userVehicleRepository.save(uv);
        });

        return VehicleDto.from(vehicle, null);
    }
}
