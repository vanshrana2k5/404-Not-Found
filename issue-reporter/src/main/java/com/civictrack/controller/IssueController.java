package com.civictrack.controller;

import com.civictrack.model.Issue;
import com.civictrack.model.IssueCategory;
import com.civictrack.model.IssueStatus;
import com.civictrack.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    @Autowired
    private IssueService issueService;

    @PostMapping("/report")
    public Issue reportIssue(@RequestBody Issue issue) {
        return issueService.reportIssue(issue);
    }

    @GetMapping
    public List<Issue> getIssues(
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) IssueCategory category,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false, defaultValue = "5") Double radiusKm
    ) {
        return issueService.getFilteredIssues(status, category, lat, lon, radiusKm);
    }

    @PutMapping("/{id}/status")
    public Issue updateStatus(@PathVariable Long id, @RequestParam IssueStatus status) {
        return issueService.updateIssueStatus(id, status);
    }

    @PostMapping("/{id}/flag")
    public String flagIssue(@PathVariable Long id) {
        issueService.flagIssue(id);
        return "Issue flagged successfully.";
    }
}
