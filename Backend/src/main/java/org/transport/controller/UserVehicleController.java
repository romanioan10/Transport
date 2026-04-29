package org.transport.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.transport.model.User;
import org.transport.model.UserVehicle;
import org.transport.model.Vehicle;
import org.transport.repository.UserRepository;
import org.transport.repository.UserVehicleRepository;
import org.transport.repository.VehicleRepository;

@RestController
@RequestMapping("/api/user-vehicles")
@RequiredArgsConstructor
public class UserVehicleController {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final UserVehicleRepository userVehicleRepository;

    @PostMapping
    public String assignVehicle(@RequestParam Long userId,
                                @RequestParam Long vehicleId) {

        User user = userRepository.findById(userId).orElseThrow();
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElseThrow();

        UserVehicle uv = new UserVehicle();
        uv.setUser(user);
        uv.setVehicle(vehicle);
        uv.setActive(true);

        userVehicleRepository.save(uv);

        return "Vehicle assigned!";
    }
}