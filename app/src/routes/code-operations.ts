import {getProjectGrpcClient} from "../grpc/project";
import {Router} from "express";
import * as fs from "fs";
import * as os from "os";
import {pushToExistingProjectOnGithub, PushToExistingProjectOnGithubRequest} from "../util/simple-git/existing-project";
import {getToken} from "../util/user-store";
import {cloneExistingProjectFromGithub, CloneExistingProjectFromGithubRequest} from "../util/simple-git/clone";
import {GenerateCodeRequest, GenerateCodeResponse, Project} from "./models";
import {requireUserNameMiddleware} from "../middlewares/auth";
import {getProjectResource, patchProjectResource} from "../store/project-client";
import {NAMESPACE, X_USER_NAME_HEADER} from "../util/constants";

const rimraf = require("rimraf");
const tar = require('tar')
const codeOperationsRouter = Router();
const projectGrpcClient = getProjectGrpcClient();

const getGenerateCodeResponse = (userName: string, projectId: string, message: string, error: string) => {
    let generateCodeResponse: GenerateCodeResponse = {
        userName: userName,
        projectId: projectId,
        message: message,
        error: error
    }
    return generateCodeResponse;
}

// generateCode (grpc calls to core)
codeOperationsRouter.post("/generate_code", requireUserNameMiddleware, async (request, resource) => {
    // TODO the below || op is not required, as the check is already done in middleware.
    const userName = request.header(X_USER_NAME_HEADER) || "";
    const generateCodeRequest: GenerateCodeRequest = request.body;
    const projectId = generateCodeRequest.projectId
    const cleanup = (downloadedProjectPath: string) => {
        // remove directory created, delete directory recursively
        rimraf(downloadedProjectPath, () => {
            console.debug(`${downloadedProjectPath} is cleaned up`);
        });
    }

    // retrieve project from k8s
    const projectResource = await getProjectResource(NAMESPACE, projectId);
    if (!projectResource.apiVersion) {
        let message = `unable to generate code`
        let error = `no project found for id : ${projectId}`
        return resource.status(500).json(getGenerateCodeResponse(userName, projectId, message, error));
    }
    // create directory hierarchy here itself as creating it after receiving data will not be proper.
    const originalProjectPath = `${os.tmpdir()}/${projectResource.spec.displayName}`
    const downloadedProjectPath = `${originalProjectPath}_downloaded`
    try {
        fs.mkdirSync(downloadedProjectPath, {recursive: true});
    } catch (err: any) {
        if (err.code !== 'EEXIST') {
            let message = `unable to generate code : ${projectResource.spec.displayName}`
            let error = `unable to generate code : ${projectResource.spec.displayName} directory with error : ${err}`
            return resource.status(500).json(getGenerateCodeResponse(userName, projectId, message, error));
        } else {
            // first clean up and then recreate (it might be a residue of previous run)
            cleanup(downloadedProjectPath)
            fs.mkdirSync(downloadedProjectPath, {recursive: true});
        }
    }
    const projectTarFilePath = `${downloadedProjectPath}/${projectResource.spec.displayName}_downloaded.tar.gz`;

    // save project metadata (in compage db or somewhere)
    // need to save project-name, compage-json version, github repo and latest commit to the db
    const payload: Project = {
        projectName: projectResource.spec.displayName,
        userName: projectResource.spec.user.name,
        json: projectResource.spec.json,
        repositoryName: projectResource.spec.repository.name,
        metadata: projectResource.spec.metadata
    }

    // call to grpc server to generate the project
    let call = projectGrpcClient.GenerateCode(payload);
    // receive the data(tar file) in chunks.
    call.on('data', async (response: { fileChunk: any }) => {
        // chunk is available, append it to the given path.
        if (response.fileChunk) {
            fs.appendFileSync(projectTarFilePath, response.fileChunk);
            console.debug(`writing tar file chunk to: ${projectTarFilePath}`);
        }
    });

    // error while receiving the file from core component
    call.on('error', async (response: any) => {
        let message = `unable to generate code : ${projectResource.spec.displayName}`
        let error = response.details
        return resource.status(500).json(getGenerateCodeResponse(userName, projectId, message, error));
    });

    // file has been transferred, lets save it to github.
    call.on('end', () => {
        // extract tar file
        const extract = tar.extract({
            strip: 1,
            C: downloadedProjectPath
        });
        // stream on extraction on tar file
        let fscrs = fs.createReadStream(projectTarFilePath)
        fscrs.on('error', function (err: any) {
            console.log(JSON.stringify(err))
        });
        fscrs.pipe(extract)

        extract.on('finish', async () => {
            let password = <string>await getToken(<string>projectResource.spec.user?.name);
            // clone existing repository
            const cloneExistingProjectFromGithubRequest: CloneExistingProjectFromGithubRequest = {
                clonedProjectPath: `${downloadedProjectPath}`,
                userName: <string>projectResource.spec.user.name,
                password: password,
                repository: projectResource.spec.repository
            }

            let error: string = await cloneExistingProjectFromGithub(cloneExistingProjectFromGithubRequest)
            if (error.length > 0) {
                // send status back to ui
                let message = `couldn't generate code: ${projectResource.spec.displayName} due to : ${error}.`
                // error = ""
                return resource.status(500).json(getGenerateCodeResponse(userName, projectId, message, error));
            }

            // save to GitHub
            const pushToExistingProjectOnGithubRequest: PushToExistingProjectOnGithubRequest = {
                generatedProjectPath: `${downloadedProjectPath}` + `${originalProjectPath}`,
                existingProject: cloneExistingProjectFromGithubRequest.clonedProjectPath + "/" + projectResource.spec.repository?.name,
                userName: projectResource.spec.user.name,
                email: projectResource.spec.user.email,
                password: password,
                repository: projectResource.spec.repository
            }

            error = await pushToExistingProjectOnGithub(pushToExistingProjectOnGithubRequest)
            if (error.length > 0) {
                // send status back to ui
                let message = `couldn't generate code: ${projectResource.spec.displayName} due to : ${error}.`
                return resource.status(500).json(getGenerateCodeResponse(userName, projectId, message, error));
            }

            console.log(`saved ${downloadedProjectPath} to github`)
            cleanup(downloadedProjectPath);

            // update status in k8s
            const metadata = JSON.parse(projectResource.spec.metadata);
            metadata.isGenerated = true;
            metadata.version = projectResource.spec.version;
            // add metadata back to projectResource.spec
            projectResource.spec.metadata = JSON.stringify(metadata)
            const patchedProjectResource = await patchProjectResource(NAMESPACE, projectId, JSON.stringify(projectResource.spec))
            if (patchedProjectResource.apiVersion) {
                // send status back to ui
                let message = `generated project: ${projectResource.spec.displayName} and saved in repository : ${projectResource.spec.repository?.name} successfully`
                return resource.status(200).json(getGenerateCodeResponse(userName, projectId, message, error));
            }
            // send error status back to ui
            let message = `generated project: ${projectResource.spec.displayName} and saved successfully in repository : ${projectResource.spec.repository?.name} but project couldn't get updated`
            error = `generated project: ${projectResource.spec.displayName} and saved successfully in repository : ${projectResource.spec.repository?.name} but project couldn't get updated`
            return resource.status(500).json(getGenerateCodeResponse(userName, projectId, message, error));
        });
    });
});

// updateProject (grpc calls to core)
codeOperationsRouter.post("/update_project", requireUserNameMiddleware, async (req, res) => {
    const {repositoryName, json, projectName, userName} = req.body;
    try {
        const payload = {
            "projectName": projectName,
            "userName": userName,
            "json": json,
            "repositoryName": repositoryName
        }
        projectGrpcClient.UpdateProject(payload, (err: any, response: { fileChunk: any; }) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json({fileChunk: response.fileChunk.toString()});
        });
    } catch (err) {
        return res.status(500).json(err);
    }
});

export default codeOperationsRouter;
