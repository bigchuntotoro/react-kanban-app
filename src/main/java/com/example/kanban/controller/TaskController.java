package com.example.kanban.controller;

import com.example.kanban.dto.TaskDto;
import com.example.kanban.entity.TaskStatus;
import com.example.kanban.service.TaskService;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    // 1. 전체 목록 조회
    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        List<TaskDto> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    // 2. 새 Task 생성 (201 Created)
    @PostMapping
    public ResponseEntity<TaskDto> createTask(@RequestBody TaskDto taskDto) {
        TaskDto createdTask = taskService.createTask(taskDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    // 3. Task 전체/상세 수정
    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @RequestBody TaskDto taskDto) {
        TaskDto updatedTask = taskService.updateTask(id, taskDto);
        return ResponseEntity.ok(updatedTask);
    }

    // 4. Task 상태 및 순서 변경 (드래그 앤 드롭)
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDto> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {

        TaskDto updatedTask = taskService.updateStatus(
                id,
                request.getStatus(),
                request.getDisplayOrder()
        );
        return ResponseEntity.ok(updatedTask);
    }

    // 5. Task 삭제 (204 No Content)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH 요청 바디 처리를 위한 전용 inner DTO
    @Getter
    @NoArgsConstructor
    public static class StatusUpdateRequest {
        private TaskStatus status;
        private Integer displayOrder;
    }
}