import * as github from '@actions/github'

export interface Comment {
    id: number
    body?: string
    user: {
        login: string
    } | null
}

export interface FindCommentInputs {
    token: string
    repository: string
    issueNumber: number
    commentAuthor: string
    bodyIncludes: string
    direction: string
}

function findCommentPredicate(inputs: FindCommentInputs, comment: Comment): boolean {
    return (
        (inputs.commentAuthor && comment.user
            ? comment.user.login === inputs.commentAuthor
            : true) &&
        (inputs.bodyIncludes && comment.body
            ? comment.body.includes(inputs.bodyIncludes)
            : true)
    )
}

export async function findComment(inputs: FindCommentInputs): Promise<Comment | undefined> {
    const octokit = github.getOctokit(inputs.token);
    const [owner, repo] = inputs.repository.split('/');

    const parameters = {
        owner: owner,
        repo: repo,
        issue_number: inputs.issueNumber
    }

    if (inputs.direction == 'first') {
        for await (const { data: comments } of octokit.paginate.iterator(
            octokit.rest.issues.listComments,
            parameters
        )) {
            // Search each page for the comment
            const comment = comments.find(comment =>
                findCommentPredicate(inputs, comment)
            )
            if (comment) return comment
        }
    } else {
        // direction == 'last'
        const comments = await octokit.paginate(
            octokit.rest.issues.listComments,
            parameters
        )
        comments.reverse()
        const comment = comments.find(comment =>
            findCommentPredicate(inputs, comment)
        )
        if (comment) return comment
    }
    return undefined
}