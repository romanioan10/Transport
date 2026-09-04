package org.transport.dto.requests;

import jakarta.validation.constraints.NotNull;
import org.transport.model.UserStatus;

public record UpdateStatusRequest(@NotNull UserStatus status) {
}
