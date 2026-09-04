package org.transport.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.transport.dto.DriverDto;
import org.transport.model.User;
import org.transport.model.Vehicle;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final UserService userService;
    private final AssignmentService assignmentService;

    public DriverDto getCurrentDriver(Authentication auth) {
        User user = userService.getCurrentUserEntity(auth);
        Vehicle vehicle = assignmentService.getActiveVehicleForUser(user).orElse(null);
        return DriverDto.from(user, vehicle);
    }
}
