package com.springRest.demo.service;



import com.springRest.demo.model.Role;

import java.util.List;
import java.util.Optional;

public interface RoleService {
    public Optional<Role> findByRole(String role);
    public Role save(Role role);
    public List<Role> getAllRoles();
    public List<Role> findById(List<Long> rolesId);
}
