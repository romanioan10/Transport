package org.transport.dto.requests;

import jakarta.validation.constraints.NotNull;
import org.transport.model.UserRole;

public record UpdateRoleRequest(@NotNull UserRole role) {
}
