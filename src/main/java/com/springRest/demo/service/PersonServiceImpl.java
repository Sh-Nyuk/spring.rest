package com.springRest.demo.service;


import com.springRest.demo.model.Person;
import com.springRest.demo.model.Role;
import com.springRest.demo.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
public class PersonServiceImpl implements PersonService {

    private final PersonRepository personRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleService roleService;

    @Autowired
    public PersonServiceImpl(PersonRepository personRepository
            , PasswordEncoder passwordEncoder, RoleService roleService) {
        this.personRepository = personRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleService = roleService;
    }

    @Transactional
    @Override
    public void addPerson(Person person, List<Long> rolesId) {
        if (rolesId != null && !rolesId.isEmpty()) {
            List<Role> roles = roleService.findById(rolesId);
            person.setRoles(new HashSet<>(roles));
        }
        if (person.getPassword() != null) {
            person.setPassword(passwordEncoder.encode(person.getPassword()));
        }
        personRepository.save(person);
    }

    @Transactional
    @Override
    public void updatePerson(Person person, List<Long> rolesId) {
        Person personToUpdate = personRepository.findById(person.getId()).orElse(null);

        personToUpdate.setAge(person.getAge());
        personToUpdate.setEmail(person.getEmail());
        personToUpdate.setUsername(person.getUsername());

        if (person.getPassword() != null && !person.getPassword().trim().isEmpty()) {
            if (!passwordEncoder.matches(person.getPassword(), personToUpdate.getPassword())) {
                personToUpdate.setPassword(passwordEncoder.encode(person.getPassword()));
            }
        }

        if (rolesId != null && !rolesId.isEmpty()) {
            List<Role> roles = roleService.findById(rolesId);

            if (roles.isEmpty()) {
                throw new IllegalStateException("Role does not exist");
            }
            personToUpdate.setRoles(new HashSet<>(roles));
        }

        personRepository.save(personToUpdate);
        System.out.println("Person updated successfully");
    }

    @Transactional
    @Override
    public void deletePerson(Long id) {
        Person person = personRepository.findById(id).orElseThrow((
                () -> new RuntimeException("Person not found")));

        personRepository.delete(person);
    }

    @Transactional(readOnly = true)
    @Override
    public List<Person> getAllPersons() {
        return personRepository.findAll();
    }

    @Transactional(readOnly = true)
    @Override
    public Person findById(Long id) {
        return personRepository.findById(id).orElseThrow(() -> new IllegalStateException("Person not found"));
    }

    @Transactional(readOnly = true)
    @Override
    public Person findByUsername(String username) {
        return personRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Person not found"));
    }
}
