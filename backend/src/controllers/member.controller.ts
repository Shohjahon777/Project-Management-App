import {asyncHandler} from "../middlewares/asyncHandler.middleware";
import { Request, Response } from "express";
import {z} from "zod";
import {joinWorkspaceByInviteService} from "../services/member.service";
import {HTTPSTATUS} from "../config/http.config";

export const joinWorkspaceController = asyncHandler(
    async (req: Request, res: Response) => {
        const inviteCode = z.string().parse(req.params.inviteCode);
        const userId = req.user?._id;

        const {workspaceId, role} = await joinWorkspaceByInviteService(
            inviteCode,
            userId
        );

        return res.status(HTTPSTATUS.OK).json({
            message: "User joined workspace successfully",
            workspaceId,
            role,
        })
    }
)