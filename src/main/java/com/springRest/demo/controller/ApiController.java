package com.springRest.demo.controller;


import com.springRest.demo.model.Person;
import com.springRest.demo.model.Role;
import com.springRest.demo.service.PersonService;
import com.springRest.demo.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiController {

    PersonService personService;
    RoleService roleService;

    @Autowired
    public ApiController(PersonService personService, RoleService roleService) {
        this.personService = personService;
        this.roleService = roleService;
    }


    @GetMapping("/users_list")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Person> getUsersList() {
        return personService.getAllPersons();
    }

    @GetMapping("/roles_list")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Role> getRolesList() {
        return roleService.getAllRoles();
    }

    @GetMapping("/user-info")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<?> getUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = principal.getName();
        Person person = personService.findByUsername(username);

        if (person == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(person);
    }
}
