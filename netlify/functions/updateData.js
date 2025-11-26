const { Octokit } = require("@octokit/rest");

exports.handler = async (event, context) => {
  // Ensure the body exists and is properly parsed
  let updatedData;
  try {
    updatedData = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: "Invalid JSON in request body." }),
    };
  }
  
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const requestPassword = event.headers["x-admin-password"];

    // 1. Password Check
    if (!requestPassword || requestPassword !== adminPassword) {
      return {
        statusCode: 403,
        body: JSON.stringify({ success: false, message: "Unauthorized: Invalid admin password" }),
      };
    }

    // 2. Setup GitHub Connection (Hardcoded values confirmed from previous files)
    const token = process.env.GITHUB_PAT;
    const owner = "gabrielleborces-dotcom";
    const repo = "shoebox-of-malasakit";

    if (!token) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: "Server Error: Missing GITHUB_PAT environment variable." }),
        };
    }
    
    const octokit = new Octokit({ auth: token });

    // 3. Get current SHA of data.json
    let fileData;
    try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path: "data.json",
        });
        fileData = data;
    } catch (getContentError) {
        // If file doesn't exist, fileData will be undefined, but we need to handle Octokit throwing 404
        if (getContentError.status !== 404) {
             throw getContentError;
        }
        // If 404, fileData remains undefined, which means sha will be null for createOrUpdateFileContents
    }


    // 4. Update or Create the File
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "data.json",
      message: "Update via Netlify admin panel",
      // Convert the JSON payload back to a base64 string
      content: Buffer.from(JSON.stringify(updatedData, null, 2)).toString("base64"),
      // If fileData exists, pass the SHA to ensure we don't overwrite concurrent changes
      sha: fileData ? fileData.sha : undefined,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Data updated successfully! Site redeployment triggered." }),
    };
  } catch (err) {
    console.error("GitHub/Server Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: `GitHub update failed: ${err.message}` }),
    };
  }
};
