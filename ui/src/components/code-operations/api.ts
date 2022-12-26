import {GenerateCodeRequest} from "./model";
import {CodeOperationsBackendApi} from "../../service/backend-api";

// Sync apis (async apis are in thunk)
export const generateCode = (generateCodeRequest: GenerateCodeRequest) => {
    return CodeOperationsBackendApi().post('/generate_code', generateCodeRequest)
}