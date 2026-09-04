package org.transport.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.transport.dto.VehicleDto;
import org.transport.dto.requests.CreateVehicleRequest;
import org.transport.dto.requests.UpdateVehicleRequest;
import org.transport.exception.BadRequestException;
import org.transport.exception.ConflictException;
import org.transport.exception.NotFoundException;
import org.transport.model.Vehicle;
import org.transport.repository.VehicleRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final AssignmentService assignmentService;

    public VehicleDto addVehicle(CreateVehicleRequest request) {
        if (vehicleRepository.existsByLicensePlate(request.licensePlate())) {
            throw new ConflictException("Plate number already exists!");
        }

        Vehicle vehicle = Vehicle.builder()
                .licensePlate(request.licensePlate())
                .model(request.model())
                .capacityVolume(request.capacityVolume())
                .capacityWeight(request.capacityWeight())
                .active(true)
                .build();

        return VehicleDto.from(vehicleRepository.save(vehicle), null);
    }

    public VehicleDto getById(Long id) {
        Vehicle vehicle = findEntity(id);
        return VehicleDto.from(vehicle,
                assignmentService.getActiveDriverForVehicle(vehicle).orElse(null));
    }

    public List<VehicleDto> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public List<VehicleDto> search(Boolean active, String plate, String model) {
        String p = (plate == null || plate.isBlank()) ? null : plate.trim();
        String m = (model == null || model.isBlank()) ? null : model.trim();
        return vehicleRepository.search(active, p, m).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public VehicleDto updateVehicle(Long id, UpdateVehicleRequest request) {
        Vehicle vehicle = findEntity(id);

        if (!vehicle.getLicensePlate().equalsIgnoreCase(request.licensePlate())
                && vehicleRepository.existsByLicensePlate(request.licensePlate())) {
            throw new ConflictException("Plate number already exists!");
        }

        vehicle.setLicensePlate(request.licensePlate());
        vehicle.setModel(request.model());
        vehicle.setCapacityVolume(request.capacityVolume());
        vehicle.setCapacityWeight(request.capacityWeight());
        vehicle.setActive(request.active());

        Vehicle saved = vehicleRepository.save(vehicle);
        return VehicleDto.from(saved,
                assignmentService.getActiveDriverForVehicle(saved).orElse(null));
    }

    @Transactional
    public VehicleDto updateVehicleStatus(Long vehicleId, boolean active) {
        Vehicle vehicle = findEntity(vehicleId);
        vehicle.setActive(active);
        Vehicle saved = vehicleRepository.save(vehicle);
        return VehicleDto.from(saved,
                assignmentService.getActiveDriverForVehicle(saved).orElse(null));
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = findEntity(id);
        if (assignmentService.getActiveDriverForVehicle(vehicle).isPresent()) {
            throw new BadRequestException(
                    "Cannot delete a vehicle with an active driver assignment. Unassign first.");
        }
        vehicleRepository.delete(vehicle);
    }

    private Vehicle findEntity(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vehicle not found"));
    }

    private VehicleDto toDto(Vehicle vehicle) {
        return VehicleDto.from(vehicle,
                assignmentService.getActiveDriverForVehicle(vehicle).orElse(null));
    }
}
