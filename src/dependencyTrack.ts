import * as core from '@actions/core';
import axios, { AxiosRequestConfig } from 'axios';
import { readFileSync } from 'fs';
import { stripTrailingSlash } from './util';

export interface DependencyTrackInputs {
    serverHostBaseUrl: string
    apiKey: string
    projectName: string
    projectVersion: string
    autoCreate: boolean
    bomFilePath: string
}

export interface ProjectInfo {
    name: string,
    version: string,
    uuid: string,
    lastBomImportFormat?: string,
    active?: boolean
}

export interface UploadBomResponseBody {
    token: string
}

interface BomAnalysisStatusBody {
    processing: boolean
}



// --------------------------------------------------------//
// Project Vulnerability Findings interface types start here
// --------------------------------------------------------//

export interface ProjectFinding {
    component: Component;
    vulnerability: Vulnerability;
    analysis: Analysis;
    attribution: Attribution;
    matrix: string;
}

export interface Component {
    uuid: string;
    name: string;
    group: string;
    version: string;
    purl: string;
    project: string;
}

export interface Vulnerability {
    uuid: string;
    source: string;
    vulnId: string;
    severity: string;
    severityRank: number;
    description: string;
    recommendation?: any;
    cweId?: number;
    cweName: string;
}

export interface Analysis {
    isSuppressed: boolean;
}

export interface Attribution {
    analyzerIdentity: string;
    attributedOn: any;
}

// --------------------------------------------------------//
// Project Vulnerability Findings interface types end here
// --------------------------------------------------------//



/**
 * Uploads bom to dependency track server for analysis
 * @param input : dependency track inputs
 * @returns : BOM analysis token
 */
export async function uploadBomFileToDepndencyTrack(input: DependencyTrackInputs): Promise<UploadBomResponseBody> {
    console.log(`Reading BOM: ${input.bomFilePath}...`);
    const bomContentsBuffer: Buffer = readFileSync(input.bomFilePath);
    let base64EncodedBomContents: string = Buffer.from(bomContentsBuffer).toString('base64');
    if (base64EncodedBomContents.startsWith('77u/')) {
        base64EncodedBomContents = base64EncodedBomContents.substring(4);
    }

    const bomApiPayload = {
        projectName: input.projectName,
        projectVersion: input.projectVersion,
        autoCreate: input.autoCreate,
        bom: base64EncodedBomContents
    }

    const bomApiPayloadJsonString = JSON.stringify(bomApiPayload);
    console.log(`BOM Api payload is data: ${bomApiPayloadJsonString}`);

    const requestConfig: AxiosRequestConfig = {
        method: 'PUT',
        headers: {
            'X-API-Key': input.apiKey,
            'Content-Type': 'application/json',
            'Content-Length': String(Buffer.byteLength(bomApiPayloadJsonString))
        },
        data: bomApiPayloadJsonString,
        url: stripTrailingSlash(input.serverHostBaseUrl) + '/api/v1/bom',
    }

    const response = await axios(requestConfig);

    if (response.status >= 200 && response.status < 300) {
        console.log('Finished uploading BOM to Dependency-Track server.')
        const responseBody: UploadBomResponseBody = response.data;
        return responseBody;
    } else {
        console.log('Failed uploading BOM to Dependency-Track server. Response status code: ' + response.status + ', status text: ' + response.statusText);
        console.log('Failed response data is ' + response.data);
        throw new Error('Failed to upload bom to dependency Track server');
    }
}

/**
 * Checks if server has finished analysed bom upload for a project & version.
 * @param input : dependency track inputs.
 * @param bomUploadToken : Token returned when uploading bom for a project & version
 * @returns : true: if bom analysis has completed. false: if bom analysis is still in progress
 */
export async function hasBOMAnalysisCompleted(input: DependencyTrackInputs, bomUploadToken: string): Promise<boolean> {

    const requestConfig: AxiosRequestConfig = {
        method: 'GET',
        headers: {
            'X-API-Key': input.apiKey
        },
        url: stripTrailingSlash(input.serverHostBaseUrl) + '/api/v1/bom/token/' + bomUploadToken,
    }

    const response = await axios(requestConfig);

    if (response.status >= 200 && response.status < 300) {
        console.log('Bom analysis status API call returned successfully for token: ' + bomUploadToken)
        const responseBody: BomAnalysisStatusBody = response.data;
        return !responseBody.processing;
    } else {
        console.log('Bom analysis status API call failed for token: ' + bomUploadToken + 'Response status code: ' + response.status + ', status text: ' + response.statusText);
        console.log('Failed response data is ' + response.data);
        throw new Error('Bom analysis status API call failed.');
    }

}

/**
 * Returns a list of all findings for a specific project and version
 * @param input : dependency track inputs.
 * @returns : Promise containing an Array of ProjectFindings
 */
export async function getProjectFindings(input: DependencyTrackInputs): Promise<ProjectFinding[]> {
    const projectInfo: ProjectInfo = await searchForProject(input);
    const requestConfig: AxiosRequestConfig = {
        method: 'GET',
        headers: {
            'X-API-Key': input.apiKey
        },
        url: stripTrailingSlash(input.serverHostBaseUrl) + '/api/v1/finding/project/' + projectInfo.uuid,
    }

    const response = await axios(requestConfig);

    if (response.status >= 200 && response.status < 300) {
        console.log('Returned project findings for project: ' + input.projectName + ' and version: ' + input.projectVersion);
        const responseBody: ProjectFinding[] = response.data;
        return responseBody;
    } else {
        console.log('Failed to return project findings for name: ' + input.projectName + ' and version: ' + input.projectVersion
            + '. Response status code: ' + response.status + ', status text: ' + response.statusText);
        console.log('Failed response data is: ' + response.data);
        throw new Error('Failed to return project findings for name: ' + input.projectName + ' and version: ' + input.projectVersion);
    }
}

/**
 * Searches for a project based on project name and version.
 * @param input : dependency track inputs.
 * @returns : The project info. If project not found, will throw an error.
 */
export async function searchForProject(input: DependencyTrackInputs): Promise<ProjectInfo> {
    const requestConfig: AxiosRequestConfig = {
        method: 'GET',
        headers: {
            'X-API-Key': input.apiKey
        },
        url: stripTrailingSlash(input.serverHostBaseUrl) + '/api/v1/project/lookup?name=' + input.projectName + '&version=' + input.projectVersion,
    }

    const response = await axios(requestConfig);

    if (response.status >= 200 && response.status < 300) {
        console.log('Found project for name: ' + input.projectName + ' and version: ' + input.projectVersion);
        const responseBody: ProjectInfo = response.data;
        return responseBody;
    } else {
        console.log('Failed to retrieve project for name: ' + input.projectName + ' and version: ' + input.projectVersion
            + '. Response status code: ' + response.status + ', status text: ' + response.statusText);
        console.log('Failed response data is: ' + response.data);
        throw new Error('Failed to retrieve project for name: ' + input.projectName + ' and version: ' + input.projectVersion);
    }
}