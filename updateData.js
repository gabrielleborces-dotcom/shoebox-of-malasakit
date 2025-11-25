const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const body = JSON.parse(event.body || '{}');
    const { repoOwner, repoName, adminPassword, data } = body;
    if (!process.env.GITHUB_PAT) return { statusCode: 500, body: 'Missing GITHUB_PAT' };
    if (!process.env.ADMIN_PASSWORD) return { statusCode: 500, body: 'Missing ADMIN_PASSWORD' };
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) return { statusCode: 403, body: 'Invalid admin password' };

    const token = process.env.GITHUB_PAT;

    // get current sha if exists
    const getRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/data.json`, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
    });

    let sha = null;
    if (getRes.status === 200) {
      const j = await getRes.json();
      sha = j.sha;
    }

    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    const putRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/data.json`, {
      method: 'PUT',
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
      body: JSON.stringify({ message: 'Update data.json via Netlify Function', content, sha })
    });

    if (!putRes.ok) {
      const t = await putRes.text();
      return { statusCode: 400, body: 'GitHub update failed: ' + t };
    }

    return { statusCode: 200, body: 'Update successful. Netlify will redeploy shortly.' };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
