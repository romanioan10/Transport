package org.transport.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.transport.model.User;
import org.transport.model.UserVehicle;

import java.util.Optional;

public interface UserVehicleRepository extends JpaRepository<UserVehicle, Long> {

    Optional<UserVehicle> findByUserAndActiveTrue(User user);
}