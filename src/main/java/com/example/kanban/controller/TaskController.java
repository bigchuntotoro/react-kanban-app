package com.example.kanban.controller;

import com.example.kanban.dto.TaskDto;
import com.example.kanban.entity.TaskStatus;
import com.example.kanban.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public List<TaskDto> getAllTasks() {
        return taskService.getAllTasks();
    }

    @PostMapping
    public TaskDto createTask(@RequestBody TaskDto taskDto) {
        return taskService.createTask(taskDto);
    }

    @PutMapping("/{id}")
    public TaskDto updateTask(@PathVariable Long id, @RequestBody TaskDto taskDto) {
        return taskService.updateTask(id, taskDto);
    }

    @PatchMapping("/{id}/status")
    public TaskDto updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        TaskStatus status = TaskStatus.valueOf((String) body.get("status"));
        Integer displayOrder = body.containsKey("displayOrder") ? (Integer) body.get("displayOrder") : null;
        return taskService.updateStatus(id, status, displayOrder);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }
}