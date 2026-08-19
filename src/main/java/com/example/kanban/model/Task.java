package com.example.kanban.model;

import lombok.Data;

@Data
public class Task {
    private Long id;
    private String title;
    private String status;
    private String priority;
    private String tag;
}