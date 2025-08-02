package com.civictrack.model;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Issue {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @ElementCollection
    @CollectionTable(name = "issue_photos", joinColumns = @JoinColumn(name = "issue_id"))
    @Column(name = "photo")
    private List<String> photos = new ArrayList<>(); // e.g., base64 or URLs

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssueCategory category;

    private double latitude;

    private double longitude;

    @Enumerated(EnumType.STRING)
    private IssueStatus status = IssueStatus.REPORTED;

    private boolean anonymous = false;

    private Long userId; // null if anonymous

    private int flagCount = 0;

    // Getters and setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getPhotos() { return photos; }
    public void setPhotos(List<String> photos) { this.photos = photos; }
    public IssueCategory getCategory() { return category; }
    public void setCategory(IssueCategory category) { this.category = category; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    public IssueStatus getStatus() { return status; }
    public void setStatus(IssueStatus status) { this.status = status; }
    public boolean isAnonymous() { return anonymous; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public int getFlagCount() { return flagCount; }
    public void setFlagCount(int flagCount) { this.flagCount = flagCount; }
}
