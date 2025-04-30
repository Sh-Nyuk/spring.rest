package com.springRest.demo.controller;

import com.springRest.demo.dto.PersonDto;
import com.springRest.demo.model.Person;
import com.springRest.demo.service.PersonService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;


@Controller
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final PersonService personService;

    public AdminController(PersonService personService) {
        this.personService = personService;
    }

    @GetMapping
    public String getAdminPage(Model model, @ModelAttribute("error") String error,
                               @ModelAttribute("message") String message,
                               HttpServletRequest request) {
        model.addAttribute("currentUri", request.getRequestURI());
        if (error != null && !error.isEmpty()) {
            model.addAttribute("error", error);
        }
        if (message != null && !message.isEmpty()) {
            model.addAttribute("message", message);
        }
        return "admin-page";
    }

    @PostMapping("/add")
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
