package com.springRest.demo.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/user")
@PreAuthorize("hasRole('User') or hasRole('Admin')")
public class UserController {

    @GetMapping
    public String getPersonPage(Model model, HttpServletRequest request,
                                @ModelAttribute("error") String error,
                                @ModelAttribute("message") String message) {
        model.addAttribute("currentUri", request.getRequestURI());
        if (error != null && !error.isEmpty()) {
            model.addAttribute("error", error);
        }
        if (message != null && !message.isEmpty()) {
            model.addAttribute("message", message);
        }
        return "user-page";
    }
}
