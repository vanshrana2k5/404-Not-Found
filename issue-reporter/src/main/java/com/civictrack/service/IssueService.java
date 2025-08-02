package com.civictrack.service;

import com.civictrack.model.*;
import com.civictrack.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class IssueService {

    private static final int MAX_PHOTOS = 3;
    private static final int FLAG_THRESHOLD = 5;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Save a new issue after validating photos limit.
     */
    @Transactional
    public Issue reportIssue(Issue issue) {
        if (issue.getPhotos() != null && issue.getPhotos().size() > MAX_PHOTOS) {
            throw new IllegalArgumentException("Maximum "+MAX_PHOTOS +" photos allowed.");
        }

        Issue saved = issueRepository.save(issue);

        if (!issue.isAnonymous() && issue.getUserId() != null)
            notificationService.notifyUser(issue.getUserId(), "Your issue '" + issue.getTitle() + "' has been reported.");

        return saved;
    }

    /**
     * Get issues filtered by status, category, and distance from user.
     */
    public List<Issue> getFilteredIssues(IssueStatus status, IssueCategory category,
                                         Double lat, Double lon, Double radiusKm) {
        List<Issue> allIssues = issueRepository.findAll();

        return allIssues.stream()
                .filter(i -> (status == null || i.getStatus() == status))
                .filter(i -> (category == null || i.getCategory() == category))
                .filter(i -> lat == null || lon == null ||
                        distanceKm(lat, lon, i.getLatitude(), i.getLongitude()) <= radiusKm)
                .filter(i -> i.getStatus() != IssueStatus.HIDDEN)
                .collect(Collectors.toList());
    }

    /**
     * Update issue status and notify reporter.
     */
    @Transactional
    public Issue updateIssueStatus(Long issueId, IssueStatus newStatus) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new NoSuchElementException("Issue not found"));

        issue.setStatus(newStatus);
        issueRepository.save(issue);

        if (!issue.isAnonymous() && issue.getUserId() != null)
            notificationService.notifyUser(issue.getUserId(),
                    "Status of '" + issue.getTitle() + "' updated to " + newStatus);

        return issue;
    }

    /**
     * Flag issue as spam. Hide if flags reach threshold.
     */
    @Transactional
    public void flagIssue(Long issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new NoSuchElementException("Issue not found"));

        issue.setFlagCount(issue.getFlagCount() + 1);

        if (issue.getFlagCount() >= FLAG_THRESHOLD)
            issue.setStatus(IssueStatus.HIDDEN);

        issueRepository.save(issue);
    }

    // Calculate distance between two points (Haversine formula)
    private double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
}
