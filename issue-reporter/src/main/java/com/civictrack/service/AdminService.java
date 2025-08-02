package com.civictrack.service;
import org.springframework.transaction.annotation.Transactional;

import com.civictrack.model.User;
import com.civictrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        user.setBanned(true);
        userRepository.save(user);
    }
}
