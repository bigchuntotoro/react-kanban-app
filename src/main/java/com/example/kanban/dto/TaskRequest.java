package com.example.kanban.dto;

import com.example.kanban.entity.Task;
import com.example.kanban.entity.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {

    private String title;
    private String description;
    private String category;
    private TaskStatus status;

    // DTO를 Entity로 변환하는 메서드
    public Task toEntity() {
        return Task.builder()
                .title(this.title)
                .description(this.description)
                .category(this.category)
                .status(this.status != null ? this.status : TaskStatus.TODO)
                .build();
    }
}