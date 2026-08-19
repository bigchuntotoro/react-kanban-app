package com.example.kanban.dto;

import com.example.kanban.entity.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TaskStatusUpdateRequest {

    private TaskStatus status;
    private Integer displayOrder;
}