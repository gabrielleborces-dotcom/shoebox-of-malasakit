const { Octokit } = require("@octokit/rest");

exports.handler = async (event, context) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const requestPassword = event.headers["x-admin-password"];

    if (!requestPassword || requestPassword !== adminPassword) {
      return {
        statusCode: 403,
        body: JSON.stringify({ success: false, message: "Unauthorized" }),
      };
    }

    const updatedData = JSON.parse(event.body);

    const token = process.env.GITHUB_PAT;
    const owner = "gabrielleborces-dotcom";
    const repo = "shoebox-of-malasakit";

    const octokit = new Octokit({ auth: token });

    const { data: fileData } = await octokit.repos.getContent({
      owner,
      repo,
      path: "data.json",
    });

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "data.json",
      message: "Update via Netlify admin panel",
      content: Buffer.from(JSON.stringify(updatedData, null, 2)).toString("base64"),
      sha: fileData.sha,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Data updated!" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: err.message }),
    };
  }
};
