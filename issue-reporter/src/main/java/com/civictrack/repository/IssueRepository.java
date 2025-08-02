package com.civictrack.repository;

import com.civictrack.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IssueRepository extends JpaRepository<Issue, Long> {
    // Custom queries if needed
}
