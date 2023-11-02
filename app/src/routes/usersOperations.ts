import {requireEmailMiddleware} from '../middlewares/auth';
import {Request, Response, Router} from 'express';
import Logger from '../utils/logger';
import {
    getCreateUserError,
    getCreateUserResponse,
    getDeleteUserError,
    getGetUserError,
    getGetUserResponse,
    getListUsersError,
    getListUsersResponse,
    getUpdateUserError,
    getUserEntity,
    UserDTO,
    UserEntity
} from '../models/user';
import {UserService} from '../services/userService';

const usersOperationsRouter = Router();

const userService = new UserService();

// create user with details given in request
usersOperationsRouter.post('/', requireEmailMiddleware, async (request: Request, response: Response) => {
    const userDTO: UserDTO = request.body;
    try {
        const userEntity: UserEntity = await userService.getUser(userDTO.email);
        if (userEntity.email.length !== 0) {
            const errorMessage = `[${userDTO.email}] user already exists.`;
            Logger.error(errorMessage);
            return response.status(400).json(getCreateUserError(errorMessage));
        }
        userDTO.createdAt = new Date().toISOString();
        userDTO.updatedAt = new Date().toISOString();
        const savedUserEntity: UserEntity = await userService.createUser(getUserEntity(userDTO));
        if (savedUserEntity.email.length !== 0) {
            const successMessage = `[${userDTO.email}] user created.`;
            Logger.info(successMessage);
            return response.status(201).json(getCreateUserResponse(savedUserEntity));
        }
        const message = `${userDTO.email} user couldn't be created.`;
        Logger.error(message);
        return response.status(500).json(getCreateUserError(message));
    } catch (err: any) {
        const message = `${userDTO.email} user couldn't be created[${JSON.stringify(err)}].`;
        Logger.debug(err);
        Logger.error(message);
        return response.status(500).json(getCreateUserError(message));
    }
});

// list all users for given user
usersOperationsRouter.get('/', requireEmailMiddleware, async (_request: Request, response: Response) => {
    try {
        const userEntities = await userService.listUsers();
        return response.status(200).json(getListUsersResponse(userEntities));
    } catch (err: any) {
        const message = `users couldn't be listed[${err.message}].`;
        Logger.debug(err);
        Logger.error(message);
        return response.status(500).json(getListUsersError(message));
    }
});

// get user by email for given user
usersOperationsRouter.get('/:email', requireEmailMiddleware, async (request: Request, response: Response) => {
    const email = request.params.email;
    try {
        const userEntity: UserEntity = await userService.getUser(email as string);
        // check if there is id present in the object.
        if (userEntity.email.length !== 0) {
            return response.status(200).json(getGetUserResponse(userEntity));
        }
        return response.status(404).json();
    } catch (err: any) {
        const message = `user couldn't be retrieved[${err.message}].`;
        Logger.debug(err);
        Logger.error(message);
        return response.status(500).json(getGetUserError(message));
    }
});

// update user with details given in request
usersOperationsRouter.put('/:email', requireEmailMiddleware, async (request: Request, response: Response) => {
    const email = request.params.email;
    const userDTO: UserDTO = request.body;
    // check if the received payload has same id as the one in the path.
    if (email.length === 0 || (email !== userDTO.email)) {
        return response.status(400).json(getUpdateUserError('email in path and payload are not same'));
    }
    try {
        const userEntity: UserEntity = await userService.getUser(userDTO.email);
        if (userEntity.email.length === 0) {
            const errorMessage = `[${userDTO.email}] user doesn't exist.`;
            Logger.error(errorMessage);
            return response.status(400).json(getUpdateUserError(errorMessage));
        }
        userEntity.updated_at = new Date().toISOString();
        userEntity.first_name = userDTO.firstName;
        userEntity.last_name = userDTO.lastName;
        userEntity.role = userDTO.role;
        const isUpdated: boolean = await userService.updateUser(email, userEntity);
        if (isUpdated) {
            const successMessage = `[${userDTO.email}] user updated.`;
            Logger.info(successMessage);
            return response.status(204).json();
        }
        const message: string = `[${userDTO.email}] user couldn't be updated.`;
        Logger.error(message);
        return response.status(500).json(getUpdateUserError(message));
    } catch (err: any) {
        const message = `[${userDTO.email}] user couldn't be updated[${err.message}].`;
        Logger.debug(err);
        Logger.error(message);
        return response.status(500).json(getUpdateUserError(message));
    }
});

// delete user by id for given user
usersOperationsRouter.delete('/:email', requireEmailMiddleware, async (request: Request, response: Response) => {
    const email = request.params.email;
    try {
        const isDeleted = await userService.deleteUser(email);
        if (isDeleted) {
            const successMessage = `'${email}' user deleted successfully.`;
            Logger.info(successMessage);
            return response.status(204).json();
        }
        const errorMessage = `'${email}' user couldn't be deleted.`;
        Logger.error(errorMessage);
        return response.status(500).json(getDeleteUserError(errorMessage));
    } catch (err: any) {
        const message = `[${email}] user couldn't be deleted[${err.message}].`;
        Logger.debug(err);
        Logger.error(message);
        return response.status(500).json(getDeleteUserError(message));
    }
});

export default usersOperationsRouter;