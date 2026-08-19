package com.example.kanban.mapper;

import com.example.kanban.dto.TaskDto;
import com.example.kanban.entity.TaskStatus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TaskMapper {

    List<TaskDto> findAll();

    TaskDto findById(Long id);

    void insertTask(TaskDto task);

    void updateTask(TaskDto task);

    void updateTaskStatus(@Param("id") Long id,
                          @Param("status") TaskStatus status,
                          @Param("displayOrder") Integer displayOrder);

    void deleteTask(Long id);
}