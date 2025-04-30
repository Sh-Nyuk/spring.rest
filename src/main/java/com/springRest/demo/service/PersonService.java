package com.springRest.demo.service;

import com.springRest.demo.model.Person;

import java.util.List;

public interface PersonService {
    public void addPerson(Person person, List<Long> rolesId);
    public void updatePerson(Person person, List<Long> rolesId);
    public void deletePerson(Long id);
    public List<Person> getAllPersons();
    public Person findById(Long id);
    public Person findByUsername(String username);
}
