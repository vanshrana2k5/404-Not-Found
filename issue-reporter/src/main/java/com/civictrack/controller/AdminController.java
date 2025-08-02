package com.civictrack.controller;

import com.civictrack.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/ban/{userId}")
    public String banUser(@PathVariable Long userId) {
        adminService.banUser(userId);
        return "User banned successfully.";
    }
}
