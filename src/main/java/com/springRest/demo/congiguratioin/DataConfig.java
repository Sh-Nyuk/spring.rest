package com.springRest.demo.congiguratioin;

import com.springRest.demo.model.Person;
import com.springRest.demo.model.Role;

import com.springRest.demo.repository.PersonRepository;
import com.springRest.demo.repository.RoleRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;


import java.util.Set;



@Configuration
public class DataConfig {

    @Bean
    public ApplicationRunner init(PersonRepository personRepository
            , RoleRepository roleRepository
            , PasswordEncoder passwordEncoder) {
        return args -> initialize(personRepository, roleRepository, passwordEncoder);
    }

    private void initialize(PersonRepository personRepository
            , RoleRepository roleRepository
            , PasswordEncoder passwordEncoder){

        Role userRole = roleRepository
                .findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_USER")));

        Role adminRole = roleRepository
                .findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_ADMIN")));

        if (personRepository.findByUsername("admin").isEmpty()) {
            Person admin = new Person();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRoles(Set.of(adminRole, userRole));
            admin.setAge(0);
            admin.setEmail("admin@admin.com");
            personRepository.save(admin);
        }

        if (personRepository.findByUsername("user").isEmpty()) {
            Person user = new Person();
            user.setUsername("user");
            user.setPassword(passwordEncoder.encode("user"));
            user.setRoles(Set.of(userRole));
            user.setAge(10);
            user.setEmail("user@user.com");
            personRepository.save(user);
        }
    }
}
