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

    // 2. Setup GitHub Connection
    const token = process.env.GITHUB_PAT;
    const owner = "gabrielleborces-dotcom";
    const repo = "shoebox-of-malasakit";
    
    const octokit = new Octokit({ auth: token });

    // 3. Get current SHA of data.json
    let sha = undefined;
    try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path: "data.json",
        });
        sha = data.sha;
    } catch (getContentError) {
        if (getContentError.status !== 404) {
             throw getContentError;
        }
    }


    // 4. Update or Create the File
    const { data: commitData } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "data.json",
      message: "Update data.json via Netlify admin panel",
      content: Buffer.from(JSON.stringify(updatedData, null, 2)).toString("base64"),
      sha: sha, 
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Data updated successfully!", update: commitData }),
    };
  } catch (err) {
    console.error("GitHub/Server Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: `GitHub update failed: ${err.message}` }),
    };
  }
};
