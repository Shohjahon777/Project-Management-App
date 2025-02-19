import ProjectModel from "../models/project.model";
import {NotFoundException} from "../utils/appError";
import mongoose from "mongoose";
import {TaskStatusEnum} from "../enums/task.enum";
import TaskModel from "../models/task.model";

export const createProjectService = async(
    userId: string,
    workspaceId: string,
    body: {
        emoji?: string;
        name: string;
        description?: string;
    }
) => {
    const project = new ProjectModel({
        ...(body.emoji && {emoji: body.emoji}),
        name: body.name,
        description: body.description,
        workspace: workspaceId,
        createdBy: userId,
    })

    await project.save()

    return {project}
};


export const getProjectsInWorkspaceService = async (
    workspaceId: string,
    pageSize: number,
    pageNumber: number
)=> {
//     step 1: Find all projects in the workspace

    const totalCount = await ProjectModel.countDocuments({workspace: workspaceId})

    const skip = pageSize * (pageNumber - 1)

    const projects = await ProjectModel.find({workspace: workspaceId})
        .skip(skip)
        .limit(pageSize)
        .populate("createdBy", "name email profilePicture -password")
        .sort({createdAt: -1})

    const totalPages = Math.ceil(totalCount / pageSize)
    return {
        projects,
        totalPages,
        totalCount,
        skip
    }
}

export const getProjectByIdAndWorkspaceIdService = async (
    workspaceId: string,
    projectId: string
) => {
    const project = await ProjectModel.findOne({
        _id: projectId,
        workspace: workspaceId,
    }).select("_id emoji name description");


    if (!project) {
        throw new NotFoundException(
            "Project not found or does not belong to the specified workspace"
        );
    }

    return { project };
};


export const getProjectAnalyticsService = async (
    workspaceId: string,
    projectId: string
) => {
    const project = await ProjectModel.findById(projectId);


    console.log(project)
    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundException("Project not found or does not belong to this workspace")
    }

    const currentDate = new Date()

//     using mongoose aggregate
    const totalAnalytic = await ProjectModel.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId),
            },
        },
        {
            $facet: {
                totalTasks: [{$count: "count"}],
                overdueTasks: [
                    {
                        $match: {
                            dueDate: {
                                $lt: currentDate
                            },
                            status: {
                                $ne: TaskStatusEnum.DONE
                            },
                        },
                    },
                    {
                        $count: "count"
                    },
                ],
                completedTasks: [
                    {
                        $match: {
                            status: TaskStatusEnum.DONE,
                        },
                    },
                    {
                        $count: "count"
                    }
                ]
            }
        }
    ])

    const _analytics = totalAnalytic[0]

    const analytics = {
        totalTasks: _analytics.totalTasks[0]?.count || 0,
        overdueTasks: _analytics.overdueTasks[0]?.count || 0,
        completedTasks: _analytics.completedTasks[0]?.count || 0,
    }

    return {analytics}
}


export const updateProjectService = async (
    workspaceId: string,
    projectId: string,
    body: {
        emoji?: string;
        name: string;
        description?: string;
    }
)=> {
    const {name, emoji, description} = body

    const project = await ProjectModel.findOne({
        _id: projectId,
        workspace: workspaceId,
    })

    if (!project) {
        throw new NotFoundException("Project not found or does not belong to this workspace")
    }

    if (emoji) project.emoji = emoji
    if (name) project.name = name
    if (description) project.description = description

    await project.save()

    return {project}
}

export const deleteProjectService = async (
    workspaceId: string,
    projectId: string
) => {
    const project = await ProjectModel.findOne({
        _id: projectId,
        workspace: workspaceId,
    })

    if (!project) {
        throw new NotFoundException("Project not found or does not belong to this workspace")
    }

    await project.deleteOne()

    await TaskModel.deleteMany({project: project._id})

    return project
}