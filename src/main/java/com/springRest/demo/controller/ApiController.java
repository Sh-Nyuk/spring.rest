package com.springRest.demo.controller;


import com.springRest.demo.dto.PersonDto;
import com.springRest.demo.model.Person;
import com.springRest.demo.model.Role;
import com.springRest.demo.service.PersonService;
import com.springRest.demo.service.RoleService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addUser(@RequestBody PersonDto personDto) {
        Person person = new Person();
        person.setUsername(personDto.getUsername());
        person.setPassword(personDto.getPassword());
        person.setEmail(personDto.getEmail());
        person.setAge(personDto.getAge());

        try {
            personService.addPerson(person, personDto.getRolesId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Ошибка: " + e.getMessage());
        }
    }

    @PostMapping("/edit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> editUser(@RequestBody PersonDto personDto) {
        Person person = new Person();
        person.setId(personDto.getId());
        person.setUsername(personDto.getUsername());
        person.setPassword(personDto.getPassword());
        person.setEmail(personDto.getEmail());
        person.setAge(personDto.getAge());

        try {
            personService.updatePerson(person, personDto.getRolesId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

    }

    @PostMapping("/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@RequestParam Long id, Principal principal, HttpServletRequest request) {
        Person currPerson = personService.findByUsername(principal.getName());
        Long currId = currPerson.getId();

        try {
            personService.deletePerson(id);

            if (currId.equals(id)) {
                request.logout();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Вы удалили себя и вышли из системы.");
            }

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка при удалении пользователя");
        }
    }

}
