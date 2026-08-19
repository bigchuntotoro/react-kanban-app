package com.example.kanban.service;

import com.example.kanban.dto.TaskDto;
import com.example.kanban.entity.TaskStatus;
import com.example.kanban.mapper.TaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskService {

    private final TaskMapper taskMapper;

    public List<TaskDto> getAllTasks() {
        return taskMapper.findAll();
    }

    @Transactional
    public TaskDto createTask(TaskDto taskDto) {
        taskMapper.insertTask(taskDto);
        return taskMapper.findById(taskDto.getId());
    }

    @Transactional
    public TaskDto updateTask(Long id, TaskDto taskDto) {
        taskDto.setId(id);
        taskMapper.updateTask(taskDto);
        return taskMapper.findById(id);
    }

    @Transactional
    public TaskDto updateStatus(Long id, TaskStatus status, Integer displayOrder) {
        taskMapper.updateTaskStatus(id, status, displayOrder);
        return taskMapper.findById(id);
    }

    @Transactional
    public void deleteTask(Long id) {
        taskMapper.deleteTask(id);
    }
}