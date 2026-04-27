package com.sunny.jobboard.mapper;

import com.sunny.jobboard.dto.job.JobResponse;
import com.sunny.jobboard.entity.Job;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface JobMapper {

    // 🔖 MapStruct — @Mapping
    // Job entity has: postedBy (User object) with name field
    // JobResponse has: postedByName (String) and postedById (Long)
    // MapStruct can't figure this out automatically —
    // we tell it exactly which field maps to which

    @Mapping(source = "postedBy.name", target = "postedByName")
    @Mapping(source = "postedBy.id",   target = "postedById")
    JobResponse toResponse(Job job);
}