import * as core from '@actions/core';
import * as github from '@actions/github';

export interface CreateOrUpdateCommentInputs {
    token: string,          //the repo PAT or GITHUB_TOKEN
    repository: string,
    commentId?: number,      //id of PR comment
    body: string,
    editMode: string        // 'append' or 'replace'
    issueNumber?: number    // pr number
}

export async function createOrUpdateComment(inputs: CreateOrUpdateCommentInputs): Promise<void> {
    const repository = inputs.repository
        ? inputs.repository
        : process.env.GITHUB_REPOSITORY;

    if (!repository) {
        throw new Error("Repository value is undefined or invalid: " + repository);
    }
    const repo: string[] = repository.split("/");
    console.log(`repository: ${repository}`);

    const editMode: string = inputs.editMode ? inputs.editMode : "append";
    console.log(`editMode: ${editMode}`);
    if (!["append", "replace"].includes(editMode)) {
        throw new Error(`Invalid edit-mode '${editMode}'.`);
    }

    const octokit = github.getOctokit(inputs.token)

    if (inputs.commentId) {
        // Edit a comment
        if (!inputs.body) {
            throw new Error("Missing comment 'body'");
        }

        if (inputs.body) {
            var commentBody = "";
            if (editMode == "append") {
                // Get the comment body
                const { data: comment } = await octokit.rest.issues.getComment({
                    owner: repo[0],
                    repo: repo[1],
                    comment_id: inputs.commentId,
                });
                commentBody = comment.body + "\n";
            }

            commentBody = commentBody + inputs.body;
            console.log(`Comment body: ${commentBody}`);
            await octokit.rest.issues.updateComment({
                owner: repo[0],
                repo: repo[1],
                comment_id: inputs.commentId,
                body: commentBody,
            });
            core.info(`Updated comment id '${inputs.commentId}'.`);
        }
    } else if (inputs.issueNumber) {
        // Create a comment
        if (!inputs.body) {
            throw new Error("Missing comment 'body'.");
        }
        const { data: comment } = await octokit.rest.issues.createComment({
            owner: repo[0],
            repo: repo[1],
            issue_number: inputs.issueNumber,
            body: inputs.body,
        });
        core.info(
            `Created comment id '${comment.id}' on issue '${inputs.issueNumber}'.`
        );
    } else {
        throw new Error("Missing either 'issueNumber' or 'commentId'.");
    }
}