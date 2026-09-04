package org.transport.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.transport.model.User;
import org.transport.model.UserVehicle;
import org.transport.model.Vehicle;

import java.util.List;
import java.util.Optional;

public interface UserVehicleRepository extends JpaRepository<UserVehicle, Long> {

    Optional<UserVehicle> findByUserAndActiveTrue(User user);
    Optional<UserVehicle> findByVehicleAndActiveTrue(Vehicle vehicle);
    List<UserVehicle> findByActiveTrueOrderByAssignedAtDesc();
    List<UserVehicle> findAllByOrderByAssignedAtDesc();
    List<UserVehicle> findByVehicleOrderByAssignedAtDesc(Vehicle vehicle);
    List<UserVehicle> findByUserOrderByAssignedAtDesc(User user);
}