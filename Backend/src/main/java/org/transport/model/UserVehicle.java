package org.transport.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_vehicle")
public class UserVehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔗 legătură cu user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 🔗 legătură cu vehicle
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    // 🟢 dacă e mașina curentă
    @Column(nullable = false)
    private boolean active;

    // (opțional foarte util) istoric
    private String assignedAt;

    private String unassignedAt;


    public UserVehicle() {}

    public UserVehicle(User user, Vehicle vehicle, boolean active) {
        this.user = user;
        this.vehicle = vehicle;
        this.active = active;
    }


    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(String assignedAt) {
        this.assignedAt = assignedAt;
    }

    public String getUnassignedAt() {
        return unassignedAt;
    }

    public void setUnassignedAt(String unassignedAt) {
        this.unassignedAt = unassignedAt;
    }
}