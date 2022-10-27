import express, {Express, Request, Response} from 'express';
import bodyParser from "body-parser";
import path from "path";
import {config} from "./util/constants";
import axios from "axios";
import {btoa} from "buffer";
import {getProjectGrpcClient} from "./grpc/protobufs/project";

export class Server {
    private app: Express;
    private userTokens: Map<string, string>;
    private projectGrpcClient: any;

    constructor(app: Express) {
        this.app = app;
        this.userTokens = new Map();
        this.app.use(express.static(path.resolve("./") + "/build/ui"));
        this.projectGrpcClient = getProjectGrpcClient();

        this.app.get("/api", (req: Request, res: Response): void => {
            res.send("You have reached the API!");
        });

        //TODO remove this later, idea is to fetch the auth details from server
        // this.app.get("/auth_details", (req: Request, res: Response): void => {
        //     res.send({client_id: config.client_id, redirect_uri: config.redirect_uri});
        // });

        // Enabled Access-Control-Allow-Origin", "*" in the header to by-pass the CORS error.
        app.use((req: Request, res: Response, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            //Needed for PUT requests
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
            next();
        });

        app.post("/authenticate", async (req: Request, res: Response,) => {
            const {code} = req.body;
            // Request to exchange code for an access token
            axios({
                url: `https://github.com/login/oauth/access_token`, method: "POST", data: {
                    client_id: config.client_id,
                    client_secret: config.client_secret,
                    code: code,
                    redirect_uri: config.redirect_uri
                }
            }).then(response => {
                let params = new URLSearchParams(response.data);
                const access_token = params.get("access_token");
                console.log("access_token : ", access_token)
                // Request to return data of a user that has been authenticated
                return axios(`https://api.github.com/user`, {
                    headers: {
                        Authorization: `token ${access_token}`,
                    },
                }).then((response) => {
                    //save token to temporary_map
                    //TODO if server restarted, the map becomes empty and have to reauthorize the user
                    this.userTokens.set(response.data.login, access_token)
                    return res.status(200).json(response.data);
                }).catch((error) => {
                    return res.status(400).json(error);
                });
            }).catch((error) => {
                return res.status(500).json(error);
            });
        });
        app.post("/create_repo", async (req: Request, res: Response,) => {
            const {repoName, description, userName} = req.body;
            if (this.userTokens.get(userName) === undefined) {
                // TODO change message and may impl later
                return res.status(401).json("server restarted and lost the local cache of tokens")
            }
            axios({
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${this.userTokens.get(userName)}`,
                },
                url: `https://api.github.com/user/repos`, method: "POST", data: {
                    name: repoName,
                    description: description,
                    private: true,
                }
            }).then(response => {
                if (response.status !== 200) {
                    return res.status(response.status).json(response.statusText)
                }
                return res.status(200).json(response.data);
            }).catch((error) => {
                return res.status(500).json(error);
            });
        });
        app.get("/list_repos", async (req: Request, res: Response,) => {
            const {userName} = req.query;
            if (this.userTokens.get(<string>userName) === undefined) {
                // TODO change message and may impl later
                return res.status(401).json("server restarted and lost the localcache of tokens")
            }
            axios({
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${this.userTokens.get(<string>userName)}`,
                },
                url: `https://api.github.com/user/repos`,
                method: "GET"
            }).then(response => {
                if (response.status !== 200) {
                    return res.status(response.status).json(response.statusText)
                }
                return res.status(200).json(response.data);
            }).catch((error) => {
                return res.status(500).json(error);
            });
        });
        app.put("/commit_changes", async (req: Request, res: Response,) => {
            const {message, committer, content, repoName, sha} = req.body;
            if (this.userTokens.get(committer.userName) === undefined) {
                // TODO change message and may impl later
                return res.status(401).json("server restarted and lost the local cache of tokens")
            }
            axios({
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${this.userTokens.get(committer.userName)}`,
                },
                url: `https://api.github.com/repos/${committer.userName}/${repoName}/contents/.compage/config.json`,
                method: "PUT",
                data: {
                    message: message,
                    content: content,
                    committer: {
                        name: committer.userName,
                        email: committer.email
                    },
                    sha: sha
                }
            }).then((response) => {
                if (response.status !== 200) {
                    return res.status(response.status).json(response)
                }
                return res.status(200).json(response.data);
            }).catch((error) => {
                return res.status(400).json(error);
            });
        });
        app.get("/pull_changes", async (req: Request, res: Response,) => {
            const {userName, repoName} = req.query;
            if (this.userTokens.get(<string>userName) === undefined) {
                // TODO change message and may impl later
                return res.status(401).json("server restarted and lost the local cache of tokens")
            }
            axios({
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${this.userTokens.get(<string>userName)}`,
                },
                url: `https://api.github.com/repos/${userName}/${repoName}/contents/.compage/config.json`,
                method: "GET",
            }).then((response) => {
                if (response.status !== 200) {
                    return res.status(response.status).json(response.statusText)
                }
                return res.status(200).json(response.data);
            }).catch((error) => {
                return res.status(500).json(error);
            });
        });
        app.get("/logout", async (req: Request, res: Response,) => {
            const {userName} = req.query
            if (this.userTokens.get(<string>userName) === undefined) {
                // TODO change message and may impl later
                return res.status(401).json("server restarted and lost the local cache of tokens")
            }
            const bearerToken = `${this.getBasicAuthenticationPair()}`
            console.log("bearerToken : ", bearerToken)
            const accessToken = this.userTokens.get(<string>userName)
            console.log("accessToken : ", accessToken)
            console.log("config.client_id: ", config.client_id)
            axios({
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${bearerToken}`,
                },
                url: `https://api.github.com/applications/${config.client_id}/token`,
                method: "PATCH",
                data: {
                    access_token: accessToken
                }
            }).then((response) => {
                if (response.status !== 200) {
                    return res.status(response.status).json(response.statusText)
                }
                return res.status(200).json(response.data);
            }).catch((error) => {
                return res.status(500).json(error);
            });
        });
        app.get("/check_token", async (req: Request, res: Response,) => {
            const {userName} = req.query;
            if (this.userTokens.get(<string>userName) === undefined) {
                // TODO change message and may impl later
                return res.status(401).json("server restarted and lost the local cache of tokens")
            }
            axios({
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${this.getBasicAuthenticationPair()}`,
                },
                url: `https://api.github.com/applications/${config.client_id}/token`,
                method: "POST",
                data: {
                    access_token: this.userTokens.get(<string>userName)
                }
            }).then((response) => {
                if (response.status !== 200) {
                    return res.status(response.status).json(response.statusText)
                }
                return res.status(200).json(response.data);
            }).catch((error) => {
                return res.status(500).json(error);
            });
        });
        // generateProject (grpc calls to compage-core)
        app.post("/generate_project", async (req: Request, res: Response,) => {
            console.log("reached")
            const {repoName, yaml, projectName, userName} = req.body;
            if (this.userTokens.get(userName) === undefined) {
                // TODO change message and may impl later
                return res.status(401).json("server restarted and lost the local cache of tokens")
            }
            try {
                const payload = {
                    "name": projectName,
                    "user": userName,
                    "yaml": yaml,
                    "repository": repoName
                }
                this.projectGrpcClient.GenerateProject(payload, (err, response) => {
                    if (err) {
                        return res.status(500).json(err);
                    }
                    console.log(response)
                    return res.status(200).json(response.fileChunk);
                });
            } catch (err) {
                return res.status(500).json(err);
            }
        });

        this.app.get("*", (req: Request, res: Response): void => {
            res.sendFile(path.resolve("./") + "/build/ui/index.html");
        });
    }

    private getBasicAuthenticationPair(): string {
        return btoa(config.client_id + ":" + config.client_secret);
    }

    public start(port: number): void {
        this.app.listen(port, () => console.log(`Server listening on port ${port}!`));
    }
}

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.json({type: "text/*"}));
app.use(bodyParser.urlencoded({extended: false}));

const PORT = parseInt(process.env.SERVER_PORT) || 5000;
const server = new Server(app);
server.start(PORT);