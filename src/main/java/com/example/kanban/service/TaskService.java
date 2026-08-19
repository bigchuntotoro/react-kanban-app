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

    /**
     * 전체 태스크 목록 조회
     */
    public List<TaskDto> getAllTasks() {
        return taskMapper.selectAllTasks();
    }

    /**
     * 단일 태스크 조회 (존재 검증 포함)
     */
    public TaskDto getTaskById(Long id) {
        TaskDto task = taskMapper.findById(id);
        if (task == null) {
            throw new IllegalArgumentException("해당 태스크가 존재하지 않습니다. ID: " + id);
        }
        return task;
    }

    /**
     * 태스크 생성
     */
    @Transactional
    public TaskDto createTask(TaskDto taskDto) {
        if (taskDto.getStatus() == null) {
            taskDto.setStatus(TaskStatus.TODO);
        }

        taskMapper.insertTask(taskDto); // MyBatis useGeneratedKeys 옵션으로 id 바인딩 필요
        return getTaskById(taskDto.getId());
    }

    /**
     * 태스크 정보 수정
     */
    @Transactional
    public TaskDto updateTask(Long id, TaskDto taskDto) {
        getTaskById(id); // 데이터 존재 확인
        taskDto.setId(id);
        taskMapper.updateTask(taskDto);
        return getTaskById(id);
    }

    /**
     * 태스크 상태 및 순서 변경
     */
    @Transactional
    public TaskDto updateStatus(Long id, TaskStatus status, Integer displayOrder) {
        getTaskById(id); // 데이터 존재 확인
        taskMapper.updateTaskStatus(id, status, displayOrder);
        return getTaskById(id);
    }

    /**
     * 태스크 상태 단독 변경 (오버로딩)
     */
    @Transactional
    public TaskDto updateStatus(Long id, TaskStatus status) {
        return updateStatus(id, status, null);
    }

    /**
     * 태스크 삭제
     */
    @Transactional
    public void deleteTask(Long id) {
        getTaskById(id); // 데이터 존재 확인
        taskMapper.deleteTask(id);
    }
}